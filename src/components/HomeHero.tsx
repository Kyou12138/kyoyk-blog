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
  { code: "01", title: "拆解目标" },
  { code: "02", title: "快速试验" },
  { code: "03", title: "沉淀复用" },
] as const;

const TEAR_START_MS = 2000;
const WORD_FLIP_MS = 110;
const WORD_TEAR_MS = 860;

const GLYPHS = "!<>-_\\/[]{}—=+*^?#";

function scramble(target: string, onUpdate: (s: string) => void) {
  let step = 0;
  const total = 8;
  const timer = setInterval(() => {
    step++;
    const progress = step / total;
    let s = "";
    for (let i = 0; i < target.length; i++) {
      if (progress > (i + 1) / target.length) {
        s += target[i];
      } else {
        s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
    }
    onUpdate(s);
    if (step >= total) {
      clearInterval(timer);
      onUpdate(target);
    }
  }, 28);
  return () => clearInterval(timer);
}

export default function HomeHero() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [tearActive, setTearActive] = useState(false);
  const [displayLead, setDisplayLead] = useState<string>(headlineFrames[0].lead);
  const [displayTail, setDisplayTail] = useState<string>(headlineFrames[0].tail);
  const activeFrame = headlineFrames[frameIndex];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // 循环播放：撕裂 → 换词矩阵解码 → 复位 → 等待
    let timers: number[] = [];
    const clear = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

    const cycle = () => {
      setFrameIndex(0);
      scramble(headlineFrames[0].lead, setDisplayLead);
      scramble(headlineFrames[0].tail, setDisplayTail);

      timers.push(
        window.setTimeout(() => {
          setTearActive(true);
          timers.push(
            window.setTimeout(() => {
              setFrameIndex(1);
              scramble(headlineFrames[1].lead, setDisplayLead);
              scramble(headlineFrames[1].tail, setDisplayTail);
            }, WORD_FLIP_MS),
          );
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
            <h1 className={styles.heroTitle}>
              <span className={cx(styles.swapSlot, styles.swapSlotLead)}>
                <span
                  className={cx(styles.swapWord, tearActive && styles.wordTearing)}
                  data-word={displayLead}
                >
                  {displayLead}
                </span>
              </span>
              <span className={styles.heroText}> is cheap, show me </span>
              <span className={styles.heroTailKeep}>
                <span className={styles.heroText}>your </span>
                <span className={cx(styles.swapSlot, styles.swapSlotTail)}>
                  <span
                    className={cx(styles.swapWord, tearActive && styles.wordTearing)}
                    data-word={displayTail}
                  >
                    {displayTail}
                  </span>
                </span>
              </span>
            </h1>
            <p className={styles.heroSubtitle}>{SITE_TAGLINE}</p>
            <div className={styles.heroActions}>
              <Link data-magnetic className={cx("button", styles.heroAction)} href="/blog">
                开始阅读
              </Link>
              <Link data-magnetic className={cx("button", "button--ghost", styles.heroActionGhost)} href="/proj">
                资源导航
              </Link>
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
                <div key={item.code} data-magnetic className={styles.heroFlowItem}>
                  <span className={styles.heroFlowCode}>{item.code}</span>
                  <span className={styles.heroFlowTitle}>{item.title}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
