/**
 * Automated Unit Test Suite for Sprint 2 (Batch 2.1).
 * Verifies Clean Architecture Ports, LifecycleScope, Domain Errors, and StateStore.
 *
 * @module test/unit/test_batch_2_1
 */

import assert from 'node:assert/strict';
import {
  ITickScheduler,
  IMilestonePlanner,
  IRenderTarget,
  IWallpaperRenderer,
  IStateStoragePort,
  IPlatformLifecycle,
  ISensoryCoordinator
} from '../../src/js/core/ports.js';
import { LifecycleScope } from '../../src/js/core/LifecycleScope.js';
import {
  AppError,
  ValidationError,
  AiServiceError,
  AiSafetyBlockError,
  CanvasRenderError,
  CanvasAreaExceededError,
  Context2DUnavailableError,
  FontLoadTimeoutError,
  FontLoadError,
  AsyncAbortedError,
  QuotaExceededError,
  StateSerializationError,
  PayloadTooLargeError,
  DecompressionBombError,
  AudioAutoplayBlockedError,
  HapticUnsupportedError,
  HistoryThrottledError,
  ClipboardPermissionError,
  WebShareDismissedError,
  StateMutationError,
  CyclicDispatchError
} from '../../src/js/core/errors.js';
import { StateStore, ActionTypes, deepFreeze } from '../../src/js/core/StateStore.js';

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

console.log('\n--- 1. Testing Abstract Port Contracts ---');

await test('ITickScheduler throws on direct abstract invocation', () => {
  const scheduler = new ITickScheduler();
  assert.throws(() => scheduler.requestTick(() => {}), /abstract method/);
  assert.throws(() => scheduler.cancelTick(1), /abstract method/);
});

await test('IMilestonePlanner throws on direct abstract invocation', async () => {
  const planner = new IMilestonePlanner();
  await assert.rejects(async () => planner.generatePlan('Goal', new Date()), /abstract method/);
});

await test('IRenderTarget throws on direct abstract property/method access', () => {
  const target = new IRenderTarget();
  assert.throws(() => target.width, /abstract getter/);
  assert.throws(() => { target.width = 100; }, /abstract setter/);
  assert.throws(() => target.height, /abstract getter/);
  assert.throws(() => { target.height = 100; }, /abstract setter/);
  assert.throws(() => target.getContext('2d'), /abstract method/);
  assert.throws(() => target.convertToBlob(), /abstract method/);
});

await test('IWallpaperRenderer throws on direct abstract invocation', async () => {
  const renderer = new IWallpaperRenderer();
  await assert.rejects(async () => renderer.renderWallpaper({}), /abstract method/);
  await assert.rejects(async () => renderer.exportBlob(), /abstract method/);
});

await test('IStateStoragePort throws on direct abstract invocation', () => {
  const storage = new IStateStoragePort();
  assert.throws(() => storage.saveEphemeral('key', 'val'), /abstract method/);
  assert.throws(() => storage.loadEphemeral('key'), /abstract method/);
  assert.throws(() => storage.replaceNavigationState('#hash'), /abstract method/);
});

await test('IPlatformLifecycle throws on direct abstract invocation', () => {
  const lifecycle = new IPlatformLifecycle();
  assert.throws(() => lifecycle.onWake(() => {}), /abstract method/);
  assert.throws(() => lifecycle.onSleep(() => {}), /abstract method/);
  assert.throws(() => lifecycle.isDocumentVisible(), /abstract method/);
});

await test('ISensoryCoordinator throws on direct abstract invocation', async () => {
  const sensory = new ISensoryCoordinator();
  await assert.rejects(async () => sensory.triggerMilestoneFeedback('theme-midnight'), /abstract method/);
  await assert.rejects(async () => sensory.triggerVictoryCelebration('theme-midnight'), /abstract method/);
  assert.throws(() => sensory.stopCelebration(), /abstract method/);
  assert.throws(() => sensory.dispose(), /abstract method/);
});

console.log('\n--- 2. Testing LifecycleScope RAII ---');

await test('LifecycleScope delegates AbortSignal and cleans up disposables', () => {
  const scope = new LifecycleScope();
  assert.equal(scope.signal.aborted, false);

  let cleaned1 = false;
  let cleaned2 = false;
  let cleaned3 = false;

  scope.register(() => { cleaned1 = true; });
  const unregister2 = scope.register(() => { cleaned2 = true; });
  scope.register(() => { cleaned3 = true; });

  unregister2();

  scope.dispose();

  assert.equal(scope.signal.aborted, true);
  assert.equal(cleaned1, true);
  assert.equal(cleaned2, false);
  assert.equal(cleaned3, true);
});

await test('LifecycleScope handles exceptions in disposables without crashing', () => {
  const scope = new LifecycleScope();
  let executedAfterError = false;

  scope.register(() => {
    throw new Error('Explosive disposal callback');
  });
  scope.register(() => {
    executedAfterError = true;
  });

  assert.doesNotThrow(() => scope.dispose());
  assert.equal(executedAfterError, true);
});

console.log('\n--- 3. Testing Domain Exception Hierarchy ---');

await test('All 21 domain error classes instantiate with correct codes and inheritance', () => {
  const classes = [
    [AppError, 'ERR_INTERNAL', ['msg', 'ERR_INTERNAL']],
    [ValidationError, 'ERR_VALIDATION', ['msg', 'ERR_VALIDATION', 'field', 'constraint']],
    [AiServiceError, 'ERR_AI_SERVICE', ['msg', 'ERR_AI_SERVICE', 503, true]],
    [AiSafetyBlockError, 'ERR_AI_SAFETY_BLOCK', ['msg', 'ERR_AI_SAFETY_BLOCK', 'hate', 'high']],
    [CanvasRenderError, 'ERR_CANVAS_RENDER', ['msg', 'ERR_CANVAS_RENDER', 100, 200]],
    [CanvasAreaExceededError, 'ERR_CANVAS_CEIL', ['msg', 'ERR_CANVAS_CEIL', 20000000, 16777216]],
    [Context2DUnavailableError, 'ERR_NO_CTX_2D', ['msg', 'ERR_NO_CTX_2D', 'main-canvas']],
    [FontLoadTimeoutError, 'ERR_FONT_TIMEOUT', ['msg', 'ERR_FONT_TIMEOUT', 'Inter', 2500]],
    [FontLoadError, 'ERR_FONT_LOAD_FAILED', ['msg', 'ERR_FONT_LOAD_FAILED', '16px Inter']],
    [AsyncAbortedError, 'ERR_ASYNC_ABORT', ['msg', 'ERR_ASYNC_ABORT', 'user-canceled', 12345]],
    [QuotaExceededError, 'ERR_STORAGE_FULL', ['msg', 'ERR_STORAGE_FULL', 'countdown_state']],
    [StateSerializationError, 'ERR_HASH_CORRUPT', ['msg', 'ERR_HASH_CORRUPT', '{bad-json}']],
    [PayloadTooLargeError, 'ERR_PAYLOAD_TOO_LARGE', ['msg', 'ERR_PAYLOAD_TOO_LARGE', 3000, 2048]],
    [DecompressionBombError, 'ERR_DECOMPRESSION_BOMB', ['msg', 'ERR_DECOMPRESSION_BOMB', 50000, 32768]],
    [AudioAutoplayBlockedError, 'ERR_AUDIO_LOCKED', ['msg', 'ERR_AUDIO_LOCKED', 'suspended']],
    [HapticUnsupportedError, 'ERR_HAPTIC_BLOCKED', ['msg', 'ERR_HAPTIC_BLOCKED', 'missing-hardware']],
    [HistoryThrottledError, 'ERR_HIST_THROTTLE', ['msg', 'ERR_HIST_THROTTLE', 35]],
    [ClipboardPermissionError, 'ERR_CLIP_DENIED', ['msg', 'ERR_CLIP_DENIED', 'denied']],
    [WebShareDismissedError, 'ERR_SHARE_ABORT', ['msg', 'ERR_SHARE_ABORT', true]],
    [StateMutationError, 'ERR_STATE_FROZEN', ['msg', 'ERR_STATE_FROZEN', 'MUTATE_ACTION']],
    [CyclicDispatchError, 'ERR_STATE_CYCLIC_DISPATCH', ['NESTED_ACTION', 11]]
  ];

  for (const [ErrClass, expectedCode, args] of classes) {
    const instance = new ErrClass(...args);
    assert.ok(instance instanceof Error);
    assert.ok(instance instanceof AppError);
    assert.equal(instance.code, expectedCode);
    assert.ok(instance.timestamp instanceof Date);
  }

  const cyclicErr = new CyclicDispatchError('DISPATCH_LOOP', 12);
  assert.ok(cyclicErr instanceof StateMutationError);
  assert.equal(cyclicErr.depth, 12);
});

console.log('\n--- 4. Testing StateStore Immutability, Queue & Sync ---');

await test('deepFreeze enforces recursive immutability', () => {
  const testObj = {
    nested: {
      items: [1, 2, { name: 'deep' }]
    }
  };
  deepFreeze(testObj);
  assert.ok(Object.isFrozen(testObj));
  assert.ok(Object.isFrozen(testObj.nested));
  assert.ok(Object.isFrozen(testObj.nested.items));
  assert.ok(Object.isFrozen(testObj.nested.items[2]));
  assert.throws(() => { testObj.nested.items[0] = 99; }, TypeError);
});

await test('StateStore initializes with frozen state and dispatches basic mutations', () => {
  const store = new StateStore({
    goalTitle: '',
    deadline: null,
    milestones: [],
    affirmation: '',
    selectedTheme: 'theme-midnight',
    isOverlayVisible: false,
    isPlanning: false,
    isExpired: false
  });

  const state1 = store.getState();
  assert.throws(() => { state1.goalTitle = 'Hack'; }, TypeError);

  store.dispatch({
    type: ActionTypes.SET_GOAL_INPUT,
    payload: { title: 'Launch Product', deadline: '2026-12-31T23:59:59Z' }
  });

  const state2 = store.getState();
  assert.equal(state2.goalTitle, 'Launch Product');
  assert.equal(state2.deadline, '2026-12-31T23:59:59Z');
  assert.notEqual(state1, state2);
});

await test('StateStore dispatches and handles milestone, theme, and overlay mutations', () => {
  const store = new StateStore({
    goalTitle: 'Test',
    deadline: null,
    milestones: [],
    selectedTheme: 'theme-midnight',
    isOverlayVisible: false
  });

  store.dispatch({
    type: ActionTypes.PLANNING_SUCCEEDED,
    payload: {
      milestones: [
        { id: 'm-1', title: 'Phase 1', targetOffsetRatio: 0.25, isCompleted: false },
        { id: 'm-2', title: 'Phase 2', targetOffsetRatio: 0.75, isCompleted: false }
      ],
      affirmation: 'You got this!'
    }
  });

  let state = store.getState();
  assert.equal(state.milestones.length, 2);
  assert.equal(state.affirmation, 'You got this!');

  store.dispatch({
    type: ActionTypes.TOGGLE_MILESTONE,
    payload: { id: 'm-1' }
  });

  state = store.getState();
  assert.equal(state.milestones[0].isCompleted, true);
  assert.equal(state.milestones[1].isCompleted, false);

  store.dispatch({
    type: ActionTypes.SET_THEME,
    payload: { themeId: 'theme-cyberpunk' }
  });
  assert.equal(store.getState().selectedTheme, 'theme-cyberpunk');

  store.dispatch({ type: ActionTypes.TOGGLE_OVERLAY });
  assert.equal(store.getState().isOverlayVisible, true);

  store.dispatch({ type: ActionTypes.GOAL_EXPIRED });
  assert.equal(store.getState().isExpired, true);
});

await test('StateStore subscribers receive batched microtask notification', async () => {
  const store = new StateStore({ count: 0 });
  let callCount = 0;
  let lastSeenState = null;

  const unsubscribe = store.subscribe((state) => {
    callCount++;
    lastSeenState = state;
  });

  store.dispatch({ type: ActionTypes.HYDRATE_URL_STATE, payload: { count: 1 } });
  store.dispatch({ type: ActionTypes.HYDRATE_URL_STATE, payload: { count: 2 } });

  assert.equal(callCount, 0);

  await new Promise((resolve) => queueMicrotask(resolve));

  assert.equal(callCount, 1);
  assert.equal(lastSeenState.count, 2);

  unsubscribe();
  store.dispatch({ type: ActionTypes.HYDRATE_URL_STATE, payload: { count: 3 } });
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(callCount, 1);
});

await test('StateStore trampoline queue serializes nested dispatches without re-entrancy drop', async () => {
  const store = new StateStore({ step: 0, chain: [] });

  store.subscribe((state) => {
    if (state.step === 1) {
      store.dispatch({
        type: ActionTypes.HYDRATE_URL_STATE,
        payload: { step: 2, chain: [...state.chain, 'second'] }
      });
    }
  });

  store.dispatch({
    type: ActionTypes.HYDRATE_URL_STATE,
    payload: { step: 1, chain: ['first'] }
  });

  await new Promise((resolve) => setTimeout(resolve, 10));

  const finalState = store.getState();
  assert.equal(finalState.step, 2);
  assert.deepEqual(finalState.chain, ['first', 'second']);
});

await test('StateStore detects cyclic dispatches and throws CyclicDispatchError', () => {
  const store = new StateStore({ loop: 0 });

  assert.throws(
    () => {
      store.dispatch({ type: 'CYCLE_TEST' });
    },
    (err) => {
      return err instanceof CyclicDispatchError && err.code === 'ERR_STATE_CYCLIC_DISPATCH';
    }
  );
});

await test('Cross-tab synchronization filters echo and hydrades external state', () => {
  class MockBroadcastChannel {
    static channels = new Map();
    constructor(name) {
      this.name = name;
      if (!MockBroadcastChannel.channels.has(name)) {
        MockBroadcastChannel.channels.set(name, new Set());
      }
      MockBroadcastChannel.channels.get(name).add(this);
      this.onmessage = null;
    }
    postMessage(data) {
      const peers = MockBroadcastChannel.channels.get(this.name) || new Set();
      for (const peer of peers) {
        if (peer !== this && peer.onmessage) {
          peer.onmessage({ data });
        }
      }
    }
    close() {
      const peers = MockBroadcastChannel.channels.get(this.name);
      if (peers) peers.delete(this);
    }
  }

  const originalBroadcastChannel = globalThis.BroadcastChannel;
  globalThis.BroadcastChannel = MockBroadcastChannel;

  try {
    const tabA = new StateStore({ goalTitle: 'Tab A Goal' });
    const tabB = new StateStore({ goalTitle: 'Tab B Initial' });

    tabA.enableCrossTabSync('test-sync-channel');
    tabB.enableCrossTabSync('test-sync-channel');

    tabA.dispatch({
      type: ActionTypes.SET_GOAL_INPUT,
      payload: { title: 'Synced Goal Across Tabs', deadline: '2026-11-25T00:00:00Z' }
    });

    assert.equal(tabB.getState().goalTitle, 'Synced Goal Across Tabs');
    assert.equal(tabA.getState().goalTitle, 'Synced Goal Across Tabs');

    tabA.destroy();
    tabB.destroy();
  } finally {
    globalThis.BroadcastChannel = originalBroadcastChannel;
  }
});

console.log(`\n========================================`);
console.log(`  Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
