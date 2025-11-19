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
  serverExternalPackages: ['whatsapp-web.js', 'puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  turbopack: {},
};

export default nextConfig;
