import puppeteer from "puppeteer-core";
import { query } from "./db.js";

const SHEET_ID = "1Keb7wKRBunizhsx6CxpOnQomf2FpfrvB13-ilq5PXak";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

function formatIst(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} IST`;
}

function cell(value) {
  return String(value ?? "").replace(/[\t\r\n]/g, " ").trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i += 1;
        } else quoted = false;
      } else current += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(current);
      current = "";
    } else if (char === "\n") {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else if (char !== "\r") current += char;
  }
  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value !== ""));
}

async function existingKeys(sheet) {
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}&t=${Date.now()}`,
  );
  const rows = parseCsv(await response.text());
  const keys = new Set();
  rows.slice(1).forEach((item) => {
    if (item[0]) keys.add(item[0]);
  });
  return { nextRow: rows.length + 1, keys };
}

async function loadRows(pool) {
  const waitlist = await query(
    pool,
    `SELECT s.referral_code, s.email, s.referred_by_code, s.reward_credits,
            s.created_at, s.latitude, s.longitude,
            (SELECT COUNT(*) FROM waitlist_signups c WHERE c.referred_by_code = s.referral_code) AS referral_count
     FROM waitlist_signups s ORDER BY s.created_at`,
  );
  const crew = await query(
    pool,
    `SELECT id, role_id, role_title, full_name, email, phone, linkedin_url, experience,
            github_url, why_join, resume_filename, created_at, latitude, longitude
     FROM job_applications ORDER BY created_at`,
  );
  const seed = await query(
    pool,
    `SELECT id, name, amount_inr, email, note, razorpay_payment_id, razorpay_order_id,
            status, created_at, latitude, longitude
     FROM seed_pledges ORDER BY created_at`,
  );
  const ceo = await query(
    pool,
    `SELECT id, name, email, topic, message, created_at, notified_at, latitude, longitude
     FROM ceo_office_messages ORDER BY created_at`,
  );
  const contact = await query(
    pool,
    `SELECT id, name, email, message, created_at, latitude, longitude
     FROM contact_messages ORDER BY created_at`,
  );
  const partner = await query(
    pool,
    `SELECT id, full_name, phone, experience, location, created_at, latitude, longitude
     FROM partner_applications ORDER BY created_at`,
  );
  const place = (row) => [row.latitude ?? "", row.longitude ?? ""];
  return [
    ["waitlist", waitlist.map((row) => [row.referral_code, row.email, row.referred_by_code || "", row.referral_count, row.reward_credits, formatIst(row.created_at), "", ...place(row)])],
    ["crewBhook", crew.map((row) => [row.id, row.role_id, row.role_title, row.full_name, row.email, row.phone || "", row.linkedin_url || "", row.experience, row.github_url || "", row.why_join, row.resume_filename, formatIst(row.created_at), ...place(row)])],
    ["seedBhook", seed.map((row) => [row.id, row.name, row.amount_inr, row.email, row.note || "", row.razorpay_payment_id || "", row.razorpay_order_id || "", row.status, formatIst(row.created_at), ...place(row)])],
    ["ceo-office", ceo.map((row) => [row.id, row.name || "", row.email, row.topic || "", row.message, formatIst(row.created_at), formatIst(row.notified_at), ...place(row)])],
    ["contact-us", contact.map((row) => [row.id, row.name, row.email, row.message, formatIst(row.created_at), ...place(row)])],
    ["partner", partner.map((row) => [row.id, row.full_name, row.phone, row.experience, row.location, formatIst(row.created_at), ...place(row)])],
  ];
}

async function writeRows(page, sheet, startRow, rows) {
  const point = await page.evaluate((wanted) => {
    const tabs = [...document.querySelectorAll(".docs-sheet-tab")];
    const tab = tabs.find((el) => (el.textContent || "").includes(wanted));
    if (!tab) return null;
    const rect = tab.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + 8 };
  }, sheet);
  if (!point) throw new Error(`Missing sheet ${sheet}`);
  await page.mouse.click(point.x, point.y);
  await new Promise((resolve) => setTimeout(resolve, 700));
  for (let index = 0; index < rows.length; index += 1) {
    const box = await page.$("#t-name-box");
    await box.click({ clickCount: 3 });
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.type(`A${startRow + index}`);
    await page.keyboard.press("Enter");
    await new Promise((resolve) => setTimeout(resolve, 250));
    const values = rows[index];
    for (let column = 0; column < values.length; column += 1) {
      const value = cell(values[column]);
      if (value) await page.keyboard.type(value);
      if (column < values.length - 1) await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Enter");
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

async function syncAll(pool) {
  const tables = await loadRows(pool);
  const pending = [];
  for (const [sheet, rows] of tables) {
    const current = await existingKeys(sheet);
    const missing = rows.filter((row) => row[0] && !current.keys.has(String(row[0])));
    if (missing.length) pending.push([sheet, current.nextRow, missing]);
  }
  if (!pending.length) return;
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(SHEET_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector(".docs-sheet-tab", { timeout: 60000 });
    for (const [sheet, startRow, rows] of pending) {
      await writeRows(page, sheet, startRow, rows);
    }
  } finally {
    await browser.close();
  }
}

let chain = Promise.resolve();

export function scheduleSheetSync(pool) {
  if (process.env.PORT === "0" || process.env.SHEET_SYNC === "off") return;
  chain = chain.then(() => syncAll(pool)).catch((error) => {
    console.error("sheet sync failed:", error.message);
  });
}
