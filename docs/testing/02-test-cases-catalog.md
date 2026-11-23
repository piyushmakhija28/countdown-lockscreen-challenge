# Level 9: Testing Specification — Test Cases Catalog (Triad Matrix)

**Document ID:** `DOC-TEST-02-TEST-CATALOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Positive, Negative, Edge-Case Triad Standard)

---

## 1. Positive Test Scenarios (17 Happy-Path Cases)

Conforming to `~/.claude/rules/35-positive-testing-standards.md`:

```
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| Test ID   | Scenario Name                     | Input Data / Action               | Expected Outcome (Assert)         |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| TC-POS-01 | Valid Future Date Ingress         | Date = now + 30d, "Google SWE"    | Validates; starts chronometer.    |
| TC-POS-02 | Gemini AI Decomposition           | Valid prompt & online network     | Returns 3-5 milestones in JSON.   |
| TC-POS-03 | Affirmation Synthesis             | Career goal string                | Affirmation string <= 120 chars.  |
| TC-POS-04 | 60 FPS Chronometer Ticking        | Running ticker loop               | Emits Days/Hours/Minutes/Seconds. |
| TC-POS-05 | Zero Cumulative Drift Over Time   | RAF ticks across 3600 frames      | Timing drift = 0ms.               |
| TC-POS-06 | Milestone Checkpoint Toggle       | Click milestone 1 checkbox        | Completed = true; progress reruns.|
| TC-POS-07 | Dynamic Progress Percentage Calc  | 2 of 4 milestones checked         | Progress = 50.0%.                 |
| TC-POS-08 | Lock Screen Safe-Zone Preview     | Toggle overlay switch             | Top 28% and bottom 18% guides.    |
| TC-POS-09 | Adaptive Canvas Wallpaper Raster  | Canvas dimension 1170x2532        | AdaptiveBufferAllocator executes. |
| TC-POS-10 | Instant PNG Blob Download         | Click "Download Wallpaper"        | File blob exported (< 350ms).     |
| TC-POS-11 | Thematic Switch to Zen            | Select "Deep Focus Zen"           | Amber palette set across tokens.  |
| TC-POS-12 | Thematic Switch to Botanical      | Select "Aurora Botanical"         | Mint palette set across tokens.   |
| TC-POS-13 | Base64 URL Hash Serialization     | User state snapshot               | Hash <= 450 chars; #v1= prefix.   |
| TC-POS-14 | URL Hash Deserialization & Mount  | Open link with valid #v1= hash    | State hydrated cleanly.           |
| TC-POS-15 | Offline Service Worker Caching    | Network offline, reload page      | App loads from CacheStorage.      |
| TC-POS-16 | Web Audio Procedural Chime        | Timer hits 0ms, context primed    | Plays major chord (C5-E5-G5-C6).  |
| TC-POS-17 | Haptic Vibration Pattern Trigger  | Milestone toggle / VictoryPattern | navigator.vibrate([100,50,100]).  |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 2. Negative Test Scenarios (11 Error-Path Cases)

Conforming to `~/.claude/rules/36-negative-testing-standards.md`:

```
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| Test ID   | Scenario Name                     | Fault Injection                   | Expected Outcome (Assert)         |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| TC-NEG-01 | Past Deadline Input               | Date = now - 24 hours             | Throws ERR_PAST_DATE; UI hint.    |
| TC-NEG-02 | Empty Goal Title Input            | Goal = "   " (blank)              | Throws ERR_TITLE_EMPTY; focus set.|
| TC-NEG-03 | Excessively Long Goal Title       | Goal length = 120 chars           | Throws ERR_LENGTH_OUT_OF_BOUNDS.  |
| TC-NEG-04 | Gemini API Returns HTTP 429 Quota | Mock HTTP 429 Rate Limit          | Trips Breaker; calls Heuristic.   |
| TC-NEG-05 | Gemini API Latency Timeout        | Network stall > 4000ms            | Timeout; falls back to Heuristic. |
| TC-NEG-06 | Corrupted Base64 URL Hash         | #v1=Corrupt-Malformed-Bytes       | Reverts safely to default state.  |
| TC-NEG-07 | Decompression Bomb Ingress        | 1KB Base64 expanding to > 32KB    | Rejects payload; throws bomb err. |
| TC-NEG-08 | Prototype Pollution Vector in Hash| {"__proto__": {"polluted": true}} | Stripped by recursive reviver.    |
| TC-NEG-09 | HTML / XSS Injection in Goal Title| "<script>alert(1)</script>"       | Whitelist rejects forbidden chars.|
| TC-NEG-10 | Web Audio Autoplay Rejection      | Expiration with unprimed context  | Catches NotAllowed; soft fallback.|
| TC-NEG-11 | WebKit replaceState Quota Exceed  | > 100 rapid input changes in 30s  | TokenBucket limits to <= 60 calls.|
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 3. Edge-Case Scenarios (12 Boundary Conditions)

Conforming to `~/.claude/rules/37-edge-case-testing-standards.md`:

```
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| Test ID   | Scenario Name                     | Edge-Case Condition               | Expected Outcome (Assert)         |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
| TC-EDGE-01| Device Sleep Across 4 Hours       | OS throttles RAF; tab re-awakens  | Re-anchors to Date.now() in 0ms.  |
| TC-EDGE-02| Daylight Saving Time Jump         | Countdown crosses DST transition  | Absolute UTC milliseconds intact. |
| TC-EDGE-03| WebKit 16.7M Pixel Ceiling Clamp  | Canvas requested at 3x DPR        | DPR clamped to <= 2.0 (11.8M px). |
| TC-EDGE-04| Legacy 4096px Max Dimension       | Canvas allocated on iPhone SE     | Max dimension clamped <= 4096px.  |
| TC-EDGE-05| Foldable Inner Display (1.2:1 AR) | Device aspect ratio R < 1.70      | Selects Dual-Column Split layout. |
| TC-EDGE-06| Ultra-Tall Phone (23.1:9 AR)      | Device aspect ratio R >= 2.15     | Selects Compact Single-Column.    |
| TC-EDGE-07| Indic Devanagari Matra Shaping    | Goal title contains "हिंदी लक्ष्य" | Programmatic SVG shapes text.     |
| TC-EDGE-08| Arabic RTL Bidi Run Inversion     | Goal title contains "12 يوم"      | Unicode Bidi formatting intact.   |
| TC-EDGE-09| Display P3 Wide Gamut Active      | Modern OLED display P3 match      | Canvas initializes display-p3.    |
| TC-EDGE-10| Tab Closed Within 300ms of Edit   | User closes tab immediately       | Preserved via sessionStorage sync.|
| TC-EDGE-11| Immediate Share Button Click      | User edits & clicks Share in 10ms | getFreshUrl() flushes latest state|
| TC-EDGE-12| Battery Low Power Mode (< 20%)    | Battery Status API reports low    | Releases wake lock; saves battery.|
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```
