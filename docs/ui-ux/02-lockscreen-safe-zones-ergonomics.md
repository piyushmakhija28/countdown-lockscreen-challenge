# Level 3: Lock Screen Safe-Zone Ergonomics & Biomechanical Specification

**Document ID:** `DOC-UI-02-SAFE-ZONES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Biomechanical UI Ergonomics)

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

## 2. Mathematical Coordinate Models (1170x2532 Resolution)

```
0px    +-------------------------------------------------------------+
       |   [ Dynamic Island: X in [397, 772px], Y in [20, 125px] ]   |  <- System Status Bar
       |   [ System Date: X in [200, 970px], Y in [140, 220px] ]     |
       |   [ OS System Clock: X in [100, 1070px], Y in [220, 540px] ]|  <- TOP 28% EXCLUSION ZONE
       |   [ OS Lock Screen Widgets: Y in [540, 708px] ]             |
708px  +=============================================================+  <- UPPER SAFE ZONE BOUNDARY
       |                                                             |
       |   PRIMARY COUNTDOWN STUDIO CANVAS (Unobstructed Safe Zone)   |
       |                                                             |
       |   Zone A: Hero Goal Title & Sub-header (Y: 760 - 920px)     |
       |   Zone B: Massive Days / Hours Countdown (Y: 960 - 1320px)  |
       |   Zone C: Milestone Progress Tracker (Y: 1360 - 1800px)     |
       |   Zone D: Motivational Affirmation (Y: 1840 - 2020px)       |
       |                                                             |
2076px +=============================================================+  <- LOWER SAFE ZONE BOUNDARY
       |   [ Quick Action Toggles: Camera (R) & Flashlight (L) ]     |  <- BOTTOM 18% EXCLUSION
       |   [ iOS Home Indicator / Android Gesture Bar (Y: 2500px) ]  |
2532px +-------------------------------------------------------------+
```

---

## 3. Fitts's Law & Biomechanical Touch Ergonomics

For interactive configuration on mobile web viewports, interactive elements are placed according to Steven Hoober's thumb zone mapping:

$$\text{Movement Time } MT = a + b \log_2 \left( 1 + \frac{2D}{W} \right)$$

- Primary action buttons ("Download Wallpaper", "Decompose with Gemini") are anchored in the **Natural Thumb Reach Zone** ($Y \in [60\%, 85\%]$ of mobile viewport).
- Minimum touch target dimension is strictly enforced at $48 \times 48\text{ pixels}$ ($ID \le 3.5\text{ bits}$), satisfying WCAG 2.1 AAA Target Size criteria.

---

## 4. Safe-Zone Simulator Implementation

The web application incorporates an interactive **Ergonomic Safe-Zone Simulator**:
- Toggles realistic semi-translucent vector graphics of iOS Dynamic Island, System Clock, and Android Material You controls.
- Contestants and users can visually verify that their custom goal title and milestones remain completely unoccluded prior to wallpaper generation.

---

## 5. Dynamic Lock Screen Notification Corridors (Android 14/15 & iOS 17/18)

Dynamic lockscreen notifications (stacked notification cards on Android and iOS Live Activities) introduce transient occlusion over the vertical corridor $Y \in [45\%, 65\%]$ of total screen height ($Y \approx 1140\text{px} \text{ to } 1645\text{px}$ on an $1170 \times 2532\text{px}$ canvas).

To guarantee legibility during active notification states, the engine provides **Dual Safe Anchor Topologies**:

```
+---------------------------------------------------------------------------------------------+
| TOPOLOGY A (Default Balanced Anchor)          | TOPOLOGY B (Notification-Safe Peripheral)   |
+-----------------------------------------------+---------------------------------------------+
| Y: 0 - 708px    [System Clock / Safe Margin]  | Y: 0 - 708px    [System Clock Safe Margin]  |
| Y: 760 - 920px  Zone A: Goal Title            | Y: 720 - 860px  Zone A: Goal Title          |
| Y: 960 - 1320px Zone B: Giant Countdown Digits| Y: 870 - 1080px Zone B: Compact Countdown   |
| Y: 1360-1800px  Zone C: Milestone Rings       | Y: 1100-1850px  [CLEAR NOTIFICATION CORRIDOR]|
| Y: 1840-2020px  Zone D: Affirmation Pill      | Y: 1860-2020px  Zone C: Milestone Mini-Bar  |
| Y: 2076-2532px  [Home Bar / Camera / Flash]   | Y: 2076-2532px  [Home Bar / Camera / Flash] |
+-----------------------------------------------+---------------------------------------------+
```

---

## 6. Foldable Bi-Fold Aspect Ratio Adaptation

Foldable devices (e.g. Samsung Galaxy Z Fold 5/6, Google Pixel Fold) feature two drastically distinct display geometries:
- **Cover Screen:** Ultra-tall $23.1:9$ aspect ratio ($904 \times 2316\text{px}$).
- **Unfolded Inner Screen:** Near-square $6:5$ aspect ratio ($1812 \times 2176\text{px}$).

A single fixed-aspect wallpaper produces severe letterboxing or horizontal edge clipping when the device unfolds. The engine architecture implements a **Bi-Fold Synchronized Export Bundle**:
1. Computes unified visual anchor centers so the countdown digits align visually between cover and inner displays.
2. In the inner unfolded mode, milestones expand horizontally across a 3-column glassmorphic grid rather than a vertical stack, utilizing the $1812\text{px}$ width ergonomically.

---

## 7. Outdoor Glare & Direct Sunlight APCA Contrast Guidelines

Under intense ambient light ($>10,000\text{ lux}$ in direct outdoor midday sunlight), human contrast sensitivity drops significantly. Standard glassmorphic subtle opacity borders ($15\%$ opacity) become completely invisible.

- **APCA Contrast Floor:** All countdown numerals and milestone titles must meet an Advanced Perceptual Contrast Algorithm (APCA) lightness contrast rating of $L_c \ge 75$ (exceeding WCAG 2.1 AAA).
- **Adaptive Luminance Scrim:** When user-uploaded photo backgrounds exhibit high spatial frequency noise ($\sigma^2 > \tau$), a calibrated Gaussian frosted glass scrim (`backdrop-filter: blur(24px)`, opacity $0.65$) is automatically injected behind the text bounding box.

