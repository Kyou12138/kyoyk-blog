import Link from "next/link";
import { SITE_AUTHOR } from "@/lib/site";

export default function SiteFooter({ ink }: { ink: boolean }) {
  if (ink) return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span>
          © {new Date().getFullYear()} {SITE_AUTHOR}
        </span>
        <span>
          <Link href="/rss.xml">RSS</Link> · <Link href="/colophon">技术栈</Link> · <Link href="/status">服务器状态</Link> ·{" "}
          <a href="https://github.com/Kyou12138/kyoyk-blog" target="_blank" rel="noreferrer">
            源码
          </a>
        </span>
      </div>
    </footer>
  );
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__mark">{SITE_AUTHOR.toUpperCase()}</span>
          <span className="site-footer__copy">© {new Date().getFullYear()}</span>
        </div>
        <nav className="site-footer__links" aria-label="页脚链接">
          <Link href="/rss.xml">RSS</Link>
          <Link href="/colophon">Colophon</Link>
          <Link href="/status">服务器状态</Link>
          <a href="https://github.com/Kyou12138/kyoyk-blog" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
