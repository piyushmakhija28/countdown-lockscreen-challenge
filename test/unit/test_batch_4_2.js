/**
 * Unit Test Suite for Sprint 4 Batch 4.2: Ergonomic UI Shell & Safe-Zone Simulator.
 * Verifies SafeZoneOverlay geometry and guides, and CountdownApp compositional root.
 *
 * @module test/unit/test_batch_4_2
 */

import assert from 'node:assert';
import { SafeZoneOverlay } from '../../src/js/canvas/SafeZoneOverlay.js';
import { CountdownApp } from '../../src/js/app.js';

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

/**
 * Mock 2D Canvas rendering context for testing guide overlays.
 */
function createMockCanvasContext() {
  const operations = [];
  return {
    operations,
    save() { operations.push('save'); },
    restore() { operations.push('restore'); },
    fillRect(x, y, w, h) { operations.push(`fillRect(${x},${y},${w},${h})`); },
    strokeRect(x, y, w, h) { operations.push(`strokeRect(${x},${y},${w},${h})`); },
    beginPath() { operations.push('beginPath'); },
    moveTo(x, y) { operations.push(`moveTo(${x},${y})`); },
    lineTo(x, y) { operations.push(`lineTo(${x},${y})`); },
    stroke() { operations.push('stroke'); },
    fill() { operations.push('fill'); },
    fillText(text, x, y) { operations.push(`fillText("${text}",${x},${y})`); },
    setLineDash(dash) { operations.push(`setLineDash([${dash.join(',')}])`); },
    roundRect(x, y, w, h, r) { operations.push(`roundRect(${x},${y},${w},${h},${r})`); }
  };
}

console.log('\n--- Running Sprint 4 Batch 4.2 Unit Test Suite ---\n');

// 1. SafeZoneOverlay Tests
it('SafeZoneOverlay: manages visibility toggle and state correctly', () => {
  const overlay = new SafeZoneOverlay();
  assert.strictEqual(overlay.isVisible(), false);

  assert.strictEqual(overlay.toggle(), true);
  assert.strictEqual(overlay.isVisible(), true);

  assert.strictEqual(overlay.toggle(), false);
  assert.strictEqual(overlay.isVisible(), false);

  overlay.setVisible(true);
  assert.strictEqual(overlay.isVisible(), true);
});

it('SafeZoneOverlay: computes exact 28% top and 18% bottom safe text bounds', () => {
  const overlay = new SafeZoneOverlay();
  const bounds = overlay.getSafeTextBounds(1170, 2532);

  // Top boundary = 0.28 * 2532 = 708.96
  assert.strictEqual(Math.round(bounds.top), 709);
  // Bottom boundary = 0.82 * 2532 = 2076.24
  assert.strictEqual(Math.round(bounds.bottom), 2076);
  // Safe height = 54% = 1367.28
  assert.strictEqual(Math.round(bounds.safeHeight), 1367);

  // Left boundary = 0.06 * 1170 = 70.2
  assert.strictEqual(Math.round(bounds.left), 70);
  // Right boundary = 0.94 * 1170 = 1099.8
  assert.strictEqual(Math.round(bounds.right), 1100);
});

it('SafeZoneOverlay: draws guides when visible and skips when hidden', () => {
  const overlay = new SafeZoneOverlay();
  const mockCtx = createMockCanvasContext();

  // Hidden: zero canvas calls
  overlay.drawGuides(mockCtx, 1170, 2532);
  assert.strictEqual(mockCtx.operations.length, 0);

  // Visible: renders exclusion corridors and simulators
  overlay.setVisible(true);
  overlay.drawGuides(mockCtx, 1170, 2532);
  assert.ok(mockCtx.operations.length > 10, 'Must record canvas operations for guides');
  assert.ok(mockCtx.operations.some((op) => op.includes('fillText("SYSTEM STATUS BAR')));
  assert.ok(mockCtx.operations.some((op) => op.includes('fillText("GESTURE NAVIGATION')));
  assert.ok(mockCtx.operations.some((op) => op.includes('fillText("SAFE CONTENT ZONE')));
});

// 2. CountdownApp Compositional Root Tests
await itAsync('CountdownApp: instantiates and boots with default state in headless environment', async () => {
  const mockSensory = {
    triggerMilestoneFeedback: async () => ({ success: true }),
    triggerVictoryCelebration: async () => ({ success: true }),
    dispose: () => {}
  };

  const app = new CountdownApp({
    sensoryCoordinator: mockSensory
  });

  const booted = await app.init();
  assert.strictEqual(booted, true);

  const state = app.getState();
  assert.strictEqual(state.goalTitle, 'Master AI Skills Studio Challenge');
  assert.strictEqual(state.selectedTheme, 'cyber_obsidian');
  assert.strictEqual(state.milestones.length, 4);
  assert.strictEqual(state.isExpired, false);

  app.dispose();
});

await itAsync('CountdownApp: toggles milestone and triggers sensory feedback', async () => {
  let milestoneFeedbackCalled = false;
  const mockSensory = {
    triggerMilestoneFeedback: async (themeId) => {
      milestoneFeedbackCalled = true;
      assert.strictEqual(themeId, 'cyber_obsidian');
      return { success: true };
    },
    triggerVictoryCelebration: async () => ({ success: true }),
    dispose: () => {}
  };

  const app = new CountdownApp({
    sensoryCoordinator: mockSensory
  });

  await app.init();
  const initialMilestones = app.getState().milestones;
  const targetId = initialMilestones[0].id;
  const initialCompleted = initialMilestones[0].isCompleted;

  await app.toggleMilestone(targetId);

  assert.strictEqual(milestoneFeedbackCalled, true);
  const updatedMilestones = app.getState().milestones;
  const targetMilestone = updatedMilestones.find((m) => m.id === targetId);
  assert.strictEqual(targetMilestone.isCompleted, !initialCompleted);

  app.dispose();
});

it('CountdownApp: updates theme palette and safe-zone visibility', async () => {
  const app = new CountdownApp();
  await app.init();

  app.setTheme('aurora_botanical');
  assert.strictEqual(app.getState().selectedTheme, 'aurora_botanical');

  const visible1 = app.toggleSafeZones();
  assert.strictEqual(visible1, true);

  const visible2 = app.toggleSafeZones();
  assert.strictEqual(visible2, false);

  app.dispose();
});

await itAsync('CountdownApp: generates AI plan and updates store milestones and affirmation', async () => {
  const mockAiClient = {
    async generatePlan(goalTitle, deadline) {
      return {
        milestones: [
          { id: 'm-ai-1', title: 'Complete Sprint 4', targetOffsetRatio: 0.75, isCompleted: false },
          { id: 'm-ai-2', title: 'Verify Lighthouse Score', targetOffsetRatio: 0.50, isCompleted: false },
          { id: 'm-ai-3', title: 'Final Handshake Package', targetOffsetRatio: 0.25, isCompleted: false },
          { id: 'm-ai-4', title: 'Deploy Live App', targetOffsetRatio: 0.0, isCompleted: false }
        ],
        affirmation: 'Precision execution creates masterpiece software.'
      };
    }
  };

  const app = new CountdownApp({
    geminiClient: mockAiClient
  });

  await app.init();
  const planGenerated = await app.generateAiPlan();
  assert.strictEqual(planGenerated, true);

  const state = app.getState();
  assert.strictEqual(state.milestones.length, 4);
  assert.strictEqual(state.milestones[0].title, 'Complete Sprint 4');
  assert.strictEqual(state.affirmation, 'Precision execution creates masterpiece software.');

  app.dispose();
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
