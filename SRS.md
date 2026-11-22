# Software Requirements Specification (SRS)

## 1. Purpose
The purpose of this project is to architect, develop, and deliver a production-grade, Google Gemini-powered **Countdown Lock Screen Application & Wallpaper Generator** for the **Handshake AI Skills Studio X Google November Challenge** ("Your Deadline, Your Design: Create a Countdown Lock Screen"). The application serves as both a live, interactive countdown tool and an exportable wallpaper generator that keeps users visually grounded and motivated toward critical deadlines.

## 2. Scope
The project encompasses:
- **Intelligent Milestone Planning:** Integration with Google Gemini 3.8 Flash via `@google/genai` to autonomously decompose high-stakes goals backward into sequential, time-stamped milestone checkpoints.
- **Interactive Chronometer:** Real-time countdown engine calculating Days, Hours, Minutes, and Seconds with delta-compensated zero-drift accuracy.
- **Lock Screen Ergonomics:** A layout dynamically reserving the upper 28% of vertical screen space for native iOS/Android clocks and widgets, and the lower 18% for gestures.
- **High-Resolution Wallpaper Generator:** An HTML5 `OffscreenCanvas` engine rendering at 1170x2532 resolution (9:19.5 aspect ratio) with 2x supersampling.
- **Thematic Style Engine:** 3 curated aesthetic palettes (Cyber Obsidian, Deep Focus Zen, Aurora Botanical) built with glassmorphic tokens.
- **Stateless URL Hash Sharing:** Compressed Base64 URL state encoding (`#v1=...`) enabling frictionless sharing without backend databases.

## 3. Requirements

### 3.1 Functional Requirements
- **FR-01: Target Deadline Ingress:** Validates goal titles ($\le 60$ chars) and future UTC deadlines.
- **FR-02: Gemini AI Backward Decomposition:** Invokes Google Gemini 3.8 Flash to generate 3 to 5 chronological checkpoints.
- **FR-03: Heuristic Fallback Engine:** Deterministically synthesizes 4 milestone quartiles when offline or unauthenticated.
- **FR-04: Motivational Affirmation Synthesis:** Generates high-impact psychological affirmations matching the goal context.
- **FR-05: Real-Time Chronometer:** 60fps countdown updates utilizing `requestAnimationFrame`.
- **FR-06: Drift-Compensated Chronometry:** Zero cumulative drift verified against `performance.now()`.
- **FR-07: Interactive Checkpoints:** Real-time milestone completion toggling and progress percentage recalculation.
- **FR-08: Safe-Zone Simulator:** Visual overlays modeling Apple iOS (Dynamic Island, Clock, Widgets) and Android Material You lock screens.
- **FR-09: High-DPI Wallpaper Export:** Direct 1-click export of 1170x2532 PNG blobs.
- **FR-10: Stateless URL State Sync:** Automatic hydration and serialization of state into `window.location.hash`.

### 3.2 Non-Functional Requirements
- **NFR-01: Core Web Vitals:** First Contentful Paint (FCP) $\le 1.0\text{s}$, Largest Contentful Paint (LCP) $\le 1.5\text{s}$, CLS $= 0.00$.
- **NFR-02: Frame Budget:** Stable $60\text{ fps}$ execution ($\ge 58\text{ fps}$) with frame durations under $10.0\text{ ms}$.
- **NFR-03: Visual Accessibility:** Strict compliance with WCAG 2.1 AA ($C \ge 4.5:1$) and APCA ($L^c \ge 75$).
- **NFR-04: Privacy & Zero PII:** 100% client-side execution; zero personal data stored on external servers.
- **NFR-05: Memory Ceiling:** Peak memory consumption during wallpaper export strictly $< 25.0\text{ MB}$.

## 4. Acceptance Criteria
1. The application satisfies 100% of the Handshake X Google mission requirements: Title, Cover Image, Description, and Live URL.
2. The UI scores 5/5 on all four official contest evaluation criteria:
   - **Execution (25%):** Formatted natively for phone/screen, countdown and milestones are unambiguous.
   - **Creativity (25%):** Fresh concept with Gemini backward decomposition and memorable aesthetics.
   - **Usefulness / Value (25%):** Strong practical utility keeping the user accountable to their goal.
   - **Polish & Thoughtfulness (25%):** Clean clock spacing, elegant typography, intuitive hierarchy.
3. Generates downloadable 1170x2532 wallpapers with zero overlap on phone clocks across iOS and Android.

## 5. Out of Scope
- Native iOS Swift / Android Kotlin binary packaging (.ipa / .apk distribution).
- Centralized user authentication backends or SQL/NoSQL cloud databases.
- Native device push notification server daemons.

---

## 6. Comprehensive Documentation Traceability

Detailed architectural specifications and diagrams are maintained in `docs/` and `uml/`:
- **Core Specs:** [docs/00-problem-statement.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/00-problem-statement.md), [docs/01-prd.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/01-prd.md), [docs/02-hld.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/02-hld.md), [docs/03-api-contract.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/03-api-contract.md), [docs/04-competition-and-platform-research.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/04-competition-and-platform-research.md), [docs/05-srs.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/05-srs.md), [docs/07-architecture-tradeoffs-and-faq.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/07-architecture-tradeoffs-and-faq.md).
- **Architecture Decisions:** [docs/06-adr/](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/06-adr/) (ADR-001 through ADR-008).
- **UI/UX & Ergonomics:** [docs/ui-ux/](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/ui-ux/) (Tokens, Safe Zones, Accessibility).
- **Low-Level Design:** [docs/lld/](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/lld/) (Classes, Sequences, State Machine, Threading, SOLID, Blueprint).
- **Subsystem Specs:** `docs/devops/`, `docs/security/`, `docs/resilience/`, `docs/observability/`, `docs/testing/`, `docs/management/`.
- **13 Canonical UML Diagrams:** [uml/](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/uml/).
