/**
 * One-command database migration for VendorDesk.
 *
 * Usage (from the vendor-desk folder):
 *   npm install
 *   DATABASE_URL='postgresql://postgres:YOUR-PASSWORD@db.YOUR-REF.supabase.co:5432/postgres' node scripts/apply-migration.mjs
 *
 * Get the connection string from:
 *   Supabase Dashboard → Project Settings → Database → Connection string (URI)
 *   (replace [YOUR-PASSWORD] with your real database password)
 *
 * Runs supabase/schema.sql once. Safe to re-check but NOT idempotent:
 * running twice will error with "already exists" — that's harmless.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "..", "supabase", "schema.sql");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "✗ DATABASE_URL is not set.\n" +
      "  Supabase Dashboard → Project Settings → Database → Connection string (URI),\n" +
      "  then run:\n" +
      "  DATABASE_URL='postgresql://...' node scripts/apply-migration.mjs"
  );
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("✓ Connected to database");

  await client.query(sql);
  console.log("✓ Migration applied: tables, policies, indexes, storage bucket");

  const { rows } = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' order by table_name`
  );
  console.log(
    "✓ Public tables now:",
    rows.map((r) => r.table_name).join(", ")
  );
  console.log("\nDone. Check Supabase → Table Editor to see them, then test signup on your live site.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  if (/already exists/i.test(err.message)) {
    console.error("  (This means the migration was already applied — nothing to do.)");
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
