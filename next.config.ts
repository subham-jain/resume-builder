import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable hot reload and fast refresh
  reactStrictMode: true,
  
  // Turbopack configuration (moved from experimental)
  turbopack: {
    resolveAlias: {
      // Ensure proper module resolution for hot reload
    },
  },
  
  // Ensure proper file watching and hot reload
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000, // Increased for better hot reload
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5, // Increased for better hot reload
  },
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Enable faster refresh in development
    swcMinify: true,
  }),
};

export default nextConfig;
