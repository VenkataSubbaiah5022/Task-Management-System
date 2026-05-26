import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(webRoot, "../..");
const sqliteFile = path.join(monorepoRoot, "packages/db/prisma/dev.db");

/** Absolute path — required because Turbopack breaks import.meta.url in @tms/db */
const databaseUrl = `file:${sqliteFile.replace(/\\/g, "/")}`;

const nextConfig: NextConfig = {
  transpilePackages: ["@tms/config", "@tms/shared", "@tms/db"],
  env: {
    DATABASE_URL: databaseUrl,
  },
};

export default nextConfig;
