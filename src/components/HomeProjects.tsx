import Link from "next/link";

const FEATURED_PROJECTS = [
  {
    title: "AI 对话智能体 (Chat Agent)",
    category: "AI 原生应用",
    status: "Active",
    desc: "高响应流式交互平台，支持多模型动态路由、长上下文压缩与本地 MCP 工具调用集成。",
    href: "https://chat.kyoyk.top/",
    tags: ["Streaming", "Next.js", "MCP Tools"],
    ext: true,
  },
  {
    title: "魔方简历 (Magic Resume)",
    category: "工程效率应用",
    status: "Stable",
    desc: "基于 AST 结构化渲染的智能简历排版系统，针对工程师 ATS 匹配机制优化，支持即时预览与 PDF 导出。",
    href: "https://magic-resume.kyoyk.top/",
    tags: ["React 19", "Typesetting", "ATS Optimized"],
    ext: true,
  },
  {
    title: "PromptVault & 智能体总线",
    category: "AI 基础设施",
    status: "Internal",
    desc: "资产化 Prompt 模板管理与 MCP 协议枢纽，实现上下文工程与智能体工作流的高复用编排。",
    href: "/proj",
    tags: ["Prompt Engineering", "MCP Protocol", "Knowledge Bus"],
    ext: false,
  },
];

export default function HomeProjects() {
  return (
    <section className="section-block" aria-labelledby="featured-projects-title">
      <div className="section-block__head">
        <div className="section-block__meta">
          <span className="section-block__dot" />
          <span className="section-block__tag">FEATURED SYSTEMS & APPS</span>
        </div>
        <h2 id="featured-projects-title" className="section-block__title">
          代表工程与 AI 原生资产
        </h2>
        <p className="section-block__desc">
          从多模型流式编排到领域生产力工具，构建可复用、高可靠的工程系统。
        </p>
      </div>

      <div className="project-grid">
        {FEATURED_PROJECTS.map((proj) => (
          <div key={proj.title} className="project-item">
            <div className="project-item__header">
              <span className="project-item__badge">{proj.category}</span>
              <span className="project-item__status">
                <span className="project-item__status-dot" />
                {proj.status}
              </span>
            </div>

            <h3 className="project-item__title">
              <a
                href={proj.href}
                target={proj.ext ? "_blank" : undefined}
                rel={proj.ext ? "noopener noreferrer" : undefined}
              >
                {proj.title}
                {proj.ext && <span className="project-item__arrow">↗</span>}
              </a>
            </h3>

            <p className="project-item__desc">{proj.desc}</p>

            <div className="project-item__tags">
              {proj.tags.map((tag) => (
                <span key={tag} className="project-item__tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="section-block__foot">
        <Link href="/proj" className="section-block__more-link">
          查看全部工具与开源项目 ➔
        </Link>
      </div>
    </section>
  );
}
