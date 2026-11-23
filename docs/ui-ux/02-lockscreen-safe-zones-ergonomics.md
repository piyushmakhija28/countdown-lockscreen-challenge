# Level 3: Lock Screen Safe-Zone Ergonomics & Tri-Modal Biomechanical Specification

**Document ID:** `DOC-UI-02-SAFE-ZONES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Biomechanical UI Ergonomics)  
**Version:** 1.2.0  

---

## 1. Biomechanical Formulation & Smartphone Glance Dynamics

Smartphone users inspect their lock screens an average of **96 times per day**, with an average glance duration of **$1.8\text{ seconds}$** (Asurion Mobile Behavior Study). A successful countdown lock screen must deliver immediate cognitive comprehension ($< 500\text{ms}$) without visual conflict against device system chrome.

### 1.1 The Upper 28% Clock Safe-Zone Rule
Modern operating systems (Apple iOS 16–18 and Android 13–15) place massive typography clock fonts, date headers, and widget stacks across the upper third of the display. 

$$\text{Top Safe-Zone Exclusion Boundary } Y_{\text{safe\_top}} = 0.28 \times H_{\text{canvas}} = 0.28 \times 2532\text{px} = 708.96\text{px}$$

Any countdown digits, titles, or milestone text placed above $Y = 709\text{px}$ suffer catastrophic visual collision, rendering the lock screen unreadable.

### 1.2 The Lower 18% Gesture Safe-Zone Rule
Modern smartphones lack physical home buttons, reserving the bottom margin for navigation indicators and emergency access toggles:

$$\text{Bottom Safe-Zone Exclusion Boundary } Y_{\text{safe\_bottom}} = 0.82 \times H_{\text{canvas}} = 0.82 \times 2532\text{px} = 2076.24\text{px}$$

Text placed below $Y = 2076\text{px}$ will be obscured by iOS Flashlight/Camera shortcuts, home indicator pills, or Android in-display fingerprint scanner icons.

---

## 2. Hardware Safe-Zone Geometric Benchmark Matrix (Flagship Devices)

To ensure pixel-perfect compatibility across actual flagship hardware, safe zones map to the following exact physical coordinates and normalized percentages:

```
+---------------------------------------------------------------------------------------------------------------+
|                                    HARDWARE SAFE-ZONE GEOMETRIC BENCHMARK MATRIX                              |
+--------------------------+---------------------+-------------------+------------------+-----------------------+
| Hardware Feature         | Reference Device    | Pixel Dimensions  | Normalized %     | Collision Guard Rule  |
+--------------------------+---------------------+-------------------+------------------+-----------------------+
| **Dynamic Island**       | iPhone 14-16 Pro    | 374 x 105 px      | W: 32.0%, H: 4.2%| Top center exclusion  |
| **Trapezoidal Notch**    | iPhone 13 / 14      | 525 x 99 px       | W: 44.8%, H: 3.9%| Top center exclusion  |
| **Centered Punch-Hole**  | Pixel 8/9, S24      | 84 x 84 px        | D: 3.3%, Y: 1.7% | Camera cutout guard   |
| **In-Display FP Sensor** | Galaxy S24, Pixel 9 | 240 x 240 px      | W: 20.5%, Y: 78.9%| Fingerprint boundary  |
| **iOS Home Indicator**   | All modern iPhones  | 420 x 15 px       | W: 35.9%, Y: 98.2%| Bottom gesture bar    |
| **System Clock & Date**  | iOS / Android lock  | Full width x 600px| Y: 4.5% to 27.5% | No text permitted     |
| **iPhone 16 Pro Max**    | 16 Pro Max (6.9")   | 1320 x 2868 px    | Top: 27.8%, B:82%| Extra-tall flagship   |
| **Pixel 9 Pro Fold**     | Inner Screen (8.0") | 2076 x 2152 px    | Top: 14.0%, B:88%| Dual-Column Mode (R<1.7|
| **Galaxy Z Fold 6**      | Inner Screen (7.6") | 1856 x 2160 px    | Top: 14.0%, B:88%| Dual-Column Mode (R<1.7|
+--------------------------+---------------------+-------------------+------------------+-----------------------+
```

### 2.1 Touch Target Hit Area Expansion Formulation (Fitts's Law $48\times 48\text{dp}$)
Small visual elements (such as $24\times 24\text{px}$ checkboxes or $20\times 20\text{px}$ icon triggers) are prone to high miss rates ($> 18\%$) on touch screens. The engine applies an invisible pseudo-element expansion layer guaranteeing an absolute minimum $48\times 48\text{dp}$ touch envelope without altering visual layout spacing:

```css
/* Touch Hit Target Expansion Utility */
.fitts-touch-target {
  position: relative;
}

.fitts-touch-target::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: max(100%, 48px);
  height: max(100%, 48px);
  transform: translate(-50%, -50%);
  pointer-events: auto;
}
```

---

## 3. Tri-Modal Responsive Layout Engine (Foldables, Tablets & Ultra-Tall Displays)

To eliminate pillarboxing, awkward letterboxing, and geometric container collisions across heterogeneous screen geometries, the layout engine calculates non-overlapping bounding boxes across three aspect ratio regimes ($\mathcal{R} = H / W$):

```
+---------------------------------------------------------------------------------------------------------------+
|                                      TRI-MODAL RESPONSIVE LAYOUT REGIMES                                      |
+--------------------------+----------------------------+-------------------------------------------------------+
| Aspect Ratio Metric (R)  | Device Archetypes          | Responsive Layout Topology                            |
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 1: R >= 2.15**  | Ultra-Tall Phones & Fold   | Compact Single-Column Layout                          |
|                          | Cover Screens (21:9, 23:9) | Top: 22%; Bottom: 84%; Ring: min(boxW*0.30, heroH*0.36)|
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 2: 1.70-2.15**  | Standard Flagship Phones   | Balanced Hero Layout (Zero-Collision Isotropic Ring)  |
|                          | (iPhone 13-16, S24, Pixel) | Top: 28%; Bottom: 82%; Ring: min(boxW*0.32, heroH*0.38)|
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 3: R < 1.70**   | Foldables Unfolded & Tablet| Dual-Column Centered Split Layout                     |
|                          | (Galaxy Z Fold, iPad Mini) | Left Col: Hero Countdown; Right Col: Milestone Path.  |
+--------------------------+----------------------------+-------------------------------------------------------+
```

### 3.1 Non-Overlapping Ring Radius Derivation
In standard flagship portrait ($W = 1170\text{px}, H = 2532\text{px}$):
- Available height between safe zones: $H_{\text{avail}} = (0.82 - 0.28) \times 2532 = 1367.28\text{px}$.
- Hero container height: $\text{heroBox.height} = H_{\text{avail}} \times 0.42 = 574.26\text{px}$.
- Container width: $\text{boxW} = W \times 0.88 = 1029.6\text{px}$.

To guarantee zero vertical collision with the milestone timeline box below it, the ring radius must be constrained isotropically:

$$r_{\text{ring}} = \min(\text{boxW} \times 0.32, \text{heroBox.height} \times 0.38) = \min(329.5\text{px}, 218.2\text{px}) \approx 220\text{px}$$

Outer Diameter $D_{\text{ring}} = 2 \times 220 = 440\text{px} < 574.26\text{px}$. This provides $134.26\text{px}$ of vertical padding for the goal title and unit labels, completely eliminating the $361.74\text{px}$ overflow collision.

### 3.2 Dual-Column Coordinates for Foldables ($\mathcal{R} < 1.70$)
On wide foldable inner screens (e.g. Galaxy Z Fold inner display $1856 \times 2160$, aspect $1.16:1$), standard vertical stacking wastes more than $38\%$ of display width. The engine bifurcates the canvas into two coordinated spatial columns:
- **Left Column ($X \in [0.05W \dots 0.48W]$):** Centers the Hero Days/Hours Countdown Digits and Progress Arc Ring ($Y_{\text{center}} = 0.50H$).
- **Right Column ($X \in [0.52W \dots 0.95W]$):** Aligns the 4 Milestone Checkpoints and Daily Affirmation ($Y \in [0.14H \dots 0.88H]$).
- **Reduced Top Clearance:** Because tablet clocks are smaller and left-aligned, top exclusion drops to $14\%$ ($Y_{\text{top}} = 0.14H$).

---

## 4. Mobile Keyboard Adaptation & Viewport Dynamics

When mobile browsers summon the virtual keyboard during goal entry, the available viewport height shrinks by $280\text{--}380\text{px}$.

### 4.1 Viewport Meta Tag Policy
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content, viewport-fit=cover">
```

### 4.2 Visual Viewport Height Synchronization
```javascript
/**
 * Synchronizes layout viewport to avoid keyboard layout thrashing and CTA button occlusion.
 */
export function initViewportAdapter() {
  if (typeof window === 'undefined' || !window.visualViewport) return;

  const updateViewportHeight = () => {
    const vh = window.visualViewport.height;
    document.documentElement.style.setProperty('--visual-viewport-h', `${vh}px`);
  };

  window.visualViewport.addEventListener('resize', updateViewportHeight);
  window.visualViewport.addEventListener('scroll', updateViewportHeight);
  updateViewportHeight();
}
```

---

## 5. Architectural Implementation Blueprint (`ResponsiveLayoutEngine.js`)

```javascript
/**
 * Computes pixel-perfect, collision-free layout bounding boxes across mobile aspect ratios.
 */
export class ResponsiveLayoutEngine {
  /**
   * Calculates layout boxes with guaranteed non-overlapping bounds.
   *
   * @param {number} width Canvas width in pixels
   * @param {number} height Canvas height in pixels
   * @returns {Object} Computed layout coordinates and typography metrics
   */
  static computeLayout(width, height) {
    const ratio = height / width;

    if (ratio < 1.70) {
      // Regime 3: Wide Foldable Unfolded / Tablet (Dual-Column Split)
      const topSafeY = height * 0.14;
      const bottomSafeY = height * 0.88;
      const availableH = bottomSafeY - topSafeY;
      const colWidth = width * 0.43;

      const heroBox = {
        x: width * 0.05,
        y: topSafeY,
        width: colWidth,
        height: availableH
      };

      const milestoneBox = {
        x: width * 0.52,
        y: topSafeY,
        width: colWidth,
        height: availableH
      };

      const ringRadius = Math.min(colWidth * 0.36, availableH * 0.22);
      const ringCenter = {
        x: heroBox.x + heroBox.width / 2,
        y: heroBox.y + heroBox.height * 0.42
      };

      return {
        regime: 'wide_foldable',
        ratio,
        canvasWidth: width,
        canvasHeight: height,
        topSafeY,
        bottomSafeY,
        heroBox,
        milestoneBox,
        ringRadius,
        ringCenter,
        fontSizeHero: Math.round(width * 0.042),
        fontSizeTitle: Math.round(width * 0.024),
        fontSizeMilestone: Math.round(width * 0.020)
      };
    } else if (ratio >= 2.15) {
      // Regime 1: Ultra-Tall Phone / Foldable Cover (21:9, 23.1:9)
      const topSafeY = height * 0.22;
      const bottomSafeY = height * 0.84;
      const availableH = bottomSafeY - topSafeY;
      const boxW = width * 0.86;
      const heroH = availableH * 0.44;

      const heroBox = {
        x: width * 0.07,
        y: topSafeY,
        width: boxW,
        height: heroH
      };

      const milestoneBox = {
        x: width * 0.07,
        y: topSafeY + heroH + availableH * 0.02,
        width: boxW,
        height: availableH * 0.54
      };

      const ringRadius = Math.min(boxW * 0.30, heroH * 0.36);
      const ringCenter = {
        x: heroBox.x + heroBox.width / 2,
        y: heroBox.y + heroBox.height * 0.48
      };

      return {
        regime: 'ultra_tall',
        ratio,
        canvasWidth: width,
        canvasHeight: height,
        topSafeY,
        bottomSafeY,
        heroBox,
        milestoneBox,
        ringRadius,
        ringCenter,
        fontSizeHero: Math.round(width * 0.082),
        fontSizeTitle: Math.round(width * 0.040),
        fontSizeMilestone: Math.round(width * 0.036)
      };
    } else {
      // Regime 2: Standard Flagship Smartphone Portrait (iPhone 13-16, Pixel, Galaxy)
      const topSafeY = height * 0.28;
      const bottomSafeY = height * 0.82;
      const availableH = bottomSafeY - topSafeY;
      const boxW = width * 0.88;
      const heroH = availableH * 0.42;

      const heroBox = {
        x: width * 0.06,
        y: topSafeY,
        width: boxW,
        height: heroH
      };

      const milestoneBox = {
        x: width * 0.06,
        y: topSafeY + heroH + availableH * 0.02,
        width: boxW,
        height: availableH * 0.56
      };

      const ringRadius = Math.min(boxW * 0.32, heroH * 0.38);
      const ringCenter = {
        x: heroBox.x + heroBox.width / 2,
        y: heroBox.y + heroBox.height * 0.50
      };

      return {
        regime: 'standard_portrait',
        ratio,
        canvasWidth: width,
        canvasHeight: height,
        topSafeY,
        bottomSafeY,
        heroBox,
        milestoneBox,
        ringRadius,
        ringCenter,
        fontSizeHero: Math.round(width * 0.090),
        fontSizeTitle: Math.round(width * 0.042),
        fontSizeMilestone: Math.round(width * 0.038)
      };
    }
  }
}
```
