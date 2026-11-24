/**
 * Automated Unit Test Suite for Sprint 3 (Batch 3.3).
 * Verifies constants, themes, and CSS token architecture integrity.
 *
 * @module test/unit/test_design_tokens_and_themes
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FLAGSHIP_CANVAS_WIDTH,
  FLAGSHIP_CANVAS_HEIGHT,
  TOP_SAFE_ZONE_PERCENT,
  BOTTOM_SAFE_ZONE_PERCENT,
  WEBKIT_MAX_CANVAS_AREA,
  SYSTEM_CONSTANTS
} from '../../src/js/config/constants.js';

import {
  THEMES,
  getTheme,
  listThemes,
  applyThemeToDom
} from '../../src/js/config/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

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

console.log('=== Running Sprint 3 Batch 3.3 Unit Tests ===\n');

// 1. Constants Tests
runTest('constants: defines flagship canvas dimensions and safe-zone thresholds', () => {
  assert.equal(FLAGSHIP_CANVAS_WIDTH, 1170);
  assert.equal(FLAGSHIP_CANVAS_HEIGHT, 2532);
  assert.equal(TOP_SAFE_ZONE_PERCENT, 0.28);
  assert.equal(BOTTOM_SAFE_ZONE_PERCENT, 0.82);
  assert.equal(WEBKIT_MAX_CANVAS_AREA, 16777216);
  assert.ok(Object.isFrozen(SYSTEM_CONSTANTS), 'SYSTEM_CONSTANTS must be frozen');
});

runTest('constants: verifies temporal and rate limit bounds', () => {
  assert.equal(SYSTEM_CONSTANTS.GEMINI_MAX_RPM, 15);
  assert.equal(SYSTEM_CONSTANTS.GEMINI_MIN_PACING_MS, 2000);
  assert.equal(SYSTEM_CONSTANTS.GEMINI_TIMEOUT_MS, 4000);
  assert.equal(SYSTEM_CONSTANTS.HISTORY_RATE_LIMIT_BUCKET_SIZE, 30);
  assert.equal(SYSTEM_CONSTANTS.HISTORY_RATE_LIMIT_REFILL_RATE, 2);
  assert.equal(SYSTEM_CONSTANTS.URL_HASH_MAX_CHARS, 2048);
  assert.equal(SYSTEM_CONSTANTS.DECOMPRESSION_MAX_BYTES, 32768);
});

// 2. Themes Tests
runTest('themes: defines all 3 curated palettes with WCAG AAA and APCA certifications', () => {
  const themeIds = ['cyber_obsidian', 'deep_focus_zen', 'aurora_botanical'];

  for (const id of themeIds) {
    assert.ok(id in THEMES, `Theme ${id} must be defined`);
    const theme = THEMES[id];

    assert.equal(theme.id, id);
    assert.ok(typeof theme.name === 'string');
    assert.ok(theme.bgCanvas.startsWith('#'));
    assert.ok(theme.accentPrimary.startsWith('#'));
    assert.ok(theme.bgCanvasOklch.startsWith('oklch'));
    assert.ok(theme.accentPrimaryOklch.startsWith('oklch'));

    // Contrast verification
    assert.ok(theme.contrastRatio >= 7.0, `${id} contrast ratio ${theme.contrastRatio} must satisfy WCAG AAA (>= 7:1)`);
    assert.ok(theme.apcaLc >= 75.0, `${id} APCA Lc ${theme.apcaLc} must satisfy APCA (>= 75)`);
  }
});

runTest('themes: getTheme resolves theme by id and falls back to cyber_obsidian', () => {
  const zen = getTheme('deep_focus_zen');
  assert.equal(zen.id, 'deep_focus_zen');
  assert.equal(zen.name, 'Deep Focus Zen');

  const fallback = getTheme('non_existent_theme');
  assert.equal(fallback.id, 'cyber_obsidian');
});

runTest('themes: listThemes returns all 3 themes in an array', () => {
  const themes = listThemes();
  assert.equal(themes.length, 3);
  assert.ok(themes.some((t) => t.id === 'cyber_obsidian'));
  assert.ok(themes.some((t) => t.id === 'deep_focus_zen'));
  assert.ok(themes.some((t) => t.id === 'aurora_botanical'));
});

// 3. CSS Token Files Tests
runTest('CSS: tokens.css contains 8pt spatial grid, typography, and tabular numerals', () => {
  const cssPath = path.join(rootDir, 'src/css/tokens.css');
  assert.ok(fs.existsSync(cssPath), 'tokens.css must exist');

  const content = fs.readFileSync(cssPath, 'utf8');

  // 8pt grid tokens
  assert.ok(content.includes('--space-xs: 8px'));
  assert.ok(content.includes('--space-sm: 16px'));
  assert.ok(content.includes('--space-md: 24px'));

  // Tabular numerals
  assert.ok(content.includes('--font-numeric-tabular: tabular-nums'));
  assert.ok(content.includes('--font-feature-tnum: "tnum" 1'));

  // Theme blocks
  assert.ok(content.includes('[data-theme="cyber_obsidian"]'));
  assert.ok(content.includes('[data-theme="deep_focus_zen"]'));
  assert.ok(content.includes('[data-theme="aurora_botanical"]'));
});

runTest('CSS: safe-zones.css contains hardware exclusion corridors and Fitts touch target', () => {
  const cssPath = path.join(rootDir, 'src/css/safe-zones.css');
  assert.ok(fs.existsSync(cssPath), 'safe-zones.css must exist');

  const content = fs.readFileSync(cssPath, 'utf8');

  assert.ok(content.includes('--safe-zone-top-pct: 28%'));
  assert.ok(content.includes('--safe-zone-bottom-pct: 18%'));
  assert.ok(content.includes('.fitts-touch-target'));
  assert.ok(content.includes('--visual-viewport-h'));
});

runTest('CSS: glassmorphism.css contains GPU-promoted glass panel and Fresnel sheen', () => {
  const cssPath = path.join(rootDir, 'src/css/glassmorphism.css');
  assert.ok(fs.existsSync(cssPath), 'glassmorphism.css must exist');

  const content = fs.readFileSync(cssPath, 'utf8');

  assert.ok(content.includes('.glass-panel'));
  assert.ok(content.includes('backdrop-filter: blur(24px) saturate(190%)'));
  assert.ok(content.includes('transform: translateZ(0)'));
  assert.ok(content.includes('will-change: transform'));
  assert.ok(content.includes('prefers-reduced-transparency'));
  assert.ok(content.includes('.reduced-blur'));
});

console.log(`\nBatch 3.3 Tests Completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
