import { NextResponse } from "next/server";
import { listPosts, permalink } from "@/lib/posts";

/** 供客户端搜索浮层用的轻量索引：只含标题、地址、标签与摘要。 */
export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await listPosts();
  return NextResponse.json(
    posts.map((post) => ({
      title: post.title,
      href: permalink(post),
      tags: post.tags,
      excerpt: post.description || post.excerpt || "",
    })),
    { headers: { "cache-control": "no-store" } },
  );
}
