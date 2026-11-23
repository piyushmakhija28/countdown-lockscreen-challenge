# Level 3: Atomic Component Interaction Specifications
### (Complete 9-State Matrix, Anatomical Blueprints, Touch Targets & ARIA Accessibility)

**Document ID:** `DOC-UI-04-COMPONENT-SPECS`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Atomic Design & Interaction Specification)  
**Version:** 2.3.5  

---

## 1. Executive Summary & Component Taxonomy

This specification provides the definitive design and interaction blueprint for all **10 Atomic UI Components** comprising the Countdown Lock Screen application. In accordance with senior design systems engineering and W3C WAI-ARIA 1.2 standards, every component is rigorously documented across:
1. **Anatomical Wireframe Blueprint:** Exact ASCII bounding boxes, padding, margin, and typography.
2. **Exhaustive 9-State Interactive Matrix:** Default, Hover, Active/Pressed, Focus-Visible, Disabled, Loading, Error, Empty, and Success states.
3. **Fitts's Law Touch Target Geometry:** Enforcement of minimum $44\times 44\text{pt}$ (iOS HIG) and $48\times 48\text{dp}$ (Material Design) physical touch envelopes.
4. **W3C WAI-ARIA Semantics & Keyboard Model:** Precise roles, states, properties, and keyboard event bindings.

```
+---------------------------------------------------------------------------------------------------------+
|                                    ATOMIC COMPONENT TAXONOMY INDEX                                      |
+----+--------------------------------+--------------------+----------------------------------------------+
| #  | Component Name                 | Atomic Level       | Primary Semantic Function                    |
+----+--------------------------------+--------------------+----------------------------------------------+
| 01 | **GlassButton**                | Atom               | Primary & Secondary Actions (Export, Decompose) |
| 02 | **GlassInput**                 | Atom               | Goal Title Text & API Key Entry              |
| 03 | **GlassDatePicker**            | Molecule           | Target Deadline Selection with Time Picker   |
| 04 | **MilestoneTimelineNode**      | Molecule           | Interactive Milestone Checkbox & Offset Pill |
| 05 | **CircularProgressRing**       | Molecule           | Canvas/SVG Kinetic Arc Elapsed Time Display  |
| 06 | **ThemeCardSelector**          | Molecule           | Thematic Color Palette Switcher              |
| 07 | **GlassModalDialog**           | Organism           | AI Customization & Settings Overlay Window   |
| 08 | **ToastNotification**          | Molecule           | Transient Status & Error Announcements       |
| 09 | **StatusBadgePill**            | Atom               | Active State, Tag, and Urgency Indicator     |
| 10 | **SkeletonLoader**             | Atom               | CLS-Proof Content Placeholders               |
+----+--------------------------------+--------------------+----------------------------------------------+
```

---

## 2. Exhaustive 9-State Interactive Engineering Standards

Every interactive element in the system MUST support and explicitly render the following **9 Canonical States**:

```
+---------------------------------------------------------------------------------------------------------+
|                                      THE CANONICAL 9-STATE MATRIX                                       |
+---+----------------+--------------------------------------+---------------------------------------------+
| # | State Name     | Trigger Condition                    | Visual & Kinetic Characteristics            |
+---+----------------+--------------------------------------+---------------------------------------------+
| 1 | **Default**    | Idle, resting state                  | Base token values, rest elevation           |
| 2 | **Hover**      | Pointer enters boundary              | +10% lightness, 4px lift, cursor pointer    |
| 3 | **Active**     | Pointer down / key down              | -5% scale (0.97), inset shadow, haptic tap  |
| 4 | **Focus-Vis**  | Tab key navigation                   | 2px solid primary outline, 3px offset ring  |
| 5 | **Disabled**   | Pre-requisite not met                | 40% opacity, pointer-events: none, no cursor|
| 6 | **Loading**    | Asynchronous operation pending       | Indeterminate spinner, text hidden/dimmed   |
| 7 | **Error**      | Input validation failure             | Red border (#ef4444), shake animation (300ms)|
| 8 | **Empty**      | Zero data / initial state            | Muted placeholder text, zero-state glyph    |
| 9 | **Success**    | Operation completed successfully     | Emerald border (#10b981), checkmark morph   |
+---+----------------+--------------------------------------+---------------------------------------------+
```

---

## 3. Detailed Component Interaction Specifications

### 3.1 Component 1: `GlassButton` (Primary & Secondary CTA)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                                 GLASS BUTTON ANATOMY                            |
|                                                                                 |
|  +-- Outer Touch Hit Area (48px Min Height on Mobile) -----------------------+  |
|  |                                                                           |  |
|  |  +-- Visual Border (1px Specular Border: rgba(255, 255, 255, 0.15)) ----+  |  |
|  |  | [Inset Top Specular Highlight: 0 1px 1px rgba(255, 255, 255, 0.25)]  |  |  |
|  |  |  Pad-Y: 12px                                                          |  |  |
|  |  |  Pad-X: 24px  [Icon: 20x20]  Gap: 8px  [Label: 16px Bold]  Pad-X: 24px |  |  |
|  |  |  Pad-Y: 12px                                                          |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                                                           |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Detailed State Specifications:
1. **Default:** `background: rgba(103, 232, 249, 0.15); border: 1px solid rgba(103, 232, 249, 0.40); color: var(--text-primary); border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);`
2. **Hover:** `background: rgba(103, 232, 249, 0.25); border-color: rgba(103, 232, 249, 0.70); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(103, 232, 249, 0.30); transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);`
3. **Active:** `transform: translateY(0px) scale(0.97); background: rgba(103, 232, 249, 0.35); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.40);` Triggers `HapticService.triggerTap()`.
4. **Focus-Visible:** `outline: 2px solid var(--accent-primary); outline-offset: 3px; box-shadow: 0 0 0 5px rgba(103, 232, 249, 0.20);`
5. **Disabled:** `opacity: 0.38; cursor: not-allowed; pointer-events: none; filter: grayscale(80%);`
6. **Loading:** Label is replaced by a $20\text{px}$ circular SVG spinner rotating at $0.8\text{s/rev}$ with `aria-busy="true"`.
7. **Error:** `border-color: #ef4444; background: rgba(239, 68, 68, 0.15); animation: shake 300ms ease;`
8. **Empty:** Not applicable for button triggers.
9. **Success:** `background: rgba(16, 185, 129, 0.25); border-color: #10b981;` Label displays a checkmark morph `[✓ Done]`.

#### ARIA & Keyboard Accessibility:
- **Element:** `<button type="button" class="glass-btn">`
- **Attributes:** `aria-disabled="false"`, `aria-busy="false"`
- **Keyboard Handling:**
  - `Enter` / `Space`: Activates the action, triggers active state, then executes callback.
  - `Tab`: Moves focus into button with visible focus ring.

---

### 3.2 Component 2: `GlassInput` (Goal Title Text Input)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                                  GLASS INPUT ANATOMY                            |
|                                                                                 |
|  [Label: 12.8px SemiBold, Color: var(--text-muted)]                             |
|  +-- Input Container (Min-Height: 48px) -------------------------------------+  |
|  | [Icon: 20x20]  Pad-Left: 16px                                            |  |
|  | [Field Text: 16px Regular, Cursor Caret: 2px Solid var(--accent-primary)]|  |
|  | [Character Counter: "42/80" - Pad-Right: 16px]                          |  |
|  +---------------------------------------------------------------------------+  |
|  [Helper Text / Validation Error Message: 12px Regular]                         |
+---------------------------------------------------------------------------------+
```

#### Detailed State Specifications:
1. **Default:** `background: rgba(15, 18, 26, 0.60); border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; border-radius: var(--radius-sm);`
2. **Hover:** `border-color: rgba(255, 255, 255, 0.25); background: rgba(15, 18, 26, 0.75);`
3. **Active:** `background: rgba(15, 18, 26, 0.85);`
4. **Focus-Visible:** `border-color: var(--accent-primary); outline: none; box-shadow: 0 0 0 3px rgba(103, 232, 249, 0.25);`
5. **Disabled:** `background: rgba(15, 18, 26, 0.20); opacity: 0.40; border-color: transparent;`
6. **Loading:** Displays an inline trailing pulsing beacon indicator.
7. **Error:** `border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.20);` Associated error text below input with `aria-live="assertive"`.
8. **Empty:** Placeholder text rendered in `rgba(148, 163, 184, 0.60)` (`#94a3b8`).
9. **Success:** Validated input displays an emerald trailing checkmark icon.

#### ARIA & Keyboard Accessibility:
- **Element:** `<input type="text" id="goal-input" class="glass-input">`
- **Association:** Explicit `<label for="goal-input">Target Goal</label>`
- **Attributes:** `aria-invalid="false"`, `aria-describedby="goal-helper-text"`
- **Input Sanitization:** Intercepts `input` event, rejecting HTML markup characters (`<`, `>`, `"`, `'`, `&`, `\0`).

---

### 3.3 Component 3: `MilestoneTimelineNode` (Interactive Milestone Item)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                            MILESTONE TIMELINE NODE ANATOMY                      |
|                                                                                 |
|  +-- Vertical Connecting Spine (2px Solid rgba(255, 255, 255, 0.15)) --------+  |
|  |                                                                           |  |
|  |  +-- [Node Checkbox: 24x24px, Touch Target: 44x44px]                     |  |
|  |  |   Completed: Filled Emerald Circle with SVG Checkmark                  |  |
|  |  |   Active: Neon Cyan Pulsing Ring (Scale: 1.0 -> 1.15 in 2.0s)          |  |
|  |  |   Upcoming: Hollow Slate Border Ring                                  |  |
|  |  +---------------------------------------------------------------------+  |  |
|  |                                                                           |  |
|  |  +-- [Milestone Content Box: Pad 12px 16px] ---------------------------+  |  |
|  |  |   Title: 16px SemiBold  |  Offset Pill: "Day 7 (75% Mark)"          |  |  |
|  |  |   Description: 12.8px Regular Muted                                  |  |  |
|  |  +---------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Detailed State Specifications:
1. **Default (Upcoming):** Opacity `0.70`, border `1px solid rgba(255, 255, 255, 0.08)`, checkbox hollow slate.
2. **Hover:** Opacity `1.0`, background `rgba(255, 255, 255, 0.05)`, cursor pointer.
3. **Active (Pressed):** Scale `0.98`, micro-haptic impulse (`15ms`).
4. **Focus-Visible:** Focused milestone row displays a $2\text{px}$ solid cyan outline with $3\text{px}$ offset.
5. **Disabled:** Read-only mode during wallpaper rasterization.
6. **Loading:** Checkbox displays a miniature circular shimmer.
7. **Error:** Overdue milestone turns amber/red with an alert glyph.
8. **Empty:** "No milestones generated yet. Click 'Decompose with Gemini'".
9. **Success (Completed):** Checkbox fills with emerald gradient (`#10b981`), title renders with subtle strike-through and dimmed opacity ($0.55$), audio chime sounds.

#### ARIA & Keyboard Accessibility:
- **Role:** `role="checkbox"`, `aria-checked="true|false"`
- **Keyboard Handling:**
  - `Space` / `Enter`: Toggles milestone completion state.
  - `ArrowDown` / `ArrowUp`: Navigates focus between sequential milestone nodes.

---

### 3.4 Component 4: `CircularProgressRing` (Elapsed Time Chronometer)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                            CIRCULAR PROGRESS RING ANATOMY                       |
|                                                                                 |
|                        .-'""'-.                                                 |
|                      .'  __    '.                                               |
|                     /   /  \     \   <-- SVG Animated Progress Arc (Stroke 12px)|
|                    |   | 18 |     |      Cap: Round, Dashoffset Interpolated    |
|                    |   |DAYS|     |                                             |
|                     \   \__/     /   <-- Background Track (Stroke 12px, Muted)  |
|                      '.        .'                                               |
|                        '-....-'                                                 |
|                                                                                 |
|   Center Content:                                                               |
|   - Hero Value: 61px Black Numeral (Tabular Figures)                            |
|   - Unit Label: 12.8px Medium All-Caps ("DAYS REMAINING")                       |
|   - Percentage Subtext: 10px Medium ("74.2% Time Elapsed")                     |
+---------------------------------------------------------------------------------+
```

#### Kinetic & Interaction Specifications:
- **Circumference Formula:** $C = 2 \cdot \pi \cdot r = 2 \cdot \pi \cdot 180 = 1130.97\text{px}$.
- **Dashoffset Binding:** $\text{offset} = C \times (1 - \text{fractionElapsed})$.
- **Spring Transition:** When the countdown updates, stroke dashoffset updates smoothly via CSS transition: `transition: stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Solar Wash Compensation:** Stroke incorporates an outer Gaussian glow drop-shadow (`drop-shadow(0 0 12px var(--accent-primary))`) to preserve edge contrast in bright daylight.

---

### 3.5 Component 5: `ThemeCardSelector` (Thematic Palette Switcher)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                              THEME CARD SELECTOR ANATOMY                        |
|                                                                                 |
|  +-- Theme Card (Min-Width: 100px, Min-Height: 80px) ------------------------+  |
|  |  +-- Palette Swatch Preview (3 Dots: Canvas, Accent, Text) -------------+  |  |
|  |  |  ( ● ) OLED Black    ( ● ) Cyan Neon    ( ● ) Pure White             |  |  |
|  |  +----------------------------------------------------------------------+  |  |
|  |  [Theme Name: "Cyber Obsidian" - 12.8px SemiBold]                         |  |
|  |  [Status Indicator: Radio Pill (Selected: Filled Dot)]                    |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Detailed State Specifications:
1. **Selected State:** Border `2px solid var(--accent-primary)`, background `rgba(255, 255, 255, 0.10)`, elevation layer 2.
2. **Unselected State:** Border `1px solid rgba(255, 255, 255, 0.12)`, background `rgba(15, 18, 26, 0.60)`.
3. **Hover:** Lifts $3\text{px}$ upward with a soft cyan/amber glow.

#### ARIA & Keyboard Accessibility:
- **Role:** `role="radiogroup"` containing elements with `role="radio"`, `aria-checked="true|false"`.
- **Keyboard Handling:**
  - `ArrowLeft` / `ArrowRight`: Moves selection between the 3 themes with instant live re-skinning.

---

### 3.6 Component 6: `GlassModalDialog` (AI Prompt & Settings Overlay)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                                 GLASS MODAL DIALOG                              |
|                                                                                 |
|  +-- Full-Screen Backdrop (rgba(0, 0, 0, 0.75), backdrop-filter: blur(12px))-+  |
|  |                                                                           |  |
|  |  +-- Modal Card (Max-W: 560px, Glass Surface: Elevation 3) -------------+  |  |
|  |  |  Header: [Title: "Configure Gemini 3.8 Flash"]  [Close Button (X)]   |  |  |
|  |  |  Divider: 1px Solid rgba(255, 255, 255, 0.10)                        |  |  |
|  |  |  Body:                                                               |  |  |
|  |  |    - API Key Input Field (Password Masked)                           |  |  |
|  |  |    - Custom Planning Prompt Textarea                                 |  |  |
|  |  |    - Privacy Disclosure Notice (Zero-Storage Guarantee)              |  |  |
|  |  |  Footer:                                                             |  |  |
|  |  |    [Cancel Button - Secondary]      [Save & Decompose - Primary]     |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Focus Trap & Keyboard Trap Invariants (WCAG 2.2 SC 2.1.2):
- **Focus Locking:** Upon open, focus instantly shifts to the first interactive field (`#api-key-input`). Focus is strictly trapped within the modal container. Pressing `Tab` on the last button cycles back to the close button.
- **Escape Dismissal:** Pressing `Escape` immediately closes the modal and returns focus to the trigger button that launched it.
- **Scroll Locking:** `document.body.style.overflow = 'hidden'` prevents background scrolling while modal is active.

---

### 3.7 Component 7: `ToastNotification` (Transient Status & Error Banners)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                               TOAST NOTIFICATION ANATOMY                        |
|                                                                                 |
|  +-- Floating Toast (Fixed Bottom-Center, Z-Index: 60) ----------------------+  |
|  | [Status Icon: 20x20 Checkmark/Alert]                                      |  |
|  | [Message Text: 14px Medium - "Wallpaper exported to Downloads (1170x2532)"] |  |
|  | [Dismiss Button: 18x18 (X)]                                               |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Kinetic & Lifecycle Specifications:
- **Entrance:** Slides up from bottom by $30\text{px}$ while fading in (`opacity: 0 \to 1`) over $250\text{ms}$ with spring overshoot (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Auto-Dismiss:** Persists for $4000\text{ms}$, then fades out over $300\text{ms}$. Hovering pauses the auto-dismiss timer.
- **Accessibility:** `role="status"` for non-critical notices (`aria-live="polite"`), `role="alert"` for critical validation errors (`aria-live="assertive"`).

---

### 3.8 Component 8: `SkeletonLoader` (CLS-Proof Content Placeholder)

#### Anatomical Wireframe Blueprint:
```
+---------------------------------------------------------------------------------+
|                                 SKELETON LOADER ANATOMY                         |
|                                                                                 |
|  +-- Milestone Skeleton Row -------------------------------------------------+  |
|  |  [Checkbox Skeleton: 24x24px Circle, bg: rgba(255,255,255,0.08)]          |  |
|  |  [Title Skeleton: Width 60%, Height 16px, Rounded 4px]                   |  |
|  |  [Offset Pill Skeleton: Width 20%, Height 12px, Rounded 9999px]           |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

#### Kinetic Shimmer Formula:
- **Zero Cumulative Layout Shift ($\text{CLS} = 0.000$):** Skeletons match the exact bounding box dimensions of the loaded content.
- **Shimmer Gradient:**
  ```css
  background: linear-gradient(
    90deg in oklch,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.8s infinite linear;
  ```
- **Reduced Motion Fallback:** When `prefers-reduced-motion: reduce` is active, the moving shimmer gradient is disabled in favor of a static, low-contrast solid fill.
