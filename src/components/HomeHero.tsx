"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeroCanvasBackground from "@/components/HeroCanvasBackground";
import AiSystemCortex from "@/components/AiSystemCortex";
import styles from "@/components/home-hero.module.css";
import { SITE_TAGLINE } from "@/lib/site";

const cx = (...names: Array<string | false | undefined>): string =>
  names.filter(Boolean).join(" ");

const headlineFrames = [
  { lead: "TALK", tail: "CODE" },
  { lead: "CODE", tail: "PROMPT" },
] as const;

const principles = [
  { code: "01", title: "架构先行", desc: "定义系统契约与服务边界，杜绝盲目试错" },
  { code: "02", title: "智能体工程", desc: "LLM as CPU • 上下文压缩 • MCP 协议外设" },
  { code: "03", title: "知识沉淀", desc: "31+ 篇全栈底层与 AI 原生工程演进账册" },
] as const;

const POST_BOOT_TEAR_DELAY_MS = 2400;
const WORD_FLIP_DURATION_MS = 120;
const WORD_TEAR_DURATION_MS = 860;
const LOOP_INTERVAL_MS = 8500;

export default function HomeHero() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [tearActive, setTearActive] = useState(false);
  const activeFrame = headlineFrames[frameIndex];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let timers: number[] = [];
    const clear = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };

    const runSequence = () => {
      timers.push(
        window.setTimeout(() => {
          setTearActive(true);

          timers.push(
            window.setTimeout(() => {
              setFrameIndex((prev) => (prev === 0 ? 1 : 0));
            }, WORD_FLIP_DURATION_MS),
          );

          timers.push(
            window.setTimeout(() => {
              setTearActive(false);
            }, WORD_TEAR_DURATION_MS),
          );

          timers.push(window.setTimeout(runSequence, LOOP_INTERVAL_MS));
        }, POST_BOOT_TEAR_DELAY_MS),
      );
    };

    runSequence();
    return clear;
  }, []);

  return (
    <header className={cx("hero", styles.heroBanner)}>
      <HeroCanvasBackground className={styles.heroCanvas} />
      <div className={cx("container", styles.heroInner)}>
        <div className={styles.heroGrid}>
          {/* 左侧：自我宣言与工程准则 */}
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} />
              <span>KYOU // FULLSTACK & AI AGENT ARCHITECT</span>
            </div>

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

            <p className={styles.heroSubtitle}>
              {SITE_TAGLINE} 专注于复杂全栈架构、LLM 智能体系统与高信噪比技术实践。
            </p>

            <div className={styles.heroActions}>
              <Link className={cx("button", styles.heroAction)} href="/blog">
                探索知识库 ➔
              </Link>
              <Link className={cx("button", "button--ghost", styles.heroActionGhost)} href="/proj">
                工程代表作 ➔
              </Link>
            </div>

            {/* 精密工程账册清单 */}
            <div className={styles.heroPrinciples}>
              {principles.map((p) => (
                <div key={p.code} className={styles.principleItem}>
                  <span className={styles.principleCode}>{p.code}</span>
                  <div className={styles.principleBody}>
                    <div className={styles.principleTitle}>{p.title}</div>
                    <div className={styles.principleDesc}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：AI 智能体系统拓扑交互视窗 */}
          <aside className={styles.heroVisual} aria-label="AI 智能体系统架构视窗">
            <AiSystemCortex />
          </aside>
        </div>
      </div>
    </header>
  );
}
