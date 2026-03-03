import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import HeroCanvasBackground from "./HeroCanvasBackground";
import styles from "../pages/index.module.css";

const headlineFrames = [
  {
    lead: "Talk",
    tail: "code",
  },
  {
    lead: "Code",
    tail: "prompt",
  },
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

    const switchTimer = window.setTimeout(() => {
      setTearActive(true);
      const flipTimer = window.setTimeout(() => {
        setFrameIndex(1);
      }, 80);
      const endTimer = window.setTimeout(() => {
        setTearActive(false);
      }, 820);

      return () => {
        window.clearTimeout(flipTimer);
        window.clearTimeout(endTimer);
      };
    }, 1200);

    return () => {
      window.clearTimeout(switchTimer);
    };
  }, []);

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <HeroCanvasBackground className={styles.heroCanvas} />
      <div className={clsx("container", styles.heroInner)}>
        <Heading
          as="h1"
          className={clsx("hero__title", styles.heroTitle)}
        >
          <span className={styles.swapSlot}>
            <span
              className={clsx(styles.swapWord, tearActive && styles.wordTearing)}
              data-word={activeFrame.lead}
            >
              {activeFrame.lead}
            </span>
          </span>
          <span className={styles.heroText}> is cheap, show me your </span>
          <span className={styles.swapSlot}>
            <span
              className={clsx(styles.swapWord, tearActive && styles.wordTearing)}
              data-word={activeFrame.tail}
            >
              {activeFrame.tail}
            </span>
          </span>
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
      </div>
    </header>
  );
}
