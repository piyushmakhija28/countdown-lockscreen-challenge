# Level 10: Management Specification — Work Breakdown Structure (WBS) & Sprint Backlog

**Document ID:** `DOC-MGT-01-WBS-BACKLOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Agile WBS 48 Story Points Total)  
**Version:** 2.3.6

---

## 1. Agile Sprint Delivery Roadmap & GitHub Issue Tracking (48 SP Total)

```
+-----------------------------------------------------------------------------------------------------------------------+
|                                    AGILE SPRINT DELIVERY ROADMAP & GITHUB ISSUE TRACKING                              |
+---+----------------------------+--------+--------------------------+----------------------------------+---------------+
| SP| Sprint Milestone Name      | Points | GitHub Tracking Issue    | Deliverables & Core Features     | Status        |
+---+----------------------------+--------+--------------------------+----------------------------------+---------------+
| 1 | **Sprint 1: Architecture** | 8 SP   | Closed in Issue #11      | 66 Deep Specs + 13 UML + 13 Drawio| 100% COMPLETE |
| 2 | **Sprint 2: Core Domain**  | 10 SP  | Issue #12                | Core State, TimeEngine, URL Codec| READY (Phase A)|
| 3 | **Sprint 3: Canvas & AI**  | 11 SP  | Issue #13                | 9-Stage Canvas Engine, Gemini SDK| UPCOMING (Ph B)|
| 4 | **Sprint 4: UI & Sensory** | 11 SP  | Issue #14                | Sensory Immersion, Shell & PWA   | UPCOMING (Ph C)|
| 5 | **Sprint 5: Verification** | 8 SP   | Issue #15                | 40 Triad Tests & Lighthouse CI   | UPCOMING (Ph D)|
+---+----------------------------+--------+--------------------------+----------------------------------+---------------+
```

---

## 2. Granular Sprint Execution Roadmaps (Sprints 2, 3, 4 & 5)

### Sprint 2: Core Domain, State Architecture & Service Infrastructure (10 Story Points) — [Issue #12](https://github.com/piyushmakhija28/countdown-lockscreen-challenge/issues/12)
- **Batch 2.1: Clean Architecture Interfaces & State Store (3 SP):**
  - Implement `ports.js`: Clean Architecture abstract ports (`ITickScheduler`, `IMilestonePlanner`, `IRenderTarget`, `IWallpaperRenderer`, `IStateStoragePort`, `IPlatformLifecycle`, `ISensoryCoordinator`).
  - Implement `LifecycleScope.js`: RAII AbortController scope preventing zombie DOM/event listeners.
  - Implement `StateStore.js`: Zero-dependency immutable state store with trampoline microtask batching and same-origin `BroadcastChannel('countdown_lockscreen_sync')` inter-tab bus.
  - Implement `errors.js`: Strict domain error hierarchy (`ValidationError`, `NetworkError`, `RateLimitError`, `CanvasRenderError`, etc.).
- **Batch 2.2: Input Sanitization, Codec & Storage Resilience (3 SP):**
  - Implement `InputSanitizer.js`: NFKC Unicode normalization, Trojan Source Bidi stripping (`U+200E`, `U+202A-202E`), HTML tag rejection, and prototype pollution guards.
  - Implement `UrlStateService.js`: Base64URL serialization codec with `#v1=` schema and 32KB decompression bomb ceiling.
  - Implement `TokenBucketHistoryGuard.js`: 300ms leaky bucket rate limiter protecting `history.replaceState` against WebKit 100-call quota exhaustion.
  - Implement `ResilientStorageService.js`: 4-tier storage degradation ladder (`localStorage` $\to$ `sessionStorage` $\to$ in-memory `Map` heap fallback $\to$ URL hash memento).
- **Batch 2.3: Driftless Chronometer & Milestone Manager (4 SP):**
  - Implement `DualClockTimeEngine.js`: Drift-compensated hybrid chronometer coupling UTC universal epoch (`Date.now()`) with RAF and `visibilitychange` sleep re-anchoring.
  - Implement `WorkerTickerAdapter.js`: Inline Blob 1Hz background Web Worker ticker ensuring chronometer fidelity during tab throttling.
  - Implement `MilestoneManager.js`: Deterministic milestone sequencing, progress calculation ($P = c/n$), and completion transition events.

---

### Sprint 3: AI Retrograde Planning, 9-Stage Canvas Engine & Thematic CSS (11 Story Points) — [Issue #13](https://github.com/piyushmakhija28/countdown-lockscreen-challenge/issues/13)
- **Batch 3.1: Google Gemini 3.8 Flash SDK & Offline Fallback (4 SP):**
  - Implement `GeminiAiClient.js`: Header-based `x-goog-api-key` auth, OpenAPI 3.1 structured JSON Schema generation, and 4-second timeout abort.
  - Implement `GeminiRateLimiter.js`: Client-side 15 RPM token bucket enforcing free tier quotas.
  - Implement `HeuristicGenerator.js`: Deterministic local retrograde planner deconstructing deadlines into 4 equidistant checkpoints (< 5ms) when offline or rate-limited.
- **Batch 3.2: 9-Stage Canvas Wallpaper Engine (4 SP):**
  - Implement `CanvasRenderer.js`: 9-Stage offscreen composition pipeline (Base background, Scrim, Safe-zone guides, Arcs, Tabular digits, Badges, Affirmation, Tone-map, Sharpening).
  - Implement `AdaptiveBufferAllocator.js`: Closed-form dual-limit dynamic scaling ($S \le 2.0$, area $\le 16.7\text{MP}$, dimension $\le 4096\text{px}$) eliminating mobile Safari crashes.
  - Implement `ResponsiveLayoutEngine.js`: Tri-modal aspect ratio geometry solver and safe-zone margin calculator.
  - Implement `CanvasTextWrapper.js`: Greedy typographic wrapping with ellipsis clipping and zero layout shift.
- **Batch 3.3: Design System Tokens & Thematic Palettes (3 SP):**
  - Implement `themes.js` & `constants.js`: Cyber Obsidian, Deep Focus Zen, and Aurora Botanical OKLCH wide-gamut palettes.
  - Implement CSS token architecture: `src/css/tokens.css` (8pt spatial grid, typography), `src/css/safe-zones.css` (iOS 28% upper / 18% lower safe corridors), `src/css/glassmorphism.css` (multi-layer `backdrop-filter: blur(24px)`).

---

### Sprint 4: Tri-Modal Sensory Immersion, Ergonomic UI Shell & PWA Deployment (11 Story Points) — [Issue #14](https://github.com/piyushmakhija28/countdown-lockscreen-challenge/issues/14)
- **Batch 4.1: Tri-Modal Sensory Synchronization (4 SP):**
  - Implement `SensoryCoordinator.js`: Microtask dispatcher guaranteeing visual spring pop, Web Audio ADSR, and haptics fire within $\Delta t < 20\text{ms}$.
  - Implement `AudioChimeService.js`: Zero-overhead procedural Web Audio API major chord synthesis (C5-E5-G5-C6) with Web Locks API (`navigator.locks.request`) single-instance victory mutex.
  - Implement `HapticService.js`: Non-blocking vibration patterns (`[15, 30, 20]` for milestones, `[100, 50, 100, 50, 200]` for victory).
  - Implement `ParticleEngine.js`: Structure-of-Arrays (SoA) `Float32Array` confetti celebration dynamics with drag physics.
  - Implement `FontService.js`: Asynchronous Font Readiness Barrier Gate (`document.fonts.load()`).
- **Batch 4.2: Ergonomic UI Shell & Safe-Zone Simulator (4 SP):**
  - Implement `SafeZoneOverlay.js`: Interactive visual clearance overlay showing iOS Dynamic Island, Clock, and Android navigation widgets.
  - Implement `src/index.html`: Semantic HTML5 ergonomic shell, accessible ARIA live regions, date-time picker ingress, and download modal.
  - Implement `src/js/app.js`: Compositional root wiring state stores, views, engines, and event buses.
- **Batch 4.3: Progressive Web App & Production Deployment (3 SP):**
  - Implement `public/sw.js`: Asset-differentiated Service Worker caching (Network-First shell, Stale-While-Revalidate assets, Network-Only AI) with search param normalization.
  - Implement `public/manifest.json`: Web App manifest with standalone display, orientations, and maskable icons.
  - Finalize `.github/workflows/ci.yml`: Automated GitHub Actions pipeline for GitHub Pages live edge delivery.

---

### Sprint 5: Automated Triad Test Suite & Verification (8 Story Points) — [Issue #15](https://github.com/piyushmakhija28/countdown-lockscreen-challenge/issues/15)
- **Batch 5.1: Unit & Integration Triad Test Suite (3 SP):**
  - Implement 40-scenario Triad test catalog (Positive, Negative, Edge-Case) verifying all 20 mathematical invariants (`INV-001..020`) and 10 system invariants (`SYS-INV-001..010`).
- **Batch 5.2: 10,000-Frame Chronometer Soak Test (3 SP):**
  - Automated Playwright soak test asserting $< 50\text{MB}$ heap allocation ceiling and strictly $CLS = 0.000$ during all font glyph transitions.
- **Batch 5.3: Google Lighthouse CI & Handshake Package Certification (2 SP):**
  - Full Lighthouse audit asserting $\ge 95$ Performance, $100$ Accessibility, $100$ Best Practices, and PWA badge.
  - Certify Official Handshake Contest Submission Package against `docs/08-handshake-submission-package.md`.

---

## 3. Concrete Engineering Work Package Mapping (All 29 Work Packages)

```
+---------------+-----------------------------------------------+-------------------------------------------+---------------+-----------------------+
| Task ID       | Target Implementation File                    | Component Description                     | GitHub Issue  | Governed Requirements |
+---------------+-----------------------------------------------+-------------------------------------------+---------------+-----------------------+
| `TASK-ENG-01` | `src/js/core/DualClockTimeEngine.js`          | Wall-clock driftless RAF chronometer      | Issue #12     | `FR-05`, `FR-06`      |
| `TASK-ENG-02` | `src/js/core/MilestoneManager.js`             | Checkpoint sequencing & state transitions | Issue #12     | `FR-07`, `FR-08`      |
| `TASK-ENG-03` | `src/js/ai/GeminiAiClient.js`                 | Gemini 3.8 Flash SDK REST client          | Issue #13     | `FR-02`, `FR-04`      |
| `TASK-ENG-04` | `src/js/ai/HeuristicGenerator.js`             | Deterministic 5ms offline fallback planner| Issue #13     | `FR-03`               |
| `TASK-ENG-05` | `src/js/canvas/AdaptiveBufferAllocator.js`    | GPU scale & 16.7MP texture memory solver  | Issue #13     | `FR-11`, `FR-12`      |
| `TASK-ENG-06` | `src/js/canvas/ResponsiveLayoutEngine.js`     | Tri-modal viewport layout geometry        | Issue #13     | `FR-10`, `FR-20`      |
| `TASK-ENG-07` | `src/js/canvas/CanvasTextWrapper.js`          | Bidi isolation & greedy typographic wrap  | Issue #13     | `FR-20`               |
| `TASK-ENG-08` | `src/js/canvas/ParticleEngine.js`             | Float32Array celebration confetti physics | Issue #14     | `FR-21`               |
| `TASK-ENG-09` | `src/js/canvas/SafeZoneOverlay.js`            | Lockscreen safe-zone simulator overlay    | Issue #14     | `FR-09`               |
| `TASK-ENG-10` | `src/js/services/AudioChimeService.js`        | Procedural Web Audio ADSR chime & fanfare | Issue #14     | `FR-16`, `FR-24`      |
| `TASK-ENG-11` | `src/js/services/HapticService.js`            | W3C Vibration API tactile impulse patterns| Issue #14     | `FR-17`               |
| `TASK-ENG-12` | `src/js/services/FontService.js`              | Web font preloading & readiness barrier   | Issue #14     | `FR-22`               |
| `TASK-ENG-13` | `src/js/core/TokenBucketHistoryGuard.js`       | Leaky token bucket rate limiter (300ms)   | Issue #12     | `FR-18`               |
| `TASK-ENG-14` | `src/js/core/InputSanitizer.js`               | Unicode NFKC, Bidi & XSS shield           | Issue #12     | `FR-01`               |
| `TASK-ENG-15` | `src/js/core/UrlStateService.js`              | Compact Base64URL hash state codec (#v1=) | Issue #12     | `FR-14`               |
| `TASK-ENG-16` | `src/js/canvas/CanvasRenderer.js`             | 9-Stage offscreen 2D wallpaper engine     | Issue #13     | `FR-15`, `FR-19`, `FR-26`|
| `TASK-ENG-17` | `src/js/app.js`                               | Compositional root & view controller      | Issue #14     | ALL REQUIREMENTS      |
| `TASK-ENG-18` | `src/js/core/StateStore.js`                   | Immutable store & BroadcastChannel sync   | Issue #12     | `FR-23`, `ADR-011`     |
| `TASK-ENG-19` | `src/js/ai/GeminiRateLimiter.js`              | 15 RPM client token bucket guard          | Issue #13     | `FR-02`               |
| `TASK-ENG-20` | `src/js/services/WorkerTickerAdapter.js`       | 1Hz background inline Worker ticker       | Issue #12     | `FR-06`               |
| `TASK-ENG-21` | `src/js/core/LifecycleScope.js`               | RAII AbortController listener scope       | Issue #12     | `NFR-08`              |
| `TASK-ENG-22` | `src/js/services/ResilientStorageService.js`   | 4-Tier storage degradation ladder         | Issue #12     | `FR-14`, `SYS-INV-007`|
| `TASK-ENG-23` | `src/js/config/themes.js`                     | 3 Curated OKLCH glassmorphic palettes     | Issue #13     | `FR-13`               |
| `TASK-ENG-24` | `src/js/core/ports.js`                        | Clean Architecture abstract ports         | Issue #12     | ALL ARCHITECTURE      |
| `TASK-ENG-25` | `src/js/services/SensoryCoordinator.js`        | Tri-Modal Sensory Synchronization (<20ms) | Issue #14     | `FR-28`, `INV-020`    |
| `TASK-ENG-26` | `src/js/config/constants.js`                  | Hardware safe-zone boundaries & limits    | Issue #13     | `SYS-INV-003..005`    |
| `TASK-ENG-27` | `src/css/*.css` (tokens, safe-zones, glass)   | Modern CSS token system & glassmorphism    | Issue #13     | `FR-09`, `FR-13`      |
| `TASK-ENG-28` | `src/index.html`                              | Semantic HTML5 shell & accessible UI      | Issue #14     | `FR-01`, `FR-09`      |
| `TASK-ENG-29` | `public/sw.js` & `manifest.json`              | Cache-first PWA & offline manifest        | Issue #14     | `FR-29`, `FR-30`      |
+---------------+-----------------------------------------------+-------------------------------------------+---------------+-----------------------+
```

---

## 4. Engineering Definition of Done (DoD) & Quality Gates

Every work package must satisfy the rigorous Definition of Done:
1. **Unit Test Coverage:** Minimum $\ge 90\%$ line and $\ge 85\%$ branch coverage verified via Vitest.
2. **Type Safety:** Zero compilation errors with strict TypeScript checking (`tsc --noEmit`).
3. **Governance Compliance:** Adherence to Level 2.2 Documentation Governance and Docstrings-only standards.
4. **Security Clearance:** Zero exposed secrets, zero inline scripts, and valid CSP Level 3 assertions.
5. **Zero Layout Shift:** Cumulative Layout Shift strictly $CLS = 0.000$ during all countdown and milestone events.
6. **Hardware Safety:** Canvas area allocated never exceeds $16,777,216\text{ pixels}$ ($2^{24}$) and dimension $\le 4096\text{px}$.
