/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['firebase', '@firebase/auth'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://www.highperformanceformat.com https://highperformanceformat.com https://pl28853919.effectivegatecpm.com https://effectivegatecpm.com https://*.effectivegatecpm.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.supabase.co",
              "frame-src 'self' https://www.highperformanceformat.com https://highperformanceformat.com https://pl28853919.effectivegatecpm.com https://effectivegatecpm.com https://*.effectivegatecpm.com",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
