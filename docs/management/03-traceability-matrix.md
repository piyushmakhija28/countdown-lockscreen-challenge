# Level 10: Management Specification — Requirements Traceability Matrix (RTM)

**Document ID:** `DOC-MGT-03-RTM`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Bidirectional Traceability Standard)  
**Version:** 2.3.4

---

## 1. Functional Requirements Bidirectional Traceability Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                  FUNCTIONAL REQUIREMENTS TRACEABILITY MATRIX                                  |
+---------+--------------------+---------------------+----------------------+-----------------------------------+
| Req ID  | PRD Feature Link   | HLD Component       | Target Implementation| Test Case Verification ID         |
+---------+--------------------+---------------------+----------------------+-----------------------------------+
| **FR-01**| F-02 Countdown     | IngressController   | `js/core/InputSanitizer.js`| `TC-POS-01`, `TC-NEG-01`, `TC-NEG-02`, `TC-NEG-03`, `TC-NEG-09`, `TC-POS-107`|
| **FR-02**| F-01 Gemini AI     | GeminiGateway       | `js/ai/GeminiAiClient.js`<br/>`js/ai/GeminiRateLimiter.js`| `TC-POS-02`, `TC-NEG-14`, `TC-EDGE-22`, `TC-POS-103`|
| **FR-03**| F-01 Fallback      | HeuristicEngine     | `js/ai/HeuristicGenerator.js`| `TC-NEG-04`, `TC-NEG-05`, `TC-POS-103`|
| **FR-04**| F-01 Affirmation   | GeminiGateway       | `js/ai/GeminiAiClient.js`    | `TC-POS-03`                       |
| **FR-05**| F-02 Chronometer   | DualClockTimeEngine | `js/core/DualClockTimeEngine.js`| `TC-POS-04`, `TC-POS-100`, `TC-POS-101`, `TC-POS-102`, `TC-EDGE-20`, `TC-EDGE-21`|
| **FR-06**| F-02 Zero Drift    | DualClockTimeEngine | `js/core/DualClockTimeEngine.js`| `TC-POS-05`, `TC-EDGE-01`, `TC-EDGE-02`, `TC-EDGE-19`|
| **FR-07**| F-03 Milestones    | MilestoneStore      | `js/core/MilestoneManager.js`| `TC-POS-06`, `TC-EDGE-13`        |
| **FR-08**| F-03 Progress Calc | MilestoneStore      | `js/core/MilestoneManager.js`| `TC-POS-07`                     |
| **FR-09**| F-04 Safe Zone     | SimulatorOverlay    | `js/canvas/SafeZoneOverlay.js`| `TC-POS-08`, `TC-EDGE-14`        |
| **FR-10**| F-04 28% Margin    | LayoutEngine        | `js/canvas/ResponsiveLayoutEngine.js`<br/>`js/canvas/CanvasTextWrapper.js`| `TC-POS-08`, `TC-POS-113`, `TC-EDGE-07`, `TC-EDGE-08`|
| **FR-11**| F-05 High-DPI      | AdaptiveAllocator   | `js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-09`, `TC-EDGE-04`|
| **FR-12**| F-05 Adaptive Scale| AdaptiveAllocator   | `js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-09`, `TC-EDGE-03`|
| **FR-13**| F-06 Themes        | ThemeController     | `js/config/themes.js`      | `TC-POS-11`, `TC-POS-12`, `TC-EDGE-23`|
| **FR-14**| F-07 URL Hash      | StateSerializer     | `js/core/UrlStateService.js`| `TC-POS-13`, `TC-POS-14`, `TC-NEG-06`, `TC-NEG-07`, `TC-NEG-08`, `TC-NEG-12`, `TC-NEG-13`, `TC-POS-104`, `TC-POS-105`, `TC-POS-106`, `TC-EDGE-15`, `TC-EDGE-16`|
| **FR-15**| F-05 Download      | BlobExporter        | `js/canvas/CanvasRenderer.js`| `TC-POS-10`, `TC-EDGE-09`        |
| **FR-16**| F-05 Audio FSM     | AudioChimeService   | `js/services/AudioChimeService.js`| `TC-POS-16`, `TC-NEG-10`, `TC-EDGE-17`, `TC-POS-108`, `TC-POS-109`|
| **FR-17**| F-05 Haptics       | HapticService       | `js/services/HapticService.js`| `TC-POS-17`                     |
| **FR-18**| F-07 History Guard | TokenBucketGuard    | `js/core/TokenBucketHistoryGuard.js`| `TC-NEG-11`, `TC-EDGE-10`, `TC-EDGE-11`|
| **FR-19**| F-05 Web Share     | ShareService        | `js/canvas/CanvasRenderer.js`| `TC-NEG-11`, `TC-POS-15`        |
| **FR-20**| F-04 Safe Zones/VP | LayoutEngine        | `js/canvas/ResponsiveLayoutEngine.js`<br/>`js/canvas/CanvasTextWrapper.js`| `TC-POS-08`, `TC-POS-18`, `TC-EDGE-05`, `TC-EDGE-06`, `TC-POS-112`, `TC-EDGE-12`|
| **FR-21**| F-05 Confetti SoA  | ParticleEngine      | `js/canvas/ParticleEngine.js`| `TC-POS-19`, `TC-EDGE-18`, `TC-POS-110`, `TC-POS-111`|
| **FR-22**| F-05 Font Barrier  | FontService         | `js/services/FontService.js` | `TC-POS-20`, `TC-EDGE-24`, `TC-POS-114`|
| **FR-23**| F-07 Multi-Tab Sync| BroadcastChannel    | `js/core/StateStore.js`      | `TC-POS-115`, `TC-NEG-15`, `TC-EDGE-27`, `ADR-011`|
| **FR-24**| F-05 Alarm Mutex   | WebLocksMutex       | `js/services/AudioChimeService.js`| `TC-POS-116`, `TC-NEG-16`, `TC-EDGE-28`, `ADR-012`|
| **FR-25**| F-05 Tabular CLS   | TabularFontEngine   | `js/canvas/CanvasRenderer.js`<br/>`src/css/tokens.css` | `TC-POS-117`, `ADR-013`, `DOC-UI-08`|
| **FR-26**| F-05 Flagship Export| CanvasRenderer      | `js/canvas/CanvasRenderer.js`<br/>`js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-21`, `ADR-014`, `DOC-UI-09`|
| **FR-27**| F-05 Ambient Scrim | ScrimNormalizer     | `js/canvas/CanvasRenderer.js`| `TC-POS-119`, `ADR-014`, `DOC-UI-09`|
| **FR-28**| F-05 Sensory Sync  | SensoryCoordinator  | `js/services/AudioChimeService.js`<br/>`js/services/HapticService.js`| `TC-POS-120`, `ADR-015`, `DOC-UI-10`|
| **FR-29**| F-05 Font Gate     | FontService         | `js/services/FontService.js` | `TC-POS-114`, `ADR-013`, `DOC-UI-08`|
| **FR-30**| F-05 Buffer Bounds | AdaptiveAllocator   | `js/canvas/AdaptiveBufferAllocator.js`| `TC-POS-22`, `TC-EDGE-01`, `ADR-014`|
| **ROOT**  | Application Root   | Orchestrator Root   | `src/js/app.js` (`CountdownApp`)| `TC-POS-01` through `TC-POS-20` |
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
| **NFR-03**| Zero Layout Shift      | $\text{CLS} = 0.000$| `DOC-UI-01`, `DOC-UI-08` | `DOC-OBS-02`, Automated CI      |
| **NFR-04**| Interaction Latency    | $\text{INP} \le 50\text{ms}$   | `ADR-010`          | `DOC-OBS-02`, Vitest Harness    |
| **NFR-05**| GPU Memory Safety      | $\le 16.7\text{M pixels}$      | `ADR-004`          | `DOC-LLD-08` (HR-01), Vitest    |
| **NFR-06**| Zero Cumulative Drift  | $0\text{ ms}$ cumulative lag   | `ADR-007`          | `DOC-TEST-02` (`TC-POS-05`)     |
| **NFR-07**| Zero PII Data Storage  | $\text{Cloud PII} = \emptyset$ | `DOC-SEC-03`       | `DOC-SEC-01`, Automated Audit   |
| **NFR-08**| Strict CSP Level 3     | Zero inline scripts | `DOC-SEC-02`       | `DOC-SEC-02`, CSP Evaluator CI  |
| **NFR-09**| Offline Availability   | 100% PWA cache hits | `ADR-008`          | `DOC-TEST-02` (`TC-POS-15`)     |
| **NFR-10**| WCAG / APCA Contrast   | $L^c \ge 75$ (AAA)  | `DOC-UI-03`        | `DOC-UI-03`, Contrast Analyzer  |
| **NFR-11**| SW Cache Scoping       | 0 Stale Bundles     | `ADR-008`          | `DOC-SEC-01` (T5c), SW CI Audit |
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
| **ADR-006**| Privacy-First Local Storage     | Zero server PII storage invariant | `docs/security/03-credential-logging-governance.md`|
| **ADR-007**| Dual-Clock Chronometry Anchor   | Prevent mobile sleep timing drift | `js/core/DualClockTimeEngine.js`    |
| **ADR-008**| Cache-First PWA Topology        | 100% offline edge resilience      | `public/sw.js`                      |
| **ADR-009**| Autoplay-Primed Web Audio Chime | Zero asset overhead, no rejection | `js/services/AudioChimeService.js`  |
| **ADR-010**| Token Bucket History Limiter    | WebKit 100-call quota immunity    | `js/core/TokenBucketHistoryGuard.js`|
| **ADR-011**| Cross-Tab State Synchronization | Native same-origin broadcast sync | `js/core/StateStore.js`              |
| **ADR-012**| Single-Instance Alarm Mutex     | Non-blocking victory audio lock   | `js/services/AudioChimeService.js`   |
| **ADR-013**| Tabular Numeral Typography       | Zero CLS and uniform glyph advance | `js/canvas/CanvasRenderer.js`, `tokens.css` |
| **ADR-014**| Nine-Stage Canvas Wallpaper Engine| Hardware bounds & ambient scrim APCA | `js/canvas/CanvasRenderer.js`       |
| **ADR-015**| Tri-Modal Sensory Synchronization| Unified visual ODE, Web Audio & haptics| `js/services/AudioChimeService.js` |
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
| **P-01**| Vanilla ES2022+ ESM Zero-Build    | `ADR-001`          | `FR-01`, `FR-05`, `NFR-10` | `DOC-LLD-01`, `DOC-09`|
| **P-02**| CSS3 Tokens & Specular Glass      | `ADR-005`, `ADR-013`, `ADR-015`| `FR-13`, `FR-25`, `FR-28`, `NFR-10` | `DOC-UI-01`, `DOC-UI-04`, `DOC-UI-07`, `DOC-UI-08`, `DOC-UI-10`, `DOC-09` |
| **P-03**| High-DPI Canvas & Adaptive Buffer | `ADR-002`, `ADR-004`, `ADR-013`, `ADR-014`| `FR-11`, `FR-12`, `FR-15`, `FR-26`, `FR-29`, `FR-30` | `DOC-LLD-09`, `DOC-UI-07`, `DOC-UI-09`, `DOC-09`|
| **P-04**| Safe-Zone Ergonomics & Tri-Modal  | `ADR-002`, `ADR-014`| `FR-09`, `FR-10`, `FR-20`, `FR-27` | `DOC-UI-02`, `DOC-UI-05`, `DOC-UI-09`, `DOC-09` |
| **P-05**| DualClock Chronometry Engine      | `ADR-007`          | `FR-05`, `FR-06`   | `DOC-LLD-10`, `DOC-UI-06`, `DOC-09`|
| **P-06**| Gemini 3.8 Flash Backward Plan    | `ADR-001`          | `FR-02`, `FR-03`, `FR-04` | `DOC-03`, `DOC-UI-05`, `DOC-09` |
| **P-07**| Procedural Web Audio & Haptics    | `ADR-009`, `ADR-012`, `ADR-015`| `FR-16`, `FR-17`, `FR-24`, `FR-28`| `DOC-RES-01`, `DOC-UI-06`, `DOC-UI-10`, `DOC-09`|
| **P-08**| Float32Array Confetti Physics     | `ADR-002`          | `FR-21`            | `DOC-LLD-04`, `DOC-UI-06`, `DOC-09`|
| **P-09**| TokenBucket History & State Codec | `ADR-003`, `ADR-010`, `ADR-011`| `FR-14`, `FR-18`, `FR-23`| `DOC-SEC-04`, `DOC-09`|
| **P-10**| Zero-PII Security & PWA Offline   | `ADR-006`, `ADR-008`| `FR-19`, `NFR-06`, `NFR-11`| `DOC-SEC-02`, `DOC-09`|
+---------+-----------------------------------+--------------------+--------------------+-----------------------+
```
```
---

## 6. Vulnerability Resilience Verification Traceability Matrix (TC-POS-21 to TC-POS-99, TC-EDGE-25 to TC-EDGE-26)

```
+---------------------------------------------------------------------------------------------------------------+
|                                VULNERABILITY AUDIT VERIFICATION TRACEABILITY MATRIX                           |
+--------------------------+-----------------------+------------------------+-----------------------------------+
| Test ID Range            | Audit Dimension       | Governing Spec         | Verification Objective            |
+--------------------------+-----------------------+------------------------+-----------------------------------+
| **TC-POS-21 - TC-POS-30**| Canvas & Graphics     | `DOC-LLD-08` (HR-01..10)| GPU memory limits, P3 gamut, FOIT |
| **TC-POS-31 - TC-POS-40**| Mobile Ergonomics     | `DOC-LLD-08` (ME-01..10)| Notch, keyboard, safe zones, FSM  |
| **TC-POS-41 - TC-POS-50**| Chronometry & Clocks  | `DOC-LLD-08` (CC-01..10)| 0-drift, sleep wake, leap seconds |
| **TC-POS-51 - TC-POS-60**| AI Gateway Resilience | `DOC-LLD-08` (AI-01..10)| 429 backoff, schema, prompt inject|
| **TC-POS-61 - TC-POS-70**| Web Audio & Haptics   | `DOC-LLD-08` (AU-01..10)| AudioContext FSM, limiter, vibrate|
| **TC-POS-71 - TC-POS-80**| State Codec & URL     | `DOC-LLD-08` (SC-01..10)| 32KB bomb, token bucket, Base64   |
| **TC-POS-81 - TC-POS-90**| AppSec & CSP Level 3  | `DOC-LLD-08` (SE-01..10)| XSS, Trojan Source, prototype pol.|
| **TC-POS-91 - TC-POS-99**| Offline PWA & Edge    | `DOC-LLD-08` (PW-01..10)| SW cache, font barrier, Anycast   |
| **TC-EDGE-25**           | Micro-orbital OLED    | `DOC-LLD-08` (CR-01)   | Burn-in prevention orbit shift    |
| **TC-EDGE-26**           | Double-Precision IEEE | `DOC-LLD-08` (MA-01)   | Sub-millisecond chronometer math  |
+--------------------------+-----------------------+------------------------+-----------------------------------+
```

---

## 7. System Invariants Bidirectional Traceability Matrix (INV-001 to INV-020)

```
+-----------------------------------------------------------------------------------------------------------------------------------------------------+
|                                               SYSTEM INVARIANTS BIDIRECTIONAL TRACEABILITY MATRIX                                                   |
+---------+-----------------------------------+---------------------------------------+---------------------+----------------------+------------------+
| Inv ID  | Mathematical Invariant Title      | Verification Formulation              | Governing Spec      | Implementing Class   | Verification ID  |
+---------+-----------------------------------+---------------------------------------+---------------------+----------------------+------------------+
| INV-001 | Sub-Pixel Snapping                | abs(y_snap * DPR - round(y_snap*DPR))=0| DOC-LLD-09          | CanvasRenderer.js    | TC-POS-09        |
| INV-002 | Oklab Gamut Preservation          | L* in [0,1], a*,b* in [-0.5,0.5]      | DOC-LLD-09          | themes.js            | TC-EDGE-23       |
| INV-003 | Monotone Spline Slope             | y'(x) >= 0.00000 for all x in [0,1]   | DOC-LLD-09          | CanvasRenderer.js    | TC-EDGE-13       |
| INV-004 | Aspect Ratio Isotropy             | abs(scaleX - scaleY) == 0.00000       | DOC-LLD-09          | ResponsiveLayout.js  | TC-POS-18        |
| INV-005 | Fitts's Law Ergonomic Difficulty  | log2(1 + 2D/W) <= 3.50000 bits        | DOC-UI-02           | SafeZoneOverlay.js   | TC-EDGE-14       |
| INV-006 | OLED Micro-Orbital Bounding       | sqrt(dx^2 + dy^2) <= 2.00000 px       | DOC-LLD-09          | CanvasRenderer.js    | TC-EDGE-25       |
| INV-007 | Mazur Hyperbolic Urgency Limit    | V(D) -> A = 100 as D -> 0             | DOC-LLD-09          | MilestoneManager.js  | TC-POS-07        |
| INV-008 | Arc Boundary Singularity Guard    | theta_end - theta_start <= 2*PI - 1e-6| DOC-LLD-09          | CanvasRenderer.js    | TC-POS-113       |
| INV-009 | Thermal GPU Frame Clamp           | FPS_idle <= 15.0000 FPS               | DOC-LLD-09          | DualClockTimeEngine  | TC-POS-04        |
| INV-010 | Inverse Transform Precision       | norm(M * M^-1 - I) <= 1e-12           | DOC-LLD-09          | CanvasRenderer.js    | TC-EDGE-26       |
| INV-011 | Symplectic Particle Terminal Vel  | lim_{t->inf} ||v(t)|| <= 738.00 px/s  | DOC-LLD-09          | ParticleEngine.js    | TC-POS-110       |
| INV-012 | Zero-Duration Arc Guard           | P == 1.00000 when t_total <= 0        | DOC-LLD-09          | DualClockTimeEngine  | TC-POS-100       |
| INV-013 | Dual-Constraint GPU Ceiling       | S* <= min(DPR, S_area, S_edge)        | DOC-LLD-09, ADR-004 | AdaptiveBufferAlloc  | TC-POS-09        |
| INV-014 | Oklab Chroma Bisection Guard      | F(alpha_final) == 1, dE <= 0.001      | DOC-LLD-09          | themes.js            | TC-POS-11        |
| INV-015 | Cross-Font Fallback Floor         | S_effective >= S_floor = 10px         | DOC-LLD-09          | FontService.js       | TC-EDGE-24       |
| INV-016 | Single-Instance Victory Mutex     | LocksHeld(alarm) <= 1                 | DOC-LLD-01, ADR-012 | AudioChimeService.js | TC-POS-116       |
| INV-017 | Multi-Tab Eventual Consistency    | Delta t_sync <= 50ms, sender != self  | DOC-LLD-01, ADR-011 | StateStore.js        | TC-POS-115       |
| INV-018 | Tabular Advance Width Invariance   | w(g1) == w(g2) == W_cell => CLS == 0.000 | DOC-LLD-09, ADR-013 | CanvasRenderer.js    | TC-POS-21, TC-POS-117 |
| INV-019 | Dual-Constraint Scrim Buffer Ceiling| S* <= min(2.0, S_area, S_edge); APCA Lc>=75| DOC-LLD-09, ADR-014 | AdaptiveBufferAlloc  | TC-POS-23, TC-POS-24 |
| INV-020 | Tri-Modal Sensory Temporal Bound   | abs(Delta t_vis - Delta t_aud) < 20ms    | DOC-LLD-09, ADR-015 | AudioChimeService.js | TC-POS-26, TC-POS-120 |
+---------+-----------------------------------+---------------------------------------+---------------------+----------------------+------------------+
```

---

## 8. System-Level Architectural Invariants Traceability Matrix (SYS-INV-001 to SYS-INV-010)

```
+-----------------------------------------------------------------------------------------------------------------------------------------------------+
|                                          SYSTEM-LEVEL ARCHITECTURAL INVARIANTS TRACEABILITY MATRIX                                                  |
+-------------+-----------------------------------+---------------------------------------+---------------------+----------------------+--------------+
| Sys Inv ID  | Architectural Constraint Title    | Governing Formulation / Boundary      | Governing Spec      | Implementing Module  | Verified By  |
+-------------+-----------------------------------+---------------------------------------+---------------------+----------------------+--------------+
| SYS-INV-001 | Future Target Timestamp           | t_deadline > t_now + 3600s            | DOC-00, DOC-05      | DualClockTimeEngine  | TC-POS-01    |
| SYS-INV-002 | Milestone Cognitive Bounding      | 3 <= N_milestones <= 5 (Miller Span)  | DOC-00, DOC-05      | GeminiAiClient       | TC-POS-02    |
| SYS-INV-003 | Upper Clock Safe-Zone Clearance   | Y_start >= 0.28 * H_canvas (708px)    | DOC-00, DOC-UI-02   | ResponsiveLayout     | TC-POS-08    |
| SYS-INV-004 | Bottom Gesture Safe-Zone Clearance| Y_end <= 0.82 * H_canvas (2076px)     | DOC-00, DOC-UI-02   | CanvasRenderer       | TC-EDGE-14   |
| SYS-INV-005 | High-DPI Wallpaper Resolution     | 1170x2532 px, DPR >= 2.0 (9:19.48)    | DOC-00, ADR-004     | OffscreenCanvas      | TC-POS-09    |
| SYS-INV-006 | Zero Runtime Time Drift           | lim sum e(t_i) = 0 (RAF + monotonic)  | DOC-00, ADR-007     | DualClockTimeEngine  | TC-POS-05    |
| SYS-INV-007 | Zero Server PII & Privacy         | Storage_cloud = empty_set (Client-only)| DOC-00, ADR-006    | ResilientStorage     | TC-POS-13    |
| SYS-INV-008 | Outdoor Contrast Compliance       | Contrast C >= 4.5:1 & APCA Lc >= 75   | DOC-00, DOC-UI-03   | themes.js, ScrimNorm | TC-POS-11    |
| SYS-INV-009 | Sub-Second Edge Delivery          | FCP <= 0.8s, LCP <= 1.2s, CLS = 0.0   | DOC-00, ADR-008     | Edge CDN / PWA Cache | TC-POS-15    |
| SYS-INV-010 | Clean Architecture Acyclicity     | Inward stability coupling D <= 0.15   | DOC-00, DOC-LLD-07  | Core Ports & Adapters| Vitest CI    |
+-------------+-----------------------------------+---------------------------------------+---------------------+----------------------+--------------+
```

---

## 9. Advanced UI/UX & Deep LLD Specifications Traceability Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                            ADVANCED UI/UX & DEEP LLD SPECIFICATIONS TRACEABILITY MATRIX                       |
+-------------+---------------------------------------------+--------------------+------------------------------+
| Spec ID     | Specification Title                         | Category           | Governed Implementation Files|
+-------------+---------------------------------------------+--------------------+------------------------------+
| **DOC-UI-01** | Design System Tokens & Color Science      | UI/UX Architecture | `src/css/tokens.css`, `themes.js`|
| **DOC-UI-02** | Safe Zones & Touch Ergonomics             | UI/UX Architecture | `js/canvas/SafeZoneOverlay.js`|
| **DOC-UI-03** | WCAG 2.2 AAA & APCA Contrast Math         | Accessibility      | `src/css/tokens.css`, `themes.js`|
| **DOC-UI-04** | Component Interaction Specifications      | UI/UX Architecture | `src/js/app.js`, `tokens.css` |
| **DOC-UI-05** | Information Architecture & User Journeys  | UX Strategy        | `src/index.html`, `app.js`   |
| **DOC-UI-06** | Motion Choreography & Kinetic Physics     | Motion & Animation | `js/canvas/ParticleEngine.js` |
| **DOC-UI-07** | Design Rationale & Anti-Pattern Defense   | UX Governance      | `docs/ui-ux/07-design-rationale-and-anti-pattern-defense.md`|
| **DOC-UI-08** | Typographic Engineering & Font System     | Typography         | `js/services/FontService.js` |
| **DOC-UI-09** | Canvas Wallpaper Composition Engine       | 2D Graphics Engine | `js/canvas/CanvasRenderer.js` |
| **DOC-UI-10** | Cognitive Ergonomics & Usability Heuristics| Usability Science | `docs/ui-ux/10-cognitive-ergonomics-heuristics-usability.md`|
| **DOC-LLD-01**| Class & Object Design Contracts           | Low-Level Design   | All 21 Classes in `src/js/`  |
| **DOC-LLD-02**| Dynamic Interaction Sequences             | Low-Level Design   | `uml/sequence_diagram.md`    |
| **DOC-LLD-03**| State Machine & Lifecycle FSM             | Low-Level Design   | `uml/state_diagram.md`       |
| **DOC-LLD-04**| Concurrency & Threading Model             | Concurrency & Web  | `WorkerTickerAdapter.js`     |
| **DOC-LLD-05**| Design Patterns & SOLID Principles        | Architecture       | `ports.js`, `StateStore.js`  |
| **DOC-LLD-06**| Exception Hierarchy & Error Handling      | Resilience         | `src/js/core/errors.js`      |
| **DOC-LLD-07**| Package Structure & Code Blueprint        | Implementation     | Complete `src/` Directory    |
| **DOC-LLD-08**| 100-Vulnerability Engineering Audit       | System Resilience  | 44 Architectural Dimensions  |
| **DOC-LLD-09**| Cross-Device Pixel-Perfect Math Blueprint | Mathematics & Grid | 10 Math Modules / INV-001..20|
| **DOC-LLD-10**| Micro-Architectural Implementation Hazards | V8 & Browser APIs  | 40 Implementation Hazards    |
| **DOC-LLD-11**| Deep-Dive Design Patterns & Security ASVS | Design Patterns    | GoF Catalogue & OWASP ASVS   |
+-------------+---------------------------------------------+--------------------+------------------------------+
```

