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
```
