import { getSkin } from "@/lib/skinPreference";
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

  if ((await getSkin()) === "ink") return (
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
              const dateStr = post.publishedAt ? formatDateDot(post.publishedAt) : "草稿";

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
                      <Link href={`/blog/tags/${encodeURIComponent(t)}`}
                        key={t}
                        className={`ledger-row__tag ${t === name ? "is-active" : ""}`}
                      >
                        {t}
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
