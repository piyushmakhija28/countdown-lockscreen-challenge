# Level 9: Testing Specification — Test Cases Catalog (Triad Matrix)

**Document ID:** `DOC-TEST-02-TEST-CATALOG`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Positive, Negative, Edge-Case Triad Standard)  
**Version:** 2.3.0

---

## 1. Positive Test Scenarios (20 Happy-Path Cases)

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
| TC-POS-18 | Tri-Modal & Viewport Keyboard Sync| Soft keyboard focus / resize      | ResponsiveLayoutEngine adapts.    |
| TC-POS-19 | Confetti Physics Aerodynamics & SoA| Expired timer celebration blast   | 3000ms Float32Array drag physics.  |
| TC-POS-20 | FontService Asynchronous Preload  | document.fonts.load('Inter')      | FOIT eliminated before canvas draw.|
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 2. Negative Test Scenarios (16 Error-Path Cases)

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
| TC-NEG-12 | Uncompressed Payload Exceeds 32KB | Base64 state payload > 32768 B    | Throws ERR_PAYLOAD_TOO_LARGE.     |
| TC-NEG-13 | Object Prototype Poison Ingress   | constructor.prototype pollution   | Reviver strips polluted keys.     |
| TC-NEG-14 | Gemini AI Content Filter Safety   | Toxic prompt triggers SAFETY block| Throws ERR_AI_SAFETY_BLOCK.       |
| TC-NEG-15 | Cross-Tab Corrupted Message Ingress| Corrupted JSON / CRC32 mismatch   | Throws BroadcastChannelSyncError. |
| TC-NEG-16 | Web Locks Security Exception      | navigator.locks throws SecurityErr | Soft single-tab fallback without unhandled rejection. |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 3. Edge-Case Scenarios (26 Boundary Conditions)

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
| TC-EDGE-13| Spline Delta Zero Guard           | Successive milestones at same day | Fritsch-Carlson guards div-by-zero|
| TC-EDGE-14| Fitts Law Minimum Target Size     | Small phone display 320x568       | Touch targets maintain >= 44x44px.|
| TC-EDGE-15| Base64URL Unpadded Ingress        | Hash missing '=' padding chars    | Restores padding before atob().   |
| TC-EDGE-16| Polymorphic Tuple Array Ingress   | Shared link contains [1,title,d,c]| Deserializes without title loss.  |
| TC-EDGE-17| Web Audio Interrupted by OS Call  | OS audio session interruption     | FSM transitions to INTERRUPTED.   |
| TC-EDGE-18| Reduced Motion System Preference   | prefers-reduced-motion: reduce    | Bypasses particle physics loops.  |
| TC-EDGE-19| Target Deadline Extension Reset   | Target epoch extended by user     | Monotonic clamp resets target.    |
| TC-EDGE-20| Exact Second Boundary Ceil Round  | Remaining time delta = 999ms      | Math.ceil displays 1s (not 0s).   |
| TC-EDGE-21| Look-Up Table Bitwise Truncation  | Fractional index passed to LUT    | TWO_DIGIT_LUT[n | 0] handles safe.|
| TC-EDGE-22| Fail-Fast AI Rate Limit Breaker   | HTTP 429 response received        | Circuit breaker trips immediately.|
| TC-EDGE-23| Theme Contrast WCAG AAA Invariant | Theme C Mint on Forest Background | Contrast ratio >= 7.15:1 verified.|
| TC-EDGE-24| Canvas Web Font FOIT Elimination  | Web font not yet cached           | FontService awaits readiness gate.|
| TC-EDGE-27| Concurrent Multi-Tab Keystroke Race| Simultaneous edits in 2 tabs      | Lamport timestamp & LWW resolve race in <= 50ms. |
| TC-EDGE-28| Abrupt Tab Teardown Mid-Victory Lock| Active alarm tab killed abruptly   | Browser kernel auto-releases lock; no deadlock. |
+-----------+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 4. Micro-Architectural Unit Test Suite (TC-POS-100 to TC-POS-116)

The 17 micro-architectural unit tests specified in `docs/lld/10-micro-architectural-implementation-details.md` verify V8 hidden class stability, memory allocations, multi-tab synchronization, and hardware boundary safety:

```
+------------+-----------------------------------+--------------------------------------------------------------+
| Test ID    | Micro-Architectural Target        | Verification Focus                                           |
+------------+-----------------------------------+--------------------------------------------------------------+
| TC-POS-100 | Target-Bound Chronometer Reset    | Verifies monotonic reset when activeTargetEpoch changes.     |
| TC-POS-101 | Exact Second Display Ceiling      | Math.ceil(delta / 1000) prevents premature 00s display.      |
| TC-POS-102 | Bitwise Int Truncation in LUT     | TWO_DIGIT_LUT[n | 0] protects fractional inputs.            |
| TC-POS-103 | Fail-Fast HTTP 429 Trip           | Circuit breaker skips retries upon 429 Too Many Requests.    |
| TC-POS-104 | Polymorphic State Tuple Codec     | Codec decodes [step, title, offset, completed] cleanly.      |
| TC-POS-105 | Base64URL Padding Normalization   | Restores missing '=' padding before atob() decoding.         |
| TC-POS-106 | 32 KB Decompression Ceiling       | ERR_DECOMPRESSION_BOMB thrown on oversized uncompressed stream|
| TC-POS-107 | Unicode Combining Mark Whitelist  | Whitelist regex passes \p{M} accents and diacritics.         |
| TC-POS-108 | Dynamic Audio Sample Rate Priming | Silent buffer primed at native AudioContext sample rate.     |
| TC-POS-109 | Audio Limiter Peak Compression    | DynamicsCompressorNode prevents digital output distortion.   |
| TC-POS-110 | Confetti Air Drag Deceleration    | Linear air drag damping reduces velocity by 5% per frame.    |
| TC-POS-111 | Confetti Lifespan Alpha Decay     | ParticleEngine terminates simulation after exactly 3000ms.   |
| TC-POS-112 | Virtual Viewport Soft Keyboard    | interactive-widget adjusts canvas height on mobile focus.    |
| TC-POS-113 | Closed-Form Ring Radius Clamp     | Progress ring radius r_ring <= 220px prevents overlap.       |
| TC-POS-114 | Canvas Font Readiness Gate        | FontService.ensureFontsLoaded() eliminates FOIT/FOUT.        |
| TC-POS-115 | Cross-Tab Broadcast Channel Sync  | StateStore syncs state across tabs via BroadcastChannel.     |
| TC-POS-116 | Web Locks Victory Alarm Mutex     | Web Locks API grants single-tab victory audio playback.      |
| TC-POS-117 | Tabular Numeral CLS Invariant     | font-variant-numeric: tabular-nums eliminates ticking jitter |
| TC-POS-118 | 8-Bit OLED Bayer Dither Defense   | 4x4 Bayer matrix breaks OLED gradient quantization banding.  |
| TC-POS-119 | Dynamic Scrim Luminance Adapt     | Background Y_bg > 0.35 triggers adaptive scrim (APCA Lc>=75).|
| TC-POS-120 | Tri-Modal Sensory Synchronization | Visual, audio, and haptic channels trigger within 20ms sync. |
+------------+-----------------------------------+--------------------------------------------------------------+
```

---

## 5. Vulnerability Resilience Verification Suite (TC-POS-21 to TC-POS-99, TC-EDGE-25 to TC-EDGE-26)

In addition to the core functional and edge-case triad, the 100-vulnerability system audit in `docs/lld/08-system-design-vulnerability-audit.md` (`DOC-LLD-08`) specifies automated verification test cases mapped across 44 architectural dimensions:

```
+---------------------------------------------------------------------------------------------------------------+
|                                VULNERABILITY AUDIT VERIFICATION TEST MAPPING                                  |
+--------------------------+-----------------------+------------------------+-----------------------------------+
| Test ID Range            | Audit Dimension       | Governing Spec         | Verification Objective            |
+--------------------------+-----------------------+------------------------+-----------------------------------+
| **TC-POS-21 - TC-POS-30**| Canvas & Graphics     | `DOC-LLD-08` (HR-01..10)| GPU memory limits, P3 gamut, FOIT |
| **TC-POS-31 - TC-POS-40**| Mobile Ergonomics     | `DOC-LLD-08` (ME-01..10)| Notch, keyboard, safe zones, FSM  |
| **TC-POS-41 - TC-POS-50**| Chronometry & Clocks  | `DOC-LLD-08` (CC-01..10)| 0-drift, sleep wake, leap seconds |
| **TC-POS-51 - TC-POS-60**| AI Gateway Resilience | `DOC-LLD-08` (AI-01..10)| 429 backoff, schema, prompt inject|
| **TC-POS-61 - TC-POS-70**| Web Audio & Haptics   | `DOC-LLD-08` (AU-01..10)| AudioContext FSM, limiter, vibrate|
| **TC-POS-71 - TC-POS-80**| State Codec & URL     | `DOC-LLD-08` (SC-01..10)| 32KB bomb, token bucket, Base64   |
| **TC-POS-81 - TC-POS-90**| AppSec & CSP Level 3  | `DOC-LLD-08` (SE-01..10)| XSS, Trojan Source, prototype pol.|
| **TC-POS-91 - TC-POS-99**| Offline PWA & Edge    | `DOC-LLD-08` (PW-01..10)| SW cache, font barrier, Anycast   |
| **TC-EDGE-25**           | Micro-orbital OLED    | `DOC-LLD-08` (CR-01)   | Burn-in prevention orbit shift    |
| **TC-EDGE-26**           | Double-Precision IEEE | `DOC-LLD-08` (MA-01)   | Sub-millisecond chronometer math  |
+--------------------------+-----------------------+------------------------+-----------------------------------+
```
