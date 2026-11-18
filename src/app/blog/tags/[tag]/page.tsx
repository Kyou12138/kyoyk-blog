import type { Metadata } from "next";
import Link from "next/link";
import { formatDateDot } from "@/lib/format";
import { listPosts, permalink } from "@/lib/posts";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return {
    title: `#${name}`,
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
        <header className="editorial-head">
          <div className="editorial-head__stack">
            <Link href="/blog/tags" className="editorial-back">
              ← 标签
            </Link>
            <h1 className="editorial-head__title">#{name}</h1>
          </div>
          <div className="editorial-head__aside">
            <span className="editorial-head__count">{posts.length} 篇</span>
            <Link href="/blog" className="editorial-head__link">
              全部笔记 →
            </Link>
          </div>
        </header>

        {posts.length === 0 ? (
          <p className="empty">该标签下还没有笔记。</p>
        ) : (
          <div className="ledger-stream ledger-stream--standalone">
            {posts.map((post) => {
              const href = permalink(post);
              const dateStr = post.publishedAt ? formatDateDot(post.publishedAt) : "草稿";

              return (
                <article key={post.id} className="ledger-row">
                  <time
                    className="ledger-row__time ledger-row__time--full"
                    dateTime={post.publishedAt ?? undefined}
                  >
                    {dateStr}
                  </time>

                  <div className="ledger-row__main">
                    <h2 className="ledger-row__title">
                      <Link href={href}>{post.title}</Link>
                    </h2>
                  </div>

                  <div className="ledger-row__aside">
                    {post.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/blog/tags/${encodeURIComponent(t)}`}
                        className={`ledger-row__tag ${t === name ? "is-active" : ""}`}
                      >
                        #{t}
                      </Link>
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
