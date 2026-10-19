const fs = require('fs');
const path = require('path');
const root = __dirname;
const dist = path.join(root, 'dist');
const excluded = new Set(['dist', 'node_modules', '.git', '.netlify', 'package.json', 'package-lock.json', 'build.js', 'netlify.toml', 'README_DEPLOY.txt', 'README_SEO_DEPLOY.txt', 'OPEN_ME_FIRST.txt', 'README.txt', 'serve_website.py', 'start_website.sh', 'start_website.bat', 'bentley_outdoors_logo.png']);
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
function copyTree(from, to, isRoot=false) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (isRoot && (excluded.has(entry.name) || /\.(?:txt|md|bat|sh|py)$/i.test(entry.name))) continue;
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

// The correct public URL is supplied automatically by Netlify's URL environment
// variable or explicitly with SITE_URL when using a custom domain. Never
// hardcode a temporary/staging site URL into Google canonical references.
function getPublicOrigin() {
  for (const value of [process.env.SITE_URL, process.env.URL]) {
    if (!value) continue;
    try {
      const url = new URL(value.trim());
      if (url.protocol === 'https:' && url.hostname && !url.hostname.includes('localhost')) return url.origin;
    } catch (e) {}
  }
  return null;
}
const origin = getPublicOrigin();
const business = {
  '@context': 'https://schema.org',
  '@type': 'LandscapingBusiness',
  'name': 'Bentley Outdoors',
  'description': 'Landscape maintenance, installation, irrigation, landscape design, garden design and outdoor projects in north metro Atlanta, Georgia.',
  'telephone': '+14044878165',
  'email': 'ebentley@bentoutdoors.com',
  'address': {'@type':'PostalAddress','addressLocality':'Acworth','addressRegion':'GA','addressCountry':'US'},
  'areaServed': ['Acworth','Kennesaw','Marietta','Roswell','Canton','Alpharetta','Buckhead'].map(name=>({'@type':'Place','name':name+', Georgia'})),
  'sameAs': ['https://www.facebook.com/profile.php?id=61556319995759']
};
if (origin) {
  business.url = origin + '/';
  business.logo = origin + '/assets/brandLogo.png';
  business['@id'] = origin + '/#business';
}
const servicePages = {
  'service-maintenance.html': 'Landscape maintenance',
  'service-installation.html': 'Landscape installation',
  'service-irrigation.html': 'Garden irrigation',
  'service-landscape-design.html': 'Landscape design',
  'service-garden-design.html': 'Garden design',
  'service-anything-outdoors.html': 'Custom outdoor projects'
};
const noindex = new Set(['404.html','success.html','review-success.html','booking-success.html','booking.html']);
const indexable = ['index.html','about.html','services.html','projects.html','process.html','service-areas.html','contact.html','privacy.html', ...Object.keys(servicePages)];
const image = '/assets/heroBannerHilltop.jpg';
function escapeAttr(text) { return String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
for (const file of fs.readdirSync(dist).filter(x=>x.endsWith('.html'))) {
  const filename = path.join(dist,file);
  let html = fs.readFileSync(filename, 'utf8');
  let headExtras = '';
  if (origin && !noindex.has(file)) {
    const url = origin + (file==='index.html' ? '/' : '/'+file);
    headExtras += `<link rel="canonical" href="${escapeAttr(url)}">`;
    headExtras += `<meta property="og:url" content="${escapeAttr(url)}">`;
    headExtras += `<meta property="og:image" content="${escapeAttr(origin+image)}">`;
    headExtras += `<meta name="twitter:image" content="${escapeAttr(origin+image)}">`;
  }
  if (file==='index.html') {
    headExtras += `<script type="application/ld+json">${JSON.stringify(business)}</script>`;
  } else if (servicePages[file]) {
    const schema = {'@context':'https://schema.org','@type':'Service','name':servicePages[file],
      'provider': origin? {'@id': origin + '/#business'} : {'@type':'LandscapingBusiness','name':'Bentley Outdoors'},
      'areaServed': business.areaServed};
    headExtras += `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }
  if (!html.includes('</head>')) throw new Error('Invalid HTML head: '+file);
  html = html.replace('</head>',headExtras+'</head>');
  fs.writeFileSync(filename,html);
}
// Search-engine sitemap requires absolute URLs. It is generated only when a
// verified deployment origin exists; see Google Search Central.
if (origin) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    indexable.map(file=>`  <url><loc>${origin}${file==='index.html' ? '/' : '/'+file}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(dist,'sitemap.xml'),xml);
}
fs.writeFileSync(path.join(dist,'robots.txt'), 'User-agent: *\nAllow: /\n' + (origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''));
console.log('Bentley Outdoors built to dist/ with '+(origin?'public canonical URLs and XML sitemap':'local preview SEO metadata (set SITE_URL or deploy on Netlify for sitemap)')+'.');
