import { NextRequest, NextResponse } from "next/server";
import { readProbeHistory, readProbeSnapshot } from "@/lib/nezha";
import { PROBE_METRICS, PROBE_PERIODS, type ProbeMetric, type ProbePeriod } from "@/lib/probeTypes";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "请先登录" }, { status: 401, headers });
  const params = request.nextUrl.searchParams;
  const id = params.get("server");
  const metric = params.get("metric");
  const period = params.get("period");
  if (params.size && (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1 || !metric || !Object.hasOwn(PROBE_METRICS, metric) || !period || !Object.hasOwn(PROBE_PERIODS, period))) {
    return NextResponse.json({ error: "查询参数无效" }, { status: 400, headers });
  }
  try {
    const data = id
      ? await readProbeHistory(Number(id), metric as ProbeMetric, period as ProbePeriod)
      : await readProbeSnapshot();
    return NextResponse.json(data, { headers });
  } catch {
    return NextResponse.json({ error: "暂时无法获取监控数据，请稍后重试" }, { status: 503, headers });
  }
}
