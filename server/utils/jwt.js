// Minimal HMAC-SHA256 JWT implementation using Node's built-in crypto module.
// The project's sandbox couldn't reach the npm registry to install
// `jsonwebtoken`, so this hand-rolls the standard JWT structure (header,
// payload, HMAC signature) instead. Swap this for `jsonwebtoken` if you'd
// prefer; signToken/verifyToken are drop-in compatible with that API.
import crypto from "crypto";
import { config } from "../config/config.js";

const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

const base64url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const base64urlDecode = (input) => {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf8");
};

const sign = (data) =>
  crypto
    .createHmac("sha256", config.jwtSecret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const signToken = (payload, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(fullPayload));
  const signature = sign(`${headerPart}.${payloadPart}`);

  return `${headerPart}.${payloadPart}.${signature}`;
};

export const verifyToken = (token) => {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signature] = parts;
  const expectedSignature = sign(`${headerPart}.${payloadPart}`);

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
