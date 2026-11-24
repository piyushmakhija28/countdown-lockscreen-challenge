/**
 * Automated Unit Test Suite for Sprint 2 (Batch 2.3).
 * Verifies DualClockTimeEngine, WorkerTickerAdapter, and MilestoneManager.
 *
 * @module test/unit/test_time_engine_and_milestones
 */

import assert from 'node:assert/strict';
import { DualClockTimeEngine } from '../../src/js/core/DualClockTimeEngine.js';
import { WorkerTickerAdapter } from '../../src/js/services/WorkerTickerAdapter.js';
import { MilestoneManager } from '../../src/js/core/MilestoneManager.js';
import { ITickScheduler, IPlatformLifecycle } from '../../src/js/core/ports.js';

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

/**
 * Mock tick scheduler for deterministic manual tick driving.
 */
class ManualTickScheduler extends ITickScheduler {
  constructor() {
    super();
    this.callbacks = new Map();
    this.handleCounter = 0;
  }
  requestTick(callback) {
    const handle = ++this.handleCounter;
    this.callbacks.set(handle, callback);
    return handle;
  }
  cancelTick(handle) {
    this.callbacks.delete(handle);
  }
  triggerAll(timestamp = Date.now()) {
    const cbs = Array.from(this.callbacks.values());
    for (const cb of cbs) {
      cb(timestamp);
    }
  }
}

console.log('\n--- 1. Testing DualClockTimeEngine ---');

await test('DualClockTimeEngine calculates remaining time snapshot accurately', () => {
  const scheduler = new ManualTickScheduler();
  const engine = new DualClockTimeEngine(scheduler);

  const refTime = new Date('2026-11-24T00:00:00.000Z');
  const deadline = new Date('2026-11-26T04:15:30.000Z');

  const remaining = engine.calculateRemaining(deadline, refTime);

  assert.equal(remaining.days, 2);
  assert.equal(remaining.hours, 4);
  assert.equal(remaining.minutes, 15);
  assert.equal(remaining.seconds, 30);
  assert.equal(remaining.totalMilliseconds, (2 * 86400 + 4 * 3600 + 15 * 60 + 30) * 1000);
});

await test('DualClockTimeEngine starts ticker and emits frame updates', () => {
  const scheduler = new ManualTickScheduler();
  const engine = new DualClockTimeEngine(scheduler);

  let tickCount = 0;
  let lastSeen = null;
  const futureDeadline = new Date(Date.now() + 100000);

  engine.startTicker(
    futureDeadline,
    (rem) => {
      tickCount++;
      lastSeen = rem;
    },
    () => {}
  );

  assert.equal(engine.isRunning, true);
  assert.equal(tickCount, 1);
  assert.ok(lastSeen.totalMilliseconds > 0);

  scheduler.triggerAll();
  assert.equal(tickCount, 2);

  engine.stopTicker();
  assert.equal(engine.isRunning, false);
});

await test('DualClockTimeEngine invokes onExpire when deadline has lapsed', () => {
  const scheduler = new ManualTickScheduler();
  const engine = new DualClockTimeEngine(scheduler);

  let expired = false;
  const pastDeadline = new Date(Date.now() - 5000);

  engine.startTicker(
    pastDeadline,
    () => {},
    () => { expired = true; }
  );

  assert.equal(expired, true);
  assert.equal(engine.isExpired, true);
  assert.equal(engine.isRunning, false);
});

await test('DualClockTimeEngine enforces Target-Bound Chronometer Reset Invariant', () => {
  const scheduler = new ManualTickScheduler();
  const engine = new DualClockTimeEngine(scheduler);

  let expireCalled = 0;
  let tickCount = 0;

  const pastDate = new Date(Date.now() - 1000);
  engine.startTicker(
    pastDate,
    () => { tickCount++; },
    () => { expireCalled++; }
  );

  assert.equal(expireCalled, 1);
  assert.equal(engine.isExpired, true);

  const futureDate = new Date(Date.now() + 60000);
  engine.setDeadline(futureDate);

  assert.equal(engine.isExpired, false);
  assert.equal(engine.isRunning, true);

  scheduler.triggerAll();
  assert.ok(tickCount >= 2);

  engine.stopTicker();
});

await test('DualClockTimeEngine reanchors upon platform wake event', () => {
  let wakeCallback = null;
  const mockLifecycle = {
    onWake: (cb) => {
      wakeCallback = cb;
      return () => { wakeCallback = null; };
    },
    onSleep: () => () => {},
    isDocumentVisible: () => true
  };

  const scheduler = new ManualTickScheduler();
  const engine = new DualClockTimeEngine(scheduler, mockLifecycle);

  assert.ok(typeof wakeCallback === 'function');

  let tickCount = 0;
  engine.startTicker(
    new Date(Date.now() + 50000),
    () => { tickCount++; },
    () => {}
  );

  assert.equal(tickCount, 1);

  wakeCallback();
  assert.equal(tickCount, 2);

  engine.dispose();
});

console.log('\n--- 2. Testing WorkerTickerAdapter ---');

await test('WorkerTickerAdapter schedules and cancels ticks with fallback support', async () => {
  const adapter = new WorkerTickerAdapter();
  assert.ok(adapter instanceof ITickScheduler);

  let called = false;
  const handle = adapter.requestTick((ts) => {
    called = true;
    assert.ok(typeof ts === 'number');
  });

  assert.ok(typeof handle === 'number');
  assert.ok(handle > 0);

  adapter.cancelTick(handle);
  adapter.dispose();
});

console.log('\n--- 3. Testing MilestoneManager ---');

await test('MilestoneManager orders milestones monotonically (AI-02 Inverted Guard)', () => {
  const manager = new MilestoneManager();

  manager.setMilestones([
    { id: 'm-3', step: 3, title: 'Final Launch', targetOffsetRatio: 0.9, isCompleted: false },
    { id: 'm-1', step: 1, title: 'Scope Kickoff', targetOffsetRatio: 0.1, isCompleted: true },
    { id: 'm-2', step: 2, title: 'Midway Demo', targetOffsetRatio: 0.5, isCompleted: false }
  ]);

  const sorted = manager.getMilestones();
  assert.equal(sorted.length, 3);
  assert.equal(sorted[0].id, 'm-1');
  assert.equal(sorted[1].id, 'm-2');
  assert.equal(sorted[2].id, 'm-3');
});

await test('MilestoneManager toggles completion state idempotently', () => {
  const manager = new MilestoneManager([
    { id: 'ms-1', title: 'Task Alpha', isCompleted: false },
    { id: 'ms-2', title: 'Task Beta', isCompleted: true }
  ]);

  assert.equal(manager.completedCount, 1);
  assert.equal(manager.totalCount, 2);
  assert.equal(manager.completionRatio, 0.5);

  const toggled = manager.toggleMilestone('ms-1');
  assert.equal(toggled, true);
  assert.equal(manager.completedCount, 2);
  assert.equal(manager.completionRatio, 1.0);

  const nonExistent = manager.toggleMilestone('invalid-id');
  assert.equal(nonExistent, false);
});

await test('MilestoneManager enforces INV-012 Zero-Duration Arc Guard', () => {
  const manager = new MilestoneManager([
    { id: 'ms-1', title: 'Check 1', isCompleted: false }
  ]);

  const now = new Date('2026-11-24T12:00:00Z');
  const pastDeadline = new Date('2026-11-24T11:00:00Z');

  const zeroDurationProgress = manager.calculateProgress(now, pastDeadline, now);
  assert.equal(zeroDurationProgress, 100.0);

  const sameTimeProgress = manager.calculateProgress(now, now, now);
  assert.equal(sameTimeProgress, 100.0);
});

await test('MilestoneManager calculates blended aggregate progress percentage', () => {
  const manager = new MilestoneManager([
    { id: 'ms-1', title: 'Step 1', isCompleted: true },
    { id: 'ms-2', title: 'Step 2', isCompleted: false }
  ]);

  const start = new Date('2026-11-20T00:00:00Z');
  const end = new Date('2026-11-30T00:00:00Z');
  const mid = new Date('2026-11-25T00:00:00Z');

  const progress = manager.calculateProgress(start, end, mid);

  assert.equal(progress, 50.0);
});

console.log(`\n========================================`);
console.log(`  Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}
