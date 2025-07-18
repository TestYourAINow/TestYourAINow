import type { NextConfig } from "next";
import { NextConfig as ActualNextConfig } from "next";

const nextConfig: ActualNextConfig = {
  webpack: (config, { isServer }) => {
    // Évite les erreurs liées à "fs" côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ignore tous les fichiers .test.ts, .test.js, etc. même dans node_modules
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      use: "null-loader",
    });

    return config;
  },
};

export default nextConfig;
