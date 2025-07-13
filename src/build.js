// Simple build script placeholder
// This script will later process Pug templates and Markdown posts

const pug = require('pug');
const fs = require('fs-extra');
const path = require('path');
const commonmark = require('commonmark');

// Paths
const srcDir = path.join(__dirname);
const outDir = path.join(__dirname, '..', 'docs');
const indexPug = path.join(srcDir, 'index.pug');
const indexHtml = path.join(outDir, 'index.html');

// Ensure output directory exists
fs.ensureDirSync(outDir);

// Compile index.pug to HTML
const html = pug.renderFile(indexPug, { pretty: true });
fs.writeFileSync(indexHtml, html);
console.log('index.pug processed and index.html generated in docs/');

// Markdown to HTML for posts
const postsSrcDir = path.join(srcDir, 'posts');
const postsOutDir = path.join(outDir, 'posts');
fs.ensureDirSync(postsOutDir);
const postFiles = fs.readdirSync(postsSrcDir).filter(f => f.endsWith('.md'));
const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();

postFiles.forEach(file => {
  const mdPath = path.join(postsSrcDir, file);
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const parsed = reader.parse(mdContent);
  const htmlContent = writer.render(parsed);
  const outPath = path.join(postsOutDir, file.replace(/\.md$/, '.html'));
  fs.writeFileSync(outPath, htmlContent);
  console.log(`${file} converted to HTML in docs/posts.`);
});

console.log('Build script ready. Add your build logic here.');
