# Claude Code Guidelines & Project Context

## Project Overview
This repository contains the design, code, and documentation for the **Handshake AI Skills Studio X Google Challenge** ("Your Deadline, Your Design: Create a Countdown Lock Screen").
- **Mission:** Build a countdown lock screen that helps people reach an important personal, academic, or professional deadline.
- **Contest Sponsor:** Handshake (Stryder Corp.) with Google.
- **Grand Prize:** $1,000 USD each for Top 3 Winners.
- **Evaluation Criteria:** Execution (25%), Creativity (25%), Usefulness (25%), Polish & Thoughtfulness (25%).

## Architecture & Structure
```
countdown-lockscreen-challenge/
├── .gitignore               # Ignored files & Level 2.2 doc exclusions
├── VERSION                  # Single source of truth version (1.0.0)
├── CHANGELOG.md             # Keep a Changelog release history
├── SRS.md                   # Software Requirements Specification
├── CLAUDE.md                # Developer instructions & context
├── README.md                # Main documentation & challenge playbook
├── docs/                    # Non-root documentation & design specifications
│   ├── competition-rules-summary.md  # Exhaustive contest rules summary
│   └── lockscreen-design-strategy.md # Safe-zone ergonomics & UI guide
└── src/                     # Source code (web app / wallpaper generator)
    ├── index.html           # Main application entry point
    ├── css/                 # Modern styling & design tokens
    └── js/                  # Real-time countdown & canvas export logic
```

## Development Guidelines
- **Strict Level 2.2 Governance:** Only 5 documentation files are permitted at the root: `SRS.md`, `README.md`, `CLAUDE.md`, `VERSION`, `CHANGELOG.md`. All other markdown documents MUST reside in `docs/`.
- **Level 2.2 Docstrings-Only:** Every public function and class must include contract docstrings specifying inputs, outputs, and behavior. Avoid redundant inline commentary narrating trivial statements.
- **Ergonomics First:** Every visual design must respect phone lock screen constraints: top 25-30% reserved for system clock/date/widgets, middle 50% for countdown & milestones, bottom 10-15% for system indicators.
- **Git Commit Standards:** Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
