# Level 7: Resilience Specification — Fault Tolerance & Bulkhead Architecture

**Document ID:** `DOC-RES-01-BULKHEAD`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Fault Tolerance & Bulkhead Isolation)  
**Version:** 2.3.5

---

## 1. Bulkhead Subsystem Isolation Architecture

To ensure that failure or resource starvation in one component never cascades into an application-wide crash, the system isolates execution across five independent **Bulkheads**:

```
+---------------------------------------------------------------------------------------------------+
|                                  BULKHEAD SUBSYSTEM BOUNDARIES                                    |
|                                                                                                   |
|   +------------------------------------+             +----------------------------------------+   |
|   |         AI INGRESS BULKHEAD        |             |        CANVAS RASTER BULKHEAD          |   |
|   |  - Isolated fetch() with 4s timeout|             |  - OffscreenCanvas memory ceiling      |   |
|   |  - Circuit Breaker trips on 429    |             |  - Adaptive auto-clamp from 2x to 1x   |   |
|   |  - Seamless Heuristic Fallback     |             |  - Strict RAII buffer deallocation     |   |
|   +-----------------+------------------+             +-------------------+--------------------+   |
|                     |                                                    |                        |
|                     +-----------------------+  +-------------------------+                        |
|                                             |  |                                                  |
|                                             v  v                                                  |
|   +------------------------------------+  +--------------------------+  +---------------------+   |
|   |      SENSORY IMMERSION BULKHEAD    |  | CORE CHRONOMETER BULKHEAD|  |  STATE SYNC BULKHEAD|   |
|   |  - Web Audio uncollected guard     |  | - High-priority RAF loop |  | - Token Bucket rate |   |
|   |  - Autoplay block silent catch     |  | - Immune to network state|  | - Safari quota safe |   |
|   |  - navigator.vibrate fallback      |  | - Guaranteed 60 FPS tick |  | - sessionStorage mic|   |
|   +------------------------------------+  +--------------------------+  +---------------------+   |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 HTTP 429 Rate-Limit Circuit-Breaker Fast-Fail
When communicating with the Google Gemini API, receiving an HTTP 429 (`RESOURCE_EXHAUSTED` / Too Many Requests) response immediately trips the AI Ingress circuit breaker to `OPEN` state for a 60-second cooldown window:
1. All concurrent and subsequent generation requests during this window bypass the remote network hop entirely.
2. The UI immediately falls back to local `HeuristicGenerator.generate()` execution ($< 5\text{ms}$).
3. The user receives actionable retrograde milestones instantly without error dialogs or hanging loaders.
4. After 60 seconds, the circuit breaker enters `HALF-OPEN` state, allowing a single probe request to test API quota recovery.

### 1.2 Client-Side 15 RPM Token Bucket Limiter (`GeminiRateLimiter`)
To preemptively prevent Google Gemini API 429 rate limit errors (15 RPM free tier ceiling), client calls pass through `GeminiRateLimiter`:
- **Token Bucket Capacity:** 3 tokens (permits bursts of up to 3 quick queries).
- **Refill Rate:** 1 token every $4000\text{ms}$ ($15\text{ tokens/minute}$).
- **Minimum Request Spacing:** $2000\text{ms}$ minimum inter-request delay to prevent burst collision.
- **Session Budget:** Maximum 100 requests per 24-hour rolling window per client instance.

```javascript
/**
 * Client-side rate limiter strictly enforcing the 15 RPM Google Gemini Free Tier quota.
 */
export class GeminiRateLimiter {
  #tokens = 3;
  #maxTokens = 3;
  #refillIntervalMs = 4000;
  #lastRefill = Date.now();
  #lastRequestTime = 0;
  #minSpacingMs = 2000;

  /**
   * Attempts to acquire a token before dispatching a Gemini API call.
   *
   * @returns {Promise<boolean>} True if call is permitted; false if rate-limited
   */
  async acquire() {
    this.#refill();
    const now = Date.now();
    if (this.#tokens < 1 || (now - this.#lastRequestTime) < this.#minSpacingMs) {
      return false; // Fast-fail to heuristic generator
    }
    this.#tokens -= 1;
    this.#lastRequestTime = now;
    return true;
  }

  #refill() {
    const now = Date.now();
    const elapsed = now - this.#lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.#refillIntervalMs);
    if (tokensToAdd > 0) {
      this.#tokens = Math.min(this.#maxTokens, this.#tokens + tokensToAdd);
      this.#lastRefill = now;
    }
  }
}
```

---

## 2. Production Concurrency & Memory Bulkhead Implementation

```typescript
/**
 * Concurrency limiter and queue bulkhead protecting critical browser threads.
 */
export class BulkheadLimiter {
  private activeCount: number = 0;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrent: number = 1,
    private readonly maxQueueLength: number = 3
  ) {}

  public async execute<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueueLength) {
        throw new Error('Bulkhead capacity saturated; task rejected');
      }
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}
```

---

## 3. Dynamic Canvas Memory Bulkhead

When generating high-resolution wallpapers on mobile devices with constrained heap memory:
1. **Pre-Allocation Heap Check:** If `performance.memory?.usedJSHeapSize` exceeds $45\text{ MB}$, the rasterizer automatically downgrades supersampling from $2\times$ to $1\times$, dropping buffer memory from $47.4\text{ MB}$ to $11.8\text{ MB}$.
2. **Context Loss Recovery:** Listens for `canvas.addEventListener('contextlost')`, immediately tearing down textures, invoking `event.preventDefault()`, and recreating the 2D surface.
3. **Sensory Isolation:** Audio and haptic exceptions are caught internally, ensuring that an unsupported `AudioContext` or disabled `navigator.vibrate` never halts the particle celebration engine.


## 4. Multi-Tab IPC & Web Locks Bulkhead Guarantees
1. **BroadcastChannel Isolation:** A corrupted payload or closed port on `BroadcastChannel` is caught internally; the local store continues running unhindered.
2. **Web Locks Mutex Fallback:** If `navigator.locks` throws a `SecurityError` (e.g. in sandboxed iframes), the audio engine falls back safely to immediate local chime synthesis.
