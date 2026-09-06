// DNS over HTTPS. Two public resolvers, tried in order, so one outage does not take the
// tool down. The same JSON API shape from both.
import { v6Expand } from "./ipmath.js";

const RESOLVERS = [
  { name: "cloudflare", url: (n, t) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(n)}&type=${t}` },
  { name: "google", url: (n, t) => `https://dns.google/resolve?name=${encodeURIComponent(n)}&type=${t}` },
];

const TYPE_NAMES = { 1: "A", 2: "NS", 5: "CNAME", 6: "SOA", 12: "PTR", 15: "MX", 16: "TXT", 28: "AAAA", 33: "SRV", 257: "CAA" };
const STATUS = { 0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN", 5: "REFUSED" };
export const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "CAA", "SOA", "PTR", "SRV"];

// Underscores allowed: _dmarc, _acme-challenge and SRV names are everyday lookups.
const NAME_RE = /^(?=.{1,253}$)(?:[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.)*[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.?$/i;

const unquote = (s) => String(s).replace(/^"(.*)"$/s, "$1").replace(/"\s*"/g, "");

export async function dohQuery(name, type, timeoutMs = 5000) {
  let lastErr;
  for (const r of RESOLVERS) {
    try {
      const res = await fetch(r.url(name, type), { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw new Error(`${r.name} answered HTTP ${res.status}`);
      const d = await res.json();
      return {
        status: d.Status, status_text: STATUS[d.Status] || String(d.Status), resolver: r.name,
        answers: (d.Answer || []).map((a) => ({
          name: String(a.name || "").replace(/\.$/, ""), type: TYPE_NAMES[a.type] || String(a.type), ttl: a.TTL,
          data: a.type === 16 ? unquote(a.data) : String(a.data).replace(/\.$/, ""),
        })),
      };
    } catch (e) { lastErr = e; }
  }
  throw new Error(`no DNS-over-HTTPS resolver answered (${lastErr?.message || "unknown"})`);
}

export async function dnsLookup(name, type = "A") {
  const n = String(name || "").trim().replace(/\.$/, "");
  const t = String(type || "A").trim().toUpperCase();
  if (!NAME_RE.test(n)) return { error: `"${n}" is not a valid DNS name.` };
  if (!RECORD_TYPES.includes(t)) return { error: `Record type must be one of ${RECORD_TYPES.join(", ")}.` };
  try {
    const r = await dohQuery(n, t);
    return { name: n, type: t, ...r };
  } catch (e) { return { error: e.message }; }
}

export function renderDns(r) {
  if (r.error) return r.error;
  if (!r.answers.length) {
    const why = r.status === 3 ? "the name does not exist (NXDOMAIN)" : r.status === 0 ? `the name exists but has no ${r.type} record` : `resolver status ${r.status_text}`;
    return `No ${r.type} records for ${r.name} — ${why}. (via ${r.resolver})`;
  }
  const w = Math.max(...r.answers.map((a) => a.name.length));
  const rows = r.answers.map((a) => `  ${a.name.padEnd(w)}  ${String(a.ttl).padStart(6)}s  ${a.type.padEnd(5)} ${a.data}`);
  return `${r.answers.length} ${r.type} record${r.answers.length === 1 ? "" : "s"} for ${r.name} (via ${r.resolver}):\n\n${rows.join("\n")}`;
}

// --- reverse DNS ---------------------------------------------------------------------------

export function reverseName(ip) {
  const s = String(ip || "").trim();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(s)) {
    const oct = s.split(".").map(Number);
    if (oct.some((o) => o > 255)) return null;
    return oct.reverse().join(".") + ".in-addr.arpa";
  }
  const g = v6Expand(s);
  if (!g) return null;
  return g.join("").split("").reverse().join(".") + ".ip6.arpa";
}

export async function reverseDns(ip) {
  const arpa = reverseName(ip);
  if (!arpa) return { error: `"${String(ip || "").trim()}" is not a valid IPv4 or IPv6 address.` };
  try {
    const r = await dohQuery(arpa, "PTR");
    return { ip: String(ip).trim(), arpa, ptr: r.answers.filter((a) => a.type === "PTR").map((a) => a.data), status: r.status, resolver: r.resolver };
  } catch (e) { return { error: e.message }; }
}

export function renderReverse(r) {
  if (r.error) return r.error;
  if (!r.ptr.length) return `No PTR record for ${r.ip} (${r.arpa}) — the address has no reverse DNS. Mail servers and some ACLs treat that as a red flag.`;
  return `${r.ip} → ${r.ptr.join(", ")}\n  (${r.arpa}, via ${r.resolver})`;
}

// --- DNSBL / blocklist check ---------------------------------------------------------------

export const DNSBLS = ["zen.spamhaus.org", "bl.spamcop.net", "dnsbl.sorbs.net", "b.barracudacentral.org", "all.s5h.net"];

export async function dnsblCheck(ip) {
  const s = String(ip || "").trim();
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(s) || s.split(".").some((o) => Number(o) > 255)) {
    return { error: s.includes(":") ? "The common blocklists are IPv4-only; give an IPv4 address." : `"${s}" is not a valid IPv4 address.` };
  }
  const rev = s.split(".").reverse().join(".");
  const results = await Promise.all(DNSBLS.map(async (bl) => {
    try {
      const r = await dohQuery(`${rev}.${bl}`, "A", 4000);
      const codes = r.answers.filter((a) => a.type === "A").map((a) => a.data);
      // Spamhaus and Barracuda refuse queries that arrive via public resolvers and answer with a
      // 127.255.255.x code — that is "not allowed to ask", not "clean".
      if (codes.some((c) => c.startsWith("127.255.255."))) return { bl, status: "n/a", note: "list refuses public-resolver queries" };
      if (codes.length) return { bl, status: "listed", codes };
      return { bl, status: "clean" };
    } catch { return { bl, status: "n/a", note: "no answer" }; }
  }));
  return { ip: s, results, listed: results.filter((r) => r.status === "listed").map((r) => r.bl), unknown: results.filter((r) => r.status === "n/a").map((r) => r.bl) };
}

export function renderDnsbl(r) {
  if (r.error) return r.error;
  const w = Math.max(...r.results.map((x) => x.bl.length));
  const rows = r.results.map((x) => `  ${x.bl.padEnd(w)}  ${x.status.toUpperCase().padEnd(6)}${x.codes ? "  " + x.codes.join(", ") : x.note ? "  (" + x.note + ")" : ""}`);
  const head = r.listed.length
    ? `${r.ip} is LISTED on ${r.listed.length} of ${r.results.length} blocklists.`
    : `${r.ip} is not listed on any blocklist that answered.`;
  const tail = r.unknown.length
    ? `\n\n"n/a" means the list would not answer a public resolver — it is not a clean result. For a definitive answer on those, query them from a mail server's own resolver.`
    : "";
  return `${head}\n\n${rows.join("\n")}${tail}`;
}
