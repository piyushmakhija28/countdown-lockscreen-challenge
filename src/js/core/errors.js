/**
 * Domain Exception Hierarchy for Countdown Lockscreen Engine.
 * Comprehensive 21-class taxonomy rooted at AppError with machine-readable error codes.
 *
 * @module core/errors
 */

/**
 * Root domain exception carrying machine-readable error code and severity taxonomy.
 */
export class AppError extends Error {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_INTERNAL'] Machine-readable error code
   * @param {'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'LOW'} [severity='ERROR'] Severity level
   */
  constructor(message, code = 'ERR_INTERNAL', severity = 'ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.timestamp = new Date();
  }
}

/**
 * Thrown when user inputs or domain values violate validation invariants.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_VALIDATION'] Machine-readable validation code
   * @param {string} [fieldName=''] Form field name that failed validation
   * @param {string} [constraint=''] Violated validation constraint rule
   */
  constructor(message, code = 'ERR_VALIDATION', fieldName = '', constraint = '') {
    super(message, code, 'WARN');
    this.fieldName = fieldName;
    this.constraint = constraint;
  }
}

/**
 * Thrown when Google Gemini API or downstream AI service interactions fail.
 */
export class AiServiceError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_AI_SERVICE'] Machine-readable error code
   * @param {number} [httpStatus=500] HTTP status code returned by remote endpoint
   * @param {boolean} [isRateLimit=false] Whether the failure is due to rate limits (HTTP 429)
   */
  constructor(message, code = 'ERR_AI_SERVICE', httpStatus = 500, isRateLimit = false) {
    super(message, code, 'ERROR');
    this.httpStatus = httpStatus;
    this.isRateLimit = isRateLimit;
  }
}

/**
 * Thrown when AI prompt or response is blocked by content safety filters.
 */
export class AiSafetyBlockError extends AiServiceError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_AI_SAFETY_BLOCK'] Machine-readable error code
   * @param {string} [blockReason=''] Specific safety category or trigger reason
   * @param {string} [safetyRating=''] Safety rating returned by safety evaluation
   */
  constructor(message, code = 'ERR_AI_SAFETY_BLOCK', blockReason = '', safetyRating = '') {
    super(message, code, 400, false);
    this.blockReason = blockReason;
    this.safetyRating = safetyRating;
  }
}

/**
 * Thrown when HTML5 Canvas 2D rendering operations fail.
 */
export class CanvasRenderError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_CANVAS_RENDER'] Machine-readable error code
   * @param {number} [requestedWidth=0] Requested canvas pixel width
   * @param {number} [requestedHeight=0] Requested canvas pixel height
   */
  constructor(message, code = 'ERR_CANVAS_RENDER', requestedWidth = 0, requestedHeight = 0) {
    super(message, code, 'ERROR');
    this.requestedWidth = requestedWidth;
    this.requestedHeight = requestedHeight;
  }
}

/**
 * Thrown when total canvas area exceeds hardware memory limits (16.7 megapixels).
 */
export class CanvasAreaExceededError extends CanvasRenderError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_CANVAS_CEIL'] Machine-readable error code
   * @param {number} [calculatedArea=0] Calculated physical pixel area (width * height)
   * @param {number} [maxAllowedArea=16777216] Maximum allowed pixel area ceiling
   */
  constructor(message, code = 'ERR_CANVAS_CEIL', calculatedArea = 0, maxAllowedArea = 16777216) {
    super(message, code, 0, 0);
    this.calculatedArea = calculatedArea;
    this.maxAllowedArea = maxAllowedArea;
  }
}

/**
 * Thrown when CanvasRenderingContext2D cannot be acquired from canvas element.
 */
export class Context2DUnavailableError extends CanvasRenderError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_NO_CTX_2D'] Machine-readable error code
   * @param {string} [canvasId=''] Target canvas element identifier
   */
  constructor(message, code = 'ERR_NO_CTX_2D', canvasId = '') {
    super(message, code, 0, 0);
    this.canvasId = canvasId;
  }
}

/**
 * Thrown when web font loading exceeds latency deadline.
 */
export class FontLoadTimeoutError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_FONT_TIMEOUT'] Machine-readable error code
   * @param {string} [fontFamily=''] Font family that timed out
   * @param {number} [elapsedMs=0] Elapsed load duration in milliseconds
   */
  constructor(message, code = 'ERR_FONT_TIMEOUT', fontFamily = '', elapsedMs = 0) {
    super(message, code, 'WARN');
    this.fontFamily = fontFamily;
    this.elapsedMs = elapsedMs;
  }
}

/**
 * Thrown when web font loading fails permanently due to network error or missing file.
 */
export class FontLoadError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_FONT_LOAD_FAILED'] Machine-readable error code
   * @param {string} [fontSpec=''] CSS font specification string
   */
  constructor(message, code = 'ERR_FONT_LOAD_FAILED', fontSpec = '') {
    super(message, code, 'WARN');
    this.fontSpec = fontSpec;
  }
}

/**
 * Thrown when an asynchronous operation is aborted due to newer user requests or cancellation.
 */
export class AsyncAbortedError extends AppError {
  /**
   * @param {string} [message='Operation aborted'] Human-readable error description
   * @param {string} [code='ERR_ASYNC_ABORT'] Machine-readable error code
   * @param {string} [reason='superseded'] Cancellation cause identifier
   * @param {number} [requestEpoch=Date.now()] Timestamp when aborted request was initiated
   */
  constructor(message = 'Operation aborted', code = 'ERR_ASYNC_ABORT', reason = 'superseded', requestEpoch = Date.now()) {
    super(message, code, 'INFO');
    this.reason = reason;
    this.requestEpoch = requestEpoch;
  }
}

/**
 * Thrown when browser storage (LocalStorage/IndexedDB) quota is exceeded.
 */
export class QuotaExceededError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_STORAGE_FULL'] Machine-readable error code
   * @param {string} [storageKey=''] Storage key associated with the quota exhaustion
   */
  constructor(message, code = 'ERR_STORAGE_FULL', storageKey = '') {
    super(message, code, 'WARN');
    this.storageKey = storageKey;
  }
}

/**
 * Thrown when state serialization or deserialization fails.
 */
export class StateSerializationError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_HASH_CORRUPT'] Machine-readable error code
   * @param {string} [rawPayload=''] Raw payload that failed serialization or parsing
   */
  constructor(message, code = 'ERR_HASH_CORRUPT', rawPayload = '') {
    super(message, code, 'ERROR');
    this.rawPayload = rawPayload;
  }
}

/**
 * Thrown when URL state hash payload exceeds safety ceiling (2048 characters).
 */
export class PayloadTooLargeError extends StateSerializationError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_PAYLOAD_TOO_LARGE'] Machine-readable error code
   * @param {number} [payloadLength=0] Character length of the rejected payload
   * @param {number} [maxLimit=2048] Maximum allowed character limit
   */
  constructor(message, code = 'ERR_PAYLOAD_TOO_LARGE', payloadLength = 0, maxLimit = 2048) {
    super(message, code, '');
    this.payloadLength = payloadLength;
    this.maxLimit = maxLimit;
  }
}

/**
 * Thrown when decoded payload bytes exceed decompression safety ceiling (32 KB).
 */
export class DecompressionBombError extends StateSerializationError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_DECOMPRESSION_BOMB'] Machine-readable error code
   * @param {number} [decompressedBytes=0] Decompressed byte count detected
   * @param {number} [ceilingLimit=32768] Maximum allowed byte ceiling
   */
  constructor(message, code = 'ERR_DECOMPRESSION_BOMB', decompressedBytes = 0, ceilingLimit = 32768) {
    super(message, code, '');
    this.decompressedBytes = decompressedBytes;
    this.ceilingLimit = ceilingLimit;
  }
}

/**
 * Thrown when Web Audio playback is suspended by browser autoplay policy.
 */
export class AudioAutoplayBlockedError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_AUDIO_LOCKED'] Machine-readable error code
   * @param {string} [audioState='suspended'] State of the AudioContext
   */
  constructor(message, code = 'ERR_AUDIO_LOCKED', audioState = 'suspended') {
    super(message, code, 'LOW');
    this.audioState = audioState;
  }
}

/**
 * Thrown when device lacks tactile haptic feedback hardware or permissions.
 */
export class HapticUnsupportedError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_HAPTIC_BLOCKED'] Machine-readable error code
   * @param {string} [hardwareStatus='unsupported'] Description of hardware availability status
   */
  constructor(message, code = 'ERR_HAPTIC_BLOCKED', hardwareStatus = 'unsupported') {
    super(message, code, 'LOW');
    this.hardwareStatus = hardwareStatus;
  }
}

/**
 * Thrown when history.replaceState calls exceed browser rate-limiting windows.
 */
export class HistoryThrottledError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_HIST_THROTTLE'] Machine-readable error code
   * @param {number} [callsPerWindow=0] Recorded invocations within the time window
   */
  constructor(message, code = 'ERR_HIST_THROTTLE', callsPerWindow = 0) {
    super(message, code, 'WARN');
    this.callsPerWindow = callsPerWindow;
  }
}

/**
 * Thrown when asynchronous clipboard write permission is denied.
 */
export class ClipboardPermissionError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_CLIP_DENIED'] Machine-readable error code
   * @param {string} [permissionState='denied'] State of clipboard permission query
   */
  constructor(message, code = 'ERR_CLIP_DENIED', permissionState = 'denied') {
    super(message, code, 'WARN');
    this.permissionState = permissionState;
  }
}

/**
 * Thrown when Web Share dialog is aborted or dismissed by user gesture.
 */
export class WebShareDismissedError extends AppError {
  /**
   * @param {string} [message='Share dialog was dismissed'] Human-readable error description
   * @param {string} [code='ERR_SHARE_ABORT'] Machine-readable error code
   * @param {boolean} [userInitiated=true] Whether dismissal was user-driven
   */
  constructor(message = 'Share dialog was dismissed', code = 'ERR_SHARE_ABORT', userInitiated = true) {
    super(message, code, 'INFO');
    this.userInitiated = userInitiated;
  }
}

/**
 * Thrown when direct state object mutation is attempted in violation of immutability rules.
 */
export class StateMutationError extends AppError {
  /**
   * @param {string} message Human-readable error description
   * @param {string} [code='ERR_STATE_FROZEN'] Machine-readable error code
   * @param {string} [actionType=''] Associated action type when mutation occurred
   */
  constructor(message, code = 'ERR_STATE_FROZEN', actionType = '') {
    super(message, code, 'CRITICAL');
    this.actionType = actionType;
  }
}

/**
 * Thrown when StateStore dispatch re-entrancy depth exceeds safety threshold.
 */
export class CyclicDispatchError extends StateMutationError {
  /**
   * @param {string} actionType Associated action type triggering recursion
   * @param {number} depth Recorded re-entrancy recursion depth
   */
  constructor(actionType, depth) {
    super(`Exceeded max dispatch recursion depth (${depth}) on action: ${actionType}`, 'ERR_STATE_CYCLIC_DISPATCH', actionType);
    this.depth = depth;
  }
}
