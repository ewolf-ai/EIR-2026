import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Script from 'next/script';

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
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        
        <Script id="ad-config" strategy="afterInteractive">
          {`
            atOptions = {
              'key' : 'ab7bf4e790396ec2699667b25edf831f',
              'format' : 'iframe',
              'height' : 300,
              'width' : 160,
              'params' : {}
            };
          `}
        </Script>
        <Script 
          src="https://www.highperformanceformat.com/ab7bf4e790396ec2699667b25edf831f/invoke.js"
          strategy="afterInteractive"
        />
        <Script 
          src="https://pl28853919.effectivegatecpm.com/de/f6/46/def646c778819384e9f60709b2fa20e6.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
