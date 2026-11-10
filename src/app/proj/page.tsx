export const metadata = {
  title: "资源&工具",
  description: "精选开发提效外设、开源资产与已上线的自研全栈/AI原生应用系统。",
};

import type { ReactNode } from "react";
import styles from "./proj.module.css";

type ProjectIconType =
  | "prompt"
  | "resume"
  | "config"
  | "book"
  | "game"
  | "live"
  | "bill"
  | "mail"
  | "audio"
  | "bot"
  | "card"
  | "sheep"
  | "compass"
  | "community";

type ProjectCard = {
  icon: ProjectIconType;
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
    title: "自研 AI 原生与智能工具",
    cards: [
      {
        icon: "prompt",
        title: "PromptVault · 灵感档案",
        badge: "AI 资产 // LIVE",
        description:
          "收藏灵感，记录每一次生成。资产化 Prompt 模板管理与 MCP 协议枢纽，实现上下文工程高复用编排。",
        href: "https://prompt.kythron.com/",
        host: "prompt.kythron.com",
      },
      {
        icon: "resume",
        title: "魔方简历 (Magic Resume)",
        badge: "智能排版 // LIVE",
        description:
          "基于 AST 结构化渲染的智能简历系统，针对工程师 ATS 匹配机制优化，数据本地存储，支持即时预览与 PDF 导出。",
        href: "https://magic-resume.kyoyk.top/",
        host: "magic-resume.kyoyk.top",
      },
      {
        icon: "config",
        title: "Codex Config Viewer",
        badge: "工程外设 // LIVE",
        description:
          "可视化 Codex 配置管理与编辑器，支持多语言国际化切换、TOML 文件导入解析与自动化配置生成。",
        href: "https://codex-config.kythron.com/zh-CN",
        host: "codex-config.kythron.com",
      },
    ],
  },
  {
    code: "02",
    title: "全栈 Web 与生产力应用",
    cards: [
      {
        icon: "book",
        title: "英语研习室 (CET Practice)",
        badge: "学习空间 // LIVE",
        description:
          "本地离线优先的英语四级、六级与考研英语历年真题练习空间，纯净无广告，持久保存每一份练习进步。",
        href: "https://cet.kythron.com/",
        host: "cet.kythron.com",
      },
      {
        icon: "live",
        title: "StarLive 星播",
        badge: "全栈服务 // LIVE",
        description:
          "可自部署的高性能直播互动系统，集成实时高并发弹幕、虚拟礼物体系、红包抽奖与星币经济闭环。",
        href: "https://live.kythron.com/",
        host: "live.kythron.com",
      },
      {
        icon: "bill",
        title: "K记 (KBill)",
        badge: "生活工具 // LIVE",
        description:
          "一本有着温暖猫咪交互的个人记账本，支持收支分类与可视化财务记录。记一笔，就有猫咪来做客。",
        href: "https://kbill.kythron.com/",
        host: "kbill.kythron.com",
      },
      {
        icon: "mail",
        title: "MoeMail 临时邮箱",
        badge: "网络服务 // LIVE",
        description:
          "快速且安全的临时邮箱服务，隐私保护远离垃圾邮件，具备完整的 OpenAPI 接口支持自动化测试与脚本接入。",
        href: "https://mail.kythron.com/",
        host: "mail.kythron.com",
      },
    ],
  },
  {
    code: "03",
    title: "创意实验与互动工坊",
    cards: [
      {
        icon: "game",
        title: "大肥鱼 Token 保卫战",
        badge: "互动实验 // LIVE",
        description:
          "浏览器端实时 Token 塔防模拟实验，融合防御塔策略规划、波次怪物对抗与实时性能渲染。",
        href: "https://td.kythron.com/",
        host: "td.kythron.com",
      },
      {
        icon: "audio",
        title: "PULSE 音序鼓机",
        badge: "音频实验 // LIVE",
        description:
          "基于 Web Audio API 驱动的 16 步硬件质感鼓机：底鼓、军鼓、踩镲与打击乐，支持摇摆步进与实时律动高亮。",
        href: "https://pulse.kythron.com/",
        host: "pulse.kythron.com",
      },
      {
        icon: "bot",
        title: "BiliHardcore Web",
        badge: "自动化 // LIVE",
        description:
          "B站硬核会员题目辅助与自动化测试答题系统，提供高效题目检索与精准选项解析。",
        href: "https://bilibili.kythron.com/",
        host: "bilibili.kythron.com",
      },
      {
        icon: "card",
        title: "你命中注定开什么店",
        badge: "趣味测试 // LIVE",
        description:
          "12 道题，2 分钟，抽取专属命运店铺卡——测测你命中注定开一家什么店，支持精美卡片渲染与生成。",
        href: "https://fate-shop.kythron.com/",
        host: "fate-shop.kythron.com",
      },
      {
        icon: "sheep",
        title: "数羊 (Sheep)",
        badge: "极简交互 // LIVE",
        description:
          "极简入眠与白噪音辅助：跳过一只羊，输入 1。再跳过一只羊，输入 2。一直数下去，直到睡着。",
        href: "https://sheep.kythron.com/",
        host: "sheep.kythron.com",
      },
    ],
  },
  {
    code: "04",
    title: "精选开源生态与社区",
    cards: [
      {
        icon: "compass",
        title: "DeepWiki",
        badge: "代码探索",
        description:
          "开源代码仓库探索工具，支持语义检索、依赖拓扑与架构浏览，适合快速理解大型开源工程。",
        href: "https://deepwiki.com/",
        host: "deepwiki.com",
      },
      {
        icon: "community",
        title: "Linux.do",
        badge: "极客社区",
        description:
          "面向 Linux 和全栈开发者的前沿极客社区，覆盖技术讨论、开源实践与工程经验沉淀。",
        href: "https://linux.do/",
        host: "linux.do",
      },
    ],
  },
];

function ProjectIcon({ icon }: { icon: ProjectIconType }): ReactNode {
  switch (icon) {
    case "prompt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
        </svg>
      );
    case "resume":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    case "config":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      );
    case "live":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      );
    case "bill":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      );
    case "game":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      );
    case "audio":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      );
    case "bot":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      );
    case "card":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2l1.5-3.5L17 12l-3.5-1.5L12 7l-1.5 3.5L7 12l3.5 1.5z" />
        </svg>
      );
    case "sheep":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 10.6-13.4 8 8 0 0 1-8.7-6.6z" />
        </svg>
      );
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
    default:
      return null;
  }
}

export default function ProjPage(): ReactNode {
  return (
    <main className={styles.projectsPage}>
      <div className="container">
        {/* 顶部自解释元信息 */}
        <header className={styles.pageHeader}>
          <div className={styles.pageMeta}>
            <span className={styles.pageDot} />
            <span className={styles.pageTag}>TOOLBOX &amp; ECOSYSTEM // PERIPHERALS</span>
          </div>
          <h1 className={styles.pageTitle}>资源 &amp; 工具</h1>
          <p className={styles.pageDesc}>
            日常开发沉淀的在线应用、自研全栈系统与精选提效工具。所有项目均保持可用状态并接入 Cloudflare 边缘网络。
          </p>
        </header>

        {/* 章节式分组网格 */}
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
                      <div className={styles.cardIcon}>
                        <ProjectIcon icon={card.icon} />
                      </div>
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
                      <span className={styles.hostName}>{card.host}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
