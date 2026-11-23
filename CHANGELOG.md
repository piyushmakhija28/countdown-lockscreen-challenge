# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-23

### Changed
- **66-Document Architecture & Governance Suite Synchronization:** Fully synchronized all 53 architectural specifications in `docs/` and 13 Mermaid UML diagrams in `uml/` to strict Level 2.2 Documentation Governance.
- **Normalized Documentation Headers:** Standardized all 43 document headers across `docs/` to authoritative Level 2.2 Documentation Governance, eliminating legacy draft references.
- **Canonical Relative Markdown Hyperlinks:** Replaced all hardcoded absolute filesystem paths in root and subsystem markdown files with portable, GitHub-compliant relative links.
- **Traceability Matrix Deepening (`DOC-MGT-03`):** Expanded Requirements Traceability Matrix to 100% bidirectional coverage across all 19 Functional Requirements (`FR-01` to `FR-19`), 10 Non-Functional Requirements, 10 ADRs, and 4x25% challenge evaluation rubric.
- **Sprint Backlog & WBS Alignment (`DOC-MGT-01` & `DOC-MGT-02`):** Updated WBS and orchestration DAG to index all 10 ADRs, 11 LLDs, and 53 specifications with 40 Story Points (SP) allocation and explicit Definition of Done (DoD).

### Security
- **Strict Content Security Policy (CSP Level 3):** Hardened CSP policy in `DOC-SEC-02` by eliminating `'unsafe-inline'`, enforcing strict `script-src 'self'`, and adopting self-hosted WOFF2 fonts (`font-src 'self'`).
- **Google Gemini API Key Protection (`DOC-SEC-03`):** Enforced mandatory `x-goog-api-key` HTTP request header transmission (query string transport strictly banned), ephemeral memory-only retention, and regex scrubber `AIza[0-9A-Za-z\-_]{35,40}` across all logging sinks and unhandled exception interceptors.
- **Anti-Exploit Input Validation & Sanitization Pipeline (`DOC-SEC-04`):**
  - Implemented Unicode NFKC normalization and Trojan Source bidirectional override stripping (`U+200E`, `U+200F`, `U+202A-202E`, `U+2066-2069`).
  - Added strict whitelist regex rejecting HTML/markup tags (`<script>`, `<iframe>`, `javascript:`).
  - Enforced recursive prototype pollution defense reviver stripping `__proto__`, `constructor`, and `prototype` keys during JSON state hydration.
  - Implemented 32 KB uncompressed payload ceiling guard mitigating compression bomb attacks.
- **SVG Injection & Constant-Time Crypto Hardening (`DOC-LLD-08`):** Replaced dangerous SVG string interpolation with programmatic `document.createElementNS` / `textContent` DOM node construction (TX-01), and added constant-time bitwise equality `constantTimeEquals()` for digest comparison (CR-03).

### Added
- **Hardware-Constrained Closed-Form GPU Texture Allocator (`ADR-004`):** Derived dual-constraint mathematical optimization formula solving iOS Safari WebKit $16.7\text{M}$ pixel area ceiling and $4096\text{px}$ linear texture dimension limit (`AdaptiveBufferAllocator`).
- **4-State Resilient Procedural Web Audio Engine (`ADR-009`):** Specified complete 4-state audio lifecycle (`LOCKED`, `UNLOCKED`, `INTERRUPTED`, `DEGRADED`), user-gesture priming via 1-sample silent buffer, and soft degradation to vibration and toast notifications upon autoplay rejection.
- **Token-Bucket URL History Governor (`ADR-010`):** Implemented `TokenBucketHistoryGuard` (30 tokens, 2/s refill) backed by instant synchronous `sessionStorage` persistence and `visibilitychange`/`pagehide` flush hooks, eliminating Safari 100-call quota crashes while guaranteeing zero state loss on tab unload.
- **Tri-Modal Responsive Layout Engine (`DOC-UI-02`):** Formalized responsive geometry engine accommodating ultra-tall flagship displays ($\mathcal{R} \ge 2.15$), standard smartphones ($1.70 \le \mathcal{R} < 2.15$), and foldable/tablet dual-column split views ($\mathcal{R} < 1.70$).
- **Subsystem Deepening Across 15 Thin Specifications:**
  - `devops/`: Non-root Nginx container spec, automated TruffleHog CI/CD secrets scanning, and granular HTTP/3 Edge CDN caching matrix.
  - `observability/`: 100-entry circular ring-buffer `DiagnosticLogger`, Core Web Vitals PerformanceObserver watchdog, and 10-point PRR scorecard.
  - `resilience/`: `BulkheadLimiter` concurrency semaphore with $45\text{MB}$ pre-allocation heap guard, Full Jitter Exponential Backoff `CircuitBreaker`, and 15-error degradation recovery matrix.
  - `testing/`: Comprehensive 40-scenario Triad test catalog (17 Positive, 11 Negative, 12 Edge-case) and automated Playwright 10,000-frame soak test benchmark.

## [1.0.0] - 2026-11-22

### Changed
- **Single-Source SRS Consolidation:** Merged Handshake X Google 4-pillar acceptance criteria and scope boundaries into `docs/05-srs.md`, establishing it as the sole, authoritative Software Requirements Specification.
- **Root Directory Clean Governance:** Removed redundant root `SRS.md`, enforcing strict governance where the root directory contains strictly the 4 project management files (`README.md`, `CLAUDE.md`, `VERSION`, `CHANGELOG.md`) and all specifications live exclusively under `docs/`.

### Added
- **Deep-Dive Design Patterns, Game Loop & Defensive Security Architecture (`DOC-LLD-11` & Subsystem Sync):**
  - **`DOC-LLD-11` Deep-Dive Specification:** Canonical engineering specification detailing Gang-of-Four patterns (Flyweight static string/trig pools, Chain of Responsibility 4-tier export pipeline, State pattern FSM handlers, typed Observer, Strategy, and Adapter), fixed-timestep accumulator with 100ms spiral-of-death clamp, Roofline model GPU memory bandwidth decimation ($60\text{ FPS} \to 1\text{ FPS}$ saving $98.3\%$ DRAM bandwidth), Web Audio low-pass and compressor limiter graph with $15\text{ms}$ zipper-noise prevention, semi-implicit Euler confetti with aerodynamic drag, and `prefers-reduced-motion` accessibility.
  - **Client-Side Security Hardening:** Implemented prototype pollution immunity in URL state hydration (`__proto__`, `constructor`, `prototype` recursive stripping), lexical closure API key zero-exfiltration invariant, strict CSP Level 3 policy (`media-src 'none'`), and constant-time hash verification.
  - **Subsystem Traceability & Error Sync:** Updated `DOC-MGT-03` RTM to include `FR-16` to `FR-19`, expanded `DOC-RES-03` error degradation table to 15 codes, added Sensory and History bulkheads in `DOC-RES-01`, enhanced STRIDE threat model in `DOC-SEC-01`, updated input validation pipeline in `DOC-SEC-04`, expanded telemetry events in `DOC-OBS-01`, and updated sprint backlog in `DOC-MGT-01` to 40 SP.
- **10/10 Cross-Document Architectural Alignment Suite (HLD, SRS, ADR, Testing, Submission & UML):**
  - **`DOC-02-HLD` High-Level Design:** Updated C4 Level 2 Container and C4 Level 3 Component diagrams to include `AudioChimeService`, `HapticFeedbackService`, `HistoryQuotaGuard`, `CanvasTextWrapper`, and `ParticleEngine`. Updated sequence diagram with timer expiration celebration and debounced state synchronization.
  - **`DOC-05-SRS` Software Requirements Specification:** Formalized `FR-16` (Procedural Web Audio Victory Chime), `FR-17` (Tactile Haptic Vibration Feedback), `FR-18` (Debounced URL History Synchronization), and `FR-19` (Native Web Share & Standalone PWA Modal Exporter). Updated Requirements Traceability Matrix (RTM) mappings.
  - **`ADR-009` Procedural Web Audio vs Static Media:** Formal architectural decision adopting zero-overhead ($0\text{ KB}$), 100% offline Web Audio oscillator synthesis over static MP3 audio files.
  - **`ADR-010` Leaky Bucket History Guard vs Synchronous ReplaceState:** Formal architectural decision adopting a 300ms trailing-edge leaky bucket ($f_{\max} \le 3.33\text{ Hz}$) to eliminate WebKit/Safari 100-call / 30s `SecurityError` crashes.
  - **`DOC-TEST-02` Testing Catalog:** Added Triad test cases `TC-POS-16` (Audio Chime Synthesis), `TC-POS-17` (Haptic Vibration Trigger), `TC-NEG-11` (Web Share Cancellation Fallback), `TC-EDGE-11` (Safari 100-Call Quota Debounce), and `TC-EDGE-12` (Audio Autoplay Gesture Unlock).
  - **`DOC-08-SUBMISSION-PACKAGE` Official Contest Submission Package:** Dedicated Handshake AI Skills Studio X Google Challenge specification consolidating official Title, 4-pillar description, cover image specifications ($1170 \times 2532\text{px}$ flagship mockup), public GitHub Pages URL, judge walkthrough script, and 100/100 rubric verification.
  - **UML Diagrams Synchronization (`uml/`):** Upgraded `state_diagram.md` to full 11-State FSM, updated `component_diagram.md` with sensory and concurrency blocks, and expanded `sequence_diagram.md` with the sensory celebration loop.
- **10/10 Enterprise Benchmark Elevation of Foundational LLD Suite (`DOC-LLD-01` to `07`):**
  - **`DOC-LLD-01` Class & Object Design:** Added 6 production-grade class contracts (`AudioChimeService`, `HapticFeedbackService`, `CanvasTextWrapper`, `HistoryQuotaGuard`, `ZeroAllocationTickEngine`, `SafeZoneOverlay`) and Vanilla ES Modules JSDoc typing mapping.
  - **`DOC-LLD-02` Dynamic Sequences:** Expanded from 4 to 10 comprehensive sequence diagrams covering Theme Switching, Goal Expiration & Victory Celebration, 300ms History Quota Guard, Web Share Fallback Modal, Canvas Font Race Resolution, and Service Worker In-App Update.
  - **`DOC-LLD-03` State Machine Lifecycle:** Expanded formal FSM to 11 states ($S$) with `CELEBRATING_EXPIRED`, `SHARE_MODAL_ACTIVE`, `CONFIGURING_INPUT`, complete 11x11 transition matrix, and hierarchical statechart.
  - **`DOC-LLD-04` Concurrency & Threading:** Added Safari `replaceState` 100-call leaky bucket rate-limiter, mobile Web Audio autoplay gesture unlocking protocol, celebration particle engine Float32Array loop, and iOS PWA `pageshow`/`pagehide` lifecycle.
  - **`DOC-LLD-05` Design Patterns & SOLID:** Integrated Flyweight (lookup tables and cached trig values), Chain of Responsibility (multi-tier export pipeline), and State patterns into the GoF architectural matrix.
  - **`DOC-LLD-06` Exception Hierarchy:** Expanded domain exception tree to 14 classes and 14-item automated recovery matrix including `AudioAutoplayBlockedError`, `HistoryThrottledError`, `ClipboardPermissionError`, and `Context2DUnavailableError`.
  - **`DOC-LLD-07` Package Structure:** Registered all new service and canvas modules in code architecture blueprint.
- **40 Micro-Architectural Implementation Hazards & Edge-Case Details (`DOC-LLD-10` across 14 Categories):**
  - Exhaustive 40-item micro-architectural specification detailing failure mechanisms, exact TypeScript/CSS code patterns, and verification matrices in `docs/lld/10-micro-architectural-implementation-details.md`.
- **Cross-Device Pixel-Perfect Mathematical Blueprint (`DOC-LLD-09` across 10 Modules):**
  - Synthesized comprehensive mathematical design blueprint deriving all quantitative calculations from first principles.
- **100-Issue Century Edition System Design & LLD Vulnerability Audit Suite (`DOC-LLD-08` across 44 Dimensions):**
  - Comprehensive 100-vulnerability engineering catalog with mathematical proofs, failure mechanisms, and TypeScript architectural code blocks across 44 architectural dimensions.
  - Complete 100-Issue Resolution Verification Matrix.
