import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "64.media.tumblr.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore pino and its dependencies' test files
      config.ignoreWarnings = [{ module: /node_modules\/thread-stream/ }];
      config.module = config.module || {};
      config.module.exprContextCritical = false;

      // Externalize native modules for Baileys/ws to work properly
      config.externals = config.externals || [];
      config.externals.push({
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }
    return config;
  },
  // Disable turbopack to use webpack instead
  // turbopack: {},
};

export default nextConfig;
