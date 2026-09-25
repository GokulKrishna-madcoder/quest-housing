import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE = 'https://questhousing.vercel.app';

interface SEOProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  image?: string;
  jsonLd?: Record<string, any>;
}

export default function SEO({ title, description, type = 'website', name = 'Quest Housing', image = '/logos/dark_logo.png', jsonLd }: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = `${title} | Quest Housing`;
  const canonical = `${BASE}${pathname}`;
  const absoluteImage = image.startsWith('http') ? image : `${BASE}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <link rel="canonical" href={canonical} />

      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:domain" content="questhousing.vercel.app" />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
