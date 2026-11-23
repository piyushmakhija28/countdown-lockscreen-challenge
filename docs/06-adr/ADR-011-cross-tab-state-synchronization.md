# ADR-011: Cross-Tab State Synchronization via BroadcastChannel API

**Document ID:** `ADR-011`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Date:** 2026-11-23  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0  
**Version:** 2.3.5

---

## 1. Context & Problem Statement
The countdown lock screen application operates as an offline-first, client-only Single Page Application (PWA) with zero backend database. Users frequently maintain multiple browser tabs open simultaneously:
- A pinned lock screen monitoring tab displaying the real-time chronometer.
- A secondary tab editing goal milestones, toggling checklists, or selecting visual glassmorphic themes.
- Sibling background tabs spawned via shared memento links (`#v1=...`).

Without an active inter-tab synchronization channel, states diverge instantly across tabs:
- **Divergent Milestone States:** Checking a milestone in Tab B does not reflect on the active lock screen in Tab A.
- **Conflicting URL State Pushes:** Concurrent edits trigger uncoordinated `history.replaceState()` calls and conflicting storage overwrites.
- **Cyclic Re-Broadcast Storms:** Naive listeners that broadcast on state changes can enter an infinite echo loop ($A \to B \to A \to B \dots$) if incoming messages trigger outgoing broadcasts without identity filtering.
- **Requirement Traceability:** `FR-23`, `F-12`, `TC-POS-115`, `INV-017`.

---

## 2. Decision Drivers
- **Sub-50ms Propagation Latency:** State changes in one tab must render across sibling tabs within $\Delta t_{\text{sync}} \le 50\text{ms}$.
- **Zero Disk / Flash IO Overhead:** Synchronization must avoid continuous disk writes associated with synchronous storage events.
- **Infinite Loop Immunity (Echo Shield):** Must guarantee zero re-broadcast cycles when absorbing external updates.
- **Zero External Dependencies:** Must use native browser APIs supported across modern desktop and mobile browsers without third-party libraries.
- **Same-Origin Security Boundary:** State communication must remain strictly isolated to the application origin.

---

## 3. Considered Alternatives

### Alternative 1: StorageEvent (`window.addEventListener('storage', ...)`)
- **Mechanism:** One tab writes serialized state into `localStorage.setItem('cls_sync_payload', ...)` and sibling tabs listen to the `storage` event.
- **Pros:** Broad legacy browser support (IE8+).
- **Cons:** Triggers synchronous flash/disk IO on every state mutation; subjected to 5MB `localStorage` quota and private browsing restrictions; does not fire in the originating window; payload size limits cause serial serialization bottlenecks.

### Alternative 2: SharedWorker
- **Mechanism:** Tabs connect via `MessagePort` to a background `SharedWorker` process acting as a centralized state broker.
- **Pros:** Centralized authority for state storage and coordination.
- **Cons:** Completely unsupported on iOS Mobile Safari; complex lifecycle management and port reconnect gymnastics; heavy memory overhead for a lightweight client application.

### Alternative 3: BroadcastChannel API (Chosen)
- **Mechanism:** Tabs instantiate `new BroadcastChannel('countdown_lockscreen_sync')` for bidirectional, pub-sub messaging directly within the browser runtime.
- **Pros:** Native, unbuffered same-origin IPC; zero disk IO; ultra-low latency ($< 5\text{ms}$); simple unidirectional semantics; fully supported in modern Chromium, Firefox, and WebKit (Safari 15.4+).

---

## 4. Decision Outcome
We chose **Alternative 3: BroadcastChannel API** paired with an **Identity-Guarded Trampoline Dispatcher**.

### 4.1 Architectural Design & Cycle Prevention Protocol
Every `StateStore` instance generates a unique runtime instance identifier at boot:

$$\text{InstanceId} = \text{crypto.randomUUID()}$$

When local user interaction dispatches a state mutation (`SET_GOAL`, `TOGGLE_MILESTONE`, `SET_THEME`):
1. The store reduces state locally and updates the view.
2. If the action did not originate from an external sync event (`meta.isExternalSync !== true`), the store packages a sync payload:
   ```typescript
   interface BroadcastSyncPayload {
     type: 'SYNC_STATE_V1';
     senderId: string;       // Unique UUID of dispatching tab
     timestamp: number;      // performance.now() + timeOrigin
     sequenceNum: number;    // Monotonically increasing sequence ID
     state: SerializedState; // Clean state snapshot
     checksum: string;       // CRC32 / FNV-1a state checksum
   }
   ```
3. The channel broadcasts `channel.postMessage(payload)`.
4. When sibling tabs receive the `message` event:
   - **Echo Shield:** If `event.data.senderId === this.#instanceId`, the message is discarded immediately.
   - **Schema & Version Guard:** If `event.data.type !== 'SYNC_STATE_V1'` or version is mismatched, message is dropped.
   - **External Flag Injection:** Sibling store executes `dispatch({ type: 'HYDRATE_EXTERNAL', payload: event.data.state, meta: { isExternalSync: true } })`.
   - Because `meta.isExternalSync === true`, the receiving tab suppresses subsequent broadcast propagation, terminating the cycle at depth 1.

---

## 5. Consequences

### Positive:
- **Instantaneous Multi-Screen Cohesion:** A contestant modifying a milestone on a secondary display immediately sees the lock screen wallpaper update in real-time ($< 16\text{ms}$).
- **Zero Disk Thrashing:** Broadcasts occur purely in-memory through the browser process IPC.
- **Mathematical Cycle Safety:** Monotonically increasing `sequenceNum` and `senderId` guard against stale out-of-order delivery and re-entrant broadcast loops.

### Negative & Mitigations:
- **Safari Private Browsing Quirk:** Older Safari versions in Private Browsing occasionally restrict `BroadcastChannel`.
  - *Mitigation:* `ResilientStorageService` provides a graceful fallback: if `typeof BroadcastChannel === 'undefined'`, inter-tab sync degrades gracefully to `localStorage` `storage` events.
