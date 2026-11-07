import { NextResponse } from "next/server";
import { renderPost } from "@/lib/markdown";
import { isAdmin } from "@/lib/session";

/** 后台预览：复用服务端 markdown 渲染，避免把 highlight.js 打进浏览器包。 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { markdown, title } = (await request.json().catch(() => ({}))) as {
    markdown?: string;
    title?: string;
  };

  const { html } = renderPost(String(markdown ?? ""), title ? String(title) : undefined);
  return NextResponse.json({ html });
}
