import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { listPosts, permalink } from "@/lib/posts";
import { dateParts, formatDateDot } from "@/lib/format";

export const dynamic = "force-dynamic";

const projects = [
  {
    name: "PromptVault",
    href: "https://prompt.kythron.com/",
    host: "prompt.kythron.com",
    note: "Prompt 模板资产库与 MCP 上下文编排枢纽。",
  },
  {
    name: "大肥鱼 Token 保卫战",
    href: "https://td.kythron.com/",
    host: "td.kythron.com",
    note: "浏览器端实时 Token 塔防与波次策略模拟。",
  },
  {
    name: "英语研习室",
    href: "https://cet.kythron.com/",
    host: "cet.kythron.com",
    note: "离线优先的四六级与考研真题无干扰训练空间。",
  },
  {
    name: "StarLive 星播",
    href: "https://live.kythron.com/",
    host: "live.kythron.com",
    note: "可自托管实时互动直播系统，含高并发弹幕与虚拟礼物。",
  },
  {
    name: "魔方简历",
    href: "https://magic-resume.kyoyk.top/",
    host: "magic-resume.kyoyk.top",
    note: "基于 AST 结构化渲染与 ATS 匹配的工程师简历排版器。",
  },
];

export default async function HomePage() {
  const posts = await listPosts();
  const graphPosts = posts.map((p) => ({
    title: p.title,
    href: permalink(p),
    tags: p.tags,
    publishedAt: p.publishedAt,
    minutes: p.minutes,
  }));
  const tagCount = new Set(posts.flatMap((p) => p.tags)).size;

  const years = posts
    .map((p) => (p.publishedAt ? Number(dateParts(p.publishedAt).year) : NaN))
    .filter((y) => Number.isFinite(y));
  const minYear = years.length ? Math.min(...years) : 2019;
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();
  const yearSpan = minYear === maxYear ? `${minYear}` : `${minYear} — ${maxYear}`;

  const [leadPost, ...restPosts] = posts.slice(0, 6);

  return (
    <main>
      <HomeHero posts={graphPosts} tagCount={tagCount} yearSpan={yearSpan} />

      <div className="container home-below">
        {/* 01 · 近期笔记 */}
        <section aria-labelledby="recent-title" className="home-col">
          <div className="home-section__head">
            <h2 id="recent-title" className="home-section__title">
              <span className="home-section__idx" aria-hidden="true">
                01
              </span>
              <span>近期笔记</span>
            </h2>
            <span className="home-section__sub">{String(posts.length).padStart(2, "0")}</span>
          </div>

          {leadPost && (
            <article className="home-lead">
              <Link href={permalink(leadPost)} className="home-lead__link">
                <div className="home-lead__meta">
                  <span className="home-lead__num">01</span>
                  {leadPost.tags[0] && <span>#{leadPost.tags[0]}</span>}
                  {leadPost.minutes && <span>{leadPost.minutes}m</span>}
                  {leadPost.publishedAt && (
                    <time dateTime={leadPost.publishedAt}>
                      {formatDateDot(leadPost.publishedAt)}
                    </time>
                  )}
                </div>
                <h3 className="home-lead__title">{leadPost.title}</h3>
                {(leadPost.description || leadPost.excerpt) &&
                  (leadPost.description || leadPost.excerpt) !== leadPost.title && (
                    <p className="home-lead__excerpt">
                      {leadPost.description || leadPost.excerpt}
                    </p>
                  )}
              </Link>
            </article>
          )}

          <ol className="home-recent" start={2}>
            {restPosts.map((post, i) => {
              const href = permalink(post);
              const dateStr = formatDateDot(post.publishedAt);
              const num = String(i + 2).padStart(2, "0");

              return (
                <li key={post.id} className="home-recent__item">
                  <Link href={href} className="home-recent__link">
                    <span className="home-recent__num" aria-hidden="true">
                      {num}
                    </span>
                    <span className="home-recent__title">{post.title}</span>
                    <span className="home-recent__meta">
                      {post.tags[0] && (
                        <span className="home-recent__tag">#{post.tags[0]}</span>
                      )}
                      {dateStr && <time className="home-recent__time">{dateStr}</time>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="home-more-wrap">
            <Link className="home-more" href="/blog">
              <span>全部笔记</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* 02 · 自研工具 */}
        <section aria-labelledby="made-title" className="home-col">
          <div className="home-section__head">
            <h2 id="made-title" className="home-section__title">
              <span className="home-section__idx" aria-hidden="true">
                02
              </span>
              <span>自研工具</span>
            </h2>
            <span className="home-section__sub">
              {String(projects.length).padStart(2, "0")}
            </span>
          </div>

          <ul className="home-made">
            {projects.map((p) => (
              <li key={p.name} className="home-made__item">
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-made__link"
                >
                  <div className="home-made__top">
                    <span className="home-made__name">{p.name}</span>
                    <span className="home-made__host">
                      {p.host} <span className="home-made__arrow" aria-hidden="true">↗</span>
                    </span>
                  </div>
                  <p className="home-made__note">{p.note}</p>
                </a>
              </li>
            ))}
          </ul>

          <div className="home-more-wrap">
            <Link className="home-more" href="/proj">
              <span>全部工具</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
