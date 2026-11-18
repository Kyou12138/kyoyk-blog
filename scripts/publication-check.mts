// Run against a loopback app pointed at the same disposable qa_ PostgreSQL schema.
// node --env-file=.env.local --experimental-strip-types scripts/publication-check.mts http://127.0.0.1:3117 qa_example
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { sealBody } from "../src/lib/secret.ts";

const [base, schema] = process.argv.slice(2);
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
assert.match(schema, /^qa_[a-z0-9_]+$/);
const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : undefined });
const slug = `check-${randomUUID()}`;
const path = `/blog/2099/01/01/${slug}`;
const tag = "publication-check";
const marker = `${slug}-title`;
const body = `${slug}-body`;
const description = `${slug}-summary`;

async function verify(visible: boolean, title: string, obsolete?: string) {
  for (const route of [path, "/", "/blog", `/blog/tags/${tag}`, "/api/search-index", "/rss.xml", "/sitemap.xml"]) {
    const response = await fetch(new URL(route, base), { redirect: "manual" });
    assert.equal(response.status, route === path && !visible ? 404 : 200, route);
    const rendered = await response.text();
    const needle = route === "/sitemap.xml" ? path : title;
    assert.equal(rendered.includes(needle), visible, `${route} visibility`);
    if (obsolete) assert.ok(!rendered.includes(obsolete), `${route} retained previous title`);
    if (!visible) for (const text of [body, description]) assert.ok(!rendered.includes(text), `${route} leaked unpublished content`);
  }
}

await db.connect();
try {
  await db.query(`SET search_path TO ${schema}, pg_catalog`);
  assert.equal((await db.query("select current_schema() as name")).rows[0].name, schema);
  await db.query("BEGIN");
  const { rows: [post] } = await db.query("insert into posts (slug,title,description,body,status,published_at) values ($1,$2,$3,$4,'draft','2099-01-01T00:00:00+08:00') returning id", [slug, marker, description, body]);
  await db.query("insert into tags(name) values ($1) on conflict do nothing", [tag]);
  await db.query("insert into post_tags select $1,id from tags where name=$2", [post.id, tag]);
  await db.query("COMMIT");
  await verify(false, marker);
  await db.query("update posts set status='published' where id=$1", [post.id]);
  await verify(true, marker);
  const renamed = `updated-${slug}`;
  await db.query("update posts set title=$1 where id=$2", [renamed, post.id]);
  await verify(true, renamed, marker);
  await db.query("update posts set status='private',body=null,secret=$1 where id=$2", [sealBody(body), post.id]);
  await verify(false, renamed, marker);
  await db.query("update posts set status='published',body=$1,secret=null where id=$2", [body, post.id]);
  await verify(true, renamed);
  await db.query("update posts set status='draft' where id=$1", [post.id]);
  await verify(false, renamed);
  await db.query("update posts set status='published' where id=$1", [post.id]);
  await verify(true, renamed);
  await db.query("delete from posts where id=$1", [post.id]);
  await verify(false, renamed);
  console.log("publication-check: 8 transitions × 7 public routes passed");
} finally {
  try {
    await db.query("ROLLBACK");
    await db.query(`delete from ${schema}.posts where slug=$1`, [slug]);
    await db.query(`delete from ${schema}.tags t where t.name=$1 and not exists (select 1 from ${schema}.post_tags j where j.tag_id=t.id)`, [tag]);
  } finally { await db.end(); }
}
