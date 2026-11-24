/**
 * Token Bucket Rate Limiter for Google Gemini API Free Tier Quota.
 * Enforces 15 RPM free tier ceiling with 2.0s inter-dispatch pacing.
 * Persists token balance and call timestamps across browser tabs.
 *
 * @module ai/GeminiRateLimiter
 */

import { AiServiceError } from '../core/errors.js';

/**
 * Token bucket rate limiter governing Gemini 3.8 Flash Free Tier quota.
 */
export class GeminiRateLimiter {
  /** @type {number} */
  #capacity = 15;
  /** @type {number} */
  #tokens = 15;
  /** @type {number} */
  #refillIntervalMs = 4000;
  /** @type {number} */
  #minPacingIntervalMs = 2000;
  /** @type {number} */
  #lastCallEpoch = 0;
  /** @type {number} */
  #lastRefill = Date.now();
  /** @type {string} */
  #storageKey = 'gemini_rate_guard_v1';
  /** @type {Storage | null} */
  #storage = null;

  /**
   * @param {number} [capacity=15] Maximum RPM token burst capacity
   * @param {number} [minPacingIntervalMs=2000] Minimum inter-dispatch spacing in milliseconds
   * @param {number} [refillIntervalMs=4000] Interval per token refill in milliseconds (4000ms = 15 RPM)
   * @param {string} [storageKey='gemini_rate_guard_v1'] Storage key for persistent state
   * @param {Storage | null} [storage=null] Custom storage adapter or null for default environment probe
   */
  constructor(
    capacity = 15,
    minPacingIntervalMs = 2000,
    refillIntervalMs = 4000,
    storageKey = 'gemini_rate_guard_v1',
    storage = null
  ) {
    this.#capacity = capacity;
    this.#tokens = capacity;
    this.#minPacingIntervalMs = minPacingIntervalMs;
    this.#refillIntervalMs = refillIntervalMs;
    this.#storageKey = storageKey;
    this.#storage = storage || this.#resolveStorage();
    this.#loadState();
  }

  /**
   * Resolves available storage backend with safety fallback.
   *
   * @returns {Storage | null}
   */
  #resolveStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Loads persisted token state and last call epoch from storage.
   */
  #loadState() {
    if (!this.#storage) return;

    try {
      const raw = this.#storage.getItem(this.#storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (typeof parsed.tokens === 'number') {
        this.#tokens = Math.min(this.#capacity, Math.max(0, parsed.tokens));
      }
      if (typeof parsed.lastRefill === 'number') {
        this.#lastRefill = parsed.lastRefill;
      }
      if (typeof parsed.lastCallEpoch === 'number') {
        this.#lastCallEpoch = parsed.lastCallEpoch;
      }
      this.#refill();
    } catch {
      this.#tokens = this.#capacity;
      this.#lastRefill = Date.now();
      this.#lastCallEpoch = 0;
    }
  }

  /**
   * Persists current token state and last call epoch to storage.
   */
  #saveState() {
    if (!this.#storage) return;

    try {
      this.#storage.setItem(
        this.#storageKey,
        JSON.stringify({
          tokens: this.#tokens,
          lastRefill: this.#lastRefill,
          lastCallEpoch: this.#lastCallEpoch
        })
      );
    } catch {
      // In-memory fallback
    }
  }

  /**
   * Refills token bucket based on elapsed time since last refill.
   */
  #refill() {
    const now = Date.now();
    const elapsed = now - this.#lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.#refillIntervalMs);

    if (tokensToAdd > 0) {
      this.#tokens = Math.min(this.#capacity, this.#tokens + tokensToAdd);
      this.#lastRefill = now;
    }
  }

  /**
   * Attempts to acquire execution token before dispatching a Gemini API call.
   *
   * @returns {boolean} True if call is permitted; false if rate-limited
   */
  acquire() {
    this.#refill();
    const now = Date.now();

    if (this.#tokens < 1 || (now - this.#lastCallEpoch) < this.#minPacingIntervalMs) {
      return false;
    }

    this.#tokens -= 1;
    this.#lastCallEpoch = now;
    this.#saveState();
    return true;
  }

  /**
   * Attempts to acquire execution token, throwing AiServiceError if rate limit or pacing threshold exceeded.
   *
   * @returns {boolean} True if token acquired
   * @throws {AiServiceError} If 15 RPM exhausted or request occurs < 2.0s since last dispatch
   */
  acquireToken() {
    if (!this.acquire()) {
      const status = this.getQuotaStatus();
      throw new AiServiceError(
        `Gemini API rate limit exceeded (tokens remaining: ${status.tokens}, wait required: ${status.waitMs}ms)`,
        'ERR_AI_RATE_LIMIT',
        429,
        true
      );
    }
    return true;
  }

  /**
   * Returns current token balance and milliseconds until next permitted dispatch.
   *
   * @returns {{ tokens: number, waitMs: number, isPermitted: boolean }} Quota status
   */
  getQuotaStatus() {
    this.#refill();
    const now = Date.now();

    const pacingWait = Math.max(0, this.#minPacingIntervalMs - (now - this.#lastCallEpoch));
    const refillWait = this.#tokens >= 1 ? 0 : Math.max(0, this.#refillIntervalMs - (now - this.#lastRefill));
    const waitMs = Math.max(pacingWait, refillWait);

    return {
      tokens: this.#tokens,
      waitMs,
      isPermitted: this.#tokens >= 1 && pacingWait === 0
    };
  }

  /**
   * Resets rate limiter to full capacity and clears call timestamps.
   */
  reset() {
    this.#tokens = this.#capacity;
    this.#lastRefill = Date.now();
    this.#lastCallEpoch = 0;
    this.#saveState();
  }
}
