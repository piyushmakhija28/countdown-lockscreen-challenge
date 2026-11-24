/**
 * Leaky Token Bucket History Rate Limiter with Dual-Tier Micro-Persistence.
 * Protects window.history.replaceState against WebKit 100-call quota exhaustion
 * and incorporates a 3-layer loop shield against hydration and popstate cascades.
 *
 * @module core/TokenBucketHistoryGuard
 */

/**
 * Token bucket rate limiter managing browser URL state updates with zero input lag
 * and synchronous sessionStorage micro-persistence.
 */
export class TokenBucketHistoryGuard {
  /**
   * Maximum burst token capacity.
   *
   * @type {number}
   */
  #capacity = 30;

  /**
   * Current available token balance.
   *
   * @type {number}
   */
  #tokens = 30;

  /**
   * Continuous token refill rate per second.
   *
   * @type {number}
   */
  #refillRatePerSec = 2;

  /**
   * Epoch timestamp in milliseconds of the last token balance refill.
   *
   * @type {number}
   */
  #lastRefillEpoch = Date.now();

  /**
   * Pending state hash awaiting throttled flush.
   *
   * @type {string | null}
   */
  #pendingHash = null;

  /**
   * Active trailing-edge timer handle.
   *
   * @type {ReturnType<typeof setTimeout> | null}
   */
  #debounceTimer = null;

  /**
   * Layer 1 Guard: Mutex flag blocking state serialization during state hydration.
   *
   * @type {boolean}
   */
  #isHydrating = false;

  /**
   * Layer 2 Guard: Fingerprint cache of last pushed hash preventing duplicate operations.
   *
   * @type {string}
   */
  #lastPushedHash = '';

  /**
   * Injected state storage port.
   *
   * @type {import('./ports.js').IStateStoragePort | null}
   */
  #storage = null;

  /**
   * Injected platform lifecycle port.
   *
   * @type {import('./ports.js').IPlatformLifecycle | null}
   */
  #lifecycle = null;

  /**
   * Cleanup callback for platform lifecycle event listener.
   *
   * @type {(() => void) | null}
   */
  #unbindLifecycle = null;

  /**
   * Cleanup callback for window visibilitychange/pagehide listeners.
   *
   * @type {(() => void) | null}
   */
  #unbindWindowEvents = null;

  /**
   * Constructs history guard with optional injected storage and lifecycle ports.
   *
   * @param {import('./ports.js').IStateStoragePort} [storage=null] Injected state storage port
   * @param {import('./ports.js').IPlatformLifecycle} [lifecycle=null] Injected platform lifecycle port
   * @param {number} [capacity=30] Maximum burst token capacity
   * @param {number} [refillRatePerSec=2] Continuous token refill rate per second
   */
  constructor(storage = null, lifecycle = null, capacity = 30, refillRatePerSec = 2) {
    this.#storage = storage;
    this.#lifecycle = lifecycle;
    this.#capacity = capacity;
    this.#tokens = capacity;
    this.#refillRatePerSec = refillRatePerSec;
    this.#lastRefillEpoch = Date.now();

    if (this.#lifecycle && typeof this.#lifecycle.onSleep === 'function') {
      this.#unbindLifecycle = this.#lifecycle.onSleep(() => this.forceFlush());
    } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const onVisibility = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          this.forceFlush();
        }
      };
      const onPageHide = () => this.forceFlush();

      window.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);

      this.#unbindWindowEvents = () => {
        window.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
      };
    }
  }

  /**
   * Gets current available token count after applying continuous refill.
   *
   * @returns {number} Available token count
   */
  get tokens() {
    this.#refillTokens();
    return this.#tokens;
  }

  /**
   * Sets hydration mutex state preventing serialization loops.
   *
   * @param {boolean} hydrating Whether store is currently hydrating external state
   * @returns {void}
   */
  setHydrating(hydrating) {
    this.#isHydrating = Boolean(hydrating);
  }

  /**
   * Enqueues state update with immediate micro-persistence and throttled replaceState.
   *
   * @param {string} hashPayload Serialized state hash string
   * @param {'USER' | 'POPSTATE'} [source='USER'] Action trigger source
   * @returns {void}
   */
  pushStateUpdate(hashPayload, source = 'USER') {
    if (this.#isHydrating || source === 'POPSTATE' || hashPayload === this.#lastPushedHash) {
      return;
    }

    this.#lastPushedHash = hashPayload;
    this.#pendingHash = hashPayload;

    if (this.#storage) {
      try {
        this.#storage.saveEphemeral('countdown_active_hash', hashPayload);
      } catch (storageErr) {
        console.error('TokenBucketHistoryGuard: Tier 1 storage write failed', storageErr);
      }
    } else if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('countdown_active_hash', hashPayload);
      } catch (sessionErr) {
        console.error('TokenBucketHistoryGuard: SessionStorage fallback write failed', sessionErr);
      }
    }

    this.#refillTokens();

    if (this.#tokens >= 1.0) {
      this.#tokens -= 1.0;
      this.#applyReplaceState(hashPayload);
      if (this.#debounceTimer !== null) {
        clearTimeout(this.#debounceTimer);
        this.#debounceTimer = null;
      }
    } else if (this.#debounceTimer === null) {
      this.#debounceTimer = setTimeout(() => this.forceFlush(), 350);
    }
  }

  /**
   * Flushes any pending state into history immediately.
   *
   * @returns {void}
   */
  forceFlush() {
    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = null;
    }
    if (this.#pendingHash !== null) {
      this.#applyReplaceState(this.#pendingHash);
    }
  }

  /**
   * Flushes pending state immediately (alias for forceFlush).
   *
   * @returns {void}
   */
  flush() {
    this.forceFlush();
  }

  /**
   * Returns fresh URL reflecting currently persisted state hash without history manipulation.
   *
   * @param {string} [baseUrl] Base URL string
   * @returns {string} Fully qualified URL string
   */
  getFreshUrl(baseUrl) {
    this.forceFlush();
    const targetBase = baseUrl || (typeof window !== 'undefined' && window.location ? window.location.href : 'https://localhost/');
    const url = new URL(targetBase);
    const activeHash = this.#lastPushedHash || this.#pendingHash || '';
    if (activeHash) {
      url.hash = activeHash.startsWith('#') ? activeHash : `#${activeHash}`;
    }
    return url.toString();
  }

  /**
   * Releases listeners and clears active timers.
   *
   * @returns {void}
   */
  dispose() {
    if (this.#debounceTimer !== null) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = null;
    }
    if (this.#unbindLifecycle) {
      this.#unbindLifecycle();
      this.#unbindLifecycle = null;
    }
    if (this.#unbindWindowEvents) {
      this.#unbindWindowEvents();
      this.#unbindWindowEvents = null;
    }
  }

  /**
   * Applies replaceState operation via injected port or window.history.
   *
   * @param {string} hash Hash payload to apply
   * @returns {void}
   */
  #applyReplaceState(hash) {
    try {
      if (this.#storage) {
        this.#storage.replaceNavigationState(hash);
      } else if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
        const formatted = hash.startsWith('#') ? hash : `#${hash}`;
        if (window.location.hash !== formatted) {
          window.history.replaceState(null, '', formatted);
        }
      }
      this.#pendingHash = null;
    } catch (replaceErr) {
      console.error('TokenBucketHistoryGuard: replaceState execution failed', replaceErr);
    }
  }

  /**
   * Computes elapsed time and refills token balance up to bucket capacity.
   *
   * @returns {void}
   */
  #refillTokens() {
    const now = Date.now();
    const elapsedSec = (now - this.#lastRefillEpoch) / 1000;
    this.#tokens = Math.min(this.#capacity, this.#tokens + elapsedSec * this.#refillRatePerSec);
    this.#lastRefillEpoch = now;
  }
}
