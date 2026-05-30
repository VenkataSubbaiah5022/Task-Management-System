import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dbRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(dbRoot, "../..");
const envTurso = join(repoRoot, ".env.turso");
const sqlFile = join(dbRoot, "turso-init.sql");

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
  console.error("Set DATABASE_URL and TURSO_AUTH_TOKEN in .env.turso");
  process.exit(1);
}

if (authToken.includes("...")) {
  console.error("TURSO_AUTH_TOKEN looks truncated. Paste the full token.");
  process.exit(1);
}

if (!existsSync(sqlFile)) {
  console.error("Missing turso-init.sql — run setup-turso.ps1");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = readFileSync(sqlFile, "utf8");

const statements = sql
  .split(/;\s*[\r\n]+/)
  .map((s) => s.replace(/^--[^\r\n]*[\r\n]*/gm, "").trim())
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} statements to Turso...`);

for (const statement of statements) {
  try {
    await client.execute(statement);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && "cause" in err ? String(err.cause) : "";

    if (msg.includes("401") || cause.includes("401")) {
      console.error(`
Turso returned 401 Unauthorized — your TURSO_AUTH_TOKEN is wrong or expired.

Create a new DATABASE token:
  1. https://turso.tech/app → flowboard-teja6351
  2. "Create Token" → copy full token
  3. Update TURSO_AUTH_TOKEN in .env.turso (no quotes)
  4. Run: .\\scripts\\setup-turso.ps1
`);
      process.exit(1);
    }

    if (msg.includes("already exists")) {
      console.log("  skip (exists):", statement.slice(0, 50) + "...");
      continue;
    }
    console.error("Failed:", statement.slice(0, 120));
    throw err;
  }
}

console.log("Turso schema ready.");
