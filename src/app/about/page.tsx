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

            <figure className={styles.originFigure}>
              <svg className={styles.originArt} viewBox="0 0 820 310" role="img" aria-label="原初混沌中，一道界线穿过星轨，将现实与虚无分开">
                <defs>
                  <radialGradient id="origin-glow"><stop stopColor="#e5a742" stopOpacity=".24" /><stop offset="1" stopColor="#e5a742" stopOpacity="0" /></radialGradient>
                  <linearGradient id="origin-line"><stop stopColor="#e5a742" stopOpacity="0" /><stop offset=".5" stopColor="#f5c779" /><stop offset="1" stopColor="#e5a742" stopOpacity="0" /></linearGradient>
                </defs>
                <circle className={styles.originGlow} cx="410" cy="155" r="155" fill="url(#origin-glow)" />
                <circle className={styles.gravityHalo} cx="410" cy="155" r="122" fill="none" stroke="#f5c779" strokeOpacity=".18" />
                <circle className={styles.gravityHaloDelayed} cx="410" cy="155" r="122" fill="none" stroke="#f5c779" strokeOpacity=".12" />
                <g fill="none" stroke="#e5a742">
                  <circle cx="410" cy="155" r="113" opacity=".16" />
                  <g className={styles.orbitOuter}><circle cx="410" cy="155" r="130" opacity=".24" strokeDasharray="18 9 2 9" /><circle cx="410" cy="25" r="2" fill="#f5c779" stroke="none" /></g>
                  <g className={styles.orbitInner}><circle cx="410" cy="155" r="78" opacity=".3" strokeDasharray="1 5" /><circle cx="488" cy="155" r="2" fill="#fff0c9" stroke="none" /></g>
                  <circle className={styles.orbitRing} cx="410" cy="155" r="91" opacity=".34" strokeDasharray="2 6" />
                  <circle cx="410" cy="155" r="67" opacity=".45" />
                  <g className={styles.orbitTrack}><ellipse cx="410" cy="155" rx="216" ry="63" transform="rotate(-18 410 155)" opacity=".28" /></g>
                  <g className={styles.orbitTrackReverse}><ellipse cx="410" cy="155" rx="176" ry="51" transform="rotate(26 410 155)" opacity=".2" /></g>
                  <path d="M410 24v262M277 155h266" opacity=".18" />
                  <path className={styles.compass} d="M410 75l80 80-80 80-80-80z" opacity=".45" />
                  <path d="M38 155h744" stroke="url(#origin-line)" strokeWidth="1.5" />
                  <path className={styles.boundaryWave} d="M38 155h744" stroke="#fff0c9" strokeWidth="2" strokeDasharray="22 80" opacity=".6" />
                  <path className={styles.boundaryWaveReverse} d="M38 155h744" stroke="#e5a742" strokeWidth="4" strokeDasharray="5 125" opacity=".35" />
                  <path d="M68 114l75-29 80 24 71-40M529 237l80-46 64 17 77-38" opacity=".24" />
                </g>
                <g fill="#efc57e">
                  <circle className={styles.originCore} cx="410" cy="155" r="4" /><circle cx="330" cy="155" r="2.5" /><circle cx="490" cy="155" r="2.5" />
                </g>
                <g className={styles.stars} fill="#efc57e">
                  <circle cx="143" cy="85" r="2" /><circle cx="223" cy="109" r="1.5" /><circle cx="609" cy="191" r="2" /><circle cx="673" cy="208" r="1.5" />
                  <circle cx="95" cy="218" r="1" /><circle cx="198" cy="49" r="1" /><circle cx="568" cy="62" r="1" /><circle cx="733" cy="93" r="1" />
                </g>
                <g className={styles.photon} fill="#fff0c9"><circle cx="38" cy="155" r="2.5" /><circle cx="38" cy="155" r="6" opacity=".2" /></g>
                <g className={`${styles.photon} ${styles.photonReverse}`} fill="#fff0c9"><circle cx="782" cy="155" r="2" /><circle cx="782" cy="155" r="5" opacity=".2" /></g>
              </svg>
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
                <svg viewBox="0 0 260 200" role="img" aria-label="现实层、缓冲区与虚无层的三重边界示意图">
                  <g fill="none" stroke="#e5a742">
                    <path d="M130 18v157M25 68v57M235 68v57" opacity=".18" strokeDasharray="3 5" />
                    <g className={styles.watchTop}>
                      <path d="M130 18l105 50-105 50L25 68z" fill="#e5a742" fillOpacity=".045" stroke="none" />
                      <path d="M130 18l105 50-105 50L25 68z" opacity=".7" />
                      <ellipse cx="130" cy="68" rx="42" ry="20" opacity=".55" />
                      <ellipse cx="130" cy="68" rx="21" ry="10" opacity=".7" />
                      <ellipse className={styles.watchPulse} cx="130" cy="68" rx="21" ry="10" />
                      <ellipse className={`${styles.watchPulse} ${styles.watchPulseDelayed}`} cx="130" cy="68" rx="21" ry="10" />
                      <g className={styles.watchScan}><path d="M130 68l36-10" stroke="#f5c779" opacity=".85" /><path d="M130 68l27-15" opacity=".3" /></g>
                      <g className={styles.watchScanReverse}><path d="M130 68l-25 16" stroke="#f5c779" opacity=".55" /></g>
                      <circle className={styles.watchBeacon} cx="130" cy="68" r="3" fill="#f5c779" stroke="none" />
                      <path d="M130 57v22M119 68h22" stroke="#f5c779" opacity=".7" />
                    </g>
                    <g className={styles.watchMiddle}>
                      <path d="M25 87l105 50 105-50-105-50z" fill="#e5a742" fillOpacity=".025" opacity=".42" />
                      <path d="M25 106l105 50 105-50" opacity=".42" />
                    </g>
                    <g className={styles.watchBottom}>
                      <path d="M25 125l105 50 105-50-105-50z" fill="#e5a742" fillOpacity=".025" opacity=".3" />
                    </g>
                    <path className={styles.energyFlow} d="M130 68v107M25 68v57M235 68v57" stroke="#f5c779" strokeDasharray="3 12" opacity=".7" />
                  </g>
                </svg>
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
