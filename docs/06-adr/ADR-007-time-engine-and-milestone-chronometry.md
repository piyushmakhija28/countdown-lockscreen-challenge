# ADR-007: Time Engine & Drift-Compensated Chronometry

**Status:** APPROVED  
**Date:** 2026-11-22  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Deciders:** System Architecture & Engineering Review Board  
**Standard:** MADR 3.0 (Markdown Architectural Decision Records)

---

## 1. Context and Problem Statement
Real-time countdown applications frequently suffer from cumulative timing drift when browser tabs are throttled in the background or when JavaScript execution stalls. Naive implementations using `setInterval(tick, 1000)` accumulate substantial timing errors because JavaScript timers are not real-time clocks; they only guarantee execution *after* a delay, not *at* an exact timestamp.

We must architect a mathematically drift-compensated chronometer engine.

---

## 2. Decision Drivers
- **Zero Cumulative Timing Drift:** The displayed countdown must remain mathematically synchronized with universal UTC epoch time indefinitely.
- **Battery & CPU Efficiency:** The animation loop must self-throttle when the browser tab is hidden (`document.visibilityState === 'hidden'`).
- **Smooth 60 FPS Animation:** Fluid second-by-second updates without visual frame drops or stutter.

---

## 3. Considered Options
- **Option 1: Naive `setInterval(tick, 1000)` Timer Loop**
- **Option 2: Dedicated Background Web Worker Ticker**
- **Option 3: Adaptive `requestAnimationFrame` anchored to `performance.now()` & UTC Epoch**

---

## 4. Comprehensive Trade-off Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                  ADR-007 CHRONOMETER COMPARISON                                  |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Criteria                 | Weight | Option 1: setInterval | Option 2: Worker  | Option 3: RAF Sync|
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Zero Cumulative Drift    | 35%    | 1/5 (Severe drift)    | 4/5 (Worker drift)| 5/5 (True zero)   |
| 60 FPS Visual Fluidity   | 25%    | 2/5 (1-second jumps)  | 3/5 (IPC message) | 5/5 (V-Sync lock) |
| CPU / Battery Efficiency | 25%    | 2/5 (Runs background) | 3/5 (Thread awake)| 5/5 (Auto-throttle|
| Implementation Simplicity| 15%    | 5/5 (Trivial)         | 2/5 (Worker bundle| 5/5 (Pure ESM)    |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Weighted Score           | 100%   | 2.10 / 5.0            | 3.20 / 5.0        | 5.00 / 5.0        |
+--------------------------+--------+-----------------------+-------------------+-------------------+
```

---

## 5. Decision Outcome
**Chosen Option: Option 3 (Adaptive `requestAnimationFrame` anchored to `performance.now()` & UTC Epoch).**

### 5.1 Mathematical Drift Compensation Algorithm
On every animation tick, the engine recalculates remaining time directly against the target UTC timestamp:

$$\Delta t_n = t_{\text{deadline\_epoch}} - \text{Date.now()}$$

Cumulative error $E = 0$ because no state is accumulated from previous iterations. When the tab transitions between visible and hidden states, the engine binds to `visibilitychange` to trigger an instantaneous realign tick upon tab focus.
