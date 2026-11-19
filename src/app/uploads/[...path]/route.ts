import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const name = segments.join("/");

  // 只允许 <64位hex>.<扩展名>，杜绝路径穿越。
  const match = /^([a-f0-9]{64})\.([a-z0-9]{2,5})$/i.exec(name);
  const mime = match ? MIME[match[2].toLowerCase()] : undefined;
  if (!match || !mime) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(DATA_DIR, "uploads", name));
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
