function generatePropertySlug(p: any): string {
  const loc = [p.locality, p.city].filter(Boolean).join(' ');
  const text = [p.type, p.title, loc ? `in ${loc}` : ''].filter(Boolean).join(' ');
  return text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'property';
}

export default async function handler(req: any, res: any) {
  const sbUrl = process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY;

  let urls = [
    'https://questhousing.vercel.app/',
    'https://questhousing.vercel.app/properties',
    'https://questhousing.vercel.app/about',
    'https://questhousing.vercel.app/find-my-home'
  ];

  if (sbUrl && sbKey) {
    const response = await fetch(`${sbUrl}/rest/v1/properties?select=id,title,type,locality,city`, {
      headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` }
    });
    if (response.ok) {
      const data = await response.json();
      data.forEach((p: any) => {
        urls.push(`https://questhousing.vercel.app/properties/${generatePropertySlug(p)}/${p.id}`);
      });
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(sitemap);
}
