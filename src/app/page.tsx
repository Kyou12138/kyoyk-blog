import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { formatDate } from "@/lib/format";
import { listPosts, permalink } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await listPosts({ limit: 6 });

  return (
    <main>
      <div className="container">
        <HomeHero />
      </div>

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
