import Link from "next/link";
import { SITE_AUTHOR } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span>
          © {new Date().getFullYear()} {SITE_AUTHOR}
        </span>
        <span>
          <Link href="/rss.xml">RSS</Link> · <Link href="/colophon">技术栈</Link> ·{" "}
          <a href="https://github.com/Kyou12138/kyoyk-blog" target="_blank" rel="noreferrer">
            源码
          </a>
        </span>
      </div>
    </footer>
  );
}
