import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

process.env.DATABASE_HOST = process.env.DATABASE_HOST || "127.0.0.1";
process.env.DATABASE_PORT = process.env.DATABASE_PORT || "3306";
process.env.JWT_SECRET = "test-secret-test-secret";
process.env.ADMIN_EMAIL = "admin@tourbhook.test";
process.env.ADMIN_PASSWORD = "test-password-123";
process.env.BCRYPT_ROUNDS = "4";
process.env.PORT = "0";
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "tourbhook-uploads-"));

const { start } = await import("../src/index.js");

const started = await start();
const base = `http://127.0.0.1:${started.port}`;

async function login() {
  const response = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.token);
  return body.token;
}

async function clearLeads() {
  for (const table of [
    "waitlist_signups",
    "contact_messages",
    "job_applications",
    "partner_applications",
    "feature_ideas",
  ]) {
    await started.pool.query(`TRUNCATE TABLE ${table}`);
  }
}

test.before(clearLeads);

test.after(async () => {
  await clearLeads();
  await started.pool.query("DELETE FROM admin_users WHERE email = ?", [
    "admin@tourbhook.test",
  ]);
  await started.pool.end();
  started.server.close();
});

test("health check reaches MySQL", async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("waitlist signup is stored and hidden without a JWT", async () => {
  const created = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "Early-Access@Example.com" }),
  });
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), { ok: true, alreadyJoined: false });

  const again = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "early-access@example.com" }),
  });
  assert.equal(again.status, 201);
  assert.equal((await again.json()).alreadyJoined, true);

  const locked = await fetch(`${base}/api/admin/waitlist`);
  assert.equal(locked.status, 401);

  const token = await login();
  const opened = await fetch(`${base}/api/admin/waitlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(opened.status, 200);
  const body = await opened.json();
  assert.equal(body.items.length, 1);
  assert.equal(body.items[0].email, "early-access@example.com");
});

test("contact, partner, and idea posts are readable by an admin", async () => {
  const contact = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Avery Chen",
      email: "avery@example.com",
      message: "When does the Bali guide open?",
    }),
  });
  assert.equal(contact.status, 201);

  const partner = await fetch(`${base}/api/partners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Ravi Menon",
      phone: "+91 98765 43210",
      experience: "5+ Years",
      location: "Kochi, Kerala",
    }),
  });
  assert.equal(partner.status, 201);

  const idea = await fetch(`${base}/api/ideas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: "Share an itinerary with people who do not have the app.",
    }),
  });
  assert.equal(idea.status, 201);

  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const contacts = await fetch(`${base}/api/admin/contacts`, { headers });
  const partners = await fetch(`${base}/api/admin/partners`, { headers });
  const ideas = await fetch(`${base}/api/admin/ideas`, { headers });
  assert.equal((await contacts.json()).items[0].message, "When does the Bali guide open?");
  assert.equal((await partners.json()).items[0].location, "Kochi, Kerala");
  assert.match((await ideas.json()).items[0].body, /itinerary/);
});

test("job application stores the resume for an admin download", async () => {
  const form = new FormData();
  form.set("roleId", "senior-fullstack");
  form.set("roleTitle", "Senior Full Stack Developer");
  form.set("fullName", "Avery Chen");
  form.set("email", "avery@example.com");
  form.set("phone", "+91 90000 00000");
  form.set("experience", "5+ years");
  form.set("whyJoin", "I would like to help build Tour Bhook.");
  form.set("linkedinUrl", "https://linkedin.com/in/avery");
  form.set("githubUrl", "https://github.com/avery");
  form.set(
    "resume",
    new File(["%PDF-1.1 resume"], "avery-chen-resume.pdf", {
      type: "application/pdf",
    }),
  );

  const created = await fetch(`${base}/api/applications`, {
    method: "POST",
    body: form,
  });
  assert.equal(created.status, 201);
  const { id } = await created.json();

  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const list = await fetch(`${base}/api/admin/applications`, { headers });
  const items = (await list.json()).items;
  assert.equal(items[0].id, id);
  assert.equal(items[0].resume_filename, "avery-chen-resume.pdf");

  const resume = await fetch(`${base}/api/admin/applications/${id}/resume`, {
    headers,
  });
  assert.equal(resume.status, 200);
  assert.match(await resume.text(), /resume/);

  const missing = await fetch(`${base}/api/admin/applications/${id}/resume`);
  assert.equal(missing.status, 401);
});

test("invalid public payloads are rejected", async () => {
  const response = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(response.status, 400);
});
