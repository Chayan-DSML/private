import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { ensureAdmin, loginAdmin, requireAdmin } from "./auth.js";
import { createPool, migrate, query } from "./db.js";
import { deleteResume, isCloudResume, openResume, saveResume } from "./resumes.js";

const serverRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
dotenv.config({ path: path.join(serverRoot, ".env") });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map();

function text(value, max) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function optionalUrl(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length > 500) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      return res
        .status(429)
        .json({ error: "Too many requests. Try again shortly." });
    }
    recent.push(now);
    hits.set(key, recent);
    return next();
  };
}

const RESUME_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function createApp(pool, uploadDir) {
  const resumeBucket = process.env.RESUME_BUCKET || "";
  fs.mkdirSync(uploadDir, { recursive: true });
  const upload = multer({
    storage: resumeBucket
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: uploadDir,
          filename: (_req, file, callback) => {
            const ext = path.extname(file.originalname).toLowerCase();
            callback(null, `${crypto.randomUUID()}${ext}`);
          },
        }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowed = ext === ".pdf" || ext === ".doc" || ext === ".docx";
      callback(
        allowed ? null : new Error("Resume must be a PDF, DOC, or DOCX"),
        allowed,
      );
    },
  });

  const app = express();
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://127.0.0.1:5173",
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  const publicWrite = rateLimit(30, 60_000);

  app.get("/api/health", async (_req, res, next) => {
    try {
      await query(pool, "SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/waitlist", publicWrite, async (req, res, next) => {
    try {
      const email = text(req.body?.email, 320)?.toLowerCase();
      if (!email || !EMAIL.test(email)) {
        return res.status(400).json({ error: "Enter a valid email address" });
      }
      const inserted = await query(
        pool,
        "INSERT IGNORE INTO waitlist_signups (id, email) VALUES (?, ?)",
        [crypto.randomUUID(), email],
      );
      return res.status(201).json({
        ok: true,
        alreadyJoined: inserted.affectedRows === 0,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/contact", publicWrite, async (req, res, next) => {
    try {
      const name = text(req.body?.name, 200);
      const email = text(req.body?.email, 320)?.toLowerCase();
      const message = text(req.body?.message, 5000);
      if (!name || !email || !EMAIL.test(email) || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      const id = crypto.randomUUID();
      await query(
        pool,
        `INSERT INTO contact_messages (id, name, email, message)
         VALUES (?, ?, ?, ?)`,
        [id, name, email, message],
      );
      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/partners", publicWrite, async (req, res, next) => {
    try {
      const fullName = text(req.body?.fullName, 200);
      const phone = text(req.body?.phone, 40);
      const experience = text(req.body?.experience, 80);
      const location = text(req.body?.location, 200);
      if (!fullName || !phone || !experience || !location) {
        return res.status(400).json({ error: "All partner fields are required" });
      }
      const id = crypto.randomUUID();
      await query(
        pool,
        `INSERT INTO partner_applications (id, full_name, phone, experience, location)
         VALUES (?, ?, ?, ?, ?)`,
        [id, fullName, phone, experience, location],
      );
      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.post("/api/ideas", publicWrite, async (req, res, next) => {
    try {
      const body = text(req.body?.body, 2000);
      if (!body) {
        return res.status(400).json({ error: "Describe the idea you want us to build" });
      }
      const id = crypto.randomUUID();
      await query(
        pool,
        "INSERT INTO feature_ideas (id, body) VALUES (?, ?)",
        [id, body],
      );
      return res.status(201).json({ ok: true, id });
    } catch (error) {
      return next(error);
    }
  });

  app.post(
    "/api/applications",
    publicWrite,
    upload.single("resume"),
    async (req, res, next) => {
      try {
        const roleId = text(req.body?.roleId, 80);
        const roleTitle = text(req.body?.roleTitle, 200);
        const fullName = text(req.body?.fullName, 200);
        const email = text(req.body?.email, 320)?.toLowerCase();
        const phone = String(req.body?.phone ?? "").trim();
        const experience = text(req.body?.experience, 80);
        const whyJoin = text(req.body?.whyJoin, 5000);
        const linkedinUrl = optionalUrl(req.body?.linkedinUrl);
        const githubUrl = optionalUrl(req.body?.githubUrl);
        if (
          !roleId ||
          !roleTitle ||
          !fullName ||
          !email ||
          !EMAIL.test(email) ||
          !experience ||
          !whyJoin ||
          linkedinUrl === null ||
          githubUrl === null ||
          phone.length > 40 ||
          !req.file
        ) {
          if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});
          return res.status(400).json({
            error: "Name, email, experience, resume, and a short note are required",
          });
        }
        const id = crypto.randomUUID();
        const ext = path.extname(req.file.originalname).toLowerCase();
        const storedName = resumeBucket
          ? `resumes/${crypto.randomUUID()}${ext}`
          : req.file.filename;
        if (resumeBucket) {
          await saveResume(
            resumeBucket,
            storedName,
            req.file.buffer,
            RESUME_TYPES[ext] || "application/octet-stream",
          );
        }
        try {
          await query(
            pool,
            `INSERT INTO job_applications (
               id, role_id, role_title, full_name, email, phone, linkedin_url,
               experience, github_url, why_join, resume_filename, resume_stored_name
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              roleId,
              roleTitle,
              fullName,
              email,
              phone,
              linkedinUrl,
              experience,
              githubUrl,
              whyJoin,
              path.basename(req.file.originalname),
              storedName,
            ],
          );
        } catch (error) {
          if (resumeBucket) await deleteResume(resumeBucket, storedName);
          throw error;
        }
        return res.status(201).json({ ok: true, id });
      } catch (error) {
        if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});
        return next(error);
      }
    },
  );

  app.post("/api/admin/login", async (req, res, next) => {
    try {
      const session = await loginAdmin(pool, req.body?.email, req.body?.password);
      if (!session) {
        return res.status(401).json({ error: "Email or password is incorrect" });
      }
      return res.json(session);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/waitlist", requireAdmin, async (_req, res, next) => {
    try {
      const items = await query(
        pool,
        "SELECT id, email, created_at FROM waitlist_signups ORDER BY created_at DESC",
      );
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/contacts", requireAdmin, async (_req, res, next) => {
    try {
      const items = await query(
        pool,
        "SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC",
      );
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/partners", requireAdmin, async (_req, res, next) => {
    try {
      const items = await query(
        pool,
        `SELECT id, full_name, phone, experience, location, created_at
         FROM partner_applications ORDER BY created_at DESC`,
      );
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/ideas", requireAdmin, async (_req, res, next) => {
    try {
      const items = await query(
        pool,
        "SELECT id, body, created_at FROM feature_ideas ORDER BY created_at DESC",
      );
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/applications", requireAdmin, async (_req, res, next) => {
    try {
      const items = await query(
        pool,
        `SELECT id, role_id, role_title, full_name, email, phone, linkedin_url,
                experience, github_url, why_join, resume_filename, created_at
         FROM job_applications ORDER BY created_at DESC`,
      );
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/applications/:id/resume", requireAdmin, async (req, res, next) => {
    try {
      const rows = await query(
        pool,
        "SELECT resume_filename, resume_stored_name FROM job_applications WHERE id = ?",
        [req.params.id],
      );
      const row = rows[0];
      if (!row) return res.status(404).json({ error: "Application not found" });
      const downloadName = path.basename(row.resume_filename).replace(/[\r\n"]/g, "");
      if (isCloudResume(row.resume_stored_name)) {
        const stream = await openResume(resumeBucket, row.resume_stored_name);
        if (!stream) return res.status(404).json({ error: "Resume file not found" });
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${downloadName}"`,
        );
        stream.on("error", next);
        return stream.pipe(res);
      }
      const stored = path.basename(row.resume_stored_name);
      const filePath = path.join(uploadDir, stored);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Resume file not found" });
      }
      return res.download(filePath, downloadName);
    } catch (error) {
      return next(error);
    }
  });

  const distDir = process.env.STATIC_DIR
    ? path.resolve(process.env.STATIC_DIR)
    : path.resolve(serverRoot, "../dist");
  if (fs.existsSync(path.join(distDir, "index.html"))) {
    app.use(express.static(distDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Resume must be 5MB or smaller" });
    }
    if (error?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    if (error instanceof Error && /Resume must be/.test(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}

export async function start() {
  const pool = createPool();
  await migrate(pool);
  await ensureAdmin(pool);
  const uploadDir = path.resolve(
    serverRoot,
    process.env.UPLOAD_DIR || "uploads",
  );
  const app = createApp(pool, uploadDir);
  const port = Number(process.env.PORT || 8787);
  const server = await new Promise((resolve) => {
    const listener = app.listen(port, "0.0.0.0", () => resolve(listener));
  });
  const address = server.address();
  const boundPort = typeof address === "object" && address ? address.port : port;
  return { server, pool, port: boundPort };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  start()
    .then(({ port }) => {
      console.log(`Tourbhook API listening on ${port}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
