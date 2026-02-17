import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable Partial Prerendering (PPR) for improved performance
    // ppr: true,
  },
}

export default nextConfig
