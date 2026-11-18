"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dateParts, permalink } from "@/lib/format";
import type { PostSummary } from "@/lib/posts";

type BlogLedgerProps = {
  initialPosts: PostSummary[];
  tags: Array<{ name: string; count: number }>;
  initialKeyword?: string;
  initialTag?: string;
};

export default function BlogLedger({
  initialPosts,
  tags,
  initialKeyword = "",
  initialTag = "",
}: BlogLedgerProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedTag, setSelectedTag] = useState(initialTag);

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [initialPosts, selectedTag, keyword]);

  const groups = useMemo(() => {
    const list: Array<{ year: string; posts: PostSummary[] }> = [];
    for (const post of filteredPosts) {
      const year = post.publishedAt ? dateParts(post.publishedAt).year : "草稿";
      const last = list.at(-1);
      if (last && last.year === year) {
        last.posts.push(post);
      } else {
        list.push({ year, posts: [post] });
      }
    }
    return list;
  }, [filteredPosts]);

  const countText =
    filteredPosts.length === initialPosts.length
      ? `${initialPosts.length} 篇`
      : `${filteredPosts.length} / ${initialPosts.length} 篇`;

  return (
    <div className="blog-ledger">
      <header className="editorial-head">
        <h1 className="editorial-head__title">笔记</h1>
        <div className="editorial-head__aside">
          <span className="editorial-head__count">{countText}</span>
          <Link href="/blog/tags" className="editorial-head__link">
            标签 ({tags.length}) →
          </Link>
        </div>
      </header>

      <div className="ledger-toolbar">
        <div className="ledger-search">
          <svg
            className="ledger-search__icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7.5" />
            <path d="m20 20-3.8-3.8" />
          </svg>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="检索标题、摘要或标签…"
            className="ledger-search__input"
            aria-label="即时过滤笔记"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="ledger-search__clear"
              aria-label="清空搜索"
            >
              清空
            </button>
          )}
        </div>

        <div className="ledger-tags" role="toolbar" aria-label="按标签筛选">
          <button
            type="button"
            className={`ledger-tag ${!selectedTag ? "is-active" : ""}`}
            aria-pressed={!selectedTag}
            onClick={() => setSelectedTag("")}
          >
            全部 <span className="ledger-tag__num">{initialPosts.length}</span>
          </button>
          {tags.map((t) => {
            const active = selectedTag === t.name;
            return (
              <button
                key={t.name}
                type="button"
                className={`ledger-tag ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => setSelectedTag(active ? "" : t.name)}
              >
                {t.name} <span className="ledger-tag__num">{t.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="ledger-empty">
          <p className="ledger-empty__text">没有匹配的笔记。</p>
          {(keyword || selectedTag) && (
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => {
                setKeyword("");
                setSelectedTag("");
              }}
            >
              重置筛选
            </button>
          )}
        </div>
      ) : (
        <div className="ledger-groups">
          {groups.map((group) => (
            <section key={group.year} className="ledger-year-section">
              <div className="ledger-year-sticky">
                <h2 className="ledger-year-title">{group.year}</h2>
                <span className="ledger-year-count">{group.posts.length}</span>
              </div>

              <div className="ledger-stream">
                {group.posts.map((post) => {
                  const href = permalink(post);
                  const parts = post.publishedAt ? dateParts(post.publishedAt) : null;
                  const dateStr = parts ? `${parts.month}.${parts.day}` : "草稿";

                  return (
                    <article key={post.id} className="ledger-row">
                      <time
                        className="ledger-row__time"
                        dateTime={post.publishedAt ?? undefined}
                      >
                        {dateStr}
                      </time>

                      <div className="ledger-row__main">
                        <h3 className="ledger-row__title">
                          <Link href={href}>{post.title}</Link>
                        </h3>
                      </div>

                      <div className="ledger-row__aside">
                        {post.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`ledger-row__tag ${selectedTag === t ? "is-active" : ""}`}
                            onClick={() => setSelectedTag(selectedTag === t ? "" : t)}
                          >
                            #{t}
                          </button>
                        ))}
                        {post.minutes && (
                          <span className="ledger-row__reading-time">{post.minutes} min</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
