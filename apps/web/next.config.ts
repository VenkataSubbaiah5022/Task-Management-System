import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tms/config", "@tms/shared", "@tms/db"],
};

export default nextConfig;
