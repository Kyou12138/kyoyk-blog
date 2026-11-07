import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/session";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file-type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha = createHash("sha256").update(buffer).digest("hex");
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const name = `${sha}.${ext}`;

  await fs.mkdir(path.join(DATA_DIR, "uploads"), { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "uploads", name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` });
}
