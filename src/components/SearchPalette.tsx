"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type IndexItem = {
  title: string;
  href: string;
  tags: string[];
  excerpt: string;
  date: string | null;
};

const highlight = (text: string, keyword: string): React.ReactNode => {
  if (!keyword) return text;
  const at = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + keyword.length)}</mark>
      {text.slice(at + keyword.length)}
    </>
  );
};

/** 全局检索面板：Ctrl/Cmd+K 唤起，索引首次打开时按需加载。 */
export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IndexItem[] | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || items) return;
    fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: IndexItem[]) => setItems(data))
      .catch(() => setItems([]));
  }, [open, items]);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!items) return [];
    if (!keyword) return items.slice(0, 8);
    const scored = items
      .map((item) => {
        const title = item.title.toLowerCase();
        const tags = item.tags.join(" ").toLowerCase();
        const body = item.excerpt.toLowerCase();
        const score = title.includes(keyword) ? 3 : tags.includes(keyword) ? 2 : body.includes(keyword) ? 1 : 0;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((entry) => entry.item);
  }, [items, query]);

  const go = (item: IndexItem) => {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (results.length ? (value + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (results.length ? (value - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  };

  if (!open) return null;

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="搜索笔记">
      <div className="palette__backdrop" onClick={() => setOpen(false)} />
      <div className="palette__panel">
        <div className="palette__field">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="palette__icon"
          >
            <circle cx="11" cy="11" r="7.5" />
            <path d="M20 20l-3.8-3.8" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="检索笔记标题、标签或正文…"
            aria-label="搜索关键词"
          />
          <button type="button" className="palette__esc" onClick={() => setOpen(false)}>
            ESC
          </button>
        </div>

        <ul className="palette__list">
          {items === null && <li className="palette__empty">索引加载中…</li>}
          {items !== null && results.length === 0 && (
            <li className="palette__empty">无匹配笔记</li>
          )}
          {results.map((item, index) => (
            <li key={item.href}>
              <button
                type="button"
                className={index === active ? "palette__item is-active" : "palette__item"}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
              >
                <span className="palette__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="palette__body">
                  <span className="palette__title">{highlight(item.title, query.trim())}</span>
                  {item.excerpt && (
                    <span className="palette__excerpt">{highlight(item.excerpt, query.trim())}</span>
                  )}
                </span>
                {item.tags.length > 0 && (
                  <span className="palette__tags">{item.tags.slice(0, 2).join(" / ")}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="palette__foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
          </span>
          <span>
            <kbd>↵</kbd>
          </span>
          <span>
            <kbd>ESC</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
