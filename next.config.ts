import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'roth-personal.vercel.app',
        process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') ?? '',
      ].filter(Boolean),
    },
  },
}

export default nextConfig
