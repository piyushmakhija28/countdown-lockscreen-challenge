# Level 4: Low-Level Design — Class & Object Design

**Document ID:** `DOC-LLD-01-CLASS-OBJECT-DESIGN`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Zero-Build ES2022 ECMAScript + JSDoc OOP Contracts)

---

## 1. Core Domain Value Objects & Schema Types

```javascript
/**
 * @typedef {number} EpochMilliseconds
 * @typedef {number} Percentage
 * @typedef {'cyber_obsidian' | 'deep_focus_zen' | 'aurora_botanical'} ThemeId
 * @typedef {'ultra_tall' | 'standard_portrait' | 'wide_foldable'} LayoutRegime
 */

/**
 * @typedef {Object} TimeRemaining
 * @property {number} days - Days remaining until deadline
 * @property {number} hours - Hours remaining (0-23)
 * @property {number} minutes - Minutes remaining (0-59)
 * @property {number} seconds - Seconds remaining (0-59)
 * @property {number} totalMilliseconds - Total remaining milliseconds
 * @property {number} progressPercent - Completion percentage (0-100)
 * @property {boolean} isExpired - True when deadline has elapsed (totalMilliseconds <= 0)
 */

/**
 * @typedef {Object} MilestoneItem
 * @property {string} id - Unique identifier (e.g. "ms-1")
 * @property {number} step - 1-based sequential step index (1-5)
 * @property {string} title - Actionable milestone description
 * @property {number} offsetDays - Days prior to deadline for milestone achievement
 * @property {boolean} isCompleted - Completion status toggle
 */

/**
 * @typedef {Object} CountdownState
 * @property {string} goalTitle - High-impact title (3-60 chars)
 * @property {Date} deadline - Target UTC deadline date
 * @property {readonly MilestoneItem[]} milestones - Sequential milestone checkpoints
 * @property {string} affirmation - Motivational daily affirmation
 * @property {ThemeId} selectedTheme - Active aesthetic palette
 * @property {boolean} isOverlayVisible - True when safe-zone guide is displayed
 * @property {boolean} isAiLoading - True during Gemini API in-flight request
 * @property {string | null} error - Active error message or null
 */
```

---

## 2. Concrete Subsystem Class Specifications

### 2.1 `DualClockTimeEngine` Class Contract
```javascript
/**
 * Manages drift-compensated countdown chronometry coupling UTC wall-clock anchors with requestAnimationFrame.
 */
export class DualClockTimeEngine {
  #rafId = null;
  #lastWallEpoch = 0;
  #isRunning = false;
  #activeTargetEpoch = null;
  #lastReportedRemaining = Infinity;

  /**
   * Initializes real-time animation ticker using requestAnimationFrame.
   *
   * @param {Date} deadline Target UTC deadline
   * @param {(remaining: TimeRemaining) => void} onTick Frame callback
   * @param {() => void} onExpire Expiration callback
   */
  startTicker(deadline, onTick, onExpire) {}

  /**
   * Stops active requestAnimationFrame ticker loop.
   */
  stopTicker() {}

  /**
   * Resynchronizes chronometer clocks against absolute UTC epoch upon tab wake.
   *
   * @param {number} wallEpoch Current Date.now() timestamp
   * @param {number} monoTime Current performance.now() timestamp
   */
  reanchorClocks(wallEpoch, monoTime) {}

  /**
   * Calculates instantaneous TimeRemaining without advancing state.
   *
   * @param {Date} deadline Target deadline date
   * @param {Date} [referenceTime=new Date()] Reference time
   * @returns {TimeRemaining} Snapshot
   */
  calculateRemaining(deadline, referenceTime = new Date()) {}
}
```

### 2.2 `MilestoneManager` Class Contract
```javascript
/**
 * Manages sequencing, progress metrics, and state mutations for milestone items.
 */
export class MilestoneManager {
  #milestones = [];

  /**
   * Replaces current milestone collection with validated items.
   *
   * @param {readonly MilestoneItem[]} milestones
   */
  setMilestones(milestones) {}

  /**
   * Toggles completion status of a specific milestone by ID.
   *
   * @param {string} id
   */
  toggleMilestone(id) {}

  /**
   * Calculates aggregate progress percentage combining elapsed time and milestone checks.
   *
   * @param {Date} startTime Initial goal creation timestamp
   * @param {Date} deadline Target deadline timestamp
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(startTime, deadline) {}
}
```

### 2.3 `GeminiAiClient` & `HeuristicGenerator` Class Contracts
```javascript
/**
 * Client gateway for Google Gemini 3.8 Flash model.
 */
export class GeminiAiClient {
  #apiKey = null;
  #activeAbortController = null;
  #currentRequestEpoch = 0;

  /**
   * @param {string} [apiKey] Optional Google Gemini API key
   */
  constructor(apiKey) {}

  /**
   * Deconstructs a goal into backward milestones using Google Gemini 3.8 Flash.
   *
   * @param {string} goalTitle Sanitized goal title
   * @param {Date} deadline Target deadline timestamp
   * @returns {Promise<Object>} MilestonePlanResponse
   */
  async generatePlan(goalTitle, deadline) {}

  /**
   * Aborts active in-flight request if present.
   */
  abortActiveRequest() {}
}

/**
 * Deterministic offline fallback engine.
 */
export class HeuristicGenerator {
  /**
   * Synthesizes 4 equidistant milestone intervals using pure local arithmetic in < 5ms.
   *
   * @param {string} goalTitle Goal string
   * @param {Date} deadline Target deadline
   * @param {Date} [now=new Date()] Reference timestamp
   * @returns {Object} MilestonePlanResponse
   */
  static generatePlan(goalTitle, deadline, now = new Date()) {}
}
```

### 2.4 `AdaptiveBufferAllocator` Class Contract
```javascript
/**
 * Probes GPU limits and calculates optimal supersampling scale factors satisfying WebKit 16.7M px area.
 */
export class AdaptiveBufferAllocator {
  static #cachedMaxDim = null;
  static #WEBKIT_MAX_AREA = 16777216;

  /**
   * Probes GPU WebGL context for maximum hardware texture dimension.
   *
   * @returns {number} 4096 on constrained mobile GPUs; 8192 on desktop/flagships
   */
  static getMaxTextureDimension() {}

  /**
   * Solves closed-form dual-constraint scale factor for target resolution.
   *
   * @param {number} baseWidth Base canvas width
   * @param {number} baseHeight Base canvas height
   * @returns {{width: number, height: number, scaleFactor: number, isConstrained: boolean}}
   */
  static computeOptimalBuffer(baseWidth, baseHeight) {}
}
```

### 2.5 `ResponsiveLayoutEngine` Class Contract
```javascript
/**
 * Computes non-overlapping layout bounds across Ultra-Tall, Standard, and Foldable regimes.
 */
export class ResponsiveLayoutEngine {
  /**
   * Calculates layout boxes with guaranteed non-overlapping bounds.
   *
   * @param {number} width Canvas width in pixels
   * @param {number} height Canvas height in pixels
   * @returns {Object} Computed layout metrics and coordinates
   */
  static computeLayout(width, height) {}
}
```

### 2.6 `InputSanitizer` Class Contract
```javascript
/**
 * Defensive input validator stripping control chars, Trojan Source Bidi overrides, and HTML tags.
 */
export class InputSanitizer {
  /**
   * Normalizes Unicode, removes Bidi overrides, and validates against whitelist regex.
   *
   * @param {string} raw Raw user input string
   * @returns {string} Sanitized clean goal title
   * @throws {Error} If input violates length or character constraints
   */
  static sanitizeGoalTitle(raw) {}

  /**
   * Escapes XML/HTML entities for safe insertion into prompts and DOM.
   *
   * @param {string} input
   * @returns {string} Escaped string
   */
  static escapeXmlEntities(input) {}
}
```

### 2.7 `UrlStateService` Class Contract
```javascript
/**
 * Serializes and deserializes application state to/from #v1= URL hash with 32KB decompression bomb defense.
 */
export class UrlStateService {
  /**
   * Encodes application state into compressed Base64URL string.
   *
   * @param {CountdownState} state
   * @returns {Promise<string>} #v1= hash string
   */
  static async serializeState(state) {}

  /**
   * Deserializes Base64URL payload into clean, prototype-free state dictionary.
   * Supports both compact tuple arrays and structured object dictionaries.
   *
   * @param {string} base64Payload
   * @returns {Promise<Record<string, any>>}
   */
  static async deserializeState(base64Payload) {}
}
```

### 2.8 `ParticleEngine` Class Contract
```javascript
/**
 * Zero-allocation Float32Array celebration confetti physics engine.
 */
export class ParticleEngine {
  #count = 150;
  #buffer = new Float32Array(150 * 6);
  #rafId = null;

  /**
   * Initializes 150 particles with polar velocities and triggers 180-frame animation.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  startBurst(ctx, width, height) {}

  /**
   * Stops particle animation loop and resets buffer.
   */
  stop() {}
}
```

### 2.9 `AudioService` Class Contract
```javascript
/**
 * Procedural Web Audio API sound synthesizer with 4-state lifecycle, dynamic sample rate, and peak limiter.
 */
export class AudioService {
  #ctx = null;
  #limiterNode = null;
  #state = 'LOCKED';

  /**
   * Initializes gesture listeners to prime AudioContext on first tap/click.
   */
  constructor() {}

  /**
   * Unlocks AudioContext via 1-sample buffer playback.
   *
   * @returns {Promise<boolean>}
   */
  async unlockAudioContext() {}

  /**
   * Synthesizes celebratory major chord chime (C5-E5-G5-C6) with peak compression.
   *
   * @returns {Promise<boolean>}
   */
  async playVictoryChime() {}

  /**
   * Releases hardware audio resources.
   */
  dispose() {}
}
```

### 2.10 `HapticService` Class Contract
```javascript
/**
 * Mobile vibration haptic feedback controller with feature detection and silent fallback.
 */
export class HapticService {
  #isSupported = false;

  constructor() {}

  /**
   * Triggers single light tactile pulse (15ms) for interactive toggles.
   */
  lightTap() {}

  /**
   * Triggers victory vibration pattern ([100, 50, 100, 50, 250]).
   */
  victoryPattern() {}

  /**
   * Immediately terminates active vibration patterns.
   */
  cancel() {}
}
```

### 2.11 `TokenBucketHistoryGuard` Class Contract
```javascript
/**
 * Leaky token bucket rate limiter (B=30, r=2/s) preventing WebKit history.replaceState quota errors.
 */
export class TokenBucketHistoryGuard {
  #tokens = 30;
  #capacity = 30;
  #refillRatePerSec = 2;
  #lastRefillEpoch = Date.now();
  #pendingHash = null;
  #timer = null;

  /**
   * Enqueues state update with immediate sessionStorage sync and throttled replaceState.
   *
   * @param {string} hashPayload
   */
  pushStateUpdate(hashPayload) {}

  /**
   * Flushes any pending state into history immediately before page unload.
   */
  flush() {}
}
```

### 2.12 `CountdownApp` Class Contract
```javascript
/**
 * Compositional application root orchestrating state store, chronometer, DOM views, and export engine.
 */
export class CountdownApp {
  #store = null;
  #timeEngine = null;
  #audioService = null;
  #hapticService = null;
  #historyGuard = null;
  #canvasRenderer = null;

  /**
   * Boots application, hydrates URL hash, registers event listeners, and mounts UI.
   */
  async init() {}
}
```
