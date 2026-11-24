/**
 * Automated Unit Test Suite for Sprint 2 (Batch 2.2).
 * Verifies InputSanitizer, UrlStateService, TokenBucketHistoryGuard, and ResilientStorageService.
 *
 * @module test/unit/test_sanitizer_url_and_storage
 */

import assert from 'node:assert/strict';
import { InputSanitizer } from '../../src/js/core/InputSanitizer.js';
import { UrlStateService } from '../../src/js/core/UrlStateService.js';
import { TokenBucketHistoryGuard } from '../../src/js/core/TokenBucketHistoryGuard.js';
import { ResilientStorageService } from '../../src/js/services/ResilientStorageService.js';
import {
  ValidationError,
  StateSerializationError,
  PayloadTooLargeError,
  DecompressionBombError
} from '../../src/js/core/errors.js';
import { IStateStoragePort, IPlatformLifecycle } from '../../src/js/core/ports.js';

let passed = 0;
let total = 0;

/**
 * Asserts a test condition with human-readable assertion tracking.
 *
 * @param {string} desc Test case description
 * @param {() => void | Promise<void>} fn Test body
 */
async function test(desc, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('\n--- 1. Testing InputSanitizer ---');

await test('InputSanitizer normalizes NFKC and strips Trojan Source Bidi overrides', () => {
  const bidiAttack = 'Goal\u200E \u202Ereversed\u202C text\u2066!';
  const sanitized = InputSanitizer.sanitizeGoalTitle(bidiAttack);
  assert.equal(sanitized, 'Goal reversed text!');

  const ligature = 'Launch \uFB01nal Product';
  const normSanitized = InputSanitizer.sanitizeGoalTitle(ligature);
  assert.equal(normSanitized, 'Launch final Product');
});

await test('InputSanitizer rejects HTML and script markup tags', () => {
  assert.throws(
    () => InputSanitizer.sanitizeGoalTitle('Launch <script>alert(1)</script>'),
    (err) => err instanceof ValidationError && err.code === 'ERR_TITLE_INVALID_CHARS'
  );

  assert.throws(
    () => InputSanitizer.sanitizeGoalTitle('Goal with <img src=x onerror=alert(1)>'),
    (err) => err instanceof ValidationError && err.code === 'ERR_TITLE_INVALID_CHARS'
  );
});

await test('InputSanitizer enforces length constraints (3 to 60 characters) and non-empty', () => {
  assert.throws(
    () => InputSanitizer.sanitizeGoalTitle('   '),
    (err) => err instanceof ValidationError && err.code === 'ERR_TITLE_EMPTY'
  );

  assert.throws(
    () => InputSanitizer.sanitizeGoalTitle('Go'),
    (err) => err instanceof ValidationError && err.code === 'ERR_TITLE_LENGTH'
  );

  const longTitle = 'A'.repeat(61);
  assert.throws(
    () => InputSanitizer.sanitizeGoalTitle(longTitle),
    (err) => err instanceof ValidationError && err.code === 'ERR_TITLE_LENGTH'
  );

  const validTitle = InputSanitizer.sanitizeGoalTitle('Launch Handshake App 2.0 (Final)');
  assert.equal(validTitle, 'Launch Handshake App 2.0 (Final)');
});

await test('InputSanitizer validates future deadline temporal bounds', () => {
  const now = new Date('2026-11-24T12:00:00Z');
  const past = new Date('2026-11-23T12:00:00Z');
  const future = new Date('2026-12-31T23:59:59Z');

  assert.throws(
    () => InputSanitizer.validateFutureDeadline(past, now),
    (err) => err instanceof ValidationError && err.code === 'ERR_PAST_DATE'
  );

  assert.throws(
    () => InputSanitizer.validateFutureDeadline('not-a-date', now),
    (err) => err instanceof ValidationError && err.code === 'ERR_INVALID_DATE'
  );

  const farFuture = new Date(now.getTime() + (11 * 365.25 * 86400 * 1000));
  assert.throws(
    () => InputSanitizer.validateFutureDeadline(farFuture, now),
    (err) => err instanceof ValidationError && err.code === 'ERR_DATE_RANGE'
  );

  const validated = InputSanitizer.validateFutureDeadline(future, now);
  assert.equal(validated.toISOString(), future.toISOString());
});

await test('InputSanitizer escapes XML and HTML entities', () => {
  const unsafe = 'Finish & Win <Contest> "2026" / \'First\'';
  const escaped = InputSanitizer.escapeXmlEntities(unsafe);
  assert.equal(escaped, 'Finish &amp; Win &lt;Contest&gt; &quot;2026&quot; / &#39;First&#39;');
});

console.log('\n--- 2. Testing UrlStateService ---');

await test('UrlStateService serializes and deserializes state round-trip', async () => {
  const sampleState = {
    goalTitle: 'Master Gemini 3.8 Flash',
    deadline: '2026-12-31T23:59:59.000Z',
    milestones: [
      { id: 'm-1', title: 'Complete Batch 2.2', targetOffsetRatio: 0.5, isCompleted: true },
      { id: 'm-2', title: 'Full Verification', targetOffsetRatio: 1.0, isCompleted: false }
    ],
    affirmation: 'Consistency is power.',
    selectedTheme: 'theme-cyberpunk',
    isOverlayVisible: false
  };

  const hash = await UrlStateService.serializeState(sampleState);
  assert.ok(hash.startsWith('#v1='));
  assert.ok(hash.length < 500);

  const restored = await UrlStateService.deserializeState(hash);
  assert.equal(restored.title, sampleState.goalTitle);
  assert.equal(restored.deadline, sampleState.deadline);
  assert.equal(restored.milestones.length, 2);
  assert.equal(restored.milestones[0].title, 'Complete Batch 2.2');
  assert.equal(restored.theme, 'theme-cyberpunk');
  assert.equal(restored.isOverlay, false);
});

await test('UrlStateService enforces prototype pollution defense', async () => {
  const maliciousJson = JSON.stringify({
    title: 'Polluted Goal',
    __proto__: { isAdmin: true },
    constructor: { prototype: { isRoot: true } }
  });

  const rawBytes = new TextEncoder().encode(maliciousJson);
  let binary = '';
  for (let i = 0; i < rawBytes.byteLength; i++) {
    binary += String.fromCharCode(rawBytes[i]);
  }
  const base64Url = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const hash = `#v1=${base64Url}`;

  const restored = await UrlStateService.deserializeState(hash);
  assert.equal(restored.title, 'Polluted Goal');
  assert.equal(Object.prototype.isAdmin, undefined);
  assert.equal(Object.prototype.isRoot, undefined);
  assert.equal(restored.__proto__, undefined);
});

await test('UrlStateService enforces 2048-character length limit', async () => {
  const oversizedPayload = 'A'.repeat(2049);
  await assert.rejects(
    async () => UrlStateService.deserializeState(`#v1=${oversizedPayload}`),
    (err) => err instanceof PayloadTooLargeError && err.code === 'ERR_PAYLOAD_TOO_LARGE'
  );
});

await test('UrlStateService enforces 32KB decompression bomb ceiling guard', async () => {
  const hugeData = 'X'.repeat(35000);
  const json = JSON.stringify({ title: hugeData });
  const rawBytes = new TextEncoder().encode(json);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(rawBytes);
      controller.close();
    }
  }).pipeThrough(new CompressionStream('deflate-raw'));

  const response = new Response(stream);
  const compressedBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(compressedBuffer);

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Url = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await assert.rejects(
    async () => UrlStateService.deserializeState(`#v1=${base64Url}`),
    (err) => err instanceof DecompressionBombError && err.code === 'ERR_DECOMPRESSION_BOMB'
  );
});

console.log('\n--- 3. Testing TokenBucketHistoryGuard ---');

await test('TokenBucketHistoryGuard enforces rate limiting and immediate micro-persistence', async () => {
  class MockStoragePort extends IStateStoragePort {
    constructor() {
      super();
      this.saved = {};
      this.lastNav = '';
    }
    saveEphemeral(key, val) {
      this.saved[key] = val;
    }
    replaceNavigationState(hash) {
      this.lastNav = hash;
    }
  }

  const mockStorage = new MockStoragePort();
  const guard = new TokenBucketHistoryGuard(mockStorage, null, 3, 10);

  assert.equal(guard.tokens, 3);

  guard.pushStateUpdate('#v1=hash1');
  assert.equal(mockStorage.saved['countdown_active_hash'], '#v1=hash1');
  assert.equal(mockStorage.lastNav, '#v1=hash1');

  guard.pushStateUpdate('#v1=hash2');
  guard.pushStateUpdate('#v1=hash3');
  assert.equal(mockStorage.lastNav, '#v1=hash3');

  guard.pushStateUpdate('#v1=hash4');
  assert.equal(mockStorage.saved['countdown_active_hash'], '#v1=hash4');

  guard.forceFlush();
  assert.equal(mockStorage.lastNav, '#v1=hash4');

  const freshUrl = guard.getFreshUrl('https://example.com/app');
  assert.equal(freshUrl, 'https://example.com/app#v1=hash4');

  guard.dispose();
});

await test('TokenBucketHistoryGuard 3-layer loop shield ignores hydration and popstate', () => {
  let navCalls = 0;
  const mockStorage = {
    saveEphemeral: () => {},
    replaceNavigationState: () => { navCalls++; }
  };

  const guard = new TokenBucketHistoryGuard(mockStorage, null, 30, 2);

  guard.setHydrating(true);
  guard.pushStateUpdate('#v1=hydration_test');
  assert.equal(navCalls, 0);

  guard.setHydrating(false);
  guard.pushStateUpdate('#v1=popstate_test', 'POPSTATE');
  assert.equal(navCalls, 0);

  guard.pushStateUpdate('#v1=legit_update', 'USER');
  assert.equal(navCalls, 1);

  guard.pushStateUpdate('#v1=legit_update', 'USER');
  assert.equal(navCalls, 1);

  guard.dispose();
});

console.log('\n--- 4. Testing ResilientStorageService ---');

await test('ResilientStorageService implements IStateStoragePort with active tier persistence', () => {
  const service = new ResilientStorageService();
  assert.ok(service instanceof IStateStoragePort);
  assert.ok(['localStorage', 'sessionStorage', 'memory'].includes(service.activeTier));

  service.saveEphemeral('goal', 'Learn Quantum Computing');
  const loaded = service.loadEphemeral('goal');
  assert.equal(loaded, 'Learn Quantum Computing');

  const missing = service.loadEphemeral('non_existent');
  assert.equal(missing, null);
});

await test('ResilientStorageService degrades to memory tier when Web Storage is unavailable', () => {
  const origLocal = globalThis.localStorage;
  const origSession = globalThis.sessionStorage;
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;

  try {
    const memoryService = new ResilientStorageService();
    assert.equal(memoryService.activeTier, 'memory');
    memoryService.saveEphemeral('mem_key', 'mem_val');
    assert.equal(memoryService.loadEphemeral('mem_key'), 'mem_val');
  } finally {
    globalThis.localStorage = origLocal;
    globalThis.sessionStorage = origSession;
  }
});

await test('ResilientStorageService simulates localStorage failover and LRU eviction', () => {
  class MockLocalStorage {
    constructor(maxItems = 2) {
      this.store = new Map();
      this.maxItems = maxItems;
    }
    get length() {
      return this.store.size;
    }
    key(index) {
      return Array.from(this.store.keys())[index] || null;
    }
    getItem(k) {
      return this.store.get(k) ?? null;
    }
    setItem(k, v) {
      if (!this.store.has(k) && this.store.size >= this.maxItems) {
        throw new Error('QuotaExceededError: LocalStorage quota reached');
      }
      this.store.set(k, v);
    }
    removeItem(k) {
      this.store.delete(k);
    }
    clear() {
      this.store.clear();
    }
  }

  const originalLocal = globalThis.localStorage;
  const mockLocal = new MockLocalStorage(2);
  globalThis.localStorage = mockLocal;

  try {
    const storageService = new ResilientStorageService();
    assert.equal(storageService.activeTier, 'localStorage');

    storageService.saveEphemeral('item1', 'alpha');
    storageService.saveEphemeral('item2', 'beta');
    assert.equal(storageService.loadEphemeral('item1'), 'alpha');
    assert.equal(storageService.loadEphemeral('item2'), 'beta');

    storageService.saveEphemeral('item3', 'gamma');
    assert.equal(storageService.loadEphemeral('item3'), 'gamma');
    assert.equal(storageService.loadEphemeral('item1'), null);
  } finally {
    globalThis.localStorage = originalLocal;
  }
});

console.log(`\n========================================`);
console.log(`  Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
