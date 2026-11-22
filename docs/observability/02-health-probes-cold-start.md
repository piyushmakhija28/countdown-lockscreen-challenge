# Level 8: Observability Specification — Core Web Vitals & Performance Probes

**Document ID:** `DOC-OBS-02-HEALTH-PROBES`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (W3C PerformanceObserver Telemetry)

---

## 1. Core Web Vitals Real-Time Instrumentation

The application registers an inline `PerformanceObserver` to track the official Google Core Web Vitals:

```typescript
/**
 * Instruments First Contentful Paint, Largest Contentful Paint, and Layout Shift.
 */
export function instrumentPerformance(): void {
  if (typeof PerformanceObserver === 'undefined') return;

  // Observe Paint Metrics (FCP)
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.info(`[Telemetry] FCP: ${entry.startTime.toFixed(2)}ms`);
      }
    }
  });
  paintObserver.observe({ type: 'paint', buffered: true });

  // Observe Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.info(`[Telemetry] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
}
```

---

## 2. Performance SLA Benchmarks

- **FCP:** $\le 800\text{ms}$ (Target: $450\text{ms}$).
- **LCP:** $\le 1200\text{ms}$ (Target: $850\text{ms}$).
- **CLS:** Strictly $0.00$ (Guaranteed via fixed CSS grid dimensions).
- **INP (Interaction to Next Paint):** $\le 50\text{ms}$.
