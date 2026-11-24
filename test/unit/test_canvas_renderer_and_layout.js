/**
 * Automated Unit Test Suite for Sprint 3 (Batch 3.2).
 * Verifies AdaptiveBufferAllocator, ResponsiveLayoutEngine, CanvasTextWrapper, and CanvasRenderer.
 *
 * @module test/unit/test_canvas_renderer_and_layout
 */

import assert from 'node:assert/strict';
import { AdaptiveBufferAllocator } from '../../src/js/canvas/AdaptiveBufferAllocator.js';
import { ResponsiveLayoutEngine } from '../../src/js/canvas/ResponsiveLayoutEngine.js';
import { CanvasTextWrapper } from '../../src/js/canvas/CanvasTextWrapper.js';
import { CanvasRenderer } from '../../src/js/canvas/CanvasRenderer.js';
import { Context2DUnavailableError } from '../../src/js/core/errors.js';

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

console.log('=== Running Sprint 3 Batch 3.2 Unit Tests ===\n');

// 1. AdaptiveBufferAllocator Tests
runTest('AdaptiveBufferAllocator: clamps to 4096px hardware dimension on constrained devices', () => {
  AdaptiveBufferAllocator.setMaxTextureDimension(4096);

  const buffer = AdaptiveBufferAllocator.computeOptimalBuffer(1170, 2532, 2.0);

  // At 2x, height would be 5064px > 4096px
  assert.ok(buffer.height <= 4096, `Height ${buffer.height} exceeds 4096 ceiling`);
  assert.ok(buffer.width <= 4096, `Width ${buffer.width} exceeds 4096 ceiling`);
  assert.equal(buffer.maxDimension, 4096);
  assert.ok(buffer.isConstrained, 'Buffer should be constrained by 4096px ceiling');
  assert.ok(buffer.totalPixels <= AdaptiveBufferAllocator.WEBKIT_MAX_AREA);
});

runTest('AdaptiveBufferAllocator: achieves full 2.0x supersampling when GPU supports 8192px', () => {
  AdaptiveBufferAllocator.setMaxTextureDimension(8192);

  const buffer = AdaptiveBufferAllocator.computeOptimalBuffer(1170, 2532, 2.0);

  assert.equal(buffer.scaleFactor, 2.0);
  assert.equal(buffer.width, 2340);
  assert.equal(buffer.height, 5064);
  assert.equal(buffer.isConstrained, false);
  assert.ok(buffer.totalPixels <= AdaptiveBufferAllocator.WEBKIT_MAX_AREA, 'Must satisfy 16.7M WebKit ceiling');
});

runTest('AdaptiveBufferAllocator: strictly enforces WebKit 16.7M px area ceiling on massive canvases', () => {
  AdaptiveBufferAllocator.setMaxTextureDimension(8192);

  // Base canvas already 16MP (4000x4000)
  const buffer = AdaptiveBufferAllocator.computeOptimalBuffer(4000, 4000, 2.0);

  assert.ok(buffer.totalPixels <= AdaptiveBufferAllocator.WEBKIT_MAX_AREA, `Total pixels ${buffer.totalPixels} exceeds 16.7M`);
  assert.ok(buffer.scaleFactor <= 1.05);
  assert.ok(buffer.isConstrained);

  AdaptiveBufferAllocator.resetCache();
});

// 2. ResponsiveLayoutEngine Tests
runTest('ResponsiveLayoutEngine: selects Wide Foldable regime (R < 1.70) with dual-column split', () => {
  // Galaxy Z Fold inner display: 1856x2160 (R = 1.164)
  const layout = ResponsiveLayoutEngine.computeLayout(1856, 2160);

  assert.equal(layout.regime, 'wide_foldable');
  assert.ok(layout.ratio < 1.70);
  assert.equal(layout.topSafeY, 2160 * 0.14);
  assert.equal(layout.bottomSafeY, 2160 * 0.88);

  // Dual-column geometry verification
  assert.ok(layout.heroBox.x < layout.milestoneBox.x, 'Hero must be left column, milestones right column');
  assert.notEqual(layout.heroBox.x, layout.milestoneBox.x);
});

runTest('ResponsiveLayoutEngine: selects Standard Smartphone regime (1.70 <= R < 2.15) with 28% top clearance', () => {
  // Standard phone 18:9 aspect ratio: 1080x2160 (R = 2.0)
  const layout = ResponsiveLayoutEngine.computeLayout(1080, 2160);

  assert.equal(layout.regime, 'standard_portrait');
  assert.equal(layout.topSafeY, 2160 * 0.28);
  assert.equal(layout.bottomSafeY, 2160 * 0.82);

  // Single-column stacked geometry
  assert.equal(layout.heroBox.x, layout.milestoneBox.x);
  assert.ok(layout.ringRadius <= 220, 'Ring radius must be clamped <= 220px');
});

runTest('ResponsiveLayoutEngine: selects Ultra-Tall regime (R >= 2.15) with expanded milestone ladder', () => {
  // Ultra-tall 21:9 phone: 1080x2400 (R = 2.22)
  const layout = ResponsiveLayoutEngine.computeLayout(1080, 2400);

  assert.equal(layout.regime, 'ultra_tall');
  assert.equal(layout.topSafeY, 2400 * 0.22);
  assert.equal(layout.bottomSafeY, 2400 * 0.84);
  assert.ok(layout.milestoneBox.height > layout.heroBox.height);
});

// 3. CanvasTextWrapper Tests
runTest('CanvasTextWrapper: wraps lines greedily without exceeding maxWidth', () => {
  const wrapper = new CanvasTextWrapper();
  const mockCtx = {
    font: '16px Inter',
    measureText: (text) => ({ width: text.length * 10 })
  };

  const text = 'Mastering the art of focus and execution';
  // With 10px per char, maxWidth 180 allows up to 18 chars per line
  const lines = wrapper.wrapText(mockCtx, text, 180);

  assert.ok(lines.length >= 2, 'Should wrap into multiple lines');
  for (const line of lines) {
    const width = line.length * 10;
    assert.ok(width <= 180, `Line "${line}" width ${width} exceeds maxWidth 180`);
  }
});

runTest('CanvasTextWrapper: caches measurements in LRU cache', () => {
  const wrapper = new CanvasTextWrapper(5);
  let measureCount = 0;
  const mockCtx = {
    font: '16px Inter',
    measureText: (text) => {
      measureCount++;
      return { width: text.length * 8 };
    }
  };

  const w1 = wrapper.measureText(mockCtx, 'Sample Text');
  const w2 = wrapper.measureText(mockCtx, 'Sample Text');

  assert.equal(w1, w2);
  assert.equal(measureCount, 1, 'Second measurement must hit LRU cache');
});

runTest('CanvasTextWrapper: fitText reduces font size until text fits within height bounds', () => {
  const wrapper = new CanvasTextWrapper();
  const mockCtx = {
    font: '16px Inter',
    measureText: (text) => ({ width: text.length * 10 })
  };

  const text = 'Focus and execute daily.';
  const result = wrapper.fitText(mockCtx, text, 200, 50, 24, 12);

  assert.ok(result.fontSize >= 12 && result.fontSize <= 24);
  assert.ok(result.lines.length > 0);
  assert.ok(result.totalHeight <= 50);
});

// 4. CanvasRenderer Tests
runTest('CanvasRenderer: throws Context2DUnavailableError if target does not support 2d context', () => {
  const faultyTarget = {
    getContext: () => null
  };

  assert.throws(
    () => new CanvasRenderer(faultyTarget),
    (err) => err instanceof Context2DUnavailableError && err.code === 'ERR_NO_CTX_2D'
  );
});

await runAsyncTest('CanvasRenderer: executes complete 9-stage offscreen wallpaper rasterization', async () => {
  const drawOps = [];

  const mockCtx = {
    setTransform: (a, b, c, d, e, f) => drawOps.push(`setTransform(${a})`),
    fillRect: (x, y, w, h) => drawOps.push(`fillRect(${x},${y},${w},${h})`),
    beginPath: () => drawOps.push('beginPath'),
    moveTo: (x, y) => drawOps.push(`moveTo(${x},${y})`),
    lineTo: (x, y) => drawOps.push(`lineTo(${x},${y})`),
    arc: (x, y, r, sa, ea) => drawOps.push(`arc(r=${r})`),
    stroke: () => drawOps.push('stroke'),
    fill: () => drawOps.push('fill'),
    fillText: (text, x, y) => drawOps.push(`fillText(${text})`),
    measureText: (text) => ({ width: text.length * 10 }),
    save: () => drawOps.push('save'),
    restore: () => drawOps.push('restore'),
    setLineDash: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(256 * 4) })
  };

  const mockTarget = {
    width: 0,
    height: 0,
    getContext: () => mockCtx,
    convertToBlob: async () => ({ size: 1024, type: 'image/png' })
  };

  AdaptiveBufferAllocator.setMaxTextureDimension(4096);
  const renderer = new CanvasRenderer({ target: mockTarget });

  await renderer.renderWallpaper({
    width: 1170,
    height: 2532,
    dpr: 2.0,
    theme: 'cyber_obsidian',
    title: 'Ship Final Product',
    timeRemaining: {
      days: 14,
      hours: 6,
      minutes: 30,
      seconds: 15,
      progressPercent: 50.0
    },
    milestones: [
      { id: 'm-1', step: 1, title: 'Phase 1: Architecture', completed: true },
      { id: 'm-2', step: 2, title: 'Phase 2: Core Build', completed: true },
      { id: 'm-3', step: 3, title: 'Phase 3: Validation', completed: false },
      { id: 'm-4', step: 4, title: 'Phase 4: Launch', completed: false }
    ],
    affirmation: 'Consistency turns small daily efforts into massive milestones.',
    showSafeZones: true
  });

  // Verify target buffer was allocated
  assert.ok(mockTarget.width > 0 && mockTarget.height > 0);

  // Verify rendering stages were recorded
  assert.ok(drawOps.some((op) => op.startsWith('setTransform')));
  assert.ok(drawOps.some((op) => op.startsWith('fillRect')));
  assert.ok(drawOps.some((op) => op.includes('arc(r=')));
  assert.ok(drawOps.some((op) => op.includes('fillText(14)')));
  assert.ok(drawOps.some((op) => op.includes('fillText(Phase 1: Architecture)')));

  // Verify blob export
  const blob = await renderer.exportBlob();
  assert.equal(blob.type, 'image/png');

  renderer.destroy();
});

console.log(`\nBatch 3.2 Tests Completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
