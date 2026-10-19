import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const schemaPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "schema.sql",
);

export function createPool() {
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME;
  if (!user || !password || !database) {
    throw new Error(
      "DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME are required",
    );
  }
  const config = {
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: "Z",
  };
  if (process.env.DATABASE_SOCKET) {
    config.socketPath = process.env.DATABASE_SOCKET;
  } else {
    config.host = process.env.DATABASE_HOST || "127.0.0.1";
    config.port = Number(process.env.DATABASE_PORT || 3306);
  }
  return mysql.createPool(config);
}

export async function query(pool, sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result;
}

export async function migrate(pool) {
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await pool.query(statement);
  }
}
