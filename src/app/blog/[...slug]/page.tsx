import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NoteGate from "@/components/NoteGate";
import { formatDate, readingMinutes } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { readPrivateBody } from "@/lib/noteAccess";
import { getPostBySlug, permalink } from "@/lib/posts";
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

  return (
    <main className="container">
      <article className="narrow article">
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
          {post.description && <p className="muted">{post.description}</p>}
        </header>

        {post.status === "private" ? (
          privateBody ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(privateBody) }} />
          ) : (
            <NoteGate postId={post.id} hint={post.secret?.hint ?? null} />
          )
        ) : (
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body ?? "") }} />
        )}
      </article>
    </main>
  );
}
