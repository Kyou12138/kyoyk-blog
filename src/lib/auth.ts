import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const secret = (): string => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("缺少 AUTH_SECRET（至少 16 字符），请在环境变量中配置。");
  }
  return value;
};

/** 存储格式：scrypt:16384:<saltHex>:<hashHex>，由 `npm run auth:hash` 生成。 */
export const hashPassword = (password: string): string => {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize("NFKC"), salt, KEY_LENGTH, SCRYPT);
  return `scrypt:${SCRYPT.N}:${salt.toString("hex")}:${hash.toString("hex")}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [scheme, iterations, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password.normalize("NFKC"), salt, expected.length, {
    ...SCRYPT,
    N: Number(iterations) || SCRYPT.N,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const sign = (payload: string): string =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export const createToken = (ttlMs: number, scope = "admin"): string => {
  const payload = `${scope}.${Date.now() + ttlMs}`;
  return `${payload}.${sign(payload)}`;
};

export const verifyToken = (token: string | undefined, scope = "admin"): boolean => {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenScope, expires, signature] = parts;
  if (tokenScope !== scope) return false;
  if (Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(`${tokenScope}.${expires}`));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

