"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { selectSkin } from "@/app/skin-action";
import { NAV } from "@/lib/site";
import { SKINS, SKIN_STORAGE_KEY, type SkinId } from "@/lib/skins";

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function SiteHeader({ skin }: { skin: SkinId }) {
  const ink = skin === "ink";
  const next = SKINS[(SKINS.findIndex((entry) => entry.id === skin) + 1) % SKINS.length];
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
  }, []);

  const cycleSkin = () => {
    startTransition(async () => {
      setFailed(false);
      try {
        await selectSkin(next.id);
      } catch {
        setFailed(true);
        return;
      }
      try { localStorage.setItem(SKIN_STORAGE_KEY, next.id); } catch { /* Cookie already saved. */ }
    });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Kyou Blog 首页">
          {ink ? <>
            <img src="/img/logo.svg" alt="" width="32" height="32" className="brand__logo" />
            <span className="brand__title">Kyou <span>Blog</span></span>
          </> : <>
            <span className="brand__word">KYOU</span>
            <span className="brand__dot" aria-hidden="true" />
          </>}
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
                {!ink && <span className="nav__idx" aria-hidden="true">
                  0{idx + 1}
                </span>}
                <span>{ink ? item.inkLabel : item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="site-header__right">
          <button
            type="button"
            className="skin-toggle"
            onClick={cycleSkin}
            disabled={pending}
            aria-label={`切换皮肤，当前${SKINS.find((entry) => entry.id === skin)?.label}，切换到${next.label}`}
            title={`切换到${next.label}`}
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
          {failed && <span role="alert">切换失败，请重试。</span>}
          <button
            type="button"
            className="search-trigger"
            data-magnetic
            onClick={() => window.dispatchEvent(new Event("open-search"))}
            aria-label="搜索笔记"
          >
            {ink ? <><span aria-hidden="true">🔍</span><span className="search-trigger__text">搜索</span></> : <svg
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
            </svg>}
            <kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
          </button>
          {ink && <a className="nav-link nav-link--ext" href="https://github.com/Kyou12138" target="_blank" rel="noreferrer">GitHub</a>}
        </div>
      </div>
    </header>
  );
}
