/**
 * Tactile Haptic Vibration Controller.
 * Provides calibrated physical impulse patterns for milestone completion,
 * victory fanfare, and interactive micro-toggles with silent fallback.
 *
 * @module services/HapticService
 */

/**
 * Mobile vibration haptic feedback controller with feature detection and silent fallback.
 */
export class HapticService {
  /** @type {Navigator | Object | null} */
  #navigator;
  /** @type {boolean} */
  #isSupported;

  /**
   * Constructs the haptic service with optional injected navigator abstraction.
   *
   * @param {Navigator | Object} [customNavigator] Optional navigator object for testing
   */
  constructor(customNavigator) {
    this.#navigator = customNavigator || (typeof navigator !== 'undefined' ? navigator : null);
    this.#isSupported = Boolean(this.#navigator && typeof this.#navigator.vibrate === 'function');
  }

  /**
   * Returns whether hardware vibration API is supported on the active device.
   *
   * @returns {boolean} True if navigator.vibrate is available
   */
  isSupported() {
    return this.#isSupported;
  }

  /**
   * Triggers a single light tactile pulse (15ms) for interactive UI toggles.
   *
   * @returns {boolean} True if vibration was dispatched
   */
  lightTap() {
    if (!this.#isSupported) {
      return false;
    }
    try {
      return Boolean(this.#navigator.vibrate(15));
    } catch {
      return false;
    }
  }

  /**
   * Triggers calibrated milestone completion tactile pattern ([15, 30, 20]ms).
   *
   * @returns {boolean} True if vibration was dispatched
   */
  milestonePattern() {
    if (!this.#isSupported) {
      return false;
    }
    try {
      return Boolean(this.#navigator.vibrate([15, 30, 20]));
    } catch {
      return false;
    }
  }

  /**
   * Triggers celebratory victory fanfare vibration wave ([100, 50, 100, 50, 250]ms).
   *
   * @returns {boolean} True if vibration was dispatched
   */
  victoryPattern() {
    if (!this.#isSupported) {
      return false;
    }
    try {
      return Boolean(this.#navigator.vibrate([100, 50, 100, 50, 250]));
    } catch {
      return false;
    }
  }

  /**
   * Immediately terminates any active device vibration pattern.
   *
   * @returns {boolean} True if vibration cancellation was dispatched
   */
  cancel() {
    if (!this.#isSupported) {
      return false;
    }
    try {
      return Boolean(this.#navigator.vibrate(0));
    } catch {
      return false;
    }
  }
}
