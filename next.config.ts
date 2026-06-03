import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side file system reads for content directories
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
