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
  await ensurePulseReads(pool);
  await ensureFeatureVotes(pool);
}

const PULSE_READ_START = {
  "beyond-bookings": 624,
  "jaipur-vision": 487,
};

export function pulseReadSlugs() {
  return PULSE_READ_START;
}

async function ensurePulseReads(pool) {
  for (const [slug, reads] of Object.entries(PULSE_READ_START)) {
    await pool.query(
      "INSERT IGNORE INTO pulse_reads (slug, read_count) VALUES (?, ?)",
      [slug, reads],
    );
  }
}

const FEATURE_VOTE_START = {
  f1: 1243,
  f2: 987,
  f3: 876,
  f4: 698,
  f5: 445,
};

export function featureVoteIds() {
  return FEATURE_VOTE_START;
}

async function ensureFeatureVotes(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feature_votes (
      feature_id VARCHAR(16) NOT NULL PRIMARY KEY,
      votes INT NOT NULL
    )
  `);
  for (const [featureId, votes] of Object.entries(FEATURE_VOTE_START)) {
    await pool.query(
      "INSERT IGNORE INTO feature_votes (feature_id, votes) VALUES (?, ?)",
      [featureId, votes],
    );
  }
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
  await ensureColumn(pool, "waitlist_signups", "latitude", "DECIMAL(9,6) NULL");
  await ensureColumn(pool, "waitlist_signups", "longitude", "DECIMAL(9,6) NULL");
  for (const table of [
    "seed_pledges",
    "contact_messages",
    "ceo_office_messages",
    "partner_applications",
    "job_applications",
  ]) {
    await ensureColumn(pool, table, "latitude", "DECIMAL(9,6) NULL");
    await ensureColumn(pool, table, "longitude", "DECIMAL(9,6) NULL");
  }

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
