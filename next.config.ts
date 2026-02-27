import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone', // Re-enable standalone for VPS efficiency
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
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: true, // Disable image optimization for now to debug
  },

  typescript: {
    ignoreBuildErrors: true, // Speed up build by skipping TS checks (we rely on local dev checks)
  },
};

export default withNextIntl(nextConfig);
