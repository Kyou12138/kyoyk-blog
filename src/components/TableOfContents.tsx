"use client";

import { useEffect, useRef, useState } from "react";
import type { HeadingItem } from "@/lib/markdown";

type Props = {
  headings: HeadingItem[];
};

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const findActive = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(".prose h2, .prose h3"),
      );
      if (elements.length === 0) return;

      const topOffset = 130; // 顶部导航与边距的基准线
      let current = elements[0].id;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= topOffset) {
          current = el.id;
        } else {
          break;
        }
      }

      setActiveId(current);
    };

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(findActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    findActive();

    // 窄屏目录点击后自动收起 details，避免挡住正文阅读
    const mobileDetails = document.querySelector<HTMLDetailsElement>(".toc-mobile");
    const onMobileClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "A" && mobileDetails) {
        mobileDetails.open = false;
      }
    };
    mobileDetails?.addEventListener("click", onMobileClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      mobileDetails?.removeEventListener("click", onMobileClick);
    };
  }, [headings]);

  // 当高亮小节变化时，让大纲容器自动滚动跟随（针对超长大纲）
  useEffect(() => {
    if (!activeId || !tocRef.current) return;
    const activeEl = tocRef.current.querySelector<HTMLElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    // 同时给移动端目录里的对应 a 标上 is-active
    const mobileLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-mobile .toc__item a");
    mobileLinks.forEach((a) => {
      const targetId = a.getAttribute("href")?.slice(1);
      if (targetId === activeId) {
        a.classList.add("is-active");
      } else {
        a.classList.remove("is-active");
      }
    });
  }, [activeId]);

  if (headings.length <= 1) return null;

  return (
    <nav ref={tocRef} className="toc" aria-label="文章目录">
      <p className="toc__title">目录</p>
      <ol className="toc__list">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li
              key={heading.id}
              className={`toc__item toc__item--h${heading.level}${isActive ? " is-active" : ""}`}
            >
              <a
                href={`#${heading.id}`}
                className={isActive ? "is-active" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  const target = document.getElementById(heading.id);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                    history.pushState(null, "", `#${heading.id}`);
                    setActiveId(heading.id);
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
