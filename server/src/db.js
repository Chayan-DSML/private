import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const schemaPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "schema.sql",
);

export function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  return new Pool({
    connectionString,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

export async function migrate(pool) {
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
}
