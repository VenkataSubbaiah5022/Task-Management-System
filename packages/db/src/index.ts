import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import path from "node:path";

function resolveLocalDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

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

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url?.startsWith("libsql:")) {
    const libsql = createClient({ url, authToken });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    datasources: { db: { url: resolveLocalDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from "@prisma/client";
