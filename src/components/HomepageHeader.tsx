import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import HeroCanvasBackground from "./HeroCanvasBackground";
import styles from "../pages/index.module.css";

const headlineFrames = [
  {
    lead: "TALK",
    tail: "CODE",
  },
  {
    lead: "CODE",
    tail: "PROMPT",
  },
] as const;

const POST_BOOT_TEAR_DELAY_MS = 2000;
const WORD_FLIP_DURATION_MS = 110;
const WORD_TEAR_DURATION_MS = 860;

const heroFlow = [
  { code: "01", title: "拆解目标", text: "先定义范围与约束，减少返工。" },
  { code: "02", title: "快速试验", text: "以小步迭代验证交互与性能。" },
  { code: "03", title: "沉淀复用", text: "把经验沉淀成文档和工具。" },
] as const;

export default function HomepageHeader(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [frameIndex, setFrameIndex] = useState(0);
  const [tearActive, setTearActive] = useState(false);
  const activeFrame = headlineFrames[frameIndex];

  useEffect(() => {
    // 强制重置初始态，避免开发热更新保留上次状态
    setFrameIndex(0);
    setTearActive(false);

    let preTearTimer: number | undefined;
    let flipTimer: number | undefined;
    let endTimer: number | undefined;
    let lockFallbackTimer: number | undefined;
    let bootObserver: MutationObserver | null = null;
    let cancelled = false;
    let sequenceStarted = false;

    const runTearSequence = () => {
      if (cancelled || sequenceStarted) {
        return;
      }
      sequenceStarted = true;
      if (typeof lockFallbackTimer !== "undefined") {
        window.clearTimeout(lockFallbackTimer);
      }

      // 每次撕裂前回到初始词组，保证“切换 + 撕裂”可见
      setFrameIndex(0);

      preTearTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        setTearActive(true);

        flipTimer = window.setTimeout(() => {
          setFrameIndex(1);
        }, WORD_FLIP_DURATION_MS);

        endTimer = window.setTimeout(() => {
          setTearActive(false);
        }, WORD_TEAR_DURATION_MS);
      }, POST_BOOT_TEAR_DELAY_MS);
    };

    const isBootLocked = () =>
      document.documentElement.classList.contains("ky-boot-lock") ||
      document.body.classList.contains("ky-boot-lock");

    if (!isBootLocked()) {
      runTearSequence();
    } else {
      bootObserver = new MutationObserver(() => {
        if (cancelled) {
          return;
        }
        if (!isBootLocked()) {
          bootObserver?.disconnect();
          bootObserver = null;
          runTearSequence();
        }
      });

      bootObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      bootObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // 兜底：即使锁状态异常未释放，也在超时后触发一次撕裂，避免效果失效
      lockFallbackTimer = window.setTimeout(() => {
        if (cancelled || sequenceStarted) {
          return;
        }
        bootObserver?.disconnect();
        bootObserver = null;
        runTearSequence();
      }, POST_BOOT_TEAR_DELAY_MS + 1400);
    }

    return () => {
      cancelled = true;
      if (bootObserver) {
        bootObserver.disconnect();
      }
      if (typeof preTearTimer !== "undefined") {
        window.clearTimeout(preTearTimer);
      }
      if (typeof flipTimer !== "undefined") {
        window.clearTimeout(flipTimer);
      }
      if (typeof endTimer !== "undefined") {
        window.clearTimeout(endTimer);
      }
      if (typeof lockFallbackTimer !== "undefined") {
        window.clearTimeout(lockFallbackTimer);
      }
    };
  }, []);

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <HeroCanvasBackground className={styles.heroCanvas} />
      <div className={clsx("container", styles.heroInner)}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} aria-hidden="true" />
              KYOU BLOG
            </p>
            <Heading
              as="h1"
              className={clsx("hero__title", styles.heroTitle)}
            >
              <span className={clsx(styles.swapSlot, styles.swapSlotLead)}>
                <span
                  className={clsx(styles.swapWord, tearActive && styles.wordTearing)}
                  data-word={activeFrame.lead}
                >
                  {activeFrame.lead}
                </span>
              </span>
              <span className={styles.heroText}> is cheap, show me </span>
              <span className={styles.heroTailKeep}>
                <span className={styles.heroText}>your </span>
                <span className={clsx(styles.swapSlot, styles.swapSlotTail)}>
                  <span
                    className={clsx(styles.swapWord, tearActive && styles.wordTearing)}
                    data-word={activeFrame.tail}
                  >
                    {activeFrame.tail}
                  </span>
                </span>
              </span>
            </Heading>
            <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
            <div className={styles.heroActions}>
              <Link
                to="/blog"
                className={clsx("button button--primary button--lg", styles.heroAction)}
              >
                开始阅读
              </Link>
              <Link
                to="/proj"
                className={clsx("button button--secondary button--lg", styles.heroActionGhost)}
              >
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
              <span className={clsx(styles.heroOrbDot, styles.heroOrbDotA)} aria-hidden="true" />
              <span className={clsx(styles.heroOrbDot, styles.heroOrbDotB)} aria-hidden="true" />
              <span className={clsx(styles.heroOrbDot, styles.heroOrbDotC)} aria-hidden="true" />
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
