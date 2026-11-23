# Level 4: Low-Level Design — Class & Object Design

**Document ID:** `DOC-LLD-01-CLASS-OBJECT-DESIGN`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Zero-Build ES2022 ECMAScript + JSDoc OOP Contracts)  
**Version:** 2.3.0

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

## 1.5 Clean Architecture Abstract Ports & Platform Interfaces

Adhering to Hexagonal Architecture, core domain logic depends exclusively on abstract port interfaces rather than concrete browser APIs or global DOM instances.

```javascript
/**
 * Abstract Port: Tick Scheduling strategy decoupled from window.requestAnimationFrame.
 * @interface ITickScheduler
 */
export class ITickScheduler {
  /**
   * Schedules a chronometer tick callback.
   * @param {(timestamp: number) => void} callback
   * @returns {number} Cancellation handle
   */
  requestTick(callback) {
    throw new Error('ITickScheduler.requestTick: abstract method');
  }

  /**
   * Cancels a scheduled chronometer tick.
   * @param {number} handle
   * @returns {void}
   */
  cancelTick(handle) {
    throw new Error('ITickScheduler.cancelTick: abstract method');
  }
}

/**
 * Abstract Port: Milestone planning strategy decoupled from Google Gemini network client.
 * @interface IMilestonePlanner
 */
export class IMilestonePlanner {
  /**
   * Deconstructs a goal into backward sequential milestones.
   * @param {string} goalTitle Sanitized goal title
   * @param {Date} deadline Target deadline timestamp
   * @returns {Promise<Object>} MilestonePlanResponse
   */
  async generatePlan(goalTitle, deadline) {
    throw new Error('IMilestonePlanner.generatePlan: abstract method');
  }
}

/**
 * Abstract Port: Abstract render target decoupling CanvasRenderer from DOM HTMLCanvasElement.
 * @interface IRenderTarget
 */
export class IRenderTarget {
  /** @returns {number} Target pixel width */
  get width() { throw new Error('IRenderTarget.width: abstract getter'); }
  /** @param {number} val */
  set width(val) { throw new Error('IRenderTarget.width: abstract setter'); }
  /** @returns {number} Target pixel height */
  get height() { throw new Error('IRenderTarget.height: abstract getter'); }
  /** @param {number} val */
  set height(val) { throw new Error('IRenderTarget.height: abstract setter'); }

  /**
   * Obtains 2D rendering context.
   * @param {'2d'} contextType
   * @param {Object} [options]
   * @returns {CanvasRenderingContext2D | null}
   */
  getContext(contextType, options) {
    throw new Error('IRenderTarget.getContext: abstract method');
  }

  /**
   * Converts render target to blob.
   * @param {string} [type]
   * @param {number} [quality]
   * @returns {Promise<Blob>}
   */
  convertToBlob(type, quality) {
    throw new Error('IRenderTarget.convertToBlob: abstract method');
  }
}

/**
 * Abstract Port: Wallpaper rendering contract.
 * @interface IWallpaperRenderer
 */
export class IWallpaperRenderer {
  /**
   * Renders lockscreen wallpaper onto target canvas.
   * @param {Object} renderState
   * @returns {Promise<void>}
   */
  async renderWallpaper(renderState) {
    throw new Error('IWallpaperRenderer.renderWallpaper: abstract method');
  }

  /**
   * Exports rendered wallpaper as PNG Blob.
   * @returns {Promise<Blob>}
   */
  async exportBlob() {
    throw new Error('IWallpaperRenderer.exportBlob: abstract method');
  }
}

/**
 * Abstract Port: Persistent state storage and navigation synchronization.
 * @interface IStateStoragePort
 */
export class IStateStoragePort {
  /**
   * Persists an ephemeral key-value pair.
   * @param {string} key
   * @param {string} value
   */
  saveEphemeral(key, value) {
    throw new Error('IStateStoragePort.saveEphemeral: abstract method');
  }

  /**
   * Loads an ephemeral value by key.
   * @param {string} key
   * @returns {string | null}
   */
  loadEphemeral(key) {
    throw new Error('IStateStoragePort.loadEphemeral: abstract method');
  }

  /**
   * Updates navigation state hash without causing page reload.
   * @param {string} hashFragment
   */
  replaceNavigationState(hashFragment) {
    throw new Error('IStateStoragePort.replaceNavigationState: abstract method');
  }
}

/**
 * Abstract Port: Host environment platform lifecycle observer.
 * @interface IPlatformLifecycle
 */
export class IPlatformLifecycle {
  /**
   * Registers a callback invoked when document becomes visible or system wakes.
   * @param {() => void} callback
   * @returns {() => void} Unbind function
   */
  onWake(callback) {
    throw new Error('IPlatformLifecycle.onWake: abstract method');
  }

  /**
   * Registers a callback invoked when document is hidden or page unloads.
   * @param {() => void} callback
   * @returns {() => void} Unbind function
   */
  onSleep(callback) {
    throw new Error('IPlatformLifecycle.onSleep: abstract method');
  }

  /**
   * Returns true if document is active and in foreground.
   * @returns {boolean}
   */
  isDocumentVisible() {
    throw new Error('IPlatformLifecycle.isDocumentVisible: abstract method');
  }
}
```

---

## 2. Concrete Subsystem Class Specifications

### 2.0 `StateStore` Class Contract
```javascript
/**
 * Error thrown when dispatch re-entrancy depth exceeds safety threshold.
 */
export class CyclicDispatchError extends Error {
  /**
   * @param {string} actionType
   * @param {number} depth
   */
  constructor(actionType, depth) {
    super(`CyclicDispatchError: Exceeded max dispatch recursion depth (${depth}) on action: ${actionType}`);
    this.name = 'CyclicDispatchError';
    this.code = 'ERR_STATE_CYCLIC_DISPATCH';
  }
}

/**
 * Frozen action types supported by StateStore.
 * @enum {string}
 */
export const ActionTypes = Object.freeze({
  SET_GOAL_INPUT: 'SET_GOAL_INPUT',
  HYDRATE_URL_STATE: 'HYDRATE_URL_STATE',
  PLANNING_REQUESTED: 'PLANNING_REQUESTED',
  PLANNING_SUCCEEDED: 'PLANNING_SUCCEEDED',
  PLANNING_FAILED: 'PLANNING_FAILED',
  TOGGLE_MILESTONE: 'TOGGLE_MILESTONE',
  SET_THEME: 'SET_THEME',
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
  TICK_CHRONOMETER: 'TICK_CHRONOMETER',
  GOAL_EXPIRED: 'GOAL_EXPIRED'
});

/**
 * Deep freezes an object recursively, preventing any property mutation in strict mode.
 *
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
export function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
}

/**
 * Central Observable State Store enforcing Unidirectional Data Flow,
 * Trampoline re-entrant dispatch queuing, and deep state immutability.
 */
export class StateStore {
  /** @type {Readonly<CountdownState>} */
  #state;
  /** @type {Set<(state: Readonly<CountdownState>, action: Object) => void>} */
  #subscribers = new Set();
  /** @type {boolean} */
  #isBatching = false;
  /** @type {boolean} */
  #isDispatching = false;
  /** @type {Array<{ type: string, payload?: any, meta?: { source?: string } }>} */
  #actionQueue = [];
  /** @type {number} */
  #reentrancyDepth = 0;
  /** @type {BroadcastChannel | null} */
  #syncChannel = null;
  /** @type {string} */
  #instanceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  /** @type {number} */
  static MAX_REENTRANCY_DEPTH = 10;

  /**
   * Initializes store with immutable initial state.
   *
   * @param {CountdownState} initialState
   */
  constructor(initialState) {
    this.#state = deepFreeze(structuredClone(initialState));
  }

  /**
   * Initializes BroadcastChannel listener for multi-tab synchronization.
   * Filters out cyclic self-broadcasts via unique tab instanceId.
   */
  enableCrossTabSync() {
    if (typeof BroadcastChannel === 'undefined') return;
    this.#syncChannel = new BroadcastChannel('countdown_lockscreen_sync');
    this.#syncChannel.onmessage = (event) => {
      if (!event.data || event.data.senderId === this.#instanceId) return;
      if (event.data.type === 'SYNC_STATE_V1') {
        this.dispatch({ type: 'HYDRATE_EXTERNAL', payload: event.data.state, meta: { isExternalSync: true } });
      }
    };
  }

  /**
   * Retrieves a deeply frozen immutable snapshot of current state.
   *
   * @returns {Readonly<CountdownState>}
   */
  getState() {
    return this.#state;
  }

  /**
   * Closes active BroadcastChannel connection and releases IPC resources.
   */
  destroy() {
    if (this.#syncChannel) {
      this.#syncChannel.close();
      this.#syncChannel = null;
    }
    this.#subscribers.clear();
  }

  /**
   * Dispatches an action via a Trampoline queue, preventing recursive stack overflow or dropped actions.
   *
   * @param {{ type: string, payload?: any, meta?: { source?: string } }} action
   * @throws {CyclicDispatchError} If re-entrancy depth exceeds 10.
   */
  dispatch(action) {
    if (this.#reentrancyDepth > StateStore.MAX_REENTRANCY_DEPTH) {
      throw new CyclicDispatchError(action.type, this.#reentrancyDepth);
    }

    this.#actionQueue.push(action);

    if (this.#isDispatching) {
      return;
    }

    this.#isDispatching = true;
    try {
      while (this.#actionQueue.length > 0) {
        const nextAction = this.#actionQueue.shift();
        this.#reentrancyDepth++;
        try {
          const nextState = this.#reduce(this.#state, nextAction);
          if (nextState !== this.#state) {
            this.#state = deepFreeze(nextState);
            this.#notifySubscribers(nextAction);
          }
        } finally {
          this.#reentrancyDepth--;
        }
      }
    } finally {
      this.#isDispatching = false;
    }
  }

  /**
   * Subscribes a listener to state changes.
   *
   * @param {(state: Readonly<CountdownState>, action: Object) => void} listener
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    this.#subscribers.add(listener);
    return () => this.#subscribers.delete(listener);
  }

  #notifySubscribers(action) {
    if (this.#isBatching) return;
    this.#isBatching = true;
    queueMicrotask(() => {
      this.#isBatching = false;
      const snapshot = this.#state;
      for (const listener of this.#subscribers) {
        try {
          listener(snapshot, action);
        } catch (err) {
          console.error('StateStore: Subscriber notification failed', err);
        }
      }
    });
  }

  #reduce(state, action) {
    switch (action.type) {
      case ActionTypes.SET_GOAL_INPUT:
        return { ...state, goalTitle: action.payload.title, deadline: action.payload.deadline };
      case ActionTypes.HYDRATE_URL_STATE:
        return { ...state, ...action.payload };
      case ActionTypes.PLANNING_SUCCEEDED:
        return { ...state, milestones: action.payload.milestones, affirmation: action.payload.affirmation, isPlanning: false };
      case ActionTypes.TOGGLE_MILESTONE:
        return {
          ...state,
          milestones: state.milestones.map(m => m.id === action.payload.id ? { ...m, isCompleted: !m.isCompleted } : m)
        };
      case ActionTypes.SET_THEME:
        return { ...state, selectedTheme: action.payload.themeId };
      case ActionTypes.TOGGLE_OVERLAY:
        return { ...state, isOverlayVisible: !state.isOverlayVisible };
      case ActionTypes.GOAL_EXPIRED:
        return { ...state, isExpired: true };
      default:
        return state;
    }
  }
}

### 2.1 `DualClockTimeEngine` Class Contract
```javascript
/**
 * Manages drift-compensated countdown chronometry coupling UTC wall-clock anchors with requestAnimationFrame or Web Worker.
 */
export class DualClockTimeEngine {
  /** @type {ITickScheduler} */
  #scheduler;
  /** @type {IPlatformLifecycle} */
  #lifecycle;
  /** @type {number | null} */
  #rafId = null;
  /** @type {number} */
  #lastWallEpoch = 0;
  /** @type {boolean} */
  #isRunning = false;
  /** @type {number | null} */
  #activeTargetEpoch = null;
  /** @type {number} */
  #lastReportedRemaining = Infinity;

  /**
   * Initializes real-time drift-compensated chronometer with injected scheduling and lifecycle ports.
   *
   * @param {ITickScheduler} scheduler Tick scheduling strategy (e.g. RAF or Web Worker)
   * @param {IPlatformLifecycle} lifecycle Host platform lifecycle port for wake/sleep re-anchoring
   */
  constructor(scheduler, lifecycle) {
    this.#scheduler = scheduler;
    this.#lifecycle = lifecycle;
  }

  /**
   * Initializes real-time animation ticker using requestAnimationFrame.
   *
   * @param {Date} deadline Target UTC deadline
   * @param {(remaining: TimeRemaining) => void} onTick Frame callback
   * @param {() => void} onExpire Expiration callback
   */
  startTicker(deadline, onTick, onExpire) {}

  /**
   * Dynamically updates target deadline enforcing the target-bound chronometer reset invariant.
   *
   * @param {Date} newDeadline
   */
  setDeadline(newDeadline) {}

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
  /** @type {MilestoneItem[]} */
  #milestones = [];

  /**
   * Replaces current milestone collection with validated items.
   *
   * @param {readonly MilestoneItem[]} milestones
   */
  setMilestones(milestones) {}

  /**
   * Returns read-only snapshot of milestones.
   *
   * @returns {readonly MilestoneItem[]}
   */
  getMilestones() {
    return this.#milestones;
  }

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
  /** @type {string | null} */
  #apiKey = null;
  /** @type {AbortController | null} */
  #activeAbortController = null;
  /** @type {number} */
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
   * @throws {AiServiceError} If API returns 429 or 5xx
   * @throws {AsyncAbortedError} If request is superseded
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

### 2.3.1 `GeminiRateLimiter` Class Contract
```javascript
/**
 * Token bucket rate limiter governing Gemini 3.8 Flash Free Tier quota (15 RPM with 2.0s pacing).
 * Persists token balance and call timestamps in localStorage across tabs with UTC calendar date anchor.
 */
export class GeminiRateLimiter {
  #capacity = 15;
  #refillIntervalMs = 60000;
  #minPacingIntervalMs = 2000;
  #lastCallEpoch = 0;
  #storageKey = 'gemini_rate_guard_v1';

  /**
   * @param {number} [capacity=15] Maximum RPM token burst capacity
   * @param {number} [minPacingIntervalMs=2000] Minimum inter-dispatch spacing in milliseconds
   */
  constructor(capacity = 15, minPacingIntervalMs = 2000) {
    this.#capacity = capacity;
    this.#minPacingIntervalMs = minPacingIntervalMs;
  }

  /**
   * Attempts to acquire execution token. Throws AiServiceError if rate limit or pacing threshold exceeded.
   *
   * @returns {boolean} True if token acquired
   * @throws {AiServiceError} If 15 RPM exhausted or request occurs < 2.0s since last dispatch
   */
  acquireToken() {}

  /**
   * Returns current token balance and milliseconds until next permitted dispatch.
   *
   * @returns {{ tokens: number, waitMs: number }}
   */
  getQuotaStatus() {}
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
   * @throws {ValidationError} If input violates length or character constraints
   */
  static sanitizeGoalTitle(raw) {}

  /**
   * Validates target deadline timestamp ensuring it is strictly in the future.
   *
   * @param {Date | string | number} deadline Target timestamp
   * @param {Date} [referenceTime=new Date()] Optional reference timestamp
   * @returns {Date} Validated future Date instance
   * @throws {ValidationError} If date is invalid, in the past, or exceeds maximum future threshold
   */
  static validateFutureDeadline(deadline, referenceTime = new Date()) {}

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
   * @throws {StateSerializationError} If serialization or compression fails
   */
  static async serializeState(state) {}

  /**
   * Deserializes Base64URL payload into clean, prototype-free state dictionary.
   * Supports both compact tuple arrays and structured object dictionaries.
   *
   * @param {string} base64Payload
   * @returns {Promise<Record<string, unknown>>} Prototype-free state object
   * @throws {StateSerializationError} If payload is corrupt, tampering detected, or expansion exceeds 32KB
   */
  static async deserializeState(base64Payload) {}
}
```

### 2.8 `ParticleEngine` Class Contract
```javascript
/**
 * Zero-allocation Float32Array celebration confetti physics engine using Structure-of-Arrays (SoA).
 * Buffer layout per particle (stride 6): [x, y, vx, vy, alpha, colorIdx].
 */
export class ParticleEngine {
  /** @type {number} */
  #count = 150;
  /** @type {Float32Array} Float32Array of 900 elements (150 particles * 6 floats) */
  #buffer = new Float32Array(150 * 6);
  /** @type {number | null} */
  #rafId = null;

  /**
   * Initializes 150 particles with polar velocities and triggers 180-frame animation.
   * Checks window.matchMedia('(prefers-reduced-motion: reduce)') and bypasses execution if active.
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

### 2.9 `AudioChimeService` Class Contract
```javascript
/**
 * Procedural Web Audio API sound synthesizer with 4-state lifecycle, dynamic sample rate, and peak limiter.
 */
export class AudioChimeService {
  /** @type {AudioContext | null} */
  #ctx = null;
  /** @type {DynamicsCompressorNode | null} */
  #limiterNode = null;
  /** @type {'LOCKED' | 'WARMED' | 'RUNNING' | 'CLOSED'} */
  #state = 'LOCKED';
  /** @type {(() => void) | null} */
  #unbindGestureListeners = null;

  /**
   * Initializes persistent gesture listeners on window to warm AudioContext on any user interaction.
   */
  constructor() {}

  /**
   * Unlocks AudioContext via 1-sample buffer playback.
   *
   * @returns {Promise<boolean>}
   */
  async unlockAudioContext() {}

  /**
   * Arbitrates single-instance victory audio chime via Web Locks API mutex.
   * Guarantees strictly one tab plays celebratory audio across multi-tab sessions.
   *
   * @returns {Promise<boolean>} True if lock was acquired and chime played; false if suppressed.
   */
  async playVictoryChimeWithLock() {
    if (!('locks' in navigator)) return this.playVictoryChime();
    try {
      return await navigator.locks.request('countdown_victory_alarm_lock', { ifAvailable: true }, async (lock) => {
        if (!lock) return false;
        await this.playVictoryChime();
        await new Promise((r) => setTimeout(r, 2500));
        return true;
      });
    } catch {
      return this.playVictoryChime();
    }
  }

  /**
   * Synthesizes celebratory major chord chime (C5-E5-G5-C6) with peak compression.
   *
   * @returns {Promise<boolean>} Resolves true if sound played, false if audio blocked or unavailable
   */
  async playVictoryChime() {}

  /**
   * Returns instantaneous audio hardware state.
   *
   * @returns {'LOCKED' | 'WARMED' | 'RUNNING' | 'CLOSED'}
   */
  getState() {
    return this.#state;
  }

  /**
   * Releases hardware audio resources and unbinds gesture listeners.
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
 * Leaky token bucket rate limiter (B=30, r=2/s) preventing WebKit history.replaceState quota errors
 * and featuring a 3-layer loop shield against recursive popstate echoes.
 */
export class TokenBucketHistoryGuard {
  #tokens = 30;
  #capacity = 30;
  #refillRatePerSec = 2;
  #lastRefillEpoch = Date.now();
  #pendingHash = null;
  #timer = null;
  /** @type {IStateStoragePort} */
  #storage;
  /** @type {IPlatformLifecycle} */
  #lifecycle;
  /** @type {boolean} Mutex flag blocking state serialization during popstate hydration */
  #isHydrating = false;
  /** @type {string} Fingerprint cache of last pushed hash */
  #lastPushedHash = '';

  /**
   * Constructs history guard with injected storage port and lifecycle observer.
   *
   * @param {IStateStoragePort} storage Injected state storage port
   * @param {IPlatformLifecycle} lifecycle Injected platform lifecycle port
   * @param {number} [capacity=30] Maximum burst token capacity
   * @param {number} [refillRatePerSec=2] Token refill rate per second
   */
  constructor(storage, lifecycle, capacity = 30, refillRatePerSec = 2) {
    this.#storage = storage;
    this.#lifecycle = lifecycle;
    this.#capacity = capacity;
    this.#refillRatePerSec = refillRatePerSec;
  }

  /**
   * Enqueues state update with immediate sessionStorage sync and throttled replaceState.
   *
   * @param {string} hashPayload
   */
  pushStateUpdate(hashPayload) {}

  /**
   * Returns fresh URL reflecting currently persisted state hash without history manipulation.
   *
   * @returns {string} Fully qualified URL string
   */
  getFreshUrl() {}

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
  /** @type {StateStore} */
  #store;
  /** @type {DualClockTimeEngine} */
  #timeEngine;
  /** @type {GeminiAiClient} */
  #geminiClient;
  /** @type {LifecycleScope} */
  #lifecycleScope;
  /** @type {AudioChimeService} */
  #audioService;
  /** @type {HapticService} */
  #hapticService;
  /** @type {TokenBucketHistoryGuard} */
  #historyGuard;
  /** @type {CanvasRenderer} */
  #canvasRenderer;

  /**
   * Instantiates the core application wiring dependencies via constructor injection.
   *
   * @param {Object} [deps={}] Optional injected service instances for testability
   */
  constructor(deps = {}) {}

  /**
   * Boots application, hydrates URL hash, registers event listeners, and mounts UI.
   */
  async init() {}
}
```

### 2.13 `CanvasRenderer` Class Contract
```javascript
/**
 * Master presentation-tier graphics coordinator rendering high-DPI wallpapers onto HTML5 Canvas 2D.
 */
export class CanvasRenderer {
  /** @type {IRenderTarget} */
  #target;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  /** @type {AdaptiveBufferAllocator} */
  #allocator;
  /** @type {ResponsiveLayoutEngine} */
  #layoutEngine;
  /** @type {CanvasTextWrapper} */
  #textWrapper;
  /** @type {SafeZoneOverlay} */
  #safeZoneOverlay;
  /** @type {FontService} */
  #fontService;

  /**
   * Constructs the canvas wallpaper renderer with clean dependency injection.
   *
   * @param {IRenderTarget} target Render target abstraction wrapping HTMLCanvasElement or OffscreenCanvas
   * @param {AdaptiveBufferAllocator} allocator Buffer dimension allocator
   * @param {ResponsiveLayoutEngine} layoutEngine Layout computation engine
   * @param {FontService} fontService Font readiness gate
   * @param {CanvasTextWrapper} [textWrapper] Optional text wrapper override
   * @param {SafeZoneOverlay} [safeZoneOverlay] Optional safe zone overlay override
   */
  constructor(target, allocator, layoutEngine, fontService, textWrapper, safeZoneOverlay) {
    this.#target = target;
    const ctx = target.getContext('2d', { colorSpace: 'display-p3' }) || target.getContext('2d');
    if (!ctx) {
      throw new Context2DUnavailableError('CanvasRenderingContext2D could not be acquired');
    }
    this.#ctx = ctx;
    this.#allocator = allocator;
    this.#layoutEngine = layoutEngine;
    this.#fontService = fontService;
    this.#textWrapper = textWrapper || new CanvasTextWrapper();
    this.#safeZoneOverlay = safeZoneOverlay || new SafeZoneOverlay();
  }

  /**
   * Dynamically switches active color palette and triggers wallpaper re-render.
   *
   * @param {'themeA' | 'themeB' | 'themeC'} themeId
   */
  updateThemePalette(themeId) {}

  /**
   * Dispatches native Web Share API with PNG Blob or falls back to direct Anchor download.
   *
   * @returns {Promise<boolean>} True if shared/downloaded successfully
   */
  async shareOrDownload() {}

  /**
   * Renders the complete lock screen wallpaper with safe-zone bounds and typography.
   *
   * @param {Object} renderState - Countdown state, theme tokens, and milestones.
   * @returns {Promise<void>}
   * @throws {CanvasRenderError} If drawing pipeline fails
   */
  async renderWallpaper(renderState) {}

  /**
   * Exports the rasterized wallpaper canvas as a downloadable PNG Blob.
   *
   * @returns {Promise<Blob>}
   */
  async exportBlob() {}

  /**
   * Releases allocated canvas memory and tears down rendering pipeline.
   */
  destroy() {}
}
```

### 2.14 `CanvasTextWrapper` Class Contract
```javascript
/**
 * Typography measurement and line-wrapping engine providing Bidi isolation and sub-pixel alignment.
 */
export class CanvasTextWrapper {
  /** @type {Map<string, number>} */
  #measurementCache = new Map();

  /**
   * Wraps text into lines that do not exceed the specified maximum width using two-tier Intl.Segmenter.
   *
   * @param {CanvasRenderingContext2D} ctx - Target 2D rendering context.
   * @param {string} text - Input text string.
   * @param {number} maxWidth - Maximum line width in pixels.
   * @returns {string[]} Array of wrapped lines.
   */
  wrapText(ctx, text, maxWidth) {}

  /**
   * Calculates optimal font size and wrapped lines that fit within bounding box constraints.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} text
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {number} maxFontSize
   * @param {number} minFontSize
   * @returns {{fontSize: number, lines: string[], totalHeight: number}}
   */
  fitText(ctx, text, maxWidth, maxHeight, maxFontSize, minFontSize) {}

  /**
   * Measures text width with LRU caching.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} text
   * @returns {number} Width in pixels.
   */
  measureWidth(ctx, text) {}
}
```

### 2.15 `SafeZoneOverlay` Class Contract
```javascript
/**
 * Renders ergonomic lock screen simulator overlays (iOS Dynamic Island, clock, Android gesture bar).
 */
export class SafeZoneOverlay {
  /** @type {boolean} */
  #visible = false;

  /**
   * Toggles the visual visibility of the lockscreen simulator overlay guides.
   *
   * @returns {boolean} New visibility state.
   */
  toggle() {
    this.#visible = !this.#visible;
    return this.#visible;
  }

  /**
   * Returns exact pixel bounding box of primary unobstructed content zone.
   *
   * @param {number} width Canvas width
   * @param {number} height Canvas height
   * @returns {{top: number, bottom: number, left: number, right: number, safeHeight: number}}
   */
  getSafeTextBounds(width, height) {}

  /**
   * Draws the safe-zone guide overlays onto the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  drawGuides(ctx, width, height) {}
}
```

### 2.16 `FontService` Class Contract
```javascript
/**
 * Web font readiness and preloading gate eliminating Canvas Flash of Invisible/Unstyled Text (FOIT/FOUT).
 */
export class FontService {
  /** @type {Set<string>} */
  #loadedFonts = new Set();
  /** @type {boolean} */
  #isReady = false;

  /**
   * Preloads a specific web font family asynchronously.
   *
   * @param {string} fontSpec - Font specifier (e.g. '700 32px Inter').
   * @returns {Promise<boolean>}
   */
  async loadFont(fontSpec) {}

  /**
   * Checks whether a specific font is loaded and available for canvas rasterization.
   *
   * @param {string} fontSpec
   * @returns {boolean}
   */
  checkReady(fontSpec) {}

  /**
   * Awaits all critical application web fonts to ensure atomic canvas rendering readiness.
   *
   * @returns {Promise<void>}
   */
  async ensureFontsLoaded() {}
}
```

### 2.17 `LifecycleScope` RAII Helper Class Contract
```javascript
/**
 * RAII lifecycle management helper automating AbortController signal chaining and teardown cleanup.
 * Guarantees zero DOM listener or async timer memory leaks.
 */
export class LifecycleScope {
  /** @type {AbortController} */
  #controller = new AbortController();
  /** @type {Set<() => void>} */
  #disposables = new Set();

  /**
   * Returns active AbortSignal for passing to fetch, addEventListener, etc.
   *
   * @returns {AbortSignal}
   */
  get signal() {
    return this.#controller.signal;
  }

  /**
   * Registers a disposable teardown function executed upon scope termination.
   *
   * @param {() => void} disposable
   * @returns {() => void} Function to manually unregister disposable
   */
  register(disposable) {
    this.#disposables.add(disposable);
    return () => this.#disposables.delete(disposable);
  }

  /**
   * Aborts active signal and executes all registered disposal routines.
   */
  dispose() {
    this.#controller.abort();
    for (const disposeFn of this.#disposables) {
      try {
        disposeFn();
      } catch (err) {
        console.error('LifecycleScope: disposal error', err);
      }
    }
    this.#disposables.clear();
  }
}
```

### 2.18 `WorkerTickerAdapter` Class Contract
```javascript
/**
 * Inline Blob Web Worker tick scheduler providing unthrottled 1Hz chronometer ticks in background tabs.
 * Implements ITickScheduler.
 */
export class WorkerTickerAdapter extends ITickScheduler {
  /** @type {Worker | null} */
  #worker = null;
  /** @type {number} */
  #handleCounter = 0;
  /** @type {Map<number, (timestamp: number) => void>} */
  #callbacks = new Map();

  /**
   * Instantiates inline worker via URL.createObjectURL using an unthrottled self.setInterval loop.
   */
  constructor() {
    super();
    const workerScript = `
      let timer = null;
      self.onmessage = (e) => {
        if (e.data === 'start') {
          if (!timer) {
            timer = setInterval(() => self.postMessage({ type: 'tick', timestamp: performance.now() }), 1000);
          }
        } else if (e.data === 'stop') {
          if (timer) { clearInterval(timer); timer = null; }
        }
      };
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    this.#worker = new Worker(url);
    URL.revokeObjectURL(url);

    this.#worker.onmessage = (e) => {
      if (e.data && e.data.type === 'tick') {
        const ts = e.data.timestamp;
        for (const cb of this.#callbacks.values()) {
          cb(ts);
        }
      }
    };
  }

  /**
   * Schedules a chronometer tick callback.
   *
   * @param {(timestamp: number) => void} callback
   * @returns {number} Cancellation handle
   */
  requestTick(callback) {
    const handle = ++this.#handleCounter;
    this.#callbacks.set(handle, callback);
    if (this.#callbacks.size === 1 && this.#worker) {
      this.#worker.postMessage('start');
    }
    return handle;
  }

  /**
   * Cancels a scheduled chronometer tick.
   *
   * @param {number} handle
   */
  cancelTick(handle) {
    this.#callbacks.delete(handle);
    if (this.#callbacks.size === 0 && this.#worker) {
      this.#worker.postMessage('stop');
    }
  }

  /**
   * Terminates background worker thread completely.
   */
  dispose() {
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }
    this.#callbacks.clear();
  }
}

### 2.19 `ResilientStorageService` Class Contract
```javascript
/**
 * Concrete Storage Adapter: Resilient client persistence engine implementing IStateStoragePort.
 * Enforces the 4-tier degradation ladder from ADR-006:
 * Tier 1: LocalStorage with LRU eviction and 'countdown_lockscreen_v1:' namespace
 * Tier 2: SessionStorage for tab-scoped isolation
 * Tier 3: In-Memory Map heap fallback
 * Tier 4: URL hash memento
 */
export class ResilientStorageService extends IStateStoragePort {
  /** @type {Map<string, string>} */
  #memoryFallback = new Map();
  /** @type {string} */
  #prefix = 'countdown_lockscreen_v1:';
  /** @type {'localStorage' | 'sessionStorage' | 'memory' | 'hash'} */
  #activeTier = 'localStorage';

  /**
   * Constructs resilient storage service with proactive tier availability probing.
   */
  constructor() {
    super();
    this.#probeActiveTier();
  }

  /**
   * Probes browser environment to determine highest available storage tier.
   * @private
   */
  #probeActiveTier() {
    try {
      const probeKey = `${this.#prefix}__probe__`;
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
      this.#activeTier = 'localStorage';
    } catch {
      try {
        const probeKey = `${this.#prefix}__probe__`;
        sessionStorage.setItem(probeKey, '1');
        sessionStorage.removeItem(probeKey);
        this.#activeTier = 'sessionStorage';
      } catch {
        this.#activeTier = 'memory';
      }
    }
  }

  /**
   * Returns currently active storage tier name.
   * @returns {'localStorage' | 'sessionStorage' | 'memory' | 'hash'}
   */
  get activeTier() {
    return this.#activeTier;
  }

  /**
   * Persists an ephemeral key-value pair across available storage tiers with LRU protection.
   *
   * @param {string} key Storage lookup key
   * @param {string} value Serialized payload string
   * @returns {void}
   */
  saveEphemeral(key, value) {
    const fullKey = `${this.#prefix}${key}`;
    if (this.#activeTier === 'localStorage') {
      try {
        localStorage.setItem(fullKey, value);
        return;
      } catch {
        this.#evictOldestLru();
        try {
          localStorage.setItem(fullKey, value);
          return;
        } catch {
          this.#activeTier = 'sessionStorage';
        }
      }
    }
    if (this.#activeTier === 'sessionStorage') {
      try {
        sessionStorage.setItem(fullKey, value);
        return;
      } catch {
        this.#activeTier = 'memory';
      }
    }
    this.#memoryFallback.set(fullKey, value);
  }

  /**
   * Loads an ephemeral value from the highest available tier.
   *
   * @param {string} key Storage lookup key
   * @returns {string | null} Stored value or null if nonexistent
   */
  loadEphemeral(key) {
    const fullKey = `${this.#prefix}${key}`;
    if (this.#activeTier === 'localStorage') {
      try {
        const val = localStorage.getItem(fullKey);
        if (val !== null) return val;
      } catch {
        this.#activeTier = 'sessionStorage';
      }
    }
    if (this.#activeTier === 'sessionStorage') {
      try {
        const val = sessionStorage.getItem(fullKey);
        if (val !== null) return val;
      } catch {
        this.#activeTier = 'memory';
      }
    }
    return this.#memoryFallback.get(fullKey) ?? null;
  }

  /**
   * Safely replaces browser navigation hash state without creating history stack pollution.
   *
   * @param {string} hashFragment URL hash payload
   * @returns {void}
   */
  replaceNavigationState(hashFragment) {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${hashFragment}`);
      }
    } catch {
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = hashFragment;
      }
    }
  }

  /**
   * Evicts oldest unpinned item from localStorage to recover quota.
   * @private
   */
  #evictOldestLru() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.#prefix) && !k.includes('pinned')) {
          localStorage.removeItem(k);
          break;
        }
      }
    } catch {
      // Degrade silently
    }
  }
}
```
