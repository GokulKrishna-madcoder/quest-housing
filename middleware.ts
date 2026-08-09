export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const bots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'facebot', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot', 'claudebot', 'chatgpt-user', 'gptbot', 'anthropic-ai', 'perplexitybot', 'applebot', 'ia_archiver', 'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot'];
  const isBot = bots.some(bot => ua.includes(bot));

  if (!isBot) return;

  const path = url.pathname;
  
  if (path.startsWith('/properties/')) {
    const id = path.split('/')[2];
    if (id) {
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
          </head><body></body></html>`;

          return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
        }
      }
    }
  }

  const staticMeta: Record<string, {title: string, desc: string}> = {
    '/': { title: 'Quest Housing | Premium Rental Homes in Bangalore', desc: 'Quest Housing | Premium Rental Homes in Bangalore' },
    '/properties': { title: 'Browse Premium Rentals | Quest Housing', desc: 'Browse Premium Rentals | Quest Housing' },
    '/about': { title: 'About Quest Housing | Transparent Real Estate', desc: 'About Quest Housing | Transparent Real Estate' }
  };

  const meta = staticMeta[path];
  if (meta) {
    const html = `<!DOCTYPE html><html><head>
      <title>${meta.title}</title>
      <meta name="description" content="${meta.desc}">
      <meta property="og:title" content="${meta.title}">
      <meta property="og:description" content="${meta.desc}">
      <meta property="og:type" content="website">
    </head><body></body></html>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}

export const config = {
  matcher: ['/', '/properties', '/properties/:id*', '/about', '/services'],
};
