import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeCopyButtons from "@/components/CodeCopyButtons";
import NoteGate from "@/components/NoteGate";
import ReadingTools from "@/components/ReadingTools";
import TableOfContents from "@/components/TableOfContents";
import { formatDate, readingMinutes } from "@/lib/format";
import { renderPost } from "@/lib/markdown";
import { readPrivateBody } from "@/lib/noteAccess";
import { getAdjacentPosts, getPostBySlug, permalink } from "@/lib/posts";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug.at(-1) ?? "");
  if (!post) return { title: "笔记不存在" };
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
  const post = await getPostBySlug(slug.at(-1) ?? "");

  if (!post) notFound();
  if (post.status === "draft" && !(await isAdmin())) notFound();
  if (post.status === "private" && !post.secret) notFound();

  const privateBody =
    post.status === "private" && post.secret ? await readPrivateBody(post.id, post.secret) : null;
  const locked = post.status === "private" && !privateBody;
  const source = privateBody ?? post.body ?? "";
  const { html, headings } = locked ? { html: "", headings: [] } : renderPost(source, post.title);
  const { newer, older } = await getAdjacentPosts(post.slug);

  // 13 篇旧文的 description 就是 title，重复渲染没有信息量
  const subtitle =
    post.description && post.description.trim() !== post.title.trim() ? post.description : null;

  return (
    <main className="container">
      <ReadingTools />
      <div className="article-shell">
        <article className="article">
          <header className="article__head">
            <div className="post-card__meta">
              <time dateTime={post.publishedAt ?? undefined}>
                {post.publishedAt ? formatDate(post.publishedAt) : "未发布"}
              </time>
              {post.status !== "published" && <span className="tag tag--active">{post.status}</span>}
              {post.tags.map((tag) => (
                <Link key={tag} className="tag" href={`/blog/tags/${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
              {post.body && <span>{readingMinutes(post.body)} 分钟</span>}
            </div>
            <h1>{post.title}</h1>
            {subtitle && <p className="muted">{subtitle}</p>}
          </header>

          {/* 窄屏没有右侧目录，用贴着屏幕底部的 details 充当日录入口 */}
          {headings.length > 1 && (
            <details className="toc-mobile">
              <summary>
                <span aria-hidden="true">☰</span> 目录
              </summary>
              <ol className="toc__list">
                {headings.map((heading) => (
                  <li key={heading.id} className={`toc__item toc__item--h${heading.level}`}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          {locked ? (
            <NoteGate postId={post.id} hint={post.secret?.hint ?? null} />
          ) : (
            <>
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              <CodeCopyButtons />
            </>
          )}

          {(newer || older) && (
            <nav className="article-nav" aria-label="上下篇">
              {older ? (
                <Link className="article-nav__card" href={permalink(older)}>
                  <span className="article-nav__hint">← 上一篇</span>
                  <span className="article-nav__title">{older.title}</span>
                  <time dateTime={older.publishedAt ?? undefined}>
                    {older.publishedAt ? formatDate(older.publishedAt) : ""}
                  </time>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link className="article-nav__card article-nav__card--next" href={permalink(newer)}>
                  <span className="article-nav__hint">下一篇 →</span>
                  <span className="article-nav__title">{newer.title}</span>
                  <time dateTime={newer.publishedAt ?? undefined}>
                    {newer.publishedAt ? formatDate(newer.publishedAt) : ""}
                  </time>
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
