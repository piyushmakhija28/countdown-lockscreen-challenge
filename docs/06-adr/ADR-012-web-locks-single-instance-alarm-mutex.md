# ADR-012: Single-Instance Victory Alarm Mutex via Web Locks API

**Document ID:** `ADR-012`  
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
When a contestant's deadline expires ($\Delta t \le 0$), the application triggers an audiovisual victory celebration:
- Synthesizes a celebratory major chord progression via procedural Web Audio (`AudioChimeService`).
- Dispatches a celebratory haptic pulse pattern via `navigator.vibrate([100, 50, 100, 50, 250])`.
- Composites celebratory confetti particle physics across the high-DPI canvas (`ParticleEngine`).

When multiple tabs of the lock screen are running simultaneously across the contestant's workstation:
- Every open tab evaluates the hardware monotonic clock and detects $\Delta t \le 0$ within milliseconds of each other.
- If every tab independently instantiates its procedural `AudioContext` and triggers chime synthesis, destructive acoustic consequences ensue:
  - **Constructive & Destructive Phase Interference:** Simultaneous unsynchronized oscillator waveforms produce dissonant comb-filtering and harsh acoustic distortion.
  - **Volume Multiplication & Clipping:** Stacking 3 to 5 simultaneous audio streams exceeds browser audio headroom, triggering harsh digital clipping ($> 0\text{ dBFS}$) that can damage user hearing or mobile device speakers.
  - **Contestant Experience Degradation:** Instead of a triumphant celebration, the user experiences jarring audio chaos.
- **Requirement Traceability:** `FR-24`, `F-12`, `TC-POS-116`, `INV-016`.

---

## 2. Decision Drivers
- **Strictly Single-Tab Chime Guarantee:** Exactly one tab must synthesize and output the celebratory chime.
- **Non-Blocking Contention Resolution:** Sibling tabs that do not acquire audio ownership must immediately suppress their audio output without blocking the main event loop or delaying confetti rendering.
- **Zombie Process & Crash Resilience:** If the active audio tab crashes or is closed abruptly, locks must be freed automatically without deadlocking the browser.
- **Zero External Infrastructure:** Solution must be 100% client-side, native, and zero-dependency.

---

## 3. Considered Alternatives

### Alternative 1: LocalStorage Timestamp Lease
- **Mechanism:** Tabs attempt to write their timestamp into `localStorage.setItem('cls_audio_mutex', JSON.stringify({ tabId, expiresAt: Date.now() + 5000 }))`. If an unexpired lease exists, other tabs abort.
- **Pros:** Compatible with older browsers.
- **Cons:** Susceptible to race conditions (read-then-write is non-atomic across browser processes); unhandled exceptions or tab terminations leave orphaned locks until timeout expires; private browsing storage quota exceptions abort execution.

### Alternative 2: BroadcastChannel Leader Election / Token Ring
- **Mechanism:** Tabs negotiate an elected leader via Bully Algorithm or Token Ring messages over `BroadcastChannel`.
- **Pros:** Pure in-memory coordination.
- **Cons:** Significant distributed protocol overhead; edge cases during concurrent tab boots, network stalls, or split-brain partitions; complex state machine requiring extensive testing.

### Alternative 3: Web Locks API with Non-Blocking Mode (Chosen)
- **Mechanism:** Utilize `navigator.locks.request('countdown_victory_alarm_lock', { ifAvailable: true }, async (lock) => { ... })`.
- **Pros:** Native, kernel-enforced atomic mutex provided directly by the browser platform; `{ ifAvailable: true }` makes acquisition strictly non-blocking (returns `null` immediately if lock is held); browser automatically releases locks upon tab teardown or process termination, guaranteeing zero zombie deadlocks.

---

## 4. Decision Outcome
We chose **Alternative 3: Web Locks API with Non-Blocking Mode (`ifAvailable: true`) and Local Graceful Fallback**.

### 4.1 Concrete Implementation Blueprint
In `AudioChimeService.prototype.playVictoryChimeWithLock()`:

```javascript
/**
 * Synthesizes celebratory audio chime guarded by an atomic cross-tab lock.
 * Prevents phase interference and volume multiplication across concurrent tabs.
 *
 * @returns {Promise<boolean>} True if this tab won the lock and played audio; false if suppressed.
 */
async playVictoryChimeWithLock() {
  if (!('locks' in navigator)) {
    // Graceful fallback for legacy runtimes lacking Web Locks API
    return this.playVictoryChime();
  }

  try {
    return await navigator.locks.request(
      'countdown_victory_alarm_lock',
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          // Lock held by sibling tab: cleanly suppress duplicate audio
          return false;
        }
        // Acquired atomic mutex: proceed with procedural chime synthesis
        await this.playVictoryChime();
        // Hold lock for the duration of chime playback (2500ms) to prevent late races
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return true;
      }
    );
  } catch (error) {
    // If Web Locks throws, fall back safely to single-tab execution
    return this.playVictoryChime();
  }
}
```

### 4.2 Sensory Decoupling
Visual and sensory celebration channels are strictly decoupled:
- **Audio Chime:** Exclusively guarded by the Web Locks mutex (1 tab plays).
- **Haptic Vibration:** Guarded by Web Locks mutex or active tab visibility (`document.visibilityState === 'visible'`).
- **Confetti Particle Physics:** Executed independently across ALL visible tabs so that contestants viewing the countdown on multiple screens experience celebration visual fidelity across every monitor.

---

## 5. Consequences

### Positive:
- **Zero Audio Distortion:** Crystal-clear acoustic major chord synthesis across all user setups, completely immune to multi-tab volume multiplication.
- **Zero Race Conditions:** The underlying browser OS kernel serializes lock acquisition atomically across processes.
- **Automatic Lifecycle Cleanup:** Closing the tab or reloading immediately frees the lock.

### Negative & Mitigations:
- **Legacy Browser Support:**
  - *Mitigation:* Explicit feature check `'locks' in navigator` ensures that platforms lacking Web Locks API (Safari < 15.4) fall back directly to immediate local playback.
