# Level 5: Software Requirements Specification (SRS)

**Document ID:** `DOC-05-SRS`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (ISO/IEC/IEEE 29148 Standard)

---

## 1. System Scope & IEEE 29148 Purpose

This document establishes the formal, verifiable Software Requirements Specification (SRS) for the **AI-Powered Countdown Lock Screen & Wallpaper Generation Engine**, conforming to the **ISO/IEC/IEEE 29148:2018** international standard for systems and software engineering.

The system is a dual-deliverable Progressive Web Application:
1. An interactive, client-side web application that calculates drift-compensated countdown chronometry and backward milestone planning.
2. A high-DPI graphics rasterizer that exports pixel-perfect $1170 \times 2532$ lock screen wallpapers respecting smartphone OS safe-zone ergonomics.

---

## 2. Functional Requirements Specification (FR-01 to FR-15)

Each functional requirement is formally specified with unique identifier, description, inputs, transformations, outputs, and verification method:

### FR-01: Target Deadline Ingress & Temporal Validation
- **Requirement:** The system shall accept a target date, time, and goal title from the user, validating that the target deadline is strictly in the future.
- **Preconditions:** User enters the application input view.
- **Input:** `goalTitle` (String, $3 \le \text{length} \le 60$), `targetDate` (ISO-8601 string or date picker input).
- **Processing:** Normalizes target time to UTC milliseconds epoch. Asserts that $t_{\text{target}} \ge t_{\text{now}} + 3600000\text{ms}$ (at least 1 hour into future).
- **Output:** Validated `TemporalTarget` or validation error with actionable UI hint.
- **Verification Method:** Test (`TC-POS-01`, `TC-NEG-01`).

### FR-02: Gemini AI Backward Milestone Decomposition
- **Requirement:** The system shall invoke Google Gemini 3.8 Flash to decompose the goal into 3 to 5 sequential retrograde milestones working backward from the deadline.
- **Preconditions:** Valid goal title and deadline; client connected to internet.
- **Input:** Sanitized goal title, target timestamp, system instructions.
- **Processing:** Invokes Gemini API with structured JSON output schema. Parses array of milestone items.
- **Output:** Validated `MilestonePlanResponse` containing 3–5 milestone items with day offsets.
- **Verification Method:** Test (`TC-POS-02`, `TC-EDGE-01`).

### FR-03: Deterministic Heuristic Fallback Planner
- **Requirement:** If the Gemini API call exceeds $4000\text{ms}$, returns an HTTP error (e.g. 429/500), or if the client is offline, the system shall deterministically divide the temporal interval into 4 equidistant milestone phases.
- **Preconditions:** API failure detected or offline state asserted.
- **Input:** Total interval $\Delta T = t_{\text{deadline}} - t_{\text{now}}$.
- **Processing:** Computes quarter-interval partitions ($75\%, 50\%, 25\%, 0\%$). Formulates generic milestone titles.
- **Output:** Complete `MilestonePlanResponse` generated in $< 5\text{ms}$ with zero network calls.
- **Verification Method:** Test (`TC-NEG-02`).

### FR-04: Motivational Affirmation Synthesis
- **Requirement:** The system shall generate a tailored, psychologically empowering daily affirmation string ($\le 120$ characters) matching the user's specific goal domain.
- **Preconditions:** Successful Gemini or heuristic milestone generation.
- **Output:** String rendered below milestones on the preview and wallpaper canvas.
- **Verification Method:** Inspection & Test (`TC-POS-02`).

### FR-05: Drift-Compensated Real-Time Chronometer
- **Requirement:** The system shall compute real-time remaining temporal units (Days, Hours, Minutes, Seconds) updated on every browser animation frame ($16.6\text{ms}$).
- **Processing:** Calculates $\Delta t = t_{\text{deadline}} - \text{Date.now()}$. Deconstructs into whole integer units:
  - $\text{Days} = \lfloor \Delta t / 86400000 \rfloor$
  - $\text{Hours} = \lfloor (\Delta t \pmod{86400000}) / 3600000 \rfloor$
  - $\text{Minutes} = \lfloor (\Delta t \pmod{3600000}) / 60000 \rfloor$
  - $\text{Seconds} = \lfloor (\Delta t \pmod{60000}) / 1000 \rfloor$
- **Verification Method:** Test (`TC-POS-03`).

### FR-06: Zero-Drift Clock Synchronization
- **Requirement:** The countdown ticker shall synchronize against hardware `performance.now()` deltas to eliminate cumulative time drift across background tab throttling.
- **Mathematical Bound:** Cumulative timing drift $\lim_{n \to \infty} \sum e(t_n) = 0$.
- **Verification Method:** Test (`TC-EDGE-02`).

### FR-07: Interactive Milestone Management
- **Requirement:** The user shall be able to add, edit, delete, and toggle completion checkmarks on intermediate milestones in real time.
- **Processing:** State store updates milestone `completed: boolean` flag; triggers dynamic progress recalculation.
- **Verification Method:** Test (`TC-POS-04`).

### FR-08: Progress Metric Derivation
- **Requirement:** The system shall calculate overall goal completion percentage combining elapsed time and completed milestone checkpoints:
  
  $$\text{Progress \%} = 0.5 \left( \frac{t_{\text{now}} - t_{\text{start}}}{t_{\text{deadline}} - t_{\text{start}}} \right) + 0.5 \left( \frac{N_{\text{completed}}}{N_{\text{total}}} \right)$$

- **Verification Method:** Analysis & Test.

### FR-09: Lock Screen Ergonomic Simulator Overlay
- **Requirement:** The system shall provide an interactive visual overlay representing iOS (Dynamic Island, system clock, lock screen widgets) and Android UI chrome.
- **Verification Method:** Demonstration (`TC-POS-05`).

### FR-10: Upper Safe-Zone Reservation Enforcement
- **Requirement:** The rendering engine shall maintain at least a $28\%$ vertical top margin ($Y \ge 708\text{px}$ on a $2532\text{px}$ canvas) free of high-contrast text, preventing collision with device clocks.
- **Verification Method:** Test (`TC-POS-06`).

### FR-11: High-DPI Wallpaper Rasterization
- **Requirement:** The system shall render a pixel-perfect $1170 \times 2532$ portrait wallpaper using an HTML5 Canvas 2D context.
- **Verification Method:** Test (`TC-POS-07`).

### FR-12: 2x Canvas Supersampling
- **Requirement:** The canvas rendering engine shall execute at $2\times$ scale ($2340 \times 5064\text{px}$) and downsample to $1170 \times 2532\text{px}$ to eliminate sub-pixel font rasterization artifacts.
- **Verification Method:** Test (`TC-POS-08`).

### FR-13: Thematic Preset Selector
- **Requirement:** The user shall be able to switch between Cyber Obsidian, Deep Focus Zen, and Aurora Botanical visual palettes with instant DOM and Canvas token updates.
- **Verification Method:** Test (`TC-POS-09`).

### FR-14: Stateless URL Hash State Sharing
- **Requirement:** The system shall serialize the complete user configuration into a Base64 URL hash (`#v1=...`) and restore it upon page load without server calls.
- **Verification Method:** Test (`TC-POS-10`, `TC-NEG-03`).

### FR-15: Direct 1-Click Binary Image Export
- **Requirement:** The system shall provide an instant 1-click download button exporting the generated lock screen as a standard PNG or JPEG image blob.
- **Verification Method:** Demonstration (`TC-POS-11`).

---

## 3. Non-Functional Requirements Specification (NFR-01 to NFR-10)

| NFR ID | Attribute | Specification & Acceptance Threshold | Verification Method |
|:---|:---|:---|:---|
| **NFR-01** | Performance | First Contentful Paint (FCP) $\le 0.8\text{ seconds}$ on standard mobile 4G. | Lighthouse CI |
| **NFR-02** | Performance | Cumulative Layout Shift (CLS) strictly equals $0.00$. | PerformanceObserver |
| **NFR-03** | Performance | Countdown animation ticker executes at steady $60\text{ fps}$ ($\ge 58\text{ fps}$). | Frame timing monitor |
| **NFR-04** | Performance | Canvas wallpaper rasterization completes in $\le 350\text{ milliseconds}$. | `performance.now()` trace |
| **NFR-05** | Accessibility | Text elements satisfy APCA $L^c \ge 75$ and WCAG 2.1 AA ($\ge 4.5:1$, $\ge 7:1$ for digits). | Contrast calculator |
| **NFR-06** | Privacy | Zero server-side PII or analytics telemetry stored externally ($0\text{ bytes}$). | Network payload inspection |
| **NFR-07** | Reliability | 100% offline functionality after initial Service Worker cache population. | Offline simulation |
| **NFR-08** | Memory | Heap memory ceiling during $2\times$ canvas supersampling strictly $\le 50\text{ MB}$. | Chrome Heap Snapshot |
| **NFR-09** | Ergonomics | Mobile touch targets adhere to Fitts's Law: minimum $44 \times 44\text{ pixels}$. | DOM geometry audit |
| **NFR-10** | Code Quality | Clean TypeScript codebase with zero `any` types and $100\%$ docstring coverage. | `tsc --noEmit` & ESLint |

---

## 4. Comprehensive Requirements Traceability Matrix (RTM)

```
+-------------------------------------------------------------------------------------------------------+
|                                    REQUIREMENTS TRACEABILITY MATRIX                                   |
+---------+--------------------+---------------------+----------------------+---------------------------+
| Req ID  | PRD Feature Link   | HLD Component       | LLD Class / File     | Test Case ID              |
+---------+--------------------+---------------------+----------------------+---------------------------+
| FR-01   | F-02 Countdown     | InputController     | TimeEngine.ts        | TC-POS-01, TC-NEG-01      |
| FR-02   | F-01 Gemini AI     | GeminiGateway       | GeminiClient.ts      | TC-POS-02, TC-EDGE-01     |
| FR-03   | F-01 Fallback      | HeuristicEngine     | HeuristicGen.ts      | TC-NEG-02                 |
| FR-04   | F-01 Affirmation   | GeminiGateway       | GeminiClient.ts      | TC-POS-02                 |
| FR-05   | F-02 Chronometer   | TimeEngine          | TimeEngine.ts        | TC-POS-03                 |
| FR-06   | F-02 Zero Drift    | TimeEngine          | TimeEngine.ts        | TC-EDGE-02                |
| FR-07   | F-03 Milestones    | MilestoneStore      | MilestoneMgr.ts      | TC-POS-04                 |
| FR-08   | F-03 Progress Calc | MilestoneStore      | MilestoneMgr.ts      | TC-POS-04                 |
| FR-09   | F-04 Safe Zone     | SimulatorOverlay    | SafeZoneOverlay.ts   | TC-POS-05                 |
| FR-10   | F-04 28% Margin    | CanvasCompositor    | CanvasRenderer.ts    | TC-POS-06                 |
| FR-11   | F-05 1170x2532     | CanvasCompositor    | CanvasRenderer.ts    | TC-POS-07                 |
| FR-12   | F-05 2x Supersample| CanvasCompositor    | CanvasRenderer.ts    | TC-POS-08                 |
| FR-13   | F-06 Themes        | ThemeController     | ThemeConfig.ts       | TC-POS-09                 |
| FR-14   | F-07 URL Hash      | UrlSerializer       | UrlStateService.ts   | TC-POS-10, TC-NEG-03      |
| FR-15   | F-05 Download      | BlobExporter        | CanvasRenderer.ts    | TC-POS-11                 |
+---------+--------------------+---------------------+----------------------+---------------------------+
```

---

## 5. Architectural & Mathematical Blueprint Cross-References
- **Mathematical Blueprint:** `docs/lld/09-pixel-perfect-mathematical-blueprint.md` (`DOC-LLD-09`) defines closed-form mathematical equations for 2D Affine TRS transforms, DPR sub-pixel quantization, Oklab perceptual color space, Fritsch-Carlson monotone cubic splines, Fitts's Law ergonomics, and OLED micro-orbital shifting.
- **System Vulnerability Audit:** `docs/lld/08-system-design-vulnerability-audit.md` (`DOC-LLD-08`) covers the exhaustive 100-vulnerability resilience suite across 44 architectural dimensions.

