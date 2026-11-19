import { hashPassword } from "../src/lib/auth.ts";

const password = process.argv[2];

if (!password || password.length < 8) {
  console.error("用法: npm run auth:hash -- <密码>（至少 8 位）");
  process.exit(1);
}

console.log(`AUTH_PASSWORD_HASH="${hashPassword(password)}"`);
console.log(`AUTH_SECRET="${(await import("node:crypto")).randomBytes(32).toString("base64url")}"`);
