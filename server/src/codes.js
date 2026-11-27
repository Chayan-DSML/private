import crypto from "node:crypto";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

export const REFERRAL_CODE = /^[a-z]{3}\d{3}$/;

export function randomReferralCode() {
  let letters = "";
  for (let i = 0; i < 3; i += 1) {
    letters += LETTERS[crypto.randomInt(LETTERS.length)];
  }
  return letters + String(crypto.randomInt(0, 1000)).padStart(3, "0");
}
