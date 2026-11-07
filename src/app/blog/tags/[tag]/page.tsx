import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { listPosts, permalink } from "@/lib/posts";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return {
    title: `标签：${name}`,
    alternates: { canonical: `/blog/tags/${encodeURIComponent(name)}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = await listPosts({ tag: name });

  return (
    <main className="section">
      <div className="container">
        <div className="section__head">
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
            标签：<span style={{ color: "var(--primary)" }}>{name}</span>
          </h1>
          <Link href="/blog/tags">全部标签 →</Link>
        </div>

        {posts.length === 0 ? (
          <p className="empty">这个标签下还没有笔记。</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id} className="post-card">
                <div className="post-card__meta">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {post.publishedAt ? formatDate(post.publishedAt) : "未发布"}
                  </time>
                  {post.minutes && <span className="post-card__minutes">{post.minutes} 分钟</span>}
                  {post.tags.map((item) => (
                    <Link
                      key={item}
                      className={item === name ? "tag tag--active" : "tag"}
                      href={`/blog/tags/${encodeURIComponent(item)}`}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
                <h3>
                  <Link className="post-card__link" href={permalink(post)}>
                    {post.title}
                  </Link>
                </h3>
                <p>{post.description || post.excerpt || ""}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
