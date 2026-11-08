import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { listPosts, permalink } from "@/lib/posts";
import { dateParts } from "@/lib/format";

export const dynamic = "force-dynamic";

const projects = [
  {
    name: "AI 对话智能体",
    href: "https://chat.kyoyk.top/",
    host: "chat.kyoyk.top",
    tag: "LIVE",
    note: "基于 NextChat 定制的多模型流式交互平台，支持长上下文与本地 MCP 调用。",
  },
  {
    name: "魔方简历",
    href: "https://magic-resume.kyoyk.top/",
    host: "magic-resume.kyoyk.top",
    tag: "STABLE",
    note: "基于 AST 结构化渲染的智能排版系统，针对工程师 ATS 匹配机制优化。",
  },
  {
    name: "PromptVault",
    href: "https://prompt.kythron.com/",
    host: "prompt.kythron.com",
    tag: "INTERNAL",
    note: "资产化 Prompt 模板管理与 MCP 协议枢纽，实现上下文工程高复用编排。",
  },
];

export default async function HomePage() {
  const posts = await listPosts();
  const graphPosts = posts.map((p) => ({ title: p.title, href: permalink(p), tags: p.tags }));
  const tagCount = new Set(posts.flatMap((p) => p.tags)).size;

  return (
    <main>
      <HomeHero posts={graphPosts} tagCount={tagCount} />

      <div className="container home-below">
        {/* 左栏：近期技术笔记 */}
        <section aria-labelledby="recent-title" className="home-col">
          <div className="home-section__head">
            <h2 id="recent-title" className="home-section__title">
              近期技术笔记
            </h2>
            <span className="home-section__sub">全站 30 篇中的最新 5 篇</span>
          </div>

          <ol className="home-recent">
            {posts.slice(0, 5).map((post) => {
              const href = permalink(post);
              const parts = post.publishedAt ? dateParts(post.publishedAt) : null;
              const dateStr = parts ? `${parts.year}.${parts.month}.${parts.day}` : "";

              return (
                <li key={post.id} className="home-recent__item">
                  <Link href={href} className="home-recent__link">
                    <div className="home-recent__main">
                      <span className="home-recent__title">{post.title}</span>
                      {post.description && post.description !== post.title && (
                        <p className="home-recent__desc">{post.description}</p>
                      )}
                    </div>

                    <div className="home-recent__meta">
                      {post.tags[0] && (
                        <span className="home-recent__tag">{post.tags[0]}</span>
                      )}
                      {post.minutes && (
                        <span className="home-recent__min">{post.minutes} min</span>
                      )}
                      {dateStr && <time className="home-recent__time">{dateStr}</time>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="home-more-wrap">
            <Link className="home-more" href="/blog">
              进入知识库浏览全部 {posts.length} 篇笔记与归档 ➔
            </Link>
          </div>
        </section>

        {/* 右栏：开源外设与在用系统 */}
        <section aria-labelledby="made-title" className="home-col">
          <div className="home-section__head">
            <h2 id="made-title" className="home-section__title">
              自研外设与应用
            </h2>
            <span className="home-section__sub">日常高频使用的工程工具</span>
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
                    <span className={`home-made__tag home-made__tag--${p.tag.toLowerCase()}`}>
                      {p.tag} ↗
                    </span>
                  </div>
                  <p className="home-made__note">{p.note}</p>
                  <span className="home-made__host">{p.host}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="home-more-wrap">
            <Link className="home-more" href="/proj">
              查看全部工具矩阵与资源 ➔
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
