# Level 10: Management Specification — Requirements Traceability Matrix (RTM)

**Document ID:** `DOC-MGT-03-RTM`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Bidirectional Traceability Standard)

---

## 1. Functional Requirements Bidirectional Traceability Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                  FUNCTIONAL REQUIREMENTS TRACEABILITY MATRIX                                  |
+---------+--------------------+---------------------+----------------------+-----------------------------------+
| Req ID  | PRD Feature Link   | HLD Component       | Target Implementation| Test Case Verification ID         |
+---------+--------------------+---------------------+----------------------+-----------------------------------+
| **FR-01**| F-02 Countdown     | IngressController   | `js/core/InputSanitizer.js`| `TC-POS-01`, `TC-NEG-01`, `TC-NEG-02`, `TC-NEG-09`|
| **FR-02**| F-01 Gemini AI     | GeminiGateway       | `js/ai/GeminiAiClient.js`    | `TC-POS-02`, `TC-NEG-14`, `TC-EDGE-22`|
| **FR-03**| F-01 Fallback      | HeuristicEngine     | `js/ai/HeuristicGenerator.js`| `TC-NEG-04`, `TC-NEG-05`        |
| **FR-04**| F-01 Affirmation   | GeminiGateway       | `js/ai/GeminiAiClient.js`    | `TC-POS-03`                       |
| **FR-05**| F-02 Chronometer   | DualClockTimeEngine | `js/core/DualClockTimeEngine.js`| `TC-POS-04`, `TC-POS-100`, `TC-POS-101`|
| **FR-06**| F-02 Zero Drift    | DualClockTimeEngine | `js/core/DualClockTimeEngine.js`| `TC-POS-05`, `TC-EDGE-01`, `TC-EDGE-02`|
| **FR-07**| F-03 Milestones    | MilestoneStore      | `js/core/MilestoneManager.js`| `TC-POS-06`, `TC-EDGE-13`        |
| **FR-08**| F-03 Progress Calc | MilestoneStore      | `js/core/MilestoneManager.js`| `TC-POS-07`                     |
| **FR-09**| F-04 Safe Zone     | SimulatorOverlay    | `js/canvas/SafeZoneOverlay.js`| `TC-POS-08`, `TC-EDGE-14`        |
| **FR-10**| F-04 28% Margin    | LayoutEngine        | `js/canvas/ResponsiveLayoutEngine.js`| `TC-POS-08`, `TC-POS-113`|
| **FR-11**| F-05 High-DPI      | AdaptiveAllocator   | `js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-09`, `TC-EDGE-04`|
| **FR-12**| F-05 Adaptive Scale| AdaptiveAllocator   | `js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-09`, `TC-EDGE-03`|
| **FR-13**| F-06 Themes        | ThemeController     | `js/config/themes.js`      | `TC-POS-11`, `TC-POS-12`, `TC-EDGE-23`|
| **FR-14**| F-07 URL Hash      | StateSerializer     | `js/core/UrlStateService.js`| `TC-POS-13`, `TC-POS-14`, `TC-NEG-06`, `TC-NEG-12`, `TC-NEG-13`|
| **FR-15**| F-05 Download      | BlobExporter        | `js/canvas/CanvasRenderer.js`| `TC-POS-10`                     |
| **FR-16**| F-05 Audio FSM     | AudioService        | `js/services/AudioService.js`| `TC-POS-16`, `TC-NEG-10`, `TC-EDGE-17`, `TC-POS-108`, `TC-POS-109`|
| **FR-17**| F-05 Haptics       | HapticService       | `js/services/HapticService.js`| `TC-POS-17`                     |
| **FR-18**| F-07 History Guard | TokenBucketGuard    | `js/core/TokenBucketHistoryGuard.js`| `TC-NEG-11`, `TC-EDGE-10`, `TC-EDGE-11`|
| **FR-19**| F-05 Web Share     | ShareService        | `js/canvas/CanvasRenderer.js`| `TC-NEG-11`                     |
| **FR-20**| F-04 Safe Zones/VP | LayoutEngine        | `js/canvas/ResponsiveLayoutEngine.js`| `TC-POS-08`, `TC-POS-18`, `TC-EDGE-05`, `TC-EDGE-06`, `TC-POS-112`|
| **FR-21**| F-05 Confetti SoA  | ParticleEngine      | `js/canvas/ParticleEngine.js`| `TC-POS-19`, `TC-EDGE-18`, `TC-POS-110`, `TC-POS-111`|
| **FR-22**| F-05 Font Barrier  | FontService         | `js/services/FontService.js` | `TC-POS-20`, `TC-EDGE-24`, `TC-POS-114`|
+---------+--------------------+---------------------+----------------------+-----------------------------------+
```

---

## 2. Non-Functional Requirements (NFR) Traceability Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                NON-FUNCTIONAL REQUIREMENTS TRACEABILITY MATRIX                                |
+---------+------------------------+---------------------+--------------------+---------------------------------+
| NFR ID  | Engineering Category   | SLA Target Metric   | Governing Standard | Verification Evidence           |
+---------+------------------------+---------------------+--------------------+---------------------------------+
| **NFR-01**| Sub-Second Edge FCP    | $\text{FCP} \le 800\text{ms}$  | `DOC-OPS-03`       | `DOC-OBS-02`, Lighthouse CI     |
| **NFR-02**| Sub-Second Edge LCP    | $\text{LCP} \le 1200\text{ms}$ | `DOC-OPS-03`       | `DOC-OBS-02`, Lighthouse CI     |
| **NFR-03**| Zero Layout Shift      | $\text{CLS} = 0.000$| `DOC-UI-01`        | `DOC-OBS-02`, Automated CI      |
| **NFR-04**| Interaction Latency    | $\text{INP} \le 50\text{ms}$   | `ADR-010`          | `DOC-OBS-02`, Vitest Harness    |
| **NFR-05**| GPU Memory Safety      | $\le 16.7\text{M pixels}$      | `ADR-004`          | `DOC-LLD-08` (HR-01), Vitest    |
| **NFR-06**| Zero Cumulative Drift  | $0\text{ ms}$ cumulative lag   | `ADR-007`          | `DOC-TEST-02` (`TC-POS-05`)     |
| **NFR-07**| Zero PII Data Storage  | $\text{Cloud PII} = \emptyset$ | `DOC-SEC-03`       | `DOC-SEC-01`, Automated Audit   |
| **NFR-08**| Strict CSP Level 3     | Zero inline scripts | `DOC-SEC-02`       | `DOC-SEC-02`, CSP Evaluator CI  |
| **NFR-09**| Offline Availability   | 100% PWA cache hits | `ADR-008`          | `DOC-TEST-02` (`TC-POS-15`)     |
| **NFR-10**| WCAG / APCA Contrast   | $L^c \ge 75$ (AAA)  | `DOC-UI-03`        | `DOC-UI-03`, Contrast Analyzer  |
+---------+------------------------+---------------------+--------------------+---------------------------------+
```

---

## 3. Architecture Decision Records (ADR) Traceability Matrix

```
+---------+-----------------------------------+-----------------------------------+-------------------------------------+
| ADR ID  | Architectural Topic               | Core Decision Driver              | Primary Affected Subsystem / File   |
+---------+-----------------------------------+-----------------------------------+-------------------------------------+
| **ADR-001**| Single-Page App Runtime        | Zero-infrastructure edge delivery | `docs/02-hld.md`, GitHub Pages Edge |
| **ADR-002**| Dual-Engine Canvas vs DOM       | 60 FPS ticker + 1170x2532 export  | `js/canvas/CanvasRenderer.js`       |
| **ADR-003**| URL Hash State Serialization    | Frictionless database-free share  | `js/core/UrlStateService.js`        |
| **ADR-004**| Adaptive Dual-Constraint Scale  | WebKit 16.7M px & 4096px texture  | `js/canvas/AdaptiveBufferAllocator.js`|
| **ADR-005**| Glassmorphic Design System      | Premium OLED lockscreen aesthetic | `src/css/glassmorphism.css`         |
| **ADR-006**| Privacy-First Local Storage     | Zero server PII storage invariant | `docs/security/03-credential-logging.md`|
| **ADR-007**| Dual-Clock Chronometry Anchor   | Prevent mobile sleep timing drift | `js/core/DualClockTimeEngine.js`    |
| **ADR-008**| Cache-First PWA Topology        | 100% offline edge resilience      | `public/sw.js`                      |
| **ADR-009**| Autoplay-Primed Web Audio Chime | Zero asset overhead, no rejection | `js/services/AudioService.js`  |
| **ADR-010**| Token Bucket History Limiter    | WebKit 100-call quota immunity    | `js/core/TokenBucketHistoryGuard.js`|
+---------+-----------------------------------+-----------------------------------+-------------------------------------+
```

---

## 4. Official Contest Evaluation Rubric Traceability (4 x 25%)

```
+--------------------------+--------+-------------------------------------+---------------------------------------------+
| Judging Dimension        | Weight | Primary System Capabilities         | Verification Evidence & Judge Demonstration |
+--------------------------+--------+-------------------------------------+---------------------------------------------+
| **1. Execution**         | 25%    | - Native 1170x2532 portrait canvas. | Step 1 & 6 in `DOC-08` Judge Script;        |
|                          |        | - Dual-Clock drift-compensated loop.| Verified via `TC-POS-05` and `TC-POS-09`.   |
|                          |        | - Sub-350ms OffscreenCanvas raster. | High-DPI print-quality download ready today.|
+--------------------------+--------+-------------------------------------+---------------------------------------------+
| **2. Creativity**        | 25%    | - Google Gemini retrograde planning.| Step 3 in `DOC-08` Judge Script;            |
|                          |        | - Tailored daily affirmations.      | Automatic backward sprint decomposition;    |
|                          |        | - Procedural Web Audio synthesizer. | Zero-asset in-browser harmonic sound.       |
+--------------------------+--------+-------------------------------------+---------------------------------------------+
| **3. Usefulness / Value**| 25%    | - Solves hyperbolic discounting.    | Step 2 in `DOC-08` Judge Script;            |
|                          |        | - Ambient 96 glances/day habit loop.| Milestone checkpoints transform deadline    |
|                          |        | - Frictionless URL sharing (#v1=).  | anxiety into concrete daily momentum.       |
+--------------------------+--------+-------------------------------------+---------------------------------------------+
| **4. Polish & Quality**  | 25%    | - 28% Top & 18% Bottom Safe Zones.  | Step 4 & 5 in `DOC-08` Judge Script;        |
|                          |        | - Tri-Modal responsive layout.      | Zero visual overlap on Dynamic Island;      |
|                          |        | - APCA AAA contrast & OLED themes.  | Crisp glanceability under direct sunlight.  |
+--------------------------+--------+-------------------------------------+---------------------------------------------+
```

---

## 5. The 10 Technical Fundamental Pillars Traceability Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                    10 TECHNICAL FUNDAMENTAL PILLARS MATRIX                                    |
+---------+-----------------------------------+--------------------+--------------------+-----------------------+
| Pillar  | Fundamental Title                 | Primary ADR        | Governed Req IDs   | Verification Evidence |
+---------+-----------------------------------+--------------------+--------------------+-----------------------+
| **P-01**| Vanilla ES2022+ ESM Zero-Build    | `ADR-001`          | `FR-01`, `FR-05`   | `DOC-LLD-01`, `DOC-09`|
| **P-02**| CSS3 Tokens & Specular Glass      | `ADR-005`          | `FR-13`, `NFR-10`  | `DOC-UI-01`, `DOC-09` |
| **P-03**| High-DPI Canvas & Adaptive Buffer | `ADR-002`, `ADR-004`| `FR-11`, `FR-12`  | `DOC-LLD-09`, `DOC-09`|
| **P-04**| Safe-Zone Ergonomics & Tri-Modal  | `ADR-002`          | `FR-09`, `FR-20`   | `DOC-UI-02`, `DOC-09` |
| **P-05**| DualClock Chronometry Engine      | `ADR-007`          | `FR-05`, `FR-06`   | `DOC-LLD-10`, `DOC-09`|
| **P-06**| Gemini 3.8 Flash Backward Plan    | `ADR-001`          | `FR-02`, `FR-04`   | `DOC-03`, `DOC-09`    |
| **P-07**| Procedural Web Audio & Haptics    | `ADR-009`          | `FR-16`, `FR-17`   | `DOC-RES-01`, `DOC-09`|
| **P-08**| Float32Array Confetti Physics     | `ADR-002`          | `FR-21`            | `DOC-LLD-04`, `DOC-09`|
| **P-09**| TokenBucket History & State Codec | `ADR-003`, `ADR-010`| `FR-14`, `FR-18`  | `DOC-SEC-04`, `DOC-09`|
| **P-10**| Zero-PII Security & PWA Offline   | `ADR-006`, `ADR-008`| `FR-19`, `NFR-06`  | `DOC-SEC-02`, `DOC-09`|
+---------+-----------------------------------+--------------------+--------------------+-----------------------+
```
