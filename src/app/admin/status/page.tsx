import type { Metadata } from "next";
import Link from "next/link";
import StatusProbe from "@/components/StatusProbe";
import { readProbeSnapshot } from "@/lib/nezha";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "服务器监控", robots: { index: false, follow: false } };

export default async function AdminStatusPage() {
  await requireAdmin();
  const snapshot = await readProbeSnapshot().catch(() => null);
  return (
    <div className="probe">
      <header className="section__head">
        <h1 className="probe__title">服务器监控</h1>
        <Link href="/status">公开状态页</Link>
      </header>
      <StatusProbe initial={snapshot} />
    </div>
  );
}
