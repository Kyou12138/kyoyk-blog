import ObsidianNotFound from "@/components/obsidian/NotFound";
import { getSkin } from "@/lib/skinPreference";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404",
};

export default async function NotFound() {
  if ((await getSkin()) === "ink") return <ObsidianNotFound />;

  return (
    <main className="container not-found">
      <div className="not-found__grid">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <div className="not-found__body">
          <h1 className="not-found__title">页面不存在</h1>
          <div className="not-found__actions">
            <Link href="/" className="button button--primary" data-magnetic>
              返回首页
            </Link>
            <Link href="/blog" className="button button--ghost">
              浏览笔记
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
