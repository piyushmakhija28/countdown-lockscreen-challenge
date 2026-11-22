# Class Diagram — Object-Oriented Architecture & Contracts

```mermaid
classDiagram
    class CountdownApp {
        -store: StateStore
        -timeEngine: TimeEngine
        -canvasRenderer: CanvasRenderer
        -geminiClient: GeminiClient
        +init(): void
        +bindEvents(): void
    }

    class StateStore {
        -state: CountdownState
        -listeners: Function[]
        +getState(): CountdownState
        +dispatch(action: CountdownAction): void
        +subscribe(listener: Function): Function
    }

    class TimeEngine {
        -rafId: number
        -lastTimestamp: number
        +startTicker(deadline: Date, callback: Function): void
        +stopTicker(): void
        +calculateRemaining(deadline: Date): TimeRemaining
    }

    class MilestoneManager {
        +calculateProgress(milestones: Milestone[]): number
        +toggleMilestone(milestones: Milestone[], id: string): Milestone[]
    }

    class GeminiClient {
        -apiKey: string
        +decomposeGoal(goal: string, deadline: Date): Promise~MilestonePlanResponse~
    }

    class HeuristicGenerator {
        +generate(goal: string, deadline: Date): MilestonePlanResponse
    }

    class CanvasRenderer {
        -canvas: HTMLCanvasElement
        -ctx: CanvasRenderingContext2D
        +render(state: CountdownState, options: WallpaperRenderOptions): Promise~HTMLCanvasElement~
        +toBlob(canvas: HTMLCanvasElement): Promise~Blob~
    }

    class UrlStateService {
        +serialize(state: CountdownState): string
        +deserialize(hash: string): Partial~CountdownState~
    }

    CountdownApp --> StateStore
    CountdownApp --> TimeEngine
    CountdownApp --> CanvasRenderer
    CountdownApp --> GeminiClient
    CountdownApp --> UrlStateService
    GeminiClient ..> HeuristicGenerator : fallback
    StateStore --> MilestoneManager
```
