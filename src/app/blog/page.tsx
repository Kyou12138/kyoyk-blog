import type { Metadata } from "next";
import Link from "next/link";
import { dateParts, formatDate } from "@/lib/format";
import { listPosts, listTags, permalink, type PostSummary } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "笔记",
  description: "前后端、工程化与 AI 的长期笔记。",
  alternates: { canonical: "/blog" },
};

const pick = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/** 按年份分组，年份顺序沿用查询结果（已按发布时间倒序）。 */
const groupByYear = (posts: PostSummary[]): Array<{ year: string; posts: PostSummary[] }> => {
  const groups: Array<{ year: string; posts: PostSummary[] }> = [];
  for (const post of posts) {
    const year = post.publishedAt ? dateParts(post.publishedAt).year : "未排期";
    const last = groups.at(-1);
    if (last && last.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
};

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

  const filtered = Boolean(keyword || tag);
  const groups = groupByYear(posts);

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
          <div className={filtered ? "timeline timeline--flat" : "timeline"}>
            {groups.map((group) => (
              <section key={group.year} className="timeline__group">
                <h2 className="timeline__year">
                  {group.year}
                  <span className="timeline__count">{group.posts.length}</span>
                </h2>
                <ul className="post-list">
                  {group.posts.map((post) => (
                    <li key={post.id} className="post-card">
                      <div className="post-card__meta">
                        <time dateTime={post.publishedAt ?? undefined}>
                          {post.publishedAt ? formatDate(post.publishedAt) : "未发布"}
                        </time>
                        {post.minutes && <span className="post-card__minutes">{post.minutes} 分钟</span>}
                        {post.tags.map((item) => (
                          <Link
                            key={item}
                            className={tag === item ? "tag tag--active" : "tag"}
                            href={`/blog?tag=${encodeURIComponent(item)}`}
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                      <h3>
                        {/* 伪元素铺满整张卡，点卡片任何位置都能进文章；标签用 z-index 浮在它上面 */}
                        <Link className="post-card__link" href={permalink(post)}>
                          {post.title}
                        </Link>
                      </h3>
                      <p>{post.description || post.excerpt || ""}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
