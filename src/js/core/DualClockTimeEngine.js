/**
 * Mathematical Drift-Compensated Dual Clock Time Engine.
 * Couples absolute UTC wall-clock epoch anchors with high-resolution frame scheduling,
 * eliminating cumulative timing drift across background tab throttling and OS sleep cycles.
 *
 * @module core/DualClockTimeEngine
 */

/**
 * @typedef {Object} TimeRemaining
 * @property {number} days Days remaining until deadline
 * @property {number} hours Hours remaining (0-23)
 * @property {number} minutes Minutes remaining (0-59)
 * @property {number} seconds Seconds remaining (0-59)
 * @property {number} totalMilliseconds Total remaining milliseconds
 */

/**
 * Drift-compensated countdown chronometer engine enforcing target-bound reset invariants
 * and pre-allocated memory pools to prevent garbage collection frame drops.
 */
export class DualClockTimeEngine {
  /**
   * Injected tick scheduling strategy port.
   *
   * @type {import('./ports.js').ITickScheduler}
   */
  #scheduler;

  /**
   * Injected host platform lifecycle port.
   *
   * @type {import('./ports.js').IPlatformLifecycle | null}
   */
  #lifecycle;

  /**
   * Active tick cancellation handle.
   *
   * @type {number | null}
   */
  #rafHandle = null;

  /**
   * Wall-clock epoch timestamp of the most recent tick evaluation.
   *
   * @type {number}
   */
  #lastWallEpoch = 0;

  /**
   * Whether the animation tick loop is actively executing.
   *
   * @type {boolean}
   */
  #isRunning = false;

  /**
   * Active target UTC deadline epoch in milliseconds.
   *
   * @type {number | null}
   */
  #activeTargetEpoch = null;

  /**
   * Frame tick notification callback.
   *
   * @type {((remaining: TimeRemaining) => void) | null}
   */
  #onTickCallback = null;

  /**
   * Deadline expiration notification callback.
   *
   * @type {(() => void) | null}
   */
  #onExpireCallback = null;

  /**
   * Whether target deadline has expired.
   *
   * @type {boolean}
   */
  #isExpired = false;

  /**
   * Platform lifecycle wake unbind callback.
   *
   * @type {(() => void) | null}
   */
  #unbindLifecycleWake = null;

  /**
   * Pre-allocated mutable TimeRemaining struct mitigating GC churn on 60Hz loops.
   *
   * @type {TimeRemaining}
   */
  #pooledRemaining = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMilliseconds: 0
  };

  /**
   * Initializes real-time drift-compensated chronometer with injected ports.
   *
   * @param {import('./ports.js').ITickScheduler} scheduler Tick scheduling strategy
   * @param {import('./ports.js').IPlatformLifecycle} [lifecycle=null] Host platform lifecycle port
   */
  constructor(scheduler, lifecycle = null) {
    this.#scheduler = scheduler;
    this.#lifecycle = lifecycle;

    if (this.#lifecycle && typeof this.#lifecycle.onWake === 'function') {
      this.#unbindLifecycleWake = this.#lifecycle.onWake(() => {
        this.reanchorClocks(Date.now(), typeof performance !== 'undefined' ? performance.now() : Date.now());
      });
    }
  }

  /**
   * Gets whether the chronometer loop is currently running.
   *
   * @returns {boolean} Running state
   */
  get isRunning() {
    return this.#isRunning;
  }

  /**
   * Gets whether the target deadline has expired.
   *
   * @returns {boolean} Expiration state
   */
  get isExpired() {
    return this.#isExpired;
  }

  /**
   * Initializes real-time animation ticker.
   *
   * @param {Date | string | number} deadline Target UTC deadline
   * @param {(remaining: TimeRemaining) => void} onTick Frame callback receiving TimeRemaining
   * @param {() => void} onExpire Callback invoked once when deadline lapses
   * @returns {void}
   */
  startTicker(deadline, onTick, onExpire) {
    this.stopTicker();

    const targetDate = deadline instanceof Date ? deadline : new Date(deadline);
    this.#activeTargetEpoch = targetDate.getTime();
    this.#onTickCallback = onTick;
    this.#onExpireCallback = onExpire;
    this.#isExpired = false;
    this.#isRunning = true;
    this.#lastWallEpoch = Date.now();

    const tick = () => {
      if (!this.#isRunning) {
        return;
      }

      const now = Date.now();
      this.#lastWallEpoch = now;
      const delta = Math.max(0, (this.#activeTargetEpoch || 0) - now);
      this.#updatePooledRemaining(delta);

      if (this.#onTickCallback) {
        try {
          this.#onTickCallback(this.#pooledRemaining);
        } catch (cbErr) {
          console.error('DualClockTimeEngine: onTick callback error', cbErr);
        }
      }

      if (delta <= 0) {
        this.#isExpired = true;
        this.stopTicker();
        if (this.#onExpireCallback) {
          try {
            this.#onExpireCallback();
          } catch (expErr) {
            console.error('DualClockTimeEngine: onExpire callback error', expErr);
          }
        }
        return;
      }

      if (this.#isRunning && this.#scheduler) {
        this.#rafHandle = this.#scheduler.requestTick(tick);
      }
    };

    tick();
  }

  /**
   * Dynamically updates target deadline enforcing the target-bound chronometer reset invariant.
   *
   * @param {Date | string | number} newDeadline New target deadline
   * @returns {void}
   */
  setDeadline(newDeadline) {
    const targetDate = newDeadline instanceof Date ? newDeadline : new Date(newDeadline);
    const newTargetEpoch = targetDate.getTime();

    if (this.#activeTargetEpoch !== newTargetEpoch) {
      const onTick = this.#onTickCallback;
      const onExpire = this.#onExpireCallback;

      this.stopTicker();
      this.#isExpired = false;
      this.#activeTargetEpoch = newTargetEpoch;
      this.#lastWallEpoch = Date.now();

      if (onTick && onExpire) {
        this.startTicker(targetDate, onTick, onExpire);
      }
    }
  }

  /**
   * Stops active requestAnimationFrame ticker loop.
   *
   * @returns {void}
   */
  stopTicker() {
    if (this.#rafHandle !== null && this.#scheduler) {
      this.#scheduler.cancelTick(this.#rafHandle);
      this.#rafHandle = null;
    }
    this.#isRunning = false;
  }

  /**
   * Resynchronizes chronometer clocks against absolute UTC epoch upon tab wake.
   *
   * @param {number} wallEpoch Current Date.now() timestamp
   * @param {number} monoTime Current performance.now() timestamp
   * @returns {void}
   */
  reanchorClocks(wallEpoch, monoTime) {
    this.#lastWallEpoch = wallEpoch;

    if (this.#isRunning && this.#activeTargetEpoch !== null) {
      const delta = Math.max(0, this.#activeTargetEpoch - wallEpoch);
      this.#updatePooledRemaining(delta);

      if (this.#onTickCallback) {
        try {
          this.#onTickCallback(this.#pooledRemaining);
        } catch (cbErr) {
          console.error('DualClockTimeEngine: reanchor onTick error', cbErr);
        }
      }

      if (delta <= 0) {
        this.#isExpired = true;
        this.stopTicker();
        if (this.#onExpireCallback) {
          try {
            this.#onExpireCallback();
          } catch (expErr) {
            console.error('DualClockTimeEngine: reanchor onExpire error', expErr);
          }
        }
      }
    }
  }

  /**
   * Calculates instantaneous TimeRemaining without advancing engine state.
   *
   * @param {Date | string | number} deadline Target deadline date
   * @param {Date | string | number} [referenceTime=new Date()] Reference time
   * @returns {TimeRemaining} Snapshot of remaining time
   */
  static calculateRemaining(deadline, referenceTime = new Date()) {
    const targetDate = deadline instanceof Date ? deadline : new Date(deadline);
    const refDate = referenceTime instanceof Date ? referenceTime : new Date(referenceTime);
    const delta = Math.max(0, targetDate.getTime() - refDate.getTime());

    const totalSeconds = Math.floor(delta / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const isExpired = delta <= 0;
    const progressPercent = isExpired ? 100 : 0;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalMilliseconds: delta,
      isExpired,
      progressPercent
    };
  }

  /**
   * Instance delegate for calculateRemaining.
   *
   * @param {Date | string | number} deadline Target deadline date
   * @param {Date | string | number} [referenceTime=new Date()] Reference time
   * @returns {TimeRemaining} Snapshot of remaining time
   */
  calculateRemaining(deadline, referenceTime = new Date()) {
    return DualClockTimeEngine.calculateRemaining(deadline, referenceTime);
  }

  /**
   * Releases listeners and halts active timers.
   *
   * @returns {void}
   */
  dispose() {
    this.stopTicker();
    if (this.#unbindLifecycleWake) {
      this.#unbindLifecycleWake();
      this.#unbindLifecycleWake = null;
    }
  }

  /**
   * Mutates pre-allocated TimeRemaining pool in-place to eliminate memory allocations.
   *
   * @param {number} delta Milliseconds remaining until deadline
   * @returns {void}
   */
  #updatePooledRemaining(delta) {
    const totalSeconds = Math.floor(delta / 1000);
    this.#pooledRemaining.days = Math.floor(totalSeconds / 86400);
    this.#pooledRemaining.hours = Math.floor((totalSeconds % 86400) / 3600);
    this.#pooledRemaining.minutes = Math.floor((totalSeconds % 3600) / 60);
    this.#pooledRemaining.seconds = totalSeconds % 60;
    this.#pooledRemaining.totalMilliseconds = delta;
  }
}
