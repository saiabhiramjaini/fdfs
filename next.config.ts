import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'playwright',
    'playwright-extra',
    'puppeteer-extra-plugin-stealth',
    'puppeteer-extra',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
