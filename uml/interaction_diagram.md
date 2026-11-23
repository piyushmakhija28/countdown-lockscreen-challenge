# Interaction Overview Diagram — User Workflow Orchestration

```mermaid
stateDiagram-v2
    [*] --> IngressScreen: Open Web App
    
    state IngressScreen {
        [*] --> EnterGoal
        EnterGoal --> PickDate
        PickDate --> ChooseMode
    }
    
    ChooseMode --> GeminiDecomposition: Click "AI Generate"
    ChooseMode --> ManualEntry: Click "Manual Checkpoints"
    
    state GeminiDecomposition {
        [*] --> CallAPI
        CallAPI --> ProcessJSON
        ProcessJSON --> RenderCheckpoints
    }
    
    GeminiDecomposition --> PreviewScreen: Success
    ManualEntry --> PreviewScreen: Checkpoints Entered
    
    state PreviewScreen {
        [*] --> WatchCountdownTick
        WatchCountdownTick --> ToggleSafeZones
        ToggleSafeZones --> SwitchAestheticTheme
        SwitchAestheticTheme --> CheckMilestoneDone
        CheckMilestoneDone --> SyncPeerTabs: BroadcastChannel dispatch
        SyncPeerTabs --> WatchCountdownTick: State Converged
        WatchCountdownTick --> ArbitrateAlarm: Delta <= 0ms
        ArbitrateAlarm --> PlayVictoryChime: Web Locks Mutex Acquired
        ArbitrateAlarm --> SuppressChime: Mutex Contended
    }
    
    PreviewScreen --> ExportWallpaper: Click Download
    ExportWallpaper --> PreviewScreen: PNG Saved
    PreviewScreen --> [*]: Goal Achieved
```
