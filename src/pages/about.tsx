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
    title: "原初混沌",
    subtitle: "The First Vast",
    description:
      "在时间与空间尚未诞生之前，宇宙处于无形无序的原初混沌，一切可能性尚未被命名。",
  },
  {
    title: "原初诸神苏醒",
    subtitle: "Primordial Deities",
    description:
      "混沌中逐渐诞生最早的意识体。祂们并非万物的创造者，而是宇宙规则本身的化身。",
  },
  {
    title: "界限第一次出现",
    subtitle: "Kythron",
    description:
      "当混沌分裂为现实与虚无，Kythron 首次确立“界限”的概念，自此秩序开始在宇宙中成形。",
  },
];

export default function AboutPage(): ReactNode {
  return (
    <Layout title="关于" description="Kythron 世界观设定">
      <main className={styles.aboutPage}>
        <div className="container">
          <section className={styles.heroPanel}>
            <p className={styles.heroTag}>世界观设定</p>
            <h1 className={styles.heroTitle}>Kythron</h1>
            <p className={styles.heroText}>
              这是一套以“界限”为核心的宇宙叙事。Kythron 不塑造世界本身，却决定世界之间是否存在边界，
              也因此决定秩序是否能够被维持。
            </p>
          </section>

          <section className={styles.contentSection}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionCode}>I</span>
              <h2>宇宙起源</h2>
            </header>
            <p className={styles.sectionLead}>
              在时间与空间尚未诞生之前，宇宙处于被称为原初混沌（The First Vast）的状态。
              在这片无垠混沌之中，最早的意识体逐渐显现，成为原初诸神（Primordial Deities）。
            </p>
            <p className={styles.sectionLead}>
              当混沌开始分裂为现实与虚无，Kythron 首次定义了“界限”。
              这一瞬间，宇宙不再只是无差别的存在，秩序由此获得了诞生的可能。
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
              <h2>Kythron 的神格</h2>
            </header>
            <ul className={styles.titleList}>
              {divineTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <blockquote className={styles.coreQuote}>
              祂并不创造世界，但祂决定世界之间的界线是否存在。
            </blockquote>
          </section>
        </div>
      </main>
    </Layout>
  );
}

