// TLS certificate inspection. Resolves the name first, refuses anything that lands in
// private/reserved space, then connects to the validated address with SNI — the same guard
// the whatismynetip.com probe uses, so this cannot be pointed at your own LAN.
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import { v6Expand } from "./ipmath.js";

export function isPublicIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b, c] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;                 // CGNAT
    if (a === 169 && b === 254) return false;                           // link-local
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 168 || b === 0)) return false;              // private, 192.0.0.0/24, 192.0.2.0/24
    if (a === 198 && (b === 18 || b === 19)) return false;              // benchmarking
    if (a === 198 && b === 51 && c === 100) return false;               // documentation
    if (a === 203 && b === 0 && c === 113) return false;                // documentation
    return true;
  }
  if (net.isIPv6(ip)) {
    const g = v6Expand(ip);
    if (!g) return false;
    const h = g.join(""), first = parseInt(g[0], 16);
    if (h === "0".repeat(32) || h === "0".repeat(31) + "1") return false;
    if ((first & 0xfe00) === 0xfc00) return false;                      // fc00::/7 ULA
    if ((first & 0xffc0) === 0xfe80) return false;                      // fe80::/10
    if ((first & 0xff00) === 0xff00) return false;                      // multicast
    if (g[0] === "2001" && g[1] === "0db8") return false;               // documentation
    if (h.startsWith("00000000000000000000ffff")) {                      // ::ffff:a.b.c.d
      const v4 = [g[6].slice(0, 2), g[6].slice(2), g[7].slice(0, 2), g[7].slice(2)].map((x) => parseInt(x, 16)).join(".");
      return isPublicIp(v4);
    }
    return true;
  }
  return false;
}

const HOST_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

// Accept "example.com", "example.com:8443", "https://example.com/path", "[2001:db8::1]:443".
function parseTarget(host, port) {
  let h = String(host || "").trim();
  let p = port;
  const url = h.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)/i);
  if (url) h = url[1];
  const v6 = h.match(/^\[([0-9a-f:]+)\](?::(\d+))?$/i);
  if (v6) { h = v6[1]; if (v6[2] && p === undefined) p = Number(v6[2]); }
  else { const hp = h.match(/^([^:]+):(\d+)$/); if (hp) { h = hp[1]; if (p === undefined) p = Number(hp[2]); } }
  p = p === undefined || p === null || p === "" ? 443 : Number(p);
  return { host: h.replace(/\.$/, ""), port: p };
}

export async function tlsInspect(hostInput, portInput, timeoutMs = 8000) {
  const { host, port } = parseTarget(hostInput, portInput);
  if (!host) return { error: "Give a hostname, e.g. example.com or example.com:8443." };
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { error: `"${portInput}" is not a valid port.` };
  const literal = net.isIP(host) !== 0;
  if (!literal && !HOST_RE.test(host)) return { error: `"${host}" is not a valid hostname.` };

  let addresses;
  try {
    addresses = literal ? [host] : (await dns.lookup(host, { all: true, verbatim: true })).map((a) => a.address);
  } catch (e) { return { error: `DNS resolution failed for ${host} (${e.code || e.message}).` }; }
  if (!addresses.length) return { error: `${host} did not resolve to any address.` };
  const bad = addresses.find((a) => !isPublicIp(a));
  if (bad) return { error: `${host} resolves to ${bad}, which is private or reserved space — refused. This tool only inspects hosts on the public internet.` };

  const ip = addresses[0];
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    const sock = tls.connect({ host: ip, port, servername: literal ? undefined : host, rejectUnauthorized: false, timeout: timeoutMs });
    sock.setTimeout(timeoutMs, () => { sock.destroy(); finish({ error: `Timed out after ${timeoutMs / 1000}s connecting to ${host}:${port} (${ip}).` }); });
    sock.on("error", (e) => finish({ error: `Connection to ${host}:${port} (${ip}) failed: ${e.code || e.message}.` }));
    sock.on("secureConnect", () => {
      const cert = sock.getPeerCertificate(false);
      const cipher = sock.getCipher();
      const proto = sock.getProtocol();
      const authorized = sock.authorized;
      const verifyError = sock.authorizationError ? String(sock.authorizationError) : null;
      sock.destroy();
      if (!cert || !cert.subject) return finish({ error: `${host}:${port} completed a TLS handshake but presented no certificate.` });
      const notAfter = Date.parse(cert.valid_to), notBefore = Date.parse(cert.valid_from);
      const days = Number.isFinite(notAfter) ? Math.floor((notAfter - Date.now()) / 86400000) : null;
      const sans = String(cert.subjectaltname || "").split(/,\s*/).filter(Boolean).map((s) => s.replace(/^DNS:/, "").replace(/^IP Address:/, "ip:"));
      finish({
        host, port, resolved_ip: ip, valid: authorized, verify_error: verifyError,
        subject_cn: cert.subject.CN || null, subject_org: cert.subject.O || null,
        issuer: cert.issuer.O || cert.issuer.CN || null, issuer_cn: cert.issuer.CN || null,
        not_before: Number.isFinite(notBefore) ? new Date(notBefore).toISOString() : cert.valid_from,
        not_after: Number.isFinite(notAfter) ? new Date(notAfter).toISOString() : cert.valid_to,
        days_left: days, expired: days !== null && days < 0,
        sans: sans.slice(0, 40), san_count: sans.length,
        protocol: proto, cipher: cipher?.name || null, fingerprint256: cert.fingerprint256 || null, serial: cert.serialNumber || null,
      });
    });
  });
}

export function renderTls(r) {
  if (r.error) return r.error;
  const verdict = r.expired ? `EXPIRED ${-r.days_left} day${r.days_left === -1 ? "" : "s"} ago`
    : r.days_left === null ? "expiry unknown"
    : r.days_left <= 7 ? `EXPIRES IN ${r.days_left} DAY${r.days_left === 1 ? "" : "S"}`
    : r.days_left <= 30 ? `expires in ${r.days_left} days — renew soon`
    : `${r.days_left} days left`;
  const lines = [
    `${r.host}:${r.port} (${r.resolved_ip}) — ${verdict}${r.valid ? "" : r.verify_error ? ` — does NOT verify on this machine: ${r.verify_error}` : ""}`,
    ``,
    `  Subject     ${r.subject_cn || "(no CN)"}${r.subject_org ? `  (${r.subject_org})` : ""}`,
    `  Issuer      ${r.issuer || "(unknown)"}${r.issuer_cn && r.issuer_cn !== r.issuer ? ` — ${r.issuer_cn}` : ""}`,
    `  Valid       ${r.not_before.slice(0, 10)} → ${r.not_after.slice(0, 10)}`,
    `  Protocol    ${r.protocol || "?"}  ·  ${r.cipher || "?"}`,
    `  SANs (${r.san_count})   ${r.sans.length ? r.sans.join(", ") : "none"}${r.san_count > r.sans.length ? ` … +${r.san_count - r.sans.length} more` : ""}`,
    `  SHA-256     ${r.fingerprint256 || "?"}`,
  ];
  if (r.protocol && /TLSv1(\.0|\.1)?$/.test(r.protocol)) lines.push(``, `${r.protocol} is deprecated — anything modern refuses it. Enable TLS 1.2/1.3 on the server.`);
  if (r.verify_error === "SELF_SIGNED_CERT_IN_CHAIN" || r.verify_error === "DEPTH_ZERO_SELF_SIGNED_CERT") lines.push(``, `Self-signed: fine on a lab box, a browser warning on anything public.`);
  if (r.verify_error === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || r.verify_error === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY") lines.push(``, `The server is not sending its intermediate certificate — browsers that have it cached will work, everything else fails. Add the full chain to the server config.`);
  return lines.join("\n");
}
