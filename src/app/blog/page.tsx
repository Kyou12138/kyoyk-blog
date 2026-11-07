import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { listPosts, listTags, permalink } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "笔记",
  description: "前后端、工程化与 AI 的长期笔记。",
  alternates: { canonical: "/blog" },
};

const pick = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const keyword = pick(params.q)?.trim() ?? "";
  const tag = pick(params.tag)?.trim() ?? "";

  const [posts, tags] = await Promise.all([
    listPosts({ keyword: keyword || undefined, tag: tag || undefined }),
    listTags(),
  ]);

  return (
    <main className="section">
      <div className="container">
        <div className="section__head">
          <h1 style={{ margin: 0, fontSize: "1.7rem" }}>笔记</h1>
          <span className="muted">{posts.length} 篇</span>
        </div>

        <div className="toolbar">
          <form className="search" action="/blog" method="get">
            <input name="q" defaultValue={keyword} placeholder="搜索标题、摘要或正文" aria-label="搜索笔记" />
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button className="button" type="submit">
              搜索
            </button>
          </form>
          <div className="tag-cloud">
            <Link className={tag ? "tag" : "tag tag--active"} href="/blog">
              全部
            </Link>
            {tags.map((item) => (
              <Link
                key={item.name}
                className={tag === item.name ? "tag tag--active" : "tag"}
                href={`/blog?tag=${encodeURIComponent(item.name)}`}
              >
                {item.name} {item.count}
              </Link>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="empty">没有匹配的笔记。</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id} className="post-card">
                <div className="post-card__meta">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {post.publishedAt ? formatDate(post.publishedAt) : "未发布"}
                  </time>
                  {post.tags.map((item) => (
                    <Link key={item} className="tag" href={`/blog/tags/${encodeURIComponent(item)}`}>
                      {item}
                    </Link>
                  ))}
                </div>
                <h3>
                  <Link href={permalink(post)}>{post.title}</Link>
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
