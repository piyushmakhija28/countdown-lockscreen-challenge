# Level 10: Management Specification — Work Breakdown Structure (WBS) & Sprint Backlog

**Document ID:** `DOC-MGT-01-WBS-BACKLOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Agile WBS 40 Story Points)  
**Version:** 2.3.5

---

## 1. Agile Sprint Delivery Roadmap (40 Story Points Total)

```
+---------------------------------------------------------------------------------------------------------------+
|                                      AGILE SPRINT DELIVERY ROADMAP (40 SP)                                    |
+---+----------------------------+--------+------------------------------------+--------------------------------+
| SP| Sprint Milestone Name      | Points | Deliverables & Features            | Status                         |
+---+----------------------------+--------+------------------------------------+--------------------------------+
| 1 | **Sprint 1: Architecture** | 8 SP   | 66 Deep Specs + 13 UML + 13 Drawio | 100% COMPLETE [DONE & VERIFIED]|
| 2 | **Sprint 2: Core Domain**  | 10 SP  | Core State, TimeEngine, URL Codec  | READY FOR EXECUTION (Phase A)  |
| 3 | **Sprint 3: Canvas & AI**  | 11 SP  | 9-Stage Canvas Engine & Gemini SDK | UPCOMING SPRINT 3 (Phase B)    |
| 4 | **Sprint 4: Polish & Ship**| 11 SP  | Sensory Immersion, Shell & PWA     | UPCOMING SPRINT 4 (Phase C)    |
+---+----------------------------+--------+------------------------------------+--------------------------------+
```

---

## 2. Granular Sprint Execution Roadmaps (Sprints 2, 3 & 4)

### Sprint 2: Core Domain, State Architecture & Service Infrastructure (10 Story Points)
- **Batch 2.1: Clean Architecture Interfaces & State Store (3 SP):**
  - Implement `ports.js`: Clean Architecture abstract ports (`ITickScheduler`, `IMilestonePlanner`, `IRenderTarget`, `IWallpaperRenderer`, `IStateStoragePort`, `IPlatformLifecycle`, `ISensoryCoordinator`).
  - Implement `LifecycleScope.js`: RAII AbortController scope preventing zombie DOM/event listeners.
  - Implement `StateStore.js`: Zero-dependency immutable state store with trampoline microtask batching and same-origin `BroadcastChannel('countdown_lockscreen_sync')` inter-tab bus.
  - Implement `errors.js`: Strict domain error hierarchy (`ValidationError`, `NetworkError`, `RateLimitError`, `CanvasRenderError`, etc.).
- **Batch 2.2: Input Sanitization, Codec & Storage Resilience (3 SP):**
  - Implement `InputSanitizer.js`: NFKC Unicode normalization, Trojan Source Bidi stripping (`U+200E`, `U+202A-202E`), HTML tag rejection, and prototype pollution guards.
  - Implement `UrlStateService.js`: Base64URL serialization codec with `#v1=` schema and 32KB decompression bomb ceiling.
  - Implement `TokenBucketHistoryGuard.js`: 300ms leaky bucket rate limiter protecting `history.replaceState` against WebKit 100-call quota exhaustion.
  - Implement `ResilientStorageService.js`: 4-tier storage degradation ladder (`localStorage` $	o$ `sessionStorage` $	o$ in-memory `Map` heap fallback $	o$ URL hash memento).
- **Batch 2.3: Driftless Chronometer & Milestone Manager (4 SP):**
  - Implement `DualClockTimeEngine.js`: Drift-compensated hybrid chronometer coupling UTC universal epoch (`Date.now()`) with RAF and `visibilitychange` sleep re-anchoring.
  - Implement `WorkerTickerAdapter.js`: Inline Blob 1Hz background Web Worker ticker ensuring chronometer fidelity during tab throttling.
  - Implement `MilestoneManager.js`: Deterministic milestone sequencing, progress calculation ($P = c/n$), and completion transition events.

---

### Sprint 3: AI Retrograde Planning, 9-Stage Canvas Engine & Thematic CSS (11 Story Points)
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

### Sprint 4: Tri-Modal Sensory Immersion, Ergonomic UI Shell & PWA Deployment (11 Story Points)
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

## 3. Concrete Engineering Work Package Mapping (All 29 Work Packages)

```
+---------------+-----------------------------------------------+-------------------------------------------+-----------------------+
| Task ID       | Target Implementation File                    | Component Description                     | Governed Requirements |
+---------------+-------------------------------+-------------------------------------------+-----------------------+
| `TASK-ENG-01` | `src/js/core/DualClockTimeEngine.js`          | Wall-clock driftless RAF chronometer      | `FR-05`, `FR-06`      |
| `TASK-ENG-02` | `src/js/core/MilestoneManager.js`             | Checkpoint sequencing & state transitions | `FR-07`, `FR-08`      |
| `TASK-ENG-03` | `src/js/ai/GeminiAiClient.js`                 | Gemini 3.8 Flash SDK REST client          | `FR-02`, `FR-04`      |
| `TASK-ENG-04` | `src/js/ai/HeuristicGenerator.js`             | Deterministic 5ms offline fallback planner| `FR-03`               |
| `TASK-ENG-05` | `src/js/canvas/AdaptiveBufferAllocator.js`    | GPU scale & 16.7MP texture memory solver  | `FR-11`, `FR-12`      |
| `TASK-ENG-06` | `src/js/canvas/ResponsiveLayoutEngine.js`     | Tri-modal viewport layout geometry        | `FR-10`, `FR-20`      |
| `TASK-ENG-07` | `src/js/canvas/CanvasTextWrapper.js`          | Bidi isolation & greedy typographic wrap  | `FR-20`               |
| `TASK-ENG-08` | `src/js/canvas/ParticleEngine.js`             | Float32Array celebration confetti physics | `FR-21`               |
| `TASK-ENG-09` | `src/js/canvas/SafeZoneOverlay.js`            | Lockscreen safe-zone simulator overlay    | `FR-09`               |
| `TASK-ENG-10` | `src/js/services/AudioChimeService.js`        | Procedural Web Audio ADSR chime & fanfare | `FR-16`, `FR-24`      |
| `TASK-ENG-11` | `src/js/services/HapticService.js`            | W3C Vibration API tactile impulse patterns| `FR-17`               |
| `TASK-ENG-12` | `src/js/services/FontService.js`              | Web font preloading & readiness barrier   | `FR-22`               |
| `TASK-ENG-13` | `src/js/core/TokenBucketHistoryGuard.js`       | Leaky token bucket rate limiter (300ms)   | `FR-18`               |
| `TASK-ENG-14` | `src/js/core/InputSanitizer.js`               | Unicode NFKC, Bidi & XSS shield           | `FR-01`               |
| `TASK-ENG-15` | `src/js/core/UrlStateService.js`              | Compact Base64URL hash state codec (#v1=) | `FR-14`               |
| `TASK-ENG-16` | `src/js/canvas/CanvasRenderer.js`             | 9-Stage offscreen 2D wallpaper engine     | `FR-15`, `FR-19`, `FR-26`|
| `TASK-ENG-17` | `src/js/app.js`                               | Compositional root & view controller      | ALL REQUIREMENTS      |
| `TASK-ENG-18` | `src/js/core/StateStore.js`                   | Immutable store & BroadcastChannel sync   | `FR-23`, `ADR-011`     |
| `TASK-ENG-19` | `src/js/ai/GeminiRateLimiter.js`              | 15 RPM client token bucket guard          | `FR-02`               |
| `TASK-ENG-20` | `src/js/services/WorkerTickerAdapter.js`       | 1Hz background inline Worker ticker       | `FR-06`               |
| `TASK-ENG-21` | `src/js/core/LifecycleScope.js`               | RAII AbortController listener scope       | `NFR-08`              |
| `TASK-ENG-22` | `src/js/services/ResilientStorageService.js`   | 4-Tier storage degradation ladder         | `FR-14`, `SYS-INV-007`|
| `TASK-ENG-23` | `src/js/config/themes.js`                     | 3 Curated OKLCH glassmorphic palettes     | `FR-13`               |
| `TASK-ENG-24` | `src/js/core/ports.js`                        | Clean Architecture abstract ports         | ALL ARCHITECTURE      |
| `TASK-ENG-25` | `src/js/services/SensoryCoordinator.js`        | Tri-Modal Sensory Synchronization (<20ms) | `FR-28`, `INV-020`    |
| `TASK-ENG-26` | `src/js/config/constants.js`                  | Hardware safe-zone boundaries & limits    | `SYS-INV-003..005`    |
| `TASK-ENG-27` | `src/css/*.css` (tokens, safe-zones, glass)   | Modern CSS token system & glassmorphism    | `FR-09`, `FR-13`      |
| `TASK-ENG-28` | `src/index.html`                              | Semantic HTML5 shell & accessible UI      | `FR-01`, `FR-09`      |
| `TASK-ENG-29` | `public/sw.js` & `manifest.json`              | Cache-first PWA & offline manifest        | `FR-29`, `FR-30`      |
+---------------+-----------------------------------------------+-------------------------------------------+-----------------------+
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
