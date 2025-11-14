/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://*.supabase.in; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
]

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://xyqo-home.onrender.com',
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        source: '/b2bShop/(.*\\.(?:js|css|woff2|png|jpg|svg))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/b2bShop', destination: '/b2bShop/index.html' },
      { source: '/b2bShop/:path*', destination: '/b2bShop/index.html' },
    ]
  },
  async redirects() {
    return [
      { source: '/b2bshop/:path*', destination: '/b2bShop/:path*', permanent: true },
    ]
  },
}

module.exports = nextConfig
