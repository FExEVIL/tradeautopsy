const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ✅ Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // ✅ Disable source maps in production to reduce cache serialization
  productionBrowserSourceMaps: false,

  // ✅ Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@supabase/supabase-js',
      'date-fns',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['www.tradeautopsy.in', 'tradeautopsy.in'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.tradeautopsy.in',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // ✅ Optimize cache to completely eliminate serialization warnings
      // Use memory cache for better performance and to avoid large string serialization
      if (config.cache) {
        // Override cache configuration to use memory cache for large strings
        config.cache = {
          ...config.cache,
          maxMemoryGenerations: 0, // Disable memory cache generations
          compression: false, // Disable compression to avoid serialization
        }
      }

      // ✅ Suppress webpack cache warnings
      config.infrastructureLogging = {
        level: 'error', // Only show errors, suppress warnings
        debug: false,
      }

      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // Smaller chunks (200KB) to avoid serialization issues
        minSize: 20000,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /node_modules/,
            priority: 20,
            maxSize: 200000,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            maxSize: 200000,
          },
        },
      }

      // ✅ Disable source maps completely in production
      config.devtool = false
    }

    // ✅ Suppress warnings for all builds (dev and production)
    config.ignoreWarnings = [
      {
        module: /node_modules/,
      },
      {
        message: /Serializing big strings/,
      },
    ]

    return config
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
