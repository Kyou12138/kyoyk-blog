"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { sealBody } from "@/lib/secret";
import { plainExcerpt } from "@/lib/markdown";
import { deletePost, savePost, type PostStatus } from "@/lib/posts";
import { endSession, requireAdmin, startSession } from "@/lib/session";

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

  const body = optional(formData, "body") ?? "";
  // 私有笔记只存密文；解密密钥由服务端派生，登录后自动可读，不再需要第二个密码。
  const secret = status === "private" ? sealBody(body) : null;
  const storedBody: string | null = status === "private" ? null : body;

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
