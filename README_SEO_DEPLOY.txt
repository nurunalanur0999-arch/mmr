BENTLEY OUTDOORS - SEO & QUALITY UPDATE
======================================

WHAT IS INCLUDED
- 19 styled HTML pages (including 404 and Privacy).
- Short, specific search-oriented English copy for Home, About, Services, Projects, Process, Contact, Service Areas and six service-detail pages.
- Unique SEO titles and meta descriptions, Open Graph/Twitter metadata, correctly labeled images and semantic headings.
- Visible, pre-rendered service/project/process content when JavaScript is unavailable.
- LocalBusiness and Service structured data; canonical URLs and XML sitemap generated using the REAL deployment URL at build time.
- Six matching project categories in both inquiry forms; 3 independent optional image upload fields per form (total 8 MB).
- Responsive styling, image loading improvements, privacy information, 404 page and noindex for confirmation/booking pages.
- Existing customer review slider, six service review forms, booking calendar and service area map retained.

GITHUB -> NETLIFY DEPLOYMENT
1. Extract GITHUB ZIP and upload all files (not the ZIP) into the ROOT of your GitHub repository.
2. Netlify Build command: npm run build
3. Netlify Publish directory: dist
4. Netlify Base directory: blank
5. Netlify -> Forms -> Enable form detection, then redeploy.
6. Netlify automatically provides its production URL in process.env.URL. The build generates canonical tags, social image URLs and sitemap.xml with that domain.
7. If you connect a custom domain, set SITE_URL=https://your-real-domain.example in Netlify environment variables, then redeploy. Replace .example with YOUR OWN real domain.
8. Visit https://YOUR_ACTUAL_DOMAIN/sitemap.xml and submit it to Google Search Console after verifying your domain.
9. Send a test project inquiry, test review and test booking request; verify all three in Netlify Forms, including Spam if needed.
10. Approved reviews are curated in assets/approved-reviews.json and publish to the slider after a GitHub commit and deploy. New reviews are NOT automatically posted without approval.

DIRECT MANUAL NETLIFY UPLOAD
- Use the separate DIRECT ZIP (compiled HTML + assets at its root) for drag-and-drop manual deploy.
- Manual ZIP does not contain a domain-specific sitemap/canonical because the user's live URL is unknown when the archive is built.
- For full automatic canonical/sitemap benefits, GitHub-linked Netlify deployment is recommended.

IMPORTANT LIMITATIONS / BUSINESS CONTROLS
- The website is a static website with Netlify Forms; forms require Netlify form detection and a live submission test.
- Calendar dates/times are PREFERRED requests, NOT verified free slots or instant confirmed bookings. The business must confirm; no online payment is collected.
- Basic ($99, 1 hour), Advanced ($199, 1 hour), Free Consultation (30 minutes) are based on the user's example prices. Verify the business wants these exact prices before publishing.
- Existing showcase images are design inspiration, not claimed completed customer projects.
- The geographic scope is based on the seven named Georgia areas supplied by the website owner.
- External map tiles and Facebook avatars may fail to load for some visitors; local fallbacks are present.
- No search ranking or AI recommendation placement can be guaranteed.

