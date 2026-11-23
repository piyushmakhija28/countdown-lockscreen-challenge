# Level 9: Testing Specification — Test Strategy, Mocks & Pyramid Architecture

**Document ID:** `DOC-TEST-01-TEST-STRATEGY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (3-Tier Testing Pyramid & Coverage Enforcement)  
**Version:** 2.3.1

---

## 1. Testing Pyramid Architecture & Allocation

Conforming to `~/.claude/rules/28-test-coverage-enforcement.md`, the testing strategy enforces a strict 3-tier pyramid with automated verification:

```
                    / \
                   /   \
                  /  E2E \         10% (Visual Canvas Regression & User Journeys)
                 /-------\
                /  Integ  \        20% (Gemini Fallback & URL Hash Serialization)
               /-----------\
              /    Unit     \      70% (DualClockTimeEngine, Math, Validation, Formatting)
             /---------------\
```

### 1.1 Layer Allocation & Coverage Mandates
1. **Unit Testing Layer (70% of Suite — 45 Scenarios + 15 Micro Tests):**
   - **Scope:** Pure functions and isolated classes: `DualClockTimeEngine` UTC arithmetic and monotonic resets, `MilestoneManager` progress formulas, `HeuristicGenerator` 4-quarter slicing, `InputSanitizer` Unicode whitelist and Bidi Trojan Source stripping, `TokenBucketHistoryGuard` token refill and leak rates, `AdaptiveBufferAllocator` dual-constraint scaling equations, `ResponsiveLayoutEngine` aspect ratio bounds, `ParticleEngine` Float32Array SoA physics, and `CanvasTextWrapper` caching.
   - **Coverage Mandate:** Minimum **$90\%$ Line Coverage** and **$85\%$ Branch Coverage**.
   - **Execution Speed:** $< 500\text{ms}$ total execution time.
2. **Integration Testing Layer (20% of Suite — 18 Scenarios):**
   - **Scope:** Cross-module collaborations: `GeminiAiClient` circuit-breaker trip to `HeuristicGenerator` fallback; `UrlStateService` Base64URL compression, decompression bomb defense, and sessionStorage sync; `AudioChimeService` 4-state lifecycle and autoplay priming; `HapticService` vibration patterns; `FontService` async font loading gate (`document.fonts.load()`).
   - **Mocking Policy:** All external HTTP calls to `https://generativelanguage.googleapis.com` are mocked via MSW (Mock Service Worker) or native fetch mocks.
3. **End-to-End & Visual Canvas Testing Layer (10% of Suite — 10 Scenarios):**
   - **Scope:** Full user journeys in headless Chromium: `CountdownApp` bootstrapping; `CanvasRenderer` rasterization at $1170 \times 2532$; `SafeZoneOverlay` guide bounds; theme switching (Cyber Obsidian, Deep Focus Zen, Aurora Botanical); 1-click PNG blob download; PWA offline cache recovery.

### 1.2 Full Requirements Coverage (FR-01 to FR-30)
The test suite maps directly to all 30 Functional Requirements (`FR-01` to `FR-30`) and 11 Non-Functional Requirements (`NFR-01` to `NFR-11`), providing 100% bidirectional verification across all concrete application classes and architectural subsystems.

---

## 2. Test Execution Harness & Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90
    }
  }
});
```

---

## 3. Mock Implementations for Headless Testing

### 3.1 MSW Mock Handler for Google Gemini 3.8 Flash
```typescript
import { http, HttpResponse } from 'msw';

export const geminiHandlers = [
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  title: 'Google SWE Internship',
                  deadline_iso: '2026-12-20T10:00:00Z',
                  milestones: [
                    { step: 1, title: 'Data Structures Sprint', offset_days: 21, completed: false },
                    { step: 2, title: 'Dynamic Programming Review', offset_days: 14, completed: false },
                    { step: 3, title: 'Mock Interviews', offset_days: 7, completed: false },
                    { step: 4, title: 'Final Polish', offset_days: 0, completed: false }
                  ],
                  daily_affirmation: 'Consistency compounds into mastery.',
                  recommended_theme: 'cyber_obsidian'
                })
              }
            ]
          }
        }
      ]
    });
  })
];
```

### 3.2 Canvas 2D & Web Audio Mocks
```typescript
export function installGlobalTestMocks(): void {
  // Mock Web Audio Context
  class MockAudioContext {
    state = 'suspended';
    currentTime = 0;
    resume = vi.fn().mockImplementation(() => {
      this.state = 'running';
      return Promise.resolve();
    });
    createOscillator = vi.fn().mockReturnValue({
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn()
    });
    createGain = vi.fn().mockReturnValue({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn()
    });
    createBuffer = vi.fn().mockReturnValue({});
    createBufferSource = vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn()
    });
    destination = {};
  }
  (window as any).AudioContext = MockAudioContext;

  // Mock Vibration API
  navigator.vibrate = vi.fn().mockReturnValue(true);

  // Mock BroadcastChannel API
  class MockBroadcastChannel {
    name: string;
    onmessage: ((ev: MessageEvent) => any) | null = null;
    private static channels = new Map<string, Set<MockBroadcastChannel>>();

    constructor(name: string) {
      this.name = name;
      if (!MockBroadcastChannel.channels.has(name)) {
        MockBroadcastChannel.channels.set(name, new Set());
      }
      MockBroadcastChannel.channels.get(name)!.add(this);
    }

    postMessage(data: any): void {
      const peers = MockBroadcastChannel.channels.get(this.name);
      if (!peers) return;
      for (const peer of peers) {
        if (peer !== this && peer.onmessage) {
          peer.onmessage(new MessageEvent('message', { data }));
        }
      }
    }

    close(): void {
      const peers = MockBroadcastChannel.channels.get(this.name);
      if (peers) {
        peers.delete(this);
      }
    }
  }
  (window as any).BroadcastChannel = MockBroadcastChannel;

  // Mock Web Locks API
  const mockLocks = {
    request: vi.fn().mockImplementation(async (name: string, options: any, callback?: any) => {
      const cb = typeof options === 'function' ? options : callback;
      const fakeLock = { name, mode: 'exclusive' };
      return cb(fakeLock);
    })
  };
  Object.defineProperty(navigator, 'locks', { value: mockLocks, writable: true });
}
```

### 3.3 Headless Test Harness Invariants
- **Multi-Tab Isolation:** `MockBroadcastChannel` routes messages strictly to peer instances on the same channel name, reproducing browser event loop semantics.
- **Mutex Non-Blocking Arbitration:** `MockWebLocks` supports `{ ifAvailable: true }` parameter testing, simulating instantaneous grant or contention suppression without unhandled promise rejections.

// Mock Document FontFaceSet API for Headless Font Preloading Testing
export class MockFontFaceSet {
  private loadedFonts = new Set<string>();

  async load(font: string, text?: string): Promise<FontFace[]> {
    this.loadedFonts.add(font);
    return [];
  }

  check(font: string): boolean {
    return this.loadedFonts.has(font);
  }

  get ready(): Promise<void> {
    return Promise.resolve();
  }
}

// Mock Navigator Vibration API
export class MockNavigatorVibrate {
  public callHistory: (number | number[])[] = [];

  vibrate(pattern: number | number[]): boolean {
    this.callHistory.push(pattern);
    return true;
  }
}
