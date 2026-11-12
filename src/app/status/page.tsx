import type { Metadata } from "next";
import Link from "next/link";
import { readProbeSnapshot, summarizeProbe } from "@/lib/nezha";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "服务器状态", alternates: { canonical: "/status" } };
export default async function StatusPage() {
  const summary = await readProbeSnapshot().then(summarizeProbe).catch(() => null);
  const label = !summary ? "暂时无法获取状态" : !summary.total ? "尚未接入服务器" : summary.offline ? "部分服务器离线" : "所有服务器在线";
  return (
    <main className="section">
      <div className="container probe-public">
        <h1>服务器状态</h1>
        <div className={`probe__state ${!summary ? "is-unknown" : summary.offline ? "is-offline" : "is-online"}`}><i aria-hidden="true" />{label}</div>
        {summary ? <><p className="probe-public__count"><strong>{summary.online}</strong> / {summary.total} 台在线</p><p className="muted">{summary.offline} 台离线</p><p className="probe__meta">更新于 {new Date(summary.at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false })}</p></> : <p className="muted">监控数据暂时不可用，请稍后刷新。此时无法判断服务器是否在线。</p>}
        <p className="muted">公开页仅显示在线状态。资源用量与历史曲线需作者登录后查看。</p>
        <div className="probe-public__actions"><Link href="/admin/status" className="button">登录查看资源</Link><a href="/status" className="button button--ghost">刷新状态</a></div>
      </div>
    </main>
  );
}
