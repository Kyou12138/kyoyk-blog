export const metadata = {
  title: "资源&工具",
  description: "精选开发提效外设、开源资产与自研 AI 原生应用系统。",
};

import type { ReactNode } from "react";
import styles from "./proj.module.css";

type ProjectCard = {
  icon: "compass" | "community" | "qr" | "chat" | "resume";
  title: string;
  badge: string;
  description: string;
  href: string;
  host: string;
};

type ProjectSection = {
  code: string;
  title: string;
  cards: ProjectCard[];
};

const projectSections: ProjectSection[] = [
  {
    code: "01",
    title: "AI 原生应用与交互工具",
    cards: [
      {
        icon: "chat",
        title: "AI 对话 (Chat Agent)",
        badge: "模型接入",
        description:
          "基于 NextChat 定制的多模型对话平台，支持流式传输、长上下文压缩与提示词工具扩展。",
        href: "https://chat.kyoyk.top/",
        host: "chat.kyoyk.top",
      },
      {
        icon: "resume",
        title: "魔方简历 (Magic Resume)",
        badge: "智能排版",
        description:
          "基于 AST 结构化渲染的智能简历系统，针对工程师 ATS 匹配机制优化，支持即时预览与 PDF 导出。",
        href: "https://magic-resume.kyoyk.top/",
        host: "magic-resume.kyoyk.top",
      },
      {
        icon: "qr",
        title: "QRGPT",
        badge: "AI 图像",
        description:
          "基于 AI 的二维码艺术化生成工具，支持文本与链接编码，兼顾辨识度与视觉美感。",
        href: "https://www.qrgpt.io/",
        host: "qrgpt.io",
      },
    ],
  },
  {
    code: "02",
    title: "开源开发与探索外设",
    cards: [
      {
        icon: "compass",
        title: "DeepWiki",
        badge: "代码探索",
        description:
          "代码仓库探索工具，支持语义检索、结构浏览和知识聚合，适合快速理解大型开源项目。",
        href: "https://deepwiki.com/",
        host: "deepwiki.com",
      },
      {
        icon: "community",
        title: "Linux.do",
        badge: "极客社区",
        description:
          "面向 Linux 和开源技术的活跃社区，覆盖日常技术讨论、工具实践与前沿经验分享。",
        href: "https://linux.do/",
        host: "linux.do",
      },
    ],
  },
];

function ProjectIcon({ icon }: { icon: ProjectCard["icon"] }): ReactNode {
  switch (icon) {
    case "compass":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-6.5l-2.1 4.6 4.6-2.1 2.1-4.6-4.6 2.1z" />
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "qr":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-5 0h3v3h-3v-3zm2 5h2v3h-2v-3zm3-2h3v5h-3v-5z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7zm0-3h10v2H7z" />
        </svg>
      );
    case "resume":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Projects(): ReactNode {
  return (
    <main className={styles.projectsPage}>
      <div className="container">
        {/* 顶部自解释元信息 */}
        <header className={styles.pageHeader}>
          <div className={styles.pageMeta}>
            <span className={styles.pageDot} />
            <span className={styles.pageTag}>TOOLBOX & ECOSYSTEM // PERIPHERALS</span>
          </div>
          <h1 className={styles.pageTitle}>工程矩阵与 AI 工具箱</h1>
          <p className={styles.pageDesc}>
            精选开发提效外设、开源资产与自研 AI 原生应用系统，用工具拓展思考边界。
          </p>
        </header>

        {/* 分组网格 */}
        <div className={styles.sections}>
          {projectSections.map((section) => (
            <section key={section.code} className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionBadge}>{section.code}</span>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>

              <div className={styles.cardGrid}>
                {section.cards.map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.card}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.cardIcon} aria-hidden="true">
                        <ProjectIcon icon={card.icon} />
                      </span>
                      <div className={styles.cardBadges}>
                        <span className={styles.badge}>{card.badge}</span>
                        <span className={styles.externalArrow} aria-hidden="true">
                          ↗
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{card.title}</h3>
                      <p className={styles.cardDescription}>{card.description}</p>
                    </div>

                    <div className={styles.cardFoot}>
                      <span className={styles.cardHost}>{card.host}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 底部补充提示 */}
        <footer className={styles.bottomTip}>
          <span className={styles.tipIcon} aria-hidden="true">
            💡
          </span>
          <p>
            有优质开发工具或开源资源推荐？欢迎在{" "}
            <a href="https://github.com/Kyou12138" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>{" "}
            提交补充建议或发起讨论。
          </p>
        </footer>
      </div>
    </main>
  );
}
