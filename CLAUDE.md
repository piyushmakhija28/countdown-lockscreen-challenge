# Claude Code Guidelines & Project Context

## Project Overview
This repository contains the design, code, and documentation for the **Handshake AI Skills Studio X Google Challenge** ("Your Deadline, Your Design: Create a Countdown Lock Screen").
- **Mission:** Build a countdown lock screen that helps people reach an important personal, academic, or professional deadline.
- **Contest Sponsor:** Handshake (Stryder Corp.) with Google.
- **Grand Prize:** $1,000 USD each for Top 3 Winners.
- **Evaluation Criteria:** Execution (25%), Creativity (25%), Usefulness (25%), Polish & Thoughtfulness (25%).

## Architecture & Structure
```
countdown-lockscreen-challenge/
├── .gitignore                         # Ignored files & Level 2.2 doc exclusions
├── SRS.md                             # Authoritative ISO/IEC/IEEE 29148 Software Requirements Specification
├── VERSION                            # Single source of truth version (2.3.0)
├── CHANGELOG.md                       # Keep a Changelog release history
├── CLAUDE.md                          # Developer instructions & context
├── README.md                          # Main documentation & challenge playbook
├── drawio/                            # The 13 Canonical Draw.io XML Diagrams (Rule 45 Parity)
├── docs/                              # Level 2.2 Deep Architecture & Governance (66 Specs)
│   ├── 00-problem-statement.md        # Problem Statement, Invariants & Ground Truth
│   ├── 01-prd.md                      # PRD, User Personas & Journey Maps
│   ├── 02-hld.md                      # High-Level Design, C4 Models & Dual Engine
│   ├── 03-api-contract.md             # Gemini 3.8 Flash Schema, URL Codec & APIs
│   ├── 04-competition-and-platform-research.md # 7-Page PDF Teardown & Rubric Math
│   ├── 05-srs.md                      # Authoritative Software Requirements Specification
│   ├── 06-adr/                        # Architecture Decision Records (ADR-001 to ADR-015)
│   ├── 07-architecture-tradeoffs-and-faq.md # Tradeoff Matrices & Judge FAQ
│   ├── 08-handshake-submission-package.md # Official Contest Submission Package
│   ├── competition-rules-summary.md   # Official Contest Rules Teardown
│   ├── lockscreen-design-strategy.md  # 1.8s Glanceability Index & Technical Moats
│   ├── ui-ux/                         # Deep-Dive UI/UX Architecture Suite (10 specs, Zero AI Slop)
│   ├── lld/                           # Low-Level Design & Mathematical Blueprints (11 specs)
│   ├── devops/                        # Docker Container, CI/CD & Edge Hosting (3 specs)
│   ├── security/                      # STRIDE, OWASP Top 10, Secrets & Validation (4 specs)
│   ├── resilience/                    # Bulkheads, Retry Jitter & Error Degradation (3 specs)
│   ├── observability/                 # Telemetry, Health Probes & PRR Review (3 specs)
│   ├── testing/                       # Testing Strategy, Triad Catalog & Load Benchmarks (3 specs)
│   └── management/                    # WBS Backlog, Orchestration DAG & RTM (3 specs)
├── uml/                               # The 13 Canonical Mermaid UML Diagrams
└── src/                               # Target Application Source Code (Sprint 2 Delivery)
    ├── index.html                     # Main application entry point
    ├── css/                           # Modern styling & design tokens
    └── js/                            # Real-time countdown & canvas export logic
```

## Development Guidelines
- **Strict Level 2.2 Governance:** Root directory strictly contains only 5 project management files: `README.md`, `CLAUDE.md`, `VERSION`, `CHANGELOG.md`, and `.gitignore`. All 60 architectural, functional, and requirement specifications reside strictly in `docs/`, all 13 Mermaid diagrams in `uml/`, and all 13 XML diagrams in `drawio/` to preserve a clean single source of truth.
- **Sprint Phasing Status:** Sprint 1 (Enterprise Architecture & Level 2.2 Documentation Governance Suite) is 100% complete and approved. `src/` represents the upcoming Sprint 2 target implementation delivery blueprint.
- **Level 2.2 Docstrings-Only:** Every public function and class must include contract docstrings specifying inputs, outputs, errors, and invariants. Redundant inline commentary narrating trivial statements is strictly banned.
- **Ergonomics First:** Every visual design must respect phone lock screen constraints: top 25-30% reserved for system clock/date/widgets, middle 50% for countdown & milestones, bottom 10-15% for system indicators.
- **Git Commit Standards:** Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
