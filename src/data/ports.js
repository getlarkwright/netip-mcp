// Generated from whatismynetip.com's hand-written port pages — keep in step with the site.
export default {
 "20": {
  "service": "FTP-DATA",
  "name": "File Transfer Protocol (active-mode data channel)",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "vsftpd",
   "ProFTPD",
   "Pure-FTPd",
   "FileZilla Server",
   "IIS FTP Server"
  ],
  "expose": "caution",
  "expose_note": "Nothing normally listens on port 20 - it is the source port an FTP server uses for active-mode data connections - so forwarding it achieves nothing; if you must run FTP at all, publish port 21 plus an explicit passive range with FTPS enabled, or drop FTP and use SFTP on port 22 instead.",
  "related": [
   21,
   22,
   873,
   445
  ]
 },
 "21": {
  "service": "FTP",
  "name": "File Transfer Protocol (control channel)",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "vsftpd",
   "ProFTPD",
   "Pure-FTPd",
   "FileZilla Server",
   "IIS FTP Server",
   "Synology FTP"
  ],
  "expose": "caution",
  "expose_note": "Port 21 is legitimate to publish but plain FTP sends the password in cleartext and passive-mode misconfiguration behind NAT breaks it constantly - if you expose it, require explicit FTPS (AUTH TLS), pin and forward a passive port range, and prefer SFTP on port 22 for anything you control both ends of.",
  "related": [
   20,
   22,
   873,
   445
  ]
 },
 "22": {
  "service": "SSH",
  "name": "Secure Shell",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "OpenSSH (sshd)",
   "Dropbear",
   "Windows OpenSSH Server",
   "Tectia SSH Server"
  ],
  "expose": "caution",
  "expose_note": "SSH is built to survive on a hostile network and is fine to expose if you set PasswordAuthentication no and PermitRootLogin no and log in with keys, but a password-authenticated sshd on 22 is brute-forced within hours, so if you have no reason to reach it from arbitrary networks put it behind WireGuard instead.",
  "related": [
   23,
   21,
   3389,
   5900
  ]
 },
 "23": {
  "service": "Telnet",
  "name": "Telnet remote terminal",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "in.telnetd / telnetd",
   "BusyBox telnetd",
   "Cisco IOS VTY",
   "MikroTik RouterOS"
  ],
  "expose": "never",
  "expose_note": "Telnet sends the username, the password and every keystroke in clear text, and internet-facing 23 with default credentials is exactly what Mirai and its descendants built their botnets from - if this check says OPEN, find the device and turn the service off, then use SSH on 22 for the same job.",
  "related": [
   22,
   21,
   3389
  ]
 },
 "25": {
  "service": "SMTP",
  "name": "Simple Mail Transfer Protocol (server-to-server relay)",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Postfix",
   "Exim",
   "Sendmail",
   "OpenSMTPD",
   "Microsoft Exchange",
   "Stalwart"
  ],
  "expose": "caution",
  "expose_note": "A public MX has to accept connections on 25 or it cannot receive mail, but the listener must never relay for unauthenticated senders (check postconf smtpd_relay_restrictions), and if you only need to send, use an authenticated relay on 587 or 465 and leave 25 shut.",
  "related": [
   587,
   465,
   2525,
   993
  ]
 },
 "53": {
  "service": "DNS",
  "name": "Domain Name System",
  "category": "infrastructure",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "BIND 9",
   "Unbound",
   "dnsmasq",
   "PowerDNS",
   "CoreDNS",
   "Knot DNS",
   "NSD",
   "Pi-hole",
   "AdGuard Home"
  ],
  "expose": "caution",
  "expose_note": "An authoritative nameserver is meant to answer the whole internet, but a <b>recursive</b> resolver left open on 53 becomes a DNS amplification reflector and someone else's DDoS cannon, so restrict recursion to your own prefixes (BIND <code>allow-recursion</code>, Unbound <code>access-control</code>) and keep a Pi-hole or AdGuard box on the LAN or behind WireGuard rather than port-forwarded.",
  "related": [
   5353,
   443,
   123
  ]
 },
 "67": {
  "service": "DHCP (server)",
  "name": "Dynamic Host Configuration Protocol - server",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "ISC Kea",
   "ISC dhcpd",
   "dnsmasq",
   "Windows Server DHCP",
   "udhcpd",
   "MikroTik RouterOS",
   "OPNsense",
   "pfSense"
  ],
  "expose": "never",
  "expose_note": "DHCP is a broadcast protocol scoped to a single link, so there is nothing on the internet that could legitimately reach UDP 67 and no port-forward that would help - to serve clients on another subnet use a DHCP relay (<code>ip helper-address</code> on the client-side gateway) inside your own network, and to manage the server remotely use SSH or a VPN.",
  "related": [
   68,
   69,
   53
  ]
 },
 "68": {
  "service": "DHCP (client)",
  "name": "Dynamic Host Configuration Protocol - client",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "ISC dhclient",
   "dhcpcd",
   "systemd-networkd",
   "NetworkManager",
   "udhcpc",
   "Windows DHCP Client service"
  ],
  "expose": "never",
  "expose_note": "The only party that should ever send you a packet on UDP 68 is the DHCP server on the link you are attached to - your router's WAN port accepting a lease from the ISP is the one legitimate case - because an accepted rogue offer rewrites your default gateway and DNS servers, so never port-forward it and keep the allow rule scoped to the interface that needs it.",
  "related": [
   67,
   69,
   53
  ]
 },
 "69": {
  "service": "TFTP",
  "name": "Trivial File Transfer Protocol",
  "category": "file-sharing",
  "proto": [
   "udp"
  ],
  "software": [
   "tftpd-hpa",
   "atftpd",
   "dnsmasq",
   "SolarWinds TFTP Server",
   "Windows Deployment Services",
   "iPXE / pxelinux boot servers"
  ],
  "expose": "never",
  "expose_note": "TFTP has no authentication, no encryption and no access control beyond filesystem permissions, so anyone who can reach UDP 69 can read - and on a writable server overwrite - whatever lives in the TFTP root, which on most networks is switch configurations and firmware images; keep it on the management VLAN and use SFTP or HTTPS for anything that has to cross untrusted ground.",
  "related": [
   67,
   21,
   514
  ]
 },
 "80": {
  "service": "HTTP",
  "name": "Hypertext Transfer Protocol",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "nginx",
   "Apache HTTP Server",
   "Caddy",
   "Microsoft IIS",
   "Traefik",
   "HAProxy"
  ],
  "expose": "normal",
  "expose_note": "Port 80 is built to face the internet, but in current practice it should do only two jobs — answer the ACME HTTP-01 certificate challenge and 301-redirect everything else to HTTPS on 443 — so nothing sensitive ever crosses it in cleartext.",
  "related": [
   443,
   8080,
   8000,
   22
  ]
 },
 "81": {
  "service": "HTTP (secondary)",
  "name": "Secondary HTTP listener - proxy admin UIs and camera web interfaces",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Nginx Proxy Manager admin UI",
   "IP camera and DVR web interfaces",
   "second nginx or Apache virtual host"
  ],
  "expose": "caution",
  "expose_note": "A second website on 81 is harmless, but the two things most often found there are not — Nginx Proxy Manager's admin UI ships with a documented default login, and cheap IP camera web interfaces are a standing botnet recruitment target — so never forward an admin panel on 81; reach it over WireGuard or bind it to the LAN.",
  "related": [
   80,
   443,
   8080,
   8443
  ]
 },
 "88": {
  "service": "Kerberos",
  "name": "Kerberos v5 Key Distribution Center",
  "category": "infrastructure",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "Active Directory domain controllers (KDC)",
   "MIT Kerberos krb5kdc",
   "Heimdal KDC",
   "FreeIPA"
  ],
  "expose": "never",
  "expose_note": "An internet-reachable KDC lets a stranger enumerate valid usernames from the error codes, collect AS-REP roastable material from accounts with pre-authentication disabled and spray passwords against your lockout policy, so keep domain controllers behind a VPN and publish applications through a reverse proxy or identity gateway that authenticates users before anything touches the KDC.",
  "related": [
   445,
   135,
   3389,
   5986
  ]
 },
 "110": {
  "service": "POP3",
  "name": "Post Office Protocol version 3",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Dovecot",
   "Courier",
   "Cyrus IMAP",
   "Zimbra",
   "Microsoft Exchange",
   "Stalwart"
  ],
  "expose": "caution",
  "expose_note": "Plain POP3 sends the username and password in cleartext unless STLS is negotiated first, so expose 110 only if the server refuses authentication before the TLS upgrade (Dovecot's disable_plaintext_auth = yes does this by default) - otherwise point clients at 995 and leave 110 bound to localhost.",
  "related": [
   995,
   143,
   993,
   25
  ]
 },
 "111": {
  "service": "rpcbind",
  "name": "ONC RPC portmapper (rpcbind / sunrpc)",
  "category": "infrastructure",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "rpcbind",
   "portmap",
   "Linux NFSv3 server",
   "NIS / ypbind",
   "Solaris and AIX RPC services"
  ],
  "expose": "never",
  "expose_note": "Port 111 is a directory that tells anyone who asks exactly which RPC services you run and on which ports, and UDP 111 is a well-known DDoS reflection source that gets hosting accounts suspended - if you are not running NFSv3 or NIS, disable it with systemctl disable --now rpcbind rpcbind.socket, and otherwise bind it to a private interface.",
  "related": [
   2049,
   445,
   22,
   139
  ]
 },
 "123": {
  "service": "NTP",
  "name": "Network Time Protocol",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "chrony",
   "ntpd",
   "NTPsec",
   "systemd-timesyncd",
   "OpenNTPD",
   "Windows Time (w32time)"
  ],
  "expose": "caution",
  "expose_note": "Serving time to the internet is legitimate - that is exactly what NTP Pool members do - but a misconfigured server is a powerful amplification reflector, so keep the mode 6 and mode 7 control queries shut (<code>restrict default noquery</code> in ntpd, which chrony refuses by default anyway), never re-enable <code>monlist</code>, and if you only need accurate time you do not need to listen on 123 at all.",
  "related": [
   53,
   161,
   514
  ]
 },
 "135": {
  "service": "MSRPC",
  "name": "DCE/RPC Endpoint Mapper",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows RPC Endpoint Mapper (RpcSs)",
   "DCOM",
   "WMI",
   "Remote service and Event Log management"
  ],
  "expose": "never",
  "expose_note": "Port 135 is the directory that tells a caller which dynamic port every RPC and DCOM service is on, it has a long history of pre-authentication worms from Blaster to CVE-2022-26809, and it is blocked at essentially every competent network edge - keep it inside the LAN or a VPN and never forward it.",
  "related": [
   139,
   445,
   593,
   5985
  ]
 },
 "137": {
  "service": "NetBIOS-NS",
  "name": "NetBIOS Name Service",
  "category": "file-sharing",
  "proto": [
   "udp"
  ],
  "software": [
   "Windows NetBIOS over TCP/IP (NetBT)",
   "Samba nmbd",
   "WINS clients"
  ],
  "expose": "never",
  "expose_note": "NetBIOS name service answers anyone who asks with the host name, workgroup or domain and the MAC address, it is trivially poisoned on the local segment by tools like Responder to harvest NetNTLM hashes, and it has been abused for UDP reflection - block 137-139 inbound and outbound at the edge, and turn NetBIOS over TCP/IP off entirely on anything modern.",
  "related": [
   139,
   445,
   135
  ]
 },
 "139": {
  "service": "NetBIOS-SSN",
  "name": "NetBIOS Session Service (SMB over NetBIOS)",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows Server service (LanmanServer) via NetBT",
   "Samba smbd",
   "NAS firmware with legacy SMB"
  ],
  "expose": "never",
  "expose_note": "Port 139 is file sharing with a legacy wrapper: exposing it invites NetNTLM capture and relay, and it is one of the ports the classic SMB worms swept for - reach shares over WireGuard or Tailscale and mount them across the tunnel, or publish files with Nextcloud or WebDAV over HTTPS instead.",
  "related": [
   445,
   137,
   135,
   22
  ]
 },
 "143": {
  "service": "IMAP",
  "name": "Internet Message Access Protocol",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Dovecot",
   "Cyrus IMAP",
   "Courier",
   "Zimbra",
   "Microsoft Exchange",
   "Stalwart"
  ],
  "expose": "caution",
  "expose_note": "Port 143 is only safe on the internet when STARTTLS is enforced and plaintext authentication is refused before the upgrade - webmail and sync jobs on the same host should use 127.0.0.1:143 instead, and remote clients should be pointed at 993 so there is no cleartext phase at all.",
  "related": [
   993,
   110,
   995,
   587
  ]
 },
 "161": {
  "service": "SNMP",
  "name": "Simple Network Management Protocol",
  "category": "monitoring",
  "proto": [
   "udp"
  ],
  "software": [
   "net-snmp (snmpd)",
   "Windows SNMP Service",
   "switch, router and firewall agents",
   "printer and MFP agents",
   "UPS and PDU agents",
   "NAS agents"
  ],
  "expose": "never",
  "expose_note": "SNMP v1 and v2c authenticate with a cleartext community string that is very often still <code>public</code>, so an internet-reachable agent hands over a full inventory of the device and doubles as a GETBULK amplification reflector - poll it across a management VLAN or a site-to-site VPN, restrict the agent by source address, and use SNMPv3 with authPriv if it has to leave the box at all.",
  "related": [
   162,
   514,
   9100
  ]
 },
 "162": {
  "service": "SNMP Trap",
  "name": "SNMP trap and inform receiver",
  "category": "monitoring",
  "proto": [
   "udp"
  ],
  "software": [
   "snmptrapd (net-snmp)",
   "LibreNMS",
   "Zabbix",
   "Observium",
   "PRTG",
   "SolarWinds NPM",
   "snmptt"
  ],
  "expose": "never",
  "expose_note": "A trap receiver accepts unauthenticated, connectionless, trivially spoofed notifications, so anything that can reach UDP 162 can flood your NMS or lie to it about the state of your network - keep the collector on the management network and have remote sites deliver traps over the site-to-site VPN, or use SNMPv3 informs with authPriv if they must cross untrusted ground.",
  "related": [
   161,
   514,
   123
  ]
 },
 "179": {
  "service": "BGP",
  "name": "Border Gateway Protocol",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "FRRouting (bgpd)",
   "BIRD",
   "GoBGP",
   "OpenBGPD",
   "Cisco IOS / IOS-XR",
   "Juniper Junos",
   "Arista EOS",
   "MikroTik RouterOS",
   "Calico",
   "MetalLB"
  ],
  "expose": "never",
  "expose_note": "BGP only ever talks to neighbours you configured, so 179 should be reachable from those specific addresses and nowhere else - enforce that with an infrastructure ACL or control-plane policing, add TCP-MD5 or TCP-AO authentication and GTSM (ttl-security), and if this checker reports 179 open on your public IP, treat it as a finding.",
  "related": [
   22,
   443,
   51820
  ]
 },
 "389": {
  "service": "LDAP",
  "name": "Lightweight Directory Access Protocol",
  "category": "infrastructure",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "OpenLDAP (slapd)",
   "Active Directory Domain Services",
   "389 Directory Server",
   "FreeIPA",
   "Samba AD DC",
   "ApacheDS"
  ],
  "expose": "never",
  "expose_note": "A simple bind on 389 sends the username and password in cleartext unless StartTLS succeeded first, and the directory behind it is a complete list of your accounts for anyone allowed to query it - reach a domain controller over WireGuard or IPsec, or put an identity broker such as Keycloak, Authelia or Authentik in front and let applications speak OIDC or SAML over 443 instead.",
  "related": [
   636,
   445,
   3389
  ]
 },
 "443": {
  "service": "HTTPS",
  "name": "HTTP over TLS",
  "category": "web",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "nginx",
   "Apache HTTP Server",
   "Caddy",
   "HAProxy",
   "Traefik",
   "Microsoft IIS"
  ],
  "expose": "normal",
  "expose_note": "443 is designed to be public and the port itself is not the risk — what sits behind it is, so keep TLS 1.2/1.3 only with a valid certificate, and put any admin path behind real authentication rather than trusting that nobody will guess the URL.",
  "related": [
   80,
   8443,
   8080,
   22
  ]
 },
 "445": {
  "service": "SMB",
  "name": "SMB over TCP (Microsoft-DS)",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows Server service (LanmanServer)",
   "Samba smbd",
   "macOS File Sharing",
   "Synology, QNAP and TrueNAS SMB shares"
  ],
  "expose": "never",
  "expose_note": "SMB on 445 is how WannaCry and NotPetya spread (MS17-010), an inbound connection can be turned into a credential-relay attack and an outbound one leaks NetNTLM hashes to whoever owns the far share, so never forward it - run WireGuard and mount the share over the tunnel, or publish files with Nextcloud or WebDAV over HTTPS.",
  "related": [
   139,
   137,
   3389,
   51820
  ]
 },
 "465": {
  "service": "SMTPS",
  "name": "Message Submission over Implicit TLS (RFC 8314)",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Postfix",
   "Exim",
   "OpenSMTPD",
   "Microsoft Exchange",
   "Stalwart",
   "Mailcow"
  ],
  "expose": "normal",
  "expose_note": "Implicit TLS submission is designed for clients on the open internet and has no cleartext phase to strip, so exposing it is fine - just require SMTP AUTH, keep the certificate valid for the hostname clients dial, and rate-limit or fail2ban the authentication failures.",
  "related": [
   587,
   25,
   993,
   2525
  ]
 },
 "500": {
  "service": "IKE / ISAKMP",
  "name": "Internet Key Exchange (IPsec)",
  "category": "vpn",
  "proto": [
   "udp"
  ],
  "software": [
   "strongSwan",
   "Libreswan",
   "Windows Server RRAS",
   "OPNsense/pfSense IPsec",
   "Cisco ASA / IOS",
   "FortiGate",
   "MikroTik RouterOS"
  ],
  "expose": "normal",
  "expose_note": "An IPsec gateway is meant to answer on UDP 500 from the internet, but only expose it with certificate or strong pre-shared-key auth and IKEv2 - IKEv1 aggressive mode with a group PSK hands out an offline-crackable hash to anyone who asks.",
  "related": [
   4500,
   1701,
   1194,
   51820
  ]
 },
 "514": {
  "service": "Syslog",
  "name": "System Logging Protocol",
  "category": "monitoring",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "rsyslog",
   "syslog-ng",
   "Graylog",
   "Splunk",
   "Logstash",
   "Wazuh",
   "nxlog"
  ],
  "expose": "never",
  "expose_note": "Classic syslog has no authentication and no encryption, and a UDP source address is trivially forged, so an internet-reachable collector can be flooded with fabricated records that poison the exact evidence you would need after an incident - collect over a site-to-site VPN, or use syslog over TLS on 6514 (RFC 5425) with certificates on both ends.",
  "related": [
   161,
   162,
   9200
  ]
 },
 "548": {
  "service": "AFP",
  "name": "Apple Filing Protocol over TCP",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "Netatalk",
   "macOS File Sharing (legacy)",
   "Synology AFP service",
   "QNAP AFP service"
  ],
  "expose": "never",
  "expose_note": "AFP is a legacy LAN protocol with no transport encryption of the file data and a long tail of Netatalk remote-code-execution advisories, so keep 548 off the internet entirely - reach the share over WireGuard or another VPN, and on anything modern move to SMB on 445 instead.",
  "related": [
   445,
   2049,
   22,
   139
  ]
 },
 "554": {
  "service": "RTSP",
  "name": "Real Time Streaming Protocol",
  "category": "media",
  "proto": [
   "tcp"
  ],
  "software": [
   "IP cameras (Hikvision, Dahua, Amcrest, Reolink)",
   "VLC",
   "ffmpeg / ffprobe",
   "GStreamer rtspsrc",
   "go2rtc",
   "ZoneMinder",
   "Frigate",
   "Blue Iris"
  ],
  "expose": "never",
  "expose_note": "Camera RTSP stacks ship with weak or optional authentication and firmware that rarely gets patched, and exposed 554 endpoints are indexed and republished by public scanners - reach your cameras over WireGuard or Tailscale, or let an NVR pull the streams and publish only that behind a reverse proxy with real authentication.",
  "related": [
   1900,
   51820,
   443,
   3478
  ]
 },
 "587": {
  "service": "SMTP Submission",
  "name": "Message Submission for Mail (RFC 6409)",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Postfix",
   "Exim",
   "OpenSMTPD",
   "Microsoft Exchange",
   "Stalwart",
   "Mailcow"
  ],
  "expose": "caution",
  "expose_note": "Submission is meant to face the internet, but only with STARTTLS enforced and AUTH refused before TLS (smtpd_tls_security_level=encrypt and smtpd_tls_auth_only=yes in Postfix) - otherwise a stripped session leaks the password, and credential-stuffing bots will hammer this port from the hour it opens, so put fail2ban on the SASL failures.",
  "related": [
   25,
   465,
   2525,
   993
  ]
 },
 "593": {
  "service": "RPC over HTTP",
  "name": "DCE/RPC over HTTP endpoint mapper (ncacn_http)",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows RPC over HTTP Proxy (IIS)",
   "Legacy Exchange Outlook Anywhere",
   "DCOM over HTTP"
  ],
  "expose": "never",
  "expose_note": "Port 593 is the endpoint mapper again, just reached over an HTTP framing, so it carries the same pre-authentication RPC risk as 135 and gets missed by firewall rules that only block the obvious ports - block it inbound alongside 135, 137-139 and 445 and publish anything you actually need through a reverse proxy on 443.",
  "related": [
   135,
   445,
   443
  ]
 },
 "631": {
  "service": "IPP",
  "name": "Internet Printing Protocol (CUPS)",
  "category": "printing",
  "proto": [
   "tcp"
  ],
  "software": [
   "CUPS",
   "cups-browsed",
   "AirPrint and IPP Everywhere printers",
   "Windows IPP client"
  ],
  "expose": "never",
  "expose_note": "631 is a print server's administration interface as well as its print path — CUPS's web UI can add printers and run filter commands, and the 2024 <code>cups-browsed</code> chain (CVE-2024-47176 and friends) was reachable by anyone who could send it a packet — keep it on the LAN, and print remotely over a VPN.",
  "related": [
   9100,
   161,
   445,
   5000
  ]
 },
 "636": {
  "service": "LDAPS",
  "name": "LDAP over TLS",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "OpenLDAP (slapd)",
   "Active Directory Domain Services",
   "389 Directory Server",
   "FreeIPA",
   "Samba AD DC"
  ],
  "expose": "caution",
  "expose_note": "TLS solves the eavesdropping problem but not the exposure problem - a public 636 is still a login endpoint for your whole directory that bots will spray usernames and passwords at until your accounts lock out, so terminate it behind a VPN or an SSO broker, and if it genuinely must be reachable restrict it by source address and require client certificates.",
  "related": [
   389,
   443,
   445
  ]
 },
 "873": {
  "service": "rsync",
  "name": "rsync daemon protocol",
  "category": "file-sharing",
  "proto": [
   "tcp"
  ],
  "software": [
   "rsync --daemon",
   "rsyncd",
   "Synology rsync service",
   "TrueNAS rsync module"
  ],
  "expose": "caution",
  "expose_note": "Public read-only mirrors legitimately serve rsync on 873, but the daemon protocol is unencrypted and an anonymous module with no auth users line hands your whole module tree to anyone who scans it - set auth users plus a 0600 secrets file, read only = yes and hosts allow, or skip the daemon entirely and run rsync over SSH on port 22.",
  "related": [
   22,
   21,
   2049,
   445
  ]
 },
 "993": {
  "service": "IMAPS",
  "name": "IMAP over Implicit TLS",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Dovecot",
   "Cyrus IMAP",
   "Courier",
   "Zimbra",
   "Microsoft Exchange",
   "Stalwart"
  ],
  "expose": "normal",
  "expose_note": "IMAPS is designed for mail clients on the open internet and is encrypted from the first byte, so exposing it is normal - keep the certificate valid for the hostname clients dial, remember that an HTTP reverse proxy cannot carry it (nginx needs a stream block, Traefik a TCP router with TLS passthrough), and fail2ban the failed logins.",
  "related": [
   143,
   995,
   587,
   465
  ]
 },
 "995": {
  "service": "POP3S",
  "name": "POP3 over Implicit TLS",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Dovecot",
   "Courier",
   "Cyrus IMAP",
   "Zimbra",
   "Microsoft Exchange",
   "Stalwart"
  ],
  "expose": "normal",
  "expose_note": "POP3S is built for mail clients on the open internet and encrypts from the first byte, so exposing it is normal - keep the certificate valid for the exact hostname clients use, and rate-limit or fail2ban the failed logins, because this port gets password-guessing traffic continuously.",
  "related": [
   110,
   993,
   143,
   587
  ]
 },
 "1080": {
  "service": "SOCKS",
  "name": "SOCKS Proxy",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "Dante",
   "OpenSSH dynamic forwarding (ssh -D)",
   "Shadowsocks",
   "3proxy",
   "microsocks"
  ],
  "expose": "never",
  "expose_note": "An open SOCKS proxy on 1080 is found by scanners within hours and rented out to relay spam, credential stuffing and fraud that all traces back to your IP address — keep it bound to 127.0.0.1 and reach it with ssh -D 1080 user@host, or run the whole thing inside WireGuard.",
  "related": [
   3128,
   22,
   9000,
   443
  ]
 },
 "1194": {
  "service": "OpenVPN",
  "name": "OpenVPN tunnel",
  "category": "vpn",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "OpenVPN Community Edition",
   "OpenVPN Access Server",
   "PiVPN",
   "pfSense/OPNsense OpenVPN",
   "OpenVPN Connect"
  ],
  "expose": "normal",
  "expose_note": "OpenVPN is built to sit on the public internet; keep it that way by using certificates plus tls-crypt, which makes the server ignore any packet that is not already authenticated, and it will not even answer a scanner.",
  "related": [
   51820,
   500,
   4500,
   1723
  ]
 },
 "1433": {
  "service": "MS SQL Server",
  "name": "Microsoft SQL Server (TDS)",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "Microsoft SQL Server",
   "SQL Server Express",
   "Azure SQL Managed Instance",
   "SQL Server on Linux"
  ],
  "expose": "never",
  "expose_note": "An internet-facing 1433 gets continuous brute-force attempts against the sa account, and a single weak password ends in xp_cmdshell running commands as the service account - keep it on the LAN, reach it over a VPN or an SSH tunnel, and if a cloud database really must be public, restrict it with a firewall allow-list rather than exposing it to the whole internet.",
  "related": [
   3389,
   3306,
   5432,
   445
  ]
 },
 "1521": {
  "service": "Oracle DB",
  "name": "Oracle Database TNS listener",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "Oracle Database",
   "Oracle Database Express Edition",
   "tnslsnr",
   "Oracle Autonomous Database client access"
  ],
  "expose": "never",
  "expose_note": "The TNS listener answers unauthenticated service queries before anyone logs in and is a long-standing target for credential-guessing against default accounts, so keep 1521 on a private network and reach it over a VPN or an SSH tunnel rather than forwarding it.",
  "related": [
   1433,
   5432,
   3306,
   22
  ]
 },
 "1701": {
  "service": "L2TP",
  "name": "Layer 2 Tunneling Protocol",
  "category": "vpn",
  "proto": [
   "udp"
  ],
  "software": [
   "xl2tpd",
   "accel-ppp",
   "Windows Server RRAS",
   "OPNsense/pfSense L2TP",
   "MikroTik RouterOS",
   "Cisco IOS"
  ],
  "expose": "never",
  "expose_note": "L2TP has no encryption of its own, so it belongs inside IPsec - forward UDP 500 and 4500 and leave 1701 unforwarded, because a bare xl2tpd answering the internet on 1701 is carrying your PPP session in the clear.",
  "related": [
   500,
   4500,
   1723,
   51820
  ]
 },
 "1723": {
  "service": "PPTP",
  "name": "Point-to-Point Tunneling Protocol",
  "category": "vpn",
  "proto": [
   "tcp"
  ],
  "software": [
   "pptpd",
   "Windows Server RRAS (legacy)",
   "MikroTik RouterOS",
   "Cisco IOS (legacy)"
  ],
  "expose": "never",
  "expose_note": "PPTP's MS-CHAPv2 authentication was reduced to a single DES key in 2012 and can be cracked offline from a captured handshake, so anything on 1723 is a credential leak waiting to happen - move the tunnel to WireGuard or IKEv2 with certificates and close the port.",
  "related": [
   1701,
   500,
   1194,
   51820
  ]
 },
 "1812": {
  "service": "RADIUS (auth)",
  "name": "RADIUS authentication",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "FreeRADIUS",
   "Microsoft NPS",
   "Cisco ISE",
   "Aruba ClearPass",
   "PacketFence",
   "FortiAuthenticator"
  ],
  "expose": "never",
  "expose_note": "RADIUS obscures only the User-Password attribute and does it with a keyed MD5 construction that BlastRADIUS (CVE-2024-3596) showed can be attacked outright, so usernames, MAC addresses and VLAN assignments all cross in the clear - carry it inside IPsec or WireGuard between sites, or use RadSec (RADIUS over TLS on TCP 2083) if it has to leave your network at all.",
  "related": [
   1813,
   389,
   636
  ]
 },
 "1813": {
  "service": "RADIUS (accounting)",
  "name": "RADIUS accounting",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "FreeRADIUS",
   "Microsoft NPS",
   "Cisco ISE",
   "Aruba ClearPass",
   "PacketFence",
   "daloRADIUS"
  ],
  "expose": "never",
  "expose_note": "Accounting packets are a running attendance record of your network - usernames, MAC addresses, assigned IPs, session times and byte counts, protected by the same weak shared-secret scheme as authentication - so keep 1813 inside the management network, bring remote sites in over IPsec or WireGuard, and use RadSec on TCP 2083 if it must traverse anything you do not control.",
  "related": [
   1812,
   161,
   514
  ]
 },
 "1883": {
  "service": "MQTT",
  "name": "MQTT (unencrypted)",
  "category": "iot",
  "proto": [
   "tcp"
  ],
  "software": [
   "Eclipse Mosquitto",
   "EMQX",
   "HiveMQ",
   "Home Assistant MQTT integration",
   "Zigbee2MQTT",
   "Tasmota and ESPHome devices"
  ],
  "expose": "never",
  "expose_note": "MQTT on 1883 is cleartext — the username and password sit in the plain CONNECT packet, and a broker that allows anonymous clients lets anyone subscribe to <code>#</code> and watch every sensor, door lock and switch in your house, or publish commands to them — keep 1883 on the LAN, use 8883 with TLS if it must cross the internet, and prefer a VPN over either.",
  "related": [
   8883,
   1900,
   443,
   51820
  ]
 },
 "1900": {
  "service": "SSDP / UPnP",
  "name": "Simple Service Discovery Protocol",
  "category": "iot",
  "proto": [
   "udp"
  ],
  "software": [
   "miniupnpd",
   "Windows SSDP Discovery service",
   "minidlna",
   "Plex DLNA",
   "Jellyfin DLNA",
   "Sonos",
   "Chromecast",
   "smart TVs"
  ],
  "expose": "never",
  "expose_note": "SSDP is a LAN discovery protocol and a well-known reflection and amplification source, and WAN-side UPnP has been used to add port-forwards to strangers' routers - it belongs on the local subnet only, so disable UPnP on the WAN interface and never forward 1900 inward.",
  "related": [
   554,
   5000,
   51820,
   443
  ]
 },
 "2049": {
  "service": "NFS",
  "name": "Network File System",
  "category": "file-sharing",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "Linux kernel nfsd",
   "nfs-kernel-server",
   "TrueNAS",
   "Synology NFS",
   "QNAP NFS",
   "Windows Server NFS role"
  ],
  "expose": "never",
  "expose_note": "NFS authenticates with AUTH_SYS, which means it simply believes whatever UID the client claims, so anyone who reaches port 2049 can become any user on your exports - keep it on the LAN and reach it across WireGuard or another VPN, or use NFSv4 with sec=krb5p if it truly must cross untrusted networks.",
  "related": [
   111,
   445,
   548,
   22
  ]
 },
 "2375": {
  "service": "Docker API",
  "name": "Docker daemon remote API (unencrypted)",
  "category": "container",
  "proto": [
   "tcp"
  ],
  "software": [
   "dockerd",
   "Docker Engine remote API clients",
   "Portainer agent (misconfigured)"
  ],
  "expose": "never",
  "expose_note": "The Docker API has <b>no authentication whatsoever</b> and is root on the host by design — anyone who reaches 2375 can run <code>docker run -v /:/host</code> and own the machine — use <code>DOCKER_HOST=ssh://user@host</code>, which needs no open port at all, and leave the daemon on its Unix socket.",
  "related": [
   2376,
   6443,
   22,
   8006
  ]
 },
 "2376": {
  "service": "Docker API (TLS)",
  "name": "Docker daemon remote API over TLS",
  "category": "container",
  "proto": [
   "tcp"
  ],
  "software": [
   "dockerd with --tlsverify",
   "docker context / DOCKER_HOST clients",
   "Portainer",
   "CI runners"
  ],
  "expose": "caution",
  "expose_note": "This is still root on the host, so it is only defensible with <code>--tlsverify</code> plus a private CA and per-client certificates — <code>--tls</code> on its own encrypts the session while letting anybody connect — and even done properly, <code>DOCKER_HOST=ssh://user@host</code> gets you the same access with no extra port and no certificate rotation to forget.",
  "related": [
   2375,
   6443,
   22,
   8006
  ]
 },
 "2456": {
  "service": "Valheim (game)",
  "name": "Valheim dedicated server game port",
  "category": "gaming",
  "proto": [
   "udp"
  ],
  "software": [
   "valheim_server (Iron Gate)",
   "LGSM (vhserver)",
   "lloesche/valheim-server Docker image"
  ],
  "expose": "normal",
  "expose_note": "A Valheim server is meant to take public connections on UDP 2456, and the game requires a server password of at least five characters that is not part of the server name - if you would rather open nothing at all, enable crossplay and hand out the join code, which routes through PlayFab instead of your router.",
  "related": [
   2457,
   27015,
   25565
  ]
 },
 "2457": {
  "service": "Valheim (query)",
  "name": "Valheim dedicated server Steam query port",
  "category": "gaming",
  "proto": [
   "udp"
  ],
  "software": [
   "valheim_server (Iron Gate)",
   "LGSM (vhserver)",
   "lloesche/valheim-server Docker image"
  ],
  "expose": "normal",
  "expose_note": "This is a Steam A2S query listener and is meant to be public so your server appears in the Community list - it answers with the server name, map and player count and nothing else, so the only real precaution is forwarding it as UDP alongside 2456 rather than leaving it as an open hole with no server behind it.",
  "related": [
   2456,
   27015,
   25565
  ]
 },
 "2525": {
  "service": "SMTP (alternate submission)",
  "name": "Unofficial alternate SMTP submission port",
  "category": "mail",
  "proto": [
   "tcp"
  ],
  "software": [
   "Postfix",
   "Exim",
   "SendGrid",
   "Mailgun",
   "Mailjet",
   "Brevo",
   "Postmark"
  ],
  "expose": "caution",
  "expose_note": "It is an ordinary submission listener on a non-standard port, so the same rules as 587 apply - require SMTP AUTH, enforce STARTTLS before authentication, and do not assume the odd port number hides it, because scanners sweep 2525 exactly as they sweep 587.",
  "related": [
   587,
   25,
   465,
   993
  ]
 },
 "3000": {
  "service": "Node / Grafana",
  "name": "HTTP Application Port 3000",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Node.js and Express apps",
   "Next.js and Vite dev servers",
   "Grafana",
   "Gitea",
   "Metabase"
  ],
  "expose": "caution",
  "expose_note": "Grafana ships with the well-known admin/admin first login and a Vite or Next dev server on 3000 was never hardened for hostile traffic, so change default credentials and publish through a reverse proxy with TLS on 443 rather than forwarding 3000 to the internet.",
  "related": [
   8000,
   5000,
   8080,
   443
  ]
 },
 "3128": {
  "service": "Squid",
  "name": "Squid HTTP Proxy",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "Squid",
   "Proxmox VE SPICE proxy",
   "various appliance forward proxies"
  ],
  "expose": "never",
  "expose_note": "Squid's shipped configuration denies everything but the local network for a reason — an open forward proxy on 3128 is enumerated within days and abused for spam and fraud from your IP, and it will also happily proxy requests from strangers back into your own LAN — so keep http_access deny all at the end of the ACL list and reach the proxy over a VPN.",
  "related": [
   1080,
   8080,
   8006,
   443
  ]
 },
 "3306": {
  "service": "MySQL",
  "name": "MySQL / MariaDB database server",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "MySQL Server",
   "MariaDB",
   "Percona Server",
   "Amazon RDS for MySQL",
   "mysqld in Docker"
  ],
  "expose": "never",
  "expose_note": "Public 3306 draws constant automated login attempts and a leaked or reused password gives an attacker your whole dataset in one connection - bind mysqld to 127.0.0.1 or a private address, connect application servers over the private network, and use ssh -L 3306:127.0.0.1:3306 user@host when you need a GUI client from outside.",
  "related": [
   5432,
   6379,
   22,
   1433
  ]
 },
 "3389": {
  "service": "RDP",
  "name": "Remote Desktop Protocol",
  "category": "remote-access",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "Windows Remote Desktop Services",
   "xrdp",
   "FreeRDP server",
   "Windows Admin Center hosts"
  ],
  "expose": "never",
  "expose_note": "Internet-facing RDP is the most common initial-access route for ransomware crews, who credential-stuff it around the clock; put it behind WireGuard, Tailscale or an RD Gateway that terminates TLS on 443 with MFA, and forward 3389 to nothing.",
  "related": [
   22,
   5900,
   5985,
   445
  ]
 },
 "3478": {
  "service": "STUN / TURN",
  "name": "STUN and TURN NAT traversal",
  "category": "media",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "coturn",
   "Jitsi Meet",
   "Nextcloud Talk",
   "Matrix / Element calls",
   "eturnal",
   "Pion TURN"
  ],
  "expose": "caution",
  "expose_note": "A TURN server has to be reachable to be useful, but an unauthenticated one is an open relay that strangers will use as a proxy - always run coturn with credentials (lt-cred-mech or a static auth secret) and deny relaying to RFC 1918 ranges with no-multicast-peers and denied-peer-ip.",
  "related": [
   5060,
   5061,
   443,
   51820
  ]
 },
 "4500": {
  "service": "IPsec NAT-T",
  "name": "IPsec NAT Traversal (UDP-encapsulated ESP)",
  "category": "vpn",
  "proto": [
   "udp"
  ],
  "software": [
   "strongSwan",
   "Libreswan",
   "Windows Server RRAS",
   "OPNsense/pfSense IPsec",
   "Cisco ASA / IOS",
   "FortiGate",
   "Apple IKEv2 client"
  ],
  "expose": "normal",
  "expose_note": "This is the port a remote-access IPsec VPN is supposed to answer on, so exposing it is fine - just pair it with UDP 500, keep the IKE daemon patched, and use certificates or per-user EAP rather than one shared PSK for the whole company.",
  "related": [
   500,
   1701,
   1194,
   51820
  ]
 },
 "5000": {
  "service": "Flask / AirPlay",
  "name": "HTTP Application Port 5000",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Flask development server",
   "ASP.NET Core Kestrel",
   "Docker Registry",
   "Synology DSM (HTTP)",
   "macOS AirPlay Receiver"
  ],
  "expose": "caution",
  "expose_note": "The usual occupants are a Flask dev server or a private Docker registry, and a registry with no authentication lets a stranger push images you will later run — bind it to 127.0.0.1 and publish through nginx on 443 with TLS and authentication instead of forwarding 5000.",
  "related": [
   3000,
   8000,
   8080,
   443
  ]
 },
 "5055": {
  "service": "Overseerr / Jellyseerr",
  "name": "Overseerr media request portal",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Overseerr",
   "Jellyseerr"
  ],
  "expose": "caution",
  "expose_note": "Overseerr is genuinely designed for other people to sign in to, but it speaks plain HTTP on 5055 with no TLS of its own, so publish it through a reverse proxy on 443 with a real certificate rather than forwarding 5055 — otherwise every Plex or Jellyfin login your friends type crosses the internet in the clear.",
  "related": [
   8989,
   7878,
   443,
   9117
  ]
 },
 "5060": {
  "service": "SIP",
  "name": "Session Initiation Protocol (unencrypted)",
  "category": "media",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "Asterisk",
   "FreePBX",
   "FreeSWITCH",
   "Kamailio",
   "OpenSIPS",
   "3CX",
   "Yealink/Polycom desk phones"
  ],
  "expose": "caution",
  "expose_note": "A PBX on 5060 starts receiving scripted REGISTER and INVITE floods within minutes of going live and toll fraud is the payoff, so restrict the port to your SIP trunk provider's addresses, run fail2ban against the SIP log, never let an extension's password match its number, and prefer TLS on 5061 for anything roaming.",
  "related": [
   5061,
   3478,
   554,
   443
  ]
 },
 "5061": {
  "service": "SIP-TLS",
  "name": "SIP over TLS (secure signalling)",
  "category": "media",
  "proto": [
   "tcp"
  ],
  "software": [
   "Asterisk (pjsip transport-tls)",
   "FreePBX",
   "FreeSWITCH",
   "Kamailio",
   "3CX",
   "Cisco Unified CM",
   "session border controllers"
  ],
  "expose": "normal",
  "expose_note": "5061 is the port to expose if you must expose SIP at all - it encrypts the signalling and the SRTP keys inside the SDP - but TLS authenticates the server, not the caller, so keep strong per-extension secrets and rate limiting behind it.",
  "related": [
   5060,
   3478,
   443,
   554
  ]
 },
 "5353": {
  "service": "mDNS",
  "name": "Multicast DNS (Bonjour / Avahi)",
  "category": "infrastructure",
  "proto": [
   "udp"
  ],
  "software": [
   "avahi-daemon",
   "Apple Bonjour (mDNSResponder)",
   "systemd-resolved",
   "Home Assistant",
   "Chromecast",
   "AirPrint printers"
  ],
  "expose": "never",
  "expose_note": "mDNS is scoped to the local link by design - queries go to the all-mDNS-responders group <code>224.0.0.251</code>, which routers do not forward - so a 5353 reachable from the internet means something is badly misconfigured: it hands over your hostnames, device models and full service inventory and is a known amplification reflector, and the right way to cross subnets is an mDNS reflector or repeater, with WireGuard or Tailscale for remote access.",
  "related": [
   1900,
   5000,
   53
  ]
 },
 "5432": {
  "service": "PostgreSQL",
  "name": "PostgreSQL database server",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "PostgreSQL",
   "PgBouncer (commonly 6432)",
   "TimescaleDB",
   "Amazon RDS for PostgreSQL",
   "postgres in Docker"
  ],
  "expose": "never",
  "expose_note": "Exposed PostgreSQL means unlimited offline-speed password guessing against your roles and, on a bad day, a superuser login that can read and write files on the host - keep listen_addresses on a private interface, restrict pg_hba.conf to the subnets that need it, and use ssh -L 5432:127.0.0.1:5432 user@host for admin access.",
  "related": [
   3306,
   6379,
   22,
   27017
  ]
 },
 "5900": {
  "service": "VNC",
  "name": "Virtual Network Computing (RFB)",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "RealVNC",
   "TigerVNC",
   "TightVNC",
   "UltraVNC",
   "x11vnc",
   "macOS Screen Sharing"
  ],
  "expose": "never",
  "expose_note": "Classic VNC authentication is a DES challenge over a password silently truncated to eight characters, plenty of servers are configured with no password at all, and the session itself is unencrypted - tunnel it instead with ssh -L 5901:localhost:5900 user@host and point the viewer at localhost:5901, or run it over WireGuard.",
  "related": [
   3389,
   22,
   5985
  ]
 },
 "5985": {
  "service": "WinRM (HTTP)",
  "name": "Windows Remote Management over HTTP",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows Remote Management (WinRM)",
   "PowerShell Remoting",
   "Ansible (winrm connection)",
   "PowerShell DSC"
  ],
  "expose": "never",
  "expose_note": "WinRM is a remote code execution service - anyone who authenticates gets a shell with the rights of that account - and the HTTP listener relies on the authentication layer rather than TLS for confidentiality, so keep 5985 on the management LAN or inside a WireGuard tunnel and never forward it from the router.",
  "related": [
   5986,
   3389,
   135,
   445
  ]
 },
 "5986": {
  "service": "WinRM (HTTPS)",
  "name": "Windows Remote Management over HTTPS",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "Windows Remote Management (WinRM)",
   "PowerShell Remoting",
   "Ansible (winrm connection)",
   "Packer WinRM communicator"
  ],
  "expose": "never",
  "expose_note": "TLS fixes the transport but not the exposure - 5986 still hands a remote shell to anyone who guesses a password, so keep it on the management network or behind a VPN and treat the certificate as a way to protect credentials from the LAN, not a licence to publish the port.",
  "related": [
   5985,
   3389,
   443
  ]
 },
 "6379": {
  "service": "Redis",
  "name": "Redis in-memory data store",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "Redis",
   "Valkey",
   "KeyDB",
   "Redis Stack",
   "redis in Docker"
  ],
  "expose": "never",
  "expose_note": "Redis has no password by default and an unauthenticated instance is a remote-code-execution primitive, because CONFIG SET lets an attacker rewrite the dump file to drop an SSH key or a cron entry - bind it to 127.0.0.1 or a WireGuard address, set requirepass or ACLs, and never map it to a public interface.",
  "related": [
   11211,
   27017,
   5432,
   22
  ]
 },
 "6443": {
  "service": "Kubernetes API",
  "name": "Kubernetes API server (kube-apiserver)",
  "category": "container",
  "proto": [
   "tcp"
  ],
  "software": [
   "kube-apiserver",
   "k3s",
   "RKE2",
   "kubeadm clusters",
   "kubectl"
  ],
  "expose": "caution",
  "expose_note": "Unlike the Docker API this endpoint does authenticate — TLS with client certificates, tokens or OIDC, and anonymous requests get almost nothing — but a kubeconfig client certificate cannot be revoked in vanilla Kubernetes, so publish 6443 only behind a source-address restriction or a VPN, and never expose the kubelet on 10250 alongside it.",
  "related": [
   2375,
   2376,
   8006,
   443
  ]
 },
 "6881": {
  "service": "BitTorrent",
  "name": "BitTorrent peer / DHT port",
  "category": "file-sharing",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "qBittorrent",
   "Deluge",
   "µTorrent",
   "libtorrent-based clients",
   "the original BitTorrent client"
  ],
  "expose": "normal",
  "expose_note": "A peer port is meant to accept inbound connections and there is no administration interface behind it, so forwarding 6881 is safe in itself — the practical argument against it is that 6881-6889 is the range ISP shapers and corporate firewalls single out, which is exactly why modern clients randomise instead.",
  "related": [
   51413,
   9091,
   1080,
   9117
  ]
 },
 "7777": {
  "service": "Terraria / Unreal game servers",
  "name": "Terraria, ARK and Unreal Engine dedicated server port",
  "category": "gaming",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "Terraria dedicated server",
   "tModLoader",
   "ARK: Survival Evolved / Ascended",
   "Satisfactory dedicated server",
   "Unreal Engine dedicated servers",
   "open.mp / SA-MP"
  ],
  "expose": "normal",
  "expose_note": "Game servers on 7777 are meant to accept public connections, so forwarding it is fine - just forward the right protocol for your game (Terraria is TCP, ARK and Unreal are UDP), set a server password where the game offers one, and do not leave an unrelated admin service parked on this port because it is a heavily scanned number.",
  "related": [
   27015,
   28015,
   25565
  ]
 },
 "7878": {
  "service": "Radarr",
  "name": "Radarr web interface",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Radarr"
  ],
  "expose": "caution",
  "expose_note": "Radarr's API key is a full-access credential and its connection settings can run scripts on the host, so reach it over WireGuard or put it behind a reverse proxy on 443 that does its own authentication — a plain port-forward of 7878 hands an admin panel to the internet.",
  "related": [
   8989,
   9117,
   5055,
   9091
  ]
 },
 "8000": {
  "service": "HTTP dev",
  "name": "HTTP Development Server",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Django runserver",
   "python3 -m http.server",
   "Uvicorn / FastAPI",
   "PHP built-in server",
   "Portainer Edge agent tunnel"
  ],
  "expose": "caution",
  "expose_note": "Almost everything that listens on 8000 is a development server — python3 -m http.server serves your entire working directory to anyone who connects, and Django's runserver is single-threaded and explicitly not for production — so serve the app through gunicorn or uvicorn behind nginx on 443 and leave 8000 unforwarded.",
  "related": [
   3000,
   5000,
   8080,
   80
  ]
 },
 "8006": {
  "service": "Proxmox VE",
  "name": "Proxmox VE Web Interface",
  "category": "infrastructure",
  "proto": [
   "tcp"
  ],
  "software": [
   "Proxmox VE (pveproxy)"
  ],
  "expose": "never",
  "expose_note": "8006 is the pveproxy administration UI where root@pam logs in and gets console access to every VM and container on the host — put it behind WireGuard, never a port-forward, and terminate remote access at the VPN rather than at pveproxy.",
  "related": [
   10000,
   8443,
   22,
   3128
  ]
 },
 "8080": {
  "service": "HTTP-alt",
  "name": "HTTP Alternate",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Apache Tomcat",
   "Jenkins",
   "Jetty",
   "Traefik dashboard",
   "Node.js applications",
   "published Docker containers"
  ],
  "expose": "caution",
  "expose_note": "Nothing about 8080 is safer than 80 — it is simply unprivileged, and what lands on it (a Tomcat manager, a Jenkins controller, a container's default UI) usually has weaker authentication than a real web server, so terminate TLS on 443 with a reverse proxy in front of it instead of forwarding 8080 straight through.",
  "related": [
   80,
   443,
   8443,
   8000
  ]
 },
 "8096": {
  "service": "Jellyfin / Emby",
  "name": "Jellyfin and Emby HTTP interface",
  "category": "media",
  "proto": [
   "tcp"
  ],
  "software": [
   "Jellyfin",
   "Emby Server",
   "jellyfin/jellyfin Docker image",
   "Jellyfin on Synology / unRAID"
  ],
  "expose": "caution",
  "expose_note": "8096 is plain HTTP, so forwarding it sends every login and session token across the internet in cleartext - put Jellyfin behind a reverse proxy that terminates TLS on 443 (setting the known-proxy entry so bans and logs see the real client IP), or reach it over WireGuard and leave 8096 on the LAN.",
  "related": [
   8920,
   32400,
   443,
   8989
  ]
 },
 "8123": {
  "service": "Home Assistant",
  "name": "Home Assistant web interface",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Home Assistant OS / Supervised",
   "Home Assistant Container",
   "Home Assistant Core",
   "ClickHouse (HTTP interface, same port)"
  ],
  "expose": "caution",
  "expose_note": "Port 8123 is plain HTTP and the login behind it controls your locks, cameras and alarm, so never forward it raw - reach it over WireGuard or Tailscale, use Nabu Casa Cloud, or put it behind a reverse proxy with TLS and set use_x_forwarded_for with trusted_proxies so brute-force bans see the real client IP.",
  "related": [
   51820,
   443,
   8096,
   1900
  ]
 },
 "8443": {
  "service": "HTTPS-alt",
  "name": "HTTPS Alternate",
  "category": "web",
  "proto": [
   "tcp"
  ],
  "software": [
   "Apache Tomcat (TLS connector)",
   "UniFi Network Application",
   "Plesk",
   "OPNsense and pfSense web GUI when moved off 443",
   "Kubernetes ingress controllers"
  ],
  "expose": "caution",
  "expose_note": "8443 is almost always an appliance or application admin UI, usually with a self-signed certificate that trains you to click through browser warnings — front it with a reverse proxy on 443 that authenticates first, or leave it on the LAN and reach it over WireGuard.",
  "related": [
   443,
   8080,
   8006,
   10000
  ]
 },
 "8883": {
  "service": "MQTTS",
  "name": "MQTT over TLS",
  "category": "iot",
  "proto": [
   "tcp"
  ],
  "software": [
   "Eclipse Mosquitto",
   "EMQX",
   "HiveMQ",
   "AWS IoT Core",
   "ESPHome and Tasmota with TLS enabled"
  ],
  "expose": "caution",
  "expose_note": "8883 is the right port to publish if a broker must be reachable from outside, but only with <code>allow_anonymous false</code>, a real certificate and ideally client certificates — TLS protects the credentials in transit and does nothing at all about a broker that lets anyone subscribe to <code>#</code>.",
  "related": [
   1883,
   443,
   8443,
   51820
  ]
 },
 "8920": {
  "service": "Jellyfin / Emby (HTTPS)",
  "name": "Jellyfin and Emby HTTPS interface",
  "category": "media",
  "proto": [
   "tcp"
  ],
  "software": [
   "Jellyfin",
   "Emby Server",
   "jellyfin/jellyfin Docker image"
  ],
  "expose": "caution",
  "expose_note": "8920 is at least encrypted, but it depends on a certificate you load and renew by hand inside Jellyfin, and a lapsed or self-signed one trains everyone in the house to click through browser warnings - terminate TLS at a reverse proxy on 443 instead and keep both 8096 and 8920 on the LAN.",
  "related": [
   8096,
   32400,
   443
  ]
 },
 "8989": {
  "service": "Sonarr",
  "name": "Sonarr web interface",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Sonarr"
  ],
  "expose": "caution",
  "expose_note": "Sonarr v4 requires a login, but its API key is a full-access credential that travels in a query string and its custom scripts run commands as the Sonarr user — if it must be reachable from outside, put it behind a reverse proxy on 443 with TLS and its own authentication, never a bare port-forward of 8989.",
  "related": [
   7878,
   9117,
   5055,
   9091
  ]
 },
 "9000": {
  "service": "PHP-FPM / Portainer",
  "name": "Application Port 9000",
  "category": "container",
  "proto": [
   "tcp"
  ],
  "software": [
   "PHP-FPM (FastCGI)",
   "Portainer",
   "MinIO (S3 API)",
   "SonarQube"
  ],
  "expose": "never",
  "expose_note": "If PHP-FPM is the listener, an open 9000 is unauthenticated remote code execution — the FastCGI protocol has no login at all — and Portainer on 9000 is the Docker daemon with a web front end, so bind FPM to 127.0.0.1 or a unix socket and reach Portainer, MinIO or SonarQube over WireGuard or a proxy that authenticates first.",
  "related": [
   8000,
   3000,
   8080,
   443
  ]
 },
 "9090": {
  "service": "Prometheus / Cockpit",
  "name": "Prometheus web UI and Cockpit web console",
  "category": "monitoring",
  "proto": [
   "tcp"
  ],
  "software": [
   "Prometheus",
   "Cockpit",
   "Openfire admin console"
  ],
  "expose": "never",
  "expose_note": "Prometheus ships with <b>no authentication at all</b> — its query API hands over your whole infrastructure inventory, and <code>--web.enable-admin-api</code> lets a stranger delete time series — while Cockpit on the same port is a root login form for the host, so bind Prometheus to localhost or a private address, put a reverse proxy with auth in front, and reach either over WireGuard.",
  "related": [
   9100,
   19999,
   3000,
   9200
  ]
 },
 "9091": {
  "service": "Transmission RPC",
  "name": "Transmission Web UI / RPC",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Transmission (transmission-daemon web UI)",
   "transmission-remote",
   "Prometheus Pushgateway"
  ],
  "expose": "never",
  "expose_note": "Transmission's RPC ships with no password (<code>rpc-authentication-required</code> false, whitelisted to loopback) and it can set <code>script-torrent-done-filename</code>, so anyone who reaches 9091 can run commands as the daemon user — leave it bound to 127.0.0.1 and reach it over WireGuard or <code>ssh -L 9091:127.0.0.1:9091 user@host</code>.",
  "related": [
   51413,
   6881,
   8989,
   9117
  ]
 },
 "9100": {
  "service": "JetDirect / node_exporter",
  "name": "Raw printing (JetDirect) and Prometheus node_exporter",
  "category": "printing",
  "proto": [
   "tcp"
  ],
  "software": [
   "HP JetDirect and most network printers",
   "CUPS socket:// backend",
   "Prometheus node_exporter"
  ],
  "expose": "never",
  "expose_note": "Two very different services share this number and neither has any authentication: raw 9100 accepts any byte stream as a print job (and PJL commands that change the panel message or settings), while node_exporter publishes your hostname, kernel version, filesystems, uptime and network counters to anyone who asks — bind node_exporter to a private address or localhost and scrape it over WireGuard, and never forward a printer.",
  "related": [
   631,
   9090,
   161,
   19999
  ]
 },
 "9117": {
  "service": "Jackett",
  "name": "Jackett indexer proxy",
  "category": "self-hosted",
  "proto": [
   "tcp"
  ],
  "software": [
   "Jackett"
  ],
  "expose": "never",
  "expose_note": "Jackett has <b>no admin password set by default</b> and its whole job is to store your tracker logins, cookies and API keys and to fetch URLs on your behalf, so an exposed 9117 hands over every private-tracker credential you own — bind it to localhost or a Docker network, and reach it over WireGuard if you need it remotely.",
  "related": [
   8989,
   7878,
   9091,
   5055
  ]
 },
 "9200": {
  "service": "Elasticsearch",
  "name": "Elasticsearch / OpenSearch HTTP API",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "Elasticsearch",
   "OpenSearch",
   "Kibana backend connections",
   "Logstash and Beats outputs"
  ],
  "expose": "never",
  "expose_note": "Port 9200 is a full read-write REST API over your whole index set, and open clusters have been mass-deleted by automated sweeps - bind it to 127.0.0.1 or a private address, keep the built-in security features and TLS on, and put a reverse proxy with authentication in front of anything a browser needs to reach.",
  "related": [
   27017,
   6379,
   11211,
   443
  ]
 },
 "10000": {
  "service": "Webmin",
  "name": "Webmin / NDMP",
  "category": "remote-access",
  "proto": [
   "tcp"
  ],
  "software": [
   "Webmin",
   "Virtualmin",
   "NDMP backup agents"
  ],
  "expose": "never",
  "expose_note": "Webmin on 10000 is a root shell behind a login form — it was distributed with a backdoored release once (CVE-2019-15107) and has had further remote code execution bugs since — so bind it to the LAN in miniserv.conf and reach it over WireGuard rather than forwarding 10000.",
  "related": [
   8006,
   22,
   443,
   9000
  ]
 },
 "11211": {
  "service": "Memcached",
  "name": "Memcached distributed memory cache",
  "category": "database",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "memcached",
   "memcached in Docker",
   "AWS ElastiCache for Memcached",
   "PHP memcached extension backends"
  ],
  "expose": "never",
  "expose_note": "Memcached has no authentication in its normal configuration and its UDP interface was the vehicle for the record-breaking 2018 amplification attacks - bind it to 127.0.0.1 or a private address with -l, disable UDP with -U 0, and keep it on the same private network as the application that uses it.",
  "related": [
   6379,
   27017,
   9200,
   3306
  ]
 },
 "19132": {
  "service": "Minecraft (Bedrock)",
  "name": "Minecraft: Bedrock Edition server",
  "category": "gaming",
  "proto": [
   "udp"
  ],
  "software": [
   "Bedrock Dedicated Server (bedrock_server)",
   "PocketMine-MP",
   "Nukkit",
   "GeyserMC",
   "Minecraft Realms clients"
  ],
  "expose": "normal",
  "expose_note": "Bedrock servers are built to take connections from the internet, so forwarding UDP 19132 is expected - use allowlist.json to control who gets in, keep online-mode=true so Xbox Live authentication is enforced, and expect scanners to find the port within a day of opening it.",
  "related": [
   25565,
   34197,
   27015
  ]
 },
 "19999": {
  "service": "Netdata",
  "name": "Netdata monitoring dashboard",
  "category": "monitoring",
  "proto": [
   "tcp"
  ],
  "software": [
   "Netdata Agent"
  ],
  "expose": "never",
  "expose_note": "The Netdata agent dashboard has <b>no login</b> — it publishes per-second detail on every process, container, disk, user session and network connection on the host, which is reconnaissance served on a plate — bind it with <code>bind to = 127.0.0.1</code> in <code>netdata.conf</code> and reach it over WireGuard or an SSH tunnel.",
  "related": [
   9090,
   9100,
   3000,
   8006
  ]
 },
 "25565": {
  "service": "Minecraft (Java)",
  "name": "Minecraft: Java Edition server",
  "category": "gaming",
  "proto": [
   "tcp"
  ],
  "software": [
   "Vanilla server.jar (Mojang)",
   "PaperMC",
   "Spigot",
   "Purpur",
   "Fabric server",
   "Forge server",
   "Pterodactyl / Crafty panels"
  ],
  "expose": "normal",
  "expose_note": "A Minecraft server is meant to accept connections from the internet, so forwarding TCP 25565 is normal - keep online-mode=true so Mojang authentication is enforced, run a whitelist if the server is for friends only, and never forward RCON on 25575 alongside it.",
  "related": [
   19132,
   34197,
   7777
  ]
 },
 "27015": {
  "service": "Source Dedicated Server",
  "name": "Valve Source engine game and query port",
  "category": "gaming",
  "proto": [
   "udp",
   "tcp"
  ],
  "software": [
   "srcds / Counter-Strike 2",
   "Counter-Strike: Global Offensive",
   "Team Fortress 2",
   "Garry's Mod",
   "Left 4 Dead 2",
   "ARK: Survival (query port)"
  ],
  "expose": "normal",
  "expose_note": "The UDP side is meant to face the internet, but the TCP side of 27015 is Source RCON, whose password crosses the wire in cleartext - leave rcon_password unset unless you need it, and if you do, forward only UDP 27015 and restrict TCP 27015 to your own admin address.",
  "related": [
   28015,
   7777,
   25565,
   2456
  ]
 },
 "27017": {
  "service": "MongoDB",
  "name": "MongoDB database server",
  "category": "database",
  "proto": [
   "tcp"
  ],
  "software": [
   "MongoDB Community Server",
   "MongoDB Enterprise",
   "mongos router",
   "Percona Server for MongoDB",
   "mongo in Docker"
  ],
  "expose": "never",
  "expose_note": "MongoDB does not enable access control unless you turn it on, and open instances have been mass-wiped and held to ransom repeatedly - bind it to 127.0.0.1 or a private address, set security.authorization to enabled with a real admin user, and reach it over a VPN or an SSH tunnel rather than forwarding 27017.",
  "related": [
   6379,
   9200,
   5432,
   22
  ]
 },
 "28015": {
  "service": "Rust (game)",
  "name": "Rust dedicated server game port",
  "category": "gaming",
  "proto": [
   "udp"
  ],
  "software": [
   "RustDedicated",
   "LGSM (rustserver)",
   "Oxide / uMod",
   "Carbon"
  ],
  "expose": "normal",
  "expose_note": "UDP 28015 is meant to be public, but the ports beside it are not - keep RCON on 28016 behind a firewall or a VPN because Rust's WebSocket RCON authenticates with a single password, and do not forward the Rust+ companion port unless you actually use the app.",
  "related": [
   27015,
   7777,
   25565
  ]
 },
 "32400": {
  "service": "Plex",
  "name": "Plex Media Server",
  "category": "media",
  "proto": [
   "tcp"
  ],
  "software": [
   "Plex Media Server",
   "plexmediaserver Docker image",
   "Plex on Synology / QNAP / unRAID"
  ],
  "expose": "normal",
  "expose_note": "Plex is built for remote access - the connection is TLS-wrapped with a plex.direct certificate and authenticated against your plex.tv account - so forwarding TCP 32400 is the intended design; leave 'Allow insecure connections' set to Never, keep the server updated, and do not forward the extra Plex UDP ports, which have been abused for DDoS reflection.",
  "related": [
   8096,
   8920,
   1900
  ]
 },
 "34197": {
  "service": "Factorio",
  "name": "Factorio multiplayer / headless server port",
  "category": "gaming",
  "proto": [
   "udp"
  ],
  "software": [
   "factorio-headless",
   "Factorio client (hosted game)",
   "factoriotools/factorio Docker image",
   "LGSM (fctrserver)"
  ],
  "expose": "normal",
  "expose_note": "Factorio's multiplayer port is designed to be public and the server can require a game password, so forwarding UDP 34197 is normal - keep RCON on its own port off the internet, and remember that a server published to the public list is announcing your IP address to everyone browsing it.",
  "related": [
   25565,
   2456,
   27015
  ]
 },
 "51413": {
  "service": "Transmission (peer)",
  "name": "Transmission BitTorrent peer port",
  "category": "file-sharing",
  "proto": [
   "tcp",
   "udp"
  ],
  "software": [
   "Transmission",
   "transmission-daemon"
  ],
  "expose": "normal",
  "expose_note": "This is a peer-listening port with no management interface behind it — forwarding TCP and UDP 51413 to the machine running Transmission is the intended configuration and is what turns a \"connectable\" client into one that accepts incoming peers; just do not confuse it with the RPC port 9091, which should never be forwarded.",
  "related": [
   9091,
   6881,
   51820,
   1080
  ]
 },
 "51820": {
  "service": "WireGuard",
  "name": "WireGuard VPN",
  "category": "vpn",
  "proto": [
   "udp"
  ],
  "software": [
   "wg-quick / wireguard-tools",
   "PiVPN",
   "wg-easy",
   "OPNsense/pfSense WireGuard",
   "MikroTik RouterOS",
   "Netmaker",
   "Firezone"
  ],
  "expose": "normal",
  "expose_note": "WireGuard is designed to face the internet: it only answers a correctly keyed handshake, so an unauthenticated scanner gets nothing back at all - just keep peer public keys tight and give each device its own key rather than sharing one config around.",
  "related": [
   1194,
   500,
   4500,
   22
  ]
 }
};
