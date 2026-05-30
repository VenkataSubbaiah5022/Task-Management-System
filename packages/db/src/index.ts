import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function isNextBuild(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url && isNextBuild()) {
    return new PrismaClient({
      datasources: { db: { url: "file:./build-stub.db" } },
    });
  }

  if (url?.startsWith("libsql:")) {
    if (!authToken) {
      throw new Error(
        "TURSO_AUTH_TOKEN is required when DATABASE_URL is a libsql:// URL (set it in Vercel env vars).",
      );
    }
    const adapter = new PrismaLibSQL({ url, authToken });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  if (!url?.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must be set — libsql:// for production (Turso) or file:... for local dev (.env.local).",
    );
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { PrismaClient };
export * from "@prisma/client";
