/**
 * Procedural Web Audio API Harmonic Synthesizer.
 * Synthesizes zero-overhead acoustic feedback, manages 4-state lifecycle,
 * dynamics compression peak limiting, and single-instance victory alarm mutex.
 *
 * @module services/AudioChimeService
 */

/**
 * Procedural Web Audio API sound synthesizer with 4-state lifecycle, dynamic sample rate, and peak limiter.
 */
export class AudioChimeService {
  /** @type {AudioContext | Object | null} */
  #ctx = null;
  /** @type {DynamicsCompressorNode | Object | null} */
  #limiterNode = null;
  /** @type {'LOCKED' | 'WARMED' | 'RUNNING' | 'CLOSED'} */
  #state = 'LOCKED';
  /** @type {boolean} */
  #isPendingPlayback = false;
  /** @type {(() => void) | null} */
  #unbindGestureListeners = null;
  /** @type {(() => void) | null} */
  #unbindLifecycleListeners = null;
  /** @type {typeof AudioContext | null} */
  #AudioContextClass;
  /** @type {Navigator | Object | null} */
  #navigator;
  /** @type {Window | Object | null} */
  #window;
  /** @type {Document | Object | null} */
  #document;

  /**
   * Constructs the audio chime service with optional injected audio and environment abstractions.
   *
   * @param {Object} [deps={}] Optional injected dependencies for test isolation
   * @param {typeof AudioContext} [deps.AudioContextClass] AudioContext constructor
   * @param {Navigator | Object} [deps.navigator] Navigator instance with Web Locks support
   * @param {Window | Object} [deps.window] Window event target
   * @param {Document | Object} [deps.document] Document event target
   */
  constructor(deps = {}) {
    this.#window = deps.window || (typeof window !== 'undefined' ? window : null);
    this.#document = deps.document || (typeof document !== 'undefined' ? document : null);
    this.#navigator = deps.navigator || (typeof navigator !== 'undefined' ? navigator : null);
    this.#AudioContextClass = deps.AudioContextClass || (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);

    this.#registerGestureListeners();
    this.#registerLifecycleListeners();
  }

  /**
   * Registers passive gesture listeners for continuous autoplay priming on first user contact.
   */
  #registerGestureListeners() {
    if (!this.#window || typeof this.#window.addEventListener !== 'function') {
      return;
    }

    const events = ['pointerdown', 'touchstart', 'keydown'];
    const unlockHandler = async () => {
      await this.unlockAudioContext();
      if (this.#state === 'RUNNING' && this.#isPendingPlayback) {
        this.#isPendingPlayback = false;
        await this.playVictoryChime();
      }
    };

    events.forEach((evt) => {
      this.#window.addEventListener(evt, unlockHandler, { passive: true });
    });

    this.#unbindGestureListeners = () => {
      events.forEach((evt) => {
        try {
          this.#window.removeEventListener(evt, unlockHandler);
        } catch {}
      });
    };
  }

  /**
   * Registers document lifecycle observers to re-sync suspended audio contexts on wake.
   */
  #registerLifecycleListeners() {
    if (!this.#document || typeof this.#document.addEventListener !== 'function') {
      return;
    }

    const visibilityHandler = () => {
      if (this.#document.visibilityState === 'visible' && this.#ctx && this.#ctx.state === 'suspended') {
        this.#ctx.resume().catch(() => {});
      }
    };

    const pageshowHandler = () => {
      if (this.#ctx && this.#ctx.state === 'suspended') {
        this.#ctx.resume().catch(() => {});
      }
    };

    this.#document.addEventListener('visibilitychange', visibilityHandler);
    if (this.#window && typeof this.#window.addEventListener === 'function') {
      this.#window.addEventListener('pageshow', pageshowHandler);
    }

    this.#unbindLifecycleListeners = () => {
      try {
        this.#document.removeEventListener('visibilitychange', visibilityHandler);
        if (this.#window && typeof this.#window.removeEventListener === 'function') {
          this.#window.removeEventListener('pageshow', pageshowHandler);
        }
      } catch {}
    };
  }

  /**
   * Initializes and warms AudioContext with dynamic sample-rate silent buffer and peak limiter.
   *
   * @returns {Promise<boolean>} True if audio context was successfully unlocked and running
   */
  async unlockAudioContext() {
    if (this.#state === 'CLOSED') {
      return false;
    }

    try {
      if (!this.#ctx) {
        if (!this.#AudioContextClass) {
          return false;
        }
        this.#ctx = new this.#AudioContextClass();

        if (typeof this.#ctx.createDynamicsCompressor === 'function') {
          this.#limiterNode = this.#ctx.createDynamicsCompressor();
          const t = this.#ctx.currentTime || 0;
          if (this.#limiterNode.threshold && typeof this.#limiterNode.threshold.setValueAtTime === 'function') {
            this.#limiterNode.threshold.setValueAtTime(-3, t);
            this.#limiterNode.knee.setValueAtTime(30, t);
            this.#limiterNode.ratio.setValueAtTime(12, t);
            this.#limiterNode.attack.setValueAtTime(0.003, t);
            this.#limiterNode.release.setValueAtTime(0.25, t);
          }
          this.#limiterNode.connect(this.#ctx.destination);
        }
      }

      if (this.#ctx.state === 'suspended' || this.#ctx.state === 'interrupted') {
        await this.#ctx.resume();
      }

      if (typeof this.#ctx.createBuffer === 'function' && typeof this.#ctx.createBufferSource === 'function') {
        const sampleRate = this.#ctx.sampleRate || 44100;
        const buffer = this.#ctx.createBuffer(1, 1, sampleRate);
        const source = this.#ctx.createBufferSource();
        source.buffer = buffer;
        if (this.#limiterNode) {
          source.connect(this.#limiterNode);
        } else {
          source.connect(this.#ctx.destination);
        }
        if (typeof source.start === 'function') {
          source.start(0);
        }
      }

      this.#state = this.#ctx.state === 'running' ? 'RUNNING' : 'WARMED';
      return this.#state === 'RUNNING';
    } catch {
      this.#state = 'LOCKED';
      return false;
    }
  }

  /**
   * Synthesizes ascending pentatonic chime (C5, E5, G5) upon milestone checkbox completion.
   *
   * @returns {Promise<boolean>} Resolves true when audio notes are scheduled successfully
   */
  async playSuccessChime() {
    if (!this.#ctx || this.#ctx.state !== 'running') {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        return false;
      }
    }

    try {
      const ctx = this.#ctx;
      const frequencies = [523.25, 659.25, 783.99];
      const now = ctx.currentTime || 0;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const noteStart = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.70);

        osc.connect(gain);
        if (this.#limiterNode) {
          gain.connect(this.#limiterNode);
        } else {
          gain.connect(ctx.destination);
        }

        osc.start(noteStart);
        osc.stop(noteStart + 0.75);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Synthesizes celebratory major chord (C5, E5, G5, C6) through dynamics limiter.
   * Dispatches audio:autoplay-blocked event if autoplay permissions prevent playback.
   *
   * @returns {Promise<boolean>} Resolves true if sound played, false if audio blocked or unavailable
   */
  async playVictoryChime() {
    if (!this.#ctx || this.#ctx.state !== 'running') {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        this.#isPendingPlayback = true;
        if (this.#window && typeof this.#window.dispatchEvent === 'function') {
          try {
            this.#window.dispatchEvent(new CustomEvent('audio:autoplay-blocked'));
          } catch {}
        }
        return false;
      }
    }

    try {
      const ctx = this.#ctx;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      const now = ctx.currentTime || 0;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const noteStart = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.20);

        osc.connect(gain);
        if (this.#limiterNode) {
          gain.connect(this.#limiterNode);
        } else {
          gain.connect(ctx.destination);
        }

        osc.start(noteStart);
        osc.stop(noteStart + 1.25);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Arbitrates single-instance victory audio chime via W3C Web Locks API mutex.
   * Guarantees strictly one tab plays celebratory audio across concurrent multi-tab sessions.
   *
   * @returns {Promise<boolean>} True if lock was acquired and chime played; false if suppressed
   */
  async playVictoryChimeWithLock() {
    if (!this.#navigator || !('locks' in this.#navigator) || typeof this.#navigator.locks.request !== 'function') {
      return this.playVictoryChime();
    }

    try {
      return await this.#navigator.locks.request(
        'countdown_victory_alarm_lock',
        { ifAvailable: true },
        async (lock) => {
          if (!lock) {
            return false;
          }
          const played = await this.playVictoryChime();
          await new Promise((resolve) => setTimeout(resolve, 2500));
          return played;
        }
      );
    } catch {
      return this.playVictoryChime();
    }
  }

  /**
   * Returns instantaneous audio hardware state.
   *
   * @returns {'LOCKED' | 'WARMED' | 'RUNNING' | 'CLOSED'} Active audio state
   */
  getState() {
    return this.#state;
  }

  /**
   * Returns active DynamicsCompressorNode limiter instance for testing verification.
   *
   * @returns {DynamicsCompressorNode | Object | null}
   */
  getLimiterNode() {
    return this.#limiterNode;
  }

  /**
   * Releases hardware audio resources and unbinds all gesture and lifecycle listeners.
   */
  dispose() {
    this.#state = 'CLOSED';
    if (this.#unbindGestureListeners) {
      this.#unbindGestureListeners();
      this.#unbindGestureListeners = null;
    }
    if (this.#unbindLifecycleListeners) {
      this.#unbindLifecycleListeners();
      this.#unbindLifecycleListeners = null;
    }
    if (this.#ctx) {
      if (typeof this.#ctx.close === 'function') {
        this.#ctx.close().catch(() => {});
      }
      this.#ctx = null;
      this.#limiterNode = null;
    }
  }
}
