"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeroCanvasBackground from "@/components/HeroCanvasBackground";
import styles from "@/components/home-hero.module.css";
import { SITE_TAGLINE } from "@/lib/site";

const cx = (...names: Array<string | false | undefined>): string =>
  names.filter(Boolean).join(" ");

const headlineFrames = [
  { lead: "TALK", tail: "CODE" },
  { lead: "CODE", tail: "PROMPT" },
] as const;

const heroFlow = [
  { code: "01", title: "拆解目标", text: "先定义范围与约束，减少返工。" },
  { code: "02", title: "快速试验", text: "以小步迭代验证交互与性能。" },
  { code: "03", title: "沉淀复用", text: "把经验沉淀成文档和工具。" },
] as const;

const TEAR_START_MS = 2000;
const WORD_FLIP_MS = 110;
const WORD_TEAR_MS = 860;

export default function HomeHero() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [tearActive, setTearActive] = useState(false);
  const activeFrame = headlineFrames[frameIndex];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // 循环播放：撕裂 → 换词 → 复位 → 等待，让动效在长时间停留时也可见
    let timers: number[] = [];
    const clear = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

    const cycle = () => {
      setFrameIndex(0);
      timers.push(
        window.setTimeout(() => {
          setTearActive(true);
          timers.push(window.setTimeout(() => setFrameIndex(1), WORD_FLIP_MS));
          timers.push(window.setTimeout(() => setTearActive(false), WORD_TEAR_MS));
          timers.push(window.setTimeout(cycle, WORD_TEAR_MS + 4200));
        }, TEAR_START_MS),
      );
    };

    cycle();
    return clear;
  }, []);

  return (
    <header className={cx("hero", styles.heroBanner)}>
      <HeroCanvasBackground className={styles.heroCanvas} />
      <div className={cx("container", styles.heroInner)}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} aria-hidden="true" />
              KYOU BLOG
            </p>
            <h1 className={styles.heroTitle}>
              <span className={cx(styles.swapSlot, styles.swapSlotLead)}>
                <span
                  className={cx(styles.swapWord, tearActive && styles.wordTearing)}
                  data-word={activeFrame.lead}
                >
                  {activeFrame.lead}
                </span>
              </span>
              <span className={styles.heroText}> is cheap, show me </span>
              <span className={styles.heroTailKeep}>
                <span className={styles.heroText}>your </span>
                <span className={cx(styles.swapSlot, styles.swapSlotTail)}>
                  <span
                    className={cx(styles.swapWord, tearActive && styles.wordTearing)}
                    data-word={activeFrame.tail}
                  >
                    {activeFrame.tail}
                  </span>
                </span>
              </span>
            </h1>
            <p className={styles.heroSubtitle}>{SITE_TAGLINE}</p>
            <div className={styles.heroActions}>
              <Link className={cx("button", styles.heroAction)} href="/blog">
                开始阅读
              </Link>
              <Link className={cx("button", "button--ghost", styles.heroActionGhost)} href="/proj">
                资源导航
              </Link>
            </div>
            <div className={styles.heroStats} aria-label="站点速览">
              <span>专注前后端与 AI 实践</span>
              <span>持续更新学习记录</span>
              <span>沉淀可复用资源</span>
            </div>
          </div>

          <aside className={styles.heroVisual} aria-label="首页视觉面板">
            <div className={styles.heroOrbital}>
              <span className={styles.heroOrbRing} aria-hidden="true" />
              <span className={styles.heroOrbRingSoft} aria-hidden="true" />
              <span className={styles.heroOrbCore} aria-hidden="true" />
              <span className={cx(styles.heroOrbDot, styles.heroOrbDotA)} aria-hidden="true" />
              <span className={cx(styles.heroOrbDot, styles.heroOrbDotB)} aria-hidden="true" />
              <span className={cx(styles.heroOrbDot, styles.heroOrbDotC)} aria-hidden="true" />
            </div>
            <div className={styles.heroFlow}>
              {heroFlow.map((item) => (
                <div key={item.code} className={styles.heroFlowItem}>
                  <span className={styles.heroFlowCode}>{item.code}</span>
                  <div>
                    <p className={styles.heroFlowTitle}>{item.title}</p>
                    <p className={styles.heroFlowText}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
