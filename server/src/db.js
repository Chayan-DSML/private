import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { randomReferralCode } from "./codes.js";

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
  const [columns] = await pool.query(
    "SHOW COLUMNS FROM ceo_office_messages LIKE 'notified_at'",
  );
  if (columns.length === 0) {
    await pool.query(
      "ALTER TABLE ceo_office_messages ADD COLUMN notified_at TIMESTAMP(3) NULL",
    );
  }
  await ensureWaitlistReferrals(pool);
  await ensureSeedPayments(pool);
}

async function ensureColumn(pool, table, column, definition) {
  const [columns] = await pool.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
    [column],
  );
  if (columns.length === 0) {
    await pool.query(
      `ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definition}`,
    );
  }
}

async function ensureWaitlistReferrals(pool) {
  await ensureColumn(pool, "waitlist_signups", "referral_code", "VARCHAR(12) NULL");
  await ensureColumn(
    pool,
    "waitlist_signups",
    "referred_by_code",
    "VARCHAR(12) NULL",
  );
  await ensureColumn(
    pool,
    "waitlist_signups",
    "reward_credits",
    "INT NOT NULL DEFAULT 0",
  );

  const [missing] = await pool.query(
    "SELECT id FROM waitlist_signups WHERE referral_code IS NULL",
  );
  for (const row of missing) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await pool.query(
          "UPDATE waitlist_signups SET referral_code = ? WHERE id = ? AND referral_code IS NULL",
          [randomReferralCode(), row.id],
        );
        break;
      } catch (error) {
        if (error?.code !== "ER_DUP_ENTRY") throw error;
      }
    }
  }

  const [indexes] = await pool.query(
    "SHOW INDEX FROM waitlist_signups WHERE Key_name = 'waitlist_referral_code'",
  );
  if (indexes.length === 0) {
    await pool.query(
      "ALTER TABLE waitlist_signups ADD UNIQUE KEY waitlist_referral_code (referral_code)",
    );
  }
}

async function ensureSeedPayments(pool) {
  await ensureColumn(
    pool,
    "seed_pledges",
    "razorpay_order_id",
    "VARCHAR(64) NULL",
  );
  await ensureColumn(
    pool,
    "seed_pledges",
    "razorpay_payment_id",
    "VARCHAR(64) NULL",
  );
  await ensureColumn(
    pool,
    "seed_pledges",
    "status",
    "VARCHAR(20) NOT NULL DEFAULT 'pending'",
  );
}
