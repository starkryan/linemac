import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Disable eslint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images for deployment
  images: {
    unoptimized: false,
  },

  // Experimental features to handle webpack issues
  experimental: {
    // Optimize bundling for Next.js 15
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      'react-hook-form',
      'zod',
      'clsx',
      'tailwind-merge'
    ],
  },

  // Server components configuration
  serverExternalPackages: [],

  // Disable static generation for problematic routes
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  };

// PWA configuration with workbox
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "imageCache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 2592000, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "staticResources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400, // 24 hours
        },
      },
    },
  ],
  // Offline fallback configuration
  fallbacks: {
    document: "/offline",
    image: "/no-wifi.png",
    audio: "/offline",
    video: "/offline",
    font: "/offline",
  },
});

// @ts-ignore
const finalConfig = pwaConfig(nextConfig);

export default finalConfig;
