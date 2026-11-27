import crypto from "node:crypto";
import { REFERRAL_CODE, randomReferralCode } from "./codes.js";
import { query } from "./db.js";

function signupBody(row, count, alreadyJoined) {
  return {
    ok: true,
    alreadyJoined,
    referralCode: row.referral_code,
    referralUrl: `https://www.tourbhook.com/?ref=${row.referral_code}`,
    referralCount: count,
    rewardCredits: Number(row.reward_credits) || 0,
    referredByCode: row.referred_by_code,
  };
}

async function referralCount(pool, code) {
  const rows = await query(
    pool,
    "SELECT COUNT(*) AS total FROM waitlist_signups WHERE referred_by_code = ?",
    [code],
  );
  return Number(rows[0].total);
}

async function findByEmail(pool, email) {
  const rows = await query(
    pool,
    `SELECT id, email, referral_code, referred_by_code, reward_credits, latitude, longitude
     FROM waitlist_signups WHERE email = ?`,
    [email],
  );
  return rows[0] || null;
}

export function readLocation(body) {
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    latitude: Math.round(latitude * 1e6) / 1e6,
    longitude: Math.round(longitude * 1e6) / 1e6,
  };
}

export async function joinWaitlist(pool, email, rawCode, location = null) {
  const existing = await findByEmail(pool, email);
  if (existing) {
    if (
      location &&
      (existing.latitude == null || existing.longitude == null)
    ) {
      await query(
        pool,
        "UPDATE waitlist_signups SET latitude = ?, longitude = ? WHERE id = ?",
        [location.latitude, location.longitude, existing.id],
      );
    }
    return {
      status: 201,
      body: signupBody(
        existing,
        await referralCount(pool, existing.referral_code),
        true,
      ),
    };
  }

  const incoming = String(rawCode || "").trim().toLowerCase();
  if (!location) {
    return {
      status: 400,
      body: { error: "Location access is required" },
    };
  }
  let referrer = null;
  if (REFERRAL_CODE.test(incoming)) {
    const rows = await query(
      pool,
      "SELECT email, referral_code FROM waitlist_signups WHERE referral_code = ?",
      [incoming],
    );
    if (rows[0] && rows[0].email !== email) referrer = rows[0];
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomReferralCode();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO waitlist_signups
           (id, email, referral_code, referred_by_code, reward_credits, latitude, longitude)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [
          crypto.randomUUID(),
          email,
          code,
          referrer ? referrer.referral_code : null,
          location ? location.latitude : null,
          location ? location.longitude : null,
        ],
      );
      if (referrer) {
        await conn.query(
          `INSERT INTO waitlist_referrals
             (id, referrer_email, referral_code, referred_email)
           VALUES (?, ?, ?, ?)`,
          [
            crypto.randomUUID(),
            referrer.email,
            referrer.referral_code,
            email,
          ],
        );
        await conn.query(
          "UPDATE waitlist_signups SET reward_credits = reward_credits + 1 WHERE referral_code = ?",
          [referrer.referral_code],
        );
      }
      await conn.commit();
      return {
        status: 201,
        body: {
          ok: true,
          alreadyJoined: false,
          referralCode: code,
          referralUrl: `https://www.tourbhook.com/?ref=${code}`,
          referralCount: 0,
          rewardCredits: 0,
          referredByCode: referrer ? referrer.referral_code : null,
        },
      };
    } catch (error) {
      await conn.rollback();
      if (error?.code === "ER_DUP_ENTRY" && String(error.sqlMessage || error.message).includes("waitlist_email")) {
        const raced = await findByEmail(pool, email);
        if (raced) {
          return {
            status: 201,
            body: signupBody(
              raced,
              await referralCount(pool, raced.referral_code),
              true,
            ),
          };
        }
      }
      if (error?.code === "ER_DUP_ENTRY") continue;
      throw error;
    } finally {
      conn.release();
    }
  }
  throw new Error("Could not create a referral code");
}
