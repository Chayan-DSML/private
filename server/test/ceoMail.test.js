import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { CEO_INBOX, ceoOfficeMail, sendCeoOfficeNote } from "../src/ceoMail.js";

const note = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Asha",
  email: "asha@example.com",
  topic: "New feature",
  message: "Please add trains between cities.",
};

test("a CEO note is addressed to the office inbox and replies to the visitor", () => {
  delete process.env.CEO_NOTIFY_EMAIL;
  process.env.SMTP_USER = "sender@example.com";
  process.env.SMTP_FROM = "TourBhook CEO Office <sender@example.com>";
  const mail = ceoOfficeMail(note);
  assert.equal(mail.to, CEO_INBOX);
  assert.equal(mail.replyTo, "asha@example.com");
  assert.equal(mail.subject, "CEO's Office: New feature");
  assert.match(mail.text, /Please add trains between cities/);
  assert.match(mail.text, /11111111-1111-1111-1111-111111111111/);
  assert.doesNotMatch(mail.text, /hello\.tourbhook@gmail\.com/);
});

test("sendCeoOfficeNote delivers that same message", async () => {
  delete process.env.CEO_NOTIFY_EMAIL;
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const info = await sendCeoOfficeNote(note, transport);
  const sent = JSON.parse(info.message);
  assert.equal(sent.to[0].address, CEO_INBOX);
  assert.equal(sent.replyTo[0].address, "asha@example.com");
  assert.match(sent.subject, /New feature/);
  assert.match(sent.text, /Please add trains between cities/);
});
