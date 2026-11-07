"use server";

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { plainExcerpt } from "@/lib/markdown";
import { deletePost, getPostById, savePost, type PostStatus } from "@/lib/posts";
import { sealSecret } from "@/lib/secret";
import { endSession, requireAdmin, startSession } from "@/lib/session";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const text = (form: FormData, key: string): string => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string): string | null => text(form, key) || null;

export async function loginAction(formData: FormData) {
  const password = text(formData, "password");
  const stored = process.env.AUTH_PASSWORD_HASH;

  if (!stored || !password || !verifyPassword(password, stored)) {
    redirect("/admin/login?error=1");
  }

  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

export async function savePostAction(formData: FormData) {
  await requireAdmin();

  const id = optional(formData, "id");
  const slug = text(formData, "slug").toLowerCase();
  const title = text(formData, "title");
  const status = text(formData, "status") as PostStatus;
  const tags = text(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const publishedInput = optional(formData, "publishedAt");
  const publishedAt = publishedInput ? new Date(publishedInput).toISOString() : null;
  const password = optional(formData, "password");
  const hint = optional(formData, "hint");

  const back = id ? `/admin/posts/${id}` : "/admin/posts/new";

  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    redirect(`${back}?error=slug`);
  }
  if (!title) {
    redirect(`${back}?error=title`);
  }
  if (!["draft", "published", "private"].includes(status)) {
    redirect(`${back}?error=status`);
  }

  const existing = id ? await getPostById(id) : null;
  const body = optional(formData, "body") ?? "";

  let secret = existing?.secret ?? null;
  let storedBody: string | null = body;

  if (status === "private") {
    if (password) {
      secret = sealSecret(body, password, hint);
    }
    if (!secret) {
      redirect(`${back}?error=password`);
    }
    storedBody = null;
  } else {
    secret = null;
  }

  const savedId = await savePost({
    id: id ?? undefined,
    slug,
    title,
    description: optional(formData, "description"),
    body: storedBody,
    secret,
    excerpt: plainExcerpt(body),
    status,
    publishedAt: status === "draft" ? publishedAt : (publishedAt ?? new Date().toISOString()),
    tags,
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    redirect(`${back}?error=${message.includes("posts_slug_key") ? "slug-taken" : "db"}`);
  });

  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/posts/${savedId}?saved=1`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (id) await deletePost(id);
  revalidatePath("/blog");
  redirect("/admin");
}

export async function uploadAssetAction(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  const file = formData.get("file");
  const back = id ? `/admin/posts/${id}` : "/admin/posts/new";

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${back}?error=file`);
  }
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
    redirect(`${back}?error=file-type`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sha = createHash("sha256").update(buffer).digest("hex");
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${sha}.${ext}`;

  await fs.mkdir(path.join(DATA_DIR, "uploads"), { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "uploads", name), buffer);

  redirect(`${back}?uploaded=${encodeURIComponent(`/uploads/${name}`)}`);
}
