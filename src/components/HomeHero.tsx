"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import KnowledgeGraph, { type GraphPost } from "@/components/KnowledgeGraph";
import styles from "@/components/home-hero.module.css";

const WORDS = ["Code.", "Prompt.", "System."] as const;

export default function HomeHero({
  posts,
  tagCount,
  yearSpan,
}: {
  posts: GraphPost[];
  tagCount: number;
  yearSpan: string;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % WORDS.length);
    }, 4600);
    return () => window.clearInterval(timer);
  }, []);

  const currentWord = WORDS[idx];

  return (
    <section className={`container ${styles.heroSection}`} aria-label="首页题头与知识拓扑">
      <div className={styles.datumBar}>
        <span>ARCHIVE · {yearSpan}</span>
        <span>
          {posts.length} 篇 · {tagCount} 标签
        </span>
      </div>

      <div className={styles.hero}>
        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span className={styles.kicker}>Talk is cheap,</span>
            <span className={styles.headline}>show me your</span>
            <button
              type="button"
              className={styles.reelBtn}
              onClick={() => setIdx((prev) => (prev + 1) % WORDS.length)}
              aria-label={`切换关键词，当前：${currentWord}`}
            >
              <span key={currentWord} className={styles.reelWord}>
                {currentWord}
              </span>
              <sup className={styles.reelIndex} aria-hidden="true">
                0{idx + 1}
              </sup>
            </button>
          </h1>

          <div className={styles.actions}>
            <Link className="button button--primary" href="/blog" data-magnetic>
              <span>阅读笔记</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button--ghost" href="/proj" data-magnetic>
              <span>自研工具</span>
            </Link>
          </div>
        </div>

        <div className={styles.graph}>
          <KnowledgeGraph posts={posts} tagCount={tagCount} />
        </div>
      </div>
    </section>
  );
}
