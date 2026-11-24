/**
 * System Invariant Constants for Countdown Lockscreen Application.
 * Centralizes canvas resolutions, safe-zone boundaries, memory limits, and timing thresholds.
 *
 * @module config/constants
 */

/**
 * Flagship smartphone canvas logical width in pixels (iPhone 15/16 Pro 6.1" reference).
 *
 * @type {number}
 */
export const FLAGSHIP_CANVAS_WIDTH = 1170;

/**
 * Flagship smartphone canvas logical height in pixels (iPhone 15/16 Pro 6.1" reference).
 *
 * @type {number}
 */
export const FLAGSHIP_CANVAS_HEIGHT = 2532;

/**
 * Flagship display aspect ratio (19.5 : 9).
 *
 * @type {number}
 */
export const FLAGSHIP_ASPECT_RATIO = FLAGSHIP_CANVAS_WIDTH / FLAGSHIP_CANVAS_HEIGHT;

/**
 * Upper clock and notification safe-zone exclusion boundary percentage (Top 28%).
 * Guarantees zero occlusion with iOS Dynamic Island, notch, or Android status bar.
 *
 * @type {number}
 */
export const TOP_SAFE_ZONE_PERCENT = 0.28;

/**
 * Lower gesture bar and emergency shortcut safe-zone exclusion boundary percentage (Bottom 18%).
 * Leaves content area ending at 82% of display height.
 *
 * @type {number}
 */
export const BOTTOM_SAFE_ZONE_PERCENT = 0.82;

/**
 * Bottom gesture safe clearance percentage.
 *
 * @type {number}
 */
export const BOTTOM_GESTURE_PERCENT = 0.18;

/**
 * Wide foldable / tablet top safe-zone exclusion boundary percentage (Top 14%).
 *
 * @type {number}
 */
export const TABLET_TOP_SAFE_PERCENT = 0.14;

/**
 * Wide foldable / tablet bottom safe-zone boundary percentage (Bottom 88%).
 *
 * @type {number}
 */
export const TABLET_BOTTOM_SAFE_PERCENT = 0.88;

/**
 * Ultra-tall smartphone top safe-zone boundary percentage (Top 22%).
 *
 * @type {number}
 */
export const ULTRA_TALL_TOP_SAFE_PERCENT = 0.22;

/**
 * Ultra-tall smartphone bottom safe-zone boundary percentage (Bottom 84%).
 *
 * @type {number}
 */
export const ULTRA_TALL_BOTTOM_SAFE_PERCENT = 0.84;

/**
 * Aspect ratio boundary for wide foldable dual-column split mode.
 *
 * @type {number}
 */
export const REGIME_FOLDABLE_MAX_RATIO = 1.70;

/**
 * Aspect ratio boundary for ultra-tall single-column mode.
 *
 * @type {number}
 */
export const REGIME_ULTRA_TALL_MIN_RATIO = 2.15;

/**
 * Maximum permitted canvas pixel area on iOS WebKit Safari (2^24 = 16,777,216 pixels).
 *
 * @type {number}
 */
export const WEBKIT_MAX_CANVAS_AREA = 16777216;

/**
 * Maximum hardware texture dimension ceiling on mobile GPUs.
 *
 * @type {number}
 */
export const MAX_TEXTURE_DIMENSION_MOBILE = 4096;

/**
 * Maximum hardware texture dimension ceiling on desktop/flagship GPUs.
 *
 * @type {number}
 */
export const MAX_TEXTURE_DIMENSION_DESKTOP = 8192;

/**
 * Minimum permitted future deadline offset from current epoch (1 hour in milliseconds).
 *
 * @type {number}
 */
export const MIN_FUTURE_DEADLINE_MS = 3600 * 1000;

/**
 * Maximum permitted future deadline span from current epoch (10 years in milliseconds).
 *
 * @type {number}
 */
export const MAX_FUTURE_SPAN_MS = 10 * 365.25 * 86400 * 1000;

/**
 * Google Gemini API free tier maximum requests per minute.
 *
 * @type {number}
 */
export const GEMINI_MAX_RPM = 15;

/**
 * Minimum inter-dispatch spacing in milliseconds between Gemini requests (2.0 seconds).
 *
 * @type {number}
 */
export const GEMINI_MIN_PACING_MS = 2000;

/**
 * Timeout in milliseconds before Gemini API requests abort and fall back (4.0 seconds).
 *
 * @type {number}
 */
export const GEMINI_TIMEOUT_MS = 4000;

/**
 * Maximum capacity of the navigation history token bucket.
 *
 * @type {number}
 */
export const HISTORY_RATE_LIMIT_BUCKET_SIZE = 30;

/**
 * Refill rate in tokens per second for navigation history token bucket.
 *
 * @type {number}
 */
export const HISTORY_RATE_LIMIT_REFILL_RATE = 2;

/**
 * Minimum spacing in milliseconds between browser history replaceState invocations.
 *
 * @type {number}
 */
export const HISTORY_RATE_LIMIT_WINDOW_MS = 300;

/**
 * Maximum permitted character length for URL state hash fragments.
 *
 * @type {number}
 */
export const URL_HASH_MAX_CHARS = 2048;

/**
 * Maximum permitted decompressed byte size for URL state payloads (32 KB).
 *
 * @type {number}
 */
export const DECOMPRESSION_MAX_BYTES = 32768;

/**
 * Primary LocalStorage key prefix for scoped application storage.
 *
 * @type {string}
 */
export const STORAGE_KEY_PREFIX = 'countdown_lockscreen_v1:';

/**
 * LocalStorage key for serialized core application state.
 *
 * @type {string}
 */
export const STORAGE_KEY_STATE = 'countdown_lockscreen_v1:state';

/**
 * SessionStorage key for navigation history rate guard state.
 *
 * @type {string}
 */
export const STORAGE_KEY_HISTORY = 'countdown_history_guard_v1';

/**
 * Storage key for Gemini rate limiter token persistence.
 *
 * @type {string}
 */
export const STORAGE_KEY_GEMINI_RATE = 'gemini_rate_guard_v1';

/**
 * BroadcastChannel identifier for multi-tab synchronization.
 *
 * @type {string}
 */
export const BROADCAST_CHANNEL_NAME = 'countdown_lockscreen_sync';

/**
 * Web Locks API mutex lock name for single-instance victory alarm audio playback.
 *
 * @type {string}
 */
export const VICTORY_ALARM_MUTEX_NAME = 'countdown_victory_alarm_lock';

/**
 * Maximum acquisition timeout ceiling in milliseconds for victory alarm lock.
 *
 * @type {number}
 */
export const VICTORY_LOCK_TIMEOUT_MS = 500;

/**
 * Immutable bundle of all system constants.
 *
 * @type {Readonly<Record<string, unknown>>}
 */
export const SYSTEM_CONSTANTS = Object.freeze({
  FLAGSHIP_CANVAS_WIDTH,
  FLAGSHIP_CANVAS_HEIGHT,
  FLAGSHIP_ASPECT_RATIO,
  TOP_SAFE_ZONE_PERCENT,
  BOTTOM_SAFE_ZONE_PERCENT,
  BOTTOM_GESTURE_PERCENT,
  TABLET_TOP_SAFE_PERCENT,
  TABLET_BOTTOM_SAFE_PERCENT,
  ULTRA_TALL_TOP_SAFE_PERCENT,
  ULTRA_TALL_BOTTOM_SAFE_PERCENT,
  REGIME_FOLDABLE_MAX_RATIO,
  REGIME_ULTRA_TALL_MIN_RATIO,
  WEBKIT_MAX_CANVAS_AREA,
  MAX_TEXTURE_DIMENSION_MOBILE,
  MAX_TEXTURE_DIMENSION_DESKTOP,
  MIN_FUTURE_DEADLINE_MS,
  MAX_FUTURE_SPAN_MS,
  GEMINI_MAX_RPM,
  GEMINI_MIN_PACING_MS,
  GEMINI_TIMEOUT_MS,
  HISTORY_RATE_LIMIT_BUCKET_SIZE,
  HISTORY_RATE_LIMIT_REFILL_RATE,
  HISTORY_RATE_LIMIT_WINDOW_MS,
  URL_HASH_MAX_CHARS,
  DECOMPRESSION_MAX_BYTES,
  STORAGE_KEY_PREFIX,
  STORAGE_KEY_STATE,
  STORAGE_KEY_HISTORY,
  STORAGE_KEY_GEMINI_RATE,
  BROADCAST_CHANNEL_NAME,
  VICTORY_ALARM_MUTEX_NAME,
  VICTORY_LOCK_TIMEOUT_MS
});
