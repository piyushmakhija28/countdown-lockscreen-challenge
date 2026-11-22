# Level 9: Testing Specification — Test Strategy & Testing Pyramid

**Document ID:** `DOC-TEST-01-TEST-STRATEGY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (3-Tier Testing Pyramid & Coverage Enforcement)

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
              /    Unit     \      70% (TimeEngine, Math, Validation, Formatting)
             /---------------\
```

### 1.1 Layer Allocation & Coverage Mandates
1. **Unit Testing Layer (70% of Suite):**
   - **Scope:** Pure functions, `TimeEngine` UTC arithmetic, `MilestoneManager` progress formulas, `HeuristicGenerator` 4-quarter slicing, and input validation regexes.
   - **Coverage Mandate:** Minimum **$90\%$ Line Coverage** and **$85\%$ Branch Coverage**.
   - **Execution Speed:** $< 500\text{ms}$ total execution time.
2. **Integration Testing Layer (20% of Suite):**
   - **Scope:** Interactions between `GeminiClient` and `HeuristicGenerator` under simulated network drops; state store serialization/deserialization into URL hashes (`#v1=...`).
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
