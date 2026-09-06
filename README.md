# netip-mcp

The [whatismynetip.com](https://whatismynetip.com/) toolbox as tools your coding agent can call. Subnet
math, "what runs on this port and should it be open", MAC vendor lookups, DNS and blocklist checks,
the certificate a host actually serves, and the IP the internet sees you as.

Free, MIT, no account, no telemetry. The site's own tools run in your browser; this runs the same logic
next to your agent.

## Install

Pin the version.

**Claude Code**

```
claude mcp add netip -- npx -y github:labaccessnow/netip-mcp#v0.1.0
```

**Claude Desktop, Cursor, or any client with a JSON config**

```json
{
  "mcpServers": {
    "netip": {
      "command": "npx",
      "args": ["-y", "github:labaccessnow/netip-mcp#v0.1.0"]
    }
  }
}
```

**Docker**

```json
{
  "mcpServers": {
    "netip": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "ghcr.io/labaccessnow/netip-mcp:0.1.0"]
    }
  }
}
```

Node 18 or newer for the npx route. Also in the official MCP registry as `io.github.labaccessnow/netip-mcp`.

## Tools

| Tool | What it answers | Network |
|---|---|---|
| `subnet_calc` | Network, mask, wildcard, broadcast, host range and counts for a CIDR — IPv4 and IPv6, /31 and /32 done right | none |
| `ip_in_subnet` | Is this address inside that block? | none |
| `ip_convert` | IPv4 as dotted, integer, hex, binary — from any of them | none |
| `ipv6_normalize` | Expanded and RFC 5952 compressed forms, and what kind of address it is | none |
| `mac_lookup` | Vendor from the full IEEE registry (~40,000 assignments, bundled), plus the multicast and locally-administered bits | none |
| `lookup_port` | What runs on a port, and whether to expose it — 100 ports written up by hand, searchable by service | none |
| `dns_lookup` | A, AAAA, MX, TXT, NS, CNAME, CAA, SOA, PTR, SRV over DNS-over-HTTPS | DoH |
| `reverse_dns` | PTR for an IPv4 or IPv6 address | DoH |
| `dnsbl_check` | Five common blocklists, honest about the ones that refuse public resolvers | DoH |
| `tls_inspect` | The certificate a host actually serves: expiry, SANs, chain verification, protocol, cipher | direct TLS |
| `my_public_ip` | The address the internet sees, edge location, ASN, reverse DNS, datacenter/VPN hint | Cloudflare trace + Team Cymru DNS |

### lookup_port

The one I reach for most. The port pages on the site are opinionated — every port carries a verdict:

```
Port 3389/tcp+udp — RDP (Remote Desktop Protocol)

  Category   remote access
  Software   Windows Remote Desktop Services, xrdp, FreeRDP server, Windows Admin Center hosts
  Exposure   NEVER — do not expose to the internet

Internet-facing RDP is the most common initial-access route for ransomware crews, who
credential-stuff it around the clock; put it behind WireGuard, Tailscale or an RD Gateway …
```

Ask by number, or search: `lookup_port` with `query: "redis"` finds 6379. `detail: true` adds the full
write-up and FAQ.

## What it does not do

- No account, no signup, no key.
- No telemetry. Nothing about your usage goes anywhere.
- Nothing of yours is read from disk. The only file it opens is its own bundled OUI table.
- The local tools never open a socket. The network tools talk only to public services — Cloudflare and
  Google's DNS-over-HTTPS resolvers, Cloudflare's trace endpoint, Team Cymru's ASN DNS, and whichever
  host you point `tls_inspect` at. `tls_inspect` refuses anything that resolves to private or reserved
  space, so it cannot be turned on your own network.
- "Is my port reachable from outside?" needs a machine outside your NAT to try the connection. That is
  what [whatismynetip.com/port-checker](https://whatismynetip.com/port-checker/) does; a local tool
  cannot.

The port data and the calculators are the same ones the site uses, so the two stay in step.

## Licence

MIT. Written by James Son — network, security, and automation engineer. Corrections and additions to the
port write-ups are welcome.
