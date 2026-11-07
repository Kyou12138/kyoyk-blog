import Link from "next/link";
import HeroCanvasBackground from "@/components/HeroCanvasBackground";
import { formatDate } from "@/lib/format";
import { listPosts, permalink } from "@/lib/posts";
import { SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await listPosts({ limit: 6 });

  return (
    <main>
      <section className="hero">
        <HeroCanvasBackground className="hero__canvas" />
        <div className="container hero__body">
          <span className="eyebrow">Kyou · 全栈手记</span>
          <h1>{SITE_TAGLINE}</h1>
          <p>
            前后端、工程化与 AI 的长期笔记。这个站点本身也是作品：Next.js + PostgreSQL 全栈，
            自己写的鉴权、搜索、加密笔记，跑在一台自己运维的机器上。
          </p>
          <div className="hero__actions">
            <Link className="button" href="/blog">
              读笔记 →
            </Link>
            <Link className="button button--ghost" href="/colophon">
              看技术栈
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>最新笔记</h2>
            <Link href="/blog">全部 →</Link>
          </div>
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id} className="post-card">
                <div className="post-card__meta">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {post.publishedAt ? formatDate(post.publishedAt) : "未发布"}
                  </time>
                  {post.tags.map((tag) => (
                    <Link key={tag} className="tag" href={`/blog/tags/${encodeURIComponent(tag)}`}>
                      {tag}
                    </Link>
                  ))}
                </div>
                <h3>
                  <Link href={permalink(post)}>{post.title}</Link>
                </h3>
                <p>{post.description || post.excerpt || ""}</p>
              </li>
            ))}
            {posts.length === 0 && <li className="empty">还没有已发布的笔记。</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
