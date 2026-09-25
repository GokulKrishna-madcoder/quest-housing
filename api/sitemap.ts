function generatePropertySlug(p: any): string {
  const loc = [p.locality, p.city].filter(Boolean).join(' ');
  const text = [p.type, p.title, loc ? `in ${loc}` : ''].filter(Boolean).join(' ');
  return text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'property';
}

const BASE = 'https://questhousing.vercel.app';

const STATIC_ROUTES = [
  { loc: '', priority: '1.0', changefreq: 'weekly' },
  { loc: '/properties', priority: '0.9', changefreq: 'daily' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' },
  { loc: '/find-my-home', priority: '0.8', changefreq: 'monthly' },
  { loc: '/register', priority: '0.6', changefreq: 'monthly' },
];

export default async function handler(req: any, res: any) {
  const sbUrl = process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

  let entries = STATIC_ROUTES.map(r =>
    `<url><loc>${BASE}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
  );

  if (sbUrl && sbKey) {
    const response = await fetch(`${sbUrl}/rest/v1/properties?select=id,title,type,locality,city`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
    });
    if (response.ok) {
      const data = await response.json();
      data.forEach((p: any) => {
        entries.push(`<url><loc>${BASE}/properties/${generatePropertySlug(p)}/${p.id}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
      });
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries.join('\n  ')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(sitemap);
}
