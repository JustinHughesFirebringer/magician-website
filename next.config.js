const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  optimizeFonts: false,
  typescript: {
    ignoreBuildErrors: false, // Enable type checking
  },
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
      },
    };
    return config;
  },
  // Add proper error handling
  onError: (err) => {
    console.error('Next.js build error:', err);
  },
  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig
