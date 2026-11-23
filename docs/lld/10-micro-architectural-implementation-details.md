# Level 4: Low-Level Design â€” Micro-Architectural Implementation Details & Edge-Case Hazards
### (Granular 40-Hazard Engineering Catalog across 14 Specialized Architectural Domains)

**Document ID:** `DOC-LLD-10-MICRO-IMPLEMENTATION-DETAILS`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Micro-Architectural Precision & Code-Level Robustness)

---

## 1. Executive Implementation Overview & Scope

To guarantee that the countdown lock screen web application executes flawlessly upon first compilation with **zero runtime exceptions, zero memory leaks, and 60 FPS animation stability**, this document details **40 micro-architectural implementation-level hazards and edge cases** across **14 specialized engineering categories**, providing exact code patterns, V8 engine optimizations, and browser API workarounds:

```
+---------------------------------------------------------------------------------------------------------------------+
|                                 40 MICRO-ARCHITECTURAL IMPLEMENTATION HAZARDS INDEX                                 |
+----+-----------------------------------------------------+-------------+----------------------------------------+
| #  | Engineering Category                                | Hazard Range| Core Micro-Architectural Focus         |
+----+-----------------------------------------------------+-------------+----------------------------------------+
| 1  | DOM, Canvas & Event-Loop Micro-Architecture         | LLD-EV 01â€“03| Passive touch stall, 300ms tap, cancel |
| 2  | Canvas 2D Rendering Context & Pixel Manipulation    | LLD-CV 01â€“04| RAII save/restore, clip bleed, metrics |
| 3  | Time & Chronometry Micro-Drift in JavaScript        | LLD-TM 01â€“03| Leap second NTP jump, underflow, LUT   |
| 4  | AI Client-Side Network & Token Resilience           | LLD-AI 01â€“02| Full jitter backoff 429, XML delimiter |
| 5  | Local Storage, PWA & Service Worker Micro-Bugs     | LLD-ST 01â€“03| Safari private probe, v1/v2 migration  |
| 6  | Audio / Visual Haptic Immersion Micro-Hazards       | LLD-AU 01/01| Headphone desync, High-DPI canvas CSS  |
| 7  | File System, Camera Roll & Export Mechanics         | LLD-FS 01â€“03| Safari blob download modal, leak, rot  |
| 8  | V8 Engine, JIT Compilation & Memory Layout Hazards  | LLD-V8 01â€“03| Hidden class transition, holes, slice  |
| 9  | CSS Layout Engines & Glassmorphism GPU Hazards      | LLD-CS 01â€“03| Layer explosion, hairline border, trap |
| 10 | Asynchronous Execution & Microtask Starvation       | LLD-AS 01â€“03| Microtask loop freeze, AbortError, race|
| 11 | Canvas 2D Path Construction & Coordinate Hazards    | LLD-CP 01â€“03| beginPath leak, zero vector, font loop |
| 12 | Mobile Clipboard, Share Sheet & PWA Sandboxing      | LLD-SH 01â€“03| Focus-less copy, share abort, PWA trap |
| 13 | Input Forms, Mobile Keyboards & State Sanitization  | LLD-IN 01â€“03| IME blur, zero-width strip, date min   |
| 14 | Audio Synthesizer & Web Audio Node Lifecycle        | LLD-AU 02â€“03| Disconnect onended, sample rate pitch  |
+----+-----------------------------------------------------+-------------+----------------------------------------+
```

---

## 2. Category A: DOM, Canvas & Event-Loop Micro-Architecture (LLD-EV 01â€“03)

### LLD-EV-01: Passive Touch Event Listener Stalls on Mobile Safari
- **Hazard Trigger:** WebKit treats `touchstart` and `touchmove` as `{ passive: true }` by default. Invoking `e.preventDefault()` inside interactive canvas slider handlers throws console violations (`[Violation] Added non-passive event listener`), causing touch gestures to scroll the webpage simultaneously.
- **Micro-Architectural Solution:** Explicit `{ passive: false }` listener registration combined with CSS touch containment:
  ```typescript
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  ```
  ```css
  .canvas-interactive-surface {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  ```

### LLD-EV-02: Double-Tap Zoom Delay & 300ms Click Latency on Mobile Viewports
- **Hazard Trigger:** Mobile browsers delay `click` events by $300\text{ms}$ waiting for potential double-taps, making button interactions feel sluggish.
- **Micro-Architectural Solution:** Meta tag viewport constraint + CSS `touch-action: manipulation`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  ```
  ```css
  button, input, select, .interactive-toggle {
    touch-action: manipulation;
  }
  ```

### LLD-EV-03: Unhandled Pointer Cancel on Native OS Gesture Interruption
- **Hazard Trigger:** Incoming phone calls, notifications, or iOS bottom home-bar swipes fire `pointercancel`. If code only listens to `pointerup`, the slider remains permanently stuck in dragging mode.
- **Micro-Architectural Solution:** Symmetrical pointer lifecycle binding:
  ```typescript
  const endInteraction = (e: PointerEvent) => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener('pointerup', endInteraction);
  canvas.addEventListener('pointercancel', endInteraction);
  ```

---

## 3. Category B: Canvas 2D Rendering Context & Pixel Manipulation (LLD-CV 01â€“04)

### LLD-CV-01: Canvas 2D State Stack Overflow (`ctx.save()` / `ctx.restore()` Desync)
- **Hazard Trigger:** Early returns or uncaught errors inside rendering functions skip `ctx.restore()`. Over multiple animation frames, the transformation matrix leaks and compounds ($S \to \infty$ or $S \to 0$), making the canvas vanish.
- **Micro-Architectural Solution:** Scoped RAII Context Helper:
  ```typescript
  export function withCanvasContext(ctx: CanvasRenderingContext2D, fn: (ctx: CanvasRenderingContext2D) => void): void {
    ctx.save();
    try {
      fn(ctx);
    } finally {
      ctx.restore();
    }
  }
  ```

### LLD-CV-02: Canvas Clip Region Bleed in Rounded Rectangles (`ctx.clip()` Antialiasing Frills)
- **Hazard Trigger:** Mobile GPU hardware clipping on Canvas 2D paths uses 1-bit binary stencil buffers without antialiasing, leaving jagged fringe artifacts along rounded card corners.
- **Micro-Architectural Solution:** Offscreen Antialiased Compositing:
  ```typescript
  offCtx.roundRect(0, 0, cardW, cardH, borderRadius);
  offCtx.fill();
  offCtx.globalCompositeOperation = 'source-in';
  offCtx.drawImage(contentCanvas, 0, 0);
  ctx.drawImage(offCanvas, x, y);
  ```

### LLD-CV-03: `ctx.measureText` Height Inaccuracy Across Browsers (`fontBoundingBox` vs `actualBoundingBox`)
- **Hazard Trigger:** `fontBoundingBoxAscent` is unsupported or returns `undefined` in older mobile browsers, yielding `NaN` in vertical text centering calculations.
- **Micro-Architectural Solution:** Safe Text Metric Polyfill:
  ```typescript
  export function getSafeTextHeight(metrics: TextMetrics, fontSizePx: number): number {
    if (typeof metrics.actualBoundingBoxAscent === 'number' && typeof metrics.actualBoundingBoxDescent === 'number') {
      return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }
    return fontSizePx * 1.2;
  }
  ```

### LLD-CV-04: OffscreenCanvas `transferToImageBitmap` Zero-Width Bug on Safari
- **Hazard Trigger:** Calling `transferToImageBitmap()` on an unpainted or zero-dimensioned `OffscreenCanvas` throws fatal `InvalidStateError` on iOS WebKit.
- **Micro-Architectural Solution:** Pre-transfer dimension assertion & clear pass:
  ```typescript
  if (offCanvas.width > 0 && offCanvas.height > 0) {
    const bitmap = offCanvas.transferToImageBitmap();
  }
  ```

---

## 4. Category C: Time & Chronometry Micro-Drift in JavaScript (LLD-TM 01â€“03)

### LLD-TM-01: Leap Second Smearing & NTP Wall-Clock Backward Jumps
- **Hazard Trigger:** Device Network Time Protocol (NTP) adjustments can set the system clock backward by $1000\text{ms}$, causing seconds to jump backward (`12 -> 13 -> 12`) on screen.
- **Micro-Architectural Solution:** Monotonic Clamped Elapsed Time Filter:
  ```typescript
  let lastReportedRemaining = Infinity;
  export function getMonotonicRemaining(targetEpoch: number): number {
    const raw = Math.max(0, targetEpoch - Date.now());
    const clamped = Math.min(raw, lastReportedRemaining);
    lastReportedRemaining = clamped;
    return clamped;
  }
  ```

### LLD-TM-02: Integer Division Underflow in Millisecond-to-Unit Conversions
- **Hazard Trigger:** When $\Delta t \in (0, 1000\text{ms})$, integer math `Math.floor(delta / 1000)` yields 0 seconds, prematurely firing celebration animations before the deadline arrives.
- **Micro-Architectural Solution:** Exact Zero Invariant: Celebration triggers if and only if $\Delta t \le 0\text{ms}$. Display shows `01` second remaining until exact millisecond completion.

### LLD-TM-03: Zero-Padded String Formatting Allocation Churn
- **Hazard Trigger:** `String(s).padStart(2, '0')` generates 240 string heap allocations per second, triggering Garbage Collection frame stutter.
- **Micro-Architectural Solution:** Static 100-Element Look-Up Table:
  ```typescript
  const TWO_DIGIT_LUT = Array.from({ length: 100 }, (_, i) => i < 10 ? '0' + i : String(i));
  export const pad2 = (n: number): string => (n >= 0 && n < 100 ? TWO_DIGIT_LUT[n] : String(n));
  ```

---

## 5. Category D: AI Client-Side Network & Token Resilience (LLD-AI 01â€“02)

### LLD-AI-01: Client-Side API Rate Limiting (HTTP 429) Jittered Exponential Backoff
- **Hazard Trigger:** Rapid retries on Gemini HTTP 429 exhaust project quotas and trigger extended IP lockouts.
- **Micro-Architectural Solution:** Full Jitter Exponential Backoff with fallback:
  $$T_{\text{sleep}} = \min(M_{\text{max}}, \text{Uniform}(0, \text{base} \cdot 2^{\text{attempt}}))$$
  Ceiling of 3 attempts with instant automatic fallback to the Heuristic Milestone Generator.

### LLD-AI-02: Gemini Prompt Special Character Collisions (`<`, `>`, `&`, `"`)
- **Hazard Trigger:** Goal titles containing XML/HTML tags (e.g. `Score >= 95% in Math & Stats`) break `<user_input>` boundary tags in system prompts.
- **Micro-Architectural Solution:** XML Entity Sanitizer:
  ```typescript
  export function escapeXmlEntities(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  ```

---

## 6. Category E: Local Storage, PWA & Service Worker Micro-Bugs (LLD-ST 01â€“03)

### LLD-ST-01: Safari Private Browsing / Incognito Quota Quirk
- **Hazard Trigger:** On older iOS Safari Private Browsing, `localStorage.setItem()` throws `QuotaExceededError` on the very first byte written.
- **Micro-Architectural Solution:** Feature probe with seamless memory fallback:
  ```typescript
  export function isStorageAvailable(): boolean {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch {
      return false;
    }
  }
  ```

### LLD-ST-02: JSON Schema Evolution & Backward Compatibility Versioning
- **Hazard Trigger:** Users opening bookmarked `#v1=` URL hashes on updated `#v2=` clients crash with `TypeError: Cannot read properties of undefined`.
- **Micro-Architectural Solution:** Forward State Migration Pipeline (`StateMigrator.migrate(payload)`).

### LLD-ST-03: PWA Service Worker Byte-to-Byte Update Check Glitch
- **Hazard Trigger:** HTTP cache headers on `sw.js` prevent clients from checking for PWA script updates.
- **Micro-Architectural Solution:** Host configuration enforcing `Cache-Control: no-cache, no-store, must-revalidate` for `sw.js`.

---

## 7. Category F: Audio / Visual Haptic Immersion Micro-Hazards (LLD-AU 01, LLD-UI 01)

### LLD-AU-01: Web Audio AudioContext State Desync on Headphone Plug/Unplug
- **Hazard Trigger:** Switching between Bluetooth AirPods and device speakers shifts audio routing, putting `AudioContext` into `interrupted` state.
- **Micro-Architectural Solution:** AudioContext state watcher:
  ```typescript
  ctx.onstatechange = () => {
    if (ctx.state === 'interrupted' || ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  ```

### LLD-UI-01: High-DPI Canvas CSS Sizing Mismatch (The "Blurry Canvas" Bug)
- **Hazard Trigger:** Setting `canvas.width = 1170 * 2` without setting `canvas.style.width = '390px'` scales the canvas $6\times$, causing visual blur and overflow.
- **Micro-Architectural Solution:** Atomic dimension synchronization:
  ```typescript
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ```

---

## 8. Category G: File System, Camera Roll & Export Mechanics (LLD-FS 01â€“03)

### LLD-FS-01: Safari Download Attribute Ignored on Blob URLs
- **Hazard Trigger:** Mobile Safari ignores `<a download>` on Blob URLs in standalone PWA mode, opening a blank tab.
- **Micro-Architectural Solution:** Web Share API primary pathway with "Press & Hold Image to Save" visual fallback modal.

### LLD-FS-02: Canvas Memory Leak via Circular Object URL References
- **Hazard Trigger:** Calling `URL.createObjectURL(blob)` repeatedly without revoking unreferenced blobs leaks memory across exports.
- **Micro-Architectural Solution:** Single-slot URL manager revoking previous handles before allocation:
  ```typescript
  let activeUrl: string | null = null;
  export function createTrackedBlobUrl(blob: Blob): string {
    if (activeUrl) URL.revokeObjectURL(activeUrl);
    activeUrl = URL.createObjectURL(blob);
    return activeUrl;
  }
  ```

### LLD-UX-01: Dynamic Island / Punch-Hole Safe Zone Clipping during Phone Rotation
- **Hazard Trigger:** Rotating tablet/foldable viewports from landscape to portrait fails to recompute notch coordinates.
- **Micro-Architectural Solution:** Viewport orientation listener triggering recalculation of safe-zone bounding boxes.

---

## 9. Category H: V8 Engine, JIT Compilation & Memory Layout Hazards (LLD-V8 01â€“03)

### LLD-V8-01: Hidden Class (Shape) Transitions & De-optimization in State Structs
- **Hazard Trigger:** Adding properties dynamically in varying orders triggers V8 shape transitions into megamorphic dictionary mode ($5\times$ slower execution).
- **Micro-Architectural Solution:** Monomorphic Class Invariant initializing all properties in identical order in constructor.

### LLD-V8-02: Array Hole De-optimization in Milestone Lists
- **Hazard Trigger:** Using `delete array[i]` or sparse assignments converts V8 arrays to slow HOLEY_ELEMENTS mode.
- **Micro-Architectural Solution:** Contiguous array operations using `splice()` and immutable slice filtering.

### LLD-V8-03: Large TypedArray Memory Retainment via Small Sub-Array Slices
- **Hazard Trigger:** `buffer.subarray()` retains the entire 47MB parent `ArrayBuffer` in heap memory.
- **Micro-Architectural Solution:** Explicit detachment via `new Uint8Array(subSlice)` or `ArrayBuffer.prototype.slice()`.

---

## 10. Category I: CSS Layout Engines, Composite Layers & Glassmorphism GPU Hazards (LLD-CS 01â€“03)

### LLD-CS-01: GPU Layer Explosion via Excessive `backdrop-filter: blur()` Elements
- **Hazard Trigger:** Stacking individual blur filters on 10 milestone items forces 10 separate GPU texture readbacks (>150MB GPU RAM).
- **Micro-Architectural Solution:** Single Consolidated Frosted Glass Layer on parent container card.

### LLD-CS-02: Sub-Pixel Border Bleed on Retina / High-DPI Displays
- **Hazard Trigger:** 1px borders render 3px thick on 3x DPR; 0.5px borders are invisible on older Androids.
- **Micro-Architectural Solution:** Hairline formula: `border-width: max(0.5px, 1px / window.devicePixelRatio)`.

### LLD-CS-03: Stacking Context Trapping with `mix-blend-mode` & `transform`
- **Hazard Trigger:** `transform: translate3d()` creates a stacking context trapping child blend modes against dark gray backgrounds.
- **Micro-Architectural Solution:** Geometric positioning isolation separating transform wrappers from blend mode layers.

---

## 11. Category J: Asynchronous Execution, Promises & Microtask Starvation (LLD-AS 01â€“03)

### LLD-AS-01: Microtask Starvation in Recursive Promise Loops
- **Hazard Trigger:** Chaining resolved promises recursively starves the browser UI rendering queue, completely freezing the page.
- **Micro-Architectural Solution:** Strict scheduling separation: rendering scheduled strictly on `requestAnimationFrame`, compute on `requestIdleCallback`.

### LLD-AS-02: Unhandled Promise Rejection on Aborted Fetch Requests
- **Hazard Trigger:** `AbortController.abort()` throws `DOMException: AbortError`, logging false errors to telemetry.
- **Micro-Architectural Solution:** Silent filter ignoring `error.name === 'AbortError'`.

### LLD-AS-03: Race Condition in Async Image Loading for User Background Uploads
- **Hazard Trigger:** Slower initial photo uploads overwrite faster subsequent uploads.
- **Micro-Architectural Solution:** Monotonic upload sequence tokens (`activeUploadId`).

---

## 12. Category K: Canvas 2D Path Construction, Transform & Coordinate Hazards (LLD-CP 01â€“03)

### LLD-CP-01: Canvas Path Accumulation Memory Leak (`beginPath()` Omission)
- **Hazard Trigger:** Forgetting `ctx.beginPath()` retains all previous vector path commands, causing exponential draw slowdown.
- **Micro-Architectural Solution:** Mandatory `ctx.beginPath()` at the start of every draw helper function.

### LLD-CP-02: Zero-Length Vector Normalization Division-by-Zero in Parallax Motion
- **Hazard Trigger:** Still touch gestures produce zero velocity ($\|\mathbf{v}\| = 0$), dividing by zero and yielding `NaN` canvas coordinates.
- **Micro-Architectural Solution:** Epsilon guarded normalization: $\hat{\mathbf{v}} = \mathbf{v} / \max(\|\mathbf{v}\|, 10^{-6})$.

### LLD-CP-03: Font Size Shrink-to-Fit Infinite Loop in Long Titles
- **Hazard Trigger:** Unbroken long strings cause decrementing font size loops to loop infinitely or hit negative values.
- **Micro-Architectural Solution:** Hard minimum font size floor ($14\text{px}$) with binary-search word truncation ellipsis.

---

## 13. Category L: Mobile Clipboard, Share Sheet & PWA Sandboxing (LLD-SH 01â€“03)

### LLD-SH-01: Clipboard API Security Error on Unfocused Windows
- **Hazard Trigger:** `navigator.clipboard.writeText()` throws `NotAllowedError` if the window loses focus during tap.
- **Micro-Architectural Solution:** Dual-path clipboard copy falling back to legacy textarea `execCommand('copy')`.

### LLD-SH-02: Web Share API Rejection on User Dismissal
- **Hazard Trigger:** User swiping down share sheet rejects promise with `AbortError`.
- **Micro-Architectural Solution:** Clean user-dismissal silence ignoring `AbortError`.

### LLD-SH-03: PWA iOS Standalone Full-Screen Navigation Trapping
- **Hazard Trigger:** External documentation links hijack standalone PWA windows without browser back buttons.
- **Micro-Architectural Solution:** Enforce `target="_blank"` and `rel="noopener noreferrer"` on all outbound links.

---

## 14. Category M: Input Forms, Mobile Keyboards & State Sanitization (LLD-IN 01â€“03)

### LLD-IN-01: Mobile Virtual Keyboard "Next / Done" IME Action Handling
- **Hazard Trigger:** Pressing Done leaves the virtual keyboard obscuring 40% of the viewport.
- **Micro-Architectural Solution:** Enter key listener calling `input.blur()` to dismiss the keyboard immediately.

### LLD-IN-02: Unicode Zero-Width Characters & Homoglyph Spoofing in Goal Names
- **Hazard Trigger:** Pasted zero-width spaces (`\u200B`) and invisible characters break string operations and layouts.
- **Micro-Architectural Solution:** Unicode NFKC normalization and regex zero-width character stripping:
  ```typescript
  export function sanitizeTitle(raw: string): string {
    return raw.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  }
  ```

### LLD-IN-03: Mobile DateTime Picker Native Support & Min/Max Constraints
- **Hazard Trigger:** Native datetime pickers allow selecting dates in the past.
- **Micro-Architectural Solution:** Dynamic min attribute anchor bound to current timestamp plus 1 hour.

---

## 15. Category N: Audio Synthesizer & Web Audio Node Lifecycle (LLD-AU 02â€“03)

### LLD-AU-02: Uncollected Web Audio Nodes Memory Leak
- **Hazard Trigger:** Chime oscillators and gain nodes leak in memory if not explicitly disconnected after stopping.
- **Micro-Architectural Solution:** Mandatory node teardown on playback completion:
  ```typescript
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  ```

### LLD-AU-03: AudioContext Sample Rate Mismatch Distortions
- **Hazard Trigger:** 44.1kHz buffers play with chipmunk pitch distortion on 48kHz Bluetooth outputs.
- **Micro-Architectural Solution:** Parametric synthesis utilizing dynamic `ctx.sampleRate`.

---

## 16. Complete 40-Hazard Resolution Verification Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                      40-HAZARD RESOLUTION VERIFICATION MATRIX                                 |
+---+-----------------------------+-----------------------------------+-----------------------------------------+
| # | Hazard Identifier           | Architectural Resolution Policy   | Target Verification Spec                |
+---+-----------------------------+-----------------------------------+-----------------------------------------+
| 01| **LLD-EV-01: Passive Touch**| { passive: false } + touch-action | `app.js` & `tokens.css`                 |
| 02| **LLD-EV-02: 300ms Delay**  | touch-action: manipulation        | `tokens.css` & `index.html`             |
| 03| **LLD-EV-03: Pointer Cancel| Unified pointerup/cancel listener | `app.js` & `CanvasRenderer.ts`          |
| 04| **LLD-CV-01: Save/Restore** | withCanvasContext() RAII helper   | `CanvasRenderer.ts` & `TC-POS-83`       |
| 05| **LLD-CV-02: Clip Bleed**   | Offscreen destination-in composite| `CanvasRenderer.ts` & `TC-POS-84`       |
| 06| **LLD-CV-03: Text Metrics** | Safe actualBoundingBox fallback   | `CanvasRenderer.ts` & `TC-POS-85`       |
| 07| **LLD-CV-04: Safari Bitmap**| Pre-transfer dimension assertion  | `CanvasRenderer.ts` & `TC-POS-86`       |
| 08| **LLD-TM-01: Leap Seconds** | Monotonic clamped elapsed filter  | `TimeEngine.ts` & `TC-EDGE-25`          |
| 09| **LLD-TM-02: Millis Under** | Celebration strict delta <= 0     | `TimeEngine.ts` & `TC-EDGE-26`          |
| 10| **LLD-TM-03: String Churn** | Static 100-element TWO_DIGIT_LUT  | `TimeEngine.ts` & `TC-POS-87`           |
| 11| **LLD-AI-01: HTTP 429 Jitter| Full Jitter Exponential Backoff   | `GeminiClient.ts` & `TC-POS-88`         |
| 12| **LLD-AI-02: XML Escaping** | escapeXmlEntities() pre-prompt    | `GeminiClient.ts` & `TC-NEG-14`         |
| 13| **LLD-ST-01: Safari Incog** | isStorageAvailable() startup probe| `PersistenceManager.ts` & `TC-NEG-15`   |
| 14| **LLD-ST-02: Schema Drift** | StateMigrator forward versioning  | `UrlStateService.ts` & `TC-POS-89`      |
| 15| **LLD-ST-03: SW HTTP Cache**| Cache-Control: no-cache headers   | `sw.js` & `devops/03`                   |
| 16| **LLD-AU-01: Audio Desync** | onstatechange auto-resume handler | `SyntheticHaptic.ts` & `TC-POS-90`      |
| 17| **LLD-UI-01: DPI CSS Blur** | Synchronized width/style.width    | `CanvasRenderer.ts` & `TC-POS-91`       |
| 18| **LLD-FS-01: Safari Download| Web Share API + fallback modal    | `CanvasRenderer.ts` & `TC-POS-92`       |
| 19| **LLD-FS-02: URL Object Leak| Single-slot tracked blob URL mgr   | `CanvasRenderer.ts` & `TC-POS-93`       |
| 20| **LLD-UX-01: Notch Rotation| Orientation change recalculation  | `SafeZoneOverlay.ts` & `TC-POS-94`      |
| 21| **LLD-V8-01: Hidden Shapes**| Monomorphic constructor property  | `TimeEngine.ts` & `TC-POS-95`           |
| 22| **LLD-V8-02: Array Holes**  | Packed splice() / slice() invariant| `MilestoneManager.ts` & `TC-POS-96`    |
| 23| **LLD-V8-03: Buffer Retain**| Explicit detachment via new Uint8A | `CanvasRenderer.ts` & `TC-POS-97`       |
| 24| **LLD-CS-01: GPU Layer Expl| Single consolidated parent blur   | `glassmorphism.css` & `TC-POS-98`       |
| 25| **LLD-CS-02: Hairline Border| max(0.5px, 1px/dpr) calculation  | `tokens.css` & `TC-POS-99`              |
| 26| **LLD-CS-03: Blend Stacking| Stacking context DOM separation   | `glassmorphism.css` & `TC-POS-100`      |
| 27| **LLD-AS-01: Microtask Freez| RAF for render, RIC for compute   | `app.js` & `TC-POS-101`                 |
| 28| **LLD-AS-02: Abort Silence**| Filter error.name === 'AbortError'| `GeminiClient.ts` & `TC-POS-102`        |
| 29| **LLD-AS-03: Upload Race**  | Monotonic activeUploadId sequence | `app.js` & `TC-POS-103`                 |
| 30| **LLD-CP-01: beginPath Leak| Mandatory beginPath() at draw start| `CanvasRenderer.ts` & `TC-POS-104`     |
| 31| **LLD-CP-02: Zero Vector NaN| Epsilon guarded vector normalizat | `CanvasRenderer.ts` & `TC-POS-105`      |
| 32| **LLD-CP-03: Font Fit Loop**| Min font floor + word truncation  | `CanvasRenderer.ts` & `TC-POS-106`      |
| 33| **LLD-SH-01: Unfocused Copy| Dual clipboard with textarea fallb| `app.js` & `TC-POS-107`                 |
| 34| **LLD-SH-02: Share Dismiss**| Silence AbortError on share cancel| `app.js` & `TC-POS-108`                 |
| 35| **LLD-SH-03: PWA Trap Nav** | target=_blank + rel=noopener      | `index.html` & `TC-POS-109`             |
| 36| **LLD-IN-01: Virtual Keybd**| Enter key listener input.blur()   | `app.js` & `TC-POS-110`                 |
| 37| **LLD-IN-02: Zero-Width Str| Unicode NFKC + regex strip        | `UrlStateService.ts` & `TC-POS-111`     |
| 38| **LLD-IN-03: Datetime Min** | Dynamic min ISO anchor attribute  | `app.js` & `TC-POS-112`                 |
| 39| **LLD-AU-02: Audio Node Leak| Mandatory onended disconnect()    | `SyntheticHaptic.ts` & `TC-POS-113`     |
| 40| **LLD-AU-03: Sample Rate Dis| Parametric realtime synthesis     | `SyntheticHaptic.ts` & `TC-POS-114`     |
+---+-----------------------------+-----------------------------------+-----------------------------------------+
```
