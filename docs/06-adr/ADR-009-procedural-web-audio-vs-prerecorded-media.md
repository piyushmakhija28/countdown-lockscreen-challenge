# ADR-009: Procedural Web Audio API Synthesis with Resilient Autoplay-Priming

**Document ID:** `ADR-009`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** ACCEPTED  
**Date:** 2026-11-23  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0

---

## 1. Context & Problem Statement
When a countdown reaches zero ($\Delta t \le 0\text{ms}$), providing sensory audio feedback (a harmonious victory chime) significantly reinforces psychological achievement and dopamine closure.

However, playing audio in web applications on mobile devices introduces severe challenges:
1. **Network Overhead & Asset Bloat:** Pre-recorded `.mp3` files add $40\text{--}150\text{ KB}$ to initial load size and fail completely when offline.
2. **Mobile Autoplay Policy Rejection:** Modern browsers (iOS Safari and Android Chrome) strictly block `AudioContext` from starting or resuming without an active user gesture (touch/click). If a user loads a countdown link with 10 seconds remaining and watches passively, an unprimed `ctx.resume()` will throw `NotAllowedError: AudioContext was not allowed to start`, causing an unhandled promise rejection that breaks the celebration sequence.
3. **Audio Session Invalidation on iOS:** When the phone locks or receives a call, the `AudioContext` transitions to `'interrupted'` state, requiring re-priming.

---

## 2. Decision Drivers
- **Zero Asset Overhead ($0\text{ KB}$):** No additional media files in git repository or deployment bundles.
- **100% Offline Resilience:** Synthesizes sound mathematically via Web Audio oscillators without network calls.
- **Autoplay Policy Resilience:** Handles unprompted countdown expiration gracefully with gesture priming and soft fallback.
- **Zero Main Thread Jitter:** Sound scheduling executes asynchronously in the browser audio thread.

---

## 3. Decision & 4-State Audio Lifecycle
We chose **Procedural Web Audio API Synthesis with Gesture-Gated Priming and Soft Degradation**.

```
+---------------------------------------------------------------------------------------------------+
|                                      4-STATE AUDIO LIFECYCLE                                      |
+-------------------+----------------------------+--------------------------------------------------+
| State             | Trigger                    | System Behavior                                  |
+-------------------+----------------------------+--------------------------------------------------+
| 1. `LOCKED`       | Initial application boot   | Context uninitialized or suspended.              |
| 2. `UNLOCKED`     | First user tap/touch/click | Primes hardware with silent 1-sample buffer.     |
| 3. `INTERRUPTED`  | Phone call / lock screen   | Hardware output suspended by OS audio manager.   |
| 4. `DEGRADED`     | Expiration while `LOCKED`  | Suppresses chime; triggers haptics & badge.      |
+-------------------+----------------------------+--------------------------------------------------+
```

---

## 4. Architectural Implementation Blueprint (`AudioChimeService.js`)

```typescript
/**
 * Procedural harmonic victory chime synthesizer with autoplay priming.
 */
export class AudioChimeService {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private isPendingPlayback: boolean = false;

  constructor() {
    this.registerGestureListeners();
  }

  private registerGestureListeners(): void {
    const events = ['pointerdown', 'touchstart', 'keydown'];
    const unlockHandler = async () => {
      await this.unlockAudioContext();
      if (this.isUnlocked) {
        events.forEach((evt) => window.removeEventListener(evt, unlockHandler));
        if (this.isPendingPlayback) {
          this.isPendingPlayback = false;
          await this.playVictoryChime();
        }
      }
    };
    events.forEach((evt) =>
      window.addEventListener(evt, unlockHandler, { passive: true })
    );
  }

  public async unlockAudioContext(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
        await this.ctx.resume();
      }

      // Play 1-sample silent buffer to prime mobile hardware
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);

      this.isUnlocked = this.ctx.state === 'running';
      return this.isUnlocked;
    } catch {
      this.isUnlocked = false;
      return false;
    }
  }

  public async playVictoryChime(): Promise<boolean> {
    if (!this.ctx || this.ctx.state !== 'running') {
      const unlocked = await this.unlockAudioContext();
      if (!unlocked) {
        this.isPendingPlayback = true;
        window.dispatchEvent(new CustomEvent('audio:autoplay-blocked'));
        return false;
      }
    }

    try {
      const ctx = this.ctx!;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Exponential ramps (non-zero minimum to prevent Web Audio singularity)
        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.20);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 5. Consequences & Soft Degradation
- If a countdown expires without preceding user interactions, audio playback fails silently without unhandled promise rejections.
- The UI listens to `audio:autoplay-blocked` and renders a celebratory glassmorphic toast with a "Tap to Play Victory Sound" action, guaranteeing full accessibility and zero browser console errors.
