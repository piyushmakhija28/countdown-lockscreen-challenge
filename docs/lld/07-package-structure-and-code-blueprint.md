# Level 4: Low-Level Design — Package Structure & Target Implementation Blueprint

**Document ID:** `DOC-LLD-07-PACKAGE-STRUCTURE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Modular Package Architecture)

> [!NOTE]  
> **Engineering Phase Status:** This document specifies the comprehensive **Target Implementation Architecture (Sprint 2–4 Delivery)**. The repository currently represents **Sprint 1 Complete (Enterprise Architecture & Level 2.2 Documentation Governance Suite)**, with source code scaffolding scheduled for immediate implementation.

---

## 1. Directory Structure & Complete Repository Map

```
countdown-lockscreen-challenge/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD to GitHub Pages
├── docs/                              # Level 2.2 Deep Architecture & Governance (54 Specs)
│   ├── 00-problem-statement.md        # ISO/IEC/IEEE 29148 Problem Statement & Invariants
│   ├── 01-prd.md                      # PRD, Personas, Journey Maps & Mission Traceability
│   ├── 02-hld.md                      # High-Level Design, C4 Models & Dual-Engine Architecture
│   ├── 03-api-contract.md             # Gemini 3.8 Flash Schema, URL Codec & Contracts
│   ├── 04-competition-and-platform-research.md # 7-Page PDF Teardown, 4x25% Rubric Math & OS Specs
│   ├── 05-srs.md                      # Canonical Software Requirements Specification
│   ├── 06-adr/                        # Architecture Decision Records (ADR-001 through ADR-010)
│   │   ├── ADR-001-architecture-style-and-runtime.md
│   │   ├── ADR-002-rendering-engine-canvas-vs-dom.md
│   │   ├── ADR-003-state-serialization-and-sharing.md
│   │   ├── ADR-004-high-dpi-mobile-export-strategy.md
│   │   ├── ADR-005-glassmorphism-and-styling-engine.md
│   │   ├── ADR-006-privacy-first-local-storage-model.md
│   │   ├── ADR-007-time-engine-and-milestone-chronometry.md
│   │   ├── ADR-008-static-deployment-and-pwa-topology.md
│   │   ├── ADR-009-procedural-web-audio-vs-prerecorded-media.md
│   │   └── ADR-010-leaky-bucket-history-guard-vs-synchronous-pushstate.md
│   ├── 07-architecture-tradeoffs-and-faq.md # Tradeoff Matrices, Failure Modes & Judge FAQ
│   ├── 08-handshake-submission-package.md # Official Contest Submission Package & Deliverables
│   ├── 09-tech-stack-fundamentals-and-compliance-matrix.md # Technical Stack Fundamentals & Compliance Matrix
│   ├── competition-rules-summary.md   # Official Contest Rules Teardown & Legal Verification
│   ├── lockscreen-design-strategy.md  # 1.8s Glanceability Index & Technical Moats Playbook
│   ├── ui-ux/                         # UI/UX Specifications
│   │   ├── 01-design-system-and-tokens.md
│   │   ├── 02-lockscreen-safe-zones-ergonomics.md
│   │   └── 03-accessibility-wcag-apca.md
│   ├── lld/                           # Low-Level Design (LLD-01 through LLD-11)
│   │   ├── 01-class-and-object-design.md
│   │   ├── 02-dynamic-interaction-sequences.md
│   │   ├── 03-state-machine-lifecycle.md
│   │   ├── 04-concurrency-threading-model.md
│   │   ├── 05-design-patterns-and-solid-principles.md
│   │   ├── 06-exception-hierarchy-and-error-handling.md
│   │   ├── 07-package-structure-and-code-blueprint.md
│   │   ├── 08-system-design-vulnerability-audit.md
│   │   ├── 09-pixel-perfect-mathematical-blueprint.md
│   │   ├── 10-micro-architectural-implementation-details.md
│   │   └── 11-deep-dive-design-patterns-and-security-architecture.md
│   ├── devops/                        # DevOps Specifications
│   │   ├── 01-docker-and-container-spec.md
│   │   ├── 02-ci-cd-pipeline-spec.md
│   │   └── 03-hosting-and-environment-spec.md
│   ├── security/                      # Security Specifications
│   │   ├── 01-threat-model-stride.md
│   │   ├── 02-owasp-web-top10-audit.md
│   │   ├── 03-credential-logging-governance.md
│   │   └── 04-input-validation-and-sanitization-pipeline.md
│   ├── resilience/                    # Resilience Specifications
│   │   ├── 01-fault-tolerance-bulkhead.md
│   │   ├── 02-timeout-and-retry-policy.md
│   │   └── 03-error-catalogue-degradation.md
│   ├── observability/                 # Observability Specifications
│   │   ├── 01-structured-logging-telemetry.md
│   │   ├── 02-health-probes-cold-start.md
│   │   └── 03-production-readiness-review.md
│   ├── testing/                       # Testing Specifications
│   │   ├── 01-test-strategy-and-pyramid.md
│   │   ├── 02-test-cases-catalog.md
│   │   └── 03-performance-load-testing.md
│   └── management/                    # Project Management Specifications
│       ├── 01-wbs-and-sprint-backlog.md
│       ├── 02-service-orchestration-dag.md
│       └── 03-traceability-matrix.md
├── drawio/                             # The 13 Canonical Draw.io XML Diagrams (Rule 45 Parity)
│   ├── activity_diagram.drawio
│   ├── call_graph_diagram.drawio
│   ├── class_diagram.drawio
│   ├── communication_diagram.drawio
│   ├── component_diagram.drawio
│   ├── composite_diagram.drawio
│   ├── deployment_diagram.drawio
│   ├── interaction_diagram.drawio
│   ├── object_diagram.drawio
│   ├── package_diagram.drawio
│   ├── sequence_diagram.drawio
│   ├── state_diagram.drawio
│   └── usecase_diagram.drawio
├── uml/                                # The 13 Canonical Mermaid UML Diagrams
│   ├── activity_diagram.md
│   ├── call_graph_diagram.md
│   ├── class_diagram.md
│   ├── communication_diagram.md
│   ├── component_diagram.md
│   ├── composite_diagram.md
│   ├── deployment_diagram.md
│   ├── interaction_diagram.md
│   ├── object_diagram.md
│   ├── package_diagram.md
│   ├── sequence_diagram.md
│   ├── state_diagram.md
│   └── usecase_diagram.md
├── public/                            # Target Public PWA Distribution Assets
│   ├── favicon.ico
│   ├── manifest.json                  # PWA Web App Manifest
│   └── sw.js                          # Cache-first Service Worker
├── src/                               # Target Application Source Code (Sprint 2 Delivery)
│   ├── index.html                     # Main application entry point
│   ├── assets/
│   │   └── fonts/                     # Self-hosted WOFF2 fonts (Inter, JetBrains Mono)
│   ├── css/
│   │   ├── tokens.css                 # 8pt grid & CSS custom properties
│   │   ├── glassmorphism.css          # Glassmorphic backdrop filters
│   │   └── main.css                   # Responsive layout & components
│   └── js/
│       ├── config/
│       │   └── themes.js              # Theme definitions & color tokens
│       ├── core/
│       │   ├── ports.js               # Clean Architecture Port interfaces (ITickScheduler, etc.)
│       │   ├── LifecycleScope.js      # RAII scope manager for signals and listeners
│       │   ├── StateStore.js          # Central immutable state store with trampoline dispatch
│       │   ├── DualClockTimeEngine.js # Drift-compensated hybrid chronometer
│       │   ├── MilestoneManager.js    # Checkpoint sequencing & progress
│       │   ├── UrlStateService.js     # Base64 URL hash serialization
│       │   ├── TokenBucketHistoryGuard.js # Token-bucket history rate limiter & 3-layer loop shield
│       │   └── InputSanitizer.js      # Unicode NFKC & Bidi Trojan Source shield
│       ├── ai/
│       │   ├── GeminiAiClient.js      # Google Gemini 3.8 Flash SDK client (Header auth)
│       │   ├── GeminiRateLimiter.js   # Client-side 15 RPM token bucket rate limiter
│       │   └── HeuristicGenerator.js  # Deterministic offline fallback
│       ├── canvas/
│       │   ├── CanvasRenderer.js      # High-DPI 2D rasterizer
│       │   ├── AdaptiveBufferAllocator.js # Dual-constraint WebKit GPU texture allocator
│       │   ├── ResponsiveLayoutEngine.js # Tri-modal responsive layout engine
│       │   ├── CanvasTextWrapper.js   # Multi-script Intl.Segmenter text wrapper & fitText
│       │   ├── ParticleEngine.js      # Float32Array celebration physics (semi-implicit drag)
│       │   └── SafeZoneOverlay.js     # Lock screen simulator overlay
│       ├── services/
│       │   ├── WorkerTickerAdapter.js # Inline Blob Web Worker 1Hz unthrottled chronometer ticker
│       │   ├── AudioChimeService.js   # Autoplay-primed continuous re-arming Web Audio
│       │   ├── FontService.js         # Canvas font readiness barrier & FOIT gate
│       │   └── HapticService.js       # Vibration API tactile patterns
│       └── app.js                     # Root view controller & event bindings
├── tests/                             # Target Test Suite (Sprint 3 Delivery)
│   ├── unit/                          # Unit tests
│   └── integration/                   # Integration tests
├── .gitignore                         # Level 2.2 strict doc exclusions
├── VERSION                            # Single source of truth version string (1.8.0)
├── CHANGELOG.md                       # Keep a Changelog release history
├── CLAUDE.md                          # Claude Code developer instructions
└── README.md                          # Master project playbook
```

---

## 2. Module Boundary Contracts & Import Flow

To maintain strict acyclic dependencies ($D \le 0.15$):
- `core/` modules have zero dependencies on `canvas/` or `ai/`.
- `ai/` modules depend only on `core/types` and communicate with Gemini strictly via `x-goog-api-key` HTTP headers.
- `canvas/` modules depend only on `core/DualClockTimeEngine` and `config/themes`.
- `app.js` is the sole orchestrator wiring modules together, ensuring strict inward-pointing dependencies conforming to Clean Architecture.

---

### 2.1 Concrete Module Import/Export Matrix

```
+------------------------------+------------------------------------+-------------------------------------------+
| Source File                  | Exported Symbols                   | Direct Imported Modules                   |
+------------------------------+------------------------------------+-------------------------------------------+
| `config/themes.js`           | `THEMES`, `ThemeId`, `getTheme`    | (None - Constant Palettes & CSS Tokens)   |
| `core/ports.js`              | `ITickScheduler`, `IMilestonePlan` | (None - Pure Domain Contracts)            |
|                              | `IRenderTarget`, `IWallpaperRend`  |                                           |
|                              | `IStateStoragePort`, `ILifecycle`  |                                           |
| `core/LifecycleScope.js`     | `LifecycleScope`                   | (None - Standard Web API AbortController) |
| `core/StateStore.js`         | `StateStore`, `ActionTypes`,       | (None - Pure Zero-Dependency State Store) |
|                              | `deepFreeze`, `CyclicDispatchError`|                                           |
| `core/DualClockTimeEngine.js`| `DualClockTimeEngine`              | `core/ports.js`                           |
| `core/MilestoneManager.js`   | `MilestoneManager`                 | (None - Local Arithmetic)                 |
| `core/UrlStateService.js`    | `UrlStateService`                  | (None - Compression Streams API)          |
| `core/TokenBucketHistoryGuard.js`| `TokenBucketHistoryGuard`       | `core/ports.js`                           |
| `core/InputSanitizer.js`     | `InputSanitizer`                   | (None - Native Unicode RegExp)            |
| `ai/GeminiAiClient.js`        | `GeminiAiClient`                   | `core/ports.js`, `ai/GeminiRateLimiter.js`|
| `ai/GeminiRateLimiter.js`    | `GeminiRateLimiter`                | (None - LocalStorage Token Bucket)        |
| `ai/HeuristicGenerator.js`   | `HeuristicGenerator`               | `core/ports.js`                           |
| `canvas/AdaptiveBufferAllocator.js`| `AdaptiveBufferAllocator`     | (None - GPU Constraint Closed-Form Solver)|
| `canvas/ResponsiveLayoutEngine.js` | `ResponsiveLayoutEngine`      | `config/themes.js`                        |
| `canvas/CanvasRenderer.js`   | `CanvasRenderer`                   | `core/ports.js`, `canvas/Adaptive...`,    |
|                              |                                    | `canvas/ResponsiveLayoutEngine.js`,        |
|                              |                                    | `canvas/CanvasTextWrapper.js`,            |
|                              |                                    | `canvas/SafeZoneOverlay.js`, `FontService`|
| `canvas/CanvasTextWrapper.js`| `CanvasTextWrapper`                | (None - Intl.Segmenter API)               |
| `canvas/SafeZoneOverlay.js`  | `SafeZoneOverlay`                  | (None - Canvas 2D Stroke)                 |
| `canvas/ParticleEngine.js`   | `ParticleEngine`                   | (None - Float32Array Buffers)             |
| `services/WorkerTickerAdapter.js`| `WorkerTickerAdapter`           | `core/ports.js`                           |
| `services/ResilientStorageService.js`| `ResilientStorageService`   | `core/ports.js`                           |
| `services/AudioChimeService.js`| `AudioChimeService`              | (None - Web Audio API AudioContext)       |
| `services/FontService.js`    | `FontService`                      | (None - document.fonts FontFaceSet)       |
| `services/HapticService.js`  | `HapticService`                    | (None - navigator.vibrate)                |
| `app.js` (Orchestrator Root) | `CountdownApp`                     | All Subsystem Modules                     |
+------------------------------+------------------------------------+-------------------------------------------+
```
