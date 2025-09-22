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

// Only apply PWA configuration in production builds
const isDev = process.env.NODE_ENV === "development";
let finalConfig = nextConfig;

if (!isDev) {
  // PWA configuration with workbox - only in production
  const pwaConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
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

  // @ts-expect-error - PWA config type compatibility issue
  finalConfig = pwaConfig(nextConfig);
}

export default finalConfig;