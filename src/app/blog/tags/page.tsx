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

  return (
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
}
