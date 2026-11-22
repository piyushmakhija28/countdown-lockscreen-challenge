# Handshake AI Skills Studio X Google: Countdown Lock Screen Challenge

> **Mission:** *"Your Deadline, Your Design: Create a Countdown Lock Screen"*  
> **Contest Sponsor:** Handshake (Stryder Corp.) with Google  
> **Prizes:** Top 3 Winners receive **$1,000 USD** each  
> **Eligibility:** Age 18+, Active Handshake Account, Legal Resident of Eligible Countries (including **India** 🇮🇳)  
> **Submission Deadline:** **November 23, 2026 at 11:59 PM PT**

---

## Overview

This repository contains the architecture, design blueprint, and implementation assets for participating in the **Handshake AI Skills Studio X Google Challenge**. 

The goal of the challenge is to design and build an inspiring, functional **Countdown Lock Screen** formatted for smartphone or computer displays. The lock screen must help someone stay focused and motivated toward a critical deadline—whether it's landing a dream job, completing a thesis, shipping a software product, or preparing for an athletic milestone.

### What Makes This Project Stand Out?
Rather than creating just a static graphic, this repository implements a **Dual-Mode System**:
1. **Interactive Web Application:** A live, responsive countdown dashboard with dynamic milestone tracking, time-zone calculation, and custom themes (hosted on a public URL for submission).
2. **High-Resolution Wallpaper Exporter:** A client-side canvas engine that renders and exports a pixel-perfect 9:19.5 smartphone lock screen wallpaper with dedicated safe zones for native OS clocks and widgets.

---

## Detailed Project Understanding & Challenge Rubric

### 1. Official Evaluation Rubric (4 x 25% = 100%)
Judges evaluate submissions across four weighted dimensions. Scoring a **5/5** on each criterion is the target for winning the $1,000 prize:

```
+------------------------------------------------------------------------------+
|                         OFFICIAL 4X25% SCORING MATRIX                        |
+--------------------------+--------+------------------------------------------+
| Evaluation Criteria      | Weight | Requirements for Top Score (5/5)         |
+--------------------------+--------+------------------------------------------+
| 1. Execution             |  25%   | Exceeds project requirements; formatted  |
|                          |        | perfectly for phone/desktop screen;      |
|                          |        | ready to use today with clear milestones |
+--------------------------+--------+------------------------------------------+
| 2. Creativity            |  25%   | Fresh concept, unexpected use case, or   |
|                          |        | particularly clever, distinctive design  |
+--------------------------+--------+------------------------------------------+
| 3. Usefulness / Value    |  25%   | Highly compelling; meaningfully keeps its|
|                          |        | owner on track or delights audience      |
+--------------------------+--------+------------------------------------------+
| 4. Polish & Thoughtfulness|  25%  | Feels intentional & "real"; clean space  |
|                          |        | for system clock/icons; readable glance  |
+--------------------------+--------+------------------------------------------+
```

---

## Crucial Points to Keep in Mind (The Winning Strategy)

Here are the key strategic factors you must prioritize to maximize your score:

### 🎯 1. Respect Lock Screen Ergonomics (Safe Zones)
* **The Fatal Flaw:** Many contestants place giant countdown timers at the very top of their design. On actual phones, this collides with the system clock, date, and notifications.
* **The Winning Approach:** Reserve the top 25–30% of the screen as clean, uncluttered space so the smartphone's real clock stands out. Place your custom countdown, progress arcs, and milestones in the middle 50% "Active Content Zone".

### 🏁 2. Milestones Beat Flat Countdowns Every Time
* A countdown that only says *"30 Days Remaining"* often causes procrastination or panic.
* The rubric explicitly rewards: *"milestones that clearly lead up to the deadline"*.
* Break the journey into **3 to 4 sequential checkpoints** (e.g., *Phase 1: Research (Day 1-7) → Phase 2: Build MVP (Day 8-20) → Phase 3: Final Polish (Day 21-30)*).

### 💡 3. Pick a Compelling, Relatable Use Case
Avoid generic "My Birthday" or "New Year" themes. Instead, pick a high-stakes, inspiring milestone:
* **The Career Sprint:** Countdown to college graduation or first software engineer offer.
* **The Product Launch:** Indie hacker building a SaaS product up to public Product Hunt launch.
* **The Marathon / Fitness Goal:** 12-week half-marathon training progression.
* **The Deep Thesis:** Academic thesis defense with chapter-by-chapter milestones.

### ✨ 4. High-End Visual Polish & Dark Mode First
* Use deep OLED dark backdrops (`#0a0b10`, `#121620`) to conserve battery on mobile devices.
* Employ modern glassmorphic surface cards (`backdrop-filter: blur(16px)` with subtle borders).
* Ensure high-contrast typography compliant with WCAG 2.1 AA standards for outdoor sunlight legibility.

### 🌐 5. Provide a Live, Working URL & High-Res Cover Image
* The submission requires: **Title**, **Cover Image**, **Description**, and **Project Link/URL**.
* Ensure your live link is deployed on GitHub Pages, Vercel, or Firebase with instant load times and mobile responsiveness.

---

## Prerequisites / Requirements

- **Node.js:** v18.0.0 or higher (if using build tools or Vite)
- **Modern Web Browser:** Chrome, Safari, Edge, or Firefox with HTML5 Canvas and CSS backdrop-filter support
- **Git:** v2.30+ for version control
- **Handshake Account:** Active account to submit to the mission page

---

## Installation / Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/techdeveloper-org/countdown-lockscreen-challenge.git
   cd countdown-lockscreen-challenge
   ```

2. **Run locally (Zero dependency option):**
   You can serve the static files with any lightweight HTTP server:
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

### 1. Setting Your Deadline & Milestones
- Enter your goal title (e.g., *"Senior Software Engineer Launchpad"*).
- Select the target date and time.
- Add 3–4 sequential milestones with intermediate completion dates.

### 2. Live Preview & Safe-Zone Toggle
- Toggle the **"Phone Lock Screen Overlay"** to simulate how native iOS/Android clocks, battery icons, and notification panels overlay the artwork.

### 3. Exporting Wallpaper
- Click **"Generate Lock Screen Wallpaper"** to render a high-resolution 1170x2532 (iPhone/Android standard) image ready to save and apply directly to your phone.

---

## Architecture

Detailed design documents are maintained in the [`docs/`](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/) directory:
- [competition-rules-summary.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/competition-rules-summary.md): Full breakdown of contest rules, eligibility, dates, and legal terms.
- [lockscreen-design-strategy.md](file:///C:/Users/techd/Documents/workspace-spring-tool-suite-4-4.27.0-new/countdown-lockscreen-challenge/docs/lockscreen-design-strategy.md): Ergonomic blueprints, safe zone coordinates, and milestone design principles.

### Directory Structure:
```
countdown-lockscreen-challenge/
├── .gitignore               # Level 2.2 compliant exclusion patterns
├── VERSION                  # Semantic version single source of truth (1.0.0)
├── CHANGELOG.md             # Keep a Changelog standard release history
├── SRS.md                   # Software Requirements Specification
├── CLAUDE.md                # Development guidelines & Claude context
├── README.md                # Main documentation & challenge playbook
├── docs/                    # Non-root specifications & research
│   ├── competition-rules-summary.md  # Official rules deep dive
│   └── lockscreen-design-strategy.md # UI/UX ergonomics & safe zones
└── src/                     # Application source files
    ├── index.html           # Main UI container & previewer
    ├── css/style.css        # Glassmorphic styles & design tokens
    └── js/app.js            # Timer calculation & canvas rendering
```

---

## Final Submission Checklist

Before submitting to Handshake AI Skills Studio, confirm every item on this checklist:

- [ ] **Project Title:** Clear, catchy, and memorable (e.g., *"Apex Countdown: The 30-Day Launchpad"*).
- [ ] **Project Cover Image:** High-resolution mockup showing the lock screen on an actual phone mockup.
- [ ] **Project Description:** Concise story explaining the problem, the deadline, the milestones, and why this design keeps you or your team focused.
- [ ] **Project Link/URL:** Fully deployed, publicly accessible web link.
- [ ] **Ergonomics Verified:** Top clock area is clear; milestones are readable at an arm's length glance.
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
