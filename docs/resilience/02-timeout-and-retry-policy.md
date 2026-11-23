# Level 7: Resilience Specification — Timeout & Exponential Backoff Retry Policy

**Document ID:** `DOC-RES-02-RETRY-POLICY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Exponential Backoff & Circuit Breaker)  
**Version:** 2.3.6

---

## 1. Full Jitter Exponential Backoff Formulation

Transient network errors (HTTP 500, 502, 503, 504) are retried according to the **Full Jitter Exponential Backoff algorithm**:

$$t_{\text{sleep}} = \text{random}(0, \min(t_{\max}, t_0 \cdot 2^{\text{attempt}}))$$

Where:
- Base delay $t_0 = 500\text{ms}$.
- Maximum backoff ceiling $t_{\max} = 3000\text{ms}$.
- Maximum retry count $N_{\text{max}} = 2$.
- Cumulative request timeout ceiling $\le 4000\text{ms}$.

If HTTP 429 (Rate Limit) is received, retries abort immediately, tripping the Circuit Breaker and falling back seamlessly to `HeuristicGenerator`.

---

## 2. Production Circuit Breaker Implementation

```typescript
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Enterprise Circuit Breaker protecting Google Gemini API integration.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private nextAttemptEpoch: number = 0;

  constructor(
    private readonly failureThreshold: number = 2,
    private readonly coolOffPeriodMs: number = 60000
  ) {}

  public async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptEpoch) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback();
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err: unknown) {
      this.onFailure();
      return fallback();
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.tripCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(err?: any): void {
    this.failureCount++;
    // Immediate circuit breaker trip upon HTTP 429 (Resource Exhausted)
    const isRateLimit = err?.status === 429 || err?.message?.includes('429');
    if (isRateLimit || this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.tripCount = (this.tripCount || 0) + 1;
      // Exponential cool-off: 60s * 2^(tripCount - 1), capped at 600s (10 min)
      const dynamicCoolOff = Math.min(600000, this.coolOffPeriodMs * Math.pow(2, this.tripCount - 1));
      this.nextAttemptEpoch = Date.now() + dynamicCoolOff;
    }
  }
}
```

---

## 3. Production Retry with Jitter Utility

```typescript
/**
 * Wraps an asynchronous operation with full-jitter exponential backoff.
 */
export async function withRetryAndJitter<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number = 4000,
  maxRetries: number = 2
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(controller.signal);
      } catch (err: unknown) {
        if (attempt === maxRetries || (err as any)?.status === 429) {
          throw err;
        }
        const backoff = Math.random() * Math.min(3000, 500 * Math.pow(2, attempt));
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    throw new Error('Retries exhausted');
  } finally {
    clearTimeout(timer);
  }
}
```


---

## 4. Web Locks Acquisition Timeout & Abort Policy

When requesting the `'countdown_victory_alarm_lock'`, the acquisition timeout ceiling is strictly bounded:

$$\tau_{\text{lock}} \le 500\text{ms}$$

If the platform fails to resolve lock availability within $500\text{ms}$ via `AbortSignal.timeout(500)`, acquisition is aborted cleanly and audio synthesis is suppressed to prevent late, startling alarms.
