import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { openBody } from "@/lib/secret";
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

  const draftBody =
    post.status === "private" && post.secret
      ? (openBody(post.secret) ?? "")
      : (post.body ?? "");

  const frontHref = post.status !== "draft" ? permalink(post) : undefined;

  return (
    <div>
      <header className="editorial-head">
        <h1 className="editorial-head__title">编辑笔记</h1>
        <div className="editorial-head__aside">
          {frontHref && (
            <Link href={frontHref} className="editorial-head__link">
              前台查看 ↗
            </Link>
          )}
          <Link href="/admin" className="editorial-head__link">
            ← 全部笔记
          </Link>
        </div>
      </header>
      <PostEditor
        post={{ ...post, body: draftBody }}
        viewHref={frontHref}
        error={error}
        notice={saved ? "已保存。" : undefined}
      />
    </div>
  );
}
