# Software Requirements Specification (SRS)

## 1. Purpose
The purpose of this project is to design, develop, and deliver a high-impact, beautifully polished **Countdown Lock Screen Application & Wallpaper Generator** for the **Handshake AI Skills Studio X Google November Challenge** ("Your Deadline, Your Design: Create a Countdown Lock Screen"). The application serves as both a live, interactive countdown tool and an exportable wallpaper generator that keeps users visually grounded and motivated toward critical deadlines.

## 2. Scope
The project encompasses:
- Interactive countdown web application with real-time countdown calculations (Days, Hours, Minutes, Seconds).
- Milestone-driven deadline tracker allowing users to break major deadlines into structured sequential phases.
- Lock screen ergonomic simulator demonstrating compliance with iOS and Android system UI elements (clock, status bar, notifications, dynamic island, home bar).
- High-resolution wallpaper canvas renderer capable of exporting optimized portrait lock screen images (9:19.5 aspect ratio, 1170x2532 or 1080x2400 resolution).
- Multiple curated visual aesthetic themes (e.g., Deep Focus Minimalist, Neon Cyberpunk, Solitude Botanical, Executive Monochrome).

## 3. Requirements

### 3.1 Functional Requirements
- **FR-1: Real-time Countdown Engine:** Accurate temporal calculation to any target deadline with automatic milestone progression and status updates.
- **FR-2: Milestone Breakdown Interface:** Ability to define 3 to 5 clear checkpoints leading up to the final deadline with completion checkmarks.
- **FR-3: Lock Screen Safe Zone Ergonomics:** Layout dynamically leaves top ~25% clear for system clock/widgets and bottom ~10% clear for unlock/camera gestures.
- **FR-4: Wallpaper Export Utility:** Instant client-side canvas rendering to export high-definition PNG/JPG lock screens ready for direct phone installation.
- **FR-5: Thematic Customization:** Dynamic theme toggle adapting typography, accent palettes, and atmospheric backdrop textures.
- **FR-6: Shareable URL State:** State persistence via lightweight URL hash/parameters so user configurations can be shared and reviewed via live URL.

### 3.2 Non-Functional Requirements
- **NFR-1: Responsiveness:** Seamless rendering across desktop browsers, tablet viewports, and mobile displays.
- **NFR-2: Performance & Load Speed:** Zero bloated runtime dependencies; First Contentful Paint (FCP) under 1.0 second.
- **NFR-3: Visual Polish & Aesthetics:** Follows modern glassmorphism, subtle micro-interactions, and accessible typography (WCAG 2.1 AA contrast).
- **NFR-4: Clean Architecture:** Modular, decoupled code conforming to modern web standards and Level 2.2 docstring governance.

## 4. Acceptance Criteria
1. The application satisfies 100% of the Handshake X Google mission requirements: Title, Cover Image, Description, and Live URL.
2. The UI scores 5/5 on all four official contest evaluation criteria:
   - **Execution (25%):** Formatted natively for phone/screen, countdown and milestones are unambiguous.
   - **Creativity (25%):** Fresh concept with memorable design and thoughtful interaction.
   - **Usefulness / Value (25%):** Strong practical utility keeping the user accountable to their goal.
   - **Polish & Thoughtfulness (25%):** Clean clock spacing, elegant typography, intuitive hierarchy.
3. Successfully generates downloadable 9:19.5 lock screen wallpapers that align with actual device clock positions.

## 5. Out of Scope
- Native iOS Swift / Android Kotlin binary packaging (the solution is a responsive web application and wallpaper generator).
- User authentication, cloud database accounts, or multi-tenant user authentication backends.
- Paid analytics or third-party proprietary tracking SDKs.
