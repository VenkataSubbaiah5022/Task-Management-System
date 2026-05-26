import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(webRoot, "../..");
const localSqlite = `file:${path.join(monorepoRoot, "packages/db/prisma/dev.db").replace(/\\/g, "/")}`;

const nextConfig: NextConfig = {
  transpilePackages: ["@tms/config", "@tms/shared", "@tms/db"],
  outputFileTracingRoot: monorepoRoot,
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? localSqlite,
  },
};

export default nextConfig;
