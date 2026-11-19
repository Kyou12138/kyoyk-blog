import ObsidianProjects from "@/components/obsidian/Projects";
import { getSkin } from "@/lib/skinPreference";
import type { Metadata } from "next";
import styles from "./proj.module.css";

export const metadata: Metadata = {
  title: "工具",
  description: "自研 AI 原生系统、全栈 Web 应用与开源生态。",
  alternates: { canonical: "/proj" },
};

type ProjectItem = {
  title: string;
  description: string;
  href: string;
  host: string;
};

type ProjectSection = {
  code: string;
  title: string;
  items: ProjectItem[];
};

const projectSections: ProjectSection[] = [
  {
    code: "01",
    title: "AI 原生与工程外设",
    items: [
      {
        title: "PromptVault · 灵感档案",
        description: "资产化 Prompt 模板管理与 MCP 协议枢纽，面向上下文工程的高复用编排。",
        href: "https://prompt.kythron.com/",
        host: "prompt.kythron.com",
      },
      {
        title: "魔方简历",
        description: "基于 AST 结构化渲染的工程师简历系统，本地优先存储，支持即时排版预览与 PDF 导出。",
        href: "https://magic-resume.kyoyk.top/",
        host: "magic-resume.kyoyk.top",
      },
      {
        title: "Codex Config Viewer",
        description: "可视化 Codex CLI 配置编辑器，支持多语言切换、TOML 导入解析与结构化生成。",
        href: "https://codex-config.kythron.com/zh-CN",
        host: "codex-config.kythron.com",
      },
    ],
  },
  {
    code: "02",
    title: "全栈应用",
    items: [
      {
        title: "英语研习室",
        description: "离线优先的四六级与考研英语真题练习空间，纯净无扰，持久记录每一次练习轨迹。",
        href: "https://cet.kythron.com/",
        host: "cet.kythron.com",
      },
      {
        title: "StarLive 星播",
        description: "可自部署的实时直播互动系统，集成高并发弹幕、礼物打赏、红包抽奖与星币账本。",
        href: "https://live.kythron.com/",
        host: "live.kythron.com",
      },
      {
        title: "K记",
        description: "带猫咪陪伴交互的个人记账本，支持收支归类与月度财务可视化。",
        href: "https://kbill.kythron.com/",
        host: "kbill.kythron.com",
      },
      {
        title: "MoeMail 临时邮箱",
        description: "轻量隐私临时收件服务，提供完整 OpenAPI 接口以便自动化测试与脚本接入。",
        href: "https://mail.kythron.com/",
        host: "mail.kythron.com",
      },
    ],
  },
  {
    code: "03",
    title: "互动实验",
    items: [
      {
        title: "大肥鱼 Token 保卫战",
        description: "浏览器端实时 Token 塔防实验，融合路径策略规划、波次对抗与 Canvas 帧率渲染。",
        href: "https://td.kythron.com/",
        host: "td.kythron.com",
      },
      {
        title: "PULSE 音序鼓机",
        description: "基于 Web Audio API 的 16 步硬件感音序器，支持底鼓、军鼓、踩镲与摇摆律动调制。",
        href: "https://pulse.kythron.com/",
        host: "pulse.kythron.com",
      },
      {
        title: "BiliHardcore Web",
        description: "B 站硬核会员题库检索与辅助解析工具，面向高频知识点的即时定位。",
        href: "https://bilibili.kythron.com/",
        host: "bilibili.kythron.com",
      },
      {
        title: "命运店铺签",
        description: "12 题轻量人格问答，即时生成定制插画风命运店铺签卡。",
        href: "https://fate-shop.kythron.com/",
        host: "fate-shop.kythron.com",
      },
      {
        title: "数羊",
        description: "极简入眠白噪音实验：跳过一只羊，敲入一个数字，直到意识沉入安静。",
        href: "https://sheep.kythron.com/",
        host: "sheep.kythron.com",
      },
    ],
  },
  {
    code: "04",
    title: "开源与社区",
    items: [
      {
        title: "DeepWiki",
        description: "开源仓库语义检索与依赖拓扑浏览工具，辅助快速拆解大型代码库结构。",
        href: "https://deepwiki.com/",
        host: "deepwiki.com",
      },
      {
        title: "Linux.do",
        description: "面向 Linux 与全栈工程师的技术社区，沉淀开源实践与一线工程讨论。",
        href: "https://linux.do/",
        host: "linux.do",
      },
    ],
  },
];

export default async function ProjPage() {
  if ((await getSkin()) === "ink") return <ObsidianProjects />;

  const totalCount = projectSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <main className="section">
      <div className="container">
        <header className="editorial-head">
          <h1 className="editorial-head__title">工具</h1>
          <div className="editorial-head__aside">
            <span className="editorial-head__count">{totalCount} 项</span>
          </div>
        </header>

        <div className={styles.catalogue}>
          {projectSections.map((section) => {
            const hasLead = section.items.length % 2 === 1;
            return (
              <section key={section.code} className={styles.chapter}>
                <aside className={styles.chapterRail}>
                  <span className={styles.chapterCode}>{section.code}</span>
                  <h2 className={styles.chapterTitle}>{section.title}</h2>
                  <span className={styles.chapterCount}>{section.items.length}</span>
                </aside>

                <div className={styles.matrix}>
                  {section.items.map((item, idx) => (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.cell} ${hasLead && idx === 0 ? styles.cellLead : ""}`}
                    >
                      <div className={styles.cellTop}>
                        <span className={styles.cellIdx}>
                          {section.code}.{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.cellHost}>
                          <span>{item.host}</span>
                          <span className={styles.cellArrow} aria-hidden="true">
                            ↗
                          </span>
                        </span>
                      </div>

                      <h3 className={styles.cellTitle}>{item.title}</h3>
                      <p className={styles.cellDesc}>{item.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
