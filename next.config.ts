import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone', // Enabled for Hostinger Shared Hosting compatibility
  poweredByHeader: false, // Disable x-powered-by header for security
  compress: true, // Enable gzip compression
  reactStrictMode: true,
  serverExternalPackages: ['prisma', '@prisma/client', 'bcryptjs', 'mysql2'],

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    optimizeCss: false, // Consider enabling if critical CSS is needed
    optimizeServerReact: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'kint-group.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false,
  },

  typescript: {
    ignoreBuildErrors: true, // Speed up build by skipping TS checks (we rely on local dev checks)
  },
};

export default withNextIntl(nextConfig);
