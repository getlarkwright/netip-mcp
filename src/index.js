#!/usr/bin/env node
// netip-mcp — the whatismynetip.com toolbox as MCP tools.
// Subnet math, port lookups and MAC lookups run entirely locally. DNS goes to public
// DNS-over-HTTPS resolvers, TLS inspection connects straight to the host you name, and the
// public-IP check asks Cloudflare's trace endpoint. No account, no telemetry, nothing of yours
// is read from disk.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { subnetCalc, renderSubnet, ipInSubnet, renderInSubnet, ipConvert, renderConvert, ipv6Normalize, renderV6 } from "./lib/ipmath.js";
import { dnsLookup, renderDns, reverseDns, renderReverse, dnsblCheck, renderDnsbl, RECORD_TYPES } from "./lib/dns.js";
import { tlsInspect, renderTls } from "./lib/tls.js";
import { macLookup, renderMac } from "./lib/mac.js";
import { lookupPort, portDetail, searchPorts, renderPort, renderSearch, PORT_COUNT } from "./lib/portinfo.js";
import { myPublicIp, renderPublicIp } from "./lib/publicip.js";

const str = (v, fallback = "") => (typeof v === "string" ? v : v === undefined || v === null ? fallback : String(v));

const TOOLS = [
  {
    name: "subnet_calc",
    description:
      "Work out a subnet from a CIDR or an address plus dotted mask: network, netmask, wildcard, broadcast, usable " +
      "host range and counts. IPv4 and IPv6. Handles /31 point-to-point and /32 host routes correctly.",
    inputSchema: {
      type: "object",
      properties: { cidr: { type: "string", description: "e.g. 10.10.1.0/24, 192.168.1.37/255.255.255.0, or 2001:db8::/48" } },
      required: ["cidr"],
    },
    run: (a) => renderSubnet(subnetCalc(str(a.cidr))),
  },
  {
    name: "ip_in_subnet",
    description: "Check whether an IP address falls inside a CIDR block, and show that block's first-to-last range. IPv4 and IPv6.",
    inputSchema: {
      type: "object",
      properties: { ip: { type: "string", description: "The address to test." }, cidr: { type: "string", description: "The block, e.g. 10.10.0.0/16." } },
      required: ["ip", "cidr"],
    },
    run: (a) => renderInSubnet(ipInSubnet(str(a.ip), str(a.cidr))),
  },
  {
    name: "ip_convert",
    description: "Convert an IPv4 address between dotted decimal, unsigned 32-bit integer, hex and dotted binary. Accepts any of the four as input.",
    inputSchema: { type: "object", properties: { value: { type: "string", description: "e.g. 192.168.1.1, 3232235777, 0xC0A80101, or 11000000.10101000.00000001.00000001" } }, required: ["value"] },
    run: (a) => renderConvert(ipConvert(str(a.value))),
  },
  {
    name: "ipv6_normalize",
    description: "Show the fully expanded form and the correct RFC 5952 compressed form of an IPv6 address, plus what kind of address it is (global, ULA, link-local, loopback, documentation…).",
    inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] },
    run: (a) => renderV6(ipv6Normalize(str(a.address))),
  },
  {
    name: "mac_lookup",
    description:
      "Identify the vendor behind a MAC address from the full IEEE MA-L registry (about 40,000 assignments, bundled — no network), " +
      "and decode the multicast and locally-administered bits. Explains randomised/privacy MACs.",
    inputSchema: { type: "object", properties: { mac: { type: "string", description: "Any format: 00:1A:2B:3C:4D:5E, 00-1a-2b-3c-4d-5e, 001a.2b3c.4d5e, or just the first three octets." } }, required: ["mac"] },
    run: (a) => renderMac(macLookup(str(a.mac))),
  },
  {
    name: "lookup_port",
    description:
      `What runs on a port and whether it is safe to expose. Covers the ${PORT_COUNT} ports whatismynetip.com documents by hand: ` +
      "service, protocols, category, common software, an exposure verdict (never / caution / normal) with the reasoning, and related ports. " +
      "Give a port number, or a query like 'redis' or 'wireguard' to search by service. detail:true adds the full explainer and FAQ.",
    inputSchema: {
      type: "object",
      properties: {
        port: { type: "number", description: "Port number, 0–65535." },
        query: { type: "string", description: "Search by service, software or category instead of a number." },
        detail: { type: "boolean", description: "Include the long explainer and FAQ (default false)." },
      },
    },
    run: async (a) => {
      if (a.port === undefined || a.port === null || a.port === "") {
        const q = str(a.query);
        if (!q) return "Give a port number, or a query to search by service.";
        return renderSearch(q, searchPorts(q));
      }
      const r = lookupPort(a.port);
      const d = r.known && a.detail === true ? await portDetail(r.port) : null;
      return renderPort(r, d);
    },
  },
  {
    name: "dns_lookup",
    description: `Resolve a DNS name over DNS-over-HTTPS. Record types: ${RECORD_TYPES.join(", ")}. Returns every answer with its TTL, and says why when there is none (NXDOMAIN vs no record of that type).`,
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Hostname, e.g. example.com or _dmarc.example.com" }, type: { type: "string", description: "Record type (default A)." } },
      required: ["name"],
    },
    run: async (a) => renderDns(await dnsLookup(str(a.name), str(a.type, "A"))),
  },
  {
    name: "reverse_dns",
    description: "PTR lookup for an IPv4 or IPv6 address — what name the address maps back to, if any.",
    inputSchema: { type: "object", properties: { ip: { type: "string" } }, required: ["ip"] },
    run: async (a) => renderReverse(await reverseDns(str(a.ip))),
  },
  {
    name: "dnsbl_check",
    description:
      "Check an IPv4 address against five common spam/abuse blocklists (Spamhaus ZEN, SpamCop, SORBS, Barracuda, s5h). " +
      "Honest about lists that refuse public-resolver queries — those come back n/a, never a false 'clean'.",
    inputSchema: { type: "object", properties: { ip: { type: "string", description: "IPv4 address." } }, required: ["ip"] },
    run: async (a) => renderDnsbl(await dnsblCheck(str(a.ip))),
  },
  {
    name: "tls_inspect",
    description:
      "Connect to a public host and report the TLS certificate it actually serves: subject, issuer, validity window and days left, " +
      "SANs, protocol and cipher, whether the chain verifies, and the SHA-256 fingerprint. Any port (default 443). Accepts a URL. " +
      "Refuses hosts that resolve to private or reserved addresses.",
    inputSchema: {
      type: "object",
      properties: { host: { type: "string", description: "Hostname, host:port, or a URL." }, port: { type: "number", description: "Port (default 443, or taken from host:port / the URL)." } },
      required: ["host"],
    },
    run: async (a) => renderTls(await tlsInspect(str(a.host), a.port === undefined || a.port === null ? undefined : Number(a.port))),
  },
  {
    name: "my_public_ip",
    description:
      "The public IP address the internet sees this machine as, with the edge location that saw it, reverse DNS, the network's ASN and " +
      "organisation, and a datacenter/VPN hint. Needs an outside observer, so this one talks to Cloudflare's trace endpoint and Team Cymru's ASN DNS.",
    inputSchema: { type: "object", properties: {} },
    run: async () => renderPublicIp(await myPublicIp()),
  },
];

const server = new Server({ name: "netip", version: "0.1.1" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find((t) => t.name === req.params.name);
  if (!tool) return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
  try {
    const text = await tool.run(req.params.arguments || {});
    return { content: [{ type: "text", text }] };
  } catch (e) {
    return { content: [{ type: "text", text: `${tool.name} failed: ${e.message}` }], isError: true };
  }
});

await server.connect(new StdioServerTransport());
