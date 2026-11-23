# Level 3: Lock Screen Safe-Zone Ergonomics & Tri-Modal Biomechanical Specification

**Document ID:** `DOC-UI-02-SAFE-ZONES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Biomechanical UI Ergonomics)

---

## 1. Biomechanical Formulation & Smartphone Glance Dynamics

Smartphone users inspect their lock screens an average of **96 times per day**, with an average glance duration of **$1.8\text{ seconds}$** (Asurion Mobile Behavior Study). A successful countdown lock screen must deliver immediate cognitive comprehension ($< 500\text{ms}$) without visual conflict against device system chrome.

### 1.1 The Upper 28% Clock Safe-Zone Rule
Modern operating systems (Apple iOS 16–18 and Android 13–15) place massive typography clock fonts, date headers, and widget stacks across the upper third of the display. 

$$\text{Top Safe-Zone Exclusion Boundary } Y_{\text{safe\_top}} = 0.28 \times H_{\text{canvas}} = 0.28 \times 2532\text{px} = 708\text{px}$$

Any countdown digits, titles, or milestone text placed above $Y = 708\text{px}$ suffer catastrophic visual collision, rendering the lock screen unreadable.

### 1.2 The Lower 18% Gesture Safe-Zone Rule
Modern smartphones lack physical home buttons, reserving the bottom margin for navigation indicators and emergency access toggles:

$$\text{Bottom Safe-Zone Exclusion Boundary } Y_{\text{safe\_bottom}} = 0.82 \times H_{\text{canvas}} = 0.82 \times 2532\text{px} = 2076\text{px}$$

Text placed below $Y = 2076\text{px}$ will be obscured by iOS Flashlight/Camera shortcuts or Android in-display fingerprint scanner icons.

---

## 2. Tri-Modal Responsive Layout Engine (Foldables, Tablets & Ultra-Tall Displays)

To eliminate pillarboxing and awkward letterboxing across modern heterogeneous screen geometries, the layout engine calculates coordinates dynamically across three aspect ratio regimes ($\mathcal{R} = H / W$):

```
+---------------------------------------------------------------------------------------------------------------+
|                                      TRI-MODAL RESPONSIVE LAYOUT REGIMES                                      |
+--------------------------+----------------------------+-------------------------------------------------------+
| Aspect Ratio Metric (R)  | Device Archetypes          | Responsive Layout Topology                            |
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 1: R >= 2.15**  | Ultra-Tall Phones & Fold   | Compact Single-Column Layout                          |
|                          | Cover Screens (21:9, 23:9) | Top safe zone: 22%; Bottom: 84%; Ring Radius: 0.34W.  |
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 2: 1.70-2.15**  | Standard Flagship Phones   | Balanced Hero Layout                                  |
|                          | (iPhone 13-16, S24, Pixel) | Top safe zone: 28%; Bottom: 82%; Ring Radius: 0.40W.  |
+--------------------------+----------------------------+-------------------------------------------------------+
| **Regime 3: R < 1.70**   | Foldables Unfolded & Tablet| Dual-Column Centered Split Layout                     |
|                          | (Galaxy Z Fold, iPad Mini) | Left Col: Hero Countdown; Right Col: Milestone Path.  |
+--------------------------+----------------------------+-------------------------------------------------------+
```

### 2.1 Dual-Column Coordinates for Foldables ($\mathcal{R} < 1.70$)
On wide foldable inner screens (e.g. Galaxy Z Fold inner display $1812 \times 2176$, aspect $1.2:1$), standard vertical stacking wastes more than $38\%$ of display width. The engine bifurcates the canvas into two coordinated spatial columns:
- **Left Column ($X \in [0.06W \dots 0.48W]$):** Centers the Hero Days/Hours Countdown Digits and Progress Arc Ring ($Y_{\text{center}} = 0.50H$).
- **Right Column ($X \in [0.52W \dots 0.94W]$):** Aligns the 4 Milestone Checkpoints and Daily Affirmation ($Y \in [0.18H \dots 0.82H]$).
- **Reduced Top Clearance:** Because tablet clocks are smaller and left-aligned, top exclusion drops to $14\%$ ($Y_{\text{top}} = 0.14H$).

### 2.2 Architectural Implementation Blueprint (`ResponsiveLayoutEngine.js`)

```typescript
/**
 * Calculates responsive bounding boxes and safe zones across mobile aspect ratios.
 */
export class ResponsiveLayoutEngine {
  public static computeLayout(width: number, height: number) {
    const ratio = height / width;

    if (ratio < 1.70) {
      // Regime 3: Wide Foldable Unfolded / Tablet (Dual-Column Split)
      const topSafe = height * 0.14;
      const botSafe = height * 0.88;
      const colWidth = width * 0.42;

      return {
        regime: 'wide_foldable',
        topSafe,
        botSafe,
        heroBox: { x: width * 0.06, y: topSafe, width: colWidth, height: botSafe - topSafe },
        milestoneBox: { x: width * 0.52, y: topSafe, width: colWidth, height: botSafe - topSafe },
        ringRadius: Math.min(colWidth * 0.38, (botSafe - topSafe) * 0.25),
        fontSizeHero: Math.round(width * 0.045),
        fontSizeMilestone: Math.round(width * 0.022)
      };
    } else if (ratio >= 2.15) {
      // Regime 1: Ultra-Tall Phone / Foldable Cover
      const topSafe = height * 0.22;
      const botSafe = height * 0.84;
      const availableH = botSafe - topSafe;

      return {
        regime: 'ultra_tall',
        topSafe,
        botSafe,
        heroBox: { x: width * 0.08, y: topSafe, width: width * 0.84, height: availableH * 0.44 },
        milestoneBox: { x: width * 0.08, y: topSafe + availableH * 0.46, width: width * 0.84, height: availableH * 0.54 },
        ringRadius: width * 0.34,
        fontSizeHero: Math.round(width * 0.080),
        fontSizeMilestone: Math.round(width * 0.038)
      };
    } else {
      // Regime 2: Standard Flagship Smartphone Portrait
      const topSafe = height * 0.28;
      const botSafe = height * 0.82;
      const availableH = botSafe - topSafe;

      return {
        regime: 'standard_portrait',
        topSafe,
        botSafe,
        heroBox: { x: width * 0.06, y: topSafe, width: width * 0.88, height: availableH * 0.42 },
        milestoneBox: { x: width * 0.06, y: topSafe + availableH * 0.44, width: width * 0.88, height: availableH * 0.56 },
        ringRadius: width * 0.40,
        fontSizeHero: Math.round(width * 0.092),
        fontSizeMilestone: Math.round(width * 0.040)
      };
    }
  }
}
```

---

## 3. Fitts's Law & Touch Ergonomics

For interactive configuration on mobile web viewports, interactive elements are placed according to Steven Hoober's thumb zone mapping:

$$\text{Movement Time } MT = a + b \log_2 \left( 1 + \frac{2D}{W} \right)$$

- Primary action buttons ("Download Wallpaper", "Decompose with Gemini") are anchored in the **Natural Thumb Reach Zone** ($Y \in [60\%, 85\%]$ of mobile viewport).
- Minimum touch target dimension is strictly enforced at $48 \times 48\text{ pixels}$ ($ID \le 3.5\text{ bits}$), satisfying WCAG 2.1 AAA Target Size criteria.

---

## 4. Safe-Zone Simulator Implementation

The web application incorporates an interactive **Ergonomic Safe-Zone Simulator**:
- Toggles realistic semi-translucent vector graphics of iOS Dynamic Island, System Clock, and Android Material You controls.
- Contestants and users can visually verify that their custom goal title and milestones remain completely unoccluded prior to wallpaper generation.
