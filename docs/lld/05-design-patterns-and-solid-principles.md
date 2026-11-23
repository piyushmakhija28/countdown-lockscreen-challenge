# Level 4: Low-Level Design — Design Patterns & SOLID Principles

**Document ID:** `DOC-LLD-05-SOLID-PATTERNS`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Gang of Four & SOLID Conformance)  
**Version:** 2.3.1

---

## 1. Concrete Gang of Four (GoF) Design Patterns

```
+---------------------------------------------------------------------------------------------------+
|                                     DESIGN PATTERN IMPLEMENTATION MATRIX                          |
+-------------------+-----------------------+-----------------------+-------------------------------+
| Pattern Name      | Classification        | Concrete Class / File | Architectural Justification   |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Strategy**      | Behavioral            | `MilestoneGenerator`  | Interchangeable planners:     |
|                   |                       | (Gemini vs Heuristic) | runtime toggle based on net.  |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Strategy**      | Behavioral            | `AdaptiveAllocator`   | Platform GPU scale solver     |
|                   |                       |                       | (WebKit 16.7MP vs Desktop).   |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Observer**      | Behavioral            | `DualClockTimeEngine` | Subscribes DOM Ticker and     |
|                   |                       |                       | progress ring to 60fps ticks. |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Factory Method**| Creational            | `ThemeFactory`        | Instantiates design tokens &  |
|                   |                       |                       | palette contracts dynamically.|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Memento**       | Behavioral            | `UrlStateService`     | Captures & restores state     |
|                   |                       |                       | snapshots into URL Base64.    |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Flyweight**     | Structural            | `TWO_DIGIT_LUT`       | Reuses static 100-string array|
|                   |                       | `ParticleTrigLUT`     | & pre-computed sin/cos arrays.|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Flyweight**     | Structural            | `ParticleEngine`      | Contiguous Float32Array SoA   |
|                   |                       |                       | buffer eliminating GC churn.  |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Proxy / Guard** | Structural / Behav.   | `TokenBucketGuard`    | Rate-limits replaceState (30t,|
|                   |                       |                       | 2/s) preventing WebKit crashes|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Gateway/Barrier**| Structural / Creational| `FontService`        | Gates Canvas rendering until  |
|                   |                       |                       | document.fonts.load() resolves|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Facade**        | Structural            | `CanvasRenderer`      | Unifies typography, layout, & |
|                   |                       |                       | buffer rasterization pipeline.|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Chain of Resp.**| Behavioral            | `SharePipeline`       | Falls through: Web Share API  |
|                   |                       |                       | -> Anchor Download -> Modal.  |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **State**         | Behavioral            | `CountdownFSM`        | Encapsulates behaviors for    |
|                   |                       |                       | IDLE, EXPIRED, MODAL states.  |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Ports & Adapters**| Structural          | `CorePorts`           | Decouples core logic from DOM |
| (Hexagonal)       |                       | (ITickScheduler, etc.)| guaranteeing D <= 0.15.       |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **LifecycleScope**| Structural (RAII)     | `LifecycleScope`      | Wraps AbortController for zero|
|                   |                       |                       | DOM listener memory leaks.    |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Token Bucket**  | Behavioral            | `GeminiRateLimiter`   | Enforces 15 RPM quota limit   |
|                   |                       |                       | with 2s pacing on Free Tier.  |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Trampoline**    | Behavioral            | `StateStore`          | Queues re-entrant dispatches, |
|                   |                       |                       | preventing stack overflow &   |
|                   |                       |                       | dropped action metadata.      |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Stage-Chain Pipeline**| Structural/Behav. | `CanvasCompositionPipeline`| Executes 9 ordered offscreen   |
|                   |                       |                       | rendering stages sequentially. |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Strategy**      | Behavioral            | `FontReadinessStrategy`| Toggles between WebFont and    |
|                   |                       |                       | system monospace fallback.    |
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Observer/Sync** | Behavioral            | `TriModalSensorySync` | Synchronizes audio, haptic, & |
|                   |                       |                       | particle physics in < 20ms.   |
+-------------------+-----------------------+-----------------------+-------------------------------+

| **Adapter**       | Structural            | `WorkerTickerAdapter` | Adapts inline Web Worker to   |
|                   |                       |                       | ITickScheduler for background.|
+-------------------+-----------------------+-----------------------+-------------------------------+
| **Mutex / Lock**  | Concurrency           | `navigator.locks` &   | Enforces single-instance alarm|
|                   |                       | `BroadcastChannel`    | sound & cross-tab state sync. |
+-------------------+-----------------------+-----------------------+-------------------------------+
```

---

## 2. SOLID Architectural Principles Verification

### 2.1 Single Responsibility Principle (SRP)
- `DualClockTimeEngine`: Responsible solely for UTC chronometric calculation and delta frame timing.
- `CanvasRenderer`: Responsible solely for 2D pixel rasterization and safe-zone clipping.
- `UrlStateService`: Responsible solely for Base64 URL serialization and parsing.

### 2.2 Open/Closed Principle (OCP)
New visual themes (e.g. "Sunset Neon") can be added by registering a new `ThemeConfig` object in `themes.ts` without modifying the core `CanvasRenderer` rendering logic.

### 2.3 Liskov Substitution Principle (LSP)
Both `GeminiAiClient` and `HeuristicGenerator` implement the unified `IMilestonePlanner` interface. The application consumer functions identically regardless of which implementation is active.

### 2.4 Interface Segregation Principle (ISP)
Interfaces are narrowly scoped (`IDualClockTimeEngine`, `IMilestoneManager`, `IWallpaperRenderer`), preventing consumers from depending on unused methods.

### 2.5 Dependency Inversion Principle (DIP)
High-level view controllers depend on abstract interfaces (`IDualClockTimeEngine`, `IMilestonePlanner`, `ITickScheduler`, `IPlatformLifecycle`) injected via constructor parameters, rather than concrete browser APIs.

---

## 3. Code Complexity & Maintainability Metrics

All modules conform to strict mathematical limits:
- **Cyclomatic Complexity ($M$):** Strictly $M \le 10$ across all methods.
- **Lack of Cohesion in Methods (LCOM4):** Strictly $\text{LCOM4} = 1$ (High cohesion).
- **Afferent / Efferent Coupling:** $C_a \le 3, C_e \le 2$ on core domain models.


### 1.9 Mutex / Distributed Concurrency Lock Pattern
Enforces strictly one tab synthesizes victory celebratory audio when multiple windows observe countdown expiration:

```javascript
/**
 * Concurrency Mutex Pattern implementing non-blocking resource acquisition.
 */
export async function executeWithMutex(resourceName, onAcquired, onContended) {
  if (!('locks' in navigator)) return onAcquired();
  return navigator.locks.request(resourceName, { ifAvailable: true }, async (lock) => {
    if (!lock) return onContended();
    return onAcquired();
  });
}
```
