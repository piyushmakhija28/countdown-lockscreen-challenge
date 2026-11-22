# Level 9: Testing Specification — Test Cases Catalog (Triad Matrix)

**Document ID:** `DOC-TEST-02-TEST-CATALOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Positive, Negative, Edge-Case Triad Standard)

---

## 1. Positive Test Scenarios (15 Happy-Path Cases)

Conforming to `~/.claude/rules/35-positive-testing-standards.md`:

```
+---------------------------------------------------------------------------------------------------------+
|                                    POSITIVE TEST SCENARIOS (HAPPY PATH)                                 |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| Test ID   | Scenario Name                     | Input Data                        | Expected Outcome    |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| TC-POS-01 | Valid Future Date Ingress         | Date = now + 30d, "Google SWE"    | Countdown initiated.|
| TC-POS-02 | Gemini AI Decomposition           | Valid prompt & online network     | Returns 4 milestones|
| TC-POS-03 | Affirmation Synthesis             | Career goal string                | Affirmation <=120ch |
| TC-POS-04 | 60 FPS Chronometer Ticking        | Running ticker loop               | Days/Hrs/Mins/Secs  |
| TC-POS-05 | Zero Cumulative Drift Over Time   | RAF ticks across 3600 frames      | Timing drift = 0ms  |
| TC-POS-06 | Milestone Checkpoint Toggle       | Click milestone 1 checkbox        | Completed = true    |
| TC-POS-07 | Dynamic Progress Percentage Calc  | 2 of 4 milestones checked         | Progress = 50.0%    |
| TC-POS-08 | Lock Screen Safe-Zone Preview     | Toggle overlay switch             | Top 28% guide drawn |
| TC-POS-09 | 2x Supersampled Wallpaper Raster  | Canvas dimension 2340x5064        | Resampled to 1170x25|
| TC-POS-10 | Instant PNG Blob Download         | Click "Download Wallpaper"        | File blob exported  |
| TC-POS-11 | Thematic Switch to Zen            | Select "Deep Focus Zen"           | Amber palette set   |
| TC-POS-12 | Thematic Switch to Botanical      | Select "Aurora Botanical"         | Mint palette set    |
| TC-POS-13 | Base64 URL Hash Serialization     | User state snapshot               | Hash <= 450 chars   |
| TC-POS-14 | URL Hash Deserialization & Mount  | Open link with valid #v1= hash    | State hydrated      |
| TC-POS-15 | Offline Service Worker Caching    | Network offline, reload page      | App loads from SW   |
+-----------+-----------------------------------+-----------------------------------+---------------------+
```

---

## 2. Negative Test Scenarios (10 Error-Path Cases)

Conforming to `~/.claude/rules/36-negative-testing-standards.md`:

```
+---------------------------------------------------------------------------------------------------------+
|                                    NEGATIVE TEST SCENARIOS (ERROR HANDLING)                             |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| Test ID   | Scenario Name                     | Fault Injection                   | Expected Outcome    |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| TC-NEG-01 | Past Deadline Input               | Date = now - 24 hours             | Form validation err |
| TC-NEG-02 | Empty Goal Title Input            | Goal = "   " (blank)              | Input rejected      |
| TC-NEG-03 | Excessively Long Goal Title       | Goal length = 120 chars           | Truncated to 60 char|
| TC-NEG-04 | Gemini API Returns HTTP 429 Quota | Mock HTTP 429 Rate Limit          | Silent Heuristic FB |
| TC-NEG-05 | Gemini API Latency Timeout        | Network stall > 4000ms            | Timeout & Heuristic |
| TC-NEG-06 | Corrupted Base64 URL Hash         | #v1=Corrupt-Malformed-Bytes       | Loads default state |
| TC-NEG-07 | XSS Payload in Goal Title         | <script>alert(1)</script>         | HTML entity escaped |
| TC-NEG-08 | Invalid Target Date String Format | Date = "invalid-date-format"      | Rejects with toast  |
| TC-NEG-09 | Out-of-Bounds Theme ID            | Theme = "malicious_theme"         | Defaults to Obsidian|
| TC-NEG-10 | Canvas Memory Allocation Failure  | High memory pressure simulated    | Fallback to 1x scale|
+-----------+-----------------------------------+-----------------------------------+---------------------+
```

---

## 3. Edge-Case Test Scenarios (10 Boundary Conditions)

Conforming to `~/.claude/rules/37-edge-case-testing-standards.md`:

```
+---------------------------------------------------------------------------------------------------------+
|                                    EDGE-CASE TEST SCENARIOS (BOUNDARY VALUES)                           |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| Test ID   | Scenario Name                     | Boundary Condition                | Expected Outcome    |
+-----------+-----------------------------------+-----------------------------------+---------------------+
| TC-EDGE-01| Countdown Expiration to Zero      | Target reaches exactly 0s         | Ticker halts at 0;  |
|           |                                   |                                   | Celebration state   |
| TC-EDGE-02| Daylight Savings Time Transition  | Deadline crosses DST changeover   | UTC epoch invariant |
| TC-EDGE-03| Leap Year February 29 Target      | Deadline = 2028-02-29             | Correct day math    |
| TC-EDGE-04| Ultra-Short Deadline (< 2 hours)  | Deadline = now + 90 minutes       | Formats 0d 1h 30m   |
| TC-EDGE-05| Multi-Year Deadline (> 4 years)   | Deadline = now + 1500 days        | Digits auto-scale   |
| TC-EDGE-06| Background Tab Sleep (8 hours)    | Simulated suspension & resume     | Re-aligns in 1 tick |
| TC-EDGE-07| Unicode & Multi-byte Emojis       | Goal: "🚀 Land Google Internship"| Canvas renders glyph|
| TC-EDGE-08| Extreme Mobile DPR Scale (DPR 3.5)| High-density flagship device      | Clamped to 2x max   |
| TC-EDGE-09| Zero Milestones Completed (0%)    | Brand new goal                    | Progress ring = 0%  |
| TC-EDGE-10| All Milestones Completed (100%)   | User marks all 4 checkpoints      | Progress ring = 100%|
+-----------+-----------------------------------+-----------------------------------+---------------------+
```
