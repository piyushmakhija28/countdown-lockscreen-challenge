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
│   ├── 06-adr/                        # ADR-001 through ADR-008 (MADR 3.0)
│   ├── 07-architecture-tradeoffs-and-faq.md
│   ├── ui-ux/                         # Design tokens, ergonomics, a11y
│   ├── lld/                           # Low-level design 01-08 (Classes, Sequences, Audit)
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
│       │   ├── MilestoneManager.js    # Checkpoint sequencing & progress
│       │   └── UrlStateService.js     # Base64 URL hash serialization
│       ├── ai/
│       │   ├── GeminiClient.js        # Google Gemini 3.8 Flash SDK client
│       │   └── HeuristicGenerator.js  # Deterministic offline fallback
│       ├── canvas/
│       │   ├── CanvasRenderer.js      # 1170x2532 2D rasterizer
│       │   └── SafeZoneOverlay.js     # Lock screen simulator overlay
│       └── app.js                     # Root view controller & event bindings
├── tests/                             # Test Suite
│   ├── unit/                          # TimeEngine, UrlState unit tests
│   └── integration/                   # Canvas export & Gemini fallbacks
├── .gitignore                         # Level 2.2 strict doc exclusions
├── VERSION                            # Single source of truth (1.0.0)
├── CHANGELOG.md                       # Keep a Changelog standard
├── SRS.md                             # Canonical root specification
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
