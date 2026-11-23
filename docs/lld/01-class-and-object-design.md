# Level 4: Low-Level Design — Class & Object Design

**Document ID:** `DOC-LLD-01-CLASS-OBJECT-DESIGN`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Strict TypeScript OOP Contracts)

---

## 1. Core Domain Interfaces & Value Objects

```typescript
/**
 * Nominal branded types to enforce unit safety across milliseconds and percentages.
 */
export type EpochMilliseconds = number & { readonly __brand: unique symbol };
export type Percentage = number & { readonly __brand: unique symbol };

/**
 * Immutable snapshot of remaining time calculated against target UTC epoch.
 */
export interface TimeRemaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly totalMilliseconds: EpochMilliseconds;
  readonly progressPercent: Percentage;
  readonly isExpired: boolean;
}

/**
 * Sequential milestone checkpoint entity.
 */
export interface Milestone {
  readonly id: string;
  readonly step: number;
  readonly title: string;
  readonly targetOffsetDays: number;
  readonly isCompleted: boolean;
}

/**
 * Visual design theme identifier.
 */
export type ThemeId = 'cyber_obsidian' | 'deep_focus_zen' | 'aurora_botanical';

/**
 * Complete immutable application state representation.
 */
export interface CountdownState {
  readonly goalTitle: string;
  readonly deadline: Date;
  readonly milestones: readonly Milestone[];
  readonly affirmation: string;
  readonly selectedTheme: ThemeId;
  readonly isOverlayVisible: boolean;
  readonly isAiLoading: boolean;
  readonly error: string | null;
}
```

---

## 2. Concrete Subsystem Class Specifications

### 2.1 `TimeEngine` Class Contract
```typescript
/**
 * Manages drift-compensated countdown calculations synchronized to UTC epoch.
 */
export class TimeEngine {
  private rafId: number | null = null;
  private lastTickEpoch: number = 0;
  private isRunning: boolean = false;

  /**
   * Initializes real-time animation ticker using requestAnimationFrame.
   * @param deadline Target UTC deadline
   * @param onTick Callback invoked on every frame with recalculated TimeRemaining
   */
  public startTicker(
    deadline: Date,
    onTick: (remaining: TimeRemaining) => void
  ): void;

  /**
   * Stops active requestAnimationFrame ticker loop.
   */
  public stopTicker(): void;

  /**
   * Calculates instantaneous TimeRemaining without advancing state.
   * @param deadline Target deadline date
   * @param referenceTime Current time (defaults to Date.now())
   */
  public calculateRemaining(
    deadline: Date,
    referenceTime?: Date
  ): TimeRemaining;
}
```

### 2.2 `MilestoneManager` Class Contract
```typescript
/**
 * Manages sequencing, progress metrics, and state mutations for milestone items.
 */
export class MilestoneManager {
  private milestones: Milestone[] = [];

  /**
   * Replaces current milestone list with a validated new collection.
   */
  public setMilestones(milestones: readonly Milestone[]): void;

  /**
   * Toggles completion status of a specific milestone by ID.
   */
  public toggleMilestone(id: string): void;

  /**
   * Adds an intermediate milestone checkpoint.
   */
  public addMilestone(title: string, offsetDays: number): void;

  /**
   * Calculates aggregate progress percentage combining elapsed time and milestone checks.
   */
  public calculateProgress(startTime: Date, deadline: Date): Percentage;
}
```

### 2.3 `GeminiClient` & `HeuristicGenerator` Class Contracts
```typescript
export interface MilestonePlanResponse {
  title: string;
  deadline_iso: string;
  milestones: Array<{
    step: number;
    title: string;
    offset_days: number;
    completed: boolean;
  }>;
  daily_affirmation: string;
  recommended_theme: ThemeId;
}

/**
 * Client gateway for Google Gemini 3.8 Flash model.
 */
export class GeminiClient {
  private apiKey: string | null = null;
  private activeAbortController: AbortController | null = null;
  private currentRequestEpoch: number = 0;

  constructor(apiKey?: string);

  /**
   * Deconstructs a goal into backward milestones using Google Gemini 3.8 Flash.
   * Cancels any pending in-flight requests via AbortController to prevent ABA races.
   * Throws AiServiceError if request fails or times out (> 4000ms).
   * Throws AsyncAbortedError if a newer request supercedes this request.
   */
  public async generatePlan(
    goalTitle: string,
    deadline: Date
  ): Promise<MilestonePlanResponse>;

  /**
   * Aborts active in-flight request if present.
   */
  public abortActiveRequest(): void;
}

/**
 * Deterministic offline fallback engine.
 */
export class HeuristicGenerator {
  /**
   * Synthesizes 4 equidistant milestone intervals using pure local arithmetic.
   */
  public static generatePlan(
    goalTitle: string,
    deadline: Date
  ): MilestonePlanResponse;
}
```

### 2.4 `CanvasRenderer` Class Contract
```typescript
export interface RenderOptions {
  width: number;           // Standard: 1170
  height: number;          // Standard: 2532
  devicePixelRatio: number;// Clamped to min(2.0, devicePixelRatio) to prevent 16.7M ceiling
  themeId: ThemeId;
  showSafeZoneOverlay: boolean;
}

/**
 * High-DPI Canvas 2D rasterizer producing 1170x2532 lock screen wallpapers.
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor();

  /**
   * Pre-loads required web fonts before rendering, preventing Canvas FOUT/FOIT.
   */
  public async ensureFontsLoaded(): Promise<void>;

  /**
   * Executes multi-layer rasterization pipeline onto internal 2x supersampled canvas.
   */
  public async renderWallpaper(
    options: RenderOptions,
    state: CountdownState,
    remaining: TimeRemaining
  ): Promise<HTMLCanvasElement>;

  /**
   * Extracts rasterized canvas to binary image blob for download or native mobile sharing.
   */
  public async exportBlob(
    format?: 'image/png' | 'image/jpeg',
    quality?: number
  ): Promise<Blob>;

  /**
   * Triggers native Web Share API (Level 2) or falls back to anchor download.
   */
  public async shareOrDownload(blob: Blob, filename: string): Promise<void>;

  /**
   * Clears canvas buffers (width=0, height=0) and triggers GPU texture deallocation.
   */
  public dispose(): void;
}

/**
 * Offscreen DOM text shaping bridge ensuring 100% accurate Indic/Arabic complex script shaping.
 */
export interface BiDiTextShaper {
  rasterizeComplexText(text: string, fontFamily: string, fontSize: number, color: string): Promise<ImageBitmap>;
  detectDirectionality(text: string): 'rtl' | 'ltr';
  wrapDirectionalIsolates(text: string): string;
}

/**
 * Perceptually uniform Oklab color space gradient interpolation engine.
 */
export interface OklabGradientEngine {
  interpolateOklab(colorA: string, colorB: string, t: number): string;
  createOklabCanvasGradient(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]): CanvasGradient;
}

/**
 * Adaptive tri-modal frame governor mitigating mobile GPU thermal throttling.
 */
export interface AdaptiveFrameGovernor {
  setInteractionState(active: boolean): void;
  getThrottleIntervalMs(): number;
  registerVisibilityListener(): void;
}

/**
 * Procedural micro-orbital shifting engine preventing OLED sub-pixel burn-in on AOD displays.
 */
export interface MicroOrbitalBurnInGuard {
  getOrbitalOffset(timestampMs: number): { dx: number; dy: number };
  clampRelativeLuminance(rgb: [number, number, number]): [number, number, number];
}

/**
 * Dual-transport URL and binary bit-packed state encoding service.
 */
export interface DualTransportUrlService {
  encodeCompactBinary(state: CountdownState): Uint8Array;
  decodeCompactBinary(bytes: Uint8Array): CountdownState;
  generateShareableLink(state: CountdownState, mode: 'hash' | 'query'): string;
  renderMicroQrVector(bytes: Uint8Array, sizePx: number): Promise<ImageBitmap>;
}

/**
 * Resilient streaming JSON repair parser handling mid-token disconnections.
 */
export interface StreamingJSONRepairService {
  repairAndParse<T>(truncatedJson: string): T | null;
}

/**
 * Dynamic lockscreen safe zone router handling notification peek and foldable morphing.
 */
export interface DynamicSafeZoneRouter {
  getActiveSafeZone(aspectRatio: string, notificationActive: boolean): SafeZoneBounds;
}

/**
 * Procedural Web Audio API sound synthesizer with sample-rate resilience and auto-cleanup.
 */
export class AudioChimeService {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  constructor();

  /**
   * Initializes or unlocks the AudioContext upon first user gesture (touch/click).
   */
  public async unlockAudioContext(): Promise<void>;

  /**
   * Synthesizes a celebratory major chord chime (C5-E5-G5-C6) upon countdown completion.
   * Auto-disconnects oscillator and gain nodes immediately after playback.
   */
  public async playVictoryChime(): Promise<void>;

  /**
   * Synthesizes subtle high-frequency tick click (2400Hz, 8ms) for interactive slider scrubbing.
   */
  public playTickChime(): void;

  /**
   * Closes active AudioContext and releases hardware sound buffers.
   */
  public dispose(): Promise<void>;
}

/**
 * Mobile vibration haptic feedback controller with feature detection and silent fallback.
 */
export class HapticFeedbackService {
  private readonly isSupported: boolean;

  constructor();

  /**
   * Triggers single light tactile pulse (15ms) for interactive toggles.
   */
  public lightTap(): void;

  /**
   * Triggers victory vibration pattern ([100ms on, 50ms off, 100ms on, 50ms off, 250ms on]).
   */
  public victoryPattern(): void;

  /**
   * Immediately terminates active vibration patterns.
   */
  public cancel(): void;
}

/**
 * Greedy multi-line word-wrapping and font shrink-to-fit calculation engine for Canvas 2D.
 */
export class CanvasTextWrapper {
  /**
   * Wraps text into lines fitting within maxPixelWidth using canvas measureText.
   */
  public static wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxPixelWidth: number
  ): string[];

  /**
   * Computes optimal font size using binary search between minSize and maxSize
   * ensuring text strictly fits inside target bounding box [maxW x maxH].
   */
  public static fitText(
    ctx: CanvasRenderingContext2D,
    text: string,
    fontFamily: string,
    minSize: number,
    maxSize: number,
    maxW: number,
    maxH: number
  ): number;
}

/**
 * Leaky bucket rate-limiter protecting against Safari's 100-call / 30s history.replaceState ceiling.
 */
export class HistoryQuotaGuard {
  private timerId: number | null = null;
  private pendingPayload: string | null = null;
  private readonly debounceMs: number = 300;

  constructor(debounceMs?: number);

  /**
   * Schedules a debounced history.replaceState update, dropping intermediate states.
   */
  public pushStateUpdate(hashPayload: string): void;

  /**
   * Immediately flushes any pending state into history before page unload.
   */
  public flush(): void;
}

/**
 * High-performance, zero-allocation tick snapshot engine for 60 FPS RAF loops.
 */
export class ZeroAllocationTickEngine {
  private readonly snapshot: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    progress: number;
    isExpired: boolean;
  };

  constructor();

  /**
   * Recycles internal snapshot struct without instantiating new objects, eliminating V8 GC pressure.
   */
  public compute(deadlineEpoch: number, nowEpoch: number): typeof this.snapshot;
}

/**
 * Multi-device lockscreen safe-zone guide renderer.
 */
export class SafeZoneOverlay {
  /**
   * Renders visual exclusion guides for Dynamic Island, notch, fingerprint sensor, and dock.
   */
  public static renderGuides(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deviceModel: 'iphone_island' | 'iphone_notch' | 'android_punchhole'
  ): void;

  /**
   * Returns exact pixel bounding box safe for text placement [x, y, width, height].
   */
  public static getSafeTextBounds(
    width: number,
    height: number
  ): { x: number; y: number; width: number; height: number };
}
```

---

## 3. Vanilla ES Modules & JSDoc Runtime Schema

To preserve the zero-build-step, pure native browser architecture, all production code in `src/js/` is written in standard ECMAScript 2022 Modules (`.js`). Types and nominal contracts defined in Section 1 and 2 are enforced at authoring time via strict JSDoc annotations conforming to `~/.claude/rules/12-docstrings-only.md`:

```javascript
/**
 * @typedef {Object} TimeRemaining
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {number} totalMilliseconds
 * @property {number} progressPercent
 * @property {boolean} isExpired
 */

/**
 * @typedef {Object} Milestone
 * @property {string} id
 * @property {number} step
 * @property {string} title
 * @property {number} targetOffsetDays
 * @property {boolean} isCompleted
 */

/**
 * @typedef {'cyber_obsidian' | 'deep_focus_zen' | 'aurora_botanical'} ThemeId
 */

/**
 * @typedef {Object} CountdownState
 * @property {string} goalTitle
 * @property {Date} deadline
 * @property {readonly Milestone[]} milestones
 * @property {string} affirmation
 * @property {ThemeId} selectedTheme
 * @property {boolean} isOverlayVisible
 * @property {boolean} isAiLoading
 * @property {string | null} error
 */
```
