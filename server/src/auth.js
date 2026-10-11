import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_TTL = "12h";

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters");
  }
  return secret;
}

export async function ensureAdmin(pool) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL or ADMIN_PASSWORD is unset; admin login is disabled",
    );
    return;
  }
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, rounds);
  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, passwordHash],
  );
}

export async function loginAdmin(pool, email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  const result = await pool.query(
    "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
    [normalized],
  );
  const admin = result.rows[0];
  if (!admin) return null;
  const matches = await bcrypt.compare(String(password || ""), admin.password_hash);
  if (!matches) return null;
  const token = jwt.sign(
    { sub: admin.id, email: admin.email },
    jwtSecret(),
    { expiresIn: TOKEN_TTL },
  );
  return { token, email: admin.email };
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Sign in required" });
  }
  try {
    req.admin = jwt.verify(token, jwtSecret());
    return next();
  } catch {
    return res.status(401).json({ error: "Sign in required" });
  }
}
