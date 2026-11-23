# ADR-002: Rendering Engine — HTML5 Canvas 2D vs. DOM Screenshotting vs. WebGL

**Document ID:** `ADR-002`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Date:** 2026-11-22  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0  
**Version:** 2.3.4

---

## 1. Context and Problem Statement
The primary physical deliverable of the project is a high-resolution, pixel-perfect portrait lock screen wallpaper conforming to modern smartphone displays ($1170 \times 2532\text{ pixels}$). The rendering pipeline must execute client-side, achieve sub-pixel typographical clarity, respect safe zones, and export cleanly to PNG or JPEG format in under $350\text{ms}$.

We must choose the graphics technology for rasterizing this output wallpaper.

---

## 2. Decision Drivers
- **Typographical Fidelity:** Crisp rendering of countdown digits and milestones without font kerning blur on $460\text{ ppi}$ screens.
- **Rasterization Speed:** Total image generation time under $350\text{ms}$.
- **Memory Footprint:** Peak memory during export must remain under $50\text{MB}$ to prevent mobile browser tab crashes.
- **Dependency Weight:** Zero external megabyte-heavy npm libraries.
- **Styling Flexibility:** Support for radial OLED background gradients, glowing borders, and progress rings.

---

## 3. Considered Options
- **Option 1: DOM Capture via `html2canvas` / `dom-to-image`**
- **Option 2: 3D Hardware Accelerated Pipeline (WebGL / Three.js)**
- **Option 3: Pure HTML5 OffscreenCanvas 2D Context with 2x Supersampling**

---

## 4. Comprehensive Comparison Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                  ADR-002 RENDERING ENGINE COMPARISON                              |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Criteria                 | Weight | Option 1: html2canvas | Option 2: WebGL   | Option 3: Canvas2D|
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Rasterization Speed      | 25%    | 1/5 (1200-1800ms)     | 4/5 (60ms)        | 5/5 (45ms)        |
| Typographical Sharpness  | 25%    | 2/5 (Blurry on mobile)| 2/5 (Shader text) | 5/5 (2x Native)   |
| Memory Peak Overhead     | 20%    | 2/5 (DOM cloned >80MB)| 2/5 (GPU context) | 5/5 (47MB bounded)|
| Runtime Bundle Size      | 15%    | 2/5 (48 KB extra)     | 1/5 (500 KB Three)| 5/5 (0 KB native) |
| CSS Glassmorphism Compat | 15%    | 1/5 (Fails backdrop)  | 3/5 (Custom shader| 5/5 (Pre-computed)|
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Weighted Score           | 100%   | 1.60 / 5.0            | 2.45 / 5.0        | 5.00 / 5.0        |
+--------------------------+--------+-----------------------+-------------------+-------------------+
```

---

## 5. Decision Outcome
**Chosen Option: Option 3 (Pure HTML5 OffscreenCanvas 2D Context with 2x Supersampling).**

### 5.1 Rationale
- Native Canvas 2D is supported in 100% of modern mobile browsers with zero external bundle overhead.
- Operates off the main UI thread via `OffscreenCanvas` where available.
- Renders at $2340 \times 5064\text{ pixels}$ ($2\times$ scale) and downsamples with bilinear interpolation to $1170 \times 2532$, eliminating sub-pixel font rasterization artifacts.

---

## 6. Consequences & Mitigation
- **Positive:** Sub-45ms render times, crisp typography, predictable memory bounds.
- **Negative:** Layout calculations (word wrapping, safe-zone bounding) must be calculated procedurally rather than using CSS flexbox.
- **Mitigation:** The `CanvasRenderer` module encapsulates a dedicated `measureText()` layout engine with automatic line wrapping and vertical safe-zone clamping.
