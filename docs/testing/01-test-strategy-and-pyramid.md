# Level 9: Testing Specification — Test Strategy, Mocks & Pyramid Architecture

**Document ID:** `DOC-TEST-01-TEST-STRATEGY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (3-Tier Testing Pyramid & Coverage Enforcement)

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
1. **Unit Testing Layer (70% of Suite):**
   - **Scope:** Pure functions, `DualClockTimeEngine` UTC arithmetic, `MilestoneManager` progress formulas, `HeuristicGenerator` 4-quarter slicing, and `InputSanitizer` whitelist regexes.
   - **Coverage Mandate:** Minimum **$90\%$ Line Coverage** and **$85\%$ Branch Coverage**.
   - **Execution Speed:** $< 500\text{ms}$ total execution time.
2. **Integration Testing Layer (20% of Suite):**
   - **Scope:** Interactions between `GeminiAiClient` and `HeuristicGenerator` under simulated network drops; state store serialization/deserialization into URL hashes (`#v1=...`).
   - **Mocking Policy:** All external HTTP calls to `https://generativelanguage.googleapis.com` are mocked via MSW (Mock Service Worker) or native fetch mocks.
3. **End-to-End & Visual Canvas Testing Layer (10% of Suite):**
   - **Scope:** Full user journeys in headless Chromium; verifies canvas rasterization at $1170 \times 2532$ and asserts safe-zone coordinate bounding.

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
}
```
