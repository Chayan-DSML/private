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
    "waitlist_referrals",
    "waitlist_signups",
    "seed_pledges",
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
  const createdBody = await created.json();
  assert.equal(createdBody.ok, true);
  assert.equal(createdBody.alreadyJoined, false);
  assert.match(createdBody.referralCode, /^[a-z]{3}\d{3}$/);
  assert.equal(createdBody.referralUrl, `https://www.tourbhook.com/?ref=${createdBody.referralCode}`);
  assert.equal(createdBody.referralCount, 0);

  const again = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "early-access@example.com" }),
  });
  assert.equal(again.status, 201);
  const againBody = await again.json();
  assert.equal(againBody.alreadyJoined, true);
  assert.equal(againBody.referralCode, createdBody.referralCode);

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
  assert.equal(body.items[0].referral_code, createdBody.referralCode);
  assert.equal(Number(body.items[0].referral_count), 0);
});

test("referral codes are unique and counted for the referrer", async () => {
  const referrer = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "maverick.tourbhook@gmail.com" }),
  });
  const referrerBody = await referrer.json();
  assert.match(referrerBody.referralCode, /^[a-z]{3}\d{3}$/);

  const friend = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "friend@example.com",
      referralCode: referrerBody.referralCode,
    }),
  });
  const friendBody = await friend.json();
  assert.equal(friend.status, 201);
  assert.equal(friendBody.referredByCode, referrerBody.referralCode);
  assert.notEqual(friendBody.referralCode, referrerBody.referralCode);

  const repeat = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "friend@example.com",
      referralCode: referrerBody.referralCode,
    }),
  });
  const repeatBody = await repeat.json();
  assert.equal(repeatBody.alreadyJoined, true);
  assert.equal(repeatBody.referralCode, friendBody.referralCode);

  const token = await login();
  const opened = await fetch(`${base}/api/admin/waitlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = (await opened.json()).items;
  const row = items.find((item) => item.email === "maverick.tourbhook@gmail.com");
  assert.equal(Number(row.referral_count), 1);
  assert.equal(Number(row.reward_credits), 1);
});

test("seed pledges store subscription months and reject amounts outside the range", async () => {
  const low = await fetch(`${base}/api/seed-pledges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada", email: "ada@example.com", amount: 50 }),
  });
  assert.equal(low.status, 400);

  const high = await fetch(`${base}/api/seed-pledges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada", email: "ada@example.com", amount: 1000001 }),
  });
  assert.equal(high.status, 400);

  const created = await fetch(`${base}/api/seed-pledges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada Lovelace", email: "ada@example.com", amount: 1200 }),
  });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).subscriptionMonths, 12);

  const token = await login();
  const opened = await fetch(`${base}/api/admin/seed-pledges`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const items = (await opened.json()).items;
  assert.equal(items[0].email, "ada@example.com");
  assert.equal(Number(items[0].amount_inr), 1200);
  assert.equal(Number(items[0].subscription_months), 12);

  const locked = await fetch(`${base}/api/admin/seed-pledges`);
  assert.equal(locked.status, 401);
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

test("admin login stops password guessing", async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: `wrong-${attempt}`,
      }),
    });
    assert.equal(response.status, 401);
  }
  const blocked = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: "still-wrong",
    }),
  });
  assert.equal(blocked.status, 429);
});

test("invalid public payloads are rejected", async () => {
  const response = await fetch(`${base}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(response.status, 400);
});
