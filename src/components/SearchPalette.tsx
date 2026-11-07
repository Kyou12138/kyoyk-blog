"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type IndexItem = { title: string; href: string; tags: string[]; excerpt: string };

const highlight = (text: string, keyword: string) => {
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

/** 全局搜索浮层：Ctrl/Cmd+K 唤起，索引首次打开时才拉。 */
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
          <span aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="搜索笔记标题、标签或摘要…"
            aria-label="搜索关键词"
          />
          <kbd>Esc</kbd>
        </div>

        <ul className="palette__list">
          {items === null && <li className="palette__empty">正在加载索引…</li>}
          {items !== null && results.length === 0 && (
            <li className="palette__empty">没有匹配的笔记</li>
          )}
          {results.map((item, index) => (
            <li key={item.href}>
              <button
                type="button"
                className={index === active ? "palette__item is-active" : "palette__item"}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
              >
                <span className="palette__title">{highlight(item.title, query.trim())}</span>
                <span className="palette__excerpt">{highlight(item.excerpt, query.trim())}</span>
                {item.tags.length > 0 && (
                  <span className="palette__tags">{item.tags.join(" · ")}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="palette__foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 选择
          </span>
          <span>
            <kbd>↵</kbd> 打开
          </span>
          <span>
            <kbd>Ctrl</kbd> <kbd>K</kbd> 开关
          </span>
        </div>
      </div>
    </div>
  );
}
