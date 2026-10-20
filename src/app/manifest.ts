import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SENDOKecil EST 2026 · Kue Gabin Fla Premium',
    short_name: 'SENDOKecil',
    description:
      'Pesan Kue Gabin Fla Lumer istimewa Sendokecil langsung dari HP. Bayar mudah via QRIS / Transfer BCA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7F2',
    theme_color: '#FAF7F2',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
