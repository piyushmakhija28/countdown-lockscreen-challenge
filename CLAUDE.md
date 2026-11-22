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
├── CLAUDE.md                # Developer instructions & context
├── README.md                # Main documentation & challenge playbook
├── docs/                    # Architectural specifications & requirements
│   ├── 00-problem-statement.md
│   ├── 01-prd.md
│   ├── 02-hld.md
│   ├── 03-api-contract.md
│   ├── 04-competition-and-platform-research.md
│   ├── 05-srs.md            # Canonical Software Requirements Specification
│   ├── 06-adr/              # Architecture Decision Records
│   ├── lld/                 # Low-level design & mathematical blueprints
│   └── ...                  # Specialized engineering subsystems
└── src/                     # Source code (web app / wallpaper generator)
    ├── index.html           # Main application entry point
    ├── css/                 # Modern styling & design tokens
    └── js/                  # Real-time countdown & canvas export logic
```

## Development Guidelines
- **Strict Level 2.2 Governance:** Root directory strictly contains only 4 project management files: `README.md`, `CLAUDE.md`, `VERSION`, `CHANGELOG.md`. All architectural, functional, and requirement specifications (including `05-srs.md`) reside strictly in `docs/` to preserve a clean single source of truth.
- **Level 2.2 Docstrings-Only:** Every public function and class must include contract docstrings specifying inputs, outputs, and behavior. Avoid redundant inline commentary narrating trivial statements.
- **Ergonomics First:** Every visual design must respect phone lock screen constraints: top 25-30% reserved for system clock/date/widgets, middle 50% for countdown & milestones, bottom 10-15% for system indicators.
- **Git Commit Standards:** Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).

