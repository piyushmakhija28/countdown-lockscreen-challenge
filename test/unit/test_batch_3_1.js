/**
 * Automated Unit Test Suite for Sprint 3 (Batch 3.1).
 * Verifies HeuristicGenerator, GeminiRateLimiter, and GeminiAiClient.
 *
 * @module test/unit/test_batch_3_1
 */

import assert from 'node:assert/strict';
import { HeuristicGenerator } from '../../src/js/ai/HeuristicGenerator.js';
import { GeminiRateLimiter } from '../../src/js/ai/GeminiRateLimiter.js';
import { GeminiAiClient, GEMINI_SYSTEM_INSTRUCTION } from '../../src/js/ai/GeminiAiClient.js';
import { AiServiceError, AiSafetyBlockError, AsyncAbortedError } from '../../src/js/core/errors.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    failed++;
  }
}

console.log('=== Running Sprint 3 Batch 3.1 Unit Tests ===\n');

// 1. HeuristicGenerator Tests
runTest('HeuristicGenerator: generates exactly 4 milestones with 75%, 50%, 25%, 0% offsets', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const deadline = new Date('2026-01-21T00:00:00Z'); // 20 days
  const plan = HeuristicGenerator.generatePlan('Launch Product', deadline, now);

  assert.equal(plan.title, 'Launch Product');
  assert.equal(plan.deadline_iso, '2026-01-21T00:00:00.000Z');
  assert.equal(plan.milestones.length, 4);

  // Offsets: 20 * 0.75 = 15, 20 * 0.5 = 10, 20 * 0.25 = 5, 0
  assert.equal(plan.milestones[0].offset_days, 15);
  assert.equal(plan.milestones[1].offset_days, 10);
  assert.equal(plan.milestones[2].offset_days, 5);
  assert.equal(plan.milestones[3].offset_days, 0);

  // Step indices
  assert.equal(plan.milestones[0].step, 1);
  assert.equal(plan.milestones[3].step, 4);

  // Initial completion status
  assert.equal(plan.milestones[0].completed, false);
  assert.equal(plan.milestones[0].isCompleted, false);

  // Affirmation and theme
  assert.ok(plan.daily_affirmation.length <= 120);
  assert.equal(plan.recommended_theme, 'cyber_obsidian');
});

runTest('HeuristicGenerator: execution completes in < 5ms', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const deadline = new Date('2026-02-01T00:00:00Z');
  const t0 = performance.now();
  HeuristicGenerator.generatePlan('Benchmark Test', deadline, now);
  const elapsed = performance.now() - t0;

  assert.ok(elapsed < 5, `Expected < 5ms, took ${elapsed.toFixed(3)}ms`);
});

runTest('HeuristicGenerator: handles short and boundary deadlines with minimum 1 day floor', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  const deadline = new Date('2026-01-01T14:00:00Z'); // Only 2 hours
  const plan = HeuristicGenerator.generatePlan('Quick Task', deadline, now);

  assert.equal(plan.milestones.length, 4);
  assert.equal(plan.milestones[0].offset_days, 1);
  assert.equal(plan.milestones[3].offset_days, 0);
});

// 2. GeminiRateLimiter Tests
runTest('GeminiRateLimiter: enforces 2.0s inter-dispatch pacing', () => {
  const limiter = new GeminiRateLimiter(15, 2000, 4000, 'test_rate_guard_1');
  limiter.reset();

  const firstCall = limiter.acquire();
  assert.equal(firstCall, true, 'First call must succeed');

  const immediateSecondCall = limiter.acquire();
  assert.equal(immediateSecondCall, false, 'Immediate call within 2.0s must be throttled');

  const status = limiter.getQuotaStatus();
  assert.equal(status.isPermitted, false);
  assert.ok(status.waitMs > 0 && status.waitMs <= 2000);
});

runTest('GeminiRateLimiter: acquireToken throws AiServiceError on rate-limit', () => {
  const limiter = new GeminiRateLimiter(15, 2000, 4000, 'test_rate_guard_2');
  limiter.reset();

  limiter.acquireToken(); // 1st succeeds
  assert.throws(
    () => limiter.acquireToken(),
    (err) => err instanceof AiServiceError && err.httpStatus === 429 && err.isRateLimit === true
  );
});

runTest('GeminiRateLimiter: token exhaustion and refill', () => {
  // Setup limiter with zero pacing, capacity 2, refill every 100ms
  const limiter = new GeminiRateLimiter(2, 0, 100, 'test_rate_guard_3');
  limiter.reset();

  assert.equal(limiter.acquire(), true); // 1 token left
  assert.equal(limiter.acquire(), true); // 0 tokens left
  assert.equal(limiter.acquire(), false, 'Exhausted tokens must be blocked');

  const status = limiter.getQuotaStatus();
  assert.equal(status.tokens, 0);
  assert.ok(status.waitMs > 0);
});

runTest('GeminiRateLimiter: persists to storage mock across instances', () => {
  const mockStorage = {
    data: new Map(),
    getItem(k) { return this.data.get(k) || null; },
    setItem(k, v) { this.data.set(k, String(v)); },
    removeItem(k) { this.data.delete(k); }
  };

  const limiter1 = new GeminiRateLimiter(5, 0, 1000, 'sync_guard', mockStorage);
  limiter1.reset();
  limiter1.acquire(); // tokens becomes 4

  const limiter2 = new GeminiRateLimiter(5, 0, 1000, 'sync_guard', mockStorage);
  assert.equal(limiter2.getQuotaStatus().tokens, 4, 'Second instance must load persisted balance');
});

// 3. GeminiAiClient Tests
await runAsyncTest('GeminiAiClient: authenticates strictly via x-goog-api-key header and omits query param', async () => {
  let capturedUrl = '';
  let capturedHeaders = null;
  let capturedBody = null;

  const mockFetch = async (url, options) => {
    capturedUrl = url;
    capturedHeaders = options.headers;
    capturedBody = JSON.parse(options.body);

    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    title: 'Achieve Goal',
                    deadline_iso: '2026-06-01T00:00:00.000Z',
                    milestones: [
                      { step: 1, title: 'Phase 1', offset_days: 30, completed: false },
                      { step: 2, title: 'Phase 2', offset_days: 15, completed: false },
                      { step: 3, title: 'Phase 3', offset_days: 0, completed: false }
                    ],
                    daily_affirmation: 'Every step forward builds unstoppable momentum.',
                    recommended_theme: 'deep_focus_zen'
                  })
                }
              ]
            }
          }
        ]
      })
    };
  };

  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_1');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: 'AIzaSyTestKey1234567890abcdef',
    rateLimiter,
    fetchFn: mockFetch
  });

  const plan = await client.generatePlan('Achieve Goal', new Date('2026-06-01T00:00:00Z'));

  // Header validation
  assert.ok(capturedHeaders, 'Headers must be supplied');
  assert.equal(capturedHeaders['x-goog-api-key'], 'AIzaSyTestKey1234567890abcdef');
  assert.equal(capturedHeaders['Content-Type'], 'application/json');

  // URL validation (no query param key leakage)
  assert.ok(!capturedUrl.includes('key='), 'URL must strictly never contain API key in query params');

  // Response validation
  assert.equal(plan.title, 'Achieve Goal');
  assert.equal(plan.milestones.length, 3);
  assert.equal(plan.recommended_theme, 'deep_focus_zen');
});

await runAsyncTest('GeminiAiClient: escapes XML/HTML entities in user goal prompt', async () => {
  let promptText = '';

  const mockFetch = async (url, options) => {
    const body = JSON.parse(options.body);
    promptText = body.contents[0].parts[0].text;

    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    title: 'Score >= 95% in Math & Stats',
                    deadline_iso: '2026-06-01T00:00:00.000Z',
                    milestones: [
                      { step: 1, title: 'Review', offset_days: 10, completed: false },
                      { step: 2, title: 'Mock Exam', offset_days: 5, completed: false },
                      { step: 3, title: 'Final Test', offset_days: 0, completed: false }
                    ],
                    daily_affirmation: 'Consistent discipline creates undeniable excellence.',
                    recommended_theme: 'cyber_obsidian'
                  })
                }
              ]
            }
          }
        ]
      })
    };
  };

  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_2');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: 'AIzaSyTestKey',
    rateLimiter,
    fetchFn: mockFetch
  });

  await client.generatePlan('Score >= 95% in Math & "Physics"', new Date('2026-06-01T00:00:00Z'));

  assert.ok(promptText.includes('Score &gt;= 95% in Math &amp; &quot;Physics&quot;'), 'Prompt must escape XML special characters');
});

await runAsyncTest('GeminiAiClient: trips circuit breaker immediately on HTTP 429 and falls back to Heuristic', async () => {
  let callCount = 0;

  const mockFetch = async () => {
    callCount++;
    return {
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    };
  };

  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_3');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: 'AIzaSyTestKey',
    rateLimiter,
    fetchFn: mockFetch,
    fallbackOnFailure: true
  });

  assert.equal(client.getCircuitState(), 'CLOSED');

  // First call returns 429 -> trips circuit breaker and returns heuristic fallback
  const plan1 = await client.generatePlan('Urgent Project', new Date('2026-06-01T00:00:00Z'));
  assert.equal(callCount, 1);
  assert.equal(plan1.milestones.length, 4, 'Must return 4 heuristic fallback milestones');
  assert.equal(client.getCircuitState(), 'OPEN', 'Circuit breaker must be tripped to OPEN');

  // Second call must bypass fetch completely and return heuristic instantly
  const plan2 = await client.generatePlan('Urgent Project', new Date('2026-06-01T00:00:00Z'));
  assert.equal(callCount, 1, 'Subsequent call must bypass remote fetch when circuit is OPEN');
  assert.equal(plan2.milestones.length, 4);
});

await runAsyncTest('GeminiAiClient: throws AiSafetyBlockError when safety filter triggers', async () => {
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      promptFeedback: {
        blockReason: 'SAFETY'
      }
    })
  });

  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_4');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: 'AIzaSyTestKey',
    rateLimiter,
    fetchFn: mockFetch,
    fallbackOnFailure: false
  });

  await assert.rejects(
    async () => client.generatePlan('Dangerous Goal', new Date('2026-06-01T00:00:00Z')),
    (err) => err instanceof AiSafetyBlockError && err.code === 'ERR_AI_SAFETY_BLOCK'
  );
});

await runAsyncTest('GeminiAiClient: abortActiveRequest aborts in-flight request', async () => {
  const mockFetch = async (url, options) => {
    return new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new Error('AbortError'));
      });
    });
  };

  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_5');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: 'AIzaSyTestKey',
    rateLimiter,
    fetchFn: mockFetch,
    fallbackOnFailure: false,
    timeoutMs: 10000
  });

  const promise = client.generatePlan('Hanging Goal', new Date('2026-06-01T00:00:00Z'));
  // Abort request synchronously
  client.abortActiveRequest();

  await assert.rejects(
    promise,
    (err) => err instanceof AiServiceError || err.name === 'Error'
  );
});

await runAsyncTest('GeminiAiClient: missing API key falls back to HeuristicGenerator seamlessly', async () => {
  const rateLimiter = new GeminiRateLimiter(15, 0, 1000, 'test_client_guard_6');
  rateLimiter.reset();

  const client = new GeminiAiClient({
    apiKey: null,
    rateLimiter,
    fallbackOnFailure: true
  });

  const plan = await client.generatePlan('Offline Goal', new Date('2026-07-01T00:00:00Z'));
  assert.equal(plan.milestones.length, 4);
  assert.equal(plan.daily_affirmation, HeuristicGenerator.DEFAULT_AFFIRMATION);
});

console.log(`\nBatch 3.1 Tests Completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
