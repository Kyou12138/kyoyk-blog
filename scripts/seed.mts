import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
import { Client } from "pg";
import { plainExcerpt } from "../src/lib/markdown.ts";
import { sealSecret } from "../src/lib/secret.ts";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  /* 容器内没有 .env.local，环境变量由 compose 注入 */
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("缺少 DATABASE_URL");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
const blogDir = path.join(process.cwd(), "blog");
const privatePassword = process.env.SEED_PRIVATE_PASSWORD ?? null;

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const client = new Client({
  connectionString,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

const copyAsset = async (absolute: string): Promise<string> => {
  const buffer = await fs.readFile(absolute);
  const sha = createHash("sha256").update(buffer).digest("hex");
  const ext = path.extname(absolute).toLowerCase();
  const target = path.join(uploadsDir, `${sha}${ext}`);

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(target, buffer).catch(() => undefined);

  await client.query(
    `insert into assets (sha256, mime, size) values ($1, $2, $3) on conflict (sha256) do nothing`,
    [sha, MIME[ext] ?? "application/octet-stream", buffer.length],
  );

  return `/uploads/${sha}${ext}`;
};

/** 把文章里 ./assets/xxx.png 这类相对图片搬到上传目录并改写链接。 */
const rewriteAssets = async (content: string, baseDir: string): Promise<string> => {
  const matches = [...content.matchAll(/(?:\.\/)?assets\/[^\s)"'<>]+/g)];
  let result = content;

  for (const match of matches) {
    const relative = match[0];
    const absolute = path.resolve(baseDir, relative.replace(/^\.\//, ""));
    try {
      await fs.access(absolute);
    } catch {
      continue;
    }
    const url = await copyAsset(absolute);
    result = result.split(relative).join(url);
  }

  return result;
};

const listMarkdown = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(entry.parentPath ?? dir, entry.name));
};

const parseFile = async (file: string) => {
  const relative = path.relative(blogDir, file);
  const year = relative.split(path.sep)[0];
  const base = path.basename(file, ".md");

  // 日期可能来自文件名（04-01-es6.md）或目录名（09-17-npm/index.md）。
  const source = base === "index" ? path.basename(path.dirname(file)) : base;
  const dateMatch = /^(\d{2})-(\d{2})-(.+)$/.exec(source);

  const slug = dateMatch ? dateMatch[3] : source.replace(/^\d{2}-/, "");

  const month = dateMatch?.[1] ?? "01";
  const day = dateMatch?.[2] ?? "01";
  const publishedAt = /^\d{4}$/.test(year) ? `${year}-${month}-${day}T08:00:00+08:00` : null;

  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  const body = await rewriteAssets(content, path.dirname(file));

  const truncateIndex = body.indexOf("<!-- truncate -->");
  const excerpt = plainExcerpt(truncateIndex > 0 ? body.slice(0, truncateIndex) : body);

  const rawTags = Array.isArray(data.tags) ? data.tags : data.tags ? String(data.tags).split(",") : [];
  const tags = rawTags.map((tag: unknown) => String(tag).trim().toLowerCase()).filter(Boolean);

  return {
    slug,
    title: String(data.title ?? slug),
    description: data.description ? String(data.description) : null,
    body,
    excerpt,
    tags,
    publishedAt,
    isEncrypted: Boolean(data.passwordHash || data.password),
    passwordHint: data.passwordHint ? String(data.passwordHint) : null,
  };
};

await client.connect();
await fs.mkdir(uploadsDir, { recursive: true });

const files = await listMarkdown(blogDir);
let imported = 0;

for (const file of files) {
  const post = await parseFile(file);

  const secret = post.isEncrypted && privatePassword
    ? sealSecret(post.body, privatePassword, post.passwordHint)
    : null;
  const status = post.isEncrypted ? (secret ? "private" : "draft") : "published";

  const { rows } = await client.query<{ id: string }>(
    `insert into posts (slug, title, description, body, secret, excerpt, status, published_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (slug) do update set
       title = excluded.title,
       description = excluded.description,
       body = excluded.body,
       secret = excluded.secret,
       excerpt = excluded.excerpt,
       status = excluded.status,
       published_at = excluded.published_at,
       updated_at = now()
     returning id`,
    [
      post.slug,
      post.title,
      post.description,
      secret ? null : post.body,
      secret,
      post.excerpt,
      status,
      post.publishedAt,
    ],
  );

  const postId = rows[0].id;
  await client.query("delete from post_tags where post_id = $1", [postId]);

  for (const name of post.tags) {
    const tag = await client.query<{ id: number }>(
      `insert into tags (name) values ($1) on conflict (name) do update set name = excluded.name returning id`,
      [name],
    );
    await client.query("insert into post_tags (post_id, tag_id) values ($1, $2) on conflict do nothing", [
      postId,
      tag.rows[0].id,
    ]);
  }

  imported += 1;
  console.log(`${status === "published" ? "✓" : "⚠"} ${post.slug} → ${status}`);
}

console.log(`\n导入 ${imported} 篇。`);
if (!privatePassword) {
  console.log("未设置 SEED_PRIVATE_PASSWORD：加密文章被导入为草稿，需在后台重设密码后发布为私有笔记。");
}

await client.end();
