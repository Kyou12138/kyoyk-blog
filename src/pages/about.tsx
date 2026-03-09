import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import styles from "./about.module.css";

const divineTitles = [
  "界限之神（God of Boundaries）",
  "静默守望者（The Silent Warden）",
  "秩序与深渊的调停者",
];

const originMilestones = [
  {
    title: "混沌时代",
    subtitle: "The First Vast",
    description:
      "在时间与空间出现之前，宇宙保持无形态的原初混沌，尚不存在可被定义的边界。",
  },
  {
    title: "诸神显现",
    subtitle: "Primordial Deities",
    description:
      "最早的意识体在混沌中显现。祂们并非万物创造者，而是宇宙规则本身的化身。",
  },
  {
    title: "界限确立",
    subtitle: "Kythron",
    description:
      "混沌分裂为现实与虚无之时，Kythron 首次确立“界限”，宇宙秩序从此进入可维持状态。",
  },
];

export default function AboutPage(): ReactNode {
  return (
    <Layout title="关于" description="Kythron 档案">
      <main className={styles.aboutPage}>
        <div className="container">
          <section className={styles.heroPanel}>
            <p className={styles.heroTag}>核心档案</p>
            <h1 className={styles.heroTitle}>Kythron</h1>
            <p className={styles.heroText}>
              Kythron 是原初时代延续至今的边界执掌者。祂不负责创造世界，
              但负责确认世界与世界之间的边界是否稳定，避免现实与虚无发生失衡。
            </p>
          </section>

          <section className={styles.contentSection}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionCode}>I</span>
              <h2>起源纪年</h2>
            </header>
            <p className={styles.sectionLead}>
              在时间与空间诞生之前，宇宙处于原初混沌（The First Vast）。
              最早的意识体从中显现，形成原初诸神（Primordial Deities）。
            </p>
            <p className={styles.sectionLead}>
              当混沌分裂为现实与虚无，Kythron 首次定义“界限”。
              自该节点起，宇宙秩序具备可观测、可维持的结构。
            </p>

            <div className={styles.timelineGrid}>
              {originMilestones.map((item) => (
                <article key={item.title} className={styles.timelineCard}>
                  <p className={styles.timelineSub}>{item.subtitle}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.contentSection}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionCode}>II</span>
              <h2>现行职责</h2>
            </header>
            <ul className={styles.titleList}>
              {divineTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <p className={styles.sectionLead}>
              Kythron 当前负责多重边界的稳定，包括现实层、虚无层以及两者之间的缓冲区。
              在记录中，祂更常以“守望”而非“干预”的方式维持平衡。
            </p>
            <blockquote className={styles.coreQuote}>
              祂并不创造世界，但祂决定世界之间的界线是否存在。
            </blockquote>
          </section>
        </div>
      </main>
    </Layout>
  );
}
