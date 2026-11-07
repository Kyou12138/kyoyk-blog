import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { getPostById, permalink } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "编辑笔记", robots: { index: false } };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, saved } = await searchParams;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <div>
      <h1 style={{ fontSize: "1.4rem", marginTop: 0 }}>编辑：{post.title}</h1>
      <PostEditor
        post={post}
        viewHref={permalink(post)}
        error={error}
        notice={saved ? "已保存。" : undefined}
      />
    </div>
  );
}
