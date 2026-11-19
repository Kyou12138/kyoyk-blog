import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Cloudflare caches /skins/*.css by URL, so a deploy must change the URL or readers keep the old sheet.
const version = (file: string) => {
  try {
    return createHash("sha256").update(readFileSync(join(process.cwd(), "public", "skins", file))).digest("hex").slice(0, 10);
  } catch {
    return "0";
  }
};

const INK = `/skins/obsidian.css?v=${version("obsidian.css")}`;
const LIGHT = `/skins/editorial.css?v=${version("editorial.css")}`;

export const skinStylesheet = (ink: boolean) => (ink ? INK : LIGHT);
