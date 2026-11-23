# Level 7: Resilience Specification — Systematic Error Catalogue & Degradation Matrix

**Document ID:** `DOC-RES-03-ERROR-CATALOGUE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Systematic Error Catalogue)

---

## 1. Executive Degradation Philosophy

To guarantee that contestants, users, and evaluators never encounter a broken UI state or white screen, every conceivable runtime failure is catalogued with an automated, zero-latency degradation path. The system strictly prefers degraded functionality over failure.

---

## 2. Comprehensive 15-Error Recovery Specification Cards

```
+---------------------------------------------------------------------------------------------------------------+
|                                      SYSTEMATIC ERROR DEGRADATION MATRIX                                      |
+----+--------------------+----------+---------------------+-------------------+--------------------------------+
| #  | Error Code         | Severity | Component Origin    | User Experience   | Automated Recovery Mechanism   |
+----+--------------------+----------+---------------------+-------------------+--------------------------------+
| 01 | `ERR_PAST_DATE`    | LOW      | Ingress Validator   | Inline date hint  | Clamp date picker to now + 1h. |
| 02 | `ERR_TITLE_EMPTY`  | LOW      | Ingress Validator   | Focus highlight   | Set focus to goal input field. |
| 03 | `ERR_AI_TIMEOUT`   | MEDIUM   | Gemini AI Gateway   | Zero disruption   | Fallback to HeuristicGenerator.|
| 04 | `ERR_AI_HTTP_429`  | MEDIUM   | Gemini AI Gateway   | Subtle badge      | Trip Circuit Breaker; fallback.|
| 05 | `ERR_CANVAS_OOM`   | HIGH     | Canvas 2D Pipeline  | Seamless export   | Auto-downgrade 2x to 1x scale. |
| 06 | `ERR_CANVAS_CEIL`  | HIGH     | Canvas Allocator    | Normal export     | Clamp DPR <= 2.0 (<= 16.7M px).|
| 07 | `ERR_NO_CTX_2D`    | CRITICAL | Canvas Allocator    | Toast prompt      | Recreate context on next tick. |
| 08 | `ERR_FONT_TIMEOUT` | LOW      | Web Font Preloader  | Instant fallback  | Render system sans-serif font. |
| 09 | `ERR_ASYNC_ABORT`  | LOW      | Async Controller    | Silent discard    | Ignore stale in-flight request.|
| 10 | `ERR_STORAGE_FULL` | MEDIUM   | LocalStorage/Session| Silent memory sync| Fall back to in-memory store.  |
| 11 | `ERR_HASH_CORRUPT` | MEDIUM   | Hash Deserializer   | Toast & reset     | Revert to default demo goal.   |
| 12 | `ERR_AUDIO_LOCKED` | LOW      | Web Audio Synthesizer| Passive priming  | Prime context on next user tap.|
| 13 | `ERR_HIST_THROTTLE`| LOW      | History Guard       | Smooth typing     | Enqueue in Token Bucket guard. |
| 14 | `ERR_CLIP_DENIED`  | LOW      | Clipboard Service   | Modal copy box    | Fall back to manual selection. |
| 15 | `ERR_SHARE_ABORT`  | LOW      | Web Share API       | Clean dismissal   | Silently catch AbortError.     |
+----+--------------------+----------+---------------------+-------------------+--------------------------------+
```

---

## 3. Detailed Specification Cards for Critical Error Handlers

### Card 1: `ERR_AI_TIMEOUT` & `ERR_AI_HTTP_429` (AI Failure Degradation)
- **Root Cause:** Network latency exceeding 4000ms or Google Gemini API quota depletion.
- **Recovery Action:** The `CircuitBreaker` trips and calls `HeuristicGenerator.generateHeuristicMilestones(goal, deadline)`.
- **User Impact:** User receives a 4-milestone plan in $< 5\text{ms}$ with zero error modals.

### Card 2: `ERR_CANVAS_CEIL` & `ERR_CANVAS_OOM` (GPU Texture Protection)
- **Root Cause:** Attempting to allocate an `OffscreenCanvas` exceeding WebKit's $16,777,216\text{px}$ limit or exceeding device RAM.
- **Recovery Action:** `AdaptiveBufferAllocator` dynamically clamps scale factor $S$ so that $\text{width} \times \text{height} \le 16.7\text{M pixels}$ and $\max(\text{width}, \text{height}) \le 4096\text{px}$.
- **User Impact:** Wallpaper exports successfully at maximum safe resolution without browser tab termination.

### Card 3: `ERR_AUDIO_LOCKED` (Autoplay Policy Protection)
- **Root Cause:** Countdown timer expires while `AudioContext.state === 'suspended'`.
- **Recovery Action:** `AudioChimeService` catches `NotAllowedError`, emits an `audio:autoplay-blocked` event, triggers device vibration (`navigator.vibrate`), and presents a floating glassmorphic "Tap to Play Celebration Sound" button.
- **User Impact:** Celebration visual effects and haptics continue uninterrupted with zero unhandled promise rejections.
