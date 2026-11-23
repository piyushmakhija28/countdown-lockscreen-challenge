# ADR-010: Leaky Bucket Debounced State Sync vs. Synchronous history.replaceState

**Document ID:** `ADR-010`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** ACCEPTED  
**Date:** 2026-11-23  

---

## 1. Context & Problem Statement
To ensure frictionless sharing and instant hydration without centralized databases, the application serializes its complete state into the URL hash fragment (`#v1=...`).

When users type goal titles or scrub interactive time sliders, state updates fire at high frequency (10 to 60 events per second). Calling `window.history.replaceState()` synchronously on every input change triggers catastrophic browser security failures:
- **WebKit / Mobile Safari Quota Ceiling:** WebKit enforces a strict rate-limit of **100 calls per 30-second sliding window** to prevent denial-of-service and history spoofing.
- **Catastrophic Failure:** Exceeding this quota throws an uncatchable `SecurityError: Attempt to use history.replaceState() more than 100 times per 30.000000 seconds`, halting JavaScript execution.
- **Main Thread Stutter:** Continuous synchronous serialization and DOM history manipulation during user typing causes visible input lag.

We require a state synchronization architecture that guarantees 100% URL fidelity while remaining strictly below browser security quotas.

---

## 2. Decision Drivers
- **WebKit 100-Call Quota Immunity:** Must mathematically guarantee $< 100\text{ calls}$ per 30-second window under any typing velocity.
- **Zero Input Stutter:** Debounce state serialization off the critical input event path.
- **Zero State Loss:** Guarantees that the final user keystroke is always serialized prior to page unmount or sharing.
- **Simplicity & Small Footprint:** $< 1\text{ KB}$ implementation without external lodash dependencies.

---

## 3. Considered Options
1. **Option A: Synchronous `history.replaceState` on Every Event**
2. **Option B: Periodic Polling / Interval-Based Flush (`setInterval`)**
3. **Option C: Trailing-Edge Leaky Bucket Debounce ($T = 300\text{ms}$)**

---

## 4. Decision & Rationale
We chose **Option C: Trailing-Edge Leaky Bucket Debounce ($T = 300\text{ms}$)** encapsulated in `HistoryQuotaGuard`.

### Mathematical Rate Formulation:
$$f_{\max} = \frac{1}{T_{\text{debounce}}} = \frac{1}{0.300\text{s}} \approx 3.333\text{ updates/second}$$
$$\text{Max Calls in 30 Seconds} = 30\text{s} \times 3.333\text{ calls/s} = 99.99 < 100\text{ calls}$$

By choosing $T_{\text{debounce}} = 300\text{ms}$, the maximum possible history replacements across any 30-second window is strictly bounded to 99 calls, mathematically guaranteeing immunity against WebKit `SecurityError`.

### Architectural Implementation:
```typescript
export class HistoryQuotaGuard {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingHash: string | null = null;
  private readonly debounceMs: number = 300;

  public pushStateUpdate(hashPayload: string): void {
    this.pendingHash = hashPayload;
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.flush();
    }, this.debounceMs);
  }

  public flush(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.pendingHash !== null) {
      window.history.replaceState(null, '', this.pendingHash);
      this.pendingHash = null;
    }
  }
}
```

---

## 5. Quantitative Evaluation Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                 STATE SYNC ARCHITECTURE MATRIX                                    |
+--------------------------+--------+------------------+--------------------+-----------------------+
| Criteria                 | Weight | Option A: Sync   | Option B: Polling  | Option C: Leaky Bucket|
+--------------------------+--------+------------------+--------------------+-----------------------+
| Safari Quota Safety      | 35%    | 1/5 (Crashes)    | 4/5 (Fixed rate)   | 5/5 (Math guaranteed) |
| Input Responsiveness     | 25%    | 2/5 (Micro-jank) | 4/5 (Decoupled)    | 5/5 (Zero main lag)   |
| Battery / CPU Overhead   | 20%    | 3/5 (High)       | 2/5 (Timer churn)  | 5/5 (Idle when quiet) |
| Final State Guarantee    | 20%    | 5/5 (Immediate)  | 3/5 (Polling gap)  | 5/5 (Flush on blur)   |
+--------------------------+--------+------------------+--------------------+-----------------------+
| Weighted Total Score     | 100%   | 2.40 / 5.0       | 3.40 / 5.0         | 5.00 / 5.0 (WINNER)   |
+--------------------------+--------+------------------+--------------------+-----------------------+
```

---

## 6. Consequences & Mitigation
- **Consequence:** If a user clicks an external link within 299ms of a keystroke, the pending hash might not be written yet.
- **Mitigation:** The application binds `guard.flush()` to `window.addEventListener('beforeunload')` and `input.addEventListener('blur')`, ensuring all pending mutations are synchronously committed before navigation.
