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
    // ✅ Removed optimizeCss - Next.js 15 has excellent built-in CSS optimization
    // Using experimental optimizeCss requires critters package and can cause build issues
    // Next.js/SWC already optimizes CSS effectively without this flag
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

  // ✅ Webpack configuration to fix worker thread errors
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize worker_threads to prevent bundling issues
      config.externals = [...(config.externals || []), 'worker_threads']
      
      // Fix worker_threads issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'worker_threads': false,
      }
    }

    return config
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
    // Fix worker thread errors
    if (isServer) {
      // Externalize worker_threads to prevent bundling issues
      config.externals = [...(config.externals || []), 'worker_threads']
      
      // Fix worker_threads issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'worker_threads': false,
      }
    }

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

  // ✅ Compiler optimizations for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep errors and warnings
    } : false,
  },

  // ✅ SWC minification is enabled by default in Next.js 15

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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live; script-src-elem 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.workos.com https://va.vercel-scripts.com; frame-src 'self' https://vercel.live;",
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
      {
        // ✅ Cache images aggressively
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // ✅ Cache Next.js static assets
        source: '/_next/static/:path*',
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
