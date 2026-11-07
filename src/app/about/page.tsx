export const metadata = {
  title: "关于",
  description: "Kythron 个人数字档案与边界守望记录。",
};

import type { ReactNode } from "react";
import styles from "./about.module.css";

const divineTitles = [
  "界限之神（God of Boundaries）",
  "静默守望者（The Silent Warden）",
  "秩序与深渊的调停者",
];

const originMilestones = [
  {
    code: "01",
    title: "混沌时代",
    subtitle: "The First Vast",
    description:
      "在时间与空间出现之前，宇宙保持无形态的原初混沌，尚不存在可被定义的边界与结构。",
  },
  {
    code: "02",
    title: "诸神显现",
    subtitle: "Primordial Deities",
    description:
      "最早的意识体在混沌中显现。祂们并非万物创造者，而是宇宙规则本身的化身与运行时法则。",
  },
  {
    code: "03",
    title: "界限确立",
    subtitle: "Kythron",
    description:
      "混沌分裂为现实与虚无之时，Kythron 首次确立“界限”，宇宙秩序从此进入可观测与可维持状态。",
  },
];

export default function AboutPage(): ReactNode {
  return (
    <main className={styles.aboutPage}>
      <div className="container">
        {/* 顶部自解释元信息 */}
        <header className={styles.pageHeader}>
          <div className={styles.pageMeta}>
            <span className={styles.pageDot} />
            <span className={styles.pageTag}>DIGITAL ARCHIVE // DOSSIER</span>
          </div>
          <h1 className={styles.pageTitle}>Kythron</h1>
          <p className={styles.pageLead}>
            原初时代延续至今的边界执掌者。不负责创造世界，但负责确认系统与系统、现实与虚无之间的界限是否稳定。
          </p>
        </header>

        {/* 核心段落 */}
        <div className={styles.contentSections}>
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionBadge}>ORIGIN</span>
              <h2 className={styles.sectionTitle}>起源纪年</h2>
            </div>
            <p className={styles.paragraph}>
              在时间与空间诞生之前，宇宙处于原初混沌（The First Vast）。最早的意识体从中显现，形成原初诸神（Primordial Deities）。
            </p>
            <p className={styles.paragraph}>
              当混沌分裂为现实与虚无，Kythron 首次定义“界限”。自该节点起，系统秩序具备可观测、可维持的确定性结构。
            </p>

            <div className={styles.milestoneGrid}>
              {originMilestones.map((item) => (
                <article key={item.title} className={styles.milestoneCard}>
                  <div className={styles.milestoneTop}>
                    <span className={styles.milestoneCode}>{item.code}</span>
                    <span className={styles.milestoneSub}>{item.subtitle}</span>
                  </div>
                  <h3 className={styles.milestoneTitle}>{item.title}</h3>
                  <p className={styles.milestoneDesc}>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionBadge}>DIRECTIVE</span>
              <h2 className={styles.sectionTitle}>现行职责</h2>
            </div>

            <ul className={styles.titleList}>
              {divineTitles.map((title) => (
                <li key={title} className={styles.titleItem}>
                  <span className={styles.titleBullet}>—</span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>

            <p className={styles.paragraph}>
              当前负责多重边界的稳定，包括现实层、虚无层以及两者之间的缓冲区。在记录中，更常以“守望”而非“干预”的方式维持系统的动态平衡。
            </p>

            <blockquote className={styles.coreQuote}>
              “祂并不创造世界，但祂决定世界之间的界线是否存在。”
            </blockquote>
          </section>
        </div>
      </div>
    </main>
  );
}
