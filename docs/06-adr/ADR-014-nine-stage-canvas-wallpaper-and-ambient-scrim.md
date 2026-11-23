# ADR-014: Nine-Stage Offscreen Canvas Wallpaper Composition & Dynamic Ambient Scrim Adaptation

**Document ID:** `ADR-014`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Date:** 2026-11-23  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0  
**Version:** 2.3.4  

---

## 1. Context and Problem Statement
The countdown lock screen application must export high-resolution wallpapers tailored to flagship smartphone displays (e.g., iPhone 16 Pro Max $1320 \times 2868$, Samsung Galaxy S24 Ultra $1440 \times 3120$). 

Two primary failure modes exist in naive implementations:
1. **WebKit GPU Memory Ceiling Crashes:** Mobile Safari crashes when allocating canvas buffers exceeding $16.7\text{M}$ pixels or $4096\text{px}$ edge dimensions.
2. **Solar Washout & Background Collisions:** When users apply custom photographic wallpapers with light or heterogeneous regions, light-cyan or white lock screen text becomes completely unreadable under direct outdoor sunlight ($100,000\text{ lux}$), failing WCAG AAA ($CR < 3:1$).

We must decide on a deterministic rasterization pipeline and contrast normalization strategy.

---

## 2. Decision Drivers
- Pixel-perfect, high-DPI output across multiple flagship mobile aspect ratios (19.5:9, 20:9, 1:1 foldables).
- Absolute protection against iOS WebKit GPU texture allocation crashes.
- Guaranteed outdoor legibility conforming to Accessible Perceptual Contrast Algorithm (APCA $L^c \ge 75$).
- Strict adherence to hardware safe zones (upper 28% clock exclusion, lower 18% gesture exclusion).

---

## 3. Considered Options
- **Option 1:** Client-side HTML DOM-to-Canvas capture (`html2canvas` / SVG foreignObject).
- **Option 2:** Static un-adapted Canvas 2D rasterization with fixed coordinates.
- **Option 3:** Dedicated 9-stage offscreen Canvas 2D pipeline with `AdaptiveBufferAllocator` dual-constraint solver and Dynamic Ambient Scrim relative luminance sampling.

---

## 4. Decision Outcome
**Chosen Option:** **Option 3: Dedicated 9-Stage Offscreen Canvas 2D Pipeline with AdaptiveBufferAllocator and Dynamic Ambient Scrim.**

### Architectural Implementation:
1. **Dual-Constraint Safe Buffer Solver:**
   $$S = \min\left( 2.0, \; \sqrt{\frac{16,777,216}{W \cdot H}}, \; \frac{4096}{\max(W, H)} \right)$$
2. **9-Stage Deterministic Rasterization:**
   - Buffer & Context Initialization -> Base & Bayer Dither -> Safe-Zone Clipping -> Ambient Radial Glow -> Specular Chronometer Arc -> Tabular Numerals -> Milestone Ladder -> Motivational Block -> Specular Glass Borders & Blob Output.
3. **Dynamic Ambient Scrim & Luminance Normalization:**
   The canvas engine samples $K = 256$ pixels in the information zone $[0.28H, 0.82H]$. If mean observed luminance $\bar{Y}_{\text{bg}} > 0.35$, it automatically composites an adaptive gradient scrim ($\alpha = 0.45\text{--}0.75$), guaranteeing APCA $L^c \ge 75$ under solar wash.
4. **Subpixel Hairline Snapping:**
   All 1px strokes snap to half-pixel coordinates: $x_{\text{stroke}} = \lfloor x \rfloor + 0.5$.

### Positive Consequences:
- Zero crashes on memory-constrained iOS Safari devices.
- Unconditional outdoor legibility regardless of user wallpaper brightness.
- Decoupled from DOM rendering loops, ensuring zero UI thread stutter during export.

---

## 5. Compliance & Validation
- **Governing Specification:** `docs/ui-ux/09-canvas-wallpaper-composition-engine.md` (`DOC-UI-09`).
- **Test Verification:** `docs/testing/02-test-cases-catalog.md` (`TC-POS-119`).
- **Contrast Standards:** Verified APCA $L^c \ge 75$ and W3C WCAG 2.2 AAA.
