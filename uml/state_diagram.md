# State Diagram — Countdown & Milestone State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE: Page Loaded
    
    IDLE --> AI_PROCESSING: Goal & Deadline Submitted
    
    AI_PROCESSING --> ACTIVE_COUNTDOWN: Gemini AI Success / Fallback Triggered
    
    state ACTIVE_COUNTDOWN {
        [*] --> TICKING_60FPS
        TICKING_60FPS --> MILESTONE_TOGGLED: User Checks Step
        MILESTONE_TOGGLED --> TICKING_60FPS: Update Progress %
        TICKING_60FPS --> THEME_CHANGED: User Toggles Palette
        THEME_CHANGED --> TICKING_60FPS: Redraw Canvas
        TICKING_60FPS --> GENERATING_WALLPAPER: User Clicks Export
        GENERATING_WALLPAPER --> TICKING_60FPS: Blob Delivered
    }

    ACTIVE_COUNTDOWN --> CELEBRATION_COMPLETED: Time Remaining <= 0
    CELEBRATION_COMPLETED --> IDLE: User Resets New Goal
```
