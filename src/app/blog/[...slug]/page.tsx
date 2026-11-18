import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import CodeCopyButtons from "@/components/CodeCopyButtons";
import ReadingTools from "@/components/ReadingTools";
import TableOfContents from "@/components/TableOfContents";
import { formatDateDot, readingMinutes } from "@/lib/format";
import { renderPost } from "@/lib/markdown";
import { openBody } from "@/lib/secret";
import { getAdjacentPosts, getPostBySlug, permalink } from "@/lib/posts";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string[] }> };

const readVisiblePost = cache(async (slug: string) => {
  const [post, admin] = await Promise.all([getPostBySlug(slug), isAdmin()]);
  if (!post || (post.status !== "published" && !admin) || (post.status === "private" && !post.secret)) notFound();
  return { post, admin };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await readVisiblePost(slug.at(-1) ?? "");
  if (post.status !== "published") return { title: "编辑预览", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.description ?? post.excerpt ?? undefined,
    alternates: { canonical: permalink(post) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description ?? post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, admin } = await readVisiblePost(slug.at(-1) ?? "");

  const source =
    post.status === "private" && post.secret ? (openBody(post.secret) ?? "") : (post.body ?? "");
  const { html, headings } = renderPost(source, post.title);
  const { newer, older } = await getAdjacentPosts(post.slug);

  const subtitle =
    post.description && post.description.trim() !== post.title.trim() ? post.description : null;

  return (
    <main className="container">
      <ReadingTools />
      <div className="article-shell">
        <article className="article">
          <header className="article__head">
            <div className="article__datum">
              <Link href="/blog" className="editorial-back">
                ← 笔记
              </Link>
              <span className="article__sep" aria-hidden="true">
                ·
              </span>
              <time dateTime={post.publishedAt ?? undefined}>
                {post.publishedAt ? formatDateDot(post.publishedAt) : "草稿"}
              </time>
              {source && (
                <>
                  <span className="article__sep" aria-hidden="true">
                    ·
                  </span>
                  <span>{readingMinutes(source)} min</span>
                </>
              )}
              {post.status === "draft" && <span className="tag tag--active">草稿</span>}
              {post.status === "private" && <span className="tag tag--active">私有笔记</span>}
              {admin && (
                <Link className="article__edit" href={`/admin/posts/${post.id}`}>
                  编辑
                </Link>
              )}
            </div>

            <h1>{post.title}</h1>
            {subtitle && <p className="article__lead">{subtitle}</p>}

            {post.tags.length > 0 && (
              <div className="article__tags">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    className="article__tag"
                    href={`/blog/tags/${encodeURIComponent(tag)}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {headings.length > 1 && (
            <details className="toc-mobile">
              <summary>目录 · {headings.length}</summary>
              <ol className="toc__list">
                {headings.map((heading) => (
                  <li key={heading.id} className={`toc__item toc__item--h${heading.level}`}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          <CodeCopyButtons />

          {(newer || older) && (
            <nav className="article-nav" aria-label="上下篇笔记">
              {older ? (
                <Link className="article-nav__card" href={permalink(older)}>
                  <span className="article-nav__hint">← 上一篇</span>
                  <span className="article-nav__title">{older.title}</span>
                  {older.publishedAt && (
                    <time className="article-nav__time" dateTime={older.publishedAt}>
                      {formatDateDot(older.publishedAt)}
                    </time>
                  )}
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link className="article-nav__card article-nav__card--next" href={permalink(newer)}>
                  <span className="article-nav__hint">下一篇 →</span>
                  <span className="article-nav__title">{newer.title}</span>
                  {newer.publishedAt && (
                    <time className="article-nav__time" dateTime={newer.publishedAt}>
                      {formatDateDot(newer.publishedAt)}
                    </time>
                  )}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>

        <TableOfContents headings={headings} />
      </div>
    </main>
  );
}
