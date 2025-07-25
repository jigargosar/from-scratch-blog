const pug = require('pug')
const fs = require('fs-extra')
const path = require('path')
const commonmark = require('commonmark')
const matter = require('gray-matter')

function getPaths() {
  const baseSrc = path.join(__dirname, '..', 'src')
  const baseOut = path.join(baseSrc, '..', 'docs')
  const paths = {
    src: baseSrc,
    out: baseOut,
    assets: path.join(baseSrc, 'assets'),
    outAssets: path.join(baseOut, 'assets'),
    vendor: path.join(baseSrc, 'vendor'),
    outVendor: path.join(baseOut, 'vendor'),
    posts: path.join(baseSrc, 'posts'),
    outPosts: path.join(baseOut, 'posts'),
    indexPug: path.join(baseSrc, 'index.pug'),
    indexHtml: path.join(baseOut, 'index.html'),
    layoutPug: path.join(baseSrc, 'layout.pug'),
    postLayoutPug: path.join(baseSrc, 'post.pug'),
  }
  fs.emptyDirSync(paths.out)
  fs.ensureDirSync(paths.outAssets)
  fs.ensureDirSync(paths.outPosts)
  return paths
}

const paths = getPaths()

// Copy static files
;['assets', 'vendor'].forEach(dir => {
  const srcPath = path.join(paths.src, dir)
  const outPath = path.join(paths.out, dir)
  fs.copySync(srcPath, outPath)
  console.log(`Copied ${dir} folder to docs/${dir}`)
})


function getAssetPrefix(outPath, docsDir) {
  // Calculate relative path from outPath to docsDir
  const rel = path.relative(path.dirname(outPath), docsDir) || '.';
  return rel === '.' ? '' : rel + '/';
}

function buildPosts(paths) {
  const postFiles = fs.readdirSync(paths.posts).filter(f => f.endsWith('.md'))
  const reader = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer()
  const postsMeta = []

  postFiles.forEach(file => {
    const mdPath = path.join(paths.posts, file)
    const mdRaw = fs.readFileSync(mdPath, 'utf8')
    const mdParsed = matter(mdRaw)
    const mdContent = mdParsed.content
    const parsed = reader.parse(mdContent)
    const htmlContent = writer.render(parsed)
    const outFile = file.replace(/\.md$/, '.html')
    const outPath = path.join(paths.outPosts, outFile)

    const title = mdParsed.data.title || outFile
    const assetPrefix = getAssetPrefix(outPath, paths.out);
    const postHtml = pug.renderFile(paths.postLayoutPug, {
      pretty: true,
      postHtml: htmlContent,
      title,
      assetPrefix,
    })

    fs.writeFileSync(outPath, postHtml)
    postsMeta.push({
      title,
      url: 'posts/' + outFile,
    })
  })
  return postsMeta
}

// Build posts and get metadata
const postsMeta = buildPosts(paths)

// Compile index.pug to HTML with dynamic posts
const assetPrefix = '';
const html = pug.renderFile(paths.indexPug, { pretty: true, posts: postsMeta, assetPrefix })
fs.writeFileSync(paths.indexHtml, html)
console.log('index.pug processed and index.html generated in docs/')
