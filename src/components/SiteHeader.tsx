"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE_NAME } from "@/lib/site";

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.svg" alt="logo" width="32" height="32" className="brand__logo" />
          <span className="brand__title">
            {SITE_NAME.split(" ")[0]} <span>{SITE_NAME.split(" ")[1] ?? ""}</span>
          </span>
        </Link>
        <nav className="nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "is-active" : undefined}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__right">
          <a
            className="nav-link nav-link--ext"
            href="https://github.com/Kyou12138"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
