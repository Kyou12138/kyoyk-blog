import type { Metadata } from "next";
import Link from "next/link";
import { formatDateDot } from "@/lib/format";
import { listPosts, permalink, type PostStatus } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "全部笔记", robots: { index: false } };

const STATUS_LABELS: Record<PostStatus, string> = {
  published: "已发布",
  private: "私有笔记",
  draft: "草稿",
};

export default async function AdminPage() {
  await requireAdmin();
  const posts = await listPosts({ includeUnpublished: true });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const privateCount = posts.filter((p) => p.status === "private").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div>
      <header className="editorial-head">
        <h1 className="editorial-head__title">全部笔记</h1>
        <div className="editorial-head__aside">
          <span className="editorial-head__count">
            {publishedCount} 已发布 · {privateCount} 私有 · {draftCount} 草稿
          </span>
          <Link className="button button--primary button--sm" href="/admin/posts/new">
            + 写新笔记
          </Link>
        </div>
      </header>

      <ul className="admin-ledger">
        {posts.map((post) => (
          <li key={post.id} className="admin-row">
            <div className="admin-row__main">
              <span className={`admin-status admin-status--${post.status}`}>
                <i aria-hidden="true" />
                {STATUS_LABELS[post.status]}
              </span>
              <Link href={`/admin/posts/${post.id}`} className="admin-row__title">
                {post.title}
              </Link>
              <span className="admin-row__slug">/{post.slug}</span>
            </div>

            <div className="admin-row__aside">
              {post.tags.length > 0 && (
                <span className="admin-row__tags">
                  {post.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                </span>
              )}
              <time className="admin-row__date" dateTime={post.publishedAt ?? undefined}>
                {post.publishedAt ? formatDateDot(post.publishedAt) : "未排期"}
              </time>
              {post.status !== "draft" && (
                <Link href={permalink(post)} className="admin-row__view">
                  前台 ↗
                </Link>
              )}
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="empty">还没有笔记，先写一篇。</li>}
      </ul>
    </div>
  );
}
