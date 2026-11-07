import { listPosts, listTags, permalink } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const [posts, tags] = await Promise.all([listPosts(), listTags()]);

  const staticPaths = ["/", "/blog", "/blog/tags", "/about", "/proj", "/colophon"];
  const urls = [
    ...staticPaths.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: undefined })),
    ...tags.map((tag) => ({ loc: `${SITE_URL}/blog/tags/${encodeURIComponent(tag.name)}`, lastmod: undefined })),
    ...posts.map((post) => ({
      loc: `${SITE_URL}${permalink(post)}`,
      lastmod: (post.publishedAt ?? post.updatedAt).slice(0, 10),
    })),
  ];

  const body = urls
    .map(
      (entry) =>
        `  <url><loc>${entry.loc}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}</url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=600",
      },
    },
  );
}
