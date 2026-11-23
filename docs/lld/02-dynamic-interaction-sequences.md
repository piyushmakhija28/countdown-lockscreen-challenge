# Level 4: Low-Level Design — Dynamic Interaction Sequences

**Document ID:** `DOC-LLD-02-DYNAMIC-SEQUENCES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Formal Dynamic Sequence Modeling)

---

## 1. Sequence 1: Application Ingress & URL State Hydration

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant App as AppBootstrap
    participant Router as UrlStateService
    participant Store as StateStore
    participant Ticker as TimeEngine
    participant View as ViewRenderer

    User->>App: Loads Application URL
    App->>Router: parseUrlHash(window.location.hash)
    alt Valid #v1= Hash Present
        Router->>Router: Base64 Decode & JSON Parse
        Router-->>App: Return Hydrated State
    else No Hash / Invalid Hash
        Router-->>App: Return Default Initial State
    end
    App->>Store: initialize(HydratedState)
    App->>Ticker: startTicker(deadline, onTick)
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
    participant Client as GeminiClient
    participant Fallback as HeuristicGenerator
    participant API as Google Gemini 3.8 Flash API

    User->>View: Clicks "Decompose with Gemini"
    View->>Store: dispatch(SET_AI_LOADING, true)
    View->>Client: generatePlan(goalTitle, deadline)
    alt Gemini Call Successful (< 4000ms)
        Client->>API: POST /v1beta/models/gemini-3.8-flash:generateContent
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
    participant Ticker as TimeEngine
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
    participant GPU as OffscreenCanvas Buffer (2340x5064)
    participant Downsampler as Bilinear Scaler (1170x2532)

    User->>View: Clicks "Download Wallpaper"
    View->>Canvas: renderWallpaper(options, state, remaining)
    Canvas->>GPU: Allocate 2340x5064 2x Supersampled Context
    Canvas->>GPU: Draw Radial Gradient Background
    Canvas->>GPU: Render Safe-Zone Exclusions (Top 28% Clear)
    Canvas->>GPU: Draw Hero Countdown Digits (Cyan/Amber/Mint)
    Canvas->>GPU: Render Milestone Checkpoints & Affirmation
    Canvas->>Downsampler: Resample 2x Buffer to 1170x2532
    Downsampler->>Canvas: toBlob("image/png")
    Canvas-->>View: Return PNG Blob (< 350ms total)
    Canvas->>Canvas: dispose() -> Set Dimensions 0x0 (Deallocate GPU Memory)
    View-->>User: Trigger Automatic File Download
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
    participant Ticker as TimeEngine

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
    participant Ticker as TimeEngine
    participant Store as StateStore
    participant Audio as AudioChimeService
    participant Haptic as HapticFeedbackService
    participant Particle as ParticleEngine
    participant View as CelebrationOverlayView
    actor User as User

    Ticker->>Ticker: Delta <= 0ms Detected (Threshold Invariant)
    Ticker->>Store: dispatch(GOAL_EXPIRED)
    Store->>Store: Transition FSM to CELEBRATING_EXPIRED
    par Parallel Sensory Celebration
        Store->>Audio: playVictoryChime() (Major Chord C5-E5-G5-C6)
        Store->>Haptic: victoryPattern() ([100, 50, 100, 50, 250])
        Store->>Particle: startBurst(150, canvasContext)
        Store->>View: renderVictoryCard("Goal Achieved!")
    end
    Particle->>Particle: Float32Array zero-allocation physics (60 FPS, 3000ms duration)
    Audio->>Audio: Oscillator & Gain nodes auto-disconnect onended
    View-->>User: Displays Victory screen, confetti, and options to Share / Restart
```

---

## 7. Sequence 7: URL Hash Synchronization with 300ms Leaky Bucket History Guard

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Input as GoalTitleInput
    participant Guard as HistoryQuotaGuard
    participant Router as UrlStateService
    participant Browser as Window.history

    User->>Input: Types "Launch Startup MVP" (Rapid Keystrokes)
    Input->>Guard: pushStateUpdate(serializedState) [Keystroke 1]
    Note over Guard: Timer started (300ms debounce window)
    User->>Input: Next Keystroke (t = 80ms)
    Input->>Guard: pushStateUpdate(serializedState) [Keystroke 2]
    Note over Guard: Previous timer cancelled; new 300ms window armed
    Note over Guard: No history.replaceState calls during typing burst!
    Note over Guard: 300ms elapse with no new keystrokes
    Guard->>Router: serialize(latestState)
    Router->>Browser: history.replaceState(null, '', '#v1=' + base64Payload)
    Note over Browser: Safari 100-call / 30s limit respected; zero SecurityError
```

---

## 8. Sequence 8: Web Share API Ingress with iOS Standalone Modal Fallback

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant View as WallpaperExportView
    participant Exporter as ShareService
    participant OS as Mobile OS Share Sheet
    participant Modal as PressAndHoldModal

    User->>View: Taps "Share Wallpaper"
    View->>Exporter: shareOrDownload(wallpaperBlob, "countdown.png")
    alt navigator.canShare({ files: [file] }) is TRUE
        Exporter->>OS: navigator.share({ files: [file], title: "Lockscreen Wallpaper" })
        alt User selects native app (WhatsApp, Photos, AirDrop)
            OS-->>Exporter: Promise resolves
            Exporter-->>View: Show Success Toast
        else User swipes down to dismiss
            OS-->>Exporter: Throws AbortError
            Exporter->>Exporter: Silently ignore AbortError (no error toast)
        end
    else Standalone iOS PWA / Browser without File Share Support
        Exporter->>Modal: openModal(wallpaperBlobUrl)
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
    participant FontAPI as Document.fonts
    participant Canvas as CanvasRenderer
    participant View as PreviewView

    App->>Canvas: initialize()
    Canvas->>FontAPI: ready (Promise)
    alt Web Fonts Already Cached
        FontAPI-->>Canvas: Resolved immediately
        Canvas->>View: renderWallpaper() with custom typography
    else Web Fonts Downloading (< 2500ms)
        FontAPI-->>Canvas: Resolved after download
        Canvas->>View: renderWallpaper() with fully shaped custom glyphs
    else Font Network Timeout (> 2500ms)
        Canvas->>Canvas: Timeout fallback to system font stack (-apple-system, Roboto)
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
    participant Cache as CacheStorage (v1.0.0)
    participant UI as UpdateToastNotification
    actor User as User

    Browser->>SW: Fetches /sw.js on page load
    alt Byte-for-Byte Different SW Available
        Browser->>SW: Install new worker (v1.0.1)
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
