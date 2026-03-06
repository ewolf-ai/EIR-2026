import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

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
        
        {/* Adsterra Banner 160x300 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              atOptions = {
                'key' : 'ab7bf4e790396ec2699667b25edf831f',
                'format' : 'iframe',
                'height' : 300,
                'width' : 160,
                'params' : {}
              };
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        
        {/* Adsterra Scripts - Loaded after page is interactive */}
        <Script
          src="https://www.highperformanceformat.com/ab7bf4e790396ec2699667b25edf831f/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <Script
          src="https://www.highperformanceformat.com/28753420/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
      </body>
    </html>
  );
}
