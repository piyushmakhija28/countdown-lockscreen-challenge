# Level 4: Low-Level Design — State Machine & Lifecycle Specification

**Document ID:** `DOC-LLD-03-STATE-MACHINE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Formal Finite State Machine)  
**Version:** 2.3.1

---

## 1. Formal FSM Mathematical Definition

The core application lifecycle is modeled as a deterministic **Finite State Machine (FSM)**:

$$M = (S, \Sigma, \delta, s_0, F)$$

Where:
- $S = \{\text{UNINITIALIZED}, \text{IDLE}, \text{CONFIGURING\_INPUT}, \text{GENERATING\_AI}, \text{DEGRADED\_HEURISTIC}, \text{PREVIEWING\_SIMULATOR}, \text{RASTERIZING\_CANVAS}, \text{EXPORTED}, \text{CELEBRATING\_EXPIRED}, \text{SHARE\_MODAL\_ACTIVE}, \text{ERROR}\}$
- $\Sigma$ is the set of user, timer, and system events.
- $\delta: S \times \Sigma \to S$ is the state transition function.
- $s_0 = \text{UNINITIALIZED}$ is the initial state.
- $F = \{\text{EXPORTED}, \text{CELEBRATING\_EXPIRED}, \text{IDLE}\}$ is the set of quiescent states.

---

## 2. State Transition Table

```
+-------------------------------------------------------------------------------------------------------------------+
|                                              STATE TRANSITION MATRIX                                              |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
| Current State         | Ingress Event            | Next State            | Transition Side-Effect                 |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
| `UNINITIALIZED`       | `APP_MOUNT`              | `IDLE`                | Parse URL hash, start Ticker           |
| `IDLE`                | `INPUT_FOCUS`            | `CONFIGURING_INPUT`   | Show soft keyboard, arm history guard  |
| `CONFIGURING_INPUT`   | `INPUT_BLUR`             | `IDLE`                | Flush pending URL hash to history      |
| `IDLE`                | `CLICK_DECOMPOSE_AI`     | `GENERATING_AI`       | Set loading spinner, call API          |
| `GENERATING_AI`       | `API_SUCCESS`            | `IDLE`                | Populate 3-5 milestones                |
| `GENERATING_AI`       | `API_TIMEOUT_OR_ERROR`   | `DEGRADED_HEURISTIC`  | Trigger HeuristicGenerator             |
| `DEGRADED_HEURISTIC`  | `FALLBACK_COMPLETE`      | `IDLE`                | Render 4-quarter milestones            |
| `IDLE`                | `TOGGLE_OVERLAY`         | `PREVIEWING_SIMULATOR`| Render iOS/Android SVG guides          |
| `PREVIEWING_SIMULATOR`| `TOGGLE_OVERLAY`         | `IDLE`                | Remove safe-zone guides                |
| `IDLE`                | `CLICK_DOWNLOAD`         | `RASTERIZING_CANVAS`  | Allocate 2x OffscreenCanvas            |
| `RASTERIZING_CANVAS`  | `RASTER_SUCCESS`         | `EXPORTED`            | Generate PNG Blob & trigger share/save |
| `EXPORTED`            | `SHARE_FALLBACK`         | `SHARE_MODAL_ACTIVE`  | Open "Press & Hold to Save" modal      |
| `SHARE_MODAL_ACTIVE`  | `CLOSE_MODAL`            | `IDLE`                | Dismiss modal, revoke Blob URL         |
| `EXPORTED`            | `DISPOSE_BUFFER`         | `IDLE`                | Free GPU memory, URL.revoke            |
| `IDLE`                | `TIMER_ZERO`             | `CELEBRATING_EXPIRED` | Play Web Audio chime, haptics, confetti|
| `CELEBRATING_EXPIRED` | `REPLAY_CELEBRATION`     | `CELEBRATING_EXPIRED` | Re-trigger audio chime & particles     |
| `CELEBRATING_EXPIRED` | `RESET_GOAL`             | `IDLE`                | Clear countdown, reset input fields    |
| Any State             | `CRITICAL_EXCEPTION`     | `ERROR`               | Show error toast & recovery            |
| `ERROR`               | `USER_CORRECTS_INPUT`    | `IDLE`                | Reset error state, revalidate fields   |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
```

---

## 3. Mermaid State Diagram

```mermaid
stateDiagram-v2
    [*] --> UNINITIALIZED
    UNINITIALIZED --> IDLE : APP_MOUNT (Hydrate State)

    IDLE --> CONFIGURING_INPUT : INPUT_FOCUS
    CONFIGURING_INPUT --> IDLE : INPUT_BLUR (Flush Hash)

    IDLE --> GENERATING_AI : CLICK_DECOMPOSE (Gemini Call)
    GENERATING_AI --> IDLE : API_SUCCESS (Milestones Loaded)
    GENERATING_AI --> DEGRADED_HEURISTIC : API_ERROR / TIMEOUT
    DEGRADED_HEURISTIC --> IDLE : FALLBACK_APPLIED (4 Equidistant Sprints)

    IDLE --> PREVIEWING_SIMULATOR : TOGGLE_OVERLAY
    PREVIEWING_SIMULATOR --> IDLE : TOGGLE_OVERLAY

    IDLE --> RASTERIZING_CANVAS : CLICK_DOWNLOAD
    RASTERIZING_CANVAS --> EXPORTED : RASTER_COMPLETE (Blob Created)
    EXPORTED --> SHARE_MODAL_ACTIVE : SHARE_FALLBACK (iOS PWA)
    SHARE_MODAL_ACTIVE --> IDLE : CLOSE_MODAL
    EXPORTED --> IDLE : DISPOSE_BUFFER (Deallocate GPU)

    IDLE --> CELEBRATING_EXPIRED : TIMER_ZERO (Delta <= 0ms)
    CELEBRATING_EXPIRED --> CELEBRATING_EXPIRED : REPLAY_CELEBRATION
    CELEBRATING_EXPIRED --> IDLE : RESET_GOAL

    IDLE --> ERROR : INVALID_DATE_INPUT
    ERROR --> IDLE : USER_CORRECTS_INPUT
```

---

## 4. Web Audio 4-State Lifecycle FSM

To guarantee reliable in-browser procedural audio synthesis without unhandled promise rejections on mobile WebKit and Blink, `AudioChimeService` is modeled as a 4-state sub-lifecycle FSM:

```mermaid
stateDiagram-v2
    [*] --> LOCKED : CONTEXT_INITIALIZED
    
    LOCKED --> UNLOCKED : USER_GESTURE_PRIMING (First Touch / Click)
    LOCKED --> DEGRADED : AUTOPLAY_REJECTED / POLICY_RESTRICTION
    
    UNLOCKED --> INTERRUPTED : OS_BACKGROUND / PHONE_CALL (state: suspended)
    INTERRUPTED --> UNLOCKED : OS_FOREGROUND (document.visibilityState: visible)
    
    UNLOCKED --> DEGRADED : HARDWARE_FAILURE / OUTPUT_REVOKED
    DEGRADED --> UNLOCKED : RE_ACQUIRE_CONTEXT (Manual User Action)
```

```
+-------------------------------------------------------------------------------------------------------------------+
|                                            WEB AUDIO 4-STATE TRANSITION TABLE                                     |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
| Current State         | Event                    | Next State            | Behavior / Action                      |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
| `LOCKED`              | `USER_TOUCH_OR_CLICK`    | `UNLOCKED`            | Play 1-sample silent PCM buffer        |
| `LOCKED`              | `AUTOPLAY_PROMISE_REJECT`| `DEGRADED`            | Fallback to Haptic vibration & toast   |
| `UNLOCKED`            | `VISIBILITY_HIDDEN`      | `INTERRUPTED`         | Suspend AudioContext to conserve power |
| `INTERRUPTED`         | `VISIBILITY_VISIBLE`     | `UNLOCKED`            | Resume AudioContext                    |
| `UNLOCKED`            | `DEVICE_DISCONNECTED`    | `DEGRADED`            | Fallback to visual feedback            |
| `DEGRADED`            | `USER_RETRY`             | `UNLOCKED`            | Instantiate new AudioContext instance  |
+-----------------------+--------------------------+-----------------------+----------------------------------------+
```

---

## 5. Responsive Layout Tri-Modal Regime FSM

`ResponsiveLayoutEngine` evaluates the viewport aspect ratio $\mathcal{R} = \frac{W}{H}$ and transitions through three deterministic geometric regimes:

```mermaid
stateDiagram-v2
    [*] --> EVALUATE_VIEWPORT
    
    EVALUATE_VIEWPORT --> ULTRA_TALL : Ratio >= 2.15 (Xperia, Fold Outer)
    EVALUATE_VIEWPORT --> STANDARD_PORTRAIT : 1.70 <= Ratio < 2.15 (iPhone, Pixel)
    EVALUATE_VIEWPORT --> WIDE_FOLDABLE : Ratio < 1.70 (iPad, Fold Inner, Desktop)
    
    ULTRA_TALL --> STANDARD_PORTRAIT : VIEWPORT_RESIZE
    ULTRA_TALL --> WIDE_FOLDABLE : ORIENTATION_CHANGE
    
    STANDARD_PORTRAIT --> ULTRA_TALL : VIEWPORT_RESIZE
    STANDARD_PORTRAIT --> WIDE_FOLDABLE : ORIENTATION_CHANGE
    
    WIDE_FOLDABLE --> STANDARD_PORTRAIT : ORIENTATION_CHANGE
    WIDE_FOLDABLE --> ULTRA_TALL : VIEWPORT_RESIZE
```

```
+-------------------------------------------------------------------------------------------------------------------+
|                                          TRI-MODAL LAYOUT REGIME SPECIFICATION                                    |
+---------------------+-------------------+-----------------------------------+-------------------------------------+
| Layout Regime       | Aspect Ratio      | Layout Geometry                   | Progress Ring Bound                 |
+---------------------+-------------------+-----------------------------------+-------------------------------------+
| `ULTRA_TALL`        | $\mathcal{R} \ge 2.15$ | Single-column, expanded milestones| $r_{\text{ring}} \le 220\text{px}$  |
| `STANDARD_PORTRAIT` | $1.70 \le \mathcal{R} < 2.15$ | Standard single-column hero stack  | $r_{\text{ring}} \le 200\text{px}$  |
| `WIDE_FOLDABLE`     | $\mathcal{R} < 1.70$ | Split dual-column (Hero / Sprints)| $r_{\text{ring}} \le 180\text{px}$  |
+---------------------+-------------------+-----------------------------------+-------------------------------------+
```

---

## 6. Mobile OS Lifecycle & Visibility Synchronization

When the host mobile device locks, sleeps, or switches apps, the timer ticker switches execution tiers to eliminate battery drain while guaranteeing zero cumulative clock drift:

```mermaid
stateDiagram-v2
    [*] --> FOREGROUND_ACTIVE
    
    FOREGROUND_ACTIVE --> BACKGROUND_SUSPENDED : pagehide / visibilitychange: hidden
    BACKGROUND_SUSPENDED --> FOREGROUND_ACTIVE : pageshow / visibilitychange: visible (Drift Catch-Up)
    
    BACKGROUND_SUSPENDED --> WORKER_TICKING : Service Worker / Timer Fallback
    WORKER_TICKING --> FOREGROUND_ACTIVE : RESUME_UI
```



---

## 7. Multi-Tab Synchronization & Victory Alarm Mutex FSM

```mermaid
stateDiagram-v2
    [*] --> UNLOCKED_LEADER : BOOT_INITIALIZED (First Tab)
    UNLOCKED_LEADER --> BROADCASTING : USER_MUTATION_DISPATCHED
    BROADCASTING --> UNLOCKED_LEADER : BROADCAST_CONFIRMED
    
    [*] --> LISTENING_SLAVE : BOOT_SECONDARY_TAB
    LISTENING_SLAVE --> INGESTING_EXTERNAL : SYNC_MESSAGE_RECEIVED
    INGESTING_EXTERNAL --> LISTENING_SLAVE : STATE_REDUCED (meta.isExternalSync=true)

    state VictoryAlarmArbitration {
        [*] --> CONCURRENT_EXPIRED : DELTA_ZERO_REACHED
        CONCURRENT_EXPIRED --> ATTEMPTING_MUTEX : navigator.locks.request({ ifAvailable: true })
        ATTEMPTING_MUTEX --> PLAYING_CHIME : LOCK_GRANTED (Winner Tab)
        ATTEMPTING_MUTEX --> SUPPRESSED_CHIME : LOCK_DENIED (Sibling Tab)
        PLAYING_CHIME --> [*] : AUDIO_COMPLETED (2500ms)
        SUPPRESSED_CHIME --> [*] : SILENT_FALLBACK
    }
```

---

## 4. Subsystem Finite State Machines

### 4.1 `FontReadinessFSM` (FOIT Barrier Gate)

```mermaid
stateDiagram-v2
    [*] --> UNLOADED
    UNLOADED --> PRELOADING : LOAD_FONTS (Inter, JetBrains Mono)
    PRELOADING --> READY : FONTS_RESOLVED (Elapsed < 150ms)
    PRELOADING --> TIMEOUT_FALLBACK : TIMER_EXPIRED (Elapsed >= 150ms)
    TIMEOUT_FALLBACK --> READY : SYSTEM_FONTS_MOUNTED
    READY --> [*]
```

### 4.2 `CanvasWallpaperFSM` (9-Stage Pipeline)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> ALLOCATING_BUFFER : CLICK_EXPORT
    ALLOCATING_BUFFER --> SAMPLING_SCRIM : BUFFER_READY (Scale Clamped)
    SAMPLING_SCRIM --> RENDERING_9_STAGES : SCRIM_COMPUTED (Y > 0.35)
    RENDERING_9_STAGES --> BLOB_GENERATED : CANVAS_TO_BLOB
    BLOB_GENERATED --> DOWNLOADED_OR_SHARED : FILE_SAVED / WEB_SHARE
    DOWNLOADED_OR_SHARED --> IDLE : DISPOSE_BUFFER (0x0 Collapsed)
```

### 4.3 `VictorySensoryFSM` (Tri-Modal Synchronization)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> ACQUIRING_LOCK : TIMER_ZERO
    ACQUIRING_LOCK --> TRIGGERING_TRIMODAL : LOCK_GRANTED (Web Locks API)
    ACQUIRING_LOCK --> IDLE : LOCK_CONTENTION_MUTED (Sibling Tab)
    TRIGGERING_TRIMODAL --> COOLDOWN : SYNTH_COMPLETE (< 20ms Jitter)
    COOLDOWN --> IDLE : RESET_GOAL
```
