/**
 * 最小自检：不依赖框架，直接断言核心逻辑。
 * 运行：node --experimental-strip-types scripts/self-check.mts
 */
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createToken, verifyToken } from "../src/lib/auth.ts";
import { dateParts, readingMinutes } from "../src/lib/format.ts";
import { plainExcerpt, renderMarkdown } from "../src/lib/markdown.ts";
import { openSecret, sealSecret } from "../src/lib/secret.ts";

process.env.AUTH_SECRET = "self-check-secret-value";

// Markdown：代码高亮 + HTML 保留
const html = renderMarkdown("# 标题\n\n```js\nconst a = 1;\n```\n\n<div>raw</div>");
assert.match(html, /<h1>标题<\/h1>/);
assert.match(html, /hljs/);
assert.match(html, /<div>raw<\/div>/);

// 摘要：去掉标记，截断加省略号
assert.equal(plainExcerpt("## 标题\n\n![x](/a.png) 正文内容"), "标题 正文内容");
assert.ok(plainExcerpt("字".repeat(300)).endsWith("…"));

// 日期：固定东八区，permalink 不会因服务器时区漂移
assert.deepEqual(dateParts("2026-03-10T00:00:00.000Z"), { year: "2026", month: "03", day: "10" });
assert.equal(readingMinutes("中文".repeat(400)), 2);

// 密码哈希：正确密码通过，错误密码拒绝
const stored = hashPassword("correct horse");
assert.equal(verifyPassword("correct horse", stored), true);
assert.equal(verifyPassword("wrong horse", stored), false);

// 会话 token：有效、过期、篡改
const token = createToken(60_000);
assert.equal(verifyToken(token), true);
assert.equal(verifyToken(createToken(-1000)), false);
assert.equal(verifyToken(token.slice(0, -2) + "aa"), false);

// 私有笔记：密钥往返，密码错误返回 null，密文被改动返回 null
const secret = sealSecret("抢票脚本正文", "note-pass", "VX");
assert.equal(openSecret(secret, "note-pass"), "抢票脚本正文");
assert.equal(openSecret(secret, "wrong-pass"), null);
assert.equal(openSecret({ ...secret, ct: secret.ct.slice(0, -4) + "AAAA" }, "note-pass"), null);
assert.equal(secret.hint, "VX");

console.log("self-check: 全部通过");
