export const metadata = {
  title: "关于",
  description: "Kythron 个人数字档案与边界守望记录。",
};

import type { ReactNode } from "react";
import Image from "next/image";
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


function ConceptArt({ src, alt, label, priority = false }: { src: string; alt: string; label: string; priority?: boolean }): ReactNode {
  return (
    <div className={styles.artFrame}>
      <Image className={styles.artImage} src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, 820px" priority={priority} />
      <div className={styles.artShade} aria-hidden="true" />
      <svg className={styles.hud} viewBox="0 0 820 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="0.8">
          <circle className={styles.orbitOuter} cx="410" cy="230" r="156" strokeDasharray="2 8" />
          <circle className={styles.orbitInner} cx="410" cy="230" r="136" strokeDasharray="45 12 2 12" />
          <path d="M410 55v32 M410 373v32 M235 230h32 M553 230h32 M395 230h30 M410 215v30" />
          <path d="M25 65V25h40 M755 25h40v40 M25 395v40h40 M755 435h40v-40" />
          <path className={styles.pulse} d="M25 390H260l25-18h250l25 18h235" strokeDasharray="4 35" />
        </g>
      </svg>
      <div className={styles.telemetry} aria-hidden="true"><span>OBSERVATION / {label}</span><span>SYS · 00 / ∞</span></div>
    </div>
  );
}

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

        <figure className={styles.heroFigure}>
          <ConceptArt src="/img/about/kythron-entity.png" alt="界限守望者伫立于多维宇宙的交汇处" label="ENTITY" priority />
          <figcaption className={styles.figureCaption}><span>核心档案 · 静默守望者</span><span>KYTHRON / OBSERVATION 01</span></figcaption>
        </figure>

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

            <figure className={styles.originFigure}>
              <ConceptArt src="/img/about/origin-boundary.png" alt="黄金界限将原初混沌分为秩序星群与深蓝虚无" label="ORIGIN" />
              <figcaption className={styles.figureCaption}>
                <span>原初图景 · 界限的诞生</span>
                <span>混沌 / 界限 / 秩序</span>
              </figcaption>
            </figure>

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

            <div className={styles.directiveLayout}>
              <div>
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
              </div>
              <figure className={styles.watchFigure}>
                <ConceptArt src="/img/about/threefold-watch.png" alt="黄金光束贯穿秩序、缓冲与虚无三层边界" label="DIRECTIVE" />
                <figcaption>现实层 <span>/</span> 缓冲区 <span>/</span> 虚无层</figcaption>
              </figure>
            </div>

            <blockquote className={styles.coreQuote}>
              “祂并不创造世界，但祂决定世界之间的界线是否存在。”
            </blockquote>
          </section>
        </div>
      </div>
    </main>
  );
}
