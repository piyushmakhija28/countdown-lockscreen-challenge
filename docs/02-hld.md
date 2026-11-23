# Level 2: High-Level Design (HLD) & System Architecture

**Document ID:** `DOC-02-HLD`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (ISO/IEC/IEEE 29148 Standard)

---

## 1. System Architecture Overview & Core Architectural Philosophy

The system employs a **Decoupled Dual-Engine Architecture** executing entirely within modern client browser environments without requiring centralized server compute or persistent cloud databases:

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT BROWSER RUNTIME                                       |
|                                                                                                   |
|   +------------------------------------+             +----------------------------------------+   |
|   |    1. REACTIVE DOM & CSS ENGINE    |             |      2. HIGH-DPI CANVAS 2D ENGINE      |   |
|   |  - Responsive Preview Shell        |             |  - 1170x2532 Native Portrait Raster    |   |
|   |  - Lock Screen Safe-Zone Overlay   |             |  - 2x Supersampled OffscreenCanvas     |   |
|   |  - Glassmorphic Controls & Ticker  |             |  - Sub-pixel Anti-aliasing & Kerning   |   |
|   +-----------------+------------------+             +-------------------+--------------------+   |
|                     |                                                    |                        |
|                     +-----------------------+  +-------------------------+                        |
|                                             |  |                                                  |
|                                             v  v                                                  |
|                              +-------------------------------+                                    |
|                              |   3. APPLICATION CORE STORE   |                                    |
|                              |  - TimeEngine (RAF 60fps)     |                                    |
|                              |  - Milestone Chronometry      |                                    |
|                              |  - Base64 URL State Manager   |                                    |
|                              +---------------+---------------+                                    |
|                                              |                                                    |
+----------------------------------------------|----------------------------------------------------+
                                               |
                          +--------------------+--------------------+
                          |                                         |
                          v                                         v
         +----------------------------------+     +----------------------------------+
         |      GOOGLE GEMINI 3.8 FLASH     |     |      GITHUB PAGES EDGE CDN       |
         |  - Backward Milestone Planning   |     |  - Cache-First PWA Deliverable   |
         |  - Motivational Copywriting      |     |  - Sub-second Global Latency     |
         +----------------------------------+     +----------------------------------+
```

### 1.1 Architectural Guarantees & Fitness Functions
1. **Zero-PII Privacy Invariant:** No user data, goals, or telemetry are transmitted to any database. Client state is strictly localized to `window.location.hash` and `localStorage`.
2. **Sub-second Startup ($FCP < 0.8\text{s}$):** Static edge distribution on GitHub Pages ensures instant distribution without server cold-start penalties.
3. **Deterministic Frame Rate ($60\text{ fps}$):** The animation chronometer executes via `requestAnimationFrame` decoupled from canvas rasterization buffers, preventing UI jank.
4. **Architectural Acyclicity ($D \le 0.15$):** Strict inward dependency injection conforming to Clean Architecture principles.

---

## 2. C4 Architecture Models

### 2.1 C4 Level 1: System Context Diagram
```mermaid
graph TD
    User((Mobile User / Contestant))
    App[Countdown Lock Screen Web App & PWA]
    Gemini[Google Gemini 3.8 Flash API]
    CDN[GitHub Pages Edge CDN]
    OS[Smartphone Lock Screen OS]

    User -->|1. Inputs goal, deadline & selects theme| App
    App -->|2. Ingress request for milestone planning| Gemini
    Gemini -->|3. Returns structured JSON milestones & affirmation| App
    App -->|4. Renders interactive preview & safe-zone simulator| User
    App -->|5. Exports high-res 1170x2532 wallpaper PNG| User
    User -->|6. Sets wallpaper on device lock screen| OS
    CDN -->|Delivers static PWA bundle| App
```

### 2.2 C4 Level 2: Container Diagram
```mermaid
graph TD
    subgraph BrowserRuntime [Browser Progressive Web App Runtime]
        Router[Hash Router & State Hydrator]
        HistoryGuard[HistoryQuotaGuard: 300ms Leaky Bucket]
        ViewLayer[Reactive UI & Glassmorphic View Controller]
        StateStore[Central State Manager]
        TimeEngine[RAF Chronometer Service]
        CanvasEngine[OffscreenCanvas 2D Pipeline]
        AudioService[AudioChimeService: Procedural Web Audio]
        HapticService[HapticFeedbackService: Vibration API]
        ServiceWorker[Cache-First PWA Service Worker]
    end

    Router -->|Hydrates #v1= state| StateStore
    ViewLayer -->|User Input / Keystrokes| HistoryGuard
    HistoryGuard -->|Debounced #v1= replaceState| Router
    ViewLayer -->|User Events & Edits| StateStore
    StateStore -->|State Subscriptions| ViewLayer
    StateStore -->|Ticking Epochs| TimeEngine
    TimeEngine -->|Frame Deltas (16.6ms)| ViewLayer
    TimeEngine -->|Timer Expiration <= 0ms| StateStore
    StateStore -->|Trigger Victory Chime| AudioService
    StateStore -->|Trigger Haptic Pattern| HapticService
    StateStore -->|Rasterize Snapshot| CanvasEngine
    CanvasEngine -->|Binary Image Blob| ViewLayer
    ServiceWorker -->|Caches Assets & Offline Shell| ViewLayer
```

### 2.3 C4 Level 3: Component Diagram (Canvas 2D Engine Breakdown)
```mermaid
graph TD
    subgraph CanvasPipeline [High-DPI Wallpaper Rendering Subsystem]
        Alloc[Buffer Allocator: 2340x5064 Supersampled Canvas]
        ThemeLayer[Theme Background & OLED Radial Gradient Layer]
        SafeZoneLayer[Lock Screen Safe-Zone Boundary Calculator]
        DigitsLayer[Hero Countdown Digits & Progress Ring Layer]
        TextWrapper[CanvasTextWrapper: Greedy Wrap & Font Fit]
        MilestoneLayer[Milestone Timeline & Checkbox Layer]
        AffirmationLayer[Affirmation & Typographical Kerning Engine]
        ParticleEngine[ParticleEngine: Float32Array Celebration Physics]
        Downsampler[Bilinear Downsampler: 2x Scale to 1170x2532]
        BlobConverter[Canvas toBlob PNG/JPEG Exporter]
    end

    Alloc --> ThemeLayer
    ThemeLayer --> SafeZoneLayer
    SafeZoneLayer --> DigitsLayer
    DigitsLayer --> TextWrapper
    TextWrapper --> MilestoneLayer
    MilestoneLayer --> AffirmationLayer
    AffirmationLayer --> ParticleEngine
    ParticleEngine --> Downsampler
    Downsampler --> BlobConverter
```

---

## 3. Subsystem Latency Budgets & Execution Metrics

To guarantee optimal user perception, total end-to-end operation is bound by strict deterministic latency budgets:

$$\text{Total Time to Wallpaper (TTW)} = T_{\text{ingress}} + T_{\text{AI}} + T_{\text{render}} + T_{\text{download}} \le 2000\text{ms}$$

| Subsystem Component | Target Latency (P50) | Upper Bound (P95) | Degradation Policy if Exceeded |
|:---|:---:|:---:|:---|
| **App Bundle Load & Hydration** | $450\text{ms}$ | $800\text{ms}$ | Edge CDN Gzip/Brotli compression + SW cache hit. |
| **User Input Ingress & Validation** | $5\text{ms}$ | $16\text{ms}$ | Synchronous microtask execution. |
| **Gemini 3.8 Flash Decomposition** | $850\text{ms}$ | $1800\text{ms}$ | Fallback to `HeuristicGenerator` if timeout $> 4000\text{ms}$. |
| **Heuristic Fallback Generation** | $2\text{ms}$ | $5\text{ms}$ | Zero network dependency; local arithmetic slicing. |
| **Canvas 2D Rasterization (2x)** | $45\text{ms}$ | $90\text{ms}$ | Single-pass GPU OffscreenCanvas buffer drawing. |
| **PNG Blob Encoding & Download** | $120\text{ms}$ | $250\text{ms}$ | Asynchronous `canvas.toBlob()` execution. |

---

## 4. End-to-End Data Flow & State Lifecycle Pipeline

The system enforces a strict Unidirectional Data Flow (UDF) pipeline:

$$S_{\text{raw}} \xrightarrow{\text{validate}} S_{\text{valid}} \xrightarrow{\text{plan}} S_{\text{planned}} \xrightarrow{\text{tick}} S_{\text{active}} \xrightarrow{\text{render}} S_{\text{blob}}$$

```mermaid
sequenceDiagram
    autonumber
    actor User as Contestant / User
    participant View as UI View Layer
    participant Gemini as Gemini AI Gateway
    participant Guard as HistoryQuotaGuard
    participant Store as Application State Store
    participant Ticker as TimeEngine (RAF)
    participant Audio as AudioChimeService
    participant Haptic as HapticFeedbackService
    participant Canvas as Canvas 2D Engine

    User->>View: Enters Goal ("Google Internship Interview") & Date ("2026-12-20")
    View->>Guard: pushStateUpdate(#v1=serialized)
    Note over Guard: Debounces keystrokes (300ms window); protects Safari 100-call quota
    View->>View: Validate future date & sanitize string
    alt Online & Gemini API Key Available
        View->>Gemini: POST generateContent (Prompt + JSON Schema)
        Gemini-->>View: Returns 4 Milestones + Affirmation JSON
    else Offline or API Error
        View->>View: Invoke HeuristicGenerator (Temporal 4-quarter slice)
    end
    View->>Store: Dispatch HYDRATE_PLAN (Goal, Milestones, Affirmation)
    Store->>Ticker: Start Chronometer Loop
    loop Every Frame (16.6ms via RAF)
        Ticker->>Ticker: Compute delta = performance.now() - t_prev
        Ticker->>View: Emit TimeRemaining (Days, Hours, Minutes, Seconds)
    end
    alt Timer Expiration (Delta <= 0ms)
        Ticker->>Store: Dispatch GOAL_EXPIRED
        par Sensory Celebration
            Store->>Audio: playVictoryChime() (Major Chord C5-E5-G5-C6)
            Store->>Haptic: victoryPattern() ([100, 50, 100, 50, 250])
            Store->>View: Render Confetti & Victory Overlay
        end
    end
    User->>View: Toggles Lock Screen Safe-Zone Preview
    View->>View: Render iOS / Android Overlay Guides
    User->>View: Clicks "Download Wallpaper"
    View->>Canvas: Execute RenderPipeline(StateSnapshot, ThemeTokens)
    Canvas->>Canvas: Rasterize OLED BG, Safe Zones, Digits, Milestones at 2x
    Canvas->>Canvas: Downsample to 1170x2532
    Canvas-->>View: Return PNG Blob
    View-->>User: Trigger browser download ("countdown-lockscreen.png")
```

---

## 5. Architectural Quality Attributes & Compliance

### 5.1 Modularity & Clean Architecture Boundary Assertions
Dependencies follow strict inward-pointing Clean Architecture rules:
- `core/` contains pure TypeScript logic (`TimeEngine`, `MilestoneManager`) with zero dependencies on DOM or Canvas.
- `ai/` depends exclusively on data contracts defined in `core/types`.
- `canvas/` depends on mathematical geometry and theme configurations, completely decoupled from the DOM.
- `app.js` serves as the compositional root, wiring views, state stores, and rendering engines.

$$\text{Instability } I = \frac{C_e}{C_a + C_e} = \frac{0}{4 + 0} = 0.0 \quad (\text{Core Domain is Maximally Stable})$$

### 5.2 Fault Tolerance & Graceful Degradation
- **Network Failure Isolation:** If internet connectivity drops entirely, the application continues to run without interruption via Service Worker caching.
- **AI Outage Bulkhead:** If Google Gemini experiences high latency or rate limiting (HTTP 429), the heuristic engine instantly takes over, guaranteeing the user is never blocked from generating a wallpaper.
- **Display Resolution Independence:** The rendering engine automatically detects device pixel ratios ($\text{DPR}$) and dynamically adjusts canvas supersampling to guarantee crisp rendering regardless of device hardware.
