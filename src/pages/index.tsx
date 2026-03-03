import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import HomepageHeader from "../components/HomepageHeader";
import styles from "./index.module.css";

const quickLinks = [
  {
    badge: "NOTE",
    title: "学习笔记",
    description: "按主题整理的技术学习记录，覆盖前端、后端、工程化与实践复盘。",
    to: "/blog",
    actionText: "进入笔记",
  },
  {
    badge: "TOOLS",
    title: "资源与工具",
    description: "精选开发资源、在线工具与个人应用服务，帮助快速解决真实问题。",
    to: "/proj",
    actionText: "打开资源页",
  },
] as const;

const topicCards = [
  {
    code: "FE",
    title: "前端与性能",
    text: "关注渲染机制、工程构建与交互体验，强调可读性与可维护性并重。",
  },
  {
    code: "BE",
    title: "后端与架构",
    text: "聚焦服务设计、数据建模和接口治理，记录可复用的落地模式。",
  },
  {
    code: "AI",
    title: "AI 与效率",
    text: "探索 AI 在开发流中的应用，沉淀脚手架、自动化与提示词实践。",
  },
] as const;

const practiceFlow = [
  {
    step: "01",
    title: "问题拆解",
    text: "先抽象目标与约束，避免在实现阶段反复返工。",
  },
  {
    step: "02",
    title: "小步验证",
    text: "每次改动可观测、可回退，优先保证稳定性与反馈速度。",
  },
  {
    step: "03",
    title: "知识沉淀",
    text: "将结论回写为文档和工具，持续提高后续任务效率。",
  },
] as const;

export default function Home(): ReactNode {
  return (
    <Layout description="个人笔记">
      <HomepageHeader />
      <main className="margin-top--xl margin-bottom--xl">
        <div className="container">
          <section className={styles.homeSection}>
            <div className={styles.homeQuickGrid}>
              {quickLinks.map((item) => (
                <article key={item.title} className={styles.homeQuickCard}>
                  <span className={styles.homeQuickBadge}>{item.badge}</span>
                  <h2 className={styles.homeQuickTitle}>{item.title}</h2>
                  <p className={styles.homeQuickText}>{item.description}</p>
                  <Link to={item.to} className="button button--primary">
                    {item.actionText}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.homeSection}>
            <div className={styles.homeSectionHeader}>
              <p className={styles.homeSectionHint}>内容导航</p>
              <h2 className={styles.homeSectionTitle}>你可以从这些方向开始</h2>
            </div>
            <div className={styles.homeTopicGrid}>
              {topicCards.map((item) => (
                <article key={item.title} className={styles.homeTopicCard}>
                  <span className={styles.homeTopicCode} aria-hidden="true">
                    {item.code}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.homeSection}>
            <div className={styles.homeSectionHeader}>
              <p className={styles.homeSectionHint}>方法论</p>
              <h2 className={styles.homeSectionTitle}>持续改进的工作流</h2>
            </div>
            <div className={styles.homeFlowGrid}>
              {practiceFlow.map((item) => (
                <article key={item.step} className={styles.homeFlowCard}>
                  <p className={styles.homeFlowStep}>{item.step}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.homeSection} ${styles.homeBottomCta}`}>
            <h2>准备好了就开始阅读</h2>
            <p>从最近的笔记开始，或直接前往资源页挑选可用工具。</p>
            <div className={styles.homeBottomActions}>
              <Link to="/blog" className="button button--primary button--lg">
                阅读最新内容
              </Link>
              <Link to="/proj" className="button button--secondary button--lg">
                浏览工具清单
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
