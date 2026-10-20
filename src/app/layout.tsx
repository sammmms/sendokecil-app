import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AlertProvider } from '@/components/ui/CustomAlert';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sendokecil.store'),
  title: {
    default: 'SENDOKecil EST 2026 · Kue Gabin Fla Premium Medan',
    template: '%s · SENDOKecil',
  },
  description:
    'Pesan Kue Gabin Fla Premium lumer aneka varian rasa (Choco Oreo, Keju Melt, Choco Banana, Vanilla Custard) langsung di SENDOKecil Medan. Biskuit renyah gurih, fla lumer lezat, siap antar kurir & bayar QRIS.',
  keywords: [
    'SENDOKecil',
    'sendokecil',
    'sendokecil store',
    'sendokecil medan',
    'kue gabin fla',
    'gabin fla medan',
    'kue gabin lumer',
    'gabin fla susu',
    'dessert medan',
    'kuliner medan',
    'oleh oleh medan',
    'snack box medan',
    'kue gabin fla premium',
    'choco oreo gabin',
    'keju melt gabin',
    'dessert box medan',
    'jajanan medan kekinian',
  ],
  authors: [{ name: 'SENDOKecil EST 2026' }],
  creator: 'SENDOKecil',
  publisher: 'SENDOKecil',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: 'https://www.sendokecil.store',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://www.sendokecil.store',
    siteName: 'SENDOKecil EST 2026',
    title: 'SENDOKecil EST 2026 · Kue Gabin Fla Premium Medan',
    description:
      'Biskuit gabin renyah dengan isian fla susu lumer aneka rasa pilihan: Choco Oreo, Keju Melt, Banana, Vanilla. Pesan online cepat via QRIS & Transfer BCA.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SENDOKecil EST 2026 · Kue Gabin Fla Premium Medan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SENDOKecil EST 2026 · Kue Gabin Fla Premium Medan',
    description:
      'Biskuit gabin gurih renyah dengan isian fla lembut aneka rasa istimewa di Medan. Siap antar kurir & ambil di tempat.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAF7F2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Bakery',
        '@id': 'https://www.sendokecil.store/#bakery',
        name: 'SENDOKecil EST 2026',
        url: 'https://www.sendokecil.store',
        logo: 'https://www.sendokecil.store/icon.png',
        image: 'https://www.sendokecil.store/og-image.png',
        description:
          'Kue Gabin Fla Premium lumer di Medan. Biskuit gabin gurih renyah dengan isian fla susu lembut aneka varian rasa: Choco Oreo, Keju Melt, Choco Banana, Vanilla Custard.',
        telephone: '+6281377493907',
        priceRange: 'Rp 15.000',
        servesCuisine: ['Indonesian Dessert', 'Kue Gabin Fla', 'Bakery', 'Pastry'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Medan',
          addressRegion: 'Sumatera Utara',
          addressCountry: 'ID',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 3.5952,
          longitude: 98.6722,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '08:00',
            closes: '20:00',
          },
        ],
        sameAs: ['https://www.instagram.com/sendokecil.idn/'],
        hasMenu: 'https://www.sendokecil.store/#menu',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.sendokecil.store/#website',
        url: 'https://www.sendokecil.store',
        name: 'SENDOKecil EST 2026',
        publisher: {
          '@id': 'https://www.sendokecil.store/#bakery',
        },
        inLanguage: 'id-ID',
      },
    ],
  };

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-[#E8DFC8] selection:text-[#4A2E1B]">
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
