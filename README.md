# Handshake AI Skills Studio X Google: Countdown Lock Screen Challenge

> **Mission:** *"Your Deadline, Your Design: Create a Countdown Lock Screen with Google"*  
> **Contest Sponsor:** Handshake (Stryder Corp.) with Google  
> **Prizes:** Top 3 Winners receive **$1,000 USD** each  
> **Eligibility:** Age 18+, Active Handshake Account, Legal Resident of Eligible Countries (including **India** 🇮🇳)  
> **Submission Deadline:** **November 23, 2026 at 11:59 PM PT**

---

## Overview

This repository contains the enterprise-grade architecture, design blueprints, and documentation suite for the **Handshake AI Skills Studio X Google Challenge**.

The system combines **Google Gemini 3.8 Flash** AI reasoning with mathematical smartphone lock screen ergonomics to deliver an end-to-end countdown and wallpaper generation platform.

### What Makes This Project Stand Out?
1. **Google Gemini Backward Milestone Planning:** Automatically deconstructs ambitious deadlines backward into sequential, time-stamped checkpoints with tailored motivational affirmations.
2. **Lock Screen Ergonomics (Safe Zones):** Mathematically reserves the top 28% of vertical canvas space for smartphone clocks and widgets, and the lower 18% for gestures, eliminating visual overlap.
3. **Tri-Modal Responsive System:** Accommodates ultra-tall flagships ($\ge 2.15$), standard phones ($1.70-2.15$), and foldable/tablet dual-column split views ($< 1.70$).
4. **Dual-Mode System:**
   - **Interactive Web Application & PWA:** Live 60fps drift-compensated countdown ticker (`DualClockTimeEngine`), milestone checklist, safe-zone simulator, token-bucket URL history synchronization, and shareable `#v1=...` URL state.
   - **High-Resolution Wallpaper Generator:** HTML5 Canvas 2D engine with hardware-constrained dual-limit texture scaling (`AdaptiveBufferAllocator`) exporting 1170x2532 portrait wallpapers ready for iOS and Android.

---

## Enterprise Documentation Suite (Level 2.2 Standard)

This project strictly adheres to Level 2.2 Documentation Governance, keeping only the canonical project management files at root while providing an exhaustive **92-document enterprise blueprint suite** (66 specifications in `docs/`, 13 Mermaid UML diagrams in `uml/`, and 13 Draw.io XML diagrams in `drawio/`):

```
countdown-lockscreen-challenge/
├── SRS.md                              # Level 2.2 Canonical IEEE 29148 Software Requirements Specification
├── docs/                               # Level 2.2 Deep Architecture & Governance (66 Specs)
│   ├── 00-problem-statement.md         # Level 0: ISO/IEC/IEEE 29148 Problem Statement & Invariants
│   ├── 01-prd.md                       # Level 1: PRD, Personas, Journey Maps & Mission Traceability
│   ├── 02-hld.md                       # Level 2: High-Level Design, C4 Models & Dual-Engine Architecture
│   ├── 03-api-contract.md              # Level 3: Gemini 3.8 Flash Schema, URL Codec & Component Contracts
│   ├── 04-competition-and-platform-research.md # Level 4: 7-Page PDF Teardown, 4x25% Rubric Math & OS Specs
│   ├── 05-srs.md                       # Level 5: Detailed Functional & Non-Functional Traceability
│   ├── 06-adr/                         # Level 6: Architecture Decision Records (ADR-001 to ADR-012)
│   │   ├── ADR-001-architecture-style-and-runtime.md
│   │   ├── ADR-002-rendering-engine-canvas-vs-dom.md
│   │   ├── ADR-003-state-serialization-and-sharing.md
│   │   ├── ADR-004-high-dpi-mobile-export-strategy.md
│   │   ├── ADR-005-glassmorphism-and-styling-engine.md
│   │   ├── ADR-006-privacy-first-local-storage-model.md
│   │   ├── ADR-007-time-engine-and-milestone-chronometry.md
│   │   ├── ADR-008-static-deployment-and-pwa-topology.md
│   │   ├── ADR-009-procedural-web-audio-vs-prerecorded-media.md
│   │   ├── ADR-010-leaky-bucket-history-guard-vs-synchronous-pushstate.md
│   │   ├── ADR-011-cross-tab-state-synchronization.md
│   │   ├── ADR-012-web-locks-single-instance-alarm-mutex.md
│   │   ├── ADR-013-tabular-numeral-typography-and-zero-cls.md
│   │   ├── ADR-014-nine-stage-canvas-wallpaper-and-ambient-scrim.md
│   │   └── ADR-015-tri-modal-sensory-synchronization.md
│   ├── 07-architecture-tradeoffs-and-faq.md # Level 7: Tradeoff Matrices, Failure Modes & Judge FAQ
│   ├── 08-handshake-submission-package.md # Level 8: Official Contest Deliverables & Walkthrough Script
│   ├── 09-tech-stack-fundamentals-and-compliance-matrix.md # Level 9: Technical Fundamentals & Cross-Document Matrix
│   ├── competition-rules-summary.md    # Contest Rules Teardown & Legal Verification
│   ├── lockscreen-design-strategy.md   # 1.8s Glanceability Index & Technical Moats Playbook
│   ├── ui-ux/                          # Deep-Dive UI/UX Architecture Suite (10 specs, Zero AI Slop)
│   │   ├── 01-design-system-and-tokens.md # OKLCH Tokens, P3 Gamut & Fresnel Glassmorphism
│   │   ├── 02-lockscreen-safe-zones-ergonomics.md # Flagship Coordinates & Tri-Modal Layout
│   │   ├── 03-accessibility-wcag-apca.md # WCAG 2.2 AAA, APCA Lc & CVD Color Matrices
│   │   ├── 04-component-interaction-specifications.md # Atomic 10 Components across 9 States
│   │   ├── 05-information-architecture-and-user-journeys.md # Fitts's Thumb Heatmaps & State Flows
│   │   ├── 06-motion-choreography-and-kinetic-physics.md # Spring Physics ODE & Haptics
│   │   ├── 07-design-rationale-and-anti-pattern-defense.md # First-Principles Rationale & Banned Slop
│   │   ├── 08-typographic-engineering-and-font-system.md # Tabular Numerals CLS=0 & Bayer Dither
│   │   ├── 09-canvas-wallpaper-composition-engine.md # 9-Stage Canvas Pipeline & Ambient Scrim
│   │   └── 10-cognitive-ergonomics-heuristics-usability.md # NN/g 10 Heuristics & Sensory Sync
│   ├── lld/                            # Low-Level Design (LLD-01 through LLD-11)
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
│   ├── devops/                         # Docker Multi-Stage, GitHub Actions CI/CD, Edge Hosting (3 specs)
│   │   ├── 01-docker-and-container-spec.md
│   │   ├── 02-ci-cd-pipeline-spec.md
│   │   └── 03-hosting-and-environment-spec.md
│   ├── security/                       # STRIDE Threat Model, OWASP Top 10, Input Sanitization (4 specs)
│   │   ├── 01-threat-model-stride.md
│   │   ├── 02-owasp-web-top10-audit.md
│   │   ├── 03-credential-logging-governance.md
│   │   └── 04-input-validation-and-sanitization-pipeline.md
│   ├── resilience/                     # Bulkhead Limiter, Exponential Retry Jitter, Error Catalogue (3 specs)
│   │   ├── 01-fault-tolerance-bulkhead.md
│   │   ├── 02-timeout-and-retry-policy.md
│   │   └── 03-error-catalogue-degradation.md
│   ├── observability/                  # Structured JSON Telemetry, Core Web Vitals, Production Review (3 specs)
│   │   ├── 01-structured-logging-telemetry.md
│   │   ├── 02-health-probes-cold-start.md
│   │   └── 03-production-readiness-review.md
│   ├── testing/                        # Testing Pyramid, 40-Scenario Triad Matrix, Load Benchmarks (3 specs)
│   │   ├── 01-test-strategy-and-pyramid.md
│   │   ├── 02-test-cases-catalog.md
│   │   └── 03-performance-load-testing.md
│   └── management/                     # WBS Backlog, Orchestration DAG, Full Traceability Matrix (3 specs)
│       ├── 01-wbs-and-sprint-backlog.md
│       ├── 02-service-orchestration-dag.md
│       └── 03-traceability-matrix.md
├── drawio/                             # The 13 Canonical Draw.io XML Diagrams (Rule 45 Parity)
│   ├── activity_diagram.drawio         # Interactive XML model for activity flows
│   ├── call_graph_diagram.drawio       # Invocation hierarchy & call graph model
│   ├── class_diagram.drawio            # Class model with contracts & port implementations
│   ├── communication_diagram.drawio    # Inter-object collaboration XML model
│   ├── component_diagram.drawio        # System components and external ports
│   ├── composite_diagram.drawio        # Canvas 2D engine internal composition
│   ├── deployment_diagram.drawio       # GitHub Pages, CDN, browser & Gemini runtime
│   ├── interaction_diagram.drawio      # Multi-scenario interaction overview
│   ├── object_diagram.drawio           # Concrete runtime memory state snapshot
│   ├── package_diagram.drawio          # Package architecture & clean boundaries
│   ├── sequence_diagram.drawio         # End-to-end execution sequence model
│   ├── state_diagram.drawio            # Finite state machine model
│   └── usecase_diagram.drawio          # Actor use case specifications
└── uml/                                # The 13 Canonical Mermaid UML Diagrams
    ├── activity_diagram.md             # User activity flow for countdown & wallpaper generation
    ├── call_graph_diagram.md           # Function and method invocation hierarchy
    ├── class_diagram.md                # Core OOP classes, interfaces, and methods
    ├── communication_diagram.md        # Inter-module collaboration during timer ticks
    ├── component_diagram.md            # System components and external boundaries
    ├── composite_diagram.md            # Internal composition of Canvas 2D engine
    ├── deployment_diagram.md           # GitHub Pages edge CDN, browser, and Gemini cloud
    ├── interaction_diagram.md          # Interaction overview across user journeys
    ├── object_diagram.md               # Runtime memory state snapshot
    ├── package_diagram.md              # Module layering and namespace boundaries
    ├── sequence_diagram.md             # End-to-end execution sequence
    ├── state_diagram.md                # Countdown and milestone finite state machine
    └── usecase_diagram.md              # System actors and use case specifications
```

---

## Detailed Project Understanding & Challenge Rubric

### 1. Official Evaluation Rubric (4 x 25% = 100%)
Judges evaluate submissions across four weighted dimensions:

```
+-----------------------------------------------------------------------------------------+
|                               OFFICIAL 4X25% SCORING MATRIX                             |
+--------------------------+--------+-----------------------------------------------------+
| Evaluation Criteria      | Weight | Requirements for Top Score (5/5)                    |
+--------------------------+--------+-----------------------------------------------------+
| 1. Execution             |  25%   | Exceeds project requirements; formatted perfectly  |
|                          |        | for phone screen; ready to set as lock screen today.|
+--------------------------+--------+-----------------------------------------------------+
| 2. Creativity            |  25%   | Fresh concept, autonomous backward decomposition,   |
|                          |        | distinctive themes, and unexpected use cases.       |
+--------------------------+--------+-----------------------------------------------------+
| 3. Usefulness / Value    |  25%   | Meaningfully keeps its owner on track; turns        |
|                          |        | anxiety into actionable momentum; daily habit loop. |
+--------------------------+--------+-----------------------------------------------------+
| 4. Polish & Thoughtfulness|  25%  | Feels intentional & "real"; clean space for system  |
|                          |        | clock/widgets; readable glance; optical typography. |
+--------------------------+--------+-----------------------------------------------------+
```

---

## Prerequisites / Requirements

- **Modern Web Browser:** Chrome, Safari, Edge, or Firefox with HTML5 Canvas and CSS backdrop-filter support.
- **Node.js (Optional for local dev):** v18.0.0 or higher.
- **Git:** v2.30+ for version control.
- **Handshake Account:** Active student or professional account to submit to the mission page.

---

## Installation / Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/piyushmakhija28/countdown-lockscreen-challenge.git
   cd countdown-lockscreen-challenge
   ```

2. **Run locally (Zero dependency option):**
   ```bash
   # Using Python 3:
   python -m http.server 8080

   # Or using npx serve:
   npx serve src/
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080` to interact with the countdown and generate wallpapers.

---

## Usage

### 1. Defining Your Goal & Deadline
- Enter your goal title (e.g., *"Google Software Engineering Internship"*).
- Select your target date and time.
- Click **"Decompose with Google Gemini"** to generate 4 sequential milestone sprints.

### 2. Lock Screen Simulation & Safe-Zone Toggle
- Toggle **"Phone Lock Screen Overlay"** to preview how native iOS/Android clocks, battery icons, and notification panels overlay the design.

### 3. Exporting Wallpaper
- Click **"Generate Lock Screen Wallpaper"** to render a high-resolution 1170x2532 image ready to save and apply directly to your phone.

---

## Architecture

Detailed design documents are maintained in [`docs/`](docs/):
- **Core Architecture:**
  - [DOC-00: Problem Statement & Scope](docs/00-problem-statement.md)
  - [DOC-01: Product Requirements Document (PRD)](docs/01-prd.md)
  - [DOC-02: High-Level Design (HLD)](docs/02-hld.md)
  - [DOC-03: API & Contract Specifications](docs/03-api-contract.md)
  - [DOC-04: Competition & Platform Research](docs/04-competition-and-platform-research.md)
  - [DOC-05: Software Requirements Specification (SRS)](docs/05-srs.md)
  - [DOC-06: Architecture Decision Records (ADR 001-012)](docs/06-adr/)
  - [DOC-07: Architecture Tradeoffs & FAQ](docs/07-architecture-tradeoffs-and-faq.md)
  - [DOC-08: Handshake Official Contest Submission Package](docs/08-handshake-submission-package.md)
  - [Contest Rules Summary](docs/competition-rules-summary.md)
  - [Lock Screen Design Strategy Playbook](docs/lockscreen-design-strategy.md)
- **Engineering Subsystems:**
  - [UI/UX Design System & Ergonomics](docs/ui-ux/)
  - [Low-Level Design & Mathematical Blueprints (LLD-01 to 11)](docs/lld/)
  - [DevOps, Docker & CI/CD Pipelines](docs/devops/)
  - [Security, STRIDE & OWASP Top 10 Audits](docs/security/)
  - [Resilience, Bulkhead & Retry Jitter](docs/resilience/)
  - [Observability, Telemetry & Health Probes](docs/observability/)
  - [Testing Pyramid, Triad Matrix & Load Benchmarks](docs/testing/)
  - [Project Management, WBS Backlog & Traceability Matrix](docs/management/)
- **UML Blueprints:**
  - [13 Canonical Mermaid UML Diagrams](uml/)

---

## Final Submission Checklist

- [x] **Project Title:** Handshake AI Skills Studio X Google: Countdown Lock Screen Challenge (`DOC-08`).
- [x] **Project Cover Image:** High-resolution mockup specification adhering to $1170 \times 2532\text{px}$ flagship standards.
- [x] **Project Description:** Authoritative problem narrative, backward milestones, safe-zone ergonomics, and psychological focus loop.
- [x] **Project Link/URL:** Publicly deployable link via GitHub Pages static edge.
- [x] **Submitted on Time:** Formatted and ready prior to **November 23, 2026 at 11:59 PM PT**.

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/countdown-theme`).
3. Commit your changes (`git commit -m "feat: add cyber-minimalist countdown theme"`).
4. Push to the branch (`git push origin feature/countdown-theme`).
5. Open a Pull Request.

---

**Built with pride for the Handshake AI Skills Studio X Google Challenge.**
