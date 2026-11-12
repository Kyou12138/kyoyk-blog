"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROBE_METRICS, PROBE_PERIODS, type ProbeHistory, type ProbeMetric, type ProbePeriod, type ProbeServer, type ProbeSnapshot } from "@/lib/probeTypes";

const bytes = (value: number | null): string => {
  if (value === null) return "—";
  const unit = Math.min(4, Math.floor(Math.log2(Math.max(1, value)) / 10));
  return `${(value / 1024 ** unit).toFixed(unit ? 1 : 0)} ${["B", "KiB", "MiB", "GiB", "TiB"][unit]}`;
};
const ratio = (used: number | null, total: number | null) => used !== null && total ? Math.max(0, Math.min(100, used / total * 100)) : null;
const time = (value: number) => new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
const duration = (value: number | null) => value === null ? "—" : `${Math.floor(value / 86400)} 天 ${Math.floor(value % 86400 / 3600)} 小时`;

// Two consumers, two cadences: current values every 5s; persistent history every 60s.
function usePolling<T>(url: string | null, interval: number, initial: T | null = null) {
  const [result, setResult] = useState<{ url: string | null; data: T | null; error: string; expired: boolean }>({ url, data: initial, error: "", expired: false });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!url) return;
    let stopped = false, timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function poll() {
      let expired = false;
      if (!document.hidden) {
        try {
          const res = await fetch(url!, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
          if (res.status === 401) {
            expired = true;
            if (!stopped) setResult({ url, data: null, error: "登录已过期", expired: true });
            return;
          }
          if (!res.ok) throw new Error("暂时无法获取监控数据，请稍后重试");
          const data = await res.json() as T;
          if (!stopped) setResult({ url, data, error: "", expired: false });
        } catch {
          if (!stopped) setResult((prev) => ({ url, data: prev.url === url ? prev.data : null, error: "暂时无法获取监控数据，请稍后重试", expired: false }));
        } finally {
          if (!stopped && !expired) timer = setTimeout(poll, interval);
        }
      } else if (!stopped) timer = setTimeout(poll, interval);
    }
    void poll();
    return () => { stopped = true; clearTimeout(timer); controller.abort(); };
  }, [url, interval, refresh]);
  return { ...(result.url === url ? result : { data: null, error: "", expired: false }), refresh: () => setRefresh((value) => value + 1) };
}

function Meter({ value }: { value: number | null }) {
  return <div className="probe__meter" aria-hidden="true"><span style={{ width: `${value ?? 0}%` }} className={value !== null && value > 85 ? "is-hot" : undefined} /></div>;
}

function ServerCard({ server, stale }: { server: ProbeServer; stale: boolean }) {
  const { memory, disk, swap, network } = server;
  const mem = ratio(memory.used, memory.total), storage = ratio(disk.used, disk.total);
  return (
    <section className="probe__server" aria-labelledby={`server-${server.id}`}>
      <header className="probe__server-head">
        <div>
          <h2 id={`server-${server.id}`}>{server.name}</h2>
          <p className="probe__meta">{server.platform || "等待主机信息"}</p>
          <p className="probe__meta">{server.cpuModel}</p>
        </div>
        <span className={`probe__state ${stale ? "is-unknown" : server.online ? "is-online" : "is-offline"}`}>
          <i aria-hidden="true" />{stale ? "状态未知" : server.online ? "在线" : "离线"}
        </span>
      </header>
      {!server.online || stale ? <p className="probe__warning">以下为最后收到的读数。最近上报：{server.lastActive ? time(server.lastActive) : "暂无上报"}。</p> : null}
      <div className="probe__grid">
        <div><h3>CPU</h3><p className="probe__value">{server.cpu === null ? "—" : `${server.cpu.toFixed(1)}%`}</p><Meter value={server.cpu} /><small>负载 {server.load.map((value) => value?.toFixed(2) ?? "—").join(" / ")}</small></div>
        <div><h3>内存</h3><p className="probe__value">{bytes(memory.used)}<span> / {bytes(memory.total)}</span></p><Meter value={mem} /><small>{mem === null ? "等待采样" : `占用 ${mem.toFixed(1)}%`}</small></div>
        <div><h3>磁盘</h3><p className="probe__value">{bytes(disk.used)}<span> / {bytes(disk.total)}</span></p><Meter value={storage} /><small>{storage === null ? "等待采样" : `占用 ${storage.toFixed(1)}%`}</small></div>
        <div><h3>网络速度</h3><p className="probe__value">↓ {bytes(network.inSpeed)}/s</p><small>↑ {bytes(network.outSpeed)}/s</small><small>累计接收 {bytes(network.inTotal)} · 发送 {bytes(network.outTotal)}</small></div>
        <div><h3>Swap</h3><p className="probe__value">{swap.total === 0 ? "未启用" : bytes(swap.used)}{swap.total ? <span> / {bytes(swap.total)}</span> : null}</p><Meter value={ratio(swap.used, swap.total)} />{swap.used === null ? <small>探针尚未返回当前用量</small> : null}</div>
        <div><h3>运行时长</h3><p className="probe__value">{duration(server.uptime)}</p><small>最近上报 {server.lastActive ? time(server.lastActive) : "—"}</small></div>
      </div>
    </section>
  );
}

function HistoryChart({ history, capacity }: { history: ProbeHistory; capacity: number | null }) {
  const [index, setIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    observer.observe(svg);
    return () => observer.disconnect();
  }, [history.points.length > 0]);
  const { points, metric, start, end } = history;
  const percentUnit = metric === "cpu";
  const format = (value: number) => percentUnit ? `${value.toFixed(1)}%` : metric === "load1" ? value.toFixed(2) : `${bytes(value)}${metric.endsWith("speed") ? "/s" : ""}`;
  const max = percentUnit ? 100 : Math.max(capacity ?? 0, ...points.map((p) => p.value), 1);
  const x = (ts: number) => 44 + Math.max(0, Math.min(1, (ts - start) / (end - start))) * (width - 64);
  const y = (value: number) => 184 - Math.min(1, value / max) * 168;
  const gap = ({ "1d": 30, "7d": 1800, "30d": 7200 }[history.period]) * 2500;
  const path = points.map((p, i) => `${i === 0 || p.ts - points[i - 1].ts > gap ? "M" : "L"}${x(p.ts).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const chosen = points[Math.min(index ?? points.length - 1, points.length - 1)];
  if (!points.length) return <p className="empty">这个时段还没有采样数据。历史从探针接入后开始累积。</p>;
  return (
    <figure className="probe__chart">
      <div className="probe__chart-value" aria-live="off"><strong>{chosen ? format(chosen.value) : "—"}</strong><span>{chosen ? time(chosen.ts) : ""}</span></div>
      <svg ref={svgRef} viewBox={`0 0 ${width} 208`} role="img" aria-label={`${PROBE_METRICS[metric]}，最近 ${PROBE_PERIODS[history.period]}，${points.length} 个采样点`}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const ts = start + ((event.clientX - box.left) / box.width * width - 44) / (width - 64) * (end - start);
          let nearest = 0;
          for (let i = 1; i < points.length; i++) if (Math.abs(points[i].ts - ts) < Math.abs(points[nearest].ts - ts)) nearest = i;
          setIndex(nearest);
        }} onPointerLeave={() => setIndex(null)}>
        {[0, 0.5, 1].map((part) => <g key={part}><line x1="44" x2={width - 20} y1={y(max * part)} y2={y(max * part)} className="probe__chart-grid" /><text x="44" y={Math.max(12, y(max * part) - 6)}>{format(max * part)}</text></g>)}
        <path d={path} fill="none" stroke="var(--cyan)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {chosen ? <g><line x1={x(chosen.ts)} x2={x(chosen.ts)} y1="16" y2="184" className="probe__chart-cursor" /><circle cx={x(chosen.ts)} cy={y(chosen.value)} r="4" fill="var(--cyan)" /></g> : null}
      </svg>
      <div className="probe__chart-times"><span>{time(start)}</span><span>{time(end)}</span></div>
      <label className="probe__range">查看历史采样
        <input type="range" min="0" max={points.length - 1} value={Math.min(index ?? points.length - 1, points.length - 1)} onChange={(event) => setIndex(Number(event.target.value))} aria-valuetext={chosen ? `${time(chosen.ts)}，${format(chosen.value)}` : "暂无数据"} />
      </label>
      <figcaption>{points.length} 个采样点 · 时间为北京时间 · 空白表示该时段没有采样</figcaption>
    </figure>
  );
}

export default function StatusProbe({ initial }: { initial: ProbeSnapshot | null }) {
  const current = usePolling<ProbeSnapshot>("/api/admin/status", 5000, initial);
  const [serverId, setServerId] = useState<number | null>(null);
  const [metric, setMetric] = useState<ProbeMetric>("cpu");
  const [period, setPeriod] = useState<ProbePeriod>("1d");
  const servers = current.data?.servers ?? [];
  const selected = servers.find((server) => server.id === serverId) ?? servers[0];
  const history = usePolling<ProbeHistory>(selected && !current.expired ? `/api/admin/status?server=${selected.id}&metric=${metric}&period=${period}` : null, 60_000);
  const stale = Boolean(current.error);
  const capacity = metric === "memory" ? selected?.memory.total : metric === "disk" ? selected?.disk.total : metric === "swap" ? selected?.swap.total : null;
  if (current.expired || history.expired) return <p role="alert">登录已过期，<Link href="/admin/login">重新登录</Link>后查看。</p>;
  return (
    <div className="probe">
      <div className="probe__bar">
        <span>{stale ? "状态未知" : `${servers.filter((server) => server.online).length} / ${servers.length} 台在线`}</span>
        <span className="probe__meta">{current.data ? `更新于 ${time(current.data.at)}` : "等待连接"} · 每 5 秒刷新</span>
        <button className="button button--ghost" onClick={() => { current.refresh(); history.refresh(); }}>立即刷新</button>
      </div>
      {current.error ? <p role="alert" className="probe__warning">{current.error}。保留上次读数。</p> : null}
      {!current.data && !current.error ? <p role="status" className="muted">正在连接探针…</p> : null}
      {current.data && !servers.length ? <p className="empty">尚未接入服务器。</p> : null}
      {servers.map((server) => <ServerCard key={server.id} server={server} stale={stale} />)}
      {selected ? <section className="probe__history" aria-labelledby="history-heading">
        <header className="probe__server-head"><div><h2 id="history-heading">资源历史</h2><p className="probe__meta">采样持续保存 90 天，页面刷新后仍可查看。当前可查询最近 30 天。</p></div></header>
        <div className="probe__filters">
          <label>服务器<select value={selected.id} onChange={(event) => setServerId(Number(event.target.value))}>{servers.map((server) => <option key={server.id} value={server.id}>{server.name}</option>)}</select></label>
          <label>指标<select value={metric} onChange={(event) => setMetric(event.target.value as ProbeMetric)}>{Object.entries(PROBE_METRICS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>时间范围<select value={period} onChange={(event) => setPeriod(event.target.value as ProbePeriod)}>{Object.entries(PROBE_PERIODS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        {history.error ? <p role="alert" className="probe__warning">历史查询暂时不可用，请重试。</p> : history.data ? <HistoryChart key={`${selected.id}-${metric}-${period}`} history={history.data} capacity={capacity ?? null} /> : <p role="status" className="empty">正在加载历史…</p>}
      </section> : null}
    </div>
  );
}
