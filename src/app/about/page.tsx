import ObsidianAbout from "@/components/obsidian/About";
import { getSkin } from "@/lib/skinPreference";
import type { Metadata } from "next";
import Image from "next/image";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "关于",
  description: "Kythron 个人数字档案与边界守望记录。",
  alternates: { canonical: "/about" },
};

const divineTitles = [
  "界限之神 · God of Boundaries",
  "静默守望者 · The Silent Warden",
  "秩序与深渊的调停者",
];

const originMilestones = [
  {
    code: "01",
    title: "混沌时代",
    description: "时间与空间尚未显现，原初混沌保持无形态连续态，不存在可观测的边界与结构。",
  },
  {
    code: "02",
    title: "诸神显现",
    description: "最早的意识体自混沌中醒来，并非造物主，而是宇宙底层法则的具象运行时。",
  },
  {
    code: "03",
    title: "界限确立",
    description: "混沌分裂为现实与虚无，Kythron 划定第一道界线，秩序自此进入可观测与可维持状态。",
  },
];

function PlateArt({
  src,
  alt,
  fig,
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  fig: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure className={styles.plate}>
      <div className={styles.artFrame}>
        <Image
          className={styles.artImage}
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          priority={priority}
        />
        <div className={styles.artVignette} aria-hidden="true" />
        <svg
          className={styles.reticle}
          viewBox="0 0 820 460"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" stroke="currentColor" strokeWidth="0.75">
            <circle className={styles.orbitOuter} cx="410" cy="230" r="154" strokeDasharray="2 9" />
            <circle className={styles.orbitInner} cx="410" cy="230" r="132" strokeDasharray="42 12 2 12" />
            <path d="M410 58v28 M410 374v28 M238 230h28 M554 230h28 M397 230h26 M410 217v26" />
            <path d="M24 58V24h34 M762 24h34v34 M24 402v34h34 M762 436h34v-34" />
          </g>
        </svg>
      </div>
      <figcaption className={styles.plateCaption}>
        <span className={styles.plateFig}>{fig}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

export default async function AboutPage() {
  if ((await getSkin()) === "ink") return <ObsidianAbout />;

  return (
    <main className="section">
      <div className="container">
        <header className="editorial-head">
          <h1 className="editorial-head__title">Kythron</h1>
        </header>

        <section className={styles.introSplit}>
          <div className={styles.introText}>
            <p className={styles.lead}>
              原初时代延续至今的边界执掌者。不负责创造世界，只负责确认系统与系统、现实与虚无之间的界限是否稳固。
            </p>
            <ul className={styles.epithets}>
              {divineTitles.map((item, i) => (
                <li key={item}>
                  <span className={styles.epithetIdx}>0{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <PlateArt
            src="/img/about/kythron-entity.webp"
            alt="界限守望者伫立于多维宇宙的交汇处"
            fig="FIG. 01"
            caption="静默守望者 · 多维边界交汇处"
            priority
          />
        </section>

        <section className={styles.chapter}>
          <aside className={styles.chapterRail}>
            <span className={styles.chapterCode}>01</span>
            <h2 className={styles.chapterTitle}>起源纪年</h2>
          </aside>

          <div className={styles.chapterBody}>
            <p className={styles.proseText}>
              在时间与空间诞生之前，宇宙处于原初混沌。最早的意识体从中显现，形成原初诸神；当混沌裂解为现实与虚无，Kythron 首次定义「界限」，使无序能量收束为可观测、可推演的确定性结构。
            </p>

            <PlateArt
              src="/img/about/origin-boundary.webp"
              alt="界限将原初混沌分为秩序星群与深空虚无"
              fig="FIG. 02"
              caption="原初图景 · 混沌、界限与秩序"
            />

            <div className={styles.triptych}>
              {originMilestones.map((item) => (
                <article key={item.code} className={styles.triptychCell}>
                  <span className={styles.cellCode}>{item.code}</span>
                  <h3 className={styles.cellTitle}>{item.title}</h3>
                  <p className={styles.cellDesc}>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.chapter}>
          <aside className={styles.chapterRail}>
            <span className={styles.chapterCode}>02</span>
            <h2 className={styles.chapterTitle}>现行职责</h2>
          </aside>

          <div className={styles.chapterBody}>
            <div className={styles.directiveGrid}>
              <div className={styles.directiveCopy}>
                <p className={styles.proseText}>
                  当前维持现实层、缓冲区与虚无层三重边界的动态平衡。在漫长纪年里，始终以「守望」替代「干预」——只要契约与边界未曾崩解，系统便在各自轨道内自由演化。
                </p>
                <blockquote className={styles.pullQuote}>
                  “祂并不创造世界，但祂决定世界之间的界线是否存在。”
                </blockquote>
              </div>

              <PlateArt
                src="/img/about/threefold-watch.webp"
                alt="光束贯穿秩序、缓冲与虚无三层边界"
                fig="FIG. 03"
                caption="三重守望 · 现实层 / 缓冲区 / 虚无层"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
