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
    tag: "LIVE",
    note: "资产化 Prompt 模板管理与 MCP 协议枢纽，实现上下文工程高复用编排。",
  },
  {
    name: "大肥鱼 Token 保卫战",
    href: "https://td.kythron.com/",
    host: "td.kythron.com",
    tag: "LIVE",
    note: "浏览器端实时 Token 塔防模拟与策略防御，融合防御塔升级与波次攻防。",
  },
  {
    name: "英语研习室",
    href: "https://cet.kythron.com/",
    host: "cet.kythron.com",
    tag: "LIVE",
    note: "离线优先的英语四六级与考研真题练习空间，纯净无广告，持久保存练习进度。",
  },
  {
    name: "StarLive 星播",
    href: "https://live.kythron.com/",
    host: "live.kythron.com",
    tag: "LIVE",
    note: "可自部署的实时直播互动平台，集成高并发弹幕流、虚拟礼物与星币经济。",
  },
  {
    name: "魔方简历",
    href: "https://magic-resume.kyoyk.top/",
    host: "magic-resume.kyoyk.top",
    tag: "STABLE",
    note: "基于 AST 结构化渲染的智能排版系统，针对工程师 ATS 匹配机制优化。",
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
            <span className="home-section__sub">全站 {posts.length} 篇中的最新 5 篇</span>
          </div>

          <ol className="home-recent">
            {posts.slice(0, 5).map((post) => {
              const href = permalink(post);
              const dateStr = formatDateDot(post.publishedAt);

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
