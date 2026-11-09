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
              <svg className={styles.originArt} viewBox="0 0 820 360" role="img" aria-label="原初混沌中，金色秩序与冷色虚无在星轨仪中心的界限相接">
                <defs>
                  <radialGradient id="origin-amber"><stop stopColor="#e5a742" stopOpacity=".3" /><stop offset="1" stopColor="#e5a742" stopOpacity="0" /></radialGradient>
                  <radialGradient id="origin-cold"><stop stopColor="#38bdf8" stopOpacity=".25" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" /></radialGradient>
                  <radialGradient id="origin-core"><stop stopColor="#fff4d4" /><stop offset=".18" stopColor="#f5c779" /><stop offset=".5" stopColor="#e5a742" stopOpacity=".35" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></radialGradient>
                  <linearGradient id="origin-boundary"><stop stopColor="#e5a742" stopOpacity="0" /><stop offset=".32" stopColor="#e5a742" /><stop offset=".5" stopColor="#fff4d4" /><stop offset=".68" stopColor="#38bdf8" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" /></linearGradient>
                  <pattern id="origin-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#a9b8ca" strokeOpacity=".08" strokeWidth=".5" /><circle cx="0" cy="0" r=".8" fill="#b9c9d8" fillOpacity=".2" /></pattern>
                </defs>
                <path fill="url(#origin-grid)" d="M0 0h820v360H0z" />
                <ellipse cx="315" cy="180" rx="260" ry="155" fill="url(#origin-amber)" />
                <ellipse cx="505" cy="180" rx="260" ry="155" fill="url(#origin-cold)" />
                <g fill="none" strokeWidth=".7">
                  <path d="M35 180H785M410 18V342" stroke="#c8d5e3" opacity=".2" />
                  <path d="M60 72h110M60 68v8M170 68v8M650 288h110M650 284v8M410 20v12M410 328v12" stroke="#f5c779" opacity=".45" />
                  <path d="M52 247C150 208 181 110 291 110S403 180 410 180M52 266C167 232 193 137 300 135S389 166 410 180M410 180C463 180 478 250 552 250S675 146 768 118M410 180C463 194 480 226 555 225S676 161 768 137" stroke="url(#origin-boundary)" opacity=".48" />
                  <path d="M65 100l62-28 49 35 62-42 47 29M536 268l55-28 54 22 55-51 58 14M78 281l61-24 51 10M557 76l53 29 58-39 67 25" stroke="#b8c9d8" opacity=".25" />
                  <ellipse cx="410" cy="180" rx="270" ry="76" transform="rotate(-15 410 180)" stroke="#e5a742" opacity=".35" />
                  <ellipse cx="410" cy="180" rx="235" ry="65" transform="rotate(21 410 180)" stroke="#38bdf8" opacity=".35" />
                  <ellipse cx="410" cy="180" rx="195" ry="52" transform="rotate(-31 410 180)" stroke="#f5c779" opacity=".2" strokeDasharray="3 5" />
                  <circle cx="410" cy="180" r="157" stroke="#d7c19a" opacity=".22" />
                  <circle className={styles.orbitOuter} cx="410" cy="180" r="150" stroke="#f5c779" strokeWidth="7" strokeDasharray=".5 3.43" opacity=".55" />
                  <circle cx="410" cy="180" r="140" stroke="#e5a742" opacity=".45" />
                  <circle className={styles.orbitInner} cx="410" cy="180" r="132" stroke="#38bdf8" strokeWidth="5" strokeDasharray="1 7.3" opacity=".6" />
                  <circle cx="410" cy="180" r="119" stroke="#e5a742" strokeDasharray="23 4 2 4" opacity=".5" />
                  <circle cx="410" cy="180" r="104" stroke="#b7c9d7" opacity=".25" />
                  <circle cx="410" cy="180" r="86" stroke="#818cf8" strokeDasharray="2 5" opacity=".55" />
                  <circle cx="410" cy="180" r="67" stroke="#f5c779" opacity=".36" />
                  <path d="M410 76l104 104-104 104-104-104z M410 113l67 67-67 67-67-67z" stroke="#e5a742" opacity=".25" />
                  <path d="M410 31v18m0 262v18M261 180h18m262 0h18M304 74l13 13m186 186 13 13M516 74l-13 13M317 273l-13 13" stroke="#f5c779" opacity=".7" />
                  <circle cx="356" cy="180" r="54" stroke="#e5a742" opacity=".6" /><circle cx="464" cy="180" r="54" stroke="#38bdf8" opacity=".6" />
                  <path d="M20 180h780" stroke="url(#origin-boundary)" strokeWidth="1.5" />
                  <path className={styles.boundaryWave} d="M20 180h780" stroke="#fff4d4" strokeWidth="2" strokeDasharray="4 75" opacity=".8" />
                </g>
                <g fill="#f5c779" opacity=".75"><circle cx="127" cy="72" r="2" /><circle cx="176" cy="107" r="1.5" /><circle cx="238" cy="65" r="2" /><circle cx="139" cy="257" r="1.5" /><circle cx="291" cy="110" r="2" /><circle cx="304" cy="74" r="2" /></g>
                <g fill="#8bdcff" opacity=".75"><circle cx="591" cy="240" r="2" /><circle cx="645" cy="262" r="1.5" /><circle cx="700" cy="211" r="2" /><circle cx="610" cy="105" r="1.5" /><circle cx="668" cy="66" r="2" /><circle cx="516" cy="286" r="2" /></g>
                <circle className={styles.originGlow} cx="410" cy="180" r="48" fill="url(#origin-core)" />
                <circle cx="410" cy="180" r="12" fill="#08090c" stroke="#f5c779" strokeWidth=".8" />
                <circle className={styles.originCore} cx="410" cy="180" r="3" fill="#fff4d4" />
                <g fill="#cbb995" fontFamily="monospace" fontSize="7" letterSpacing="1.5" opacity=".65"><text x="62" y="61">ORDO / 00</text><text x="659" y="303">VOID / ∞</text><text x="420" y="25">N</text><text x="420" y="341">S</text></g>
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
                <svg viewBox="0 0 320 280" role="img" aria-label="现实、缓冲与虚无三层全息边界由中央能量信标贯穿">
                  <defs>
                    <linearGradient id="matrix-top" x2="0" y2="1"><stop stopColor="#e5a742" stopOpacity=".22" /><stop offset="1" stopColor="#e5a742" stopOpacity=".02" /></linearGradient>
                    <linearGradient id="matrix-mid" x2="0" y2="1"><stop stopColor="#38bdf8" stopOpacity=".19" /><stop offset="1" stopColor="#818cf8" stopOpacity=".02" /></linearGradient>
                    <radialGradient id="matrix-void"><stop stopColor="#818cf8" stopOpacity=".34" /><stop offset="1" stopColor="#08090c" stopOpacity="0" /></radialGradient>
                    <linearGradient id="matrix-beam" x2="0" y2="1"><stop stopColor="#f5c779" stopOpacity="0" /><stop offset=".25" stopColor="#f5c779" /><stop offset=".65" stopColor="#38bdf8" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" /></linearGradient>
                    <pattern id="matrix-grid" width="18" height="10" patternUnits="userSpaceOnUse"><path d="M0 5l9-5 9 5-9 5z" fill="none" stroke="#f5c779" strokeOpacity=".28" strokeWidth=".5" /><circle cx="9" cy="5" r=".7" fill="#f5c779" fillOpacity=".6" /></pattern>
                    <clipPath id="matrix-top-clip"><path d="M160 35l125 51-125 51L35 86z" /></clipPath>
                  </defs>
                  <ellipse cx="160" cy="211" rx="118" ry="50" fill="url(#matrix-void)" />
                  <g fill="none" strokeWidth=".7">
                    <path d="M35 86v91l125 54 125-54V86M52 93v91M268 93v91" stroke="#a0b5ca" opacity=".18" strokeDasharray="2 5" />
                    <path d="M160 160l125 51-125 51-125-51z" fill="#101217" fillOpacity=".7" stroke="#818cf8" opacity=".65" />
                    <path d="M35 211l125 61 125-61v-9l-125 51-125-51z" fill="#818cf8" fillOpacity=".06" stroke="#818cf8" opacity=".35" />
                    <ellipse cx="160" cy="211" rx="80" ry="32" stroke="#818cf8" opacity=".45" strokeDasharray="4 4" />
                    <ellipse cx="160" cy="211" rx="55" ry="22" stroke="#38bdf8" opacity=".48" />
                    <ellipse cx="160" cy="211" rx="29" ry="11" stroke="#818cf8" strokeDasharray="2 3" opacity=".8" />
                    <path d="M53 207l45 3 18 13 22-5 22 15 16-11 29 2 22-15 40-4" stroke="#818cf8" strokeDasharray="3 4" opacity=".75" />
                    <path d="M160 97l125 51-125 51-125-51z" fill="url(#matrix-mid)" stroke="#38bdf8" opacity=".75" />
                    <path d="M35 148v9l125 51 125-51v-9l-125 51z" fill="#38bdf8" fillOpacity=".06" stroke="#38bdf8" opacity=".35" />
                    <g className={styles.matrixFlow} stroke="#8bdcff" opacity=".6"><path d="M57 148c35-18 55 18 103 0s68-18 103 0" /><path d="M74 155c30-13 50 14 86 0s56-14 86 0" strokeDasharray="3 4" /><ellipse cx="160" cy="148" rx="66" ry="26" /><ellipse cx="160" cy="148" rx="42" ry="17" /></g>
                    <path d="M160 35l125 51-125 51L35 86z" fill="url(#matrix-top)" stroke="#f5c779" opacity=".85" />
                    <path d="M35 86v9l125 51 125-51v-9l-125 51z" fill="#e5a742" fillOpacity=".1" stroke="#e5a742" opacity=".55" />
                    <g clipPath="url(#matrix-top-clip)"><path d="M30 30h260v110H30z" fill="url(#matrix-grid)" /><path d="M160 47l96 39-96 39-96-39z M160 60l64 26-64 26-64-26z" stroke="#f5c779" opacity=".55" /></g>
                    <ellipse cx="160" cy="86" rx="39" ry="16" stroke="#f5c779" opacity=".8" /><ellipse cx="160" cy="86" rx="24" ry="10" stroke="#f5c779" strokeDasharray="2 3" />
                    <path d="M160 12v244" stroke="url(#matrix-beam)" strokeWidth="2" /><path className={styles.energyFlow} d="M160 12v244" stroke="#fff4d4" strokeWidth="2" strokeDasharray="2 24" />
                    <ellipse cx="160" cy="86" rx="12" ry="5" stroke="#fff4d4" /><ellipse cx="160" cy="148" rx="12" ry="5" stroke="#8bdcff" /><ellipse cx="160" cy="211" rx="12" ry="5" stroke="#b8baff" />
                  </g>
                  <g fill="#f5c779"><circle cx="160" cy="35" r="2" /><circle cx="35" cy="86" r="2" /><circle cx="285" cy="86" r="2" /><circle cx="160" cy="137" r="2" /><circle cx="160" cy="86" r="3" /></g>
                  <g fill="#8bdcff"><circle cx="35" cy="148" r="1.5" /><circle cx="285" cy="148" r="1.5" /><circle cx="160" cy="148" r="2" /></g>
                  <g fill="#a5a9ff"><circle cx="160" cy="211" r="2" /><circle cx="160" cy="262" r="1.5" /></g>
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
