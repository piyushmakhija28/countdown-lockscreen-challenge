# Level 1: Product Requirements Document (PRD)

**Document ID:** `DOC-01-PRD`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (ISO/IEC/IEEE 29148 Standard)  
**Version:** 2.3.6

---

## 1. Product Vision & Value Proposition

### 1.1 Vision Statement
To transform daunting, anxiety-inducing deadlines into an inspiring, glanceable visual momentum system on every participant's smartphone lock screen by combining **Google Gemini's backward planning intelligence** with **mathematical UI ergonomics**.

### 1.2 The Jobs-to-be-Done (JTBD) Framework
- **Core Functional Job:** When I have an important high-stakes deadline (internship interview, thesis submission, startup launch), I want to see a real-time countdown alongside actionable sequential milestones every time I look at my phone, so that I can stay focused without getting overwhelmed.
- **Emotional Job:** I want to feel calm, in control, and psychologically affirmed rather than paralyzed by an abstract monolithic deadline.
- **Social Job:** I want my lock screen aesthetic to look sleek, modern, and intentionally crafted, reflecting my dedication to my goals.

---

## 2. Target User Personas & Behavioral Profiles

### Persona 1: "Dev Priya" — The Aspiring Software Engineer
- **Demographics:** 21 years old, Final Year B.Tech Computer Science student, New Delhi, India.
- **Target Deadline:** Google Summer 2027 SWE Internship Technical Interviews (December 20, 2026).
- **Core Frustration:** Juggling LeetCode algorithmic practice, system design basics, university semester exams, and mock interviews. A monolithic timer *"28 Days Left"* induces panic.
- **Daily Behavior:** Unlocks her phone 110+ times per day, often succumbing to social media distractions during study fatigue.
- **Solution Fit:** Uses the **Cyber Obsidian** theme. Gemini decomposes her prep into 4 weekly sprints: (1) Graph & Tree Traversal, (2) Dynamic Programming Masterclass, (3) System Design & Concurrency, (4) Behavioral STAR rounds.

### Persona 2: "Alex Vance" — The Indie Hacker & Startup Builder
- **Demographics:** 28 years old, Solo Founder building an AI SaaS product, Berlin, Germany.
- **Target Deadline:** Product Hunt & Hacker News Public Launch (January 15, 2027).
- **Core Frustration:** Chronic scope creep and perfectionism delaying MVP deployment.
- **Daily Behavior:** Values minimalist terminal aesthetics, high information density, and glanceable metric dashboards.
- **Solution Fit:** Uses the **Deep Focus Zen** theme. Gemini structures milestones: Feature Freeze $\to$ Alpha Dogfooding $\to$ Product Hunt Teaser $\to$ Launch Day Go-Live.

### Persona 3: "Rohan Mehta" — The Graduate Research Scholar
- **Demographics:** 24 years old, Master's student in Economics, Mumbai, India.
- **Target Deadline:** Master's Dissertation Final Submission (December 5, 2026).
- **Core Frustration:** Cognitive block when faced with writing 80 pages; struggles with pacing empirical regression analysis.
- **Daily Behavior:** Needs gentle, positive affirmations and visual progress bars rather than high-stress countdowns.
- **Solution Fit:** Uses the **Aurora Botanical** theme. The lock screen shows green milestone checkmarks as chapters are completed, accompanied by a daily stoic affirmation.

---

## 3. End-to-End User Journey Mapping

```mermaid
journey
    title User Journey: Creating an AI-Powered Countdown Lock Screen
    section 1. Ingress & Goal Formulation
      Land on Web Application (FCP < 0.8s): 5: User
      Input Goal Title & Deadline Timestamp: 5: User
      Select Thematic Color Palette: 5: User
    section 2. AI Backward Planning
      Trigger "Decompose with Google Gemini": 5: User
      Gemini Analyzes & Generates 4 Sprints: 5: Gemini AI
      Receive Tailored Motivational Affirmation: 5: Gemini AI
      Review, Edit, or Add Custom Milestones: 4: User
    section 3. Lock Screen Ergonomic Verification
      Toggle "Phone Lock Screen Simulator": 5: User
      Inspect iOS Dynamic Island & Clock Clearance: 5: User
      Verify Contrast & Typography Hierarchy: 5: User
    section 4. Wallpaper Rasterization & Daily Habit
      Click "Generate Wallpaper" (< 350ms): 5: Canvas Engine
      Download High-Resolution 1170x2532 PNG: 5: User
      Set Image as Mobile Lock Screen: 5: User
      Experience 96 Ambient Glances of Momentum Daily: 5: User
```

---

## 4. Feature Specifications & BDD Acceptance Criteria (F-01 to F-12)

### F-01: Google Gemini Backward Milestone Decomposition
- **Functional Description:** Ingests the user's goal string and target deadline timestamp, invokes Google Gemini 3.8 Flash with structured JSON schema constraints, and returns 3 to 5 sequential, chronologically ordered milestone checkpoints working backward from the goal.
- **Inputs:** `goalTitle` (String, 3–80 chars), `deadline` (ISO-8601 String), `apiKey` (Optional user API key).
- **Outputs:** `MilestonePlan` object containing an array of milestones and a tailored affirmation string ($\le 120$ chars).
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Successful AI Milestone Decomposition
    Given the user enters goal "Google SWE Internship Interview" and deadline "2026-12-20T10:00:00Z"
    When the user clicks "Decompose with Gemini"
    Then the system sends a structured prompt to Google Gemini 3.8 Flash
    And receives a JSON payload with between 3 and 5 sequential milestones
    And each milestone has a distinct title and relative day offset
    And an empowering affirmation under 120 characters is displayed
  ```

### F-02: Deterministic Heuristic Fallback Engine
- **Functional Description:** Activates automatically if the Gemini API call times out ($> 4000\text{ms}$), returns a network error, or if the client is running offline without an API key.
- **Algorithm:** Computes the total duration $\Delta T = t_{\text{deadline}} - t_{\text{now}}$ and divides the interval into 4 equal quarters ($25\%, 50\%, 75\%, 100\%$).
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Offline Fallback Generation
    Given the user has no internet connection or Gemini API returns HTTP 429/500
    When the user clicks "Decompose Goal"
    Then the system triggers the HeuristicGenerator within 5ms
    And divides the timeline into 4 equidistant milestone phases
    And displays a non-blocking toast "Generated offline using heuristic engine"
  ```

### F-03: Drift-Compensated Real-Time Chronometer
- **Functional Description:** Computes remaining Days, Hours, Minutes, and Seconds updated at 60 fps.
- **Mathematical Invariant:** Cumulative drift must equal zero: $\Delta t = t_{\text{system}} - t_{\text{target}}$.
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Accurate Countdown Ticking
    Given an active target deadline 10 days, 4 hours in the future
    When the application executes on the main thread or resumes from background
    Then the countdown displays exact days, hours, minutes, and seconds
    And delta calculation against performance.now() ensures zero cumulative time drift
  ```

### F-04: Smartphone Lock Screen Ergonomic Simulator
- **Functional Description:** Provides an interactive canvas/SVG overlay replicating real-world smartphone system chrome (Apple iOS Dynamic Island, Clock, Lock Screen Widgets, Home Indicator, and Android Material You Status Bar).
- **Ergonomic Clearance:** Upper $28\%$ of canvas is highlighted as reserved for OS system clock; bottom $18\%$ is flagged as gesture space.
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Ergonomic Safe-Zone Validation
    Given the user is previewing their generated lock screen design
    When the user toggles "Lock Screen Overlay"
    Then translucent system clock and Dynamic Island graphics render on top
    And all custom countdown text and milestones remain 100% visible in the safe zone
  ```

### F-05: High-DPI Wallpaper Canvas Rasterizer
- **Functional Description:** Generates a downloadable $1170 \times 2532$ wallpaper image using client-side HTML5 Canvas 2D with $2\times$ supersampling.
- **Export Formats:** PNG (lossless) and JPEG (quality 0.95).
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: High-DPI Wallpaper Export
    Given the user has configured their goal, milestones, and selected a theme
    When the user clicks "Download Lock Screen Wallpaper"
    Then the OffscreenCanvas renders at 2340x5064 and downsamples to 1170x2532
    And the browser triggers an instant file download named "countdown-lockscreen.png"
    And the total rasterization process completes in under 350 milliseconds
  ```

### F-06: Tri-Palette Thematic Design Engine
- **Functional Description:** Allows immediate 1-click theme switching across 3 curated aesthetic presets:
  1. *Cyber Obsidian:* Jet black background (`#08090d`), electric cyan (`#06b6d4`), and neon indigo (`#6366f1`).
  2. *Deep Focus Zen:* Deep slate (`#0f172a`), warm amber (`#f59e0b`), and soft cream typography.
  3. *Aurora Botanical:* Midnight emerald (`#064e3b`), vibrant mint (`#10b981`), and subtle gold accents.
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Theme Selection
    Given the user selects the "Aurora Botanical" theme
    When the canvas and preview re-render
    Then background gradients update to midnight emerald and typography updates to mint
    And contrast ratio against background exceeds 7:1 across all digits
  ```

### F-07: Stateless URL Hash State Sharing
- **Functional Description:** Serializes all user configuration parameters (Goal title, deadline, milestones, theme ID) into a compressed URL hash string (e.g., `#v1=eyJnb2FsIjoi...`).
- **BDD Acceptance Criteria:**
  ```gherkin
  Scenario: Shareable URL State Restoration
    Given a user accesses the web app with a URL containing a valid #v1= hash
    When the application initializes
    Then it deserializes the Base64 payload, parses the JSON state, and restores the countdown
    Without requiring any server-side database lookups
  ```

### F-08: Sensory Feedback Engine (Web Audio & Haptics)
- **Functional Description:** Synthesizes major chord victory chime via procedural Web Audio API with a 4-state lifecycle, and triggers native tactile haptic feedback (`navigator.vibrate`) on milestone toggles and celebration (`FR-16`, `FR-17`).

### F-09: Token Bucket History Synchronization & Codec Defense
- **Functional Description:** Rate-limits `history.replaceState` via a 30-token leaky bucket ($r=2/\text{s}$), mirrors state to `sessionStorage`, and blocks decompression bombs exceeding 32 KB (`FR-18`).

### F-10: Mobile Ergonomic Safe Zones & Tri-Modal Layout
- **Functional Description:** Reserves 28% top margin for system clocks and widgets, 18% bottom margin for home indicators, clamps progress rings ($r_{\text{ring}} \le 220\text{px}$), adapts to soft keyboards via `visualViewport`, and supports ultra-tall, standard, and foldable dual-column layouts (`FR-20`).

### F-11: Confetti Celebration Physics & Font Preloading Gate
- **Functional Description:** Simulates celebratory particles using flat `Float32Array` Structure-of-Arrays (SoA) buffers with aerodynamic air drag, honors `prefers-reduced-motion`, and gates canvas rendering via `FontService` to eliminate FOIT (`FR-21`, `FR-22`).

### F-12: Multi-Tab State Synchronization & Single-Instance Alarm Mutex
- **Functional Description:** Broadcasts milestone checkoffs, title edits, and theme modifications across all open tabs on the same origin via `BroadcastChannel('countdown_lockscreen_sync')`, and arbitrates celebratory chime playback via `navigator.locks.request('countdown_victory_alarm_lock', { ifAvailable: true })` so only one tab synthesizes audio upon timer zero (`FR-23`, `FR-24`).

---
### F-13: OpenType Tabular Numeral Chronometry with Zero Cumulative Layout Shift (Zero CLS)
- **Functional Description:** Enforces OpenType tabular figures (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1;`) across countdown chronometer digits, guaranteeing uniform glyph advance widths ($w(g_1) = w(g_2) = W_{\text{cell}}$) and mathematically eliminating layout shifts ($CLS \equiv 0.000$) during 1Hz state transitions (`FR-25`, `INV-018`, `ADR-013`).

### F-14: 9-Stage Offscreen Canvas Wallpaper Composition & Dynamic Ambient Scrim
- **Functional Description:** Executes a 9-stage rasterization pipeline on an isolated OffscreenCanvas with adaptive buffer allocation ($S \le 2.0$, area $\le 16.7\text{MP}$, dimension $\le 4096\text{px}$). Samples 256 background luminance points in the content zone ($y \in [0.28H, 0.82H]$); if spatial relative luminance $\bar{Y}_{\text{bg}} > 0.35$, dynamically composites an adaptive gradient scrim ($\alpha \in [0.45, 0.75]$) ensuring APCA $L^c \ge 75$ under sunlight (`FR-26`, `FR-27`, `INV-019`, `ADR-014`).

### F-15: Tri-Modal Sensory Synchronization for Milestones & Victory Immersion
- **Functional Description:** Synchronizes visual spring kinetics ($m\ddot{x} + c\dot{x} + kx = 0, \zeta \approx 0.70$), procedural Web Audio ADSR harmonic chords ($C_5 \to E_5 \to G_5$ pentatonic chime and $C_4+E_4+G_4+C_5$ victory fanfare), and W3C Vibration API tactile pulses within a $<20\text{ms}$ inter-sensory offset window, zero external assets, and zero network latency (`FR-28`, `INV-020`, `ADR-015`).

---

## 4.1 Formal User Stories & BDD Acceptance Criteria (US-01 to US-17)

### US-15: OpenType Tabular Numeral Chronometry with Zero CLS
- **Story:** As a goal-oriented user glancing at my 1Hz countdown chronometer, I want the digits to maintain fixed advance widths so that adjacent labels, separators, and card boundaries never jitter or shift layout ($CLS = 0.000$).
- **Gherkin Acceptance Criteria:**
  ```gherkin
  Scenario: 1Hz countdown tick maintains zero cumulative layout shift
    Given the countdown chronometer is running at 1Hz
    When a second elapses and the digit transitions from '1' to '0'
    Then the advance width of the numeral container shall remain strictly identical
    And the cumulative layout shift (CLS) reported by PerformanceObserver shall equal 0.000
  ```

### US-16: 9-Stage Canvas Wallpaper Export with Dynamic Ambient Scrim
- **Story:** As a mobile user exporting a custom lock screen wallpaper, I want the canvas composition engine to adaptively tone-map high-luminance wallpapers and fit my flagship phone's native resolution without GPU memory crashes ($S \le 2.0$), ensuring text legibility ($L^c \ge 75$) under outdoor direct sunlight.
- **Gherkin Acceptance Criteria:**
  ```gherkin
  Scenario: High-luminance background triggers adaptive ambient scrim
    Given the user selects a custom wallpaper with relative luminance Y_bg > 0.35
    When the user requests "Export Lock Screen Wallpaper"
    Then the 9-stage canvas pipeline shall sample luminance across 256 sample coordinates
    And composite a vertical gradient scrim with alpha between 0.45 and 0.75
    And the resulting APCA text contrast L^c shall meet or exceed 75
    And the allocated buffer area shall remain strictly <= 16,777,216 pixels
  ```

### US-17: Tri-Modal Sensory Synchronization for Milestones & Victory
- **Story:** As an achiever completing milestones, I want coordinated visual spring kinetics, procedural Web Audio chimes, and tactile haptic pulses synchronized within $20\text{ms}$, so that I experience satisfying tactile reinforcement without network latency or asset bloat.
- **Gherkin Acceptance Criteria:**
  ```gherkin
  Scenario: Milestone checkoff triggers deterministic tri-modal feedback
    Given the user clicks a milestone checkbox
    When the state store transitions the milestone to completed
    Then the visual spring animation, procedural Web Audio chime, and haptic impulse shall trigger concurrently
    And the measured temporal offset between sensory modalities shall be less than 20ms
    And zero external audio files (.mp3, .wav) shall be fetched across the network
  ```


## 5. Hard System Invariants & Architectural Constraints (INV-001 to INV-020)

The application design is mathematically bounded by 20 immutable mathematical invariants guaranteeing sub-pixel precision, zero-drift timing, zero-PII privacy, and multi-tab coordination:

| Invariant ID | Formulation / Constraint | Physical / Psychological Rationale |
|:---|:---|:---|
| **INV-001** | $|y_{\text{snap}} \cdot \text{DPR} - \text{round}(y_{\text{snap}} \cdot \text{DPR})| = 0.00000$ | Quantizes vertical layout to physical device pixels, eliminating text blur. |
| **INV-002** | $L^* \in [0, 1], a^*, b^* \in [-0.5, 0.5]$ | Preserves Oklab gamut bounds; prevents chromatic clipping on OLED displays. |
| **INV-003** | $y'(x) \ge 0.00000 \quad \forall x \in [0, 1]$ | Fritsch-Carlson monotone cubic spline guarantees zero progress bar overshoot. |
| **INV-004** | $|\text{scaleX} - \text{scaleY}| = 0.00000$ | Enforces isotropic 2D affine scaling; prevents circular widgets from warping. |
| **INV-005** | $\text{ID} = \log_2(1 + 2D/W) \le 3.50000\text{ bits}$ | Fitts's Law threshold ensuring one-handed thumb ergonomics on mobile. |
| **INV-006** | $\sqrt{\Delta x^2 + \Delta y^2} \le 2.00000\text{ px}$ | Micro-orbital shifting prevents static OLED phosphor burn-in on lock screens. |
| **INV-007** | $V(D) \to A = 100 \text{ as } D \to 0$ | Mazur hyperbolic urgency model bounds motivation curve asymptotically. |
| **INV-008** | $\theta_{\text{end}} - \theta_{\text{start}} \le 2\pi - 10^{-6}$ | Prevents arc singularity and self-intersection in circular progress canvas. |
| **INV-009** | $\text{FPS}_{\text{idle}} \le 15.0000$ | Clamps frame rate during static preview; conserves device battery and thermals. |
| **INV-010** | $\|M \cdot M^{-1} - I\| \le 10^{-12}$ | Double-precision matrix inversion precision; eliminates floating-point drift. |
| **INV-011** | $\lim_{t \to \infty} \|v(t)\| \le 738.00\text{ px/s}$ | Symplectic particle physics terminal velocity clamp preventing runaway motion. |
| **INV-012** | $P = 1.00000 \text{ when } t_{\text{total}} \le 0$ | Zero-duration goal guard eliminating IEEE 754 NaN division errors. |
| **INV-013** | $S^* \le \min(\text{DPR}, S_{\text{area}}, S_{\text{edge}})$ | Adaptive buffer solver limits canvas backing store to WebKit 16.7MP ceiling. |
| **INV-014** | $F(\alpha_{\text{final}}) = 1$ | Oklab chroma bisection preserves hue angle $h$ within $\Delta E \le 0.001$. |
| **INV-015** | $S_{\text{effective}} \ge S_{\text{floor}} = 10\text{px}$ | Cross-font fallback minimum size prevents text collision under system font. |
| **INV-016** | $\text{LocksHeld}(\text{alarm}) \le 1$ | Web Locks API mutex guarantees single-tab victory audio playback. |
| **INV-017** | $\Delta t_{\text{sync}} \le 50\text{ms}, \text{senderId} \neq \text{instanceId}$ | BroadcastChannel sync converges within 50ms while discarding cyclic echoes. |
| **INV-018** | $w(d_i) \equiv w(d_j) \quad \forall i, j \in [0, 9] \implies CLS = 0.000$ | Tabular numeral glyph advance width equality eliminates horizontal number wobble and cumulative layout shift. |
| **INV-019** | $S^* \le \min(\text{DPR}, S_{\text{area}}, S_{\text{edge}}) \land (\bar{Y}_{\text{bg}} > 0.35 \implies \alpha \in [0.45, 0.75], L^c \ge 75)$ | Dual-constraint buffer allocation and dynamic ambient scrim guarantee contrast under outdoor sunlight without GPU OOM. |
| **INV-020** | $\max(|\Delta t_{\text{visual}} - \Delta t_{\text{audio}}|, |\Delta t_{\text{audio}} - \Delta t_{\text{haptic}}|) < 20\text{ms}$ | Tri-modal sensory synchronization binds visual spring ODE, Web Audio ADSR, and haptics within perceptual simultaneity window. |

### 5.1 System-Level Architectural Constraints (SYS-INV-001 to SYS-INV-010)

In addition to the 20 mathematical invariants above, the system enforces 10 overarching macro-architectural invariants:

| Constraint ID | Architectural Guarantee | Enforcement Mechanism |
|:---|:---|:---|
| **SYS-INV-001** | **Future Target Timestamp:** Countdown target must be strictly $> \text{now}$. | Form validation rejection & disabled submission state. |
| **SYS-INV-002** | **Cognitive Checkpoint Bounding:** Exactly 3 to 5 milestone checkpoints. | Gemini JSON Schema validation & Heuristic Generator bounds. |
| **SYS-INV-003** | **Upper Clock Safe-Zone Exclusion:** Top 28% of lock screen preserved. | `SafeZoneOverlay` clipping & layout translation bounds. |
| **SYS-INV-004** | **Lower Gesture Safe-Zone Exclusion:** Bottom 18% of lock screen preserved. | Ergonomic clearance zone above home indicator / navigation bar. |
| **SYS-INV-005** | **Flagship High-DPI Resolution:** Canvas export native resolution $1170 \times 2532\text{px}$. | Bilinear downsampling from supersampled buffer ($S \le 2.0$). |
| **SYS-INV-006** | **Zero Runtime Chronometry Drift:** Timing error accumulates $< 1\text{ms}$. | Dual-Clock model coupling UTC epoch timestamps with RAF loop. |
| **SYS-INV-007** | **Zero Server PII Persistence:** Exactly 0 bytes stored on remote servers. | Pure client-side execution; state preserved solely in URL hash / local session. |
| **SYS-INV-008** | **Outdoor Sunlight Contrast:** Body text APCA $L^c \ge 60$, digits $L^c \ge 75$. | Adaptive ambient scrim composite when $\bar{Y}_{\text{bg}} > 0.35$. |
| **SYS-INV-009** | **Sub-Second Edge Delivery:** First Contentful Paint $FCP < 0.8\text{s}$. | Static PWA bundle hosted on global GitHub Pages Edge CDN. |
| **SYS-INV-010** | **Multi-Tab Alarm Mutex:** Exactly 1 tab plays victory audio upon zero epoch. | W3C Web Locks API (`navigator.locks.request`) single-instance lock. |

---

## 6. Non-Functional Requirements & Performance SLAs

| NFR ID | Category | Metric / Requirement | Target SLA | Verification Method |
|:---|:---|:---|:---|:---|
| **NFR-01** | Performance | First Contentful Paint (FCP) over 4G | $\le 0.8\text{ seconds}$ | WebPageTest & Lighthouse CI |
| **NFR-02** | Performance | Largest Contentful Paint (LCP) | $\le 1.2\text{ seconds}$ | Chrome Web Vitals Trace |
| **NFR-03** | Performance | Cumulative Layout Shift (CLS) | Strictly $0.00$ | Chrome Performance API |
| **NFR-04** | Performance | Canvas Rasterization Time | $\le 350\text{ ms}$ | `performance.measure()` |
| **NFR-05** | Resilience | Frame Rate Stability | Steady $60\text{ fps}$ ($\ge 58\text{ fps}$) | FPS Meter in DevTools |
| **NFR-06** | Accessibility | Visual Contrast Ratio | $\ge 4.5:1$ (Body), $\ge 7.0:1$ (Digits) | APCA & WCAG 2.1 AA/AAA |
| **NFR-07** | Security | Server-Side Data Persistence | Exactly $0\text{ bytes}$ (Zero PII) | Network Payload Audit |
| **NFR-08** | Memory | Heap Allocation Ceiling | $< 50\text{ MB}$ total heap | Chrome Memory Profiler |
| **NFR-09** | Compatibility | Cross-Browser Coverage | Chrome, Safari iOS, Edge, Firefox | BrowserStack Automated Grid |
| **NFR-10** | Offline | Progressive Web App Caching | 100% Core Functionality Offline | Service Worker Cache Audit |
| **NFR-11** | Security / Cache | Scoped SW Cache Scoping | 0 Stale Bundles & Query Stripping | Automated Cache Audit |

---

## 7. Edge Cases & Degraded UX Handling

| Edge Case ID | Scenario | Potential Impact | System Mitigation & Recovery Strategy |
|:---|:---|:---|:---|
| **EDGE-01** | **Past Deadline Input:** User enters a date/time in the past. | Negative countdown calculation ($T < 0$). | Form validator rejects input with message: *"Target deadline must be in the future (minimum 1 hour)"*. Submit button disabled. |
| **EDGE-02** | **Extreme Temporal Range:** User inputs deadline $> 5\text{ years}$ away. | Milestone dates spaced too widely; display overflow. | System clamps maximum countdown display to days; Gemini decomposes into annual/quarterly phases. |
| **EDGE-03** | **Network Disconnection:** User clicks AI decompose while offline. | API request failure (HTTP timeout / network err). | System intercepts error within 50ms and seamlessly invokes `HeuristicGenerator` without user friction. |
| **EDGE-04** | **API Rate Limiting (HTTP 429):** Free tier quota exhausted. | Broken UI / unhandled promise rejection. | Circuit breaker trips; UI degrades gracefully to local heuristic planner with informational toast. |
| **EDGE-05** | **Unicode & Emojis in Goal:** User inputs strings like `"🚀 Graduate Stanford 🎓"`. | Canvas font clipping or encoding failure in URL hash. | UTF-8 safe `TextEncoder` serialization; Canvas font fallback list includes `Apple Color Emoji, Segoe UI Emoji`. |
| **EDGE-06** | **Leap Day / Daylight Savings:** Target deadline crosses Feb 29 or DST shift. | Time drift by $\pm 1\text{ hour}$. | All time calculations anchored to UTC milliseconds epoch (`Date.getTime()`), completely immune to local DST shifts. |

---

## 8. Product Release Roadmap

```mermaid
gantt
    title Product Delivery & Release Milestones
    dateFormat  YYYY-MM-DD
    section Phase 1: Architecture
    SDLC 10/10 Specs & UML Modeling     :done, des1, 2026-11-22, 1d
    section Phase 2: MVP Core
    DualClockTimeEngine & Heuristic Generator    :active, dev1, 2026-11-22, 1d
    Canvas 2D 1170x2532 Rasterizer      :active, dev2, 2026-11-22, 1d
    Safe-Zone Simulator & 3 Themes      :dev3, 2026-11-23, 1d
    section Phase 3: AI & PWA
    Google Gemini 3.8 Flash SDK Client  :dev4, 2026-11-23, 1d
    URL State Sharing & Service Worker  :dev5, 2026-11-23, 1d
    section Phase 4: Polish & Contest
    Lighthouse CI Audit & Edge Hosting  :dev6, 2026-11-23, 1d
    Final Handshake Submission Package  :crit, dev7, 2026-11-23, 1d
```
