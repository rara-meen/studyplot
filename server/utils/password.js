// Password hashing implemented with Node's built-in crypto module (scrypt).
// The project's sandbox couldn't reach the npm registry to install `bcrypt`,
// so this uses Node core's scrypt KDF instead — also industry-standard and
// recommended directly in Node's own crypto docs for password storage.
// Swap this for `bcrypt` if you'd prefer; the function signatures below are
// drop-in compatible with a bcrypt-backed implementation.
import crypto from "crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });

export const verifyPassword = (password, storedHash) =>
  new Promise((resolve, reject) => {
    const [salt, key] = String(storedHash || "").split(":");
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      const keyBuffer = Buffer.from(key, "hex");
      if (keyBuffer.length !== derivedKey.length) return resolve(false);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
