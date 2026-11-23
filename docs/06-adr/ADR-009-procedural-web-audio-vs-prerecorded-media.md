# ADR-009: Procedural Web Audio API Synthesis with Resilient Autoplay-Priming

**Document ID:** `ADR-009`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** ACCEPTED  
**Date:** 2026-11-23  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0

---

## 1. Context & Problem Statement
When a countdown reaches zero ($\Delta t \le 0\text{ms}$), providing sensory audio feedback (a harmonious victory chime) significantly reinforces psychological achievement and dopamine closure.

However, playing audio in web applications on mobile devices introduces severe challenges:
1. **Network Overhead & Asset Bloat:** Pre-recorded `.mp3` files add $40\text{--}150\text{ KB}$ to initial load size and fail completely when offline.
2. **Mobile Autoplay Policy Rejection:** Modern browsers (iOS Safari and Android Chrome) strictly block `AudioContext` from starting or resuming without an active user gesture (touch/click). If a user loads a countdown link with 10 seconds remaining and watches passively, an unprimed `ctx.resume()` will throw `NotAllowedError: AudioContext was not allowed to start`, causing an unhandled promise rejection that breaks the celebration sequence.
3. **Audio Session Invalidation on iOS:** When the phone locks or receives a call, the `AudioContext` transitions to `'interrupted'` state, requiring re-priming.
4. **Resampling Overhead & Speaker Clipping:** Fixed sample-rate buffers trigger software resamplers on mismatched outputs (44.1kHz vs 48kHz Bluetooth), and stacked polyphonic chords cause digital clipping.

---

## 2. Decision Drivers
- **Zero Asset Overhead ($0\text{ KB}$):** No additional media files in git repository or deployment bundles.
- **100% Offline Resilience:** Synthesizes sound mathematically via Web Audio oscillators without network calls.
- **Autoplay Policy Resilience:** Handles unprompted countdown expiration gracefully with gesture priming and soft fallback.
- **Peak Limiting & Hardware Sample-Rate Match:** Dynamically matches `ctx.sampleRate` and limits peaks via `DynamicsCompressorNode`.
- **Zero Main Thread Jitter:** Sound scheduling executes asynchronously in the browser audio thread.

---

## 3. Decision & 4-State Audio Lifecycle
We chose **Procedural Web Audio API Synthesis with Gesture-Gated Priming, Dynamic Sample Rate, Peak Limiter, and Soft Degradation**.

```
+---------------------------------------------------------------------------------------------------+
|                                      4-STATE AUDIO LIFECYCLE                                      |
+-------------------+----------------------------+--------------------------------------------------+
| State             | Trigger                    | System Behavior                                  |
+-------------------+----------------------------+--------------------------------------------------+
| 1. `LOCKED`       | Initial application boot   | Context uninitialized or suspended.              |
| 2. `UNLOCKED`     | First user tap/touch/click | Primes hardware with native sample-rate buffer.  |
| 3. `INTERRUPTED`  | Phone call / lock screen   | Hardware output suspended by OS audio manager.   |
| 4. `DEGRADED`     | Expiration while `LOCKED`  | Suppresses chime; triggers haptics & badge.      |
+-------------------+----------------------------+--------------------------------------------------+
```

---

## 4. Architectural Implementation Blueprint (`AudioService.js`)

```javascript
/**
 * Procedural harmonic victory chime synthesizer with autoplay priming and dynamics compression.
 */
export class AudioService {
  #ctx = null;
  #limiterNode = null;
  #isUnlocked = false;
  #isPendingPlayback = false;

  constructor() {
    this.#registerGestureListeners();
  }

  #registerGestureListeners() {
    const events = ['pointerdown', 'touchstart', 'keydown'];
    const unlockHandler = async () => {
      await this.unlockAudioContext();
      if (this.#isUnlocked) {
        events.forEach((evt) => window.removeEventListener(evt, unlockHandler));
        if (this.#isPendingPlayback) {
          this.#isPendingPlayback = false;
          await this.playVictoryChime();
        }
      }
    };
    events.forEach((evt) =>
      window.addEventListener(evt, unlockHandler, { passive: true })
    );
  }

  /**
   * Unlocks and primes AudioContext with dynamic sample-rate silent buffer.
   *
   * @returns {Promise<boolean>}
   */
  async unlockAudioContext() {
    try {
      if (!this.#ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.#ctx = new AudioCtx();

        // Dynamics Compressor Peak Limiter to prevent speaker clipping
        this.#limiterNode = this.#ctx.createDynamicsCompressor();
        this.#limiterNode.threshold.setValueAtTime(-3, this.#ctx.currentTime);
        this.#limiterNode.knee.setValueAtTime(30, this.#ctx.currentTime);
        this.#limiterNode.ratio.setValueAtTime(12, this.#ctx.currentTime);
        this.#limiterNode.attack.setValueAtTime(0.003, this.#ctx.currentTime);
        this.#limiterNode.release.setValueAtTime(0.25, this.#ctx.currentTime);
        this.#limiterNode.connect(this.#ctx.destination);
      }

      if (this.#ctx.state === 'suspended' || this.#ctx.state === 'interrupted') {
        await this.#ctx.resume();
      }

      // Play 1-sample silent buffer matching native hardware sampleRate
      const buffer = this.#ctx.createBuffer(1, 1, this.#ctx.sampleRate);
      const source = this.#ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.#limiterNode);
      source.start(0);

      this.#isUnlocked = this.#ctx.state === 'running';
      return this.#isUnlocked;
    } catch {
      this.#isUnlocked = false;
      return false;
    }
  }

  /**
   * Synthesizes celebratory major chord (C5, E5, G5, C6) through the peak limiter.
   *
   * @returns {Promise<boolean>}
   */
  async playVictoryChime() {
    if (!this.#ctx || this.#ctx.state !== 'running') {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        this.#isPendingPlayback = true;
        window.dispatchEvent(new CustomEvent('audio:autoplay-blocked'));
        return false;
      }
    }

    try {
      const ctx = this.#ctx;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Exponential volume decay envelope
        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.20);

        osc.connect(gain);
        gain.connect(this.#limiterNode); // Route to compressor limiter

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);

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
   * Closes audio context and cleans up audio hardware nodes.
   */
  dispose() {
    if (this.#ctx) {
      this.#ctx.close().catch(() => {});
      this.#ctx = null;
      this.#limiterNode = null;
    }
  }
}
```

---

## 5. Consequences & Soft Degradation
- If a countdown expires without preceding user interactions, audio playback fails silently without unhandled promise rejections.
- The UI listens to `audio:autoplay-blocked` and renders a celebratory glassmorphic toast with a "Tap to Play Victory Sound" action, guaranteeing full accessibility and zero browser console errors.
