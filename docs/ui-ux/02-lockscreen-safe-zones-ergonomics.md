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
