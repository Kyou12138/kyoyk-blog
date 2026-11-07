import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { listPosts, permalink } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "后台", robots: { index: false } };

export default async function AdminPage() {
  await requireAdmin();
  const posts = await listPosts({ includeUnpublished: true });

  return (
    <div>
      <div className="section__head">
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>全部笔记</h1>
        <span className="muted">{posts.length} 篇</span>
      </div>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-card">
            <div className="post-card__meta">
              <span className={post.status === "published" ? "tag" : "tag tag--active"}>{post.status}</span>
              <time dateTime={post.publishedAt ?? undefined}>
                {post.publishedAt ? formatDate(post.publishedAt) : "未排期"}
              </time>
              <span>{post.tags.join(" · ")}</span>
            </div>
            <h3>
              <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p>{post.excerpt || post.description || ""}</p>
            {post.status !== "draft" && (
              <p style={{ marginTop: "0.4rem" }}>
                <Link href={permalink(post)}>查看前台 →</Link>
              </p>
            )}
          </li>
        ))}
        {posts.length === 0 && <li className="empty">还没有笔记，先写一篇。</li>}
      </ul>
    </div>
  );
}
