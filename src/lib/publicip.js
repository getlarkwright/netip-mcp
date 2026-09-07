// "What does the internet see?" needs an observer outside your network. Cloudflare's trace
// endpoint answers with the address it saw you from plus the edge location; the ASN comes from
// Team Cymru's DNS-based lookup. Nothing here is a private service of ours.
import { dohQuery, reverseDns } from "./dns.js";
import { v6Expand } from "./ipmath.js";

const TRACE = ["https://www.cloudflare.com/cdn-cgi/trace", "https://1.1.1.1/cdn-cgi/trace"];

// Datacenter / VPN hint from the AS organisation name. A heuristic, labelled as one.
export const HOSTING_RE = /(hosting|datacen|data.?cent|colo|cloud|\bvps\b|dedicated|ovh|hetzner|digitalocean|linode|vultr|amazon|aws|google llc|azure|microsoft|oracle|leaseweb|choopa|m247|contabo|scaleway|equinix|quadranet|psychz|zenlayer|gcore|\bvpn\b|proxy|\btor\b)/i;

const nibbles = (ip) => v6Expand(ip).join("").split("").reverse().join(".");

export async function asnLookup(ip) {
  const v6 = ip.includes(":");
  const name = v6 ? `${nibbles(ip)}.origin6.asn.cymru.com` : `${ip.split(".").reverse().join(".")}.origin.asn.cymru.com`;
  const r = await dohQuery(name, "TXT", 6000);
  const txt = r.answers.find((a) => a.type === "TXT")?.data;
  if (!txt) return null;
  const [asns, prefix, cc, registry, allocated] = txt.split("|").map((s) => s.trim());
  const asn = asns.split(/\s+/)[0];
  const out = { asn, prefix, country: cc, registry, allocated, name: null };
  try {
    const r2 = await dohQuery(`AS${asn}.asn.cymru.com`, "TXT", 6000);
    const t2 = r2.answers.find((a) => a.type === "TXT")?.data;
    if (t2) out.name = t2.split("|").pop().trim();
  } catch { /* name is optional */ }
  return out;
}

export async function myPublicIp() {
  let trace = null, lastErr;
  for (const u of TRACE) {
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      trace = Object.fromEntries((await res.text()).trim().split("\n").map((l) => l.split("=", 2)));
      if (trace.ip) break;
    } catch (e) { lastErr = e; }
  }
  if (!trace?.ip) return { error: `Could not reach an outside observer (${lastErr?.message || "no response"}). Check that this machine has internet access.` };

  const ip = trace.ip.trim();
  const [asn, ptr] = await Promise.all([
    asnLookup(ip).catch(() => null),
    reverseDns(ip).then((r) => r.ptr?.[0] || null).catch(() => null),
  ]);
  return {
    ip, version: ip.includes(":") ? 6 : 4, country: trace.loc || null, edge_colo: trace.colo || null,
    asn, reverse_dns: ptr, hosting_hint: asn?.name ? HOSTING_RE.test(asn.name) : null,
    warp: trace.warp === "on", tls: trace.tls || null,
  };
}

export function renderPublicIp(r) {
  if (r.error) return r.error;
  const lines = [
    `Your public IPv${r.version} address is ${r.ip}`,
    ``,
    `  Seen from   Cloudflare edge ${r.edge_colo || "?"}${r.country ? `, country ${r.country}` : ""}`,
    `  Reverse DNS ${r.reverse_dns || "none"}`,
  ];
  if (r.asn) {
    lines.push(`  Network     AS${r.asn.asn}${r.asn.name ? ` — ${r.asn.name}` : ""}`);
    lines.push(`  Prefix      ${r.asn.prefix}${r.asn.registry ? `  (${r.asn.registry}${r.asn.allocated ? `, allocated ${r.asn.allocated}` : ""})` : ""}`);
    lines.push(`  Datacenter  ${r.hosting_hint ? "likely — the AS name reads like hosting, cloud or VPN space" : "unlikely — looks like an access/ISP network"}  (heuristic)`);
  } else {
    lines.push(`  Network     ASN lookup unavailable`);
  }
  if (r.warp) lines.push(``, `Cloudflare WARP is on — this is the WARP egress address, not your ISP's.`);
  lines.push(``, `This is the address as seen from outside your network. Inbound reachability on a port needs a test from outside too.`);
  return lines.join("\n");
}
