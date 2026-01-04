import { readdirSync, renameSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';

// Step 1: Rename all .js files to .cjs
const files = readdirSync(distDir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    const oldPath = join(distDir, file);
    const newPath = join(distDir, file.replace('.js', '.cjs'));
    renameSync(oldPath, newPath);
    console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
  }
});

// Step 2: Update require() statements in main.cjs
const mainPath = join(distDir, 'main.cjs');
let mainContent = readFileSync(mainPath, 'utf8');
mainContent = mainContent
  .replace(/require\("\.\/storage"\)/g, 'require("./storage.cjs")')
  .replace(/require\("\.\/util"\)/g, 'require("./util.cjs")');
writeFileSync(mainPath, mainContent);
console.log('Updated imports in main.cjs');

console.log('✓ Electron main process files ready');
