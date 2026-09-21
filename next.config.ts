import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    qualities: [75, 95],
  },
};

export default nextConfig;
