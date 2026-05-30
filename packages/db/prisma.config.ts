import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(root, "../..");

loadEnv({ path: path.join(repoRoot, ".env.turso") });
loadEnv({ path: path.join(root, ".env") });

const defaultDb = path.join(root, "prisma", "dev.db");
const tursoUrl = process.env.DATABASE_URL?.startsWith("libsql:")
  ? process.env.DATABASE_URL
  : process.env.LIBSQL_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN ?? process.env.LIBSQL_DATABASE_TOKEN;

const useTurso = Boolean(tursoUrl?.startsWith("libsql:") && tursoToken);

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  ...(useTurso
    ? {
        experimental: { adapter: true },
        async adapter() {
          const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
          return new PrismaLibSQL({ url: tursoUrl!, authToken: tursoToken! });
        },
      }
    : {
        datasource: { url: `file:${defaultDb}` },
      }),
});
