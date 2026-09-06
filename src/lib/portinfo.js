// The 100 hand-written port pages from whatismynetip.com as a lookup. The short fields ship
// in src/data/ports.js; the long explainer + FAQs load lazily from ports-detail.js only when asked.
import PORTS from "../data/ports.js";

const CATEGORY = {
  infrastructure: "core network infrastructure", web: "web", "remote-access": "remote access", mail: "mail",
  "file-sharing": "file sharing", database: "databases and caches", container: "containers and orchestration",
  vpn: "VPN and tunnels", monitoring: "monitoring and logging", media: "media and voice", "self-hosted": "self-hosted apps",
  gaming: "game servers", iot: "IoT and messaging", printing: "printing",
};
const EXPOSE = {
  normal: "built to face the internet",
  caution: "expose only deliberately, with the controls below",
  never: "do not expose to the internet",
};

export const PORT_COUNT = Object.keys(PORTS).length;

export function lookupPort(port) {
  const n = Number(port);
  if (!Number.isInteger(n) || n < 0 || n > 65535) return { error: `"${port}" is not a port number (0–65535).` };
  const p = PORTS[n];
  if (!p) return { port: n, known: false, range: rangeOf(n) };
  return { port: n, known: true, ...p, category_label: CATEGORY[p.category] || p.category, expose_label: EXPOSE[p.expose] };
}

export async function portDetail(port) {
  const mod = await import("../data/ports-detail.js");
  return mod.default[Number(port)] || null;
}

export function searchPorts(query, limit = 8) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  return Object.entries(PORTS)
    .filter(([, p]) => [p.service, p.name, p.category, ...p.software].some((s) => s.toLowerCase().includes(q)))
    .map(([port, p]) => ({ port: Number(port), service: p.service, name: p.name, expose: p.expose, proto: p.proto }))
    .sort((a, b) => a.port - b.port)
    .slice(0, limit);
}

function rangeOf(n) {
  if (n <= 1023) return "well-known (0–1023): IANA-assigned services, needs root/admin to bind on most systems";
  if (n <= 49151) return "registered (1024–49151): IANA-registered but freely used by applications";
  return "dynamic/ephemeral (49152–65535): client-side source ports and short-lived services";
}

export function renderPort(r, detail) {
  if (r.error) return r.error;
  if (!r.known) {
    return `Port ${r.port} is not one of the ${PORT_COUNT} ports this directory documents.\n  Range: ${r.range}.\n  Try lookup_port with a query (e.g. "redis", "wireguard", "smb") to search by service instead.`;
  }
  const lines = [
    `Port ${r.port}/${r.proto.join("+")} — ${r.service} (${r.name})`,
    ``,
    `  Category   ${r.category_label}`,
    `  Software   ${r.software.join(", ")}`,
    `  Exposure   ${r.expose.toUpperCase()} — ${r.expose_label}`,
    ``,
    r.expose_note,
  ];
  if (r.related?.length) lines.push(``, `  Related ports: ${r.related.join(", ")}`);
  if (r.proto.length === 1 && r.proto[0] === "udp") lines.push(``, `UDP only — a TCP connect test reads "closed" here even when the service is up.`);
  if (detail) {
    lines.push(``, `--- About port ${r.port} ---`, ``, detail.intro, ``, `--- FAQ ---`);
    for (const f of detail.faq) lines.push(``, `Q: ${f.q}`, `A: ${f.a}`);
  }
  return lines.join("\n");
}

export function renderSearch(query, rows) {
  if (!rows.length) return `Nothing in the ${PORT_COUNT}-port directory matches "${query}". Try a service name (ssh, smb, redis) or a category (database, vpn, gaming).`;
  const w = Math.max(...rows.map((r) => r.service.length));
  const body = rows.map((r) => `  ${String(r.port).padStart(5)}/${r.proto.join("+").padEnd(7)} ${r.service.padEnd(w)}  ${r.name}  [${r.expose}]`).join("\n");
  return `${rows.length} port${rows.length === 1 ? "" : "s"} matching "${query}":\n\n${body}\n\nCall lookup_port with the port number for the exposure verdict and details.`;
}
