# Level 4: Low-Level Design — State Machine & Lifecycle Specification

**Document ID:** `DOC-LLD-03-STATE-MACHINE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Formal Finite State Machine)

---

## 1. Formal FSM Mathematical Definition

The core application lifecycle is modeled as a deterministic **Finite State Machine (FSM)**:

$$M = (S, \Sigma, \delta, s_0, F)$$

Where:
- $S = \{\text{UNINITIALIZED}, \text{IDLE}, \text{GENERATING\_AI}, \text{DEGRADED\_HEURISTIC}, \text{PREVIEWING\_SIMULATOR}, \text{RASTERIZING\_CANVAS}, \text{EXPORTED}, \text{ERROR}\}$
- $\Sigma$ is the set of user and system events.
- $\delta: S \times \Sigma \to S$ is the state transition function.
- $s_0 = \text{UNINITIALIZED}$ is the initial state.
- $F = \{\text{EXPORTED}, \text{IDLE}\}$ is the set of terminal/quiescent states.

---

## 2. State Transition Table

```
+---------------------------------------------------------------------------------------------------------+
|                                        STATE TRANSITION MATRIX                                          |
+-----------------------+--------------------------+-----------------------+------------------------------+
| Current State         | Ingress Event            | Next State            | Transition Side-Effect       |
+-----------------------+--------------------------+-----------------------+------------------------------+
| `UNINITIALIZED`       | `APP_MOUNT`              | `IDLE`                | Parse URL hash, start Ticker |
| `IDLE`                | `CLICK_DECOMPOSE_AI`     | `GENERATING_AI`       | Set loading spinner, call API|
| `GENERATING_AI`       | `API_SUCCESS`            | `IDLE`                | Populate 3-5 milestones      |
| `GENERATING_AI`       | `API_TIMEOUT_OR_ERROR`   | `DEGRADED_HEURISTIC`  | Trigger HeuristicGenerator   |
| `DEGRADED_HEURISTIC`  | `FALLBACK_COMPLETE`      | `IDLE`                | Render 4-quarter milestones  |
| `IDLE`                | `TOGGLE_OVERLAY`         | `PREVIEWING_SIMULATOR`| Render iOS/Android SVG guides|
| `PREVIEWING_SIMULATOR`| `TOGGLE_OVERLAY`         | `IDLE`                | Remove safe-zone guides      |
| `IDLE`                | `CLICK_DOWNLOAD`         | `RASTERIZING_CANVAS`  | Allocate 2x OffscreenCanvas  |
| `RASTERIZING_CANVAS`  | `RASTER_SUCCESS`         | `EXPORTED`            | Generate PNG Blob & Download |
| `EXPORTED`            | `DISPOSE_BUFFER`         | `IDLE`                | Free GPU memory, URL.revoke  |
| Any State             | `CRITICAL_EXCEPTION`     | `ERROR`               | Show error toast & recovery  |
+-----------------------+--------------------------+-----------------------+------------------------------+
```

---

## 3. Mermaid State Diagram

```mermaid
stateDiagram-v2
    [*] --> UNINITIALIZED
    UNINITIALIZED --> IDLE : APP_MOUNT (Hydrate State)
    
    IDLE --> GENERATING_AI : CLICK_DECOMPOSE (Gemini Call)
    GENERATING_AI --> IDLE : API_SUCCESS (Milestones Loaded)
    GENERATING_AI --> DEGRADED_HEURISTIC : API_ERROR / TIMEOUT
    DEGRADED_HEURISTIC --> IDLE : FALLBACK_APPLIED (4 Equidistant Sprints)
    
    IDLE --> PREVIEWING_SIMULATOR : TOGGLE_OVERLAY
    PREVIEWING_SIMULATOR --> IDLE : TOGGLE_OVERLAY
    
    IDLE --> RASTERIZING_CANVAS : CLICK_DOWNLOAD
    RASTERIZING_CANVAS --> EXPORTED : RASTER_COMPLETE (Blob Created)
    EXPORTED --> IDLE : DISPOSE_BUFFER (Deallocate GPU)
    
    IDLE --> ERROR : INVALID_DATE_INPUT
    ERROR --> IDLE : USER_CORRECTS_INPUT
```
