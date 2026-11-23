# Level 7: Resilience Specification — Fault Tolerance & Bulkhead Architecture

**Document ID:** `DOC-RES-01-BULKHEAD`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Fault Tolerance & Bulkhead Isolation)

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
