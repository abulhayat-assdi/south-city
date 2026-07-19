import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for the Docker multi-stage build (see Dockerfile / §15.4).
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Server Actions handle all mutations; allow larger bodies for document uploads.
    serverActions: { bodySizeLimit: '10mb' },
  },
  images: {
    formats: ['image/webp'],
  },
};

export default withNextIntl(nextConfig);
