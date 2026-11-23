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
| 1 | **Sprint 1: Architecture** | 8 SP   | 54 Deep Specs + 13 UMLs (67 Total) | 100% COMPLETE [DONE & VERIFIED]|
| 2 | **Sprint 2: Core Engines** | 10 SP  | DualClockTimeEngine + PWA Shell    | ACTIVE IMPLEMENTATION          |
| 3 | **Sprint 3: Canvas & AI**  | 11 SP  | AdaptiveBufferAllocator + Gemini   | UPCOMING SPRINT 3              |
| 4 | **Sprint 4: Polish & Ship**| 11 SP  | Safe-Zone + Sensory Audio + Deploy | UPCOMING SPRINT 4              |
+---+----------------------------+--------+------------------------------------+--------------------------------+
```

---

## 2. Sprint Backlog Details (Epics & User Stories)

- **Epic 1: Time Chronometry & Ingress (8 SP):**
  - Story 1.1: Drift-compensated hybrid chronometer using `DualClockTimeEngine` (3 SP).
  - Story 1.2: Date picker ingress with future timestamp and NFKC input sanitization (`InputSanitizer`) (2 SP).
  - Story 1.3: Stateless URL hash `#v1=` with `TokenBucketHistoryGuard` and `UrlStateService` (3 SP).
- **Epic 2: Google Gemini Intelligence (8 SP):**
  - Story 2.1: Gemini 3.8 Flash SDK integration with header-based `x-goog-api-key` auth (`GeminiAiClient`) (5 SP).
  - Story 2.2: Deterministic local `HeuristicGenerator` fallback planner (< 5ms) (3 SP).
- **Epic 3: Canvas 2D High-DPI Engine (11 SP):**
  - Story 3.1: Adaptive dual-constraint canvas buffer allocation (`AdaptiveBufferAllocator`) (4 SP).
  - Story 3.2: Typography and FOIT elimination barrier (`FontService`, `CanvasTextWrapper`) (3 SP).
  - Story 3.3: 3 Curated Thematic color palettes and radial gradients (Display P3) (2 SP).
  - Story 3.4: Web Share API Level 2 and Standalone PWA Modal Exporter (`CanvasRenderer`) (2 SP).
- **Epic 4: Lock Screen Ergonomics & Polish (13 SP):**
  - Story 4.1: Tri-modal responsive layout engine and virtualViewport keyboard sync (`ResponsiveLayoutEngine`, `SafeZoneOverlay`) (4 SP).
  - Story 4.2: Float32Array celebration physics engine (`ParticleEngine`) (3 SP).
  - Story 4.3: Autoplay-primed procedural Web Audio chime & haptic immersion (`AudioChimeService`, `HapticService`) (3 SP).
  - Story 4.4: App orchestrator, Service Worker PWA, and GitHub Actions CI/CD deployment (`CountdownApp`) (3 SP).

---

## 3. Concrete Engineering Work Package Mapping (All 24 Work Packages)

```
+---------------+-------------------------------+-----------------------+-----------------------+
| Task ID       | Target Implementation File    | Component Description | Governed Requirements |
+---------------+-------------------------------+-----------------------+-----------------------+
| `TASK-ENG-01` | `src/js/core/DualClockTimeEngine.js` | Wall-clock driftless chronometer| `FR-05`, `FR-06`    |
| `TASK-ENG-02` | `src/js/core/MilestoneManager.js`    | Checkpoint sequencing & state | `FR-07`, `FR-08`    |
| `TASK-ENG-03` | `src/js/ai/GeminiAiClient.js`        | Gemini 3.8 Flash REST client  | `FR-02`, `FR-04`    |
| `TASK-ENG-04` | `src/js/ai/HeuristicGenerator.js`    | Deterministic offline fallback| `FR-03`             |
| `TASK-ENG-05` | `src/js/canvas/AdaptiveBufferAllocator.js`| GPU scale & texture solver| `FR-11`, `FR-12`    |
| `TASK-ENG-06` | `src/js/canvas/ResponsiveLayoutEngine.js` | Tri-modal viewport geometry| `FR-10`, `FR-20`   |
| `TASK-ENG-07` | `src/js/canvas/CanvasTextWrapper.js` | Bidi isolation & text wrap    | `FR-20`             |
| `TASK-ENG-08` | `src/js/canvas/ParticleEngine.js`    | Float32Array confetti physics | `FR-21`             |
| `TASK-ENG-09` | `src/js/canvas/SafeZoneOverlay.js`   | Lockscreen simulator overlay  | `FR-09`             |
| `TASK-ENG-10` | `src/js/services/AudioChimeService.js`| 4-state procedural Web Audio  | `FR-16`, `FR-24`    |
| `TASK-ENG-11` | `src/js/services/HapticService.js`   | Tactile vibration patterns    | `FR-17`             |
| `TASK-ENG-12` | `src/js/services/FontService.js`     | Web font loading barrier gate | `FR-22`             |
| `TASK-ENG-13` | `src/js/core/TokenBucketHistoryGuard.js`| Leaky token bucket rate limiter| `FR-18`          |
| `TASK-ENG-14` | `src/js/core/InputSanitizer.js`      | NFKC & Trojan Source shield   | `FR-01`             |
| `TASK-ENG-15` | `src/js/core/UrlStateService.js`     | Base64URL hash state codec    | `FR-14`             |
| `TASK-ENG-16` | `src/js/canvas/CanvasRenderer.js`    | 2D wallpaper rasterizer       | `FR-15`, `FR-19`    |
| `TASK-ENG-17` | `src/js/app.js`                      | Root orchestrator & view wire | ALL REQUIREMENTS    |
| `TASK-ENG-18` | `src/js/core/StateStore.js`          | Trampoline dispatch & tab sync| `FR-23`             |
| `TASK-ENG-19` | `src/js/ai/GeminiRateLimiter.js`     | 15 RPM client token bucket    | `FR-02`             |
| `TASK-ENG-20` | `src/js/services/WorkerTickerAdapter.js`| 1Hz background inline Worker | `FR-06`             |
| `TASK-ENG-21` | `src/js/core/LifecycleScope.js`      | RAII AbortController scope    | `NFR-08`            |
| `TASK-ENG-22` | `src/js/services/ResilientStorageService.js`| 4-tier storage degradation ladder| `FR-14`, `INV-007`|
| `TASK-ENG-23` | `src/js/config/themes.js`            | 3 Curated glassmorphic palettes| `FR-13`             |
| `TASK-ENG-24` | `src/js/core/ports.js`               | Clean Architecture abstract ports| ALL ARCHITECTURE  |
+---------------+-------------------------------+-----------------------+-----------------------+
```

---

## 4. Engineering Definition of Done (DoD) & Risk Register

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
