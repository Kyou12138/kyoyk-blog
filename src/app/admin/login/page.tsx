import type { Metadata } from "next";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "登录", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="section">
      <div className="narrow" style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: "1.5rem" }}>登录</h1>
        <p className="muted">只有作者能进来。</p>
        <form action={loginAction} className="panel" style={{ marginTop: "1.2rem" }}>
          <div className="field">
            <label htmlFor="password">密码</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && <p className="error">密码不正确。</p>}
          <button className="button" type="submit">
            进入后台
          </button>
        </form>
      </div>
    </main>
  );
}
