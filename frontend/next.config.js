/**
 * Next.js Configuration
 * 
 * This file configures Next.js for the SmartMart frontend application.
 * Key configurations include:
 * - Experimental features
 * - API routing
 * - Asset handling
 * - Build optimizations
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure React strict mode is enabled for better development practices
  reactStrictMode: true,
  // Configure image domains if using Next.js Image component with external sources
  images: {
    domains: [],
  },
  // Webpack configuration can be extended here if needed
  webpack: (config) => {
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*' // Remove /api from destination
      }
    ];
  }
};

module.exports = nextConfig;
