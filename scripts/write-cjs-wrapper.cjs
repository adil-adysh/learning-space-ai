const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const dist = 'dist';
try {
  mkdirSync(dist, { recursive: true });
} catch {}

const content = `// Auto-generated CommonJS wrapper to dynamically import ESM main
(async () => {
  try {
    await import('./main.js');
  } catch (err) {
    console.error('Failed to load ESM main:', err);
    process.exit(1);
  }
})();
`;

writeFileSync(join(dist, 'main.cjs'), content, 'utf8');
console.log('Wrote dist/main.cjs wrapper');
