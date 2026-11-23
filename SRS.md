# Software Requirements Specification (SRS)
### Countdown Lock Screen & High-DPI Wallpaper Generation Platform

**Standard:** ISO/IEC/IEEE 29148:2018 Systems and Software Engineering — Life Cycle Processes — Requirements Engineering  
**Governance:** Level 2.2 Documentation Governance  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Version:** 2.3.1  
**Detailed Technical Specification:** [docs/05-srs.md](docs/05-srs.md)  

---

## 1. Purpose

This document establishes the formal, verifiable Software Requirements Specification (SRS) for the **AI-Powered Countdown Lock Screen & Wallpaper Generation Engine**, conforming strictly to the **ISO/IEC/IEEE 29148:2018** standard.

The primary objective of this system is to bridge the psychological gap between abstract deadlines and actionable daily execution. By combining **Google Gemini 3.8 Flash** backward milestone planning with mathematical smartphone lock screen ergonomics, the application converts high-stakes academic, professional, and personal deadlines into an ambient, glanceable visual motivator viewed an average of **96 times per day**.

---

## 2. Scope

The platform is engineered as an edge-delivered Progressive Web Application (PWA) operating under a **Decoupled Dual-Engine Architecture**:
1. **Interactive Reactive DOM/CSS Shell:** Provides an accessible web preview, deadline ingress, milestone checklist, theme switcher, and safe-zone ergonomic simulator.
2. **High-DPI Canvas 2D Composition Engine:** Generates downloadable, hardware-tailored lock screen wallpapers ($1170 \times 2532\text{px}$ up to $1440 \times 3120\text{px}$) with mathematical safe-zone exclusion and contrast adaptation.

### Major System Deliverables
- Zero-build native ES2022+ ESM client execution hosted on GitHub Pages Edge CDN.
- Retrograde milestone decomposition powered by Google Gemini 3.8 Flash with structured JSON schema enforcement.
- Deterministic heuristic fallback engine for 100% offline milestone generation.
- Hardware-constrained dynamic buffer allocator (`AdaptiveBufferAllocator`) preventing WebKit iOS $16.7\text{MP}$ crashes.
- Procedural Web Audio synthesizer generating pentatonic harmonic chords without network latency.
- Polymorphic URL state codec (`#v1=`) with 32 KB decompression bomb protection.

---

## 3. Requirements

### 3.1 Functional Requirements

The system satisfies 30 verifiable functional requirements categorized across 7 core functional areas:

#### A. Temporal Ingress & Chronometry Engine
- **FR-01 (Deadline Ingress & Temporal Validation):** Validates target deadline is strictly in the future ($t_{\text{target}} \ge t_{\text{now}} + 3600000\text{ms}$).
- **FR-05 (Dual-Clock Chronometry Engine):** Hybrid chronometer combining UTC `Date.now()` with high-resolution `performance.now()`, surviving OS sleep and tab throttling.
- **FR-06 (Time Unit Decomposition & Formatting):** Decomposes remaining milliseconds into Days, Hours, Minutes, and Seconds with leading zeros.
- **FR-25 (OpenType Tabular Numeral Chronometry):** Enforces `font-variant-numeric: tabular-nums` (`tnum`) across countdown digits, eliminating horizontal layout jitter ($CLS = 0.000$).

#### B. Artificial Intelligence & Milestone Decomposition
- **FR-02 (Gemini AI Backward Milestone Decomposition):** Invokes Gemini 3.8 Flash to decompose goals into 3 to 5 retrograde milestones working backward from the deadline.
- **FR-03 (Motivational Affirmation Synthesis):** Synthesizes contextual micro-affirmations tailored to goal domain.
- **FR-04 (Heuristic Offline Fallback Decomposition):** Procedural rule-based milestone generator executing entirely client-side when offline.
- **FR-07 (Interactive Milestone Checklist):** Real-time toggling of milestone completion status with reactive progress ring advancement.
- **FR-08 (Milestone Temporal Recalibration):** Automatic chronological re-sorting and dynamic day offset recalculation.

#### C. Mobile Safe-Zone Ergonomics & Responsive Shell
- **FR-09 (Flagship Safe-Zone Exclusion Clipping):** Strictly reserves upper 28% for system clock/widgets and lower 18% for gesture navigation.
- **FR-10 (Tri-Modal Responsive Layout Engine):** Dynamically scales between Mobile Lockscreen ($< 640\text{px}$), Tablet ($640\text{--}1024\text{px}$), and Desktop ($> 1024\text{px}$).
- **FR-20 (Interactive Safe-Zone Visualizer):** Toggleable overlay displaying Dynamic Island, notch, clock, and home indicator boundaries.

#### D. High-DPI Graphics & Wallpaper Composition
- **FR-11 (Offscreen Canvas 2D Composition):** 9-stage offscreen canvas composition producing razor-sharp native wallpapers.
- **FR-12 (One-Click Wallpaper PNG Export):** Lossless PNG Blob generation via `canvas.toBlob('image/png', 1.0)`.
- **FR-15 (Adaptive Buffer Allocation):** Closed-form dual-limit scale solver bounding canvas surface area below $16,777,216\text{ pixels}$.
- **FR-26 (Multi-Device Flagship Export):** Pre-configured export targets for iPhone 16 Pro Max, S24 Ultra, Pixel 9 Pro, and Foldables.
- **FR-27 (Dynamic Scrim & Ambient Luminance Normalization):** Real-time relative luminance sampling ($\bar{Y}_{\text{bg}} > 0.35$) automatically applying adaptive scrim for APCA $L^c \ge 75$.
- **FR-29 (Asynchronous Web Font Readiness Gate):** Enforces `document.fonts.load()` resolution before canvas draw to eliminate FOUT and text metric clipping.

#### E. Sensory Feedback & Kinetic Physics
- **FR-16 (Procedural Web Audio Victory Chime):** Zero-latency harmonic chord synthesis via Web Audio API oscillators.
- **FR-17 (Hardware Haptic Feedback):** Tactile vibration impulses ($15\text{ms}$ tick, $180\text{ms}$ milestone, triple pulse victory) via Navigator Vibration API.
- **FR-21 (Structure-of-Arrays Confetti Physics):** High-performance 150-particle confetti simulation using `Float32Array`.
- **FR-24 (Single-Instance Alarm Web Lock):** Coordinates multi-tab audio playback via `navigator.locks.request` mutex.
- **FR-28 (Tri-Modal Sensory Synchronization):** Millisecond-accurate timeline coordinating visual spring physics, Web Audio chimes, and haptics.

#### F. State Management, URL Codec & Sharing
- **FR-13 (Thematic OKLCH Color Engine):** 3 mathematically calibrated palettes (Cyber Obsidian, Deep Focus Zen, Aurora Botanical).
- **FR-14 (Polymorphic URL State Serialization):** Bidirectional `#v1=` URL hash encoding with Base64URL and CRC32 checksums.
- **FR-18 (TokenBucket History Sync Guard):** Rate-limited `history.replaceState` preventing browser navigation thrashing.
- **FR-22 (Cross-Tab State Synchronization):** BroadcastChannel state replication with echo suppression shield.

#### G. Security, Privacy & Offline PWA
- **FR-19 (Client-Side Storage Isolation):** Zero cloud database persistence; API keys isolated to `sessionStorage`.
- **FR-23 (Input Sanitization & Injection Defense):** Unicode NFKC normalization and Trojan Source Bidi override stripping.
- **FR-30 (Closed-Form Buffer Ceiling):** Prevents browser GPU crashes via mathematical boundary checks.

---

### 3.2 Non-Functional Requirements (NFR-01 to NFR-11)

| Identifier | Attribute | Metric / Quality Target | Verification Method |
|:---|:---|:---|:---|
| **NFR-01** | First Contentful Paint | $\text{FCP} \le 800\text{ms}$ on mobile 4G | Lighthouse CI Audit |
| **NFR-02** | Largest Contentful Paint | $\text{LCP} \le 1200\text{ms}$ on mobile 4G | Lighthouse CI Audit |
| **NFR-03** | Cumulative Layout Shift | $\text{CLS} = 0.000$ (Zero horizontal digit jitter) | Automated Vitest / CI |
| **NFR-04** | Interaction Latency | $\text{INP} \le 50\text{ms}$ across all buttons/toggles | Playwright Performance Trace |
| **NFR-05** | GPU Memory Safety | Canvas area $\le 16.7\text{M pixels}$; max edge $\le 4096\text{px}$ | Vitest Memory Solver Test |
| **NFR-06** | Chronometry Accuracy | $0\text{ ms}$ cumulative drift during device sleep | Virtual Clock Soak Harness |
| **NFR-07** | Data Privacy | Cloud PII transmission $= \emptyset$ (Zero storage) | Automated Network Proxy Scan |
| **NFR-08** | Content Security Policy | CSP Level 3: zero `'unsafe-inline'` scripts/styles | CSP Evaluator CI Gate |
| **NFR-09** | Offline Availability | $100\%$ PWA cache hit rate for core app shell | Playwright Offline Test |
| **NFR-10** | Accessibility Contrast | W3C WCAG 2.2 AAA ($CR \ge 7:1$) & APCA $L^c \ge 75$ | APCA Contrast Engine Audit |
| **NFR-11** | Clean Architecture | Architectural instability $D \le 0.15$ (Acyclic core) | Dependency Graph Validator |

---

## 4. Acceptance Criteria

The system shall be accepted upon satisfying all of the following criteria:
1. **Contest Rubric Alignment (4 x 25%):**
   - *Execution (25%):* Zero-build ESM, sub-second startup ($FCP < 800\text{ms}$), 60fps animations.
   - *Creativity (25%):* Procedural Web Audio, Fresnel specular glassmorphism, SoA confetti dynamics.
   - *Usefulness (25%):* Retrograde milestone planning, lockscreen glanceability ($1.8\text{s}$ index).
   - *Polish (25%):* 100% WCAG 2.2 AAA & APCA $L^c \ge 75$, zero CLS, zero AI-slop design.
2. **Automated Test Coverage:**
   - $100\%$ passing rate across 20 Positive, 16 Negative, and 26 Edge-Case test scenarios in `docs/testing/02-test-cases-catalog.md`.
   - Zero console errors, zero unhandled promise rejections, zero CSP violations.
3. **Cross-Platform Verification:**
   - Flawless visual execution on Apple iOS Safari (WebKit), Google Chrome Android (Blink), and Samsung Internet.
   - Downloaded wallpaper precisely fits flagship safe zones without text collision under device clock.

---

## 5. Out of Scope

The following capabilities are deliberately excluded from this release:
1. **Centralized User Accounts & Cloud Databases:** To preserve absolute user privacy, zero PII collection, and zero infrastructure operating costs, no server databases (e.g., PostgreSQL, Firebase, MongoDB) are deployed.
2. **Native Mobile App Store Packaging (App Store / Google Play):** The application is packaged as a standard W3C Progressive Web Application (PWA) with direct image export; native Swift/Kotlin wrapper compilation is out of scope.
3. **Real-time Multi-User Collaborative Planning:** Goal tracking is designed for personal focus; multi-tenant live document editing is excluded.
4. **Automated OS Lock Screen Wallpaper API Invocation:** Mobile operating systems (iOS and Android) sandbox background wallpapers from browser web pages; wallpaper installation requires standard 1-click user confirmation via the native share sheet or photo settings.

---

## 6. Change Log

| Date | Version | Task | Change Summary | Status |
|---|---|---|---|---|
| 2026-11-20 | 1.0.0 | Initial Specification | Baseline SRS for Countdown Lockscreen Studio | Done |
| 2026-11-22 | 2.0.0 | Core Architecture Overhaul | Integrated Gemini 3.8 Flash, Safe-Zones, and Canvas 2D | Done |
| 2026-11-23 | 2.1.0 | P3 Color & Audio Synthesizer | Procedural Web Audio API and Display P3 wide-gamut support | Done |
| 2026-11-23 | 2.2.0 | Multi-Tab Sync & Mutex | BroadcastChannel state sync and Web Locks single-instance audio | Done |
| 2026-11-23 | 2.3.0 | Foundational Architectural Hardening | Added FR-25..30, ADR-013..015, and canonical 92-asset alignment | Done |
| 2026-11-23 | 2.3.1 | Test Triad & Lifecycle Hardening | Added ISO Change Log, TC-POS-21..26, TC-NEG-17..20, TC-EDGE-27..30, LLD FSMs | Done |
