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
3. **Dual-Mode System:**
   - **Interactive Web Application & PWA:** Live 60fps countdown ticker, milestone checklist, safe-zone simulator, and shareable `#v1=...` URL state.
   - **High-Resolution Wallpaper Generator:** HTML5 Canvas 2D engine with 2x supersampling exporting 1170x2532 portrait wallpapers ready for iOS and Android.

---

## Enterprise Documentation Suite (Level 2.2 Standard)

This project strictly adheres to Level 2.2 Documentation Governance, keeping only the 5 canonical doc files at root while providing an exhaustive 37-document blueprint suite in `docs/` and `uml/`:

```
countdown-lockscreen-challenge/
├── docs/
│   ├── 00-problem-statement.md             # Level 0: ISO/IEC/IEEE 29148 Problem Statement & Invariants
│   ├── 01-prd.md                           # Level 1: PRD, Personas, Journey Maps & Mission Traceability
│   ├── 02-hld.md                           # Level 2: High-Level Design, C4 Models & Dual-Engine Architecture
│   ├── 03-api-contract.md                  # Level 3: Gemini 3.8 Flash Schema, URL Codec & Component Contracts
│   ├── 04-competition-and-platform-research.md # Level 4: 7-Page PDF Teardown, 4x25% Rubric Math & OS Specs
│   ├── 05-srs.md                           # Level 5: Detailed Functional & Non-Functional Traceability
│   ├── 06-adr/                             # Level 6: Architecture Decision Records (ADR-001 to 008)
│   ├── 07-architecture-tradeoffs-and-faq.md # Level 7: Tradeoff Matrices, Failure Modes & Judge FAQ
│   ├── ui-ux/                              # Design System (8pt Grid, Tokens, Safe Zones, WCAG/APCA a11y)
│   ├── lld/                                # Low-Level Design (Classes, Sequences, FSM, Concurrency, SOLID)
│   ├── devops/                             # Docker Multi-Stage Container, GitHub Actions CI/CD, Edge CDN
│   ├── security/                           # STRIDE Threat Model, OWASP Web Top 10, Input Sanitization
│   ├── resilience/                         # Bulkhead Isolation, Exponential Retry Jitter, Error Catalogue
│   ├── observability/                      # Structured JSON Telemetry, Core Web Vitals, Production Review
│   ├── testing/                            # Testing Pyramid, Triad Matrix (Positive/Negative/Edge), Load
│   └── management/                         # WBS & Sprint Backlog, Service Orchestration DAG, Traceability Matrix
└── uml/                                    # The 13 Canonical Mermaid UML Diagrams
    ├── activity_diagram.md                 # User activity flow for countdown & wallpaper generation
    ├── call_graph_diagram.md               # Function and method invocation hierarchy
    ├── class_diagram.md                    # Core OOP classes, interfaces, and methods
    ├── communication_diagram.md            # Inter-module collaboration during timer ticks
    ├── component_diagram.md                # System components and external boundaries
    ├── composite_diagram.md                # Internal composition of Canvas 2D engine
    ├── deployment_diagram.md               # GitHub Pages edge CDN, browser, and Gemini cloud
    ├── interaction_diagram.md              # Interaction overview across user journeys
    ├── object_diagram.md                   # Runtime memory state snapshot
    ├── package_diagram.md                  # Module layering and namespace boundaries
    ├── sequence_diagram.md                 # End-to-end execution sequence
    ├── state_diagram.md                    # Countdown and milestone finite state machine
    └── usecase_diagram.md                  # System actors and use case specifications
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

Detailed design documents are maintained in [`docs/`](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/):
- [DOC-00: Problem Statement & Scope](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/00-problem-statement.md)
- [DOC-01: Product Requirements Document (PRD)](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/01-prd.md)
- [DOC-02: High-Level Design (HLD)](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/02-hld.md)
- [DOC-03: API & Contract Specifications](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/03-api-contract.md)
- [DOC-04: Competition & Platform Research](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/04-competition-and-platform-research.md)
- [DOC-05: Software Requirements Specification (SRS)](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/05-srs.md)
- [DOC-06: Architecture Decision Records (ADR 001-008)](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/06-adr/)
- [DOC-07: Architecture Tradeoffs & FAQ](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/07-architecture-tradeoffs-and-faq.md)

---

## Final Submission Checklist

- [ ] **Project Title:** Clear, catchy, and memorable (e.g., *"Apex Countdown: The 30-Day Launchpad"*).
- [ ] **Project Cover Image:** High-resolution mockup showing the lock screen on an actual phone mockup.
- [ ] **Project Description:** Concise story explaining the problem, the deadline, the milestones, and why this design keeps you focused.
- [ ] **Project Link/URL:** Publicly deployed link on GitHub Pages.
- [ ] **Submitted on Time:** Submitted prior to **November 23 at 11:59 PM PT**.

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/countdown-theme`).
3. Commit your changes (`git commit -m "feat: add cyber-minimalist countdown theme"`).
4. Push to the branch (`git push origin feature/countdown-theme`).
5. Open a Pull Request.

---

**Built with pride for the Handshake AI Skills Studio X Google Challenge.**
