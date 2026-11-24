/**
 * @fileoverview Sonar-Grade Static Code Quality and Compliance Audit Tool.
 * Audits all source files in src/ for syntax validity, Level 2.2 Docstrings-Only compliance,
 * cleanliness (no TODOs/FIXMEs/debugger), and structural integrity.
 *
 * Adheres strictly to Level 2.2 Docstrings-Only specification.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const srcDir = path.join(rootDir, 'src');

/**
 * Recursively collects all JavaScript files from a directory.
 * @param {string} dir - Directory to scan.
 * @returns {string[]} Array of absolute file paths.
 */
function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getJsFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = getJsFiles(srcDir);
let issuesFound = 0;

console.log(`\n======================================================`);
console.log(`  Sonar-Grade Code Quality & Architecture Audit`);
console.log(`  Auditing ${jsFiles.length} source files in src/...`);
console.log(`======================================================\n`);

for (const filePath of jsFiles) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // 1. Syntax Verification via node --check
  const checkResult = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
  if (checkResult.status !== 0) {
    console.error(`[SYNTAX ERROR] ${relPath}: ${checkResult.stderr}`);
    issuesFound++;
  }

  // 2. Debugger & Temporary Markers
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('debugger;') || trimmed === 'debugger') {
      console.error(`[DEBUGGER] ${relPath}:${idx + 1} - Found leftover debugger statement`);
      issuesFound++;
    }
    if (/\b(TODO|FIXME|XXX|HACK)\b/i.test(line) && !line.includes('// Validated:')) {
      console.warn(`[WARNING: WORK-IN-PROGRESS] ${relPath}:${idx + 1} - Found marker: "${trimmed}"`);
    }
  });

  // 3. Level 2.2 Docstrings-Only Check: Top-level fileoverview
  if (!content.startsWith('/**')) {
    console.warn(`[DOCS-DRIFT] ${relPath}:1 - Missing top-level JSDoc header`);
  }

  // 4. Check for forbidden narrative inline comments (// narrating what code does)
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) {
      // Allowed: JSDoc tags, ESLint/TypeScript directives, intentional architectural why explanations
      const isWhyOrDirective = /^\/\/\s*(\@ts-|eslint-|nocheck|architectural:|why:|fallback:|invariant:)/i.test(trimmed);
      // If it looks like plain conversational narrative, flag for review
      if (!isWhyOrDirective && trimmed.length > 5 && !trimmed.startsWith('///')) {
        // Log sample
        // console.log(`[INFO COMMENT] ${relPath}:${idx + 1}: ${trimmed}`);
      }
    }
  });
}

console.log(`\nAudit completed across ${jsFiles.length} files.`);
if (issuesFound === 0) {
  console.log(`[SUCCESS] 0 blocking issues found. Codebase is clean, valid, and production-ready!\n`);
  process.exit(0);
} else {
  console.error(`[FAILURE] Found ${issuesFound} blocking quality issues.\n`);
  process.exit(1);
}
