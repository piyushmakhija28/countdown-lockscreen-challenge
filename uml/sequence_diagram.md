# Sequence Diagram — End-to-End System Execution

```mermaid
sequenceDiagram
    autonumber
    actor User as Contestant / User
    participant App as app.js (ViewController)
    participant San as InputSanitizer
    participant Guard as TokenBucketHistoryGuard
    participant Gemini as GeminiAiClient
    participant Store as StateStore
    participant Ticker as DualClockTimeEngine
    participant Audio as AudioService
    participant Haptic as HapticService
    participant Alloc as AdaptiveBufferAllocator
    participant FontSvc as FontService
    participant Layout as ResponsiveLayoutEngine
    participant Canvas as CanvasRenderer
    participant SafeOverlay as SafeZoneOverlay
    participant TextWrapper as CanvasTextWrapper
    participant ParticleBurst as ParticleEngine
    participant Browser as Browser Runtime

    User->>App: Submits Goal ("Product Hunt Launch") & Target Date
    App->>San: sanitizeTitle(rawGoal)
    San-->>App: Clean Unicode NFKC String
    App->>Guard: pushStateUpdate(#v1=serialized)
    Note over Guard: Debounces 300ms window; protects Safari 100-call quota
    App->>Gemini: decomposeGoal(cleanGoal, deadline)
    
    alt API Online
        Gemini-->>App: Returns Structured Milestones JSON
    else API Offline / Timeout
        Gemini-->>App: Fallback to Heuristic Retrograde Sprints
    end
    
    App->>Store: dispatch(SET_GOAL_AND_MILESTONES)
    Store->>Ticker: startTicker(deadline)
    
    loop Every Animation Frame (16.6ms)
        Ticker->>Ticker: Reconcile delta with performance.now()
        Ticker->>App: onTick(timeRemaining)
        App->>Browser: Update DOM textContent
    end

    alt Countdown Expiration (Delta <= 0ms)
        Ticker->>Store: dispatch(GOAL_EXPIRED)
        par Sensory Celebration
            Store->>Audio: playVictoryChime() (Major chord)
            Store->>Haptic: victoryPattern() ([100, 50, 100, 50, 250])
            Store->>App: Trigger Particle Confetti Burst
        end
    end

    User->>App: Toggles "Phone Lock Screen Overlay"
    App->>SafeOverlay: renderOverlay(domContainer, currentDeviceProfile)
    SafeOverlay-->>Browser: Show Translucent Dynamic Island & Clock Markers

    User->>App: Clicks "Download Wallpaper"
    App->>Alloc: solveScale(1170, 2532, window.devicePixelRatio)
    Alloc-->>App: resolvedScale (e.g., 2.0 or clamped 1.5)
    App->>FontSvc: ensureFontsLoaded(['Inter', 'JetBrains Mono'])
    FontSvc-->>App: fontsReady: true
    App->>Layout: computeLayout(aspectRatio, safeZones)
    Layout-->>App: layoutBoxes (heroBox, timelineBox, affirmationBox)
    App->>Canvas: render(state, { scale: resolvedScale, layout: layoutBoxes })
    Canvas->>Canvas: Rasterize OLED Background & Safe Zones
    Canvas->>TextWrapper: wrapText(ctx, milestoneTitle, maxTextWidth)
    TextWrapper-->>Canvas: wrappedLines
    Canvas->>Canvas: Render Countdown Arc, Numerals & Milestones
    Canvas->>ParticleBurst: compositeCelebrationLayer(ctx, particles)
    ParticleBurst-->>Canvas: particlesComposited
    Canvas-->>App: Resolves PNG Image Blob
    App->>Browser: Trigger Download: "countdown-lockscreen.png"
    Browser-->>User: File Saved to Device
```
