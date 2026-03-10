import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ConditionalScripts from '@/components/ConditionalScripts';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://eir-2026.vercel.app'),
  title: {
    default: 'EIR 2026 - Gestión de Plazas',
    template: '%s | EIR 2026',
  },
  description: 'Aplicación web para gestionar las plazas ofertadas del EIR 2026. Organiza tus preferencias y compara tu posición con otros aspirantes a las plazas EIR 2026.',
  keywords: ['EIR', '2026', 'enfermería', 'residencia', 'plazas', 'EIR 2026', 'Enfermero Interno Residente', 'hospital', 'especialidad'],
  authors: [{ name: 'ewolf' }],
  creator: 'ewolf',
  publisher: 'ewolf',
  applicationName: 'EIR 2026 - Gestión de Plazas',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://eir-2026.vercel.app',
    siteName: 'EIR 2026 - Gestión de Plazas',
    title: 'EIR 2026 - Gestión de Plazas',
    description: 'Organiza tus preferencias y compara tu posición con otros aspirantes a las plazas EIR 2026',
    images: [
      {
        url: '/favicon.svg',
        width: 100,
        height: 100,
        alt: 'EIR 2026 Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'EIR 2026 - Gestión de Plazas',
    description: 'Organiza tus preferencias y compara tu posición con otros aspirantes a las plazas EIR 2026',
    images: ['/favicon.svg'],
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e0559c' },
    { media: '(prefers-color-scheme: dark)', color: '#e0559c' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="monetag" content="774ad1aa30513e6183591da0c343f1e9" />
        <meta name="google-site-verification" content="ZRV7DfSvR8tAkEx2jNAwoce0SP3vQgkVUVQ0GxnWePU" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3141258781723434"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Footer />
        
        {/* Conditional ad scripts - only loaded with marketing consent */}
        <ConditionalScripts />
        
        {/* Ko-fi Floating Widget - Always loads (donation/support widget) */}
        <Script 
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" 
          strategy="afterInteractive"
        />
        <Script 
          id="kofi-widget"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof kofiWidgetOverlay !== 'undefined') {
                kofiWidgetOverlay.draw('e_wolf', {
                  'type': 'floating-chat',
                  'floating-chat.donateButton.text': 'Apoyo',
                  'floating-chat.donateButton.background-color': '#00b9fe',
                  'floating-chat.donateButton.text-color': '#fff'
                });
              }
            `
          }}
        />
        
        {/* Cookie Consent Banner */}
        <CookieConsent />
      </body>
    </html>
  );
}
