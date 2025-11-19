import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  serverExternalPackages: ['whatsapp-web.js', 'puppeteer'],
  turbopack: {},
};

export default nextConfig;
