export const PROBE_METRICS = {
  cpu: "CPU 使用率",
  memory: "内存使用量",
  disk: "磁盘使用量",
  swap: "Swap 使用量",
  net_in_speed: "下载速度",
  net_out_speed: "上传速度",
  load1: "1 分钟负载",
} as const;
export const PROBE_PERIODS = { "1d": "24 小时", "7d": "7 天", "30d": "30 天" } as const;
export type ProbeMetric = keyof typeof PROBE_METRICS;
export type ProbePeriod = keyof typeof PROBE_PERIODS;

type Capacity = { used: number | null; total: number | null };
export type ProbeServer = {
  id: number;
  name: string;
  online: boolean;
  lastActive: number | null;
  platform: string;
  cpuModel: string;
  cpu: number | null;
  memory: Capacity;
  disk: Capacity;
  swap: Capacity;
  network: { inSpeed: number | null; outSpeed: number | null; inTotal: number | null; outTotal: number | null };
  load: (number | null)[];
  uptime: number | null;
};
export type ProbeSnapshot = { at: number; servers: ProbeServer[] };
export type ProbeHistory = {
  serverId: number;
  metric: ProbeMetric;
  period: ProbePeriod;
  start: number;
  end: number;
  points: { ts: number; value: number }[];
};
export type ProbeSummary = { at: number; total: number; online: number; offline: number };
