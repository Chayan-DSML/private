import crypto from "node:crypto";

const ORDERS_URL = "https://api.razorpay.com/v1/orders";

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const keys = razorpayKeys();
  if (!keys || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", keys.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(String(signature));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export async function createRazorpayOrder({ amountInr, receipt }) {
  const keys = razorpayKeys();
  if (!keys) {
    const error = new Error("Payments are not ready yet");
    error.status = 503;
    throw error;
  }
  const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64");
  const response = await fetch(ORDERS_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInr * 100,
      currency: "INR",
      receipt,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.id) {
    const error = new Error("Could not start the payment");
    error.status = 502;
    throw error;
  }
  return { orderId: body.id, amountPaise: body.amount, keyId: keys.keyId };
}
