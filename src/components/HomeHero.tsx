"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import KnowledgeGraph, { type GraphPost } from "@/components/KnowledgeGraph";
import styles from "@/components/home-hero.module.css";

const cx = (...names: Array<string | false | undefined>): string => names.filter(Boolean).join(" ");

const frames = [
  { lead: "TALK", tail: "CODE" },
  { lead: "CODE", tail: "PROMPT" },
] as const;

export default function HomeHero({ posts, tagCount }: { posts: GraphPost[]; tagCount: number }) {
  const [frame, setFrame] = useState(0);
  const [tearing, setTearing] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const cycle = () => {
      setTearing(true);
      timers.push(window.setTimeout(() => setFrame((f) => 1 - f), 120));
      timers.push(window.setTimeout(() => setTearing(false), 860));
    };
    const id = window.setInterval(cycle, 6000);
    return () => {
      window.clearInterval(id);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const { lead, tail } = frames[frame];

  return (
    <header className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.slogan}>
          <span className={cx(styles.word, tearing && styles.tearing)} data-word={lead}>
            {lead}
          </span>{" "}
          is cheap, show me your{" "}
          <span className={cx(styles.word, tearing && styles.tearing)} data-word={tail}>
            {tail}
          </span>
        </p>
        <h1 className={styles.title}>Kyou 的博客</h1>
        <p className={styles.lede}>
          前端、后端与 AI 工具的工程实践。这是站内全部 {posts.length} 篇笔记与 {tagCount} 个主题的拓扑图谱：探索关联网络，点击直接阅读。
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/blog">
            浏览知识库 ➔
          </Link>
          <Link className={styles.secondary} href="/proj">
            开源工具箱 ➔
          </Link>
        </div>
      </div>
      <div className={styles.graph}>
        <KnowledgeGraph posts={posts} />
      </div>
    </header>
  );
}
