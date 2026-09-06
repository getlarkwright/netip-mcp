// Spawns the real server over stdio and exercises every tool with a positive and a negative
// case. The positive controls are values that cannot be argued with — RFC examples, the
// standard DNSBL test address, Cloudflare's own resolver name.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const CASES = [
  // --- local, deterministic -------------------------------------------------------------
  ["subnet_calc", { cidr: "10.0.0.0/24" }, ["10.0.0.255", "10.0.0.1 – 10.0.0.254", "254"]],
  ["subnet_calc", { cidr: "10.0.0.5/31" }, ["point-to-point", "Usable      2"]],
  ["subnet_calc", { cidr: "192.168.1.37/255.255.255.0" }, ["192.168.1.0/24", "host address inside it"]],
  ["subnet_calc", { cidr: "2001:db8::/48" }, ["2001:db8::/48", "2^80"]],
  ["subnet_calc", { cidr: "10.0.0.0/33" }, ["not a valid prefix"]],
  ["ip_in_subnet", { ip: "10.10.5.9", cidr: "10.10.0.0/16" }, ["is INSIDE 10.10.0.0/16"]],
  ["ip_in_subnet", { ip: "192.168.1.1", cidr: "10.0.0.0/8" }, ["NOT inside"]],
  ["ip_in_subnet", { ip: "2001:db8::1", cidr: "2001:db8::/32" }, ["is INSIDE"]],
  ["ip_convert", { value: "3232235777" }, ["192.168.1.1", "0xC0A80101", "11000000.10101000.00000001.00000001"]],
  ["ip_convert", { value: "0xC0A80101" }, ["192.168.1.1"]],
  ["ip_convert", { value: "banana" }, ["is not an IPv4"]],
  ["ipv6_normalize", { address: "2001:db8::1" }, ["2001:0db8:0000:0000:0000:0000:0000:0001", "documentation"]],
  ["ipv6_normalize", { address: "2001:db8:0:0:1:0:0:1" }, ["2001:db8::1:0:0:1"]],           // RFC 5952 §4.2.3
  ["ipv6_normalize", { address: "fe80::1" }, ["link-local"]],
  ["ipv6_normalize", { address: "2001:db8:::1" }, ["not a valid IPv6"]],
  ["mac_lookup", { mac: "00:00:00:12:34:56" }, ["XEROX"]],
  ["mac_lookup", { mac: "02:00:00:00:00:01" }, ["locally administered", "randomised"]],
  ["mac_lookup", { mac: "zz" }, ["at least the first three octets"]],
  ["lookup_port", { port: 3389 }, ["RDP", "NEVER", "ransomware"]],
  ["lookup_port", { port: 443, detail: true }, ["HTTPS", "About port 443", "FAQ"]],
  ["lookup_port", { query: "wireguard" }, ["51820"]],
  ["lookup_port", { port: 12345 }, ["not one of the", "registered"]],
  // --- network ------------------------------------------------------------------------------
  ["dns_lookup", { name: "one.one.one.one", type: "A" }, ["1.1.1.1"]],
  ["dns_lookup", { name: "gmail.com", type: "MX" }, ["google"]],
  ["dns_lookup", { name: "this-name-does-not-exist-9f8a7b6c.example", type: "A" }, ["NXDOMAIN"]],
  ["reverse_dns", { ip: "1.1.1.1" }, ["one.one.one.one"]],
  ["dnsbl_check", { ip: "127.0.0.2" }, ["LISTED"]],                                          // the universal test address
  ["dnsbl_check", { ip: "2001:db8::1" }, ["IPv4-only"]],
  ["tls_inspect", { host: "https://www.cloudflare.com/" }, ["cloudflare", "days left", "SANs"]],
  ["tls_inspect", { host: "10.0.0.1" }, ["private or reserved", "refused"]],
  ["tls_inspect", { host: "localhost" }, ["refused"]],
  ["my_public_ip", {}, ["public IPv", "Seen from"]],
];

const client = new Client({ name: "smoke-test", version: "0.0.0" }, { capabilities: {} });
await client.connect(new StdioClientTransport({ command: "node", args: [new URL("../src/index.js", import.meta.url).pathname] }));

const { tools } = await client.listTools();
console.log(`tools advertised: ${tools.length} — ${tools.map((t) => t.name).join(", ")}\n`);

let failed = 0;
for (const [name, args, expect] of CASES) {
  const res = await client.callTool({ name, arguments: args });
  const text = (res.content || []).map((c) => c.text || "").join("\n");
  const missing = expect.filter((e) => !text.toLowerCase().includes(e.toLowerCase()));
  const label = `${name}(${JSON.stringify(args)})`;
  if (missing.length) {
    failed++;
    console.log(`FAIL ${label}\n  missing: ${missing.join(" | ")}\n  got:\n${text.split("\n").map((l) => "    " + l).join("\n")}\n`);
  } else {
    console.log(`pass ${label}`);
  }
}

await client.close();
console.log(failed ? `\n${failed} case(s) failed` : `\nall ${CASES.length} cases passed`);
process.exit(failed ? 1 : 0);
