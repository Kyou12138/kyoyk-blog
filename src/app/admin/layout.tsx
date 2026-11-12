import { isAdmin } from "@/lib/session";
import { logoutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();

  return (
    <main className="section">
      <div className="container">
        {authed && (
          <div className="admin-bar">
            <a className="button button--ghost" href="/admin">
              全部笔记
            </a>
            <a className="button button--ghost" href="/admin/posts/new">
              写新笔记
            </a>
            <a className="button button--ghost" href="https://status.kythron.com" target="_blank" rel="noopener">
              服务器监控 ↗
            </a>
            <a className="button button--ghost" href="/">
              看前台
            </a>
            <form action={logoutAction} style={{ marginLeft: "auto" }}>
              <button className="button button--ghost" type="submit">
                退出
              </button>
            </form>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
