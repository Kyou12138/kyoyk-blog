import type { ProbeHistory, ProbeMetric, ProbePeriod, ProbeServer, ProbeSnapshot, ProbeSummary } from "./probeTypes";

// Server-only credentials: this module is only imported by pages/routes running on the server.
const get = async (path: string): Promise<unknown> => {
  const base = process.env.NEZHA_API_URL?.replace(/\/$/, "");
  const token = process.env.NEZHA_API_TOKEN;
  if (!base || !token) throw new Error("Monitoring unavailable");
  const response = await fetch(`${base}${path}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Monitoring unavailable");
  const body = await response.json();
  if (body?.success !== true) throw new Error("Monitoring unavailable");
  return body.data;
};

const number = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown): string => typeof value === "string" ? value : "";

/** Allowlist fields: never pass Nezha's IP, UUID, owner, notes or credentials to the browser. */
export const parseProbeServers = (value: unknown, now: number): ProbeServer[] => {
  if (!Array.isArray(value)) throw new Error("Invalid monitoring response");
  return value.map((item) => {
    const raw = record(item);
    if (!Number.isSafeInteger(raw.id) || (raw.id as number) <= 0 || typeof raw.name !== "string") {
      throw new Error("Invalid monitoring response");
    }
    const host = record(raw.host), state = record(raw.state);
    const time = Date.parse(text(raw.last_active));
    const lastActive = Number.isFinite(time) && time > 0 ? time : null;
    // Nezha HostState uses Go json omitempty: a missing numeric field after a report is zero.
    const reading = (value: unknown) => number(value === undefined && lastActive !== null ? 0 : value);
    // Nezha defines online as a report received within the last 30 seconds.
    const online = lastActive !== null && now - lastActive >= -5000 && now - lastActive < 30_000;
    return {
      id: raw.id as number,
      name: raw.name,
      online,
      lastActive,
      platform: [text(host.platform), text(host.platform_version), text(host.arch)].filter(Boolean).join(" · "),
      cpuModel: Array.isArray(host.cpu) ? host.cpu.filter((cpu): cpu is string => typeof cpu === "string").join(" / ") : "",
      cpu: reading(state.cpu),
      memory: { used: reading(state.mem_used), total: number(host.mem_total) },
      disk: { used: reading(state.disk_used), total: number(host.disk_total) },
      swap: { used: reading(state.swap_used), total: number(host.swap_total ?? (Object.keys(host).length ? 0 : null)) },
      network: { inSpeed: reading(state.net_in_speed), outSpeed: reading(state.net_out_speed), inTotal: reading(state.net_in_transfer), outTotal: reading(state.net_out_transfer) },
      load: [reading(state.load_1), reading(state.load_5), reading(state.load_15)],
      uptime: reading(state.uptime),
    };
  });
};

export const readProbeSnapshot = async (): Promise<ProbeSnapshot> => {
  const raw = await get("/api/v1/server");
  const at = Date.now();
  return { at, servers: parseProbeServers(raw, at) };
};

export const summarizeProbe = ({ at, servers }: ProbeSnapshot): ProbeSummary => {
  const online = servers.filter((server) => server.online).length;
  return { at, total: servers.length, online, offline: servers.length - online };
};

export const readProbeHistory = async (serverId: number, metric: ProbeMetric, period: ProbePeriod): Promise<ProbeHistory> => {
  const raw = record(await get(`/api/v1/server/${serverId}/metrics?metric=${metric}&period=${period}`));
  if (!Array.isArray(raw.data_points)) throw new Error("Invalid monitoring history");
  const end = Date.now();
  const start = end - ({ "1d": 1, "7d": 7, "30d": 30 }[period] * 86_400_000);
  const points = raw.data_points.map(record)
    .filter((point) => number(point.ts) !== null && number(point.value) !== null && (point.ts as number) >= start && (point.ts as number) <= end)
    .map((point) => ({ ts: point.ts as number, value: point.value as number }))
    .sort((a, b) => a.ts - b.ts);
  return { serverId, metric, period, start, end, points };
};
