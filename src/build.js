// Simple build script placeholder
// This script will later process Pug templates and Markdown posts

const pug = require('pug');
const fs = require('fs-extra');
const path = require('path');

// Paths
const srcDir = path.join(__dirname);
const outDir = path.join(__dirname, '..', 'docs');
const indexPug = path.join(srcDir, 'index.pug');
const indexHtml = path.join(outDir, 'index.html');

// Ensure output directory exists
fs.ensureDirSync(outDir);

// Compile index.pug to HTML
const html = pug.renderFile(indexPug);
fs.writeFileSync(indexHtml, html);

console.log('Build script ready. Add your build logic here.');
console.log('index.pug processed and index.html generated in docs/');
