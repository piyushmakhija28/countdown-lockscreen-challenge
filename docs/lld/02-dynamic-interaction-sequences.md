# Level 4: Low-Level Design — Dynamic Interaction Sequences

**Document ID:** `DOC-LLD-02-DYNAMIC-SEQUENCES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Formal Dynamic Sequence Modeling)

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
