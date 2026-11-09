import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 · 页面未找到",
  description: "你访问的页面不存在或已被移除。",
};

export default function NotFound() {
  return (
    <main className="container not-found">
      <div className="not-found__card">
        <div className="not-found__meta">
          <span className="not-found__dot" aria-hidden="true" />
          <span className="not-found__tag">404 // VOID ARCHIVE</span>
        </div>
        <div className="not-found__glitch" aria-hidden="true">
          404
        </div>
        <h1 className="not-found__title">页面未找到</h1>
        <p className="not-found__desc">
          你访问的地址不存在、已被移动，或处于未解析的边界状态。
        </p>
        <div className="not-found__actions">
          <Link href="/" className="button button--primary">
            返回首页
          </Link>
          <Link href="/blog" className="button button--ghost">
            查阅技术笔记
          </Link>
        </div>
      </div>
    </main>
  );
}
