'use strict';
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', 'dist');

function isRelativeImport(p) {
  return p.startsWith('./') || p.startsWith('../');
}

function shouldSkipExt(p) {
  return (
    p.endsWith('.js') ||
    p.endsWith('.cjs') ||
    p.endsWith('.mjs') ||
    p.endsWith('.json') ||
    p.endsWith('.css') ||
    p.endsWith('.svg')
  );
}

function fixContent(content) {
  // replace patterns: from '...'; import '...'; import('...') ; export ... from '...'
  // Match relative import/export specifiers like './foo' or '../bar/baz'
  const patterns = [
    /from\s+(['"])(\.[^'"\n]*?)\1/g,
    /import\s+(['"])(\.[^'"\n]*?)\1/g,
    /import\(\s*(['"])(\.[^'"\n]*?)\1\s*\)/g,
    /export\s+[^\n]*?from\s+(['"])(\.[^'"\n]*?)\1/g,
  ];

  let out = content;
  for (const re of patterns) {
    out = out.replace(re, (match, q, p) => {
      if (!isRelativeImport(p) || shouldSkipExt(p)) {
        return match;
      }
      const fixed = `${p}.js`;
      return match.replace(p, fixed);
    });
  }
  return out;
}

function walkAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkAndFix(full);
      continue;
    }
    if (!e.name.endsWith('.js')) continue;
    if (e.name.endsWith('.cjs')) continue;
    const raw = fs.readFileSync(full, 'utf8');
    const fixed = fixContent(raw);
    if (fixed !== raw) {
      fs.writeFileSync(full, fixed, 'utf8');
      console.log('Patched imports in', full);
    }
  }
}

if (!fs.existsSync(DIR)) {
  console.error('dist directory not found, skipping import patching');
  process.exit(0);
}

try {
  walkAndFix(DIR);
  console.log('Import patching complete');
} catch (err) {
  console.error('Failed patching imports:', err);
  process.exit(1);
}
