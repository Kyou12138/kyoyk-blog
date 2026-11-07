import Link from "next/link";
import { listPosts, permalink } from "@/lib/posts";
import { dateParts } from "@/lib/format";

export default async function HomeFeaturedPosts() {
  const posts = await listPosts({ limit: 6 });

  return (
    <section className="section-block" aria-labelledby="featured-notes-title">
      <div className="section-block__head">
        <div className="section-block__meta">
          <span className="section-block__dot section-block__dot--gold" />
          <span className="section-block__tag">KNOWLEDGE LEDGER // RECENT INSIGHTS</span>
        </div>
        <h2 id="featured-notes-title" className="section-block__title">
          近期深度技术笔记
        </h2>
        <p className="section-block__desc">
          沉淀 MCP 协议、AI Agent 编排、全栈底层与系统架构实践的真实思考。
        </p>
      </div>

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
                <h3 className="ledger-row__title">
                  <Link href={href}>{post.title}</Link>
                </h3>
                {post.description && post.description !== post.title && (
                  <p className="ledger-row__desc">{post.description}</p>
                )}
              </div>

              <div className="ledger-row__aside">
                {post.tags[0] && (
                  <span className="ledger-row__tag">
                    {post.tags[0]}
                  </span>
                )}
                {post.minutes && (
                  <span className="ledger-row__reading-time">{post.minutes} min read</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="section-block__foot">
        <Link href="/blog" className="section-block__more-link">
          进入知识库浏览全部 31 篇笔记与归档 ➔
        </Link>
      </div>
    </section>
  );
}
