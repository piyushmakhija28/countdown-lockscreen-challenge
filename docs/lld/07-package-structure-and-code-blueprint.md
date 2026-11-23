# Level 4: Low-Level Design — Package Structure & Code Blueprint

**Document ID:** `DOC-LLD-07-PACKAGE-STRUCTURE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Modular Package Architecture)

---

## 1. Directory Structure & File Map

```
countdown-lockscreen-challenge/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD to GitHub Pages
├── docs/                              # Level 2.2 Deep Architecture & Governance
│   ├── 00-problem-statement.md
│   ├── 01-prd.md
│   ├── 02-hld.md
│   ├── 03-api-contract.md
│   ├── 04-competition-and-platform-research.md
│   ├── 05-srs.md
│   ├── 06-adr/                        # ADR-001 through ADR-010 (MADR 3.0)
│   ├── 07-architecture-tradeoffs-and-faq.md
│   ├── 08-handshake-submission-package.md # Official Contest Submission Deliverables
│   ├── ui-ux/                         # Design tokens, ergonomics, a11y
│   ├── lld/                           # Low-level design 01-11 (Classes, Sequences, Patterns, Security, Math, Micro-Arch)
│   ├── devops/                        # Docker, CI/CD, hosting specs
│   ├── security/                      # STRIDE, OWASP, input sanitization
│   ├── resilience/                    # Bulkhead, retry, error catalog
│   ├── observability/                 # Telemetry, Core Web Vitals, review
│   ├── testing/                       # Test strategy, triad test cases, load
│   └── management/                    # WBS, service orchestration DAG, traceability
├── uml/                               # The 13 Canonical Mermaid UML Diagrams
├── public/
│   ├── favicon.ico
│   ├── manifest.json                  # PWA Web App Manifest
│   └── sw.js                          # Cache-first Service Worker
├── src/                               # Application Source Code
│   ├── index.html                     # Main application entry point
│   ├── css/
│   │   ├── tokens.css                 # 8pt grid & CSS custom properties
│   │   ├── glassmorphism.css          # Glassmorphic backdrop filters
│   │   └── main.css                   # Responsive layout & components
│   └── js/
│       ├── config/
│       │   └── themes.js              # Theme definitions & color tokens
│       ├── core/
│       │   ├── TimeEngine.js          # Drift-compensated countdown engine
│       │   ├── ZeroAllocationTickEngine.js # Pre-allocated GC-free tick engine
│       │   ├── MilestoneManager.js    # Checkpoint sequencing & progress
│       │   ├── UrlStateService.js     # Base64 URL hash serialization
│       │   └── HistoryQuotaGuard.js   # 300ms leaky bucket history rate limiter
│       ├── ai/
│       │   ├── GeminiClient.js        # Google Gemini 3.8 Flash SDK client
│       │   └── HeuristicGenerator.js  # Deterministic offline fallback
│       ├── canvas/
│       │   ├── CanvasRenderer.js      # 1170x2532 2D rasterizer
│       │   ├── CanvasTextWrapper.js   # Greedy word-wrapping & font fit engine
│       │   ├── ParticleEngine.js      # Float32Array zero-allocation celebration physics
│       │   └── SafeZoneOverlay.js     # Lock screen simulator overlay
│       ├── services/
│       │   ├── AudioChimeService.js   # Web Audio procedural sound synthesis
│       │   └── HapticService.js       # Vibration API tactile patterns
│       └── app.js                     # Root view controller & event bindings
├── tests/                             # Test Suite
│   ├── unit/                          # TimeEngine, UrlState unit tests
│   └── integration/                   # Canvas export & Gemini fallbacks
├── .gitignore                         # Level 2.2 strict doc exclusions
├── VERSION                            # Single source of truth (1.0.0)
├── CHANGELOG.md                       # Keep a Changelog standard
├── CLAUDE.md                          # Project developer guidelines
└── README.md                          # Main project playbook
```

---

## 2. Module Boundary Contracts & Import Flow

To maintain strict acyclic dependencies ($D \le 0.15$):
- `core/` modules have zero dependencies on `canvas/` or `ai/`.
- `ai/` modules depend only on `core/types`.
- `canvas/` modules depend only on `core/TimeEngine` and `config/themes`.
- `app.js` is the sole orchestrator wiring modules together, ensuring strict inward-pointing dependencies conforming to Clean Architecture.

---

## 3. Mathematical Rigor & Geometry Integration (`DOC-LLD-09`)

All low-level graphics, transforms, and chronometric state machines must strictly adhere to the closed-form algebraic formulations derived in `docs/lld/09-pixel-perfect-mathematical-blueprint.md`:
1. **Coordinate Pipeline:** Affine TRS matrix mapping with $O(1)$ inverse unprojection.
2. **Sub-Pixel Quantization:** $y_{\text{snapped}} = \lfloor y \cdot \text{DPR} + 0.5 \rfloor / \text{DPR}$.
3. **Color Blending:** Oklab perceptual color space matrix pipeline eliminating sRGB gray dead zones.
4. **Milestone Waves:** Fritsch-Carlson monotone cubic spline interpolation ensuring $\alpha_k^2 + \beta_k^2 \le 9$.
5. **Ergonomic Safe Zones:** Fitts's Law index of difficulty $ID \le 3.5\text{ bits}$ on mobile viewports.
6. **OLED AOD Protection:** Continuous procedural micro-orbital shifting with $R = 2.0\text{px}$ and $T = 3600\text{s}$.

---

## 4. Micro-Architectural Implementation Details & Edge-Case Hazards (`DOC-LLD-10`)

All component implementations, event loops, canvas routines, and memory management must strictly comply with the 40 micro-architectural invariants detailed in `docs/lld/10-micro-architectural-implementation-details.md`:
1. **DOM & Canvas Events:** `{ passive: false }` on touchmove, unified `pointercancel` state machine, and `touch-action: manipulation` (`LLD-EV-01` to `03`).
2. **Context & Pixel Operations:** RAII scoped `withCanvasContext()` wrapper, offscreen `destination-in` rounded corner clipping, and safe text bounding-box metrics (`LLD-CV-01` to `04`).
3. **Chronometry:** Monotonic display time clamping, strict zero threshold triggering, and zero-allocation two-digit LUT (`LLD-TM-01` to `03`).
4. **AI & Network Resilience:** Full jitter exponential backoff on 429 and XML delimiter escaping (`LLD-AI-01` to `02`).
5. **Storage & PWA:** Safari private browsing storage probe, forward schema migration, and byte-to-byte service worker cache-busting (`LLD-ST-01` to `03`).
6. **V8 JIT Optimization:** Monomorphic struct constructors, packed array splicing, and detached typed-array cloning (`LLD-V8-01` to `03`).
7. **CSS & Glassmorphism:** Single composite frosted glass layer, dynamic `calc(1px / dpr)` hairline borders, and stacking context isolation (`LLD-CS-01` to `03`).
8. **Asynchronous Execution:** Microtask loop freeze avoidance via RAF/requestIdleCallback, clean AbortError handling, and monotonic upload tokens (`LLD-AS-01` to `03`).

