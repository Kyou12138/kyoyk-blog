import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { Client } from "pg";

const splitStatements = (sql: string): string[] =>
  sql
    .split(";")
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((statement) => statement.length > 0);

process.loadEnvFile?.(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("缺少 DATABASE_URL");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

const dbDir = path.join(process.cwd(), "db");

await client.connect();

await client.query(`
  create table if not exists schema_migrations (
    version text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )
`);

const files = (await fs.readdir(dbDir)).filter((name) => name.endsWith(".sql")).sort();

for (const file of files) {
  const sql = await fs.readFile(path.join(dbDir, file), "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  const { rows } = await client.query<{ checksum: string }>(
    "select checksum from schema_migrations where version = $1",
    [file],
  );

  if (rows.length > 0) {
    if (rows[0].checksum !== checksum) {
      console.error(`✗ ${file} 已被修改，迁移文件不可变；请新增一个迁移文件`);
      process.exit(1);
    }
    console.log(`· ${file} 已应用，跳过`);
    continue;
  }

  await client.query("begin");
  try {
    for (const statement of splitStatements(sql)) {
      await client.query(statement);
    }
    await client.query("insert into schema_migrations (version, checksum) values ($1, $2)", [file, checksum]);
    await client.query("commit");
    console.log(`✓ ${file}`);
  } catch (error) {
    await client.query("rollback");
    console.error(`✗ ${file} 失败`, error);
    process.exit(1);
  }
}

await client.end();
