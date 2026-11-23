# Level 7: Resilience Specification — Systematic Error Catalogue & Degradation Matrix

**Document ID:** `DOC-RES-03-ERROR-CATALOGUE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Systematic Error Catalogue)

---

## 1. Systematic Error Catalogue & Graceful Degradation Matrix

```
+---------------------------------------------------------------------------------------------------------+
|                                    SYSTEMATIC ERROR DEGRADATION MATRIX                                  |
+---+----------------------+--------------------+---------------------+-----------------------------------+
| # | Error Event          | Trigger Condition  | User Experience     | Automated System Recovery Action  |
+---+----------------------+--------------------+---------------------+-----------------------------------+
| 1 | `ERR_PAST_DATE`      | Deadline in past   | Non-blocking hint   | Disable submit; clamp to future.  |
| 2 | `ERR_TITLE_EMPTY`    | Goal string blank  | Focus indicator     | Highlight input; prompt entry.    |
| 3 | `ERR_AI_TIMEOUT`     | API latency >4000ms| Zero disruption     | Silently populate heuristic plan. |
| 4 | `ERR_AI_HTTP_429`    | Quota reached      | Subtle badge        | Trip Circuit Breaker; fallback.   |
| 5 | `ERR_CANVAS_OOM`     | Mobile RAM ceiling | Seamless export     | Fall back from 2x to 1x scale.    |
| 6 | `ERR_CANVAS_CEIL`    | Area > 16.7M px    | Resolution alert    | Auto-clamp DPR to 2.0x ceiling.   |
| 7 | `ERR_NO_CTX_2D`      | Mobile GPU crash   | Modal recovery      | Prompts user to refresh tab.      |
| 8 | `ERR_FONT_TIMEOUT`   | Web font > 2500ms  | Transparent fallback| Render system sans-serif stack.   |
| 9 | `ERR_ASYNC_ABORT`    | Newer request in-fl| Silent ignore       | Discard stale asynchronous payload|
| 10| `ERR_STORAGE_FULL`   | LocalStorage quota | Transient session   | Fall back to in-memory store.     |
| 11| `ERR_HASH_CORRUPT`   | Invalid #v1= hash  | Toast notification  | Revert to default starter state.  |
| 12| `ERR_AUDIO_LOCKED`   | No user gesture    | Passive arming      | Prime on next touch/click event.  |
| 13| `ERR_HIST_THROTTLE`  | > 100 calls in 30s | Smooth input        | Queue update in 300ms leaky bucket|
| 14| `ERR_CLIP_DENIED`    | Clipboard unfocused| Prompt toast        | Fall back to legacy execCommand.  |
| 15| `ERR_SHARE_ABORT`    | User swipe-down    | Clean dismissal     | Silently ignore AbortError.       |
+---+----------------------+--------------------+---------------------+-----------------------------------+
```
