import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable eslint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images for deployment
  images: {
    unoptimized: false,
  },

  // Disable static generation for problematic routes
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;