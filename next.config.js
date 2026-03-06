/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  transpilePackages: ['firebase', '@firebase/auth'],
}

module.exports = nextConfig
