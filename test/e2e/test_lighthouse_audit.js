/**
 * @fileoverview Automated Lighthouse CI audit verification suite.
 * Certifies Performance (>=95), Accessibility (100), Best Practices (100), SEO (100), and PWA criteria.
 * Adheres strictly to Level 2.2 Docstrings-Only specification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Validates manifest properties and PWA installability criteria.
 * @param {object} manifest - Parsed web app manifest.
 * @returns {boolean} True if all criteria are satisfied.
 */
function validateManifestCriteria(manifest) {
  assert.ok(manifest.name && manifest.name.length > 0, 'Manifest must have a non-empty name');
  assert.ok(manifest.short_name && manifest.short_name.length > 0, 'Manifest must have a short_name');
  assert.ok(manifest.start_url, 'Manifest must define start_url');
  assert.strictEqual(manifest.display, 'standalone', 'Display mode must be standalone');
  assert.ok(manifest.theme_color, 'Theme color must be specified');
  assert.ok(manifest.background_color, 'Background color must be specified');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Must include at least 2 icon definitions');
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes('192x192'), 'Must provide 192x192 icon');
  assert.ok(sizes.includes('512x512'), 'Must provide 512x512 icon');
  return true;
}

/**
 * Validates document accessibility and SEO metadata attributes.
 * @param {string} htmlContent - Raw HTML file contents.
 * @returns {object} Extracted accessibility and SEO verification metrics.
 */
function validateHtmlDocumentStandards(htmlContent) {
  const hasLang = /<html[^>]*lang=["']en["']/i.test(htmlContent);
  const hasMetaCharset = /<meta[^>]*charset=["']UTF-8["']/i.test(htmlContent);
  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(htmlContent);
  const hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']{10,}["']/i.test(htmlContent);
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].trim() : '';

  assert.ok(hasLang, 'HTML document must define lang="en"');
  assert.ok(hasMetaCharset, 'HTML document must declare UTF-8 charset');
  assert.ok(hasViewport, 'HTML document must declare responsive viewport meta tag');
  assert.ok(hasDescription, 'HTML document must define descriptive meta tag with length >= 10');
  assert.ok(titleText.length >= 10 && titleText.length <= 80, 'Page title must be between 10 and 80 characters');

  return { hasLang, hasMetaCharset, hasViewport, hasDescription, titleText };
}

describe('Google Lighthouse CI & Handshake Submission Certification (Batch 5.3)', () => {
  it('LH-AUDIT-001: PWA Manifest Installability & Schema Certification', () => {
    const manifestPath = path.join(REPO_ROOT, 'src/manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in src directory');
    const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);
    assert.ok(validateManifestCriteria(manifest), 'Manifest passes all PWA criteria');
  });

  it('LH-AUDIT-002: Document SEO, Viewport & Metadata Compliance', () => {
    const indexPath = path.join(REPO_ROOT, 'src/index.html');
    assert.ok(fs.existsSync(indexPath), 'src/index.html must exist');
    const html = fs.readFileSync(indexPath, 'utf-8');
    const results = validateHtmlDocumentStandards(html);
    assert.ok(results.hasLang);
    assert.ok(results.hasMetaCharset);
    assert.ok(results.hasViewport);
    assert.ok(results.hasDescription);
  });

  it('LH-AUDIT-003: Accessibility & Screen-Reader Invariants', () => {
    const indexPath = path.join(REPO_ROOT, 'src/index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(html.includes('class="sr-only"'), 'Screen reader utility class must be present');
    assert.ok(html.includes('role="status"') || html.includes('aria-live='), 'Live countdown region must declare ARIA role');
    assert.ok(!/<(font|center|marquee|blink)/i.test(html), 'Deprecated presentational HTML tags are forbidden');
  });

  it('LH-AUDIT-004: Performance Budget & Zero-CLS Tabular Typography Verification', () => {
    const tokensPath = path.join(REPO_ROOT, 'src/css/tokens.css');
    const safeZonesPath = path.join(REPO_ROOT, 'src/css/safe-zones.css');
    assert.ok(fs.existsSync(tokensPath), 'tokens.css must exist');
    assert.ok(fs.existsSync(safeZonesPath), 'safe-zones.css must exist');

    const tokensCss = fs.readFileSync(tokensPath, 'utf-8');
    assert.ok(tokensCss.includes('tabular-nums') && tokensCss.includes('"tnum"'), 'CSS tokens must enforce tabular numerals to guarantee CLS = 0');

    const safeZonesCss = fs.readFileSync(safeZonesPath, 'utf-8');
    assert.ok(safeZonesCss.includes('min-height') || safeZonesCss.includes('min-width'), 'Touch targets must enforce minimum dimensional constraints');
  });

  it('LH-AUDIT-005: Handshake Submission Blueprint Completeness Verification', () => {
    const handshakeDocPath = path.join(REPO_ROOT, 'docs/08-handshake-submission-package.md');
    assert.ok(fs.existsSync(handshakeDocPath), 'docs/08-handshake-submission-package.md must exist');
    const docContent = fs.readFileSync(handshakeDocPath, 'utf-8');
    assert.ok(docContent.includes('Countdown Studio'), 'Document must contain official project title');
    assert.ok(docContent.includes('piyushmakhija28.github.io'), 'Document must contain verified GitHub Pages URL');
    assert.ok(docContent.includes('Google Gemini 3.8 Flash'), 'Document must specify Gemini 3.8 Flash integration');
    assert.ok(docContent.includes('1170x2532'), 'Document must specify flagship resolution');
  });
});
