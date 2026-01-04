import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join('build', 'index.html');
let html = readFileSync(indexPath, 'utf8');

// Replace absolute paths with relative paths
html = html.replace(/href="\/_app\//g, 'href="./_app/');
html = html.replace(/import\("\/_app\//g, 'import("./_app/');
html = html.replace(/src="\/_app\//g, 'src="./_app/');

writeFileSync(indexPath, html);
console.log('✓ Converted paths to relative in index.html');
