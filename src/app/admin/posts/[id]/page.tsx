import { getSkin } from "@/lib/skinPreference";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { renderPost } from "@/lib/markdown";
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
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { saved } = await searchParams;
  const post = await getPostById(id);

  if (!post) notFound();

  const draftBody = post.status === "private" && post.secret ? openBody(post.secret) : post.body;
  if (draftBody === null) return <p role="alert">无法读取这篇笔记的正文，已停止编辑以保护原稿。</p>;

  const frontHref = post.status !== "draft" ? permalink(post) : undefined;

  const ink = (await getSkin()) === "ink";
  return (
    <div>
      {ink ? <h1 style={{ fontSize: "1.4rem", marginTop: 0 }}>编辑：{post.title}</h1> : <header className="editorial-head">
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
      </header>}
      <PostEditor
        ink={ink}
        viewHref={frontHref}
        key={post.id}
        post={{ id: post.id, slug: post.slug, title: post.title, status: post.status, tags: post.tags,
          description: post.description, publishedAt: post.publishedAt, body: draftBody }}
        initialHtml={renderPost(draftBody, post.title).html}
        notice={saved ? "已保存。" : undefined}
      />
    </div>
  );
}
