import { getSkin } from "@/lib/skinPreference";
import type { Metadata } from "next";
import Link from "next/link";
import { listTags } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "标签",
  alternates: { canonical: "/blog/tags" },
};

export default async function TagsPage() {
  const tags = await listTags();
  const maxCount = Math.max(1, ...tags.map((t) => t.count));

  if ((await getSkin()) === "ink") return (
    <main className="section">
      <div className="container">
        <h1 style={{ fontSize: "1.7rem", marginTop: 0 }}>标签</h1>
        <div className="tag-cloud" style={{ marginTop: "1.2rem" }}>
          {tags.map((tag) => (
            <Link key={tag.name} className="tag" href={`/blog/tags/${encodeURIComponent(tag.name)}`}>
              {tag.name} {tag.count}
            </Link>
          ))}
          {tags.length === 0 && <span className="muted">还没有标签。</span>}
        </div>
      </div>
    </main>
  );

  return (
    <main className="section">
      <div className="container">
        <header className="editorial-head">
          <div className="editorial-head__stack">
            <Link href="/blog" className="editorial-back">
              ← 笔记
            </Link>
            <h1 className="editorial-head__title">标签</h1>
          </div>
          <span className="editorial-head__count">{tags.length} 组</span>
        </header>

        {tags.length === 0 ? (
          <p className="empty">还没有标签。</p>
        ) : (
          <div className="tag-index">
            {tags.map((tag, i) => {
              const ratio = Math.max(0.08, tag.count / maxCount);
              return (
                <Link
                  key={tag.name}
                  className="tag-index__item"
                  href={`/blog/tags/${encodeURIComponent(tag.name)}`}
                >
                  <span className="tag-index__idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tag-index__name">{tag.name}</span>
                  <span className="tag-index__bar" aria-hidden="true">
                    <i style={{ transform: `scaleX(${ratio.toFixed(3)})` }} />
                  </span>
                  <span className="tag-index__count">{tag.count}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
