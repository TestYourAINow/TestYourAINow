import type { NextConfig } from "next";
import { NextConfig as ActualNextConfig } from "next";

const nextConfig: ActualNextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ← TON CONFIG EXISTANT
  },
  webpack: (config, { isServer }) => {
    // Évite les erreurs liées à "fs" côté client (TON CONFIG EXISTANT)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ignore tous les fichiers .test.ts, .test.js, etc. (TON CONFIG EXISTANT)
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      use: "null-loader",
    });

    return config;
  },
  
  // 🚀 NOUVEAU - HEADERS POUR AUTORISER IFRAME SUR WIDGETS
  async headers() {
    return [
      {
        // 🎯 AUTORISER IFRAME POUR TOUS LES WIDGETS
        source: '/widget/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig;