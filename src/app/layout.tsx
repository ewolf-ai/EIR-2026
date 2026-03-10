import type { Metadata } from 'next';
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
  title: 'EIR 2026 - Gestión de Plazas',
  description: 'Aplicación web para gestionar las plazas ofertadas del EIR 2026',
  keywords: ['EIR', '2026', 'enfermería', 'residencia', 'plazas'],
  authors: [{ name: 'EIR Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#e0559c',
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
