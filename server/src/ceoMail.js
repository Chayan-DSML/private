import nodemailer from "nodemailer";

export const CEO_INBOX = "maverick.tourbhook@gmail.com";

export function ceoInbox() {
  return (process.env.CEO_NOTIFY_EMAIL || CEO_INBOX).trim();
}

export function createCeoTransport() {
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "");
  if (!user || !pass) {
    const error = new Error("SMTP_USER and SMTP_PASS are required to email the CEO's Office");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    ignoreTLS: process.env.SMTP_IGNORE_TLS === "true",
  });
}

export function ceoOfficeMail({ id, name, email, topic, message }) {
  const topicLabel = topic || "Note";
  const sender = String(process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  return {
    from: sender,
    to: ceoInbox(),
    replyTo: email,
    subject: `CEO's Office: ${topicLabel}`,
    text: [
      "A new note arrived for the CEO's Office.",
      "",
      `Name: ${name || "(not given)"}`,
      `Reply-to: ${email}`,
      `Topic: ${topicLabel}`,
      `Record: ${id}`,
      "",
      message,
      "",
      "This note is also stored in the private database and is not shown on the website.",
    ].join("\n"),
  };
}

export async function sendCeoOfficeNote(note, transport = createCeoTransport()) {
  return transport.sendMail(ceoOfficeMail(note));
}
