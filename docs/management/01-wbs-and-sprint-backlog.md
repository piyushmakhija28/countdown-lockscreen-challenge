# Level 10: Management Specification — Work Breakdown Structure (WBS) & Sprint Backlog

**Document ID:** `DOC-MGT-01-WBS-BACKLOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Agile WBS 40 Story Points)

---

## 1. Work Breakdown Structure (40 Story Points Total)

```
+---------------------------------------------------------------------------------------------------------------+
|                                      AGILE SPRINT DELIVERY ROADMAP (40 SP)                                    |
+---+----------------------------+--------+------------------------------------+--------------------------------+
| SP| Sprint Milestone Name      | Points | Deliverables & Features            | Status                         |
+---+----------------------------+--------+------------------------------------+--------------------------------+
| 1 | **Sprint 1: Architecture** | 8 SP   | 66 Deep Specs + 13 UMLs + 10 ADRs  | 100% COMPLETE [DONE & VERIFIED]|
| 2 | **Sprint 2: Core Engines** | 10 SP  | DualClockTimeEngine + PWA Shell    | ACTIVE IMPLEMENTATION          |
| 3 | **Sprint 3: Canvas & AI**  | 11 SP  | AdaptiveBufferAllocator + Gemini   | UPCOMING SPRINT 3              |
| 4 | **Sprint 4: Polish & Ship**| 11 SP  | Safe-Zone + Sensory Audio + Deploy | UPCOMING SPRINT 4              |
+---+----------------------------+--------+------------------------------------+--------------------------------+
```

---

## 2. Sprint Backlog Details (Epics & User Stories)

- **Epic 1: Time Chronometry & Ingress (8 SP):**
  - Story 1.1: Drift-compensated hybrid chronometer using `DualClockTimeEngine` (3 SP).
  - Story 1.2: Date picker ingress with future timestamp and NFKC input sanitization (2 SP).
  - Story 1.3: Stateless URL hash `#v1=` with `TokenBucketHistoryGuard` and `sessionStorage` micro-persistence (3 SP).
- **Epic 2: Google Gemini Intelligence (8 SP):**
  - Story 2.1: Gemini 3.8 Flash SDK integration with header-based `x-goog-api-key` auth (5 SP).
  - Story 2.2: Deterministic local `HeuristicGenerator` fallback planner (< 5ms) (3 SP).
- **Epic 3: Canvas 2D High-DPI Engine (11 SP):**
  - Story 3.1: Adaptive dual-constraint canvas buffer allocation (<= 16.7M px, <= 4096px) (5 SP).
  - Story 3.2: 3 Curated Thematic color palettes and radial gradients (Display P3) (3 SP).
  - Story 3.3: Web Share API Level 2 and Standalone PWA Modal Exporter (3 SP).
- **Epic 4: Lock Screen Ergonomics & Polish (13 SP):**
  - Story 4.1: Tri-modal responsive layout engine (foldable dual-column, ultra-tall, standard) (4 SP).
  - Story 4.2: Glassmorphic UI controls with APCA contrast guarantees (3 SP).
  - Story 4.3: GitHub Actions CI/CD deployment to GitHub Pages Fastly Edge CDN (3 SP).
  - Story 4.4: Autoplay-primed procedural Web Audio chime & haptic immersion (3 SP).

---

## 3. Engineering Definition of Done (DoD) & Risk Register

Every user story must satisfy the rigorous Definition of Done:
1. **Unit Test Coverage:** Minimum $\ge 90\%$ line and $\ge 85\%$ branch coverage verified via Vitest.
2. **Type Safety:** Zero compilation errors with strict TypeScript checking (`tsc --noEmit`).
3. **Governance Compliance:** Adherence to Level 2.2 Documentation Governance and Docstrings-only standards.
4. **Security Clearance:** Zero exposed secrets, zero inline scripts, and valid CSP Level 3 assertions.

### 6-Factor Project Risk Register
```
+---+---------------------------+------+--------+---------------------------------------------------------------+
| # | Risk Description          | Prob | Impact | Proactive Mitigation Strategy                                 |
+---+---------------------------+------+--------+---------------------------------------------------------------+
| 1 | Gemini API Quota Exhaustion| Med  | High   | Instant CircuitBreaker fallback to HeuristicGenerator (<5ms). |
| 2 | Safari WebKit Canvas Crash| Low  | High   | AdaptiveBufferAllocator hard DPR clamping to <= 2.0 (<= 16.7M)|
| 3 | Mobile Lockscreen Sleep   | High | Med    | Dual-clock UTC epoch re-anchoring on visibilitychange event.  |
| 4 | Autoplay Audio Blocked    | High | Low    | 1-sample silent priming on first touch; soft toast fallback.  |
| 5 | URL State Truncation      | Low  | Med    | 32KB decompression bomb guard + CRC-32 integrity digest.      |
| 6 | Subresource CDN Outage    | Med  | High   | 100% self-hosted WOFF2 fonts inside app bundle origin.        |
+---+---------------------------+------+--------+---------------------------------------------------------------+
```
