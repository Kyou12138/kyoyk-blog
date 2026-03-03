import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./proj.module.css";

type ProjectCard = {
  icon: "compass" | "community" | "qr" | "chat" | "resume";
  title: string;
  description: string;
  href: string;
  actionText: string;
};

type ProjectGroup = {
  code: string;
  title: string;
  description: string;
  cards: ProjectCard[];
};

const projectGroups: ProjectGroup[] = [
  {
    code: "RES",
    title: "资源推荐",
    description: "精选开发资源与学习站点，帮助你更快定位答案与优质内容。",
    cards: [
      {
        icon: "compass",
        title: "DeepWiki",
        description:
          "代码仓库探索工具，支持语义检索、结构浏览和知识聚合，适合快速理解大型开源项目。",
        href: "https://deepwiki.com/",
        actionText: "访问网站",
      },
      {
        icon: "community",
        title: "Linux.do",
        description:
          "面向 Linux 和开源技术的社区论坛，覆盖日常问题讨论、经验分享与实践交流。",
        href: "https://linux.do/",
        actionText: "访问网站",
      },
      {
        icon: "qr",
        title: "QRGPT",
        description:
          "基于 AI 的二维码生成工具，支持文本与链接编码，可用于活动页和快速信息分发。",
        href: "https://www.qrgpt.io/",
        actionText: "访问网站",
      },
    ],
  },
  {
    code: "APP",
    title: "应用服务",
    description: "自主部署的在线工具，覆盖对话、内容生产与个人效率场景。",
    cards: [
      {
        icon: "chat",
        title: "AI 对话",
        description:
          "基于 NextChat 定制的对话应用，支持多模型接入，适合知识问答和开发辅助。",
        href: "https://chat.kyoyk.top/",
        actionText: "访问应用",
      },
      {
        icon: "resume",
        title: "魔方简历",
        description:
          "在线简历编辑与模板工具，支持实时预览和 PDF 导出，适合快速生成正式版本。",
        href: "https://magic-resume.kyoyk.top/",
        actionText: "访问应用",
      },
    ],
  },
];

function ProjectIcon({ icon }: { icon: ProjectCard["icon"] }): ReactNode {
  switch (icon) {
    case "compass":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.8 8.2L13.9 13.9L8.2 15.8L10.1 10.1L15.8 8.2ZM12 2.7A9.3 9.3 0 1 0 21.3 12A9.31 9.31 0 0 0 12 2.7Z" />
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 9.3A2.8 2.8 0 1 0 5.2 6.5A2.8 2.8 0 0 0 8 9.3ZM16 9.3A2.8 2.8 0 1 0 13.2 6.5A2.8 2.8 0 0 0 16 9.3ZM8 11.2C5.3 11.2 3 12.6 3 14.3V16.2H13V14.3C13 12.6 10.7 11.2 8 11.2ZM16 11.2C15.5 11.2 15 11.2 14.5 11.3C15.4 12.1 16 13.2 16 14.3V16.2H21V14.3C21 12.6 18.7 11.2 16 11.2Z" />
        </svg>
      );
    case "qr":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3H11V11H3V3ZM5 5V9H9V5H5ZM13 3H21V11H13V3ZM15 5V9H19V5H15ZM3 13H11V21H3V13ZM5 15V19H9V15H5ZM13 13H15V15H13V13ZM16 16H18V18H16V16ZM19 13H21V15H19V13ZM19 17H21V21H17V19H19V17ZM13 19H15V21H13V19Z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4H20V16H7.5L4 19.5V4ZM6 6V14.7L6.7 14H18V6H6ZM8 9H16V11H8V9Z" />
        </svg>
      );
    case "resume":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3H15L20 8V21H6V3ZM8 5V19H18V9H14V5H8ZM10 11H16V13H10V11ZM10 15H16V17H10V15Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Projects(): ReactNode {
  return (
    <Layout
      title="资源&工具"
      description="精选的开发资源和工具推荐，以及个人应用服务"
    >
      <main className={styles.projectsPage}>
        <div className="container">
          <section className={styles.heroPanel}>
            <p className={styles.heroTag}>精选导航</p>
            <h1 className={styles.heroTitle}>常用资源与在线应用</h1>
            <p className={styles.heroText}>
              将高频使用的站点和工具集中管理，帮助你在学习与开发场景中快速切换。
            </p>
          </section>

          <div className={styles.projectsRow}>
            {projectGroups.map((group) => (
              <section key={group.title} className={styles.columnWrapper}>
                <header className={styles.sectionHeader}>
                  <span className={styles.sectionCode}>{group.code}</span>
                  <div>
                    <h2 className={styles.sectionTitle}>{group.title}</h2>
                    <p className={styles.sectionDescription}>{group.description}</p>
                  </div>
                </header>

                <div className={styles.cardGrid}>
                  {group.cards.map((card) => (
                    <article key={card.title} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardIcon} aria-hidden="true">
                          <ProjectIcon icon={card.icon} />
                        </span>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                      </div>
                      <div className={styles.cardBody}>
                        <p>{card.description}</p>
                      </div>
                      <div className={styles.cardFooter}>
                        <Link
                          to={card.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cardButton}
                        >
                          {card.actionText}
                          <span className={styles.cardButtonIcon} aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <section className={styles.bottomTip}>
            <p>提示：如果你有推荐资源，欢迎通过 GitHub 提交补充建议。</p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
