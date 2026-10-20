import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/auth/', '/api/orders/'],
      },
    ],
    sitemap: 'https://www.sendokecil.store/sitemap.xml',
  };
}
