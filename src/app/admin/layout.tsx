import Link from "next/link";
import { isAdmin } from "@/lib/session";
import { logoutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();

  return (
    <main className="section">
      <div className="container">
        {authed && (
          <nav className="admin-bar" aria-label="后台导航">
            <div className="admin-bar__nav">
              <span className="admin-bar__brand">
                <i aria-hidden="true" />
                管理台
              </span>
              <Link className="admin-bar__link" href="/admin">
                全部笔记
              </Link>
              <Link className="admin-bar__link" href="/admin/posts/new">
                写新笔记
              </Link>
              <Link className="admin-bar__link" href="/admin/status">
                服务器监控
              </Link>
            </div>

            <div className="admin-bar__aside">
              <Link className="admin-bar__link" href="/">
                前台 ↗
              </Link>
              <form action={logoutAction}>
                <button className="admin-bar__logout" type="submit">
                  退出
                </button>
              </form>
            </div>
          </nav>
        )}
        {children}
      </div>
    </main>
  );
}
