import { cookies } from "next/headers";
import { sealNoteKey } from "@/lib/auth";
import { noteCookieName } from "@/lib/noteAccess";
import { getPostById } from "@/lib/posts";
import { deriveKey, openWithKey } from "@/lib/secret";

const DAY = 24 * 60 * 60;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password?.trim();

  if (!password) {
    return Response.json({ error: "请输入密码" }, { status: 400 });
  }

  const post = await getPostById(id);
  if (!post || post.status !== "private" || !post.secret) {
    return Response.json({ error: "笔记不存在" }, { status: 404 });
  }

  const key = deriveKey(password, Buffer.from(post.secret.salt, "base64"));
  if (!openWithKey(post.secret, key)) {
    return Response.json({ error: "密码不正确" }, { status: 401 });
  }

  const store = await cookies();
  store.set(noteCookieName(post.id), sealNoteKey(key), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAY,
  });

  return Response.json({ ok: true });
}
