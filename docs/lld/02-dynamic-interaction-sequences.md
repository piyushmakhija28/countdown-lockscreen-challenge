# Level 4: Low-Level Design — Dynamic Interaction Sequences

**Document ID:** `DOC-LLD-02-DYNAMIC-SEQUENCES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Formal Dynamic Sequence Modeling)  
**Version:** 2.3.2

---

## 1. Sequence 1: Application Ingress & URL State Hydration

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant App as AppBootstrap
    participant Router as UrlStateService
    participant Store as StateStore
    participant Ticker as DualClockTimeEngine
    participant View as ViewRenderer

    User->>App: Loads Application URL
    App->>Router: parseSafeUrlState(window.location.hash)
    alt Valid #v1= Hash Present
        Router->>Router: Base64 Decode & Polymorphic JSON Parse
        Router-->>App: Return Hydrated Clean State
    else No Hash / Invalid Hash / Decompression Bomb
        App->>Router: Query ResilientStorageService.loadState() (IndexedDB -> localStorage)
        alt Cached State Found in Storage
            Router-->>App: Return Tiered Persisted State
        else Storage Empty
            Router-->>App: Return Default Demonstrative State
        end
    end
    App->>Store: initialize(HydratedState)
    App->>Ticker: startTicker(deadline, onTick, onExpire)
    App->>View: initialMount(Store.getState())
    View-->>User: Renders Interactive Preview (FCP < 0.8s)
```

---

## 2. Sequence 2: Google Gemini Planning with Immediate Heuristic Fallback

```mermaid
sequenceDiagram
    autonumber
    actor User as Contestant
    participant View as ConfigView
    participant Store as StateStore
    participant Client as GeminiAiClient
    participant Fallback as HeuristicGenerator
    participant API as Google Gemini 3.8 Flash API

    User->>View: Clicks "Decompose with Gemini"
    View->>Store: dispatch(SET_AI_LOADING, true)
    View->>Client: generatePlan(goalTitle, deadline)
    alt Gemini Call Successful (< 4000ms)
        Client->>API: POST /v1beta/models/gemini-3.8-flash:generateContent (Header Auth)
        API-->>Client: Returns JSON {milestones, affirmation, theme}
        Client-->>View: Return MilestonePlanResponse
    else Network Error / Rate Limit 429 / Timeout > 4000ms
        Client->>Fallback: generatePlan(goalTitle, deadline)
        Fallback-->>View: Returns 4-Quarter Equidistant Plan (< 5ms)
        View->>View: Display Info Toast ("Generated via Heuristic Engine")
    end
    View->>Store: dispatch(APPLY_PLAN, plan)
    Store->>View: emit(STATE_CHANGED)
    View-->>User: Updates Milestones & Affirmation UI
```

---

## 3. Sequence 3: Drift-Compensated Animation Frame Loop (60 FPS)

```mermaid
sequenceDiagram
    autonumber
    participant Ticker as DualClockTimeEngine
    participant RAF as Window.requestAnimationFrame
    participant Clock as Hardware Clock (performance.now)
    participant View as DOMTickerView

    Ticker->>RAF: requestAnimationFrame(step)
    RAF-->>Ticker: step(timestamp)
    Ticker->>Clock: Read Date.now() and performance.now()
    Ticker->>Ticker: Delta = targetEpoch - currentEpoch
    Ticker->>View: updateDigits(days, hours, minutes, seconds)
    alt Document Visible
        Ticker->>RAF: requestAnimationFrame(step) (Continuous 60 FPS)
    else Tab In Background
        Note over Ticker: Browser throttles RAF to 1 Hz; zero drift accumulates
    end
```

---

## 4. Sequence 4: High-DPI OffscreenCanvas Wallpaper Rasterization

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant View as PreviewView
    participant Canvas as CanvasRenderer
    participant Alloc as AdaptiveBufferAllocator
    participant Font as FontService
    participant GPU as OffscreenCanvas Buffer
    participant Scrim as AmbientScrimEngine

    User->>View: Clicks "Download Lock Screen Wallpaper"
    View->>Canvas: renderToBlob(goal, profile, theme)
    Canvas->>Alloc: computeOptimalBuffer(profile.width, profile.height)
    Alloc-->>Canvas: Scale factor S* <= 2.0 (Area <= 16.7MP, MaxEdge <= 4096px)
    Canvas->>Font: ensureFontsLoaded()
    Font-->>Canvas: Fonts Ready (JetBrains Mono & Inter Decoded)
    Canvas->>GPU: Allocate S* Buffer & Reset 2D Context
    Note over Canvas,GPU: Stage 1: Background Palette Compositing
    Canvas->>GPU: Stage 2: Bayer 4x4 Ordered Dither Gradient (Band Eliminator)
    Canvas->>GPU: Stage 3: Safe-Zone Exclusion Bounds (Top 28% & Bottom 18% Clear)
    Canvas->>GPU: Stage 4: Sample 256 Luminance Coordinates in Content Zone
    GPU-->>Canvas: Mean Relative Luminance Y_bg
    opt If Y_bg > 0.35 (High-Luminance Background)
        Canvas->>Scrim: computeScrimGradient(Y_bg)
        Scrim-->>Canvas: Alpha Ramp alpha(y) in [0.45, 0.75]
        Canvas->>GPU: Stage 5: Composite Adaptive Scrim (APCA L^c >= 75 Guard)
    end
    Canvas->>GPU: Stage 6: Render OpenType Tabular Chronometer (tnum 1, CLS = 0.000)
    Canvas->>GPU: Stage 7: Render Milestone Progress Cards & Checklist
    Canvas->>GPU: Stage 8: Subpixel Half-Pixel Hairline Grid Snapping (floor(x) + 0.5)
    Canvas->>GPU: Stage 9: Encode Lossless PNG Blob (canvas.convertToBlob)
    GPU-->>Canvas: Lossless PNG Blob (100% Quality)
    Canvas->>Canvas: dispose() -> Set Dimensions 0x0 (Deallocate GPU Memory)
    Canvas-->>View: Returns Blob (< 350ms total)
    View-->>User: Triggers Web Share API or Standalone Save Modal
```

---

## 5. Sequence 5: Dynamic Theme Switching Mid-Countdown (Zero Tearing)

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant View as ThemeSelectorView
    participant Store as StateStore
    participant DOM as Root Document (:root)
    participant Canvas as CanvasRenderer
    participant Ticker as DualClockTimeEngine

    User->>View: Selects "Aurora Botanical" Theme
    View->>Store: dispatch(SET_THEME, 'aurora_botanical')
    Store->>DOM: Update CSS Variables (--primary, --glass-bg, --accent)
    Store->>Canvas: updateThemePalette(ThemeConfig['aurora_botanical'])
    Note over Ticker: 60 FPS Ticker loop continues uninterrupted
    Ticker->>Canvas: Next frame triggers redraw with updated color palette
    Canvas-->>View: Zero visual tearing / flicker (< 16.6ms frame budget)
    View-->>User: Seamless visual transition with CSS glassmorphism update
```

---

## 6. Sequence 6: Goal Expiration, Audio Chime, Haptics & Confetti Burst

```mermaid
sequenceDiagram
    autonumber
    participant Ticker as DualClockTimeEngine
    participant Store as StateStore
    participant Sensory as SensoryCoordinator
    participant Audio as AudioChimeService
    participant Locks as WebLocksAPI
    participant Haptic as HapticService
    participant Particle as ParticleEngine
    participant View as CelebrationOverlayView
    actor User as User

    Ticker->>Ticker: Delta <= 0ms Detected (Threshold Invariant)
    Ticker->>Store: dispatch(GOAL_EXPIRED)
    Store->>Store: Transition FSM to CELEBRATING_EXPIRED
    par Parallel Sensory Celebration (< 20ms Inter-Sensory Delta)
        Store->>Sensory: triggerVictoryCelebration()
        Sensory->>Haptic: victoryPattern() ([100, 50, 100, 50, 250]ms)
        Sensory->>Audio: playVictoryChimeWithLock()
        Audio->>Locks: navigator.locks.request('countdown_victory_alarm_lock', { ifAvailable: true })
        alt Lock Acquired (Single Tab Winner)
            Locks-->>Audio: Lock Granted
            Audio->>Audio: Synthesize 4-Note Fanfare Chord (C4+E4+G4+C5)
            Audio->>Locks: Release Lock
        else Lock Busy (Secondary Duplicate Tab)
            Locks-->>Audio: Lock Denied
            Audio-->>Sensory: Silent Bypass (Zero Acoustic Clipping)
        end
        Store->>Particle: startBurst(canvasContext, width, height)
        Store->>View: renderVictoryCard("Goal Achieved!")
    end
    Particle->>Particle: Float32Array zero-allocation physics (60 FPS, 3000ms duration)
    Audio->>Audio: Oscillator & Gain nodes auto-disconnect onended
    View-->>User: Displays Victory screen, confetti, and options to Share / Restart
```

---

## 7. Sequence 7: URL Hash Synchronization with Token Bucket History Guard

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Input as GoalTitleInput
    participant Guard as TokenBucketHistoryGuard
    participant Router as UrlStateService
    participant Browser as Window.history

    User->>Input: Types "Launch Startup MVP" (Rapid Keystrokes)
    Input->>Guard: pushStateUpdate(serializedState) [Keystroke 1]
    Note over Guard: Instant sessionStorage backup sync
    Note over Guard: Token bucket check (B=30, r=2/s)
    alt Tokens Available (T >= 1)
        Guard->>Router: serialize(latestState)
        Router->>Browser: history.replaceState(null, '', '#v1=' + base64Payload)
        Note over Guard: Tokens decremented by 1
    else Tokens Depleted (T < 1)
        Note over Guard: Update enqueued in 500ms trailing timer
        Note over Guard: No history.replaceState calls during typing burst!
        Note over Guard: Timer fires once tokens refill
        Guard->>Router: serialize(latestState)
        Router->>Browser: history.replaceState(null, '', '#v1=' + base64Payload)
    end
    Note over Browser: Safari 100-call / 30s limit respected; zero SecurityError
```

---

## 8. Sequence 8: Web Share API Ingress with iOS Standalone Modal Fallback

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant View as WallpaperExportView
    participant Canvas as CanvasRenderer
    participant OS as Mobile OS Share Sheet
    participant Modal as PressAndHoldModal

    User->>View: Taps "Share Wallpaper"
    View->>Canvas: shareOrDownload(wallpaperBlob, "countdown.png")
    alt navigator.canShare({ files: [file] }) is TRUE
        Canvas->>OS: navigator.share({ files: [file], title: "Lockscreen Wallpaper" })
        alt User selects native app (WhatsApp, Photos, AirDrop)
            OS-->>Canvas: Promise resolves
            Canvas-->>View: Show Success Toast
        else User swipes down to dismiss
            OS-->>Canvas: Throws AbortError
            Canvas->>Canvas: Silently ignore AbortError (no error toast)
        end
    else Standalone iOS PWA / Browser without File Share Support
        Canvas->>Modal: openModal(wallpaperBlobUrl)
        Modal-->>User: Displays <img> preview + "Long press image and select 'Save to Photos'"
        User->>Modal: Long-presses image -> Native iOS action sheet -> Saves to Photos
        User->>Modal: Taps "Done" -> Closes modal
    end
```

---

## 9. Sequence 9: Canvas Web Font Loading Race Condition Resolution

```mermaid
sequenceDiagram
    autonumber
    participant App as AppBootstrap
    participant FontService as FontService
    participant Canvas as CanvasRenderer
    participant View as PreviewView

    App->>FontService: ensureFontsReady()
    alt Web Fonts Already Loaded
        FontService-->>Canvas: Resolved immediately
        Canvas->>View: renderWallpaper() with custom typography
    else Web Fonts Downloading (< 2500ms)
        FontService-->>Canvas: Resolved after document.fonts.ready & load()
        Canvas->>View: renderWallpaper() with fully shaped custom glyphs
    else Font Network Timeout (> 2500ms)
        FontService->>Canvas: Timeout fallback to system font stack (-apple-system, Roboto)
        Canvas->>View: renderWallpaper() without blocking user interface
    end
```

---

## 10. Sequence 10: Service Worker Cache-First Lifecycle & In-App Update Prompt

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser ServiceWorker Container
    participant SW as Service Worker (sw.js)
    participant Cache as CacheStorage (v2.0.0)
    participant UI as UpdateToastNotification
    actor User as User

    Browser->>SW: Fetches /sw.js on page load
    alt Byte-for-Byte Different SW Available
        Browser->>SW: Install new worker (v2.0.1)
        SW->>Cache: Pre-cache updated tokens.css, main.js
        SW-->>Browser: state = 'installed' (waiting)
        Browser->>UI: Emit 'updatefound' -> Show "New Version Available"
        User->>UI: Clicks "Update Now"
        UI->>SW: postMessage({ type: 'SKIP_WAITING' })
        SW->>SW: self.skipWaiting()
        SW->>Browser: 'controllerchange' fired
        Browser->>Browser: window.location.reload()
    else SW Byte-Identical
        Browser->>Cache: Serve cached assets directly (< 30ms load)
    end
```
