import type { Metadata } from "next";
import Link from "next/link";
import { dateParts } from "@/lib/format";
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
        <div className="section-block__head">
          <div className="section-block__meta">
            <span className="section-block__dot section-block__dot--gold" />
            <span className="section-block__tag">TAG FILTER // ARCHIVE</span>
          </div>
          <h1 className="section-block__title">
            标签：<span style={{ color: "var(--primary)" }}>{name}</span>
          </h1>
          <p className="section-block__desc">
            共归档 {posts.length} 篇相关技术笔记。{" "}
            <Link href="/blog" style={{ marginLeft: "0.5rem" }}>
              ← 返回全部笔记账册
            </Link>
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="empty">这个标签下还没有笔记。</p>
        ) : (
          <div className="ledger-stream">
            {posts.map((post) => {
              const href = permalink(post);
              const parts = post.publishedAt ? dateParts(post.publishedAt) : null;
              const dateStr = parts ? `${parts.year}.${parts.month}.${parts.day}` : "DRAFT";

              return (
                <article key={post.id} className="ledger-row">
                  <div className="ledger-row__time">
                    <time dateTime={post.publishedAt ?? undefined}>{dateStr}</time>
                  </div>

                  <div className="ledger-row__main">
                    <h2 className="ledger-row__title">
                      <Link href={href}>{post.title}</Link>
                    </h2>
                    {post.description && post.description !== post.title && (
                      <p className="ledger-row__desc">{post.description}</p>
                    )}
                  </div>

                  <div className="ledger-row__aside">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className={`ledger-row__tag ${t === name ? "is-active" : ""}`}
                      >
                        {t}
                      </span>
                    ))}
                    {post.minutes && (
                      <span className="ledger-row__reading-time">{post.minutes} min</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
