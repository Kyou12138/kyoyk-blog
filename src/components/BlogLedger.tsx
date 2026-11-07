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

  // 纯客户端即时无刷新毫秒级检索与多维标签过滤
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

  // 按年份分账
  const groups = useMemo(() => {
    const list: Array<{ year: string; posts: PostSummary[] }> = [];
    for (const post of filteredPosts) {
      const year = post.publishedAt ? dateParts(post.publishedAt).year : "未排期";
      const last = list.at(-1);
      if (last && last.year === year) {
        last.posts.push(post);
      } else {
        list.push({ year, posts: [post] });
      }
    }
    return list;
  }, [filteredPosts]);

  return (
    <div className="blog-ledger">
      {/* 头部自解释元信息 */}
      <div className="ledger-header">
        <div className="ledger-header__meta">
          <span className="ledger-header__dot" />
          <span className="ledger-header__tag">KNOWLEDGE VAULT // SYSTEM LEDGER</span>
          <span className="ledger-header__count">{filteredPosts.length} / {initialPosts.length} 篇</span>
        </div>
        <h1 className="ledger-header__title">技术笔记与系统知识库</h1>
        <p className="ledger-header__desc">
          涵盖全栈底层架构、MCP 协议、LLM 智能体流水线与系统工程实践的系统化思考。
        </p>
      </div>

      {/* 即时搜索工具条与标签流 */}
      <div className="ledger-toolbar">
        <div className="ledger-search">
          <span className="ledger-search__icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="即时过滤笔记标题、描述或标签..."
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
              ✕
            </button>
          )}
        </div>

        <div className="ledger-tags" role="tablist" aria-label="按标签过滤">
          <button
            type="button"
            className={`ledger-tag ${!selectedTag ? "is-active" : ""}`}
            onClick={() => setSelectedTag("")}
          >
            全部 ({initialPosts.length})
          </button>
          {tags.map((t) => (
            <button
              key={t.name}
              type="button"
              className={`ledger-tag ${selectedTag === t.name ? "is-active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === t.name ? "" : t.name)}
            >
              {t.name} <span className="ledger-tag__num">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 结果分年账册流 */}
      {filteredPosts.length === 0 ? (
        <div className="ledger-empty">
          <p className="ledger-empty__text">未找到匹配的笔记内容。</p>
          {(keyword || selectedTag) && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setKeyword("");
                setSelectedTag("");
              }}
            >
              重置全部过滤条件
            </button>
          )}
        </div>
      ) : (
        <div className="ledger-groups">
          {groups.map((group) => (
            <section key={group.year} className="ledger-year-section">
              <div className="ledger-year-sticky">
                <span className="ledger-year-title">{group.year}</span>
                <span className="ledger-year-count">{group.posts.length}</span>
              </div>

              <div className="ledger-stream">
                {group.posts.map((post) => {
                  const href = permalink(post);
                  const parts = post.publishedAt ? dateParts(post.publishedAt) : null;
                  const dateStr = parts ? `${parts.month}.${parts.day}` : "DRAFT";

                  return (
                    <article key={post.id} className="ledger-row">
                      <div className="ledger-row__time">
                        <time dateTime={post.publishedAt ?? undefined}>{dateStr}</time>
                      </div>

                      <div className="ledger-row__main">
                        <h2 className="ledger-row__title">
                          <Link href={href}>{post.title}</Link>
                        </h2>
                        {post.description && post.description !== post.title && (
                          <p className="ledger-row__desc">{post.description}</p>
                        )}
                      </div>

                      <div className="ledger-row__aside">
                        {post.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`ledger-row__tag ${selectedTag === t ? "is-active" : ""}`}
                            onClick={() => setSelectedTag(t)}
                            title={`筛选包含 ${t} 的笔记`}
                          >
                            {t}
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
