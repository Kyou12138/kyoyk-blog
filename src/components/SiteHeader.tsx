"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { SKINS, SKIN_STORAGE_KEY, type SkinId } from "@/lib/skins";

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const nextSkin = (): SkinId => {
  const current = document.documentElement.dataset.skin;
  const idx = SKINS.findIndex((skin) => skin.id === current);
  return SKINS[(idx + 1) % SKINS.length].id;
};

export default function SiteHeader() {
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
  }, []);

  const cycleSkin = () => {
    const skin = nextSkin();
    document.documentElement.dataset.skin = skin;
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
      // ponytail: 无痕模式禁用存储时只当次生效，不值得再兜一层
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Kyou Blog 首页">
          <span className="brand__word">KYOU</span>
          <span className="brand__dot" aria-hidden="true" />
        </Link>

        <nav className="nav" aria-label="主导航">
          {NAV.map((item, idx) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav__idx" aria-hidden="true">
                  0{idx + 1}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="site-header__right">
          <button
            type="button"
            className="skin-toggle"
            onClick={cycleSkin}
            aria-label="切换皮肤"
            title="切换皮肤"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
              <circle
                cx="10"
                cy="10"
                r="7.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M10 2.9a7.1 7.1 0 0 0 0 14.2z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="search-trigger"
            data-magnetic
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            aria-label="搜索笔记"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7.5" />
              <path d="M20 20l-3.8-3.8" />
            </svg>
            <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
