/** node --experimental-strip-types scripts/probe-check.mts [http://localhost:3101]
 * Without a URL: parser and privacy checks. With a URL: unauthorized page/API checks too.
 */
import assert from "node:assert/strict";
import { parseProbeServers, summarizeProbe } from "../src/lib/nezha.ts";

const now = Date.now();
const raw = {
  id: 1, name: "Test host", last_active: new Date(now - 1000).toISOString(),
  uuid: "do-not-expose", geoip: { ip: "192.0.2.1" }, owner: { secret: "hidden" },
  host: { cpu: ["Processor 2 Virtual Core"], mem_total: 2048 },
  state: { cpu: 12, mem_used: 1024 },
};
const servers = parseProbeServers([raw, { ...raw, id: 2, last_active: new Date(now - 60_000).toISOString() }, { id: 3, name: "Waiting" }], now);
assert.equal(servers[0].online, true);
assert.equal(servers[1].online, false);
assert.equal(servers[2].online, false);
assert.equal(servers[2].cpu, null);
assert.equal(servers[0].swap.used, 0, "Nezha omits zero values from HostState after reporting");
assert.equal(servers[2].swap.used, null, "no report must not look like an idle machine");
assert.equal(servers[0].cpuModel, "Processor 2 Virtual Core", "a CPU descriptor is not a core count");
assert.doesNotMatch(JSON.stringify(servers), /192\.0\.2\.1|do-not-expose|hidden|geoip|uuid|owner/);
assert.deepEqual(summarizeProbe({ at: now, servers }), { at: now, total: 3, online: 1, offline: 2 });
assert.deepEqual(summarizeProbe({ at: now, servers: [] }), { at: now, total: 0, online: 0, offline: 0 });
assert.throws(() => parseProbeServers(null, now));
assert.throws(() => parseProbeServers([{}], now));

if (process.argv[2]) {
  const base = process.argv[2];
  for (const path of ["/api/admin/status", "/api/admin/status?server=1&metric=cpu&period=7d"]) {
    const res = await fetch(base + path, { redirect: "manual" });
    assert.equal(res.status, 401);
    assert.match(res.headers.get("cache-control") ?? "", /no-store/);
    assert.doesNotMatch(await res.text(), /nzp_|mem_used|lastActive|serverId/);
  }
  const page = await fetch(base + "/admin/status", { redirect: "manual" });
  assert.equal(page.status, 307);
  assert.match(page.headers.get("location") ?? "", /\/admin\/login/);
  const publicPage = await fetch(base + "/status");
  assert.equal(publicPage.status, 200);
  assert.doesNotMatch(await publicPage.text(), /nzp_|cpuModel|lastActive|mem_used|geoip|192\.0\.2\.1/);
}
console.log("probe-check: passed (online/offline, missing readings, public allowlist, access control)");
