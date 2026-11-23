# Class Diagram — Object-Oriented Architecture & Contracts

```mermaid
classDiagram
    class CountdownApp {
        -store: StateStore
        -timeEngine: DualClockTimeEngine
        -canvasRenderer: CanvasRenderer
        -geminiClient: GeminiAiClient
        -historyGuard: TokenBucketHistoryGuard
        -audioService: AudioChimeService
        -hapticService: HapticService
        +init(): void
        +bindEvents(): void
    }

    class StateStore {
        -state: CountdownState
        -listeners: Function[]
        -syncChannel: BroadcastChannel
        -instanceId: string
        +getState(): CountdownState
        +dispatch(action: CountdownAction): void
        +subscribe(listener: Function): Function
        +enableCrossTabSync(): void
        +broadcastSync(payload: any): void
    }

    class DualClockTimeEngine {
        -rafId: number
        -lastWallEpoch: number
        -isRunning: boolean
        -activeTargetEpoch: number
        -lastReportedRemaining: number
        +startTicker(deadline: Date, onTick: Function, onExpire: Function): void
        +stopTicker(): void
        +reanchorClocks(wallEpoch: number, monoTime: number): void
        +calculateRemaining(deadline: Date): TimeRemaining
    }

    class MilestoneManager {
        -milestones: MilestoneItem[]
        +setMilestones(milestones: MilestoneItem[]): void
        +calculateProgress(startTime: Date, deadline: Date): number
        +toggleMilestone(id: string): void
    }

    class GeminiAiClient {
        -apiKey: string
        -activeAbortController: AbortController
        -currentRequestEpoch: number
        +generatePlan(goalTitle: string, deadline: Date): Promise~MilestonePlanResponse~
        +abortActiveRequest(): void
    }

    class HeuristicGenerator {
        +generatePlan(goalTitle: string, deadline: Date, now: Date): MilestonePlanResponse
    }

    class AdaptiveBufferAllocator {
        -cachedMaxDim: number
        +getMaxTextureDimension(): number
        +computeOptimalBuffer(baseWidth: number, baseHeight: number): BufferBounds
    }

    class ResponsiveLayoutEngine {
        +computeLayout(width: number, height: number): ComputedLayout
    }

    class InputSanitizer {
        +sanitizeGoalTitle(raw: string): string
        +escapeXmlEntities(input: string): string
    }

    class UrlStateService {
        +serializeState(state: CountdownState): Promise~string~
        +deserializeState(base64Payload: string): Promise~Record~
    }

    class TokenBucketHistoryGuard {
        -tokens: number
        -capacity: number
        -refillRatePerSec: number
        +pushStateUpdate(hashPayload: string): void
        +flush(): void
    }

    class ParticleEngine {
        -count: number
        -buffer: Float32Array
        -rafId: number
        +startBurst(ctx: CanvasRenderingContext2D, width: number, height: number): void
        +stop(): void
    }

    class AudioChimeService {
        -ctx: AudioContext
        -limiterNode: DynamicsCompressorNode
        -state: string
        +unlockAudioContext(): Promise~boolean~
        +playVictoryChime(): Promise~boolean~
        +playVictoryChimeWithLock(): Promise~boolean~
        +dispose(): void
    }

    class HapticService {
        -isSupported: boolean
        +lightTap(): void
        +victoryPattern(): void
        +cancel(): void
    }

    class FontService {
        +ensureFontsReady(): Promise~void~
    }

    class CanvasTextWrapper {
        -measurementCache: Map
        +wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[]
        +fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number, maxFontSize: number, minFontSize: number): Object
        +measureWidth(ctx: CanvasRenderingContext2D, text: string): number
    }

    class SafeZoneOverlay {
        -visible: boolean
        +toggle(): boolean
        +getSafeTextBounds(width: number, height: number): Object
        +drawGuides(ctx: CanvasRenderingContext2D, width: number, height: number): void
    }

    class GeminiRateLimiter {
        -capacity: number
        -minPacingIntervalMs: number
        +acquireToken(): boolean
        +getQuotaStatus(): Object
    }

    class LifecycleScope {
        -controller: AbortController
        -disposables: Set
        +signal: AbortSignal
        +register(disposable: Function): Function
        +dispose(): void
    }

    class WorkerTickerAdapter {
        -worker: Worker
        -callbacks: Map
        +requestTick(callback: Function): number
        +cancelTick(handle: number): void
        +dispose(): void
    }

    class ITickScheduler {
        <<interface>>
        +requestTick(callback: Function): number
        +cancelTick(handle: number): void
    }

    class IMilestonePlanner {
        <<interface>>
        +generatePlan(goalTitle: string, deadline: Date): Promise~MilestonePlanResponse~
    }

    class IRenderTarget {
        <<interface>>
        +width: number
        +height: number
        +getContext(contextType: string, options: Object): CanvasRenderingContext2D
        +convertToBlob(type: string, quality: number): Promise~Blob~
    }

    class IWallpaperRenderer {
        <<interface>>
        +renderWallpaper(renderState: Object): Promise~void~
        +exportBlob(): Promise~Blob~
    }

    class ResilientStorageService {
        -memoryFallback: Map
        -prefix: string
        -activeTier: string
        +saveEphemeral(key: string, value: string): void
        +loadEphemeral(key: string): string
        +replaceNavigationState(hashFragment: string): void
    }

    class IStateStoragePort {
        <<interface>>
        +saveEphemeral(key: string, value: string): void
        +loadEphemeral(key: string): string
        +replaceNavigationState(hashFragment: string): void
    }

    class IPlatformLifecycle {
        <<interface>>
        +onWake(callback: Function): Function
        +onSleep(callback: Function): Function
        +isDocumentVisible(): boolean
    }

    class ISensoryCoordinator {
        <<interface>>
        +triggerMilestoneFeedback(themeId: string): Promise~SensoryTriggerResult~
        +triggerVictoryCelebration(themeId: string): Promise~SensoryTriggerResult~
        +stopCelebration(): void
        +dispose(): void
    }

    class SensoryCoordinator {
        -audioService: AudioChimeService
        -hapticService: HapticService
        -particleEngine: ParticleEngine
        -activeLoopId: number
        +triggerMilestoneFeedback(themeId: string): Promise~SensoryTriggerResult~
        +triggerVictoryCelebration(themeId: string): Promise~SensoryTriggerResult~
        +stopCelebration(): void
        +dispose(): void
    }

    class CanvasRenderer {
        -target: IRenderTarget
        -ctx: CanvasRenderingContext2D
        -allocator: AdaptiveBufferAllocator
        -layoutEngine: ResponsiveLayoutEngine
        -textWrapper: CanvasTextWrapper
        -safeZoneOverlay: SafeZoneOverlay
        -fontService: FontService
        +renderWallpaper(renderState: Object): Promise~void~
        +exportBlob(): Promise~Blob~
        +destroy(): void
    }

    ITickScheduler <|.. WorkerTickerAdapter
    IMilestonePlanner <|.. GeminiAiClient
    IMilestonePlanner <|.. HeuristicGenerator
    IWallpaperRenderer <|.. CanvasRenderer
    IStateStoragePort <|.. ResilientStorageService
    ISensoryCoordinator <|.. SensoryCoordinator
    SensoryCoordinator --> AudioChimeService
    SensoryCoordinator --> HapticService
    SensoryCoordinator --> ParticleEngine
    CountdownApp --> ISensoryCoordinator

    CountdownApp --> ResilientStorageService

    CountdownApp --> StateStore
    CountdownApp --> DualClockTimeEngine
    CountdownApp --> CanvasRenderer
    CountdownApp --> GeminiAiClient
    CountdownApp --> UrlStateService
    CountdownApp --> TokenBucketHistoryGuard
    CountdownApp --> AudioChimeService
    CountdownApp --> HapticService
    CountdownApp --> ParticleEngine
    CountdownApp --> LifecycleScope
    DualClockTimeEngine --> ITickScheduler
    DualClockTimeEngine --> IPlatformLifecycle
    TokenBucketHistoryGuard --> IStateStoragePort
    TokenBucketHistoryGuard --> IPlatformLifecycle
    GeminiAiClient --> GeminiRateLimiter
    StateStore --> MilestoneManager
    GeminiAiClient ..> HeuristicGenerator : fallback
    CanvasRenderer --> IRenderTarget
    CanvasRenderer --> AdaptiveBufferAllocator
    CanvasRenderer --> ResponsiveLayoutEngine
    CanvasRenderer --> FontService
    CanvasRenderer --> CanvasTextWrapper
    CanvasRenderer --> SafeZoneOverlay
    UrlStateService --> InputSanitizer
```
