/**
 * Unit Test Suite for Sprint 4 Batch 4.3: Progressive Web App & Production Deployment.
 * Verifies Service Worker caching policies, manifest.json validity, and CI/CD workflow definitions.
 *
 * @module test/unit/test_batch_4_3
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeUrl, classifyRequestStrategy } from '../../sw.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

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

console.log('\n--- Running Sprint 4 Batch 4.3 Unit Test Suite ---\n');

// 1. Service Worker URL Normalization Tests
it('Service Worker: normalizeUrl strips query-flood parameters', () => {
  const url1 = 'https://example.com/src/js/app.js?utm_source=twitter&utm_medium=social';
  assert.strictEqual(normalizeUrl(url1), 'https://example.com/src/js/app.js');

  const url2 = 'https://example.com/index.html?fbclid=IwAR3Xyz123';
  assert.strictEqual(normalizeUrl(url2), 'https://example.com/index.html');

  const url3 = 'http://localhost:8080/css/tokens.css';
  assert.strictEqual(normalizeUrl(url3), 'http://localhost:8080/css/tokens.css');
});

// 2. Service Worker Request Strategy Classifier Tests
it('Service Worker: classifyRequestStrategy correctly classifies request routing', () => {
  // 1. External Gemini API calls -> network-only
  const geminiReq = { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', mode: 'cors' };
  assert.strictEqual(classifyRequestStrategy(geminiReq), 'network-only');

  // 2. Navigation requests -> network-first
  const navReq = { url: 'https://example.com/', mode: 'navigate' };
  assert.strictEqual(classifyRequestStrategy(navReq), 'network-first');

  const htmlReq = { url: 'https://example.com/src/index.html', mode: 'cors' };
  assert.strictEqual(classifyRequestStrategy(htmlReq), 'network-first');

  // 3. Static assets -> stale-while-revalidate
  const jsReq = { url: 'https://example.com/src/js/app.js', mode: 'cors' };
  assert.strictEqual(classifyRequestStrategy(jsReq), 'stale-while-revalidate');

  const cssReq = { url: 'https://example.com/src/css/tokens.css', mode: 'cors' };
  assert.strictEqual(classifyRequestStrategy(cssReq), 'stale-while-revalidate');
});

// 3. Web App Manifest Tests
it('manifest.json: verifies PWA standalone schema and theme attributes', () => {
  const manifestPath = path.join(rootDir, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist at repository root');

  const rawJson = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(rawJson);

  assert.strictEqual(manifest.name, 'Countdown Lock Screen Challenge');
  assert.strictEqual(manifest.short_name, 'Countdown');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.orientation, 'portrait');
  assert.strictEqual(manifest.background_color, '#08090d');
  assert.strictEqual(manifest.theme_color, '#08090d');
  assert.ok(Array.isArray(manifest.icons), 'Manifest must contain icons array');
  assert.ok(manifest.icons.length >= 2, 'Manifest must declare at least 2 icon sizes');

  const hasMaskable = manifest.icons.some((i) => i.purpose && i.purpose.includes('maskable'));
  assert.ok(hasMaskable, 'Manifest must provide at least one maskable icon');
});

// 4. CI/CD Workflow Specification Tests
it('.github/workflows/ci.yml: verifies GitHub Actions automated testing and deployment definition', () => {
  const ciPath = path.join(rootDir, '.github/workflows/ci.yml');
  assert.ok(fs.existsSync(ciPath), '.github/workflows/ci.yml must exist');

  const ciContent = fs.readFileSync(ciPath, 'utf8');

  assert.ok(ciContent.includes('Continuous Integration & Automated Edge Deployment'));
  assert.ok(ciContent.includes('validate-and-test:'));
  assert.ok(ciContent.includes('deploy-to-edge:'));
  assert.ok(ciContent.includes('actions/configure-pages@v4'));
  assert.ok(ciContent.includes('actions/deploy-pages@v4'));
  assert.ok(ciContent.includes('node test/unit/test_batch_4_1.js'));
  assert.ok(ciContent.includes('node test/unit/test_batch_4_2.js'));
  assert.ok(ciContent.includes('node test/unit/test_batch_4_3.js'));
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) {
  process.exit(1);
}
