import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AlertProvider } from '@/components/ui/CustomAlert';

export const metadata: Metadata = {
  title: 'SENDOKecil EST 2026 · Dessert & Sweet Moments',
  description: 'Pesan dessert lumer istimewa Sendokecil langsung dari HP. Bayar mudah via QRIS / Transfer BCA.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
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
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-[#E8DFC8] selection:text-[#4A2E1B]">
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
