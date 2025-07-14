// Simple build script placeholder
// This script will later process Pug templates and Markdown posts

const pug = require('pug');
const fs = require('fs-extra');
const path = require('path');
const commonmark = require('commonmark');
const matter = require('gray-matter');

// Paths
const srcDir = path.join(__dirname);
const outDir = path.join(__dirname, '..', 'docs');
const indexPug = path.join(srcDir, 'index.pug');
const indexHtml = path.join(outDir, 'index.html');

// Ensure output directory exists
fs.ensureDirSync(outDir);

// Copy assets folder (fail if missing)
const srcAssets = path.join(__dirname, 'assets');
const docsAssets = path.join(__dirname, '..', 'docs', 'assets');
fs.copySync(srcAssets, docsAssets);
console.log('Copied assets folder to docs/assets');

// Markdown to HTML for posts
const postsSrcDir = path.join(srcDir, 'posts');
const postsOutDir = path.join(outDir, 'posts');
fs.ensureDirSync(postsOutDir);
const postFiles = fs.readdirSync(postsSrcDir).filter(f => f.endsWith('.md'));
const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();

const postsMeta = [];

postFiles.forEach(file => {
  const mdPath = path.join(postsSrcDir, file);
  const mdRaw = fs.readFileSync(mdPath, 'utf8');
  const mdParsed = matter(mdRaw);
  const mdContent = mdParsed.content;
  const parsed = reader.parse(mdContent);
  const htmlContent = writer.render(parsed);
  const outFile = file.replace(/\.md$/, '.html');
  const outPath = path.join(postsOutDir, outFile);

  // Determine layout
  let layoutFile = mdParsed.data.layout ? path.join(srcDir, mdParsed.data.layout) : path.join(srcDir, 'post.pug');
  if (!fs.existsSync(layoutFile)) {
    console.warn(`Layout file ${layoutFile} not found. Using default post.pug.`);
    layoutFile = path.join(srcDir, 'post.pug');
  }

  // Render with layout
  const postHtml = pug.renderFile(layoutFile, {
    pretty: true,
    postHtml: htmlContent,
    title: mdParsed.data.title || outFile
  });
  fs.writeFileSync(outPath, postHtml);
  postsMeta.push({
    title: mdParsed.data.title || outFile,
    url: 'posts/' + outFile
  });
  console.log(`${file} converted to HTML in docs/posts using ${path.basename(layoutFile)}.`);
});

// Compile index.pug to HTML with dynamic posts
const html = pug.renderFile(indexPug, { pretty: true, posts: postsMeta });
fs.writeFileSync(indexHtml, html);
console.log('index.pug processed and index.html generated in docs/');

console.log('Build script ready. Add your build logic here.');
