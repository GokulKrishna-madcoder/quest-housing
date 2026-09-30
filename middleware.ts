const BASE = 'https://questhousing.vercel.app';

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Let static assets, API routes, and files with extensions pass through
  if (path.includes('.') || path.startsWith('/api/') || path.startsWith('/assets/') || path.startsWith('/_next/')) {
    return;
  }

  // Fetch the real index.html — this is the actual React app
  let html: string;
  try {
    const res = await fetch(new URL('/index.html', request.url).toString());
    if (!res.ok) return;
    html = await res.text();
  } catch {
    return; // fallback to normal Vercel routing
  }

  // Default meta
  let title = 'Quest Housing | Premium Rental Homes in Bangalore';
  let desc = 'Quest Housing offers zero upfront cost, premium rentals, and 100% verified properties in Bengaluru. Find your dream home or list your property with us today.';
  let image = `${BASE}/logos/dark_logo.png`;
  let jsonLd = '';
  let canonical = `${BASE}${path}`;

  // Route-specific meta
  if (path.startsWith('/properties/')) {
    const segments = path.split('/');
    const id = segments[segments.length - 1];

    if (id && /^[0-9a-f-]{36}$/.test(id)) {
      const sbUrl = process.env.VITE_SUPABASE_URL;
      const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (sbUrl && sbKey) {
        try {
          const pRes = await fetch(`${sbUrl}/rest/v1/properties?id=eq.${id}&select=*`, {
            headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
          });
          const data = await pRes.json();
          if (data?.[0]) {
            const p = data[0];
            const intent = p.property_intent === 'sale' ? 'sale' : 'rent';
            const loc = p.locality || p.city || 'Bangalore';
            title = `${p.title || p.type} for ${intent} in ${loc} | Quest Housing`;
            desc = p.description || `${p.type} available for ${intent} in ${loc} for ₹${p.price?.toLocaleString()}.`;
            if (p.images?.[0]) image = p.images[0];
            jsonLd = `<script type="application/ld+json">${JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateListing",
              "name": p.title,
              "description": desc,
              "image": p.images || [],
              "url": canonical,
              "offers": { "@type": "Offer", "price": p.price, "priceCurrency": "INR" },
              "address": { "@type": "PostalAddress", "addressLocality": p.locality, "addressRegion": p.city }
            })}</script>`;
          }
        } catch { /* supabase fetch failed, use defaults */ }
      }
    }
  } else if (path === '/properties') {
    title = 'Browse Premium Rentals & Properties | Quest Housing';
    desc = 'Browse our exclusive collection of 100% verified flats, villas, plots, and premium homes available for rent and sale in Bengaluru.';
  } else if (path === '/about') {
    title = 'About Quest Housing | Transparent Real Estate in Bangalore';
    desc = 'Learn about Quest Housing — our mission to revolutionize Bengaluru real estate with transparent renting and zero surprises.';
  } else if (path === '/find-my-home') {
    title = 'Find My Home | Quest Housing';
    desc = 'Tell us your requirements and we will find the perfect home for you in Bengaluru.';
  } else if (path === '/register') {
    title = 'List Your Property Free | Quest Housing';
    desc = 'List your property at no cost and reach verified buyers or tenants in Bengaluru.';
  } else if (path === '/services') {
    title = 'Real Estate Services | Quest Housing';
    desc = 'Premium property management, tenant matching, and real estate services in Bengaluru.';
  }

  // Inject SEO tags into <head> — replaces the static <title>QuestHousing</title>
  const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Quest Housing">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${esc(image)}">
    ${jsonLd}`;

  // Replace the static title and inject before </head>
  html = html.replace('<title>QuestHousing</title>', '');
  html = html.replace('</head>', `${seoTags}\n  </head>`);

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function esc(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const config = {
  matcher: ['/', '/properties', '/properties/:path*', '/about', '/services', '/find-my-home', '/register'],
};
