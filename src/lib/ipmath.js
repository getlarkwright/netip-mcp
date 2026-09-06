// IPv4 and IPv6 arithmetic — the calculators from whatismynetip.com, as pure functions.
// No I/O anywhere in this file.

export function ipToInt(ip) {
  const parts = String(ip).trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const o = Number(p);
    if (o > 255) return null;
    n = n * 256 + o;
  }
  return n >>> 0;
}

export const intToIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

// Dotted mask -> prefix length; null when the mask is not contiguous ones-then-zeros.
export function maskToBits(mask) {
  const m = ipToInt(mask);
  if (m === null) return null;
  let bits = 0, seenZero = false;
  for (let i = 31; i >= 0; i--) {
    if ((m >>> i) & 1) { if (seenZero) return null; bits++; } else seenZero = true;
  }
  return bits;
}

// --- IPv6 helpers (ported from the expand/compress tool) -----------------------------

export function v6Expand(s) {
  s = String(s || "").trim().replace(/^\[|\]$/g, "");
  if (!/^[0-9a-f:]+$/i.test(s) || (s.match(/::/g) || []).length > 1) return null;
  let parts;
  if (s.includes("::")) {
    const [l, r] = s.split("::");
    const left = l ? l.split(":") : [], right = r ? r.split(":") : [];
    const mid = 8 - left.length - right.length;
    if (mid < 0) return null;
    parts = [...left, ...Array(mid).fill("0"), ...right];
  } else {
    parts = s.split(":");
  }
  if (parts.length !== 8) return null;
  for (let i = 0; i < 8; i++) {
    if (!/^[0-9a-f]{1,4}$/i.test(parts[i])) return null;
    parts[i] = parts[i].toLowerCase().padStart(4, "0");
  }
  return parts;
}

// RFC 5952: shorten the longest run of zero groups (only if it is 2+ groups long).
export function v6Compress(groups) {
  const s = groups.map((g) => g.replace(/^0+/, "") || "0");
  let best = -1, bestLen = 0;
  for (let i = 0; i < 8; i++) {
    if (s[i] !== "0") continue;
    let j = i;
    while (j < 8 && s[j] === "0") j++;
    if (j - i > bestLen) { bestLen = j - i; best = i; }
    i = j - 1;
  }
  if (bestLen < 2) return s.join(":");
  return s.slice(0, best).join(":") + "::" + s.slice(best + bestLen).join(":");
}

const v6ToBig = (groups) => groups.reduce((acc, g) => (acc << 16n) + BigInt(parseInt(g, 16)), 0n);
const bigToGroups = (b) => Array.from({ length: 8 }, (_, i) => ((b >> BigInt((7 - i) * 16)) & 0xffffn).toString(16).padStart(4, "0"));

// --- subnet calculator -----------------------------------------------------------------

export function subnetCalc(input) {
  const s = String(input || "").trim();
  if (!s) return { error: "Give a CIDR like 10.10.1.0/24, an address with a dotted mask, or an IPv6 prefix like 2001:db8::/48." };
  if (s.includes(":")) return subnetCalc6(s);

  const m = s.match(/^(\d+\.\d+\.\d+\.\d+)(?:\/(\S+))?$/);
  if (!m) return { error: `"${s}" is not an IPv4 address or CIDR.` };
  const base = ipToInt(m[1]);
  const bits = m[2] === undefined ? 32 : /^\d+$/.test(m[2]) ? Number(m[2]) : maskToBits(m[2]);
  if (base === null) return { error: `"${m[1]}" is not a valid IPv4 address.` };
  if (bits === null || bits < 0 || bits > 32) return { error: `"/${m[2]}" is not a valid prefix length or mask.` };

  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const net = (base & mask) >>> 0;
  const bc = (net | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - bits);
  const first = bits >= 31 ? net : (net + 1) >>> 0;
  const last = bits >= 31 ? bc : (bc - 1) >>> 0;
  return {
    version: 4, input: s, network: intToIp(net), bits, netmask: intToIp(mask), wildcard: intToIp(~mask >>> 0),
    broadcast: intToIp(bc), first: intToIp(first), last: intToIp(last),
    usable: bits >= 31 ? total : Math.max(0, total - 2), total, input_was_host: base !== net,
  };
}

function subnetCalc6(s) {
  const m = s.match(/^([0-9a-f:\[\]]+)(?:\/(\d+))?$/i);
  const groups = m && v6Expand(m[1]);
  const bits = m && (m[2] === undefined ? 128 : Number(m[2]));
  if (!groups || bits < 0 || bits > 128) return { error: `"${s}" is not a valid IPv6 address or prefix.` };
  const addr = v6ToBig(groups);
  const hostBits = BigInt(128 - bits);
  const mask = bits === 0 ? 0n : ((1n << 128n) - 1n) ^ ((1n << hostBits) - 1n);
  const net = addr & mask;
  const last = net | ((1n << hostBits) - 1n);
  return {
    version: 6, input: s, network: v6Compress(bigToGroups(net)), expanded: bigToGroups(net).join(":"), bits,
    first: v6Compress(bigToGroups(net)), last: v6Compress(bigToGroups(last)),
    total: (1n << hostBits).toString(), input_was_host: addr !== net,
  };
}

export function renderSubnet(r) {
  if (r.error) return r.error;
  if (r.version === 6) {
    return [
      `${r.network}/${r.bits}${r.input_was_host ? `  (you gave a host address inside it: ${r.input})` : ""}`,
      ``,
      `  Expanded   ${r.expanded}`,
      `  First      ${r.first}`,
      `  Last       ${r.last}`,
      `  Addresses  2^${128 - r.bits} = ${r.total}`,
      r.bits === 64 ? `` : ``,
      r.bits > 64 ? `\nA prefix longer than /64 breaks SLAAC — hosts cannot autoconfigure. Fine for point-to-point (/127) or loopbacks (/128).` : "",
    ].filter((l) => l !== "").join("\n");
  }
  const lines = [
    `${r.network}/${r.bits}${r.input_was_host ? `  (you gave a host address inside it: ${r.input})` : ""}`,
    ``,
    `  Netmask     ${r.netmask}`,
    `  Wildcard    ${r.wildcard}`,
    `  Broadcast   ${r.broadcast}`,
    `  Host range  ${r.first} – ${r.last}`,
    `  Usable      ${r.usable.toLocaleString("en-US")}`,
    `  Total       ${r.total.toLocaleString("en-US")}`,
  ];
  if (r.bits === 31) lines.push(``, `/31 is a point-to-point link (RFC 3021): both addresses are usable, there is no broadcast.`);
  if (r.bits === 32) lines.push(``, `/32 is a single host route.`);
  return lines.join("\n");
}

// --- IP in subnet ------------------------------------------------------------------------

export function ipInSubnet(ip, cidr) {
  const ipS = String(ip || "").trim(), cidrS = String(cidr || "").trim();
  if (ipS.includes(":") || cidrS.includes(":")) {
    const g = v6Expand(ipS);
    const m = cidrS.match(/^([0-9a-f:\[\]]+)\/(\d+)$/i);
    const bg = m && v6Expand(m[1]);
    if (!g || !bg || Number(m[2]) < 0 || Number(m[2]) > 128) return { error: "Give an IPv6 address and an IPv6 CIDR, e.g. 2001:db8::1 and 2001:db8::/32." };
    const bits = Number(m[2]);
    const mask = bits === 0 ? 0n : ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - bits)) - 1n);
    const net = v6ToBig(bg) & mask;
    const inside = (v6ToBig(g) & mask) === net;
    return { version: 6, ip: v6Compress(g), network: v6Compress(bigToGroups(net)), bits, inside,
             first: v6Compress(bigToGroups(net)), last: v6Compress(bigToGroups(net | ((1n << BigInt(128 - bits)) - 1n))) };
  }
  const a = ipToInt(ipS);
  const m = cidrS.match(/^(\d+\.\d+\.\d+\.\d+)\/(\S+)$/);
  const base = m && ipToInt(m[1]);
  const bits = m && (/^\d+$/.test(m[2]) ? Number(m[2]) : maskToBits(m[2]));
  if (a === null || base === null || bits === null || bits === undefined || bits < 0 || bits > 32) {
    return { error: "Give an IPv4 address and a CIDR, e.g. 10.10.5.9 and 10.10.0.0/16." };
  }
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const net = (base & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
  return { version: 4, ip: ipS, network: intToIp(net), bits, inside: ((a & mask) >>> 0) === net, first: intToIp(net), last: intToIp(bc) };
}

export function renderInSubnet(r) {
  if (r.error) return r.error;
  return `${r.ip} is ${r.inside ? "INSIDE" : "NOT inside"} ${r.network}/${r.bits}\n  That block spans ${r.first} – ${r.last}.`;
}

// --- IPv4 converter -----------------------------------------------------------------------

export function ipConvert(value) {
  const v = String(value || "").trim();
  let n = null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v)) n = ipToInt(v);
  else if (/^[01]{8}(\.[01]{8}){3}$/.test(v)) n = v.split(".").reduce((acc, b) => acc * 256 + parseInt(b, 2), 0);
  else if (/^\d+$/.test(v)) { n = Number(v); if (n > 4294967295) n = null; }
  else if (/^0x[0-9a-f]+$/i.test(v)) { n = parseInt(v, 16); if (n > 4294967295) n = null; }
  if (n === null) return { error: `"${v}" is not an IPv4 address, a 32-bit integer, 0x-hex, or dotted binary.` };
  n = n >>> 0;
  const oct = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  return {
    dotted: oct.join("."), integer: n, hex: "0x" + n.toString(16).toUpperCase().padStart(8, "0"),
    binary: oct.map((o) => o.toString(2).padStart(8, "0")).join("."), octets: oct,
  };
}

export function renderConvert(r) {
  if (r.error) return r.error;
  return `  Dotted   ${r.dotted}\n  Integer  ${r.integer}\n  Hex      ${r.hex}\n  Binary   ${r.binary}`;
}

// --- IPv6 normalise -----------------------------------------------------------------------

export function ipv6Normalize(address) {
  const g = v6Expand(address);
  if (!g) return { error: `"${String(address || "").trim()}" is not a valid IPv6 address (hex groups and at most one "::").` };
  const first = parseInt(g[0], 16);
  let scope = "global unicast";
  const h = g.join("");
  if (h === "0".repeat(32)) scope = "unspecified (::)";
  else if (h === "0".repeat(31) + "1") scope = "loopback (::1)";
  else if ((first & 0xfe00) === 0xfc00) scope = "unique local (fc00::/7) — private, not routed on the internet";
  else if ((first & 0xffc0) === 0xfe80) scope = "link-local (fe80::/10)";
  else if ((first & 0xff00) === 0xff00) scope = "multicast (ff00::/8)";
  else if (g[0] === "2001" && g[1] === "0db8") scope = "documentation (2001:db8::/32) — not routable";
  else if (h.startsWith("00000000000000000000ffff")) scope = "IPv4-mapped (::ffff:0:0/96)";
  return { expanded: g.join(":"), compressed: v6Compress(g), groups: g, scope };
}

export function renderV6(r) {
  if (r.error) return r.error;
  return `  Expanded    ${r.expanded}\n  Compressed  ${r.compressed}\n  Scope       ${r.scope}`;
}
