import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Do not set `allowedDevOrigins` in local LAN testing: once defined, Next
  // switches from warn → block for unknown /_next/* origins, which can leave
  // phones without JS (buttons appear dead). Host binding is via `next dev -H`.
  // Keep Prisma (and Cursor SDK) outside the Next bundler so `prisma generate`
  // updates are picked up on process restart instead of a stale bundled client.
  serverExternalPackages: ['@cursor/sdk', '@prisma/client', 'prisma'],
  experimental: {
    // Align server action limit with Cursor video uploads (route handler uses Node runtime).
    serverActions: {
      bodySizeLimit: '210mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ebenezerbc.org',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
