/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,  // ✅ Skip ESLint during build
  },
  typescript: {
    ignoreBuildErrors: false,  // Keep TypeScript checks
  },
}

module.exports = nextConfig