const fs = require('fs');
const path = require('path');
const root = __dirname;
const dist = path.join(root, 'dist');
const excluded = new Set(['dist', 'node_modules', '.git', '.netlify', 'package.json', 'package-lock.json', 'build.js', 'netlify.toml', 'README_DEPLOY.txt', 'OPEN_ME_FIRST.txt', 'README.txt', 'serve_website.py', 'start_website.sh', 'start_website.bat', 'bentley_outdoors_logo.png']);
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
function copyTree(from, to, isRoot=false) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (isRoot && excluded.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(dest, { recursive: true }); copyTree(src, dest, false); }
    else if (entry.isFile()) fs.copyFileSync(src, dest);
  }
}
copyTree(root, dist, true);
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('index.html missing from dist');
if (!fs.existsSync(path.join(dist, 'contact.html'))) throw new Error('contact.html missing from dist');
if (!fs.existsSync(path.join(dist, 'assets', 'brandLogo.png'))) throw new Error('brand logo missing from dist/assets');
console.log('Bentley Outdoors static site built successfully into dist/.');
