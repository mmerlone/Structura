/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
  },
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
  productionBrowserSourceMaps: false,

  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /@opentelemetry/ },
      { module: /require-in-the-middle/ },
      { file: /@sentry\/nextjs/ },
    ]
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    // Only externalize for server-side bundles
    if (config.name === 'server') {
      config.externals.push({
        'node:fs': 'commonjs fs',
        'node:crypto': 'commonjs crypto',
        argon2: 'argon2',
        pino: 'pino',
        'thread-stream': 'thread-stream',
        'pino-worker': 'pino-worker',
        'pino-file': 'pino-file',
        'pino-pretty': 'pino-pretty',
      })
    } else {
      // For client bundles, completely exclude server logger modules
      config.externals.push({
        '@/lib/logger/server': 'void 0',
        pino: 'void 0',
        'thread-stream': 'void 0',
        'pino-worker': 'void 0',
        'pino-file': 'void 0',
        'pino-pretty': 'void 0',
      })
    }
    return config
  },
}

const sentryConfig = {
  org: 'mmerlones-org',
  project: 'structura',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
    disable: process.env.NODE_ENV !== 'production',
    urlPrefix: '~/_next',
  },
}

export default withSentryConfig(nextConfig, sentryConfig)
