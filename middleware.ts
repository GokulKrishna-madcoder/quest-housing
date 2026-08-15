export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const bots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebot', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot', 'claudebot', 'chatgpt-user', 'gptbot', 'anthropic-ai', 'perplexitybot', 'applebot', 'ia_archiver', 'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot'];
  const isBot = bots.some(bot => ua.includes(bot));

  if (!isBot) return;

  const path = url.pathname;
  
  if (path.startsWith('/properties/')) {
    const segments = path.split('/');
    const id = segments[segments.length - 1];
    if (id && /^[0-9a-f-]{36}$/.test(id)) {
      const sbUrl = process.env.VITE_SUPABASE_URL;
      const sbKey = process.env.VITE_SUPABASE_ANON_KEY;
      if (sbUrl && sbKey) {
        const res = await fetch(`${sbUrl}/rest/v1/properties?id=eq.${id}&select=*`, {
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
        });
        const data = await res.json();
        if (data && data.length > 0) {
          const p = data[0];
          const img = p.images?.[0] || '';
          const title = `${p.type} for rent in ${p.locality || p.city} | Quest Housing`;
          const desc = `Check out this ${p.bhk} BHK ${p.type} available for rent in ${p.locality || p.city} for ₹${p.price?.toLocaleString()}.`;
          const jsonLd = {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": p.title,
            "description": p.description || desc,
            "image": p.images || [],
            "offers": {
              "@type": "Offer",
              "price": p.price,
              "priceCurrency": "INR"
            }
          };

          const html = `<!DOCTYPE html><html><head>
            <title>${title}</title>
            <meta name="description" content="${desc}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${desc}">
            <meta property="og:image" content="${img}">
            <meta property="og:type" content="website">
            <meta name="twitter:card" content="summary_large_image">
            <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
          </head><body>
            <main>
              <h1>${p.title}</h1>
              <p>${p.description || desc}</p>
              <h2>Property Details</h2>
              <ul>
                <li><strong>Type:</strong> ${p.type}</li>
                <li><strong>BHK:</strong> ${p.bhk}</li>
                <li><strong>Price:</strong> ₹${p.price}</li>
                <li><strong>Location:</strong> ${p.locality}, ${p.city}</li>
                <li><strong>Furnishing:</strong> ${p.furnishing}</li>
                <li><strong>Availability:</strong> ${p.availability_status}</li>
              </ul>
            </main>
          </body></html>`;

          return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
        }
      }
    }
  }

  const staticMeta: Record<string, {title: string, desc: string, body: string}> = {
    '/': { 
      title: 'Quest Housing | Premium Rental Homes in Bangalore', 
      desc: 'Quest Housing offers zero upfront cost, premium rentals, and 100% verified properties in Bengaluru. Find your dream home or list your property with us today.',
      body: '<h1>Quest Housing</h1><p>Premium rental homes and property management in Bengaluru with zero upfront costs. Browse our verified flats, villas, and premium homes.</p>'
    },
    '/properties': { 
      title: 'Browse Premium Rentals | Quest Housing', 
      desc: 'Browse our exclusive collection of 100% verified flats, villas, and premium homes available for rent in Bengaluru.',
      body: '<h1>Available Properties</h1><p>Browse our exclusive collection of 100% verified flats, villas, and premium homes available for rent in Bengaluru.</p>'
    },
    '/about': { 
      title: 'About Quest Housing | Transparent Real Estate', 
      desc: 'Learn about Quest Housing, our mission to revolutionize Bengaluru real estate with zero deposit and transparent renting.',
      body: '<h1>About Quest Housing</h1><p>Our mission is to revolutionize Bengaluru real estate with zero deposit and transparent renting.</p>'
    }
  };

  const meta = staticMeta[path];
  if (meta) {
    const html = `<!DOCTYPE html><html><head>
      <title>${meta.title}</title>
      <meta name="description" content="${meta.desc}">
      <meta property="og:title" content="${meta.title}">
      <meta property="og:description" content="${meta.desc}">
      <meta property="og:type" content="website">
    </head><body>
      <main>${meta.body}</main>
    </body></html>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}

export const config = {
  matcher: ['/', '/properties', '/properties/:slug/:id*', '/about', '/services'],
};
