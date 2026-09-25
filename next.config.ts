import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
