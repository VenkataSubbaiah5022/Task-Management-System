import { createClient } from "@libsql/client";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dbRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(dbRoot, "../..");
const envTurso = join(repoRoot, ".env.turso");

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
}

loadEnv(envTurso);

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url?.startsWith("libsql:") || !authToken) {
  console.error("Missing DATABASE_URL or TURSO_AUTH_TOKEN in .env.turso");
  process.exit(1);
}

console.log("Testing Turso connection...");
console.log("  URL:", url);

try {
  const client = createClient({ url, authToken });
  await client.execute("SELECT 1");
  console.log("Connection OK — token is valid.");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  const cause =
    err instanceof Error && err.cause instanceof Error ? err.cause.message : String(err);

  console.error("\nConnection FAILED:", msg);
  if (cause) console.error("Cause:", cause);

  if (msg.includes("401") || cause.includes("401")) {
    console.error(`
HTTP 401 = invalid or expired token.

Fix:
  1. Open https://turso.tech/app → your database "flowboard-teja6351"
  2. Click "Create Token" (database token, not org token)
  3. Copy the FULL token — no spaces or quotes
  4. Paste into .env.turso as:
       TURSO_AUTH_TOKEN=your-new-token
  5. Run .\\scripts\\setup-turso.ps1 again
`);
  }

  if (cause.includes("certificate") || cause.includes("UNABLE_TO_VERIFY")) {
    console.error(`
SSL certificate error on this network.

Try:
  1. Different network / disable VPN briefly
  2. Or run schema from Turso dashboard → SQL shell (paste turso-init.sql)
  3. Vercel deploy will work — Turso runs from Vercel servers, not your PC
`);
  }

  process.exit(1);
}
