import type { Metadata } from "next";
import Link from "next/link";
import { readProbeSnapshot, summarizeProbe } from "@/lib/nezha";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "服务器状态",
  alternates: { canonical: "/status" },
};

export default async function StatusPage() {
  const summary = await readProbeSnapshot()
    .then(summarizeProbe)
    .catch(() => null);

  const stateClass = !summary
    ? "is-unknown"
    : summary.offline
      ? "is-offline"
      : "is-online";

  const label = !summary
    ? "状态暂不可用"
    : !summary.total
      ? "尚未接入节点"
      : summary.offline
        ? "部分节点离线"
        : "全部节点在线";

  const ratioPct =
    summary && summary.total > 0
      ? Math.round((summary.online / summary.total) * 100)
      : 0;

  return (
    <main className="section">
      <div className="container">
        <header className="editorial-head">
          <h1 className="editorial-head__title">服务器状态</h1>
          <div className="editorial-head__aside">
            <span className={`probe__state ${stateClass}`}>
              <i aria-hidden="true" />
              {label}
            </span>
          </div>
        </header>

        {summary ? (
          <section className="status-board" aria-label="在线节点汇总">
            <div className="status-board__grid">
              <div className="status-board__cell">
                <span className="status-board__label">在线</span>
                <strong className="status-board__num">{summary.online}</strong>
              </div>
              <div className="status-board__cell">
                <span className="status-board__label">离线</span>
                <strong className="status-board__num">{summary.offline}</strong>
              </div>
              <div className="status-board__cell">
                <span className="status-board__label">接入总数</span>
                <strong className="status-board__num">{summary.total}</strong>
              </div>
            </div>

            <div className="status-board__meter" aria-hidden="true">
              <span
                style={{ width: `${ratioPct}%` }}
                className={summary.offline ? "is-warn" : undefined}
              />
            </div>

            <div className="status-board__foot">
              <span className="probe__meta">
                {new Date(summary.at).toLocaleString("zh-CN", {
                  timeZone: "Asia/Shanghai",
                  hour12: false,
                })}
              </span>
              <div className="status-board__actions">
                <a href="/status" className="button button--ghost button--sm">
                  刷新
                </a>
                <Link href="/admin/status" className="editorial-head__link">
                  管理监控 →
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="status-board status-board--empty">
            <p className="muted">探针遥测暂不可达，当前无法判断节点在线状态。</p>
            <div className="status-board__actions">
              <a href="/status" className="button button--ghost button--sm">
                重新检测
              </a>
              <Link href="/admin/status" className="editorial-head__link">
                管理监控 →
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
