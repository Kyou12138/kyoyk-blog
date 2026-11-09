/**
 * 最小自检：不依赖框架，直接断言核心逻辑。
 * 运行：node --experimental-strip-types scripts/self-check.mts
 */
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createToken, verifyToken } from "../src/lib/auth.ts";
import { dateParts, readingMinutes } from "../src/lib/format.ts";
import { plainExcerpt, renderMarkdown, renderPost, stripLeadingTitle } from "../src/lib/markdown.ts";
import { openSecret, sealSecret } from "../src/lib/secret.ts";

process.env.AUTH_SECRET = "self-check-secret-value";

// Markdown：代码高亮 + HTML 保留
const html = renderMarkdown("# 标题\n\n```js\nconst a = 1;\n```\n\n<div>raw</div>");
assert.match(html, /<h2 id="标题">/);
assert.match(html, /hljs/);
assert.match(html, /<div>raw<\/div>/);

// 正文首行同名 H1 去重；标题不同则保留
assert.equal(stripLeadingTitle("# WPF笔记\n正文", "WPF笔记"), "正文");
assert.equal(stripLeadingTitle("# 布局\n正文", "WPF笔记"), "# 布局\n正文");

// 标题降级 + 锚点：正文 h1 降成 h2，重复标题自动加序号，h4/h5 不进目录
const rendered = renderPost("# 布局\n\n## Grid\n\n# 布局\n\n### 细节", "无关");
assert.deepEqual(
  rendered.headings.map((h) => `${h.level}:${h.id}`),
  ["2:布局", "3:grid", "2:布局-2"],
);
assert.match(rendered.html, /<h2 id="布局">/);
assert.match(rendered.html, /class="heading-anchor"/);
assert.match(rendered.html, /<h4>细节<\/h4>/);

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

import { existsSync, readFileSync } from "node:fs";

// 基础资产与 SEO 守卫
assert.ok(existsSync("public/favicon.ico"), "public/favicon.ico 必须存在");

const robotsSource = readFileSync("src/app/robots.ts", "utf8");
assert.match(robotsSource, /disallow:\s*\["/);
assert.match(robotsSource, /\/admin\//);
assert.match(robotsSource, /\/api\//);
assert.match(robotsSource, /sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/);

const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
assert.match(layoutSource, /icons:\s*\{/);
assert.match(layoutSource, /kyou-social-card\.png/);
assert.match(layoutSource, /summary_large_image/);

// 404 兜底页守卫
const notFoundSource = readFileSync("src/app/not-found.tsx", "utf8");
assert.match(notFoundSource, /href="\/"/);
assert.match(notFoundSource, /href="\/blog"/);
assert.doesNotMatch(notFoundSource, /文章/);
assert.match(notFoundSource, /笔记/);

// 平台自适应快捷键提示守卫
const headerSource = readFileSync("src/components/SiteHeader.tsx", "utf8");
assert.match(headerSource, /⌘/);
assert.match(headerSource, /Ctrl/);

// 领域术语守卫：防止 UI 出现 GLOSSARY.md 禁用的「文章」「分类」同义词漂移
const tocSource = readFileSync("src/components/TableOfContents.tsx", "utf8");
assert.doesNotMatch(tocSource, /aria-label="文章目录"/);
assert.match(tocSource, /aria-label="笔记目录"/);

const kgraphSource = readFileSync("src/components/KnowledgeGraph.tsx", "utf8");
assert.doesNotMatch(kgraphSource, /查看分类/);
assert.match(kgraphSource, /查看标签/);

console.log("self-check: 全部通过");
