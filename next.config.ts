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
};

export default nextConfig;
