# Level 10: Management Specification — Work Breakdown Structure (WBS) & Sprint Backlog

**Document ID:** `DOC-MGT-01-WBS-BACKLOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Agile WBS 40 Story Points)

---

## 1. Work Breakdown Structure (40 Story Points Total)

```
+---------------------------------------------------------------------------------------------------+
|                                   AGILE SPRINT DELIVERY ROADMAP                                   |
+---+----------------------------+--------+------------------------------------+--------------------+
| SP| Sprint Milestone Name      | Points | Deliverables & Features            | Status             |
+---+----------------------------+--------+------------------------------------+--------------------+
| 1 | **Sprint 1: Architecture** | 8 SP   | 37 Deep Specs + 13 UMLs + MADR ADRs| 100% COMPLETE [DONE|
| 2 | **Sprint 2: Core Engines** | 10 SP  | TimeEngine + MilestoneStore + PWA  | ACTIVE READY       |
| 3 | **Sprint 3: Canvas & AI**  | 11 SP  | 1170x2532 Rasterizer + Gemini SDK  | UPCOMING           |
| 4 | **Sprint 4: Polish & Ship**| 11 SP  | Safe-Zone + Sensory Audio + Deploy | UPCOMING           |
+---+----------------------------+--------+------------------------------------+--------------------+
```

---

## 2. Sprint Backlog Details (Epics & User Stories)

- **Epic 1: Time Chronometry & Ingress (8 SP):**
  - Story 1.1: Drift-compensated countdown engine using `requestAnimationFrame` (3 SP).
  - Story 1.2: Date picker ingress with future timestamp validation (2 SP).
  - Story 1.3: Stateless URL hash `#v1=` with 300ms leaky bucket `HistoryQuotaGuard` (3 SP).
- **Epic 2: Google Gemini Intelligence (8 SP):**
  - Story 2.1: Gemini 3.8 Flash SDK integration with structured JSON schema (5 SP).
  - Story 2.2: Deterministic local `HeuristicGenerator` fallback planner (3 SP).
- **Epic 3: Canvas 2D High-DPI Engine (11 SP):**
  - Story 3.1: $1170 \times 2532$ Canvas 2D buffer with $2\times$ supersampling (5 SP).
  - Story 3.2: 3 Curated Thematic color palettes and radial gradients (3 SP).
  - Story 3.3: Web Share API Level 2 and Standalone PWA Modal Exporter (3 SP).
- **Epic 4: Lock Screen Ergonomics & Polish (13 SP):**
  - Story 4.1: Interactive iOS / Android safe-zone visual overlay (4 SP).
  - Story 4.2: Glassmorphic UI controls with APCA contrast guarantees (3 SP).
  - Story 4.3: GitHub Actions CI/CD deployment to GitHub Pages edge (3 SP).
  - Story 4.4: Multi-Sensory Procedural Web Audio Chime & Haptic Immersion (3 SP).
