# Level 4: Low-Level Design — Concurrency & Threading Model

**Document ID:** `DOC-LLD-04-CONCURRENCY-MODEL`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Browser Concurrency & Event Loop)

---

## 1. Browser Event Loop & Concurrency Architecture

Modern single-threaded browser environments require disciplined asynchronous scheduling to guarantee zero UI stuttering ($60\text{ fps}$) while performing expensive graphics rasterization and network operations.

```
+---------------------------------------------------------------------------------------------------+
|                                     BROWSER RUNTIME CONCURRENCY                                   |
|                                                                                                   |
|   +------------------------------------+             +----------------------------------------+   |
|   |         MAIN UI THREAD             |             |        ASYNCHRONOUS WORK POOL          |   |
|   |  - 60 FPS requestAnimationFrame    |             |  - Gemini Fetch Promise (Network I/O)  |   |
|   |  - DOM Event Ingress & Validation  |             |  - OffscreenCanvas 2D Rasterizer       |   |
|   |  - Real-Time Digit Updates         |             |  - canvas.toBlob() Image Compression   |   |
|   +-----------------+------------------+             +-------------------+--------------------+   |
|                     |                                                    |                        |
|                     +-----------------------+  +-------------------------+                        |
|                                             |  |                                                  |
|                                             v  v                                                  |
|                              +-------------------------------+                                    |
|                              |   MICROTASK & MACROTASK QUEUE |                                    |
|                              |  - Promise.then() Resolutions |                                    |
|                              |  - V-Sync Frame Callbacks     |                                    |
|                              +-------------------------------+                                    |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Memory Lifecycle & GPU Texture Deallocation

When generating high-resolution wallpapers at $2\times$ supersampling ($2340 \times 5064\text{ pixels}$), memory must be strictly deallocated to prevent iOS Safari tab evictions:

$$\text{Peak Memory Allocation} = 2340 \times 5064 \times 4\text{ bytes (RGBA)} \approx 47.4\text{ MB}$$

### 2.1 The Safe Deallocation Protocol
1. Allocate temporary `OffscreenCanvas` instance: `const buffer = new OffscreenCanvas(2340, 5064)`.
2. Execute vector drawing passes.
3. Export binary blob via `buffer.convertToBlob({ type: 'image/png' })`.
4. **Immediate Deallocation:** Explicitly clear buffer dimensions:
   ```typescript
   buffer.width = 0;
   buffer.height = 0;
   // Context automatically dereferenced for immediate Garbage Collection
   ```
5. Revoke Object URLs: `setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)`.

---

## 3. Tab Visibility & Sleep Mode Throttling

When the browser tab transitions to the background (`document.visibilityState === 'hidden'`), modern mobile browsers throttle `requestAnimationFrame` down to $1\text{ Hz}$ or suspend it entirely.

- **Mitigation:** The `TimeEngine` listens to `document.addEventListener('visibilitychange')`.
- Upon `visibilityState === 'visible'`, the engine bypasses accumulated frame deltas and triggers an **instantaneous absolute resynchronization** against `Date.now()`, ensuring the user sees perfectly accurate countdown numbers with zero visual lag.

---

## 4. ABA Asynchronous Race Condition Mitigation (AbortController)

When rapid user edits trigger overlapping network calls, an earlier slower request resolving after a newer request corrupts application state. This is formally solved using `AbortController` and monotonically increasing request epochs:

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant View as InputView
    participant Client as GeminiClient
    participant Network as Gemini API

    User->>View: Types Goal A and clicks "Decompose"
    View->>Client: generatePlan("Goal A") [Epoch = 1]
    Client->>Network: Request 1 (In-Flight, slow: 2200ms)
    
    User->>View: Changes to Goal B and clicks "Decompose"
    View->>Client: generatePlan("Goal B") [Epoch = 2]
    Client->>Client: abortController.abort() on Request 1
    Client->>Network: Request 2 (In-Flight, fast: 700ms)
    
    Network-->>Client: Request 2 Resolves (Epoch 2 matches active)
    Client-->>View: State updated with Goal B Milestones
    
    Network-->>Client: Request 1 Resolves late (Epoch 1 !== 2)
    Note over Client: Signal aborted / Epoch mismatch -> Silently Discarded
```

---

## 5. Singleton Ticker Concurrency Guard

To prevent multiple overlapping `requestAnimationFrame` loops from running simultaneously (which doubles CPU usage and drains battery):

```typescript
export class TimeEngine {
  private rafId: number | null = null;
  private isRunning: boolean = false;

  public startTicker(deadline: Date, onTick: (rem: TimeRemaining) => void): void {
    // Invariant: Mutually exclusive ticker execution
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = true;
    const tick = () => {
      if (!this.isRunning) return;
      onTick(this.calculateRemaining(deadline));
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stopTicker(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
```
