import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";
import path from "node:path";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (url?.startsWith("libsql:") || url?.startsWith("postgres")) {
    return url;
  }

  if (url?.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    const normalized = filePath.replace(/\//g, path.sep);
    if (path.isAbsolute(normalized) && existsSync(normalized)) {
      return `file:${normalized.replace(/\\/g, "/")}`;
    }
  }

  const candidates = [
    path.resolve(process.cwd(), "packages/db/prisma/dev.db"),
    path.resolve(process.cwd(), "../../packages/db/prisma/dev.db"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return `file:${candidate.replace(/\\/g, "/")}`;
    }
  }

  return `file:${candidates[1]!.replace(/\\/g, "/")}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient() {
  return new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "@prisma/client";
