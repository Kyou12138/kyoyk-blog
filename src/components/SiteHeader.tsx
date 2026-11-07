import Link from "next/link";
import { NAV, SITE_NAME } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" href="/">
          {SITE_NAME.split(" ")[0]} <span>{SITE_NAME.split(" ")[1] ?? ""}</span>
        </Link>
        <nav className="nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href="https://github.com/Kyou12138" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
