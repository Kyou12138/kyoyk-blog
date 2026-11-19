"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { sealBody } from "@/lib/secret";
import { plainExcerpt } from "@/lib/markdown";
import { deletePost, savePost, type PostStatus } from "@/lib/posts";
import { endSession, isAdmin, requireAdmin, startSession } from "@/lib/session";

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

export async function savePostAction(formData: FormData): Promise<{ id: string } | { error: string }> {
  if (!(await isAdmin())) return { error: "unauthorized" };

  const id = optional(formData, "id");
  const slug = text(formData, "slug").toLowerCase();
  const title = text(formData, "title");
  const status = text(formData, "status") as PostStatus;
  const tags = text(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const publishedInput = optional(formData, "publishedAt");
  const timestamp = publishedInput ? Date.parse(`${publishedInput}+08:00`) : null;
  if (timestamp !== null && !Number.isFinite(timestamp)) return { error: "date" };
  const publishedAt = timestamp === null ? null : new Date(timestamp).toISOString();

  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return { error: "slug" };
  }
  if (!title) {
    return { error: "title" };
  }
  if (!["draft", "published", "private"].includes(status)) {
    return { error: "status" };
  }

  const body = optional(formData, "body") ?? "";
  // 私有笔记只存密文；解密密钥由服务端派生，登录后自动可读，不再需要第二个密码。
  const secret = status === "private" ? sealBody(body) : null;
  const storedBody: string | null = status === "private" ? null : body;

  let savedId: string;
  try {
    savedId = await savePost({
      id: id ?? undefined, slug, title, status, tags,
      description: optional(formData, "description"),
      body: storedBody, secret, excerpt: status === "private" ? null : plainExcerpt(body),
      publishedAt: status === "draft" ? publishedAt : (publishedAt ?? new Date().toISOString()),
    });
  } catch (error) {
    return { error: (error as { constraint?: string }).constraint === "posts_slug_key" ? "slug-taken" : "db" };
  }
  revalidatePath("/blog");
  revalidatePath("/");
  return { id: savedId };
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (id) await deletePost(id);
  revalidatePath("/blog");
  redirect("/admin");
}
