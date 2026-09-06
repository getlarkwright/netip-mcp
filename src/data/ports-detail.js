// Generated from whatismynetip.com's hand-written port pages — keep in step with the site.
export default {
 "20": {
  "intro": "Port 20 is the active-mode data channel of FTP, and it behaves unlike almost every other port on this site: in a normal FTP setup nothing listens on it . The server listens on port 21 for commands. When a client in active mode sends a PORT command, the server originates a connection from its own TCP port 20 to a port the client nominated. Port 20 is a source port, not a listening socket. That single fact explains the result most people come here to understand. If this checker reports port 20 as closed / filtered on your IP, that is the expected answer even on a perfectly healthy FTP server. There is no SYN-ACK to be had because no process is bound there. Confirm it on the server itself: ss -tlnp | grep -E ':(20|21)\\b' - a working FTP daemon shows a listener on :21 and none on :20 . nc -zv your.public.ip 21 from outside, then nc your.public.ip 21 to read the 220 greeting banner. If 21 answers, FTP is reachable and port 20 was never the problem. Almost nobody uses active mode any more. It requires the server to open an inbound connection to the client, which every NAT router and client firewall built in the last twenty years drops. Modern clients default to passive mode ( PASV / EPSV ), where the server opens a second listening socket on a high port and tells the client where to connect. Port 20 is not used at all in passive transfers. So when a directory listing hangs or a transfer stalls at 0 bytes after a successful login, the fix is not port 20. It is the passive port range . Pin it in the daemon config and forward exactly that range: vsftpd: pasv_min_port=40000 , pasv_max_port=40100 , plus pasv_address set to your public IP when the server sits behind NAT. ProFTPD: PassivePorts 40000 40100 and MasqueradeAddress . Then sudo ufw allow 40000:40100/tcp and a matching port-forward range on the router. If you genuinely need active mode across NAT, the Linux connection-tracking helper nf_conntrack_ftp rewrites the address inside the PORT command - but it cannot work on FTPS, because the control channel is encrypted and the helper cannot read it. That is the usual reason \"FTP worked until I turned on TLS\".",
  "faq": [
   {
    "q": "Why does port 20 show as closed when my FTP server is running?",
    "a": "Because nothing listens on port 20. The FTP server listens on port 21; port 20 is only used as the source port when the server opens an active-mode data connection back to a client. A closed result on port 20 is normal and says nothing about whether your FTP server is working - test port 21 instead."
   },
   {
    "q": "What is the difference between port 20 and port 21?",
    "a": "Port 21 is the control channel: it carries the login, the commands and the responses, and it is the only port an FTP server actually listens on. Port 20 is the data channel used by active mode, and the server originates those connections rather than accepting them. File contents and directory listings travel on the data channel, commands on the control channel."
   },
   {
    "q": "Do I need to forward port 20 for FTP to work?",
    "a": "No. Forward port 21 and the passive port range you configured in the FTP daemon, such as 40000-40100. Port 20 only matters for active mode, which requires the server to connect inbound to the client and is blocked by nearly every home router, so passive mode is what clients use by default."
   },
   {
    "q": "Is data on port 20 encrypted?",
    "a": "No. Plain FTP sends both commands and file contents in cleartext, including the password on port 21. FTPS adds TLS to both channels, and SFTP over SSH on port 22 is a different protocol entirely that encrypts everything over a single connection - it is the simpler choice for anything crossing the internet."
   }
  ]
 },
 "21": {
  "intro": "TCP port 21 is the FTP control channel - the socket your FTP daemon actually listens on. vsftpd , ProFTPD , Pure-FTPd , FileZilla Server, the IIS FTP role and the FTP service on most NAS boxes all bind here. Everything you type in a client ( USER , PASS , LIST , RETR ) travels on this connection; the file bytes travel on a separate data connection. An OPEN result here means the whole path works: your ISP is not filtering, the router forward reaches the right internal host, no host firewall is dropping the SYN, and the daemon is bound to a routable address. Prove the last one with ss -tlnp | grep :21 - you want 0.0.0.0:21 or your LAN address, not 127.0.0.1:21 . A raw nc your.public.ip 21 should print a 220 banner. CLOSED / filtered means the SYN never got an answer. Work down this list: Daemon down or bound to loopback - systemctl status vsftpd , then the listen_address / Bind directive. Host firewall - sudo ufw status , then sudo ufw allow 21/tcp . On Windows: netsh advfirewall firewall add rule name=\"FTP\" dir=in action=allow protocol=TCP localport=21 . Router forward pointing at an old DHCP lease. Give the FTP host a reservation. Carrier-grade NAT, in which case no forward will ever work and you need a tunnel or a real public IP. The far more common complaint is the opposite: port 21 reads OPEN, the client logs in, and then the directory listing times out . That is never port 21. FTP opens a second connection for data, and in passive mode the server picks a high port and tells the client to connect there. If that range is not forwarded, the login succeeds and everything after it hangs. Fix it in two places: Pin the range - vsftpd: pasv_min_port=40000 and pasv_max_port=40100 ; ProFTPD: PassivePorts 40000 40100 . Tell the server its public address, or it will advertise a private one the client cannot reach - vsftpd pasv_address , ProFTPD MasqueradeAddress . Forward 40000-40100/tcp on the router and allow it in the host firewall. Finally, know what you are exposing. Plain FTP puts the password on the wire in cleartext. Turn on explicit FTPS ( AUTH TLS , still on port 21) with ssl_enable=YES and force_local_logins_ssl=YES , disable anonymous writes, and chroot users to their home directory.",
  "faq": [
   {
    "q": "Why can I log in to FTP but not list files?",
    "a": "The control connection on port 21 works and the passive data connection does not. In passive mode the server hands the client a second, high-numbered port to connect to, so you must pin the passive range in the FTP daemon config and forward that same range on your router. If the server is behind NAT you also have to set pasv_address or MasqueradeAddress, otherwise it advertises a private address the client cannot reach."
   },
   {
    "q": "What ports do I need to forward for an FTP server?",
    "a": "Port 21 for the control channel, plus the passive data range you configured - a block such as 40000-40100/tcp is typical. Port 20 is only used by active mode, where the server connects out to the client, and does not need forwarding. Forward the range as TCP to the same internal host as port 21."
   },
   {
    "q": "Is it safe to open port 21 to the internet?",
    "a": "Plain FTP is not safe: usernames, passwords and file contents cross the network in cleartext and the port attracts constant credential-stuffing. If you must publish it, require explicit FTPS so the session is wrapped in TLS, disable anonymous write access, and chroot accounts to their own directories. For your own transfers, SFTP over SSH on port 22 is simpler and encrypted by default."
   },
   {
    "q": "What is the difference between FTP on port 21 and SFTP on port 22?",
    "a": "They share almost nothing but a name. FTP on port 21 is a cleartext protocol that uses a second connection for data. SFTP is a subsystem of SSH running over the single encrypted connection on port 22, so it needs one port, one firewall rule and no passive range. FTPS is a third thing: FTP with TLS bolted on, usually still on port 21."
   }
  ]
 },
 "22": {
  "intro": "Port 22/TCP is SSH , the Secure Shell remote login protocol. What listens there is almost always OpenSSH's sshd ; on routers, NAS boxes and OpenWrt it is usually dropbear . SFTP and scp are subsystems of the same daemon on the same port, so if 22 answers, file transfer works too - there is no second port to forward. Most people run this check after ssh: connect to host ... port 22: Connection timed out from outside the house, when the same command works fine on the LAN. That difference is the whole diagnosis: the LAN path never touches your router's WAN rules, so it proves nothing about them. This check comes back the other way, from our probe server to the public IP you are browsing from, which is the path a real remote login takes. OPEN here means the TCP handshake to 22 completed - the forward is live and something is speaking on the other side. Confirm it is really SSH with nc -zv or by watching for the banner ( SSH-2.0-OpenSSH_9.6p1 ). It also means every scanner on the internet can see it; expect failed-login noise in /var/log/auth.log or journalctl -u ssh within minutes. CLOSED / filtered means the SYN never reached a listener. When it reads closed and you are sure sshd is running, in this order: ss -tlnp | grep :22 on the target. You want 0.0.0.0:22 or [::]:22 . A 127.0.0.1:22 line means a ListenAddress in /etc/ssh/sshd_config is pinning it to loopback - check the effective config with sshd -T | grep -E '^(port|listenaddress)' . sudo ufw status (or firewall-cmd --list-all ). If SSH is not allowed, sudo ufw allow 22/tcp . Check the forward's external port. Plenty of people map WAN 2222 to LAN 22 to cut scan noise; then port 22 will always read closed and 2222 is the number to test. Confirm the forward points at the machine's current address. A DHCP lease that moved is the most common silent breakage - give the host a reservation. If it does come back OPEN, spend five minutes hardening rather than moving the port: keys only, no root login, and fail2ban or CrowdSec to drop the repeat offenders.",
  "faq": [
   {
    "q": "Is it safe to leave port 22 open to the internet?",
    "a": "It is, provided password authentication is off and you log in with keys - set PasswordAuthentication no and PermitRootLogin prohibit-password in sshd_config, then reload. What gets people owned is not SSH itself but a weak or reused password on an account that automated scanners find within hours of the port opening. Add fail2ban to trim the log noise and keep the daemon patched."
   },
   {
    "q": "Why does port 22 show closed when sshd is running?",
    "a": "The usual causes are a ListenAddress binding sshd to 127.0.0.1, a host firewall (ufw, firewalld, Windows Defender Firewall) with no rule for 22, a port-forward aimed at an internal address the machine no longer holds, or carrier-grade NAT on your ISP connection, which makes inbound forwarding impossible no matter what the router says. Check ss -tlnp first, it settles the first two immediately."
   },
   {
    "q": "Should I change SSH from port 22 to a different port?",
    "a": "Moving to a high port removes most untargeted scan traffic from your logs, but it is noise reduction rather than security - a full port scan finds the new port in seconds. Do it if the log volume bothers you, and on SELinux systems remember to run semanage port -a -t ssh_port_t -p tcp 2222 or sshd will refuse to bind."
   },
   {
    "q": "Does this test SFTP as well as SSH?",
    "a": "Yes. SFTP runs as a subsystem inside the SSH connection on the same TCP port 22, so a successful check covers both interactive shell and file transfer. FTP is a completely separate protocol on port 21 and is not tested here."
   }
  ]
 },
 "23": {
  "intro": "Port 23/TCP is Telnet , the 1983 remote terminal protocol. Real listeners today are telnetd on legacy Unix, BusyBox's telnetd baked into cameras, DVRs and cheap routers, and the VTY lines of network gear - Cisco IOS, MikroTik RouterOS, older switches - where it often ships enabled. Almost nobody arrives here trying to open 23. The two real reasons are a scan report or a compliance finding that says port 23 is exposed, and an old switch or console server that can only be reached this way. For that second case, use the check as confirmation that the box really is on the internet, then move it behind a VPN. CLOSED / filtered is the result you want on this port. OPEN means a device on your connection is accepting clear-text logins from anywhere: Telnet has no encryption at all, so the credentials, the session and any config you paste are readable by every hop in between. Mirai found its hosts by doing precisely this check against whole address ranges and trying about sixty factory username/password pairs. If it reads OPEN and you did not deliberately put something there, treat it as an incident. Finding what is answering, then closing it: Scan your own LAN for the culprit: nmap -p23 --open 192.168.1.0/24 . IP cameras, DVRs, set-top boxes and old print servers are the usual suspects. Check the router for a forward you did not add. UPnP lets a device map itself to the WAN; disable UPnP and delete any rule pointing at 23. Check the router itself. Some ISP units and older MikroTik boxes accept Telnet on the WAN side. On RouterOS: /ip service disable telnet . On Cisco IOS: line vty 0 4 then transport input ssh . On Linux, Telnet is normally socket-activated: sudo systemctl disable --now telnet.socket , or remove the line from /etc/inetd.conf and restart inetd. Belt and braces at the edge, if the device cannot be changed: block 23 inbound, and reach it through a jump host over SSH or WireGuard instead. One legitimate use of the client survives: telnet host 25 as a quick way to see whether a TCP port answers and what banner it returns. nc -zv host 25 does the same thing without installing anything, and neither of those needs a telnet server running anywhere.",
  "faq": [
   {
    "q": "Why is Telnet insecure?",
    "a": "Telnet has no encryption and no integrity protection. The login name, the password and every character of the session travel as plain text, so anyone able to observe the path - a compromised router, a shared Wi-Fi segment, an ISP hop - can read the credentials and hijack the session. SSH on port 22 does the same job with authenticated encryption and key-based login."
   },
   {
    "q": "How do I close port 23 on my router?",
    "a": "Delete any port-forward or virtual-server entry for 23, then disable UPnP so a device cannot re-add one, and check the router's own remote-management settings for a Telnet option on the WAN interface. On RouterOS the command is /ip service disable telnet; on Cisco IOS set transport input ssh under the vty lines."
   },
   {
    "q": "What is the difference between Telnet and SSH?",
    "a": "They give you the same interactive terminal, but SSH (port 22) encrypts the session, verifies the server with a host key and supports key-based authentication, while Telnet (port 23) does none of that. Every device that offers both should have Telnet disabled and SSH enabled."
   },
   {
    "q": "Is port 23 blocked by ISPs?",
    "a": "Some consumer ISPs filter inbound 23 after the Mirai outbreaks, but many do not, and you should never rely on it. The check on this page tells you what is actually reachable on your connection right now, which is the only answer that matters."
   }
  ]
 },
 "25": {
  "intro": "Port 25 is where mail servers talk to each other. When another provider has a message for your domain it looks up your MX record and opens a TCP connection to port 25 on that host, where an MTA - Postfix , Exim , Sendmail , OpenSMTPD , Stalwart or Microsoft Exchange - answers with a 220 banner. It is not the port your mail client should use; authenticated submission from a laptop or a phone belongs on 587 or 465. People land here for one of two opposite problems: Inbound. You stood up a mail server, pointed the MX at it, and nothing arrives. That is the case this checker answers - it connects to port 25 on your own public IP from the outside, which is exactly what a sending mail server does. Outbound. Your script or application cannot send at all. Nearly every residential ISP has blocked outbound TCP 25 for two decades to stop infected machines spamming, and many cloud providers block it on new accounts until you ask them not to. This tool cannot test outbound; run nc -zv smtp.example.net 25 from the sending host itself. OPEN means a listener on port 25 completed the handshake with a host on the internet. That is the bare minimum for receiving mail and no more than that - whether a message is actually accepted depends on rDNS/PTR, SPF, DKIM and DMARC. Read the banner to confirm you are talking to your own MTA and not something in the path: nc mail.example.com 25 should print 220 mail.example.com ESMTP . CLOSED on 25 has three usual causes, in order of likelihood. The ISP filters inbound 25 as well as outbound, which is common on consumer lines and not negotiable - you need a business plan, a VPS, or an inbound relay service in front of you. Nothing is listening: ss -tlnp | grep ':25 ' should show the MTA on 0.0.0.0:25 rather than 127.0.0.1:25 , which in Postfix is the inet_interfaces setting. Or the packet dies at a firewall - sudo ufw status , then sudo ufw allow 25/tcp , plus a TCP 25 forward on the router to the mail host's LAN address. The moment it does read open, check one more thing: postconf smtpd_relay_restrictions . A port 25 listener that relays for anyone is an open relay, and it will be found and abused within hours.",
  "faq": [
   {
    "q": "Why is port 25 blocked by my ISP?",
    "a": "Residential ISPs have blocked outbound TCP 25 since the mid-2000s because infected home machines were the largest source of spam on the internet. The block is applied to the whole consumer network, not to your account, so no firewall change on your side removes it. Some ISPs will lift it on a business plan; otherwise send through an authenticated relay on port 587, 465 or 2525."
   },
   {
    "q": "What is the difference between port 25 and port 587?",
    "a": "Port 25 is for server-to-server delivery: a sending mail server connects to your MX and hands over a message for a local recipient, with no authentication involved. Port 587 is message submission - a client authenticates with SMTP AUTH and the server relays the message onward on its behalf. A mail client should never be configured to use 25."
   },
   {
    "q": "Do I need port 25 open to receive email?",
    "a": "Yes, if your own host is the MX for the domain. Sending servers only ever try port 25 on the MX target, so inbound 25 must reach your MTA or mail simply bounces or queues elsewhere. If your ISP blocks inbound 25, the usual answers are an inbound relay or MX backup service, or moving the MX to a VPS that forwards to you."
   },
   {
    "q": "Should port 25 use TLS?",
    "a": "Yes, but opportunistically. Server-to-server SMTP negotiates STARTTLS when both ends support it and falls back to cleartext when they do not, because refusing plaintext outright would silently drop mail from older senders. MTA-STS and DANE exist to close that downgrade for domains that publish them."
   }
  ]
 },
 "53": {
  "intro": "Port 53 carries DNS, and it is one of the few well-known ports that genuinely needs both transports. Ordinary queries and answers ride UDP 53 . TCP 53 handles anything that will not fit in a single datagram: zone transfers (AXFR and IXFR), many DNSSEC-signed responses, and any truncated UDP reply where the server sets the TC bit and the resolver retries over TCP. A nameserver that only answers on UDP looks fine for weeks and then fails on one large record. What actually listens here: BIND 9, Unbound, Knot, NSD and PowerDNS on real nameservers; CoreDNS inside Kubernetes; dnsmasq on routers and small Linux boxes; and the Pi-hole or AdGuard Home instance that most people are trying to reach when they land on this page. Because this checker speaks TCP, an OPEN result on 53 proves a full handshake reached a listener - the forward, the firewall and the daemon are all alive, and since nearly every resolver binds both transports on the same address that is strong evidence UDP is fine too. CLOSED means no handshake completed, but it does not prove UDP 53 is blocked and it does not prove it is open. Confirm the real thing with dig +short @your.public.ip example.com from an outside host, then dig +tcp @your.public.ip example.com to test the TCP path separately. When it reads closed, work through this in order: Something else already owns 53. On Ubuntu and most systemd distros systemd-resolved binds 127.0.0.53:53 and will fight Pi-hole or Unbound. Check with ss -lntup | grep ':53' , then set DNSStubListener=no in /etc/systemd/resolved.conf and restart it. The daemon is bound to loopback. 127.0.0.1:53 where you wanted 0.0.0.0:53 is the most common single cause. In Unbound that is interface: 0.0.0.0 ; in Pi-hole it is the Listen on all interfaces setting. The host firewall drops it. sudo ufw allow from 192.168.1.0/24 to any port 53 opens both transports; ufw status verbose shows what is really in force. Your ISP intercepts it. Some residential and hotel networks transparently redirect outbound UDP 53 to their own resolver, so answers come back that you never served. If you only want ad-blocking DNS while travelling, do not forward 53 at all - run WireGuard and point the tunnel's DNS at the Pi-hole's private address.",
  "faq": [
   {
    "q": "Does DNS use TCP or UDP?",
    "a": "Both. Queries and answers normally use UDP 53 because a single request and reply is cheaper than a handshake. DNS falls back to TCP 53 when a response is too large for the negotiated UDP buffer and the server sets the truncated (TC) flag, and zone transfers between nameservers always use TCP. Blocking TCP 53 on a nameserver breaks DNSSEC and large answers."
   },
   {
    "q": "Why does it say port 53 is already in use on Ubuntu?",
    "a": "systemd-resolved runs a stub listener on 127.0.0.53:53 by default, so Pi-hole, Unbound, dnsmasq or BIND cannot bind the same port. Set DNSStubListener=no in /etc/systemd/resolved.conf, restart systemd-resolved, and repoint /etc/resolv.conf. Run ss -lntup | grep ':53' first to confirm which process holds it."
   },
   {
    "q": "Should I forward port 53 to my Pi-hole?",
    "a": "No. A Pi-hole reachable from the internet is an open recursive resolver, which strangers will use for DNS amplification attacks and which will eventually get your address rate-limited or null-routed. Use it as your LAN resolver via DHCP, and reach it from outside over a VPN such as WireGuard or Tailscale."
   },
   {
    "q": "What is an open DNS resolver?",
    "a": "A resolver that performs recursion for any source address on the internet rather than only for its own network. Because a small query can produce a much larger answer, attackers spoof a victim's source address and use your server to amplify traffic at them. Restricting recursion by client prefix in BIND, Unbound or dnsmasq closes it."
   }
  ]
 },
 "67": {
  "intro": "UDP 67 is the server side of DHCP. A client with no address yet broadcasts a DISCOVER from 0.0.0.0:68 to 255.255.255.255:67 ; the server answers with an OFFER, the client broadcasts a REQUEST, the server sends an ACK - the DORA exchange. Everything a host needs comes down that path: address, netmask, default gateway, DNS servers, NTP servers, PXE boot filename, and vendor options. The programs that listen here are ISC Kea (the current ISC server, dhcpd having reached end of life), dnsmasq on routers and small Linux boxes, the Windows Server DHCP role, udhcpd on embedded gear, and the built-in servers in OPNsense, pfSense, MikroTik RouterOS, UniFi and every consumer router. This page's checker cannot test port 67, and neither can any other external tool. It probes TCP and DHCP is UDP-only, but the deeper reason is that DHCP never crosses a router: the initial packets are link-local broadcasts, so a request from the internet would be discarded long before it reached your server. Expect CLOSED here even on a perfectly healthy DHCP server. That is the correct answer. Debug it from the same broadcast domain instead. On the server, confirm it is listening and on which interface: ss -lunp | grep ':67' - Kea or dnsmasq should appear bound to the LAN interface, not just loopback. journalctl -u kea-dhcp4-server -f or journalctl -u dnsmasq -f while you renew a client. If you see the DISCOVER but no OFFER, the pool is exhausted or the subnet declaration does not match the interface's address. sudo tcpdump -ni eth0 'udp port 67 or udp port 68' -vv is the definitive test - it shows which of the four DORA packets is missing. On the client, force a fresh lease: sudo dhclient -v -r eth0 && sudo dhclient -v eth0 on Linux, ipconfig /release then ipconfig /renew on Windows. A client that ends up with a 169.254.x.x APIPA address heard nothing at all - no server on the link, VLAN mismatch, or DHCP snooping on the switch blocking an untrusted port. If you see leases coming from an address you do not recognise, you have a rogue server: sudo nmap --script broadcast-dhcp-discover will name every responder on the segment.",
  "faq": [
   {
    "q": "What is the difference between port 67 and port 68?",
    "a": "Port 67 is the server: it listens for DISCOVER and REQUEST messages. Port 68 is the client: it listens for the OFFER and ACK coming back. The pair is fixed because a client has no address yet and cannot use an ephemeral source port that the server could reply to reliably, so both ends use well-known ports."
   },
   {
    "q": "Can I port-forward DHCP through my router?",
    "a": "No, and you should not try. The DISCOVER is a link-local broadcast that routers do not forward, so a rule on your WAN interface would never see one. If clients on another subnet need leases from a central server, configure a DHCP relay on their gateway - ip helper-address on Cisco, a relay agent on OPNsense or pfSense - which rewrites the request as unicast to the server."
   },
   {
    "q": "How do I find a rogue DHCP server on my network?",
    "a": "Run sudo nmap --script broadcast-dhcp-discover from a host on the affected VLAN; it broadcasts a DISCOVER and lists every server that answers. A Wireshark capture filtered on bootp shows the same thing with the offering MAC address. Enabling DHCP snooping on your switches and marking only the uplink to the real server as trusted stops it happening again."
   },
   {
    "q": "Why is my device getting a 169.254 address?",
    "a": "That is APIPA link-local autoconfiguration, which a host assigns itself when no DHCP server answers. It means the DISCOVER got no OFFER: the server is down or not listening on that interface, the port is in the wrong VLAN, the scope is exhausted, or a switch is blocking DHCP. Capture on the server with tcpdump to see whether the DISCOVER arrives at all."
   }
  ]
 },
 "68": {
  "intro": "UDP 68 is the client half of DHCP. It is where a host with no address yet waits for the OFFER and ACK that a server on the same link sends back to port 68. The clients that bind it are ISC dhclient , dhcpcd , systemd-networkd , NetworkManager's internal client, udhcpc on embedded devices, and the DHCP Client service on Windows. There is one reason a self-hoster ends up caring about 68, and it is a good one: your router's WAN interface is a DHCP client. The public IP this site just showed you almost certainly arrived as a lease on UDP 68 from your ISP. If that exchange fails, you do not have a port-forwarding problem, you have no public address at all. The detail that trips up firewall rules is the source address. A client that has no address sends its DISCOVER from 0.0.0.0 to the broadcast address 255.255.255.255 , so the reply cannot be matched against a normal connection-tracking state entry. That is why OPNsense, pfSense and iptables setups need an explicit rule allowing udp/67 to udp/68 inbound on the WAN interface; a strict default-deny WAN policy with no such rule produces a router that renews fine for months and then loses its lease at the worst moment. This checker will always report 68 closed, and that is correct. It probes TCP, DHCP is UDP-only, and in any case the traffic that matters here is a link-local broadcast from your ISP's own equipment that never travels across the internet. Nothing external can meaningfully test it. Test it from the client instead: sudo dhclient -v -r eth0 && sudo dhclient -v eth0 releases and re-requests with full output, so you see exactly which step stops. ip -4 addr show eth0 and cat /var/lib/dhcp/dhclient.leases show the address and the option set actually received. journalctl -u systemd-networkd -f or networkctl status eth0 on systemd hosts. sudo tcpdump -ni eth0 'udp port 67 or udp port 68' -vv tells you whether the OFFER arrives and is being dropped locally, or never arrives at all. On a router, use the WAN interface's own Release / Renew control - OPNsense and pfSense both expose one on the interface page - and check the firewall log for a dropped 67-to-68 packet.",
  "faq": [
   {
    "q": "What is UDP port 68 used for?",
    "a": "It is the port a DHCP client listens on to receive the OFFER and ACK from a DHCP server, which listens on port 67. Every device that gets an address automatically uses it, including your router's WAN interface when it pulls a public IP from your ISP."
   },
   {
    "q": "Do I need to open port 68 on my firewall?",
    "a": "Only inbound on the interface that is itself a DHCP client, and only from port 67. On a router that means one rule on the WAN interface permitting udp/67 to udp/68; a strict default-deny WAN policy without it will eventually break lease renewal. It should never be forwarded to an internal host."
   },
   {
    "q": "Why is the source address 0.0.0.0 in DHCP packets?",
    "a": "Because the client has not been given an address yet, so it has nothing else to use. The request goes from 0.0.0.0:68 to the broadcast address 255.255.255.255:67, and the server's reply is broadcast or unicast back to port 68. Stateful firewalls cannot match that against an existing flow, which is why an explicit rule is needed."
   },
   {
    "q": "Can port 68 be tested from the internet?",
    "a": "No. DHCP is UDP-only so a TCP checker cannot reach it, and the exchange is a link-local broadcast between your device and a server on the same segment, which routers do not forward. An external result for port 68 is meaningless; use tcpdump or dhclient -v on the device itself."
   }
  ]
 },
 "69": {
  "intro": "UDP 69 is TFTP, the deliberately minimal file transfer protocol from RFC 1350. It has no login, no encryption, no directory listing and no delete - a read request or a write request, then 512-byte data blocks each acknowledged in lockstep. That simplicity is why it survives: it is small enough to fit in a network card's boot ROM, so it is what PXE clients use to fetch a bootloader and what switches, routers, APs and phones use to pull firmware and push configs. The single most important fact about port 69, and the reason most people are here: only the first packet goes to port 69. The server answers the RRQ or WRQ from a fresh ephemeral source port, and the entire rest of the transfer runs between that port and the client's port. A firewall or NAT rule that permits only udp/69 lets the request through and then silently drops every data block, which looks exactly like a server that accepts the connection and then hangs. On Linux the fix is the connection-tracking helper: sudo modprobe nf_conntrack_tftp (plus nf_nat_tftp where NAT is involved), or the equivalent TFTP ALG on a commercial firewall. This page's checker probes TCP, and nothing listens on TCP 69 , so a working TFTP server will still read closed here. Treat that as expected and test the protocol directly. From a client on the same network: tftp 192.168.1.10 -c get pxelinux.0 - if this works and PXE does not, the problem is DHCP options 66 and 67, not TFTP. ss -lunp | grep ':69' on the server to confirm in.tftpd or dnsmasq is bound to the right interface. sudo tcpdump -ni eth0 'udp port 69 or (udp and host 192.168.1.10)' -vv shows the ephemeral-port switch and where it stops. sudo ufw allow 69/udp , then check ufw status verbose . Two more failures worth knowing. Uploads fail on tftpd-hpa unless it runs with --create or the destination file already exists and is world-writable, because the daemon will not create files by default. And on RHEL-family hosts SELinux confines the TFTP root: files outside /var/lib/tftpboot need the right context, which ls -Z will show you. A Cisco copy running-config tftp: that reports a timeout is nearly always one of those two, or the helper module above.",
  "faq": [
   {
    "q": "Does TFTP use TCP or UDP?",
    "a": "UDP only, on port 69. TFTP implements its own stop-and-wait reliability with a block number and an acknowledgement for each 512-byte block, which is why it needs no TCP stack and fits in boot firmware. There is no TCP listener on port 69, so a TCP port check will always report it closed."
   },
   {
    "q": "Why does my TFTP transfer start and then time out?",
    "a": "Because only the initial request uses port 69. The server replies from a random ephemeral port and the transfer continues there, so a firewall rule that permits only udp/69 drops every data block. Load the connection-tracking helper with modprobe nf_conntrack_tftp on Linux, or enable the TFTP ALG on your firewall."
   },
   {
    "q": "Is TFTP secure?",
    "a": "No, and it was never meant to be. There is no authentication and no encryption, so any file in the TFTP root is readable by anyone who can reach the port, and a writable server can be overwritten. Use it only inside a management network, and use SFTP or SCP for anything else."
   },
   {
    "q": "Why does the port checker say port 69 is closed when my TFTP server is running?",
    "a": "The checker opens TCP connections and TFTP is UDP-only, so a closed result here says nothing about your server. Verify with a real client from the same network - tftp -c get - and confirm the daemon is bound with ss -lunp | grep ':69'."
   }
  ]
 },
 "80": {
  "intro": "Port 80 is where cleartext HTTP lives. On a normal server the listener is nginx , Apache httpd , Caddy or IIS; on a home network it is just as often the router's own web interface, which matters when you read the result below. Most people arrive here for one of three reasons: a self-hosted site that works on the LAN but not from a phone on mobile data, a port-forward the router insists is configured, or a certificate issue that dies with Timeout during connect (likely firewall problem) . That last one is the big one. Let's Encrypt's HTTP-01 challenge fetches http://your-domain/.well-known/acme-challenge/<token> over port 80 from outside, and it will follow a redirect to 443 but it cannot start anywhere else. If 80 is unreachable, HTTP-01 can never succeed no matter how correct your DNS is. Reading the result. OPEN means a TCP handshake completed on 80 from the public internet — but confirm what answered. A surprising number of ISP routers publish their own admin page on 80, so an OPEN result plus a login screen you do not recognise means the forward is missing and you are talking to the router. CLOSED on port 80 specifically has one cause that no firewall change will fix: many residential ISPs block inbound 80 outright on consumer plans, often alongside 443 (outbound 25 is blocked on most of them too). If it reads closed, in order: Confirm something is listening and on the right address: ss -tlnp | grep ':80 ' . You want 0.0.0.0:80 or [::]:80 , not 127.0.0.1:80 . Remember 80 is privileged. A non-root process cannot bind it without CAP_NET_BIND_SERVICE ( setcap 'cap_net_bind_service=+ep' /path/to/binary ) or a systemd unit with AmbientCapabilities= , which is why so many apps quietly fall back to 8080. Open the host firewall: sudo ufw allow 80/tcp then sudo ufw status , or on Windows netsh advfirewall firewall add rule name=\"HTTP\" dir=in action=allow protocol=TCP localport=80 . Check the forward targets the machine's current DHCP lease, not the address it had last month, and that you are not behind a second router (double NAT) or carrier-grade NAT. If the ISP blocks 80, switch your certificate issuance to the DNS-01 challenge, which needs no inbound port at all, and publish the site through a tunnel or a VPS instead.",
  "faq": [
   {
    "q": "Why is port 80 blocked by my ISP?",
    "a": "Residential ISPs commonly block inbound TCP 80 and 443 to discourage home web hosting and to limit the damage from compromised devices. It is enforced upstream of your router, so no firewall or port-forward change on your side can undo it. Your options are a business plan, a reverse tunnel to a VPS, or hosting the site elsewhere and keeping only the origin private."
   },
   {
    "q": "Do I need port 80 open for Let's Encrypt?",
    "a": "Only for the HTTP-01 challenge, which fetches a token over plain HTTP on port 80 from the public internet. It will follow a redirect from 80 to 443, but the request itself must start on 80. If 80 is blocked, use the DNS-01 challenge instead, which proves control by publishing a TXT record and needs no inbound connectivity."
   },
   {
    "q": "Should I forward port 80 or just use 443?",
    "a": "Forward both if you can. 443 carries the actual traffic, and 80 exists so that visitors typing a bare hostname get redirected instead of a connection error, and so ACME HTTP-01 renewals keep working. Serve nothing but the redirect and the challenge path on 80."
   },
   {
    "q": "The checker says port 80 is open but my site does not load. Why?",
    "a": "The check only proves a TCP handshake completed, not that your server answered. Something else on the path — typically the router's own web UI, or a modem in bridge-less mode — may be accepting the connection. Run curl -I http://your-public-ip/ from an outside network and look at the Server header to see who is really replying."
   }
  ]
 },
 "81": {
  "intro": "Port 81 has no service of its own. It is simply the first port people reach for when 80 is taken or blocked, and three things account for nearly all real-world use: the Nginx Proxy Manager admin UI (its documented default), the web interface on a large number of IP cameras, DVRs and NVRs , and a second virtual host on a web server that is already using 80 for something else. The usual reason for landing here is an ISP that blocks inbound 80. Moving the site to 81 does work for a browser — 81 is not on the browsers' restricted-port list, so http://your-domain:81/ loads normally — but it comes with two costs worth knowing up front. Visitors must type the port every time, and Let's Encrypt's HTTP-01 challenge cannot use it : the validation request always starts on port 80, so if 80 is blocked you need the DNS-01 challenge regardless of what you do with 81. Reading the result. OPEN means a public TCP connection reached 81. Verify who answered before assuming it worked: curl -sI http://your-domain:81/ from an outside network. If it is a camera login page or an Nginx Proxy Manager admin screen, close the forward — those two are among the most reliably brute-forced surfaces on the consumer internet, and the proxy manager's default administrator account is published in its own documentation. CLOSED usually means the host firewall or a missing forward; the ISP block that affects 80 does not normally extend to 81. If it reads closed: ss -tlnp | grep ':81 ' — mind the trailing space, or you will match 8080 and 8181 too. 81 is still a privileged port (below 1024), so a non-root process needs CAP_NET_BIND_SERVICE to bind it. That trips people who moved an app down from 8081 expecting it to just work. Open the firewall: sudo ufw allow 81/tcp , then sudo ufw status . In Docker, the mapping is what matters: -p 81:80 publishes container port 80 on host port 81. Check with docker ps . If the goal is an admin UI, stop forwarding and use a VPN. If the goal is a public site, put it behind a proxy on 443 with a certificate instead — an unencrypted login on 81 is a password sent in cleartext.",
  "faq": [
   {
    "q": "What service uses port 81?",
    "a": "Nothing standard. In practice it is a second HTTP site, the Nginx Proxy Manager admin interface, or the web UI on an IP camera or DVR. Check the host itself with ss -tlnp | grep ':81 ' rather than guessing from the port number."
   },
   {
    "q": "Can I use port 81 if my ISP blocks port 80?",
    "a": "Yes for browsing — visitors just have to include :81 in the URL, and browsers do not block that port. But Let's Encrypt's HTTP-01 challenge always begins on port 80, so it will still fail; use the DNS-01 challenge to get certificates when 80 is blocked."
   },
   {
    "q": "Is it safe to forward port 81 to Nginx Proxy Manager?",
    "a": "No. Port 81 is the admin interface, it is served over plain HTTP, and the installation default login is published in the project's own documentation. Change the credentials immediately, keep 81 on the LAN, and reach it over a VPN — forward only 80 and 443, which are the ports it proxies with."
   },
   {
    "q": "Why is port 81 open on my IP when I did not forward it?",
    "a": "Look for an IP camera, DVR or NVR on the network. Many ship with UPnP enabled and ask the router to open their web port automatically, and 81 is a common choice. Disable UPnP on the router, remove the mapping, and check the device for firmware updates — exposed camera interfaces are actively scanned."
   }
  ]
 },
 "88": {
  "intro": "Port 88 is the Kerberos v5 KDC - the Key Distribution Center that issues the ticket-granting ticket at logon and service tickets thereafter. On Windows it is part of the domain controller's LSA ( kdcsvc ); elsewhere it is MIT krb5kdc , Heimdal or FreeIPA. It uses both UDP and TCP 88 , and it is not the only port a domain needs: password changes go to kpasswd on 464, and directory lookups to LDAP on 389 and 636. The UDP/TCP split causes the classic Kerberos support ticket. Clients start on UDP and switch to TCP when the reply will not fit in a datagram - and the reply grows with the number of groups a user belongs to, because the PAC carries them. So authentication works for ordinary staff and fails for the administrator who is in fifty groups. On Windows the threshold is MaxPacketSize under HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Kerberos\\Parameters , default 1465 bytes; setting it to 1 forces TCP for everything and is the standard workaround when a firewall or a tunnel with a small MTU is mangling fragmented UDP. If your firewall rule for a domain controller only permits UDP 88, that same symptom appears - so always open both. This checker tests TCP , so it exercises exactly the half people forget to allow. On this page, though, CLOSED / filtered is the result you should be hoping for from the public internet: see the exposure note above. For the internal case, where 88 must answer: From a client: Test-NetConnection dc01.example.com -Port 88 , or nc -zv dc01.example.com 88 on Linux. On the KDC: ss -tlnp | grep :88 for krb5kdc, or netstat -ano | findstr :88 on Windows. Prove the protocol, not just the socket: kinit user@EXAMPLE.COM then klist . A ticket with a sensible expiry means the whole path works, including DNS and clock. Clock skew is the failure that looks like a firewall problem. Kerberos rejects requests more than five minutes out by default, so check NTP on both ends before blaming the port. nltest /dsgetdc:example.com confirms the client is finding the DC you think it is. If remote users need domain authentication, terminate it at something built to face the internet - a VPN, or an identity gateway doing SAML or OIDC - and let it talk Kerberos on the inside.",
  "faq": [
   {
    "q": "Does Kerberos use TCP or UDP on port 88?",
    "a": "Both. Clients typically try UDP 88 first and retry over TCP 88 when the response is too large for a datagram, which happens as soon as a user's group membership makes the ticket big. Firewall rules for a KDC must permit both, or you get authentication that works for some accounts and fails for others."
   },
   {
    "q": "What uses port 88 on my network?",
    "a": "Domain controllers and other Kerberos KDCs. Every domain logon, every service ticket request behind SMB, LDAP, MSSQL or a Kerberos-authenticated web application starts with a request to port 88. Password changes use kpasswd on port 464 rather than 88."
   },
   {
    "q": "Why does Kerberos fail for some users but not others?",
    "a": "Usually ticket size. A user in many groups produces a PAC too large for a UDP datagram, so the client falls back to TCP 88 - and if the firewall only permits UDP, or fragmented UDP is being dropped in the middle, that user cannot authenticate while everyone else can. Setting MaxPacketSize to 1 forces TCP and confirms the diagnosis; also verify clock skew is under five minutes."
   },
   {
    "q": "Should port 88 be reachable from the internet?",
    "a": "No. An exposed KDC allows username enumeration from its distinct error codes for an unknown principal versus a bad password, offline-crackable material from accounts with pre-authentication disabled, and password spraying against your accounts. Domain controllers belong on an internal network reached through a VPN, with any public application fronted by a reverse proxy or identity gateway."
   }
  ]
 },
 "110": {
  "intro": "Port 110 is POP3 , defined in RFC 1939 and the oldest of the mailbox-access protocols: connect, authenticate, download the messages, and by default delete them from the server. The listener is Dovecot , Courier , Cyrus , Zimbra , Stalwart or the Exchange POP3 service. Plain 110 is unencrypted; the STLS command from RFC 2595 upgrades a session to TLS, and 995 is the implicit-TLS version of the same protocol. Two situations bring people here. One is a device that speaks nothing else - a multifunction copier, an alarm panel, an old line-of-business application polling a mailbox. The other is a self-hosted mail server where a client away from home cannot fetch mail. This checker connects to port 110 on your own public IP from the outside, which is the path that client actually takes. OPEN means a POP3 listener answered. nc mail.example.com 110 should print a +OK greeting, and sending CAPA lists the capabilities - look for STLS . If STLS is absent, everything after USER and PASS , the password included, crosses the internet in plaintext. CLOSED is usually deliberate, because most distributions ship POP3 turned off. In Dovecot the protocols line has to include pop3 , and the service must not be limited to loopback - ss -tlnp | grep ':110 ' should show 0.0.0.0:110 and not 127.0.0.1:110 . Then the host firewall ( sudo ufw status , then sudo ufw allow 110/tcp ), then the router's TCP 110 forward to the mail host's current LAN address rather than one it held on an old DHCP lease. Two things worth knowing before you open it. Dovecot sets disable_plaintext_auth = yes out of the box, so logins on 110 are refused until STLS succeeds - that is correct behaviour rather than a fault, and a client stuck on \"authentication failed\" while the port reads open is usually hitting exactly this. And large providers have withdrawn password logins for these protocols entirely: Microsoft 365 requires OAuth for POP and IMAP, so a legacy device pointed at port 110 with a stored password will not work there no matter what your firewall says. If the device can do 995, use 995; if it can do IMAP, prefer 993 so mail stays on the server for your other devices.",
  "faq": [
   {
    "q": "What is the difference between port 110 and port 995?",
    "a": "They are the same POP3 protocol with different transport security. Port 110 starts in cleartext and can upgrade with the STLS command, while 995 wraps the session in TLS from the first byte. Any client offering a \"POP3 with SSL\" preset means 995; a \"POP3 with STARTTLS\" preset means 110."
   },
   {
    "q": "Is POP3 on port 110 secure?",
    "a": "Not on its own. Without STLS the username, password and every message body travel unencrypted and are readable by anything on the path. It is acceptable only when the server refuses authentication until STLS has succeeded, and even then 995 is the simpler choice because there is no downgrade to get wrong."
   },
   {
    "q": "Why does POP3 delete my mail from the server?",
    "a": "That is the protocol's design: POP3 was built to move mail to one machine, so most clients issue DELE after a successful download. Nearly every client has a \"leave messages on server\" option that suppresses it, but if you want the same mailbox on several devices, IMAP on 143 or 993 is the right protocol rather than a POP3 setting."
   },
   {
    "q": "Do I need to open port 110 to the internet?",
    "a": "Only if a client or device outside your network fetches mail over plain POP3. Webmail and sync jobs running on the mail host itself should connect to 127.0.0.1:110, which needs no firewall rule at all. For remote clients, open 995 instead and leave 110 internal."
   }
  ]
 },
 "111": {
  "intro": "Port 111 is rpcbind (historically portmap , and sunrpc in /etc/services ). It is not a file server or a database - it is a lookup table . ONC RPC services register their program number and the port they grabbed at boot; a client asks rpcbind \"where is mountd?\" and gets a port number back. It listens on both TCP and UDP. Two very different people land on this page. The first is troubleshooting an NFSv3 mount, because v3 genuinely depends on 111 to find mountd , statd and lockd . The second has just received a scan report or an abuse notice with \"portmapper exposed\" on it. Both need the same first command: rpcinfo -p localhost - lists every registered program and port. If the only entries are portmapper itself, nothing is using it and you can turn it off. ss -tlnp | grep 111 and ss -ulnp | grep 111 - both transports matter here. If you are on NFSv4 , you do not need this port at all. v4 folded mounting and locking into the protocol on 2049, so rpcbind is consulted for nothing. Test it: sudo mount -t nfs -o vers=4.2 192.168.1.10:/export /mnt . If that works, close 111. If you are stuck on v3, do not just open 111 - also pin the helper ports ( /etc/nfs.conf , or RPCMOUNTDOPTS=\"-p 20048\" style settings) so you can write firewall rules that are not \"allow everything above 32768\". An OPEN result on this check is a problem, not a milestone. Turning it off on a modern Ubuntu or Debian box takes an extra step because rpcbind is socket-activated - stopping the service alone lets systemd restart it on the next connection: sudo systemctl disable --now rpcbind.socket rpcbind.service sudo systemctl mask rpcbind.socket if a dependency keeps pulling it back. If you need it locally only, run it with -h 127.0.0.1 so it never binds the public interface. Why \"never\" is not an overreaction. Anyone who reaches port 111 gets a free inventory of your RPC services and ports, which is a map for the next step. Separately, UDP 111 answers a small query with a much larger reply, which makes it a reflector for spoofed-source DDoS traffic - hosting providers routinely suspend accounts that participate in that, unwillingly or not.",
  "faq": [
   {
    "q": "What is rpcbind and do I actually need it?",
    "a": "rpcbind maps ONC RPC program numbers to the ports those services are listening on, so clients can find them. You need it for NFSv3, NIS and a few legacy RPC services. You do not need it for NFSv4, which handles mounting and locking on port 2049 itself. Run rpcinfo -p localhost - if nothing but portmapper is registered, nothing is using it."
   },
   {
    "q": "How do I close port 111 on Ubuntu?",
    "a": "rpcbind is socket-activated, so stopping the service is not enough. Run sudo systemctl disable --now rpcbind.socket rpcbind.service, and mask the socket unit if another package keeps pulling it back in. If a local service still needs RPC, start rpcbind with -h 127.0.0.1 so it binds loopback only rather than the public interface."
   },
   {
    "q": "Do I need port 111 open for NFS?",
    "a": "Only for NFSv3. NFSv4 needs port 2049 and nothing else, so if your clients can mount with -o vers=4.2 you can leave 111 closed. If you are stuck with v3, pin the mountd, statd and lockd ports in /etc/nfs.conf as well, otherwise they land on random high ports every reboot and no firewall rule can be written for them."
   },
   {
    "q": "Why is port 111 flagged in security scans?",
    "a": "Two reasons. Anyone who connects gets a complete list of the RPC services you run and the ports they are on, which is reconnaissance you did not need to give away. And UDP 111 returns a reply larger than the request, so it can be abused as a reflection and amplification source in spoofed DDoS attacks, which is why hosting providers act on it."
   }
  ]
 },
 "123": {
  "intro": "UDP 123 is NTP. A client sends a small timestamped packet, the server sends one back, and the client uses the four timestamps to work out both offset and round-trip delay. That is the whole protocol at the wire level, and it is UDP-only - there is no TCP listener on 123, so a TCP check like this page's will read closed on a perfectly healthy time server. (Network Time Security key establishment does use TCP, but on port 4460, not here.) What listens here: chronyd , which is the default on most modern Linux distributions; ntpd and NTPsec; OpenNTPD on BSD; the Windows Time service on a domain controller holding the PDC emulator role; and effectively every router, switch and firewall you own, since they all ship an NTP server nobody remembers enabling. Most people do not need port 123 open inbound. If you are only syncing your own clock, chrony and systemd-timesyncd send from a random ephemeral source port and the answer returns on the existing state entry - no forward, no firewall rule. You need to listen on 123 only if you are serving time to others: a LAN time source, a domain controller, or an NTP Pool member. If you forwarded 123 to a machine to make a clock problem go away, undo it. When time is wrong - expiring TLS handshakes, TOTP codes rejected, Kerberos failing with a clock-skew error - check the client side first: chronyc sources -v and chronyc tracking . A ? in the state column means unreachable; a large System time offset in tracking means it is reaching servers but has not stepped yet. ntpq -p on ntpd hosts - the reach column is an octal shift register, so 377 is eight good polls in a row and 0 is nothing getting back. timedatectl and timedatectl show-timesync --all on systemd-timesyncd hosts. w32tm /query /status then w32tm /resync on Windows. ss -lunp | grep ':123' to see whether you are actually listening, and on which addresses. If you are serving time, the security work is small and non-negotiable. The 2014 NTP reflection attacks used monlist , a mode 7 query that returned a long list of recent clients in reply to a tiny request; it was removed in ntpd 4.2.7p26 and chrony never implemented it. Modern practice is to answer time queries and nothing else.",
  "faq": [
   {
    "q": "Does NTP use TCP or UDP?",
    "a": "UDP, on port 123. There is no TCP component to ordinary NTP, so an external TCP port check cannot verify an NTP server and will always report 123 closed. The exception is NTS key establishment, which runs over TLS on TCP port 4460 and only sets up keys - the time exchange itself still uses UDP 123."
   },
   {
    "q": "Do I need to open port 123 to sync time?",
    "a": "No. Outbound queries from chrony, ntpd or systemd-timesyncd use an ephemeral source port and stateful firewalls let the replies back automatically. You only need to listen on 123 if other machines get their time from you - a LAN time server, a domain controller, or a public pool server."
   },
   {
    "q": "What is NTP amplification and is my server vulnerable?",
    "a": "It is a reflection attack in which a spoofed short query produces a much larger reply aimed at a victim. The classic vector was the monlist command, removed from ntpd in 4.2.7p26 and never present in chrony. Restricting mode 6 and mode 7 control queries - restrict default noquery in ntpd - closes the remaining ones."
   },
   {
    "q": "Why does my NTP server show as unreachable?",
    "a": "Check the daemon is listening with ss -lunp | grep ':123', then check the firewall permits UDP 123 from the client subnet, then confirm the client is not being redirected by a transparent proxy. In ntpq -p the reach column tells you how many of the last eight polls got an answer; a chronyc sources line showing ? has had none."
   }
  ]
 },
 "135": {
  "intro": "Port 135/TCP is the DCE/RPC endpoint mapper , run on Windows by RpcSs inside svchost.exe . It is a directory service, not an application: a client asks 135 \"which port is the service with this interface UUID listening on?\", gets a port number back, and then makes a second connection to that port. On Vista and later the answer lands in the dynamic range 49152-65535 ; on Windows XP and 2003 it was 1024-5000. That two-step design is why the question people arrive with - how do I forward port 135 so remote WMI works? - has no good answer. Forwarding 135 alone gets the client a port number it then cannot reach, so the call fails after the lookup succeeds. Forwarding the entire dynamic range to make it work is how networks get destroyed. The supported approach is to restrict the range with netsh int ipv4 set dynamicport tcp start=49152 num=16384 so firewall rules are writable at all, and then to carry the traffic over a VPN. Real users of 135 are all internal: DCOM activation, WMI queries against another machine, remote Service Control Manager ( services.msc pointed at a second host), remote Event Viewer, Task Scheduler remoting and legacy Exchange RPC access. CLOSED / filtered is the only acceptable result on this page. If the check says OPEN , something is publishing the Windows RPC surface to the entire internet. Act on it: Delete the port-forward or DMZ-host entry on the router, and turn UPnP off so nothing recreates it. On the host, netstat -ano | findstr :135 gives the PID; Get-Process -Id (Get-NetTCPConnection -LocalPort 135).OwningProcess names it. It will be svchost hosting RpcSs. Do not try to stop the service. RPC is load-bearing for Windows itself and disabling RpcSs leaves a machine that will not boot properly. Block the port at the firewall instead - that is the supported control. Historically 135 is where the Blaster worm entered in 2003 (MS03-026), and more recently CVE-2022-26809 in the RPC runtime put it back on every emergency blocklist. Both are patched, but the pattern - a pre-authentication attack surface reachable before any credential is checked - is the reason the port stays inside.",
  "faq": [
   {
    "q": "What is port 135 used for?",
    "a": "It hosts the Windows RPC endpoint mapper, which tells clients which dynamic port a given RPC or DCOM service is listening on. Remote WMI queries, DCOM activation, remote service control and remote Event Viewer all start with a lookup on 135 and then connect to a high port in the 49152-65535 range."
   },
   {
    "q": "Can I close or disable port 135 on Windows?",
    "a": "You can and should block it at the network edge and at the host firewall, but do not disable the RpcSs service to do it - local RPC is fundamental to Windows and stopping it breaks the machine. Restrict inbound 135 to the management subnets that genuinely need remote WMI or service control."
   },
   {
    "q": "Why does forwarding port 135 not make remote WMI work?",
    "a": "Because 135 only returns a port number. The client immediately opens a second connection to a dynamically assigned port in the ephemeral range, and if that port is not also reachable the call fails after the lookup. Restrict the dynamic range with netsh int ipv4 set dynamicport tcp, and put the whole conversation inside a VPN rather than forwarding ranges from the internet."
   },
   {
    "q": "Is port 135 dangerous to leave open?",
    "a": "Yes. It exposes a large pre-authentication RPC surface that has produced wormable remote code execution more than once, from Blaster in 2003 to CVE-2022-26809 in 2022. It also leaks internal service and interface information to anyone who queries the mapper. Every mainstream firewall guide blocks 135, 137-139 and 445 inbound at the perimeter."
   }
  ]
 },
 "137": {
  "intro": "Port 137 is the NetBIOS Name Service , and it is UDP . It is the name-resolution half of NetBIOS over TCP/IP (NetBT): a host registers its NetBIOS name on the segment, and clients broadcast \"who is FILESERVER?\" and take the first answer. The trio is 137/UDP for names, 138/UDP for datagrams and 139/TCP for the session that actually carries SMB. Windows implements it in NetBT ; on Linux it is Samba's nmbd . Be aware of what this checker can and cannot tell you here. The probe makes TCP connections, and NetBIOS name service is UDP. Port 137 is also registered for TCP, but nothing meaningful listens there, so a CLOSED result on this page is expected and does not prove UDP 137 is filtered. For that, query it directly from another host: nbtstat -A 192.0.2.10 on Windows or nmblookup -A 192.0.2.10 on Linux. If you get a name table back, NetBT is answering. That name table is the point of the security argument. A node status query returns the computer name, the workgroup or domain, the logged-on user in some configurations and the adapter's MAC address, all without authentication. On the local segment the protocol is worse than merely chatty: because clients trust the first response to a broadcast, tools such as Responder answer name queries for typos and dead hosts, collect the NetNTLM authentication that follows and relay or crack it. Exposed to the internet, 137 has also been used as a UDP reflection vector. Modern SMB does not need any of it. Since Windows 2000, SMB runs directly on TCP 445 with no NetBIOS wrapper, and name resolution is DNS. Turning NetBT off: Per adapter: NIC properties, IPv4, Advanced, WINS tab, Disable NetBIOS over TCP/IP . Fleet-wide via DHCP: configure the Microsoft vendor-specific option 001 (Microsoft Disable Netbios Option) with value 2. Samba: stop and disable nmbd , or set disable netbios = yes in smb.conf ; keep smbd for SMB on 445. At the edge: block 137, 138, 139 and 445 in both directions. Most ISPs already do, but do not rely on it. The one thing that still breaks without NetBT is Network Neighborhood -style browsing on flat home networks with very old devices. That is a poor trade for the exposure; map shares by DNS name or address instead.",
  "faq": [
   {
    "q": "Is port 137 TCP or UDP?",
    "a": "The NetBIOS name service is UDP 137. TCP 137 is registered but effectively unused, which is why a TCP-based port checker reports it closed even on a machine that is happily answering NetBIOS name queries. Use nbtstat -A or nmblookup -A to test the UDP service properly."
   },
   {
    "q": "What is port 137 used for?",
    "a": "Registering and resolving NetBIOS names on a local network - the pre-DNS way Windows machines found each other by computer name. It works with UDP 138 for datagram service and TCP 139 for the NetBIOS session that carries SMB. On a modern network DNS and SMB over TCP 445 replace all three."
   },
   {
    "q": "Do I still need NetBIOS over TCP/IP?",
    "a": "Almost certainly not. SMB has run directly over TCP 445 since Windows 2000 and name resolution comes from DNS, so NetBT is only needed for legacy devices or applications that resolve names by NetBIOS broadcast. Disabling it removes a well known information-disclosure and credential-relay surface."
   },
   {
    "q": "Is it safe to block ports 137, 138 and 139?",
    "a": "Yes, at the internet edge it is standard practice and there is no legitimate reason to accept them from outside. Inside a LAN, block them too if nothing legacy depends on NetBIOS name resolution or browsing - test on a subset first, because very old scanners, print servers and network appliances sometimes still rely on it."
   }
  ]
 },
 "139": {
  "intro": "Port 139/TCP is the NetBIOS Session Service . It is file sharing, but through the old wrapper: the client opens TCP 139, sends a NetBIOS session request naming the target, and only then does SMB traffic flow inside that session. Since Windows 2000 the same SMB can run directly on TCP 445 with no NetBIOS layer at all, which is why every modern client tries 445 first and only falls back to 139 for legacy peers. On Linux, smbd listens on both by default. The distinction matters when you read a scan result. 139 open, 445 closed usually means an old or embedded device - a NAS running ancient firmware, a printer, a Samba box configured NetBIOS-only. 445 open, 139 closed is a healthy modern Windows host with NetBIOS over TCP/IP disabled. Both open is the default on stock Samba and on Windows with NetBT still enabled. People land here trying to reach a home NAS from outside. Do not do it this way. SMB was designed for a trusted LAN; on the internet it is scanned constantly, an authentication attempt leaks a NetNTLM response that can be relayed or cracked offline, and the same port range is what the 2017 SMB worms swept for. Most residential ISPs filter 137-139 and 445 anyway, so the forward often cannot work even when it is configured correctly. Testing and tidying up: On the server, ss -tlnp | grep -E ':(139|445)' shows exactly which of the two smbd is on. From a LAN client, smbclient -L //10.0.0.5 -p 139 -U user proves the legacy path specifically, rather than silently succeeding over 445. To drop the legacy listener in Samba, set smb ports = 445 in smb.conf and restart smbd ; stop nmbd as well if nothing needs NetBIOS names. On Windows, disable NetBIOS over TCP/IP in the adapter's IPv4 Advanced, WINS tab. Port 139 disappears and 445 keeps working. Firewall the whole family inbound at the edge: 137, 138, 139, 445. The supported way to reach shares remotely is a tunnel. Run WireGuard on the router or the NAS, connect, then mount \\\\10.0.0.5\\share or //10.0.0.5/share over the private address exactly as you would at home. Nothing needs forwarding, and the file protocol never touches the public internet.",
  "faq": [
   {
    "q": "What is the difference between port 139 and port 445?",
    "a": "Port 139 carries SMB inside a NetBIOS session (the client opens a NetBIOS session first, then speaks SMB), while port 445 carries SMB directly over TCP with no NetBIOS layer. Windows has supported direct hosting on 445 since Windows 2000, and modern clients try 445 first; 139 remains only for compatibility with legacy systems."
   },
   {
    "q": "Do I need port 139 open for file sharing?",
    "a": "Not on any current system. Disabling NetBIOS over TCP/IP closes 139 and leaves SMB working normally on 445 for Windows, macOS and Linux clients. Keep 139 only if you have genuinely old hardware or software that cannot do direct hosting."
   },
   {
    "q": "How do I close port 139?",
    "a": "On Windows, open the adapter's IPv4 properties, Advanced, WINS tab and select Disable NetBIOS over TCP/IP - or push the equivalent by DHCP option. On Samba, set smb ports = 445 in smb.conf and restart smbd, and stop nmbd if you no longer need NetBIOS name registration. Then block 137-139 inbound at the firewall regardless."
   },
   {
    "q": "Why does a scan show port 139 open on my Linux machine?",
    "a": "Because Samba's smbd binds both 139 and 445 by default, so any host sharing files with Samba shows both unless you restrict it. Setting smb ports = 445 leaves only the modern listener. Seeing 139 on a Linux box does not mean anything is wrong on the LAN, but it should never be reachable from the internet."
   }
  ]
 },
 "143": {
  "intro": "Port 143 is IMAP - IMAP4rev1 in RFC 3501, with rev2 defined in RFC 9051 - the mailbox protocol where mail stays on the server and every device sees the same folders, flags and read state. The listener is Dovecot , Cyrus , Courier , Zimbra , Stalwart or Microsoft Exchange . Port 143 starts unencrypted and upgrades with the STARTTLS capability; 993 is the same protocol with TLS from the first byte. Worth saying before you open anything: most IMAP traffic on 143 today is local. Webmail such as Roundcube or SOGo, sieve tooling and mail-sync jobs running on the mail host should be pointed at 127.0.0.1:143 , which needs no firewall rule and no port-forward at all. Port 143 needs to reach the internet only when a real client out on the network is configured for \"IMAP, STARTTLS\". People land here when a desktop client that works at home fails from everywhere else. This checker connects to 143 on your own public IP from the outside, which is the same path that client takes - a test from your own LAN hairpins through NAT and proves nothing either way. OPEN means an IMAP listener answered. Read the greeting with nc mail.example.com 143 : it should look like * OK [CAPABILITY IMAP4rev1 ... STARTTLS LOGINDISABLED] ready . LOGINDISABLED in that list is Dovecot's disable_plaintext_auth = yes doing its job - logins are refused until the session is upgraded, which is why a client set to \"no encryption\" fails while the port is plainly open. Test the upgrade itself with openssl s_client -starttls imap -connect mail.example.com:143 ; if STARTTLS is missing from the capability list, the certificate or the ssl_cert path is broken rather than the port. CLOSED , in order: ss -tlnp | grep ':143 ' should show a listener on 0.0.0.0:143 and not 127.0.0.1:143 ; imap has to be in Dovecot's protocols line; the host firewall needs the rule ( sudo ufw status , then sudo ufw allow 143/tcp ); and the router needs a TCP 143 forward to the mail host's current LAN address. Where you have the choice, point remote clients at 993 and leave 143 listening on loopback only.",
  "faq": [
   {
    "q": "What is the difference between port 143 and port 993?",
    "a": "Both serve IMAP. Port 143 opens in cleartext and upgrades to TLS with the STARTTLS command, while 993 negotiates TLS immediately on connect with no plaintext phase. Configure a client for \"STARTTLS\" with 143 or \"SSL/TLS\" with 993 - crossing the two is the most common cause of a client that hangs and then times out."
   },
   {
    "q": "Is IMAP on port 143 encrypted?",
    "a": "Only after STARTTLS succeeds. The session begins in the clear, so a server that permits LOGIN before the upgrade will expose passwords to anything on the path. Set the client to require STARTTLS rather than use it if available, and leave the server's plaintext-auth restriction switched on."
   },
   {
    "q": "Why can't Thunderbird connect to my IMAP server on 143?",
    "a": "The usual causes are the client's connection security set to SSL/TLS instead of STARTTLS, IMAP not enabled in the mail server's protocols list, a missing TCP 143 port-forward, or the server refusing plaintext login before TLS. Run nc mail.example.com 143 to see the capability banner, which tells you immediately whether STARTTLS and LOGINDISABLED are present."
   },
   {
    "q": "Should I expose port 143 to the internet?",
    "a": "Prefer 993 for anything remote. If 143 must be reachable, make sure the server refuses authentication until STARTTLS completes, and keep local consumers such as webmail pointed at 127.0.0.1:143 so the public listener is only there for clients that genuinely need it."
   }
  ]
 },
 "161": {
  "intro": "UDP 161 is where an SNMP agent listens. Your monitoring server sends a GET, GETNEXT or GETBULK naming an OID, and the agent answers with the value - interface counters, CPU, temperature, toner level, UPS runtime. The agent runs on the thing being monitored, which is the direction people get backwards: 161 belongs to the switch, printer or Linux box, not to LibreNMS. Listeners you will meet: snmpd from net-snmp on Linux, the optional SNMP Service on Windows, and the built-in agent in virtually every switch, router, firewall, printer, UPS, NAS and PDU ever shipped. Pollers on the other end are LibreNMS, Zabbix, Observium, PRTG, Cacti and Nagios. A TCP check on 161 will read closed even when SNMP is working. SNMP is UDP in practice; net-snmp can be told to listen on TCP, but essentially nobody does and no NMS expects it. Test the protocol itself instead: snmpwalk -v2c -c public 192.168.1.1 sysDescr.0 from the monitoring host. A timeout means the packet or the reply is not getting through; Authentication failure means it is, and the community is wrong. snmpget -v3 -l authPriv -u monitor -a SHA -A ' ' -x AES -X ' ' 192.168.1.1 sysUpTime.0 for v3. ss -lunp | grep ':161' on the agent. Two failures cover most cases. First, Debian and Ubuntu ship snmpd bound to loopback : /etc/snmp/snmpd.conf contains agentaddress udp:127.0.0.1:161 , so the daemon is running, the firewall is fine, and nothing outside the box can reach it. Change it to agentaddress udp:161,udp6:[::1]:161 and restart. Second, network devices apply their own ACL: on IOS, snmp-server community public RO 10 means access-list 10 decides who may poll, and adding the community without adding the poller to that list produces a silent timeout. Once it answers, scope it. sudo ufw allow from 10.10.0.0/16 to any port 161 proto udp restricts the agent to your management range, and on net-snmp a v3 user with rouser monitor authpriv replaces the community string entirely. There is no version of this where 161 should be reachable from the internet.",
  "faq": [
   {
    "q": "Does SNMP use TCP or UDP?",
    "a": "UDP, port 161 for polling and 162 for traps. The IANA registration covers TCP as well and net-snmp can be configured for it, but real deployments are UDP because a poll is a single request and reply. That means an external TCP port checker cannot verify an SNMP agent."
   },
   {
    "q": "Why does snmpwalk time out when snmpd is running?",
    "a": "On Debian and Ubuntu the packaged snmpd binds only to 127.0.0.1 via the agentaddress line in /etc/snmp/snmpd.conf, so it answers locally and nowhere else. Confirm with ss -lunp | grep ':161'. If it is listening on all addresses, the next suspects are a host firewall rule and, on network gear, the access-list attached to the snmp-server community statement."
   },
   {
    "q": "What is the difference between port 161 and 162?",
    "a": "Port 161 is the agent listening for polls sent by the monitoring system. Port 162 is the monitoring system listening for traps and informs sent unprompted by the device. They run in opposite directions, so the firewall rules for them are not the same rule reversed - both need to be considered separately."
   },
   {
    "q": "Is it safe to expose SNMP to the internet?",
    "a": "No. SNMPv1 and v2c send the community string in cleartext and the default of public is still extremely common, so exposure means anyone can read your device inventory, interface names and topology. SNMP is also a well-used amplification vector because a small GETBULK can return a very large response. Keep it on a management network or a VPN."
   }
  ]
 },
 "162": {
  "intro": "UDP 162 runs in the opposite direction from 161. Here the monitoring server is the listener and the network device is the sender: a switch loses an uplink, a UPS switches to battery, a firewall fails over, and it fires an unsolicited notification at your collector. Getting that direction right fixes most trap problems on its own - the firewall rule you need is device to NMS on 162, not NMS to device. Receivers include snmptrapd from net-snmp (usually feeding snmptt or a handler script), LibreNMS, Zabbix, Observium, PRTG and SolarWinds. Senders are every managed device you own. Traps and informs are not the same thing. A trap is fire and forget: the device sends it once over UDP and never learns whether it arrived. An inform is acknowledged and retried, so a lost inform gets resent and a lost trap leaves no trace anywhere. If you are chasing events that only sometimes appear, switch that device to informs. This checker probes TCP, so 162 will read closed regardless. Debug it on the collector: sudo tcpdump -ni any udp port 162 -vv while you force an event. This answers the only question that matters first: are the packets arriving at all? ss -lunp | grep ':162' to confirm something is bound, and to which addresses. sudo snmptrapd -f -Lo -c /etc/snmp/snmptrapd.conf runs it in the foreground with output to the terminal. Send a test trap by hand: snmptrap -v2c -c public 192.168.1.50 '' SNMPv2-MIB::coldStart sends a coldStart (net-snmp also takes the numeric coldStart OID if the MIBs are not installed). The classic silent failure is authorization, not networking. Since net-snmp 5.3, snmptrapd drops every trap unless you tell it which communities to accept - add authCommunity log,execute,net public to /etc/snmp/snmptrapd.conf (or disableAuthorization yes in a lab). Packets show up perfectly in tcpdump and nothing is ever logged, which sends people back to the firewall for hours. On the sending side, remember that enabling a destination is not the same as enabling the traps. Cisco IOS needs both snmp-server host 10.10.1.50 version 2c public and snmp-server enable traps , and it is worth pinning snmp-server source-interface informs so the source address matches what your NMS expects.",
  "faq": [
   {
    "q": "What is the difference between SNMP port 161 and 162?",
    "a": "Port 161 is the device's agent answering polls from the monitoring system. Port 162 is the monitoring system receiving traps and informs pushed by the device when something happens. The traffic flows in opposite directions, so they need separate firewall rules and the listener is on a different host in each case."
   },
   {
    "q": "Why is snmptrapd not logging my traps?",
    "a": "Almost always authorization. Since net-snmp 5.3, snmptrapd discards traps from communities you have not explicitly allowed, so add authCommunity log,execute,net to /etc/snmp/snmptrapd.conf and restart. Confirm the packets really arrive with sudo tcpdump -ni any udp port 162 before changing anything else."
   },
   {
    "q": "Do I need to open port 162 on my firewall?",
    "a": "Only inbound to the monitoring server, from the management addresses of the devices that send traps. It should never be reachable from the internet, because traps are unauthenticated and the source address is easy to forge, so an exposed receiver can be filled with fabricated alerts."
   },
   {
    "q": "What is the difference between an SNMP trap and an inform?",
    "a": "A trap is sent once with no acknowledgement, so if the packet is lost neither end knows. An inform is acknowledged by the receiver and retransmitted by the sender until it is confirmed. Informs cost more traffic but are the right choice across a WAN link or anywhere loss is plausible."
   }
  ]
 },
 "179": {
  "intro": "TCP 179 carries BGP . A session is nothing more exotic than a TCP connection between two routers that have each been told about the other; either side may initiate, and the collision-detection rules in the protocol sort out the case where both do at once. The speakers are FRRouting (bgpd), BIRD, GoBGP, OpenBGPD, and the routing stacks in IOS, IOS-XR, Junos, EOS and RouterOS. It also runs deep inside modern data centres: an EVPN/VXLAN fabric is BGP end to end, and a Kubernetes cluster using Calico or MetalLB in BGP mode peers with the top-of-rack switch on this same port. People land here with a neighbour stuck in Active or Connect - which means the TCP session is not establishing - rather than in Idle (administratively down or damped) or OpenSent/OpenConfirm (TCP is fine, the BGP OPEN is being rejected). Work it in that order: Is the TCP session forming at all? ss -tnp | grep ':179' on a Linux router shows an ESTABLISHED socket to the neighbour when it is healthy. Can you reach the neighbour address from the right source? update-source must match the address the far end configured, especially when peering loopback to loopback. eBGP defaults to TTL 1, so a neighbour more than one hop away needs ebgp-multihop - a session that never comes up over a firewall or a routed path is often exactly this. A TCP-MD5 password mismatch shows up as the TCP handshake never completing, with no BGP-level error to help you. Check both ends before you suspect the network. ASN, and on the far side the expected local address, must match the neighbour statement exactly, or you get OPEN rejected instead. This checker tests TCP, so an open result on 179 is genuine - and it is a problem. There is no such thing as a BGP session with the general internet; every peer is explicitly configured. Restrict 179 to your neighbours' addresses with an infrastructure ACL or a control-plane policy, authenticate the session with TCP-MD5 (RFC 2385) or TCP-AO, and add GTSM - ttl-security hops 1 , RFC 5082 - so packets that did not come from one hop away are dropped before the TCP stack sees them. Then protect the routing table itself: a maximum-prefix limit, explicit prefix-lists or AS-path filters on what you accept and announce, and RPKI origin validation. Most BGP incidents are not attacks on port 179; they are accepted routes that should have been filtered.",
  "faq": [
   {
    "q": "Why is my BGP session stuck in Active?",
    "a": "Active means the router keeps trying to open the TCP connection on port 179 and failing. Check reachability to the neighbour address from the correct source interface, any firewall or ACL between the two, that eBGP peers are one hop apart or configured with ebgp-multihop, and that the MD5 password matches on both ends - a mismatch stops the TCP handshake with no BGP error message."
   },
   {
    "q": "Should port 179 be open to the internet?",
    "a": "No. BGP only ever peers with neighbours you have explicitly configured, so 179 should accept connections from those addresses alone. Enforce it with an infrastructure ACL or control-plane policing, and add TCP-MD5 or TCP-AO plus GTSM so unauthenticated or distant packets never reach the BGP process."
   },
   {
    "q": "What is the difference between Idle, Connect and Established in BGP?",
    "a": "Idle means the router is not attempting the session, usually because the neighbour is shut down, the address is unreachable, or the session was damped after repeated failures. Connect and Active are the TCP setup phases on port 179. OpenSent and OpenConfirm mean TCP succeeded and the BGP OPEN messages are being exchanged, and Established means the session is up and prefixes can flow."
   },
   {
    "q": "Do I need BGP authentication if the peer link is private?",
    "a": "It is still worth configuring. TCP-MD5 or TCP-AO stops a session being hijacked or reset by anything that can inject packets onto the path, and combined with GTSM it also blunts off-path spoofing. On an internet exchange fabric where many parties share a broadcast segment, treat it as mandatory rather than optional."
   }
  ]
 },
 "389": {
  "intro": "TCP 389 is LDAP itself - the bind, search, modify and compare operations that every directory-integrated application uses to answer who is this user and what groups are they in . UDP 389 is a separate thing: CLDAP , connectionless LDAP, long obsolete for general queries but still answered by Active Directory for the netlogon ping that clients use to discover a domain controller. It is also a well-known DDoS reflection vector, because a short CLDAP netlogon request produces a substantially larger reply that can be aimed at a spoofed victim. Listening here: slapd from OpenLDAP, Active Directory Domain Services on every domain controller, 389 Directory Server, FreeIPA, Samba as an AD DC, and ApacheDS. Connecting to it: Nextcloud, GitLab, Grafana, Jenkins, Jellyfin, Proxmox, VPN concentrators, network printers and roughly everything else with a login screen. Port 389 is genuinely TCP, so this page's checker is meaningful for it - and the meaningful result is the alarming one. If 389 reads OPEN on your public IP, treat that as a finding, not a success. It means a directory server is answering strangers. Encryption on 389 is opportunistic, not automatic. A client may issue the StartTLS extended operation to upgrade the connection in place, but if it does not, or if it silently falls back after a TLS failure, credentials cross in the clear. Active Directory still accepts unsigned simple binds unless LDAP signing is required in policy. This is exactly why 636 exists. When an application cannot bind, test from the application's host rather than from the directory server: ldapsearch -x -H ldap://dc1.example.com -D 'CN=svc,OU=Service,DC=example,DC=com' -W -b 'DC=example,DC=com' '(sAMAccountName=jsmith)' Add -ZZ to force StartTLS and fail rather than fall back to plaintext. ss -ltnp | grep ':389' on the server, and nc -zv dc1.example.com 389 from the client. Can't contact LDAP server (-1) is a network or TLS failure, not a credential problem. Invalid credentials (49) means you reached it and the bind DN or password is wrong - in AD the data code after it distinguishes bad password from locked or expired account. And if searches work for one domain but return nothing across a multi-domain forest, you want the Global Catalog on 3268 rather than 389, which only holds the local domain's naming context.",
  "faq": [
   {
    "q": "What is the difference between port 389 and port 636?",
    "a": "Port 389 starts as a plaintext LDAP connection that may optionally be upgraded with the StartTLS extended operation. Port 636 is LDAPS, which negotiates TLS before any LDAP traffic is sent, the same way HTTPS does. Both can end up equally encrypted, but only 636 is encrypted whether or not the client remembers to ask."
   },
   {
    "q": "Is LDAP on port 389 encrypted?",
    "a": "Not by default. Unless the client issues StartTLS and the server accepts it, a simple bind sends the bind DN and password in cleartext, and every search result comes back the same way. Many clients are configured to fall back to plaintext when TLS fails, which hides the problem. Requiring LDAP signing and channel binding on Active Directory is the usual fix."
   },
   {
    "q": "Should I open port 389 to the internet?",
    "a": "No. It exposes your entire user directory to anonymous or brute-forced queries, it lets credentials cross in the clear when clients skip StartTLS, and the UDP side is a known amplification reflector. Reach the directory over a VPN, or front it with an SSO broker that speaks OIDC or SAML over HTTPS."
   },
   {
    "q": "Why does my application fail to bind to LDAP?",
    "a": "Read the exact error. Can't contact LDAP server means the TCP connection or the TLS handshake failed - check DNS, the firewall and the certificate. Invalid credentials means you reached the server and the bind DN or password is wrong. If searches succeed but users in other domains are missing, query the Active Directory Global Catalog on port 3268 instead."
   }
  ]
 },
 "443": {
  "intro": "Port 443 carries HTTPS : an ordinary TCP connection that immediately negotiates TLS, then speaks HTTP inside it. The listener is normally nginx , Apache , Caddy , HAProxy , Traefik or IIS. Since HTTP/2 and HTTP/3, 443 is also where almost everything else hides — WebSockets, gRPC, VPN-over-TLS clients — precisely because it is the one port that is open nearly everywhere outbound. One thing worth knowing before you read the result: HTTP/3 runs over UDP 443, not TCP . This checker performs a TCP connect, so it tells you about the TCP listener only. A server can be perfectly reachable over QUIC and still fail here if the TCP side is not forwarded, and browsers will happily use TCP first anyway, so a TCP failure is the one that breaks people. Reading the result. OPEN means the TCP handshake to 443 completed from the public internet. It says nothing about your certificate: an expired cert, a wrong hostname in the SAN list, or a broken chain all still read OPEN while every browser shows a full-page warning. If OPEN and the browser still complains, the problem is TLS, not the network — check it with openssl s_client -connect your-domain:443 -servername your-domain and read the chain and the notAfter date. If it reads closed: ss -tlnp | grep ':443 ' on the server. A TLS block in the config does nothing if the listen 443 ssl; line never loaded — nginx -t and systemctl status nginx catch that in seconds. Check the bind address. 127.0.0.1:443 is reachable only from the box itself; you want 0.0.0.0:443 . Host firewall: sudo ufw allow 443/tcp , or sudo firewall-cmd --add-service=https --permanent && sudo firewall-cmd --reload . Prove the path with a listener instead of the app: stop the web server and run nc -l 443 , then re-test. OPEN now means the forward is fine and the web server is the fault. If you proxy the domain through a CDN, the world reaches the CDN, not you — this test hits your raw IP, so a CLOSED result there can be entirely normal and even desirable. Many residential ISPs block inbound 443 along with 80. If neither ever opens no matter what you change, that is the likely answer.",
  "faq": [
   {
    "q": "Is it safe to open port 443 to the internet?",
    "a": "Yes, in the sense that 443 is designed for it — every public website on the internet is reachable there. The risk lives in the application behind it: keep the software patched, use a valid certificate, disable TLS 1.0 and 1.1, and do not expose admin panels on the same vhost without authentication."
   },
   {
    "q": "Why does port 443 show open but HTTPS still fails?",
    "a": "The check is a TCP connect and completes before TLS is negotiated. An expired certificate, a hostname missing from the certificate's SAN list, an incomplete intermediate chain, or a protocol mismatch will all leave the port OPEN while browsers refuse to load the page. Run openssl s_client -connect host:443 -servername host to see the real handshake."
   },
   {
    "q": "Do I need both port 80 and 443 open?",
    "a": "443 carries the encrypted traffic and is the one that matters. Port 80 is still worth forwarding so that visitors who type a bare hostname get redirected instead of an error, and so Let's Encrypt HTTP-01 renewals keep working. If you use the DNS-01 challenge, 443 alone is enough."
   },
   {
    "q": "Does this test HTTP/3 or QUIC on port 443?",
    "a": "No. HTTP/3 uses QUIC over UDP 443, and this checker opens a TCP connection. UDP has no handshake, so an external test cannot reliably distinguish an open UDP port from a filtered one unless the application chooses to answer. Test the TCP listener here and verify QUIC with a client such as curl --http3."
   }
  ]
 },
 "445": {
  "intro": "Port 445/TCP is SMB over direct TCP - the file and printer sharing protocol Windows registered as microsoft-ds . The listener is the Windows Server service ( LanmanServer ), Samba's smbd on Linux, macOS File Sharing, or the SMB stack inside a NAS. Since Windows 2000, SMB no longer needs the NetBIOS wrapper on 139; 445 is the modern path and the only one you should keep. People arrive here wanting to map a drive to the house NAS from somewhere else. The honest answer is that this is the one port on the site where the correct configuration is no forward at all . SMB assumes a trusted LAN. Exposed to the internet it is swept continuously; MS17-010 (EternalBlue) turned an unauthenticated SMB flaw into WannaCry and NotPetya in 2017; and even without a vulnerability, every login attempt hands over a NetNTLM response an attacker can relay or crack offline. The reverse direction is just as bad: a document that references a share on a hostile server makes your machine authenticate outbound and leak the same hash, which is why 445 should be blocked outbound too. CLOSED / filtered is the result you want. If the check says OPEN , treat it as an incident: remove the forward or DMZ-host entry, disable UPnP so nothing recreates it, then check the machine for shares and accounts you did not create. Note that most residential ISPs and cloud providers filter 445 in both directions, so a forward you configured carefully may never have worked - and that filtering is doing you a favour. For the LAN case, where 445 legitimately needs to answer: ss -tlnp | grep :445 on Linux, or Get-SmbServerConfiguration and Get-SmbShare on Windows, to confirm the service and the shares. From a client, smbclient -L //10.0.0.5 -U user lists shares and separates \"port unreachable\" from \"credentials rejected\". Scope the firewall to the LAN rather than the world: sudo ufw allow from 10.0.0.0/24 to any port 445 proto tcp . Remove SMB1 if it is still present: Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol , and on Samba keep server min protocol = SMB2_10 or higher. Then reach it remotely the safe way: bring up WireGuard, connect, and mount \\\\10.0.0.5\\share across the tunnel. Same drive letter, no exposed port.",
  "faq": [
   {
    "q": "Is it safe to open port 445 to the internet?",
    "a": "No, and there is no configuration that makes it safe enough to be worth it. SMB is designed for trusted local networks; exposed, it is continuously scanned, it has produced wormable remote code execution such as MS17-010, and authentication attempts against it leak NetNTLM hashes that can be relayed or cracked. Use a VPN, or an HTTPS file service like Nextcloud or WebDAV, for remote access."
   },
   {
    "q": "Why is my ISP blocking port 445?",
    "a": "Because SMB worms spread over it and residential customers essentially never need it from outside, most consumer ISPs and cloud providers filter 445 inbound and often outbound as well. That is why a correctly configured port-forward can still read closed here. The filtering protects you, and the right fix is a VPN rather than asking the ISP to unblock it."
   },
   {
    "q": "What is the difference between port 445 and port 139?",
    "a": "445 carries SMB directly over TCP; 139 carries the same SMB inside a NetBIOS session, the pre-Windows 2000 arrangement. Modern clients prefer 445 and only fall back to 139 for legacy peers, so disabling NetBIOS over TCP/IP closes 139 while file sharing continues to work on 445."
   },
   {
    "q": "How do I access my SMB shares from outside my home network?",
    "a": "Put a VPN in front of them. Run WireGuard or Tailscale on the router, NAS or a small always-on host, connect from the remote device, then map the share by its private address exactly as you would on the LAN. If you would rather not run a VPN, serve the files over HTTPS with something built for the internet, such as Nextcloud or a WebDAV endpoint behind a reverse proxy with authentication."
   }
  ]
 },
 "465": {
  "intro": "Port 465 is message submission over implicit TLS : the TLS handshake happens the instant the connection opens, before a single byte of SMTP is exchanged. Same job as 587 - an authenticated client handing a message to a server that relays it - but with no cleartext phase for anyone to strip. Postfix calls the service smtps and turns it on with smtpd_tls_wrappermode=yes ; Exim uses tls_on_connect_ports ; OpenSMTPD, Stalwart and Exchange all offer the equivalent. Its history explains most of the confusion around it. IANA assigned 465 to smtps in 1997, revoked the assignment a year later in favour of STARTTLS on 587, then re-registered it in 2018 as submissions in RFC 8314 - which recommends implicit TLS over STARTTLS for new deployments. So \"465 is deprecated\" was true for twenty years and is not true now. The reason most people are on this page is a client or an app configured for \"SSL/TLS\" on 465 that hangs or reports a reset connection. Nine times in ten the two ends disagree about which kind of TLS. Point a client set to STARTTLS at 465 and the server sits waiting for a handshake while the client waits for a 220 greeting until something times out. The pairing is SSL/TLS with 465, STARTTLS with 587 - never crossed. OPEN means something completed a TCP handshake on 465 from the internet. Prove it is really implicit TLS with openssl s_client -connect mail.example.com:465 , with no -starttls flag: you should get a certificate chain and then the 220 banner. If a plaintext banner appears before any certificate, a normal SMTP service is sitting on 465 and every client set to SSL/TLS will fail against it. CLOSED , in the order worth checking: ss -tlnp | grep ':465 ' for a listener bound to 0.0.0.0:465 rather than loopback; the smtps service in Postfix's master.cf , which ships commented out; the host firewall with sudo ufw status and sudo ufw allow 465/tcp ; then the router's TCP 465 forward to the mail host's current LAN address. Note that 465 is submission only - other mail servers deliver to your MX on port 25 and will never try 465, so opening it does nothing for receiving mail.",
  "faq": [
   {
    "q": "Is port 465 deprecated?",
    "a": "No, not any more. IANA revoked the original smtps assignment in 1998 in favour of STARTTLS on 587, which is where the reputation came from, but RFC 8314 re-registered 465 as \"submissions\" in 2018 and recommends implicit TLS for new client deployments. Both 465 and 587 are current and most mail servers offer both."
   },
   {
    "q": "Should I use port 465 or 587?",
    "a": "Either works for authenticated submission. 465 is simpler to get right because TLS is mandatory from the first byte and there is no downgrade to worry about; 587 is more universally supported by older clients and appliances. If a device offers only one, match the client's TLS setting to the port: SSL/TLS with 465, STARTTLS with 587."
   },
   {
    "q": "Why does openssl s_client -starttls smtp fail on port 465?",
    "a": "Because there is nothing to upgrade. The -starttls flag tells openssl to speak plaintext SMTP first and issue a STARTTLS command, but 465 expects a TLS ClientHello immediately. Drop the flag and use openssl s_client -connect host:465 to see the certificate and the banner."
   },
   {
    "q": "Can other mail servers deliver to me on port 465?",
    "a": "No. Server-to-server delivery only ever targets port 25 on the host named by your MX record. Port 465 is for authenticated clients submitting outbound mail, so it does not help inbound delivery and can stay closed if no clients connect from outside."
   }
  ]
 },
 "500": {
  "intro": "UDP 500 carries IKE , the key exchange that builds an IPsec tunnel (the older name, ISAKMP, is still what you will see in /etc/services and in Cisco output). The daemons that bind it are strongSwan (charon), Libreswan (pluto), Windows Server RRAS, and the IPsec stacks inside OPNsense, pfSense, Cisco ASA and IOS, FortiGate and RouterOS. No user traffic ever crosses port 500 - it negotiates keys and nothing else. The data rides in ESP, which is IP protocol 50, not a port at all , and that one fact is behind most broken IPsec port-forwards. People usually arrive here with a site-to-site tunnel or an IKEv2 client that never comes up, with logs that stop after IKE_SA_INIT went out and nothing came back. Before you edit the proposal lists again, prove the packet is arriving. What the checker on this page can tell you: nothing about port 500. It opens a TCP connection to your own public IP, and 500 is UDP only. A correctly working VPN gateway has no TCP listener there, so closed is the expected and meaningless answer. Test UDP properly instead: On the gateway, ss -lunp | grep ':500' should show charon or pluto bound to 0.0.0.0:500 , not to one internal address. From the outside, ike-scan -M 203.0.113.10 makes a real IKE gateway answer with a handshake payload. Silence means your packet never landed. On the gateway while a client dials in: tcpdump -ni any udp port 500 or udp port 4500 . If the inbound packet never appears, the problem is upstream - the router forward or the ISP - not your config. Open both ports: ufw allow 500/udp and ufw allow 4500/udp , and forward both to the same internal host. If either peer sits behind NAT, IKE detects it during the first exchange and moves the conversation to UDP 4500 , wrapping ESP inside UDP so a NAT device can keep a mapping for it. The practical rule is to forward 500 and 4500 together, every time. If you genuinely want native ESP with no NAT-T, the router in the middle also has to pass IP protocol 50, which consumer firmware usually exposes as an IPsec passthrough toggle rather than as a port rule.",
  "faq": [
   {
    "q": "Do I need to forward both UDP 500 and 4500 for IPsec?",
    "a": "Yes, forward both to the same internal gateway. UDP 500 carries the IKE negotiation, and as soon as either peer is detected behind NAT the session floats to UDP 4500 and encapsulates ESP inside UDP. Forwarding only 500 gives you a tunnel that negotiates and then passes no traffic."
   },
   {
    "q": "What is the difference between port 500 and port 4500?",
    "a": "Port 500 is plain IKE with the data plane running as native ESP (IP protocol 50). Port 4500 is the NAT traversal path: both the remaining IKE messages and the ESP payload are wrapped in UDP so NAT devices can translate them. A four-byte non-ESP marker at the start of a 4500 packet is what tells the receiver whether it is IKE or encapsulated ESP."
   },
   {
    "q": "Why is my IPsec VPN stuck at phase 1?",
    "a": "Either the IKE packet is not arriving or the two proposals do not intersect. Run tcpdump on udp port 500 at the responder: if you see nothing, fix the forward or the firewall first. If you do see the packet and the session still fails, compare encryption, integrity, DH group, IKE version and the identity/PSK on both ends - a mismatched local ID is a very common cause of NO_PROPOSAL_CHOSEN."
   },
   {
    "q": "Can I test whether UDP port 500 is open from the internet?",
    "a": "Not with a TCP connect test like the one on this page. UDP has no handshake, so the only reliable check is to send something the service will answer: ike-scan sends a valid IKE proposal and prints the response, which proves the whole path end to end. Silence still cannot distinguish a firewall drop from a dead daemon, so pair it with a tcpdump on the gateway."
   }
  ]
 },
 "514": {
  "intro": "Port 514 has a split personality, which is why /etc/services lists two different names for it. UDP 514 is syslog - the BSD-style logging protocol of RFC 3164, later restructured as RFC 5424 - and that is what your switches, firewalls, hypervisors and Linux hosts are sending. TCP 514 is historically shell , the Berkeley rsh remote execution service, which nobody should be running in this decade. In practice rsyslog and syslog-ng also listen on TCP 514 for reliable, framed delivery (RFC 6587), so a TCP result on this page can mean either thing. That makes the check here genuinely informative: if 514 reads OPEN on your public IP, find out which of the two it is right now. An internet-facing rsh daemon is a compromise waiting to happen, and an internet-facing collector is not much better. Collectors you will meet on 514: rsyslog and syslog-ng, Graylog, Splunk, Logstash, Wazuh and nxlog. Senders are everything else. When the collector receives nothing, work from the receiving end outward: sudo tcpdump -ni any udp port 514 -A while you generate an event. If nothing appears, it is a network or sender problem; if messages appear but never land in a file, it is a configuration problem. ss -lunp | grep ':514' - rsyslog does not listen by default. You must uncomment module(load=\"imudp\") and input(type=\"imudp\" port=\"514\") in /etc/rsyslog.conf , or the imtcp equivalents for TCP. sudo ufw allow 514/udp and check ufw status verbose . Send a test message from another host: logger -n 10.10.1.60 -P 514 -d \"test from $(hostname)\" - the -d flag selects UDP. On the sending side, set the source explicitly so your filters match: Cisco IOS wants logging host 10.10.1.60 , logging trap informational and logging source-interface Loopback0 ; Junos uses set system syslog host 10.10.1.60 any info . Remember that UDP syslog silently discards messages under load and has a small message size limit, so a busy firewall will drop records you never learn about - TCP or TLS transport is the fix, not a bigger buffer. If logs must cross a link you do not control, move to 6514 , syslog over TLS, and require certificates. Nothing about port 514 was designed for that job.",
  "faq": [
   {
    "q": "Does syslog use TCP or UDP?",
    "a": "Traditionally UDP 514, which is fire and forget: messages that are lost or dropped under load leave no trace. Most modern daemons also support TCP 514 for reliable delivery with framing as described in RFC 6587, and TLS on 6514 per RFC 5425. UDP is still the default on most network hardware."
   },
   {
    "q": "Why is my syslog server not receiving messages?",
    "a": "Check in this order: tcpdump on the collector to see whether packets arrive, ss -lunp to confirm something is bound to 514, and the sender's own configuration. On rsyslog the imudp module is commented out by default, so the daemon runs happily while listening for nothing but local traffic."
   },
   {
    "q": "What is running on TCP port 514?",
    "a": "Two different things share the number. Historically TCP 514 is the Berkeley rsh remote shell service, which is why /etc/services calls it shell. Today it is far more likely to be rsyslog or syslog-ng accepting syslog over TCP. If you find it open on a public address, identify which before doing anything else."
   },
   {
    "q": "How do I send syslog over TLS?",
    "a": "Use port 6514, defined by RFC 5425 for syslog over TLS. In rsyslog that means loading the gtls driver with certificate, key and CA paths on both sides and using the omfwd output with StreamDriverMode 1; syslog-ng and Graylog have equivalent settings. It gives you encryption plus authentication of the sender, which plain 514 has neither of."
   }
  ]
 },
 "548": {
  "intro": "TCP port 548 carries the Apple Filing Protocol over TCP . What listens there today is almost always afpd from Netatalk - on a Linux box, or inside the AFP service on a Synology or QNAP NAS. Older versions of macOS File Sharing also served AFP here. It is the protocol Finder speaks when you connect to afp:// . AFP is on the way out. Apple has treated SMB as the default for macOS file sharing since OS X Mavericks, Time Machine has supported SMB destinations for many releases, and NAS vendors now ship AFP disabled or deprecated. If you are standing up something new, use SMB on port 445 and do not think about 548 again. The reason people end up testing this port is usually one of two: The share is invisible. Finder finds AFP servers through Bonjour (multicast DNS on UDP 5353), and multicast does not route beyond the local link. Across a VPN or a routed subnet the share will never appear in the sidebar even when the service is perfectly healthy. Connect explicitly instead: Finder → Go → Connect to Server , then afp://192.168.1.50 . If that works, nothing was broken but discovery. Connect to Server times out. Then check reachability. On the server, ss -tlnp | grep 548 should show afpd ; systemctl status netatalk tells you if it is running at all. From a client, nc -zv 192.168.1.50 548 is the one-line test. On a NAS, AFP is a checkbox in the file-services panel that DSM-style upgrades often turn off for you. An OPEN result on this check means port 548 on your public IP accepted a TCP connection from the internet, and that is not a result to be pleased about - see below. CLOSED / filtered is the correct state for a home or office NAS. Never forward 548. AFP predates the assumption that a file server might be internet-facing: the login can be hashed but the file data itself is not encrypted in transit, and Netatalk has a documented history of pre-authentication remote-code-execution bugs, several of which were actively exploited against NAS appliances. If you need your Mac to reach the share from outside, bring up WireGuard or your NAS vendor's VPN, connect the tunnel, then use afp:// to the private address as if you were at home.",
  "faq": [
   {
    "q": "What port does AFP use?",
    "a": "TCP 548 for Apple Filing Protocol over TCP. Discovery of AFP servers is separate and uses Bonjour, which is multicast DNS on UDP 5353 and only works on the local link. Very old AppleTalk-era setups used a different transport entirely, but anything current is TCP 548."
   },
   {
    "q": "Why doesn't my AFP share show up in Finder?",
    "a": "Finder lists file servers it has discovered over Bonjour, and multicast DNS does not cross subnets or most VPN tunnels. The service can be running and reachable while never appearing in the sidebar. Use Go then Connect to Server and type afp:// to connect directly, which bypasses discovery entirely."
   },
   {
    "q": "Should I use AFP or SMB for Time Machine?",
    "a": "SMB. Apple made SMB the default for macOS file sharing years ago, Time Machine supports SMB destinations, and NAS vendors are retiring their AFP services. AFP is worth keeping only for older Macs that cannot do SMB backups, and even then only on the local network."
   },
   {
    "q": "Is it safe to expose port 548 to the internet?",
    "a": "No. AFP was designed for trusted local networks: file data is not encrypted in transit, and Netatalk - the implementation behind most Linux and NAS AFP shares - has had several pre-authentication remote-code-execution vulnerabilities exploited against internet-facing NAS devices. Reach the share through a VPN instead of forwarding the port."
   }
  ]
 },
 "554": {
  "intro": "TCP 554 is the RTSP control channel . RTSP itself moves no video: it carries the DESCRIBE, SETUP, PLAY and TEARDOWN commands, and the actual frames arrive as RTP either on separately negotiated UDP ports or interleaved back inside the same TCP connection . That second mode is what ffmpeg -rtsp_transport tcp and VLC's default behaviour select, and it is why a stream can work perfectly through a single forwarded TCP port. UDP 554 is registered but is not what cameras and clients actually use for control. Almost everything listening on 554 is a camera or an NVR. The URL layout is vendor-specific - Hikvision uses rtsp://user:pass@host:554/Streaming/Channels/101 , Dahua and Amcrest /cam/realmonitor?channel=1&subtype=0 , Reolink /h264Preview_01_main - and getting the path wrong produces a 404 that looks exactly like a network problem. The checker on this page tests TCP, so a result for 554 is real. That is the problem: most people arrive here after forwarding 554 so they can watch a camera from work, and an open reading means it worked. Consumer cameras are the worst-maintained devices on any network, many allow RTSP with no credentials or with the same default password as the web UI, and scanners index open 554 endpoints continuously and republish the feeds. Treat an open 554 on your WAN as something to remove, not to celebrate. Do it this way instead: Keep cameras on an isolated VLAN with no internet access at all, and let an NVR - Frigate, ZoneMinder, Blue Iris, go2rtc - pull the RTSP streams locally. Reach the NVR from outside over WireGuard or a mesh VPN, or publish only its web UI through a reverse proxy that enforces authentication. Test the stream itself from inside the network first: ffprobe -rtsp_transport tcp \"rtsp://user:pass@10.10.20.31:554/Streaming/Channels/101\" prints the codec and resolution if the path and credentials are right. nc -zv 10.10.20.31 554 only proves the port answers. Check what is bound and where: ss -tlnp | grep 554 on a Linux streaming host. If a camera answers on 554 but the stream stalls, force TCP transport before you blame the network - interleaved RTP over the existing TCP session avoids the separate UDP media ports entirely.",
  "faq": [
   {
    "q": "Should I forward port 554 to view my IP camera remotely?",
    "a": "No. Camera RTSP services are frequently unauthenticated or use the default password, the firmware is rarely updated, and open 554 endpoints are catalogued by public scanners within days. Use a VPN such as WireGuard to reach the camera network, or run an NVR locally and expose only that behind authentication."
   },
   {
    "q": "Is RTSP on port 554 TCP or UDP?",
    "a": "The RTSP control channel is TCP 554. The media that follows is RTP, which can travel on separate UDP ports or be interleaved inside the same TCP connection. Cameras and clients almost always use TCP for control, and TCP interleaving for media is what makes a single port-forward work at all."
   },
   {
    "q": "Why does my RTSP stream connect but show nothing?",
    "a": "Usually the media path, not the control path. If RTP is going over UDP, those ports have to reach you too, so force interleaved TCP with ffmpeg's -rtsp_transport tcp or VLC's RTP over RTSP setting. A wrong stream path also produces a clean connection with a 404 or 454 response, so verify the vendor's URL format."
   },
   {
    "q": "What is the RTSP URL for my camera?",
    "a": "It is vendor-specific. Hikvision uses /Streaming/Channels/101 for the main stream and 102 for the substream, Dahua and Amcrest use /cam/realmonitor?channel=1&subtype=0, and Reolink uses /h264Preview_01_main. Confirm in the camera's own web interface, and test with ffprobe before wiring it into an NVR."
   }
  ]
 },
 "587": {
  "intro": "Port 587 is the message submission port defined by RFC 6409: the port a mail client or an application uses to hand a message to a server that will relay it onward. The listener is a submission service on Postfix (the submission line in master.cf ), Exim , OpenSMTPD , Stalwart or Microsoft Exchange , and unlike port 25 it is supposed to demand SMTP AUTH from every client. Port 25 carries servers talking to servers; 587 carries people. The connection starts in the clear and upgrades in place: the client sends EHLO , the server advertises 250-STARTTLS , the client issues STARTTLS and TLS is negotiated inside the existing session. That is the whole difference from 465, which is TLS from the first byte. It also means encryption on 587 is opportunistic unless both ends insist on it - set the client to STARTTLS required , never \"if available\", and on the server refuse AUTH until TLS is up. Most visitors arrive here because a phone or a desktop client reports \"could not connect to outgoing server\", or because a self-hosted mail server works on the LAN and fails from anywhere else. This checker connects to 587 on your own public IP from the outside, which is the same path your phone takes on mobile data. Testing from inside your own network proves nothing, because that traffic never reaches the router's WAN side. OPEN means a submission listener answered. Verify it is really doing TLS and AUTH rather than just accepting TCP: run openssl s_client -starttls smtp -connect mail.example.com:587 , then type EHLO test and look for 250-AUTH PLAIN LOGIN in the reply. If AUTH is advertised before the STARTTLS upgrade, fix that before anyone uses the server. CLOSED most often means the submission service was never enabled. In a stock Postfix install the submission inet n - y - - smtpd line in master.cf is commented out, and ss -tlnp | grep ':587 ' will show nothing at all. After that, work outward: sudo ufw status and sudo ufw allow 587/tcp on the host, then a TCP 587 forward on the router pointing at the mail host's current LAN address, then whether your hosting provider filters the port. A useful split test is to hold the port open with nc -l 587 on the mail host and re-run the check - if that reads open, the path is fine and the mail daemon is the problem.",
  "faq": [
   {
    "q": "What is the difference between port 587 and port 465?",
    "a": "Both carry authenticated message submission from a client to a server. Port 587 starts as plaintext and upgrades with the STARTTLS command, while 465 wraps the whole session in TLS from the first byte. RFC 8314 recommends 465 for new deployments, but 587 remains the more widely supported of the two, and most servers offer both."
   },
   {
    "q": "Why can't my mail client connect on port 587?",
    "a": "The usual causes are a submission service that was never enabled in the mail server config, a client set to \"SSL/TLS\" instead of \"STARTTLS\" for that port, a missing port-forward on the router, or a network that filters outbound 587. Test from the client side with nc -zv mail.example.com 587 to separate a reachability problem from an authentication problem."
   },
   {
    "q": "Is port 587 encrypted?",
    "a": "Not automatically. The session begins in cleartext and is only encrypted once STARTTLS succeeds, so a server that still accepts AUTH before the upgrade will leak passwords to anyone on the path. Configure the server to require TLS before authentication and set the client to require STARTTLS rather than accept it opportunistically."
   },
   {
    "q": "Do I need to open port 587 on my firewall?",
    "a": "Only if mail clients connect from outside your network. If everything that submits mail lives on the same host or LAN, bind the submission service to an internal address and leave the port closed to the internet. An exposed 587 will start receiving password-guessing attempts almost immediately."
   }
  ]
 },
 "593": {
  "intro": "Port 593/TCP is the RPC over HTTP endpoint mapper , the ncacn_http transport. It does the same job as port 135 - tell a caller where an RPC interface lives - but frames the conversation as HTTP so it can pass through proxies that would drop raw DCE/RPC. On Windows it belongs to the RPC over HTTP Proxy role service, which runs alongside IIS. Its heyday was Outlook Anywhere : an Outlook client on the internet spoke HTTPS on 443 to an Exchange front end, and the RPC/HTTP proxy behind it relayed the RPC calls internally to the endpoint mapper on 593 and on to the mailbox service ports. Modern Exchange and modern Outlook use MAPI over HTTP instead, so on a current estate 593 is mostly a leftover. Which means almost nobody arrives here from a broken port-forward. The realistic reasons are a vulnerability scan that flagged 593 as reachable, a firewall review after CVE-2022-26809 (the Windows RPC runtime flaw whose mitigation advice named 593 next to 135), or curiosity about a line in a nmap report. For all three, CLOSED / filtered is the answer you want, and it is what this check should return. If it reads OPEN : Find the forward. On the router, look for a rule sending 593 - or a DMZ host mapping every port - to a Windows server, and delete it. On the server, netstat -ano | findstr :593 identifies the process, and Get-WindowsFeature RPC-over-HTTP-proxy tells you whether the role service is even installed. If nothing legitimately uses it, remove the feature rather than leaving a listener nobody owns. Write the edge rule as a block on the whole Windows RPC and SMB group at once - 135, 137, 138, 139, 445 and 593 - because partial lists are how 593 survives cleanups. If you genuinely need RPC-based services from outside, the modern shape is a reverse proxy or a published web endpoint on 443 that authenticates the user before anything RPC-flavoured is reached, or a VPN that puts the client on the inside. Exposing the mapper directly - on 135 or on 593 - gives an unauthenticated stranger a conversation with a service that has produced remote code execution more than once.",
  "faq": [
   {
    "q": "What is port 593 used for?",
    "a": "It carries DCE/RPC over an HTTP framing (ncacn_http) and acts as the endpoint mapper for that transport, the way TCP 135 does for raw RPC. On Windows it is provided by the RPC over HTTP Proxy role service, historically as the back end for Outlook Anywhere."
   },
   {
    "q": "Is port 593 the same as port 135?",
    "a": "They serve the same function - resolving an RPC interface to a concrete endpoint - over different transports. 135 is raw DCE/RPC over TCP; 593 wraps it in HTTP so it survives proxies. Because they are equivalent in effect, a firewall policy that blocks 135 but forgets 593 leaves the door open."
   },
   {
    "q": "Should I block port 593 at the firewall?",
    "a": "Yes, inbound from the internet, in the same rule as 135, 137-139 and 445. Microsoft's guidance during the CVE-2022-26809 RPC runtime advisory explicitly named 593 alongside 135, and there is no internet-facing use case for the endpoint mapper in either form."
   },
   {
    "q": "Does Exchange still need port 593?",
    "a": "Current Exchange and Outlook use MAPI over HTTP rather than RPC over HTTP, so a modern deployment does not depend on it. Where it survives it is usually a legacy Outlook Anywhere path or a role service left installed on a server that no longer needs it - check with Get-WindowsFeature RPC-over-HTTP-proxy before removing it."
   }
  ]
 },
 "631": {
  "intro": "631 is the Internet Printing Protocol port. IPP is HTTP underneath, which is why http://host:631/ in a browser gives you the full CUPS administration interface, and why printer URIs look like ipp://printer.local:631/ipp/print . Nearly every modern network printer speaks it, AirPrint and IPP Everywhere are built on it, and on Linux and macOS the local CUPS daemon owns the port. The situation that brings people here is a CUPS box that prints locally but is invisible to the rest of the LAN. CUPS listens on loopback only by default. In /etc/cups/cupsd.conf you need: Listen 0.0.0.0:631 in place of Listen localhost:631 , Allow @LOCAL (or Allow 192.168.1.0/24 ) inside the <Location /> block — the listener and the access rules are separate, and getting one without the other produces a connection that opens and then returns 403 Forbidden , Browsing On and BrowseLocalProtocols dnssd if you want clients to discover the queue automatically. Then systemctl restart cups , and verify with ss -tlnp | grep :631 and lpstat -H . From a client, nc -zv 192.168.1.30 631 separates a network problem from a CUPS policy problem. Reading the result. CLOSED is correct for a home or office connection. OPEN means your print server, or a printer you forwarded, is answering the internet — and 631 is not a dumb print pipe, it is an admin plane: the CUPS web interface can add printers, and a printer's own IPP stack will happily accept jobs from strangers until the paper runs out. Note also that cups-browsed historically listened on UDP 631 on all interfaces and trusted whatever it received, which was the entry point for the 2024 remote code execution chain; disable it if you do not need automatic queue discovery. If it reads open, delete the port-forward, keep CUPS restricted to @LOCAL , and reach your printer from outside over WireGuard — mobile printing works fine through a tunnel.",
  "faq": [
   {
    "q": "What port does CUPS use?",
    "a": "TCP 631, which serves both the IPP print path and the CUPS web administration interface, since IPP is layered on HTTP. The legacy CUPS browsing daemon cups-browsed also uses UDP 631 to learn about remote queues, though modern setups discover printers over mDNS on 5353 instead."
   },
   {
    "q": "Why can other computers not reach my CUPS server?",
    "a": "By default cupsd listens only on localhost and its Location blocks allow only the local machine. Set Listen 0.0.0.0:631 and add Allow @LOCAL to the and blocks in /etc/cups/cupsd.conf, then restart cups. A connection that opens but returns 403 means the listener is right and the access policy is not."
   },
   {
    "q": "Should I forward port 631 to print from outside my network?",
    "a": "No. Port 631 exposes the CUPS administration interface and an unauthenticated print path, and it has a poor security history — the cups-browsed vulnerabilities disclosed in September 2024 allowed remote code execution against anyone reachable on that port. Use a VPN and print to the printer's LAN address instead."
   },
   {
    "q": "Is IPP on port 631 encrypted?",
    "a": "Not automatically. Plain IPP on 631 is HTTP, so job data and any credentials are cleartext; CUPS can upgrade a connection to TLS on the same port with an HTTP Upgrade, and IPPS (ipps://) uses TLS from the start, usually on 631 as well. On a LAN this rarely matters, but it is another reason not to send print jobs across the internet on this port."
   }
  ]
 },
 "636": {
  "intro": "TCP 636 is LDAPS: LDAP wrapped in TLS from the first byte, the way HTTPS wraps HTTP. It is the ldaps:// URL scheme. Strictly speaking the LDAP standards preferred StartTLS on 389 and never ratified LDAPS in an RFC, but Active Directory and almost every client library implement 636 anyway, so it is permanent in practice and usually the safer choice - there is no negotiation step a misconfigured client can skip. Unlike most of the neighbouring management ports, 636 really is TCP, so the checker on this page tells you something real. An OPEN result on your public IP is bad news, not confirmation. A directory server answering the internet is a finding to fix, whether or not the traffic is encrypted; TLS stops people reading the passwords, it does not stop them guessing them. The most common reason people are here is the opposite problem: 636 will not come up at all. Active Directory. There is no switch to enable LDAPS. A domain controller starts listening on 636 automatically once a suitable certificate is present in the computer's Personal store - Server Authentication in the EKU, the DC's fully qualified name in the subject or SAN, private key present, and a chain the DC trusts. Install it, restart Active Directory Domain Services, and the port appears. Verify with ldp.exe connecting to port 636 with SSL ticked. OpenLDAP. slapd only binds 636 if it is started with the service listed. On Debian and Ubuntu that means SLAPD_SERVICES=\"ldap:/// ldapi:/// ldaps:///\" in /etc/default/slapd , plus olcTLSCertificateFile , olcTLSCertificateKeyFile and olcTLSCACertificateFile in cn=config , and a key readable by the openldap user. Then test it properly: openssl s_client -connect dc1.example.com:636 -showcerts </dev/null - check the subject, the SAN list and the expiry date, and that the chain verifies. ldapsearch -x -H ldaps://dc1.example.com -b '' -s base namingContexts is an anonymous root DSE read that proves TLS and LDAP both work before you involve credentials. ss -ltnp | grep ':636' on the server, nc -zv dc1.example.com 636 from the client. If a client fails with a certificate error, fix the trust chain rather than setting TLS_REQCERT never in ldap.conf - that turns LDAPS back into a connection anyone in the path can impersonate.",
  "faq": [
   {
    "q": "What is the difference between LDAPS and StartTLS?",
    "a": "LDAPS on port 636 negotiates TLS immediately, before any LDAP message is exchanged. StartTLS runs on port 389 and upgrades an already-open plaintext connection using an LDAP extended operation. LDAPS is harder to get wrong because there is no window in which a client can decide to continue unencrypted."
   },
   {
    "q": "Why is port 636 not listening on my domain controller?",
    "a": "Because there is no valid certificate in the domain controller's own computer certificate store. Active Directory has no LDAPS enable option; it starts listening on 636 as soon as it finds a certificate with the Server Authentication EKU, the DC's FQDN, and an accessible private key. Install one, restart the AD DS service, and test with ldp.exe over SSL."
   },
   {
    "q": "How do I test an LDAPS certificate?",
    "a": "Run openssl s_client -connect server:636 -showcerts and read the returned chain: confirm the name your clients use appears in the subject alternative name, check the expiry date, and confirm the issuer chains to a CA your clients trust. Then do a real query with ldapsearch -x -H ldaps://server -b '' -s base."
   },
   {
    "q": "Is it safe to expose LDAPS to the internet?",
    "a": "It is safer than exposing 389, but it is still a login endpoint for your whole directory that anyone can reach, so credential stuffing will lock accounts out and user enumeration is often possible. Prefer a VPN, or front it with an identity broker that speaks OIDC or SAML over HTTPS and can enforce MFA and rate limiting."
   }
  ]
 },
 "873": {
  "intro": "Port 873 belongs to the rsync daemon protocol - rsync --daemon reading /etc/rsyncd.conf , the rsync service on a Synology or TrueNAS box, or the public mirror endpoints you see written as rsync://mirror.example.org/module/ . It exposes named modules , each mapping to a directory, with their own permissions and optional accounts. The first thing to settle is whether you need this port at all, because rsync over SSH does not use it . A command like rsync -avz /srv/data user@host:/backup/ is transported entirely inside SSH on port 22; rsync just runs itself on the far end. Port 873 is only involved with the double-colon or URL forms: rsync -av host::module/ /local/ and rsync -av rsync://host/module/ /local/ . If your backup script uses the single-colon form, testing 873 tells you nothing - test port 22. When a genuine daemon pull fails you normally get rsync: failed to connect to host (203.0.113.10): Connection refused (111) . Work through it in this order: Is it running? ss -tlnp | grep 873 and systemctl status rsync . On Debian and Ubuntu the packaged unit reads /etc/rsyncd.conf and is disabled by default - sudo systemctl enable --now rsync . Is it bound where you think? An address = 127.0.0.1 line in rsyncd.conf produces exactly this symptom from every other host. Firewall: sudo ufw status , then sudo ufw allow 873/tcp , plus the port-forward on the router. Does the module exist? rsync rsync://203.0.113.10/ lists the modules the daemon is publishing. An empty list means the config parsed but defined nothing. Then think hard about the exposure. The daemon protocol is not encrypted : with auth users set, the password itself is protected by a challenge-response exchange, but every byte of file content and every path crosses the wire in the clear. Worse, a module with no auth users line is anonymous, and scanners find those quickly. Minimum sane config: auth users , a secrets file at mode 0600, read only = yes on anything you are not deliberately accepting writes into, and a hosts allow list. Better: bind the daemon to a WireGuard address, or drop the daemon and let SSH carry it.",
  "faq": [
   {
    "q": "Does rsync use port 22 or port 873?",
    "a": "Both, depending on the syntax. rsync over SSH - user@host:/path, with a single colon - uses port 22 and never touches 873. The rsync daemon protocol - host::module or rsync://host/module - uses TCP 873 and requires rsyncd to be running on the far end. Most backup scripts use the SSH form."
   },
   {
    "q": "Why does my rsync daemon say connection refused?",
    "a": "Usually the daemon is not running - on Debian and Ubuntu the packaged rsync service is disabled until you enable it - or it is bound to 127.0.0.1 by an address line in rsyncd.conf. After that, check the host firewall with ufw status and the port-forward on your router. Connection refused specifically means a TCP reset came back, so the host is reachable and nothing is listening."
   },
   {
    "q": "How do I list the modules on an rsync server?",
    "a": "Run rsync rsync://hostname/ with a trailing slash and no module name, or rsync hostname:: with the double colon. The daemon replies with each module name and its comment. If it returns nothing, the config file defined no modules; if it hangs, port 873 is being filtered rather than refused."
   },
   {
    "q": "Is rsync on port 873 encrypted?",
    "a": "No. The daemon protocol sends file contents and paths in cleartext. Setting auth users protects the password itself with a challenge-response handshake, but not the data. If the transfer crosses the internet, run rsync over SSH on port 22 instead, or put the daemon behind a VPN tunnel."
   }
  ]
 },
 "993": {
  "intro": "Port 993 is IMAPS : IMAP wrapped in TLS from the first byte, and the default for essentially every modern mail client. Large providers and every self-hosted Dovecot , Cyrus , Courier or Stalwart server offer mailbox access here. Mail stays on the server, so folders, flags and read state match across a laptop and a phone - the reason to choose it over POP3 on 995. The classic reason to be on this page is a self-hosted mail server behind a home router: the phone syncs perfectly on home wifi and fails the moment it drops to mobile data. That pattern is a missing or misdirected port-forward almost every time, and it is invisible from inside, because a test from the LAN either hairpins through NAT or is answered by the server directly and never exercises the forward. This checker connects to 993 on your public IP from the outside, which is the phone's actual path. OPEN means a TLS listener completed the handshake. Verify with openssl s_client -connect mail.example.com:993 -servername mail.example.com - no -starttls flag, because there is nothing to upgrade - and you should get the certificate chain followed by * OK ... IMAP4rev1 . Read the Verify return code line and the certificate's SAN list: clients refuse a name mismatch or an expired certificate even when the port is wide open, and most report it as a generic connection failure. CLOSED , in the order worth checking: ss -tlnp | grep ':993 ' for a listener on 0.0.0.0:993 ; Dovecot's ssl = yes with readable ssl_cert and ssl_key files, since a bad path makes the listener drop connections rather than fail loudly at startup; sudo ufw status , then sudo ufw allow 993/tcp ; and the TCP 993 forward pointing at the mail host's current LAN address rather than an address from an expired DHCP lease. One trap specific to 993: it is not HTTP, so an HTTP reverse proxy cannot carry it. In nginx it belongs in a stream {} block rather than a server {} block; in Traefik it needs a TCP router with TLS passthrough. And a proxied CDN DNS record only handles HTTP and HTTPS ports, so the hostname your mail clients use has to resolve straight to your address - proxy that record and 993 stops answering entirely while the website on the same name keeps working.",
  "faq": [
   {
    "q": "What port does IMAP use with SSL?",
    "a": "993. That is IMAP over implicit TLS, where the TLS handshake happens immediately on connect and there is no cleartext phase. The alternative is 143 with STARTTLS, which begins unencrypted and upgrades; a client set to \"SSL/TLS\" belongs on 993 and one set to \"STARTTLS\" on 143."
   },
   {
    "q": "Why does IMAP work on my home wifi but not on mobile data?",
    "a": "On wifi the client reaches the mail server directly over the LAN, so the router's port-forward is never used. On mobile data the connection arrives from the internet and needs a TCP 993 forward to the mail host plus a matching host firewall rule. Running this check from outside your network tests exactly that path."
   },
   {
    "q": "Can I put IMAP behind a reverse proxy or a CDN?",
    "a": "Not an HTTP one. IMAPS is a TLS-wrapped TCP protocol, not HTTP, so it needs a layer-4 proxy - an nginx stream block or a Traefik TCP router with TLS passthrough - and a CDN's HTTP proxy will not forward it at all. The DNS record your mail clients use must point straight at the mail host."
   },
   {
    "q": "What is the difference between port 993 and port 995?",
    "a": "993 is IMAP over TLS and 995 is POP3 over TLS. IMAP keeps messages on the server and synchronises folders and read state across devices, while POP3 downloads to one device and usually deletes the server copy. If more than one device reads the mailbox, use 993."
   }
  ]
 },
 "995": {
  "intro": "Port 995 is POP3S - the same POP3 as port 110, wrapped in TLS from the first byte, so credentials and message bodies are never on the wire in the clear. It is served by Dovecot , Courier , Cyrus , Stalwart , Zimbra and the Exchange POP3 service, and it is what every \"POP3 with SSL\" preset in a mail client means. Remember what POP3 does before you troubleshoot the port. It downloads mail to one device and, unless \"leave messages on server\" is ticked, deletes it from the mailbox. If the real complaint is that a second phone shows no mail, the answer is IMAP on 993, not a firewall change. The checker on this page connects to 995 on your own public IP from outside your network - the same route a laptop on hotel wifi takes. OPEN means a TLS listener completed the handshake. Confirm what is actually there with openssl s_client -connect mail.example.com:995 , with no -starttls flag: you should see a certificate chain and then a +OK greeting. A plaintext +OK arriving before any certificate means a cleartext POP3 service has been put on 995, and every client set to SSL/TLS will fail against it. CLOSED checklist, in order. Is the service running and bound wide - ss -tlnp | grep ':995 ' should show 0.0.0.0:995 , not 127.0.0.1:995 . Is POP3 even enabled: Dovecot needs pop3 in its protocols line, plus ssl = yes and readable ssl_cert and ssl_key paths. Does the host firewall allow it: sudo ufw status , then sudo ufw allow 995/tcp . And is TCP 995 forwarded to the mail host's current LAN address rather than one it held on an old DHCP lease - pin that host to a reservation and the forward stops breaking. The other frequent failure on 995 is not connectivity at all but the certificate. Clients reject a self-signed certificate, an expired one, or one whose name does not match the hostname they dialled, and many report that as a vague \"cannot connect\" rather than naming the certificate. Issue the certificate for the exact name typed into the client's account settings, include that name in the SAN list, and check the expiry - the Verify return code line at the end of the openssl s_client output tells you in one line whether a client will accept it.",
  "faq": [
   {
    "q": "What port does POP3 use with SSL?",
    "a": "995. That is POP3 over implicit TLS, where the TLS handshake happens immediately on connect. The alternative is port 110 with the STLS command, which starts in cleartext and upgrades; a client set to \"SSL/TLS\" should use 995 and one set to \"STARTTLS\" should use 110."
   },
   {
    "q": "What is the difference between port 995 and port 993?",
    "a": "Both are TLS-wrapped mailbox access, but 995 is POP3 and 993 is IMAP. POP3 downloads mail to one device and normally removes it from the server, while IMAP leaves it on the server so folders, flags and read state stay in sync across every device. For anything with more than one client, 993 is the better choice."
   },
   {
    "q": "Why does my mail client show a certificate error on port 995?",
    "a": "The certificate presented on 995 is self-signed, expired, or issued for a different name than the one in the client's server setting. Mail clients validate the hostname the same way a browser does, so mail.example.com in the client needs that exact name in the certificate's SAN list. Run openssl s_client -connect host:995 and read the Verify return code line."
   },
   {
    "q": "Do I need to open port 995 on my router?",
    "a": "Only if mail clients fetch from outside your network. A forward of TCP 995 to the mail host, plus an allow rule in the host firewall, is what makes that work; clients on the LAN or on the mail host itself do not need the port exposed at all."
   }
  ]
 },
 "1080": {
  "intro": "1080 is the registered port for SOCKS , the generic circuit-level proxy defined for version 5 in RFC 1928. A SOCKS server takes a connection, is told a destination host and port, and relays bytes — it does not care whether the payload is HTTP, IMAP or a game protocol, which is what makes it useful and what makes an open one so attractive to other people. The listener is usually ssh -D 1080 user@host , which opens a SOCKS listener on your own machine's loopback, or a standalone daemon such as Dante, 3proxy, microsocks or Shadowsocks. SOCKS5 supports authentication but many builds start with none configured, and the ones that most often end up on the internet are the ones with none. Reading the result. For 1080 there is only one good answer, and it is CLOSED. OPEN from the public internet means anyone who scans your address — and this port is scanned constantly — can push arbitrary TCP traffic through your connection. What comes back is not a break-in; it is your IP appearing in other people's abuse reports, on mail blocklists, and in your ISP's ticket queue. Open proxy lists are compiled automatically and 1080 is at the top of the list of ports they probe. If it is open and should not be: Find the listener: ss -tlnp | grep ':1080 ' . An ssh process here means somebody's dynamic forward; danted or 3proxy means a real daemon. Bind it back to loopback. In Dante that is the internal: line in /etc/danted.conf ; for SSH it is the default — ssh -D binds 127.0.0.1 unless GatewayPorts or an explicit -D 0.0.0.0:1080 widened it. Remove any port-forward and any UPnP mapping the client created for itself. Then verify the proxy still works locally: curl --socks5-hostname 127.0.0.1:1080 https://example.com -I . If the goal was to reach your home proxy from a laptop or phone, do it with WireGuard: you get authenticated, encrypted access to the whole network and there is nothing on 1080 for a scanner to find. Two notes on identification: Tor's local SOCKS port is 9050 , not 1080, and a SOCKS5 client that also relays UDP does so through a separate UDP association negotiated over this TCP control connection — so a TCP test of 1080 is the right test.",
  "faq": [
   {
    "q": "What is port 1080 used for?",
    "a": "It is the registered port for SOCKS proxies, most commonly SOCKS5 as defined in RFC 1928. Anything that tunnels arbitrary TCP connections through a relay may use it: ssh -D dynamic forwards, Dante, 3proxy, microsocks and Shadowsocks are the usual programs."
   },
   {
    "q": "Is it dangerous to have port 1080 open?",
    "a": "Yes. An open SOCKS proxy is enumerated by scanners very quickly and used to relay spam, credential stuffing and fraud, all of which is attributed to your IP address. Even with authentication enabled it is a login form on the public internet; bind it to localhost and reach it over SSH or WireGuard instead."
   },
   {
    "q": "How do I use ssh -D as a SOCKS proxy safely?",
    "a": "Run ssh -D 1080 user@host and point your browser or curl at 127.0.0.1:1080 as a SOCKS5 proxy. By default SSH binds the listener to loopback only, so nothing outside the machine can use it — do not add -D 0.0.0.0:1080 or GatewayPorts yes, which is exactly what turns it into an open proxy."
   },
   {
    "q": "Is port 1080 the Tor port?",
    "a": "No. The Tor client's local SOCKS port is 9050 (9150 in Tor Browser). Port 1080 is the generic SOCKS registration, and older malware families also used it for their own relays, which is one reason it draws so much scanning traffic."
   }
  ]
 },
 "1194": {
  "intro": "Port 1194 is OpenVPN's registered default, and unlike most VPN ports it is genuinely used both ways: the proto udp line in server.conf is the default and the one you want, while proto tcp exists for networks that only pass TCP. Running the tunnel over TCP means TCP inside TCP, and the two retransmission timers fight each other the moment the link gets lossy, so use UDP unless something forces your hand. What listens here is the OpenVPN daemon itself - Community Edition via openvpn-server@server.service , OpenVPN Access Server, a PiVPN install, or the OpenVPN service in pfSense and OPNsense. How to read a result on this page. The checker is TCP-only. If your server runs proto tcp , an open result is real proof that the forward, the firewall and the daemon are all working. If it runs the default proto udp - and it probably does - the honest answer is that closed tells you nothing, because no TCP socket exists on 1194 at all. Do this instead: ss -lunp | grep 1194 on the server for a UDP listener, or ss -ltnp | grep 1194 in TCP mode. journalctl -u openvpn-server@server -f while a client connects. If you never see the peer's address appear, the packet is not reaching you and the fault is the router forward or the ISP. ufw allow 1194/udp (or the matching nftables rule), and forward UDP 1194 on the router to the server's internal address - a DHCP lease that moved is a classic cause of a forward that used to work. Client side, run with --verb 4 ; a repeating TLS Error: TLS key negotiation failed to occur within 60 seconds means your packets are leaving and nothing is coming back. One thing that confuses scanning: with tls-crypt (or the older tls-auth ) enabled, the server silently discards any packet that is not signed with the shared key, so from outside the port looks dead even when it is perfectly healthy. That is a feature, not a fault. If clients on hotel or corporate Wi-Fi cannot connect at all, moving the server to tcp/443 is the standard workaround - it looks like ordinary HTTPS to a captive portal, and OpenVPN's port-share option can hand non-VPN connections off to a local web server on the same port.",
  "faq": [
   {
    "q": "Is OpenVPN port 1194 TCP or UDP?",
    "a": "Both are supported, but UDP 1194 is the default and the recommended one. TCP mode is only there for networks that block or mangle UDP; tunnelling TCP inside TCP causes retransmission storms on a lossy link, which shows up as a tunnel that is fast on a good connection and unusable on a bad one."
   },
   {
    "q": "Why does port 1194 show closed when my OpenVPN server is running?",
    "a": "Because external checkers test TCP and your server is almost certainly listening on UDP - there is no TCP socket to connect to. Confirm the listener locally with ss -lunp | grep 1194 and watch the server log while a client connects; that tells you whether the packets arrive."
   },
   {
    "q": "Can I run OpenVPN on port 443 instead?",
    "a": "Yes, and it is the usual fix for restrictive networks. Set port 443 with proto tcp so the traffic looks like HTTPS to a captive portal or corporate proxy. If that host also serves a website, OpenVPN's port-share option forwards non-OpenVPN connections to another local port so both can coexist."
   },
   {
    "q": "Do I need to forward any port for an OpenVPN client?",
    "a": "No. Only the server needs an inbound port; clients make outbound connections and the NAT state handles the replies. If both ends are behind NAT you need one of them to be publicly reachable, or a relay - there is no way for two NATed peers to connect directly here."
   }
  ]
 },
 "1433": {
  "intro": "TCP 1433 is the default port for Microsoft SQL Server - the sqlservr process speaking the TDS protocol, whether that is a full instance on Windows, SQL Server Express, or SQL Server on Linux in a container. It is the port every client library, from sqlcmd to ADO.NET to JDBC, dials when the connection string names a host with no port. The reason \"cannot connect to SQL Server\" is such a common ticket is that three separate things have to be true, and only one of them is the firewall: TCP/IP has to be enabled. SQL Server Express ships with the TCP/IP protocol disabled , listening only on shared memory and named pipes. Open SQL Server Configuration Manager → SQL Server Network Configuration → Protocols , enable TCP/IP, and restart the service. This is the single most common cause of a closed port on a running database. Named instances do not use 1433. A default instance uses 1433; a named instance such as HOST\\SQLEXPRESS takes a dynamic port at startup and clients discover it by asking the SQL Server Browser on UDP 1434 . That discovery step rarely survives NAT or a firewall, so through a router you must set a static port under IP Addresses → IPAll → TCP Port and connect as host,1433 with a comma. Windows Firewall. netsh advfirewall firewall add rule name=\"SQL Server\" dir=in action=allow protocol=TCP localport=1433 . Verify from both sides. On the server, netstat -ano | findstr :1433 should show a LISTENING socket, and the SQL Server error log records Server is listening on [ 'any' <ipv4> 1433] at startup. From a client, Test-NetConnection sqlhost -Port 1433 in PowerShell gives you a clean TCP-level yes or no without dragging SSMS into it. Reading this page's result: CLOSED / filtered on your public IP is the correct and desirable state. OPEN means anyone on the internet can start a TDS handshake with your database server, and you should treat that as an incident rather than a success. Attackers spray 1433 constantly with dictionary attacks against sa ; once in, xp_cmdshell or CLR turns a database login into command execution on the host. Put it behind a VPN, an SSH tunnel or a jump host, and if a managed cloud instance must be public, lock the firewall rule to specific source addresses.",
  "faq": [
   {
    "q": "What port does SQL Server use?",
    "a": "TCP 1433 for a default instance. Named instances take a dynamic port at startup instead, and clients find it by querying the SQL Server Browser service on UDP 1434. If you need a named instance reachable through a firewall or NAT, assign it a static TCP port in SQL Server Configuration Manager rather than relying on the browser service."
   },
   {
    "q": "Why can't I connect to SQL Server from another computer?",
    "a": "Most often the TCP/IP protocol is disabled - it is off by default in SQL Server Express, which then listens only on shared memory and named pipes. Enable TCP/IP in SQL Server Configuration Manager and restart the service, then add an inbound Windows Firewall rule for TCP 1433. Remote connections also have to be allowed in the server properties."
   },
   {
    "q": "How do I open port 1433 in Windows Firewall?",
    "a": "From an elevated prompt: netsh advfirewall firewall add rule name='SQL Server' dir=in action=allow protocol=TCP localport=1433. Scope it to your LAN subnet with remoteip= rather than leaving it open to any source. For a named instance on a dynamic port you would also need UDP 1434 for the browser service, which is a good reason to pin a static port instead."
   },
   {
    "q": "Is it safe to expose port 1433 to the internet?",
    "a": "No. Internet-facing SQL Server instances see constant automated password-guessing against the sa account, and a successful login can be escalated to operating-system command execution through xp_cmdshell. Keep 1433 on a private network and reach it through a VPN, an SSH tunnel or a bastion host; for cloud databases, use a source-address allow-list."
   }
  ]
 },
 "1521": {
  "intro": "TCP 1521 is the default port for the Oracle TNS listener - the tnslsnr process that accepts incoming client connections and hands them to a database service. It is what sits behind an EZCONNECT string like host:1521/ORCLPDB1 or the ADDRESS=(PROTOCOL=TCP)(HOST=...)(PORT=1521) block in tnsnames.ora . Oracle Database Express Edition uses the same default. Two Oracle errors send people here, and they mean opposite things: ORA-12541: TNS:no listener - the TCP connection succeeded and something on the other end refused at the protocol level, or the port answered with a reset. The listener process is down, or is listening on a different port. Check on the server with lsnrctl status : it prints every listening endpoint and every registered service. ss -tlnp | grep 1521 confirms it at the socket level. ORA-12170: TNS:Connect timeout occurred - nothing answered at all. That is a firewall or routing problem, and it is the case this page's check actually measures. ORA-12514: TNS:listener does not currently know of service requested - the port is fine and reachable. You have the wrong service name. lsnrctl services lists the real ones. If the listener is up locally but unreachable from elsewhere, look at the HOST value in listener.ora - a listener configured with HOST=localhost binds loopback and nothing else. Then the host firewall: sudo firewall-cmd --add-port=1521/tcp --permanent && sudo firewall-cmd --reload on Oracle Linux and RHEL, or sudo ufw allow 1521/tcp on Ubuntu. One NAT trap worth knowing: with shared server / dispatcher configurations, and on some older Windows installations, the listener can redirect the client to a second, dynamically chosen port after the first handshake. The initial connection to 1521 succeeds and then the session dies, which looks baffling through a port-forward. Dedicated server connections on modern Linux installs stay on the one port. Do not publish this port. The listener responds to service and version queries before any authentication happens, giving away exactly what you are running, and internet-facing Oracle instances attract steady guessing at well-known default accounts. Keep 1521 inside the network and reach it with ssh -L 1521:dbhost:1521 user@bastion or over a VPN.",
  "faq": [
   {
    "q": "What port does Oracle Database use?",
    "a": "TCP 1521 by default, served by the TNS listener, which then routes the session to a database service. Oracle Enterprise Manager Express is a separate HTTPS port, commonly 5500, and is not needed for client connections. A listener can be configured on any port, so always confirm with lsnrctl status rather than assuming 1521."
   },
   {
    "q": "What does ORA-12541 TNS:no listener mean?",
    "a": "The client reached the host but no listener answered on that port - the tnslsnr process is stopped, crashed, or listening somewhere else. Run lsnrctl status on the database server to see the endpoints it is actually bound to, and lsnrctl start if it is down. A timeout instead of this error (ORA-12170) points at a firewall rather than a stopped listener."
   },
   {
    "q": "How do I check whether the Oracle listener is running?",
    "a": "Run lsnrctl status as the Oracle software owner. It prints the listener's endpoints, its uptime, the parameter file in use, and every service currently registered with it. At the operating-system level, ss -tlnp | grep 1521 on Linux confirms which address the process is bound to, which catches listeners pinned to localhost."
   },
   {
    "q": "Should port 1521 be open to the internet?",
    "a": "No. The TNS listener answers version and service queries before authentication, so exposing it tells attackers precisely what you run, and public Oracle endpoints see steady password-guessing against default accounts. Restrict 1521 to the application subnets that need it and reach it over a VPN or an SSH tunnel from anywhere else."
   }
  ]
 },
 "1701": {
  "intro": "UDP 1701 is L2TP , which tunnels a PPP session across an IP network. On its own it does not encrypt anything - it is a transport, not a security protocol. That is why essentially every deployment you will meet is L2TP/IPsec : the L2TP conversation runs inside an IPsec transport-mode SA, which is what the built-in VPN clients in Windows, macOS and Android mean when they offer \"L2TP over IPsec with pre-shared key\". The listeners are xl2tpd or accel-ppp on Linux, RRAS on Windows Server, and the L2TP servers in OPNsense, pfSense, RouterOS and IOS. The single most useful thing on this page: for L2TP/IPsec you do not forward port 1701 at all. The L2TP packets are encapsulated inside IPsec before they ever hit the wire, so the router in front of your VPN server only ever sees IKE and ESP. Forward UDP 500 and UDP 4500 to the VPN host and stop there. A rule sending 1701 inward is either useless or, if it actually reaches an exposed xl2tpd, a way to talk to your PPP stack with no crypto in front of it. The checker on this page tests TCP and 1701 is UDP, so closed is the expected reading and is not evidence of anything. When a client hangs, work in this order: Confirm IPsec came up first: ipsec status or swanctl --list-sas . If there is no SA, the problem is on 500/4500 and L2TP never got a chance to run. Then confirm the L2TP daemon is alive: ss -lunp | grep 1701 should show xl2tpd bound locally. Watch it happen: tcpdump -ni any udp port 500 or udp port 4500 or udp port 1701 - on a healthy server you see 500/4500 from the client and 1701 only on the decapsulated path. On Windows, a client behind NAT needs the AssumeUDPEncapsulationContextOnSendRule registry value set before L2TP/IPsec will work at all - error 809 with no server-side log entry is the classic signature. L2TP/IPsec still works, but it is a 1999 protocol carried by a 1998 one, it needs three ports and an ALG-hostile NAT dance, and the pre-shared key is usually shared by the whole company. If you are building something new rather than keeping something alive, WireGuard on a single UDP port or IKEv2 with certificates will cost you less time.",
  "faq": [
   {
    "q": "Do I need to forward UDP port 1701 for an L2TP VPN?",
    "a": "For L2TP/IPsec, no. The L2TP traffic travels inside the IPsec tunnel, so the only ports that need to reach your server from the internet are UDP 500 and UDP 4500. Port 1701 only needs forwarding for bare, unencrypted L2TP, which you should not be running across the internet."
   },
   {
    "q": "What ports does L2TP/IPsec use?",
    "a": "UDP 500 for the IKE negotiation, UDP 4500 for NAT traversal, and IP protocol 50 (ESP) if there is no NAT in the path. L2TP itself uses UDP 1701 but only inside the protected tunnel. Consumer routers often expose the ESP part as an IPsec passthrough setting rather than a port rule."
   },
   {
    "q": "Why does my L2TP VPN fail behind NAT?",
    "a": "Usually NAT traversal. The IPsec layer has to detect the NAT and move to UDP 4500, and on Windows the client will not even try that until the AssumeUDPEncapsulationContextOnSendRule registry value is set to 2. Also check that only one L2TP client at a time is behind the same NAT unless your server supports multiple identical peer identities."
   },
   {
    "q": "Is L2TP secure on its own?",
    "a": "No. L2TP provides no confidentiality or integrity at all - it just carries PPP. Its security comes entirely from the IPsec layer underneath it, which is why the pairing is always written L2TP/IPsec. Exposing plain L2TP on UDP 1701 to the internet puts the PPP authentication and the payload in the clear."
   }
  ]
 },
 "1723": {
  "intro": "TCP 1723 is the PPTP control channel . It negotiates the session and then gets out of the way: the actual tunnel data travels in GRE, IP protocol 47 , which has no port number. That split explains the failure everyone hits - you forward 1723, the client connects, authenticates, and then dies with error 619 or 809 because the GRE half never made it through the NAT. Consumer routers hide this behind a PPTP passthrough toggle, which is really a GRE helper that tracks the call IDs, and many of them can only track one PPTP session at a time. The listeners are pptpd on Linux, RRAS on older Windows Server, and the PPTP servers still shipped by RouterOS and legacy IOS. The checker on this page is TCP, so a result here is genuinely meaningful: if 1723 reads open , your forward works and a PPTP daemon is answering the internet. That is not good news. Why this port should be closed. PPTP's confidentiality comes from MPPE, whose keys are derived from the user's password by way of MS-CHAPv2. In 2012 MS-CHAPv2 was shown to collapse to the strength of a single DES key, meaning a captured handshake can be broken offline regardless of how long the password is. Apple removed PPTP from macOS in Sierra and from iOS 10 in 2016, and most vendors have followed. There is no configuration that fixes this; the protocol itself is the problem. What to do instead, in rough order of effort: WireGuard on UDP 51820 - one port, modern crypto, and it ignores unauthenticated packets entirely. IKEv2/IPsec on UDP 500 and 4500 with certificates, if you need the client that is already built into Windows, macOS and iOS. OpenVPN on 1194, or on tcp/443 when the remote network is hostile. When you migrate, remember to remove the forward as well as the server. Check what is still listening with ss -tlnp | grep 1723 , delete the NAT rule on the router, turn off the PPTP passthrough setting, and confirm this page reports 1723 as closed afterwards. Anyone who still needs the old tunnel during the changeover should be moved first, not left as a permanent exception.",
  "faq": [
   {
    "q": "Why does my PPTP VPN connect and then immediately drop?",
    "a": "Because only the control channel got through. PPTP needs TCP 1723 for control and GRE (IP protocol 47) for data, and GRE has no ports, so a plain port-forward does not carry it. The router in front of the server must have PPTP or GRE passthrough enabled, and many consumer models can only handle one session at a time."
   },
   {
    "q": "Is PPTP still secure in 2026?",
    "a": "No. Its authentication is MS-CHAPv2, which since 2012 has been reducible to a single DES key and crackable offline from a captured handshake, and the MPPE session keys derive from the same password. Treat any PPTP tunnel as unencrypted for planning purposes and replace it."
   },
   {
    "q": "What should I use instead of PPTP?",
    "a": "WireGuard on UDP 51820 for a new build, IKEv2/IPsec on UDP 500 and 4500 if you want the VPN client that ships with the operating system, or OpenVPN on 1194 when you need broad platform support and per-user certificates. All three survive NAT better than PPTP does."
   },
   {
    "q": "What ports does PPTP use?",
    "a": "TCP 1723 for the control connection plus GRE, which is IP protocol 47 rather than a port. That second requirement is what breaks PPTP through NAT and firewalls, since you cannot express it as a port-forward - the device has to understand GRE and track PPTP call IDs."
   }
  ]
 },
 "1812": {
  "intro": "UDP 1812 carries RADIUS authentication: the Access-Request a network device sends when someone tries to log in, and the Access-Challenge, Access-Accept or Access-Reject that comes back (RFC 2865). It is what sits behind a WPA2-Enterprise or WPA3-Enterprise SSID, wired 802.1X, VPN logins, and administrative access to switches and firewalls. Servers: FreeRADIUS, Microsoft NPS, Cisco ISE, Aruba ClearPass, PacketFence and FortiAuthenticator. The clients are not end users - they are the NAS devices: your access points, switches and VPN concentrators. The legacy port trap catches people constantly. RADIUS originally used 1645 and 1646, which collided with an existing registration, so IANA assigned 1812 and 1813. Plenty of Cisco gear still defaults to the old pair unless you specify otherwise ( radius server X / address ipv4 10.10.1.20 auth-port 1812 acct-port 1813 ). A server listening on 1812 and a switch talking to 1645 produces a perfect silence that looks like a firewall problem and is not. A TCP check on 1812 will always read closed. RADIUS is UDP; RADIUS over TCP exists (RFC 6613) and RadSec uses TLS on 2083, but neither runs here. Test the protocol: radtest bob hello 127.0.0.1 0 testing123 on the server itself proves the server and the user store work before the network is involved. sudo freeradius -X (or radiusd -X ) stops the service and runs it in the foreground with full debug. This is the single most useful command in FreeRADIUS - it prints every attribute of every packet and the exact policy line that rejected it. ss -lunp | grep -E ':(1812|1813)' to confirm what is bound. From a Cisco NAS: test aaa group radius username password new-code . Two silent failures to rule out first. FreeRADIUS drops packets from unknown clients without answering - if the NAS is not in clients.conf with a matching IP and shared secret you will see only Ignoring request from unknown client in the debug output. And a shared secret mismatch does not produce a clear error either; it usually shows as a bad Response Authenticator or a request the NAS refuses to accept. For EAP methods, the supplicant must also trust the certificate the server presents, which is a separate failure from anything happening on port 1812.",
  "faq": [
   {
    "q": "What is the difference between port 1812 and port 1645?",
    "a": "1645 and 1646 were the original RADIUS ports from the Livingston implementation, and they clashed with another registered service, so IANA assigned 1812 for authentication and 1813 for accounting. Both pairs are still in the field: many Cisco platforms default to 1645/1646 unless you set auth-port and acct-port explicitly, which is a very common cause of a server that never sees a request."
   },
   {
    "q": "Does RADIUS use TCP or UDP?",
    "a": "UDP, ports 1812 and 1813. RADIUS over TCP is defined in RFC 6613 but is rarely deployed on its own; the variant that is used in practice is RadSec, which runs RADIUS inside TLS on TCP 2083 and is the right choice when authentication traffic must cross an untrusted network."
   },
   {
    "q": "Why is my RADIUS server not responding?",
    "a": "Run the server in foreground debug mode - sudo freeradius -X - and watch what arrives. Nothing at all means the port, the firewall or the 1645 versus 1812 mismatch. Ignoring request from unknown client means the NAS is missing from clients.conf. A rejection with attributes shown means you are through the network entirely and it is now a policy or credential problem."
   },
   {
    "q": "Is it safe to expose RADIUS to the internet?",
    "a": "No. Only the User-Password attribute is obscured, and it is obscured with an MD5-based scheme that the BlastRADIUS work (CVE-2024-3596) showed an on-path attacker can exploit to forge an Access-Accept. Everything else, including usernames and assigned VLANs, is cleartext. Tunnel it over IPsec or WireGuard, or use RadSec on 2083."
   }
  ]
 },
 "1813": {
  "intro": "UDP 1813 is the accounting half of RADIUS (RFC 2866). Where 1812 answers may this user in , 1813 records what happened next. The network device sends an Accounting-Request with Acct-Status-Type = Start when a session comes up, Interim-Update at intervals while it runs, and Stop when it ends, carrying the session ID, username, Calling-Station-Id (usually the client MAC), Framed-IP-Address and input and output octet counters. The same servers handle both ports: FreeRADIUS, Microsoft NPS, Cisco ISE, Aruba ClearPass, PacketFence, and billing front-ends such as daloRADIUS. As with authentication, older equipment may default to the legacy accounting port 1646 rather than 1813, so a deployment where logins work but no session records ever appear is very often that one line of configuration. The symptom that brings people here is stale sessions: a hotspot, captive portal or NAC dashboard listing users who left hours ago, or a RADIUS-assigned IP pool that slowly runs out. That is a missing Stop . Because accounting is UDP and fire-and-forget, a dropped Stop is gone - and a firewall policy that permits 1812 but forgets 1813 produces exactly this, with authentication looking completely healthy. Configure Interim-Update so the server can age sessions out even when a Stop is lost: on Cisco, aaa accounting update newinfo periodic 15 . This page's TCP check cannot see 1813 - RADIUS is UDP - so verify it directly: sudo freeradius -X in the foreground and watch for Accounting-Request arriving alongside your Access-Requests. ss -lunp | grep ':1813' to confirm the server is bound. sudo tcpdump -ni any udp port 1813 -vv on the server while a client disconnects. If you store to SQL, look at the table itself: SELECT acctsessionid, username, acctstarttime, acctstoptime FROM radacct ORDER BY radacctid DESC LIMIT 5; . Rows with a start and a null stop are the stale ones. On the NAS, accounting must be turned on separately from authentication - aaa accounting network default start-stop group radius on IOS, or the equivalent accounting server entry on an Aruba or UniFi controller. Enabling the RADIUS server address alone does not send a single accounting packet.",
  "faq": [
   {
    "q": "What is port 1813 used for?",
    "a": "It is the RADIUS accounting port. Network access servers send Accounting-Request packets there to record session start, periodic interim updates, and session stop, including the username, client MAC address, assigned IP and traffic counters. It is separate from authentication, which uses 1812."
   },
   {
    "q": "What is the difference between port 1812 and 1813?",
    "a": "1812 handles authentication and authorization: Access-Request in, Access-Accept or Access-Reject back. 1813 handles accounting: the session records written after a user is already admitted. They are usually served by the same daemon but they are separate UDP ports and need separate firewall rules. The legacy equivalents are 1645 and 1646."
   },
   {
    "q": "Why do my RADIUS sessions never close?",
    "a": "The Accounting-Stop is not reaching the server. Common causes are a firewall that permits 1812 but not 1813, a NAS still pointed at the legacy 1646 port, or a client that vanished without a clean disconnect so no Stop was ever generated. Enabling interim updates lets the server expire sessions that stop reporting even when the Stop is lost."
   },
   {
    "q": "Do I need to open 1813 if I only do authentication?",
    "a": "Not strictly, but you will lose all session visibility, and anything that depends on accounting will break: RADIUS-assigned IP pools, usage reporting, captive portal session tracking, and change-of-authorization workflows that need to know a session exists. If you run accounting at all, open 1813 alongside 1812."
   }
  ]
 },
 "1883": {
  "intro": "1883 is the standard port for MQTT without encryption — the publish/subscribe protocol behind most of home automation. Mosquitto, EMQX and HiveMQ all listen here by default, and it is what Tasmota firmware, ESPHome nodes, Zigbee2MQTT and the Home Assistant MQTT integration connect to. The TLS equivalent is 8883. What usually brings people here is a client that cannot connect after a fresh Mosquitto install. Since Mosquitto 2.0 the defaults changed in a way that catches everyone: with no listener line in the configuration the broker binds loopback only , and anonymous connections are refused. So a device on the LAN gets nothing, and the log says Client <id> disconnected, not authorised . The fix is explicit, in /etc/mosquitto/conf.d/local.conf : listener 1883 — bind on all interfaces (add an address after the port to pin it to one NIC). password_file /etc/mosquitto/passwd , created with mosquitto_passwd -c /etc/mosquitto/passwd homeassistant . Leave allow_anonymous at its default of false. If a guide tells you to set it true, that guide is from the 1.x era. Then ss -tlnp | grep 1883 should show 0.0.0.0:1883 , and mosquitto_sub -h 192.168.1.10 -t '#' -u user -P pass -v from another machine proves the path. Reading the result on this page. CLOSED is the answer you want. OPEN means your broker is answering the whole internet: MQTT has no transport security on 1883, so credentials cross in the clear and, if anonymous access was ever enabled, a stranger can subscribe to the wildcard topic # and read every state change in your home — or publish to the topics that open a garage door. Exposed brokers are indexed and scanned continuously. If it reads open, remove the port-forward, set allow_anonymous false with a password file, and if remote devices genuinely need the broker, move them to 8883 with TLS or put them on a WireGuard tunnel. There is no configuration of 1883 that is safe to publish.",
  "faq": [
   {
    "q": "What port does MQTT use?",
    "a": "TCP 1883 for plain MQTT and TCP 8883 for MQTT over TLS. Both are IANA-registered for the protocol. MQTT over WebSockets is a separate listener, commonly 9001 on Mosquitto or 8083 on EMQX, and it is configured explicitly rather than being on by default."
   },
   {
    "q": "Why does Mosquitto refuse connections after install?",
    "a": "Mosquitto 2.0 changed the defaults: with no listener directive it binds only to 127.0.0.1, and anonymous clients are rejected. Add \"listener 1883\" and a password_file to a file in /etc/mosquitto/conf.d/, create users with mosquitto_passwd, and restart. Check with ss -tlnp that the socket shows 0.0.0.0:1883 rather than 127.0.0.1:1883."
   },
   {
    "q": "Is it safe to expose MQTT port 1883 to the internet?",
    "a": "No. The protocol has no encryption on 1883, so usernames and passwords are visible in the CONNECT packet to anyone on the path, and a broker with anonymous access allows a stranger to subscribe to # and see or control every device attached to it. Use 8883 with TLS and authentication, or keep the broker on the LAN behind a VPN."
   },
   {
    "q": "Do I need to forward port 1883 for Home Assistant?",
    "a": "No. Home Assistant and its add-on broker talk to your devices inside the LAN, so no inbound forward is needed. You only need to reach the broker from outside if you run devices at another site, and that should be an MQTT-over-TLS listener on 8883 or a WireGuard tunnel, never a forward of 1883."
   }
  ]
 },
 "1900": {
  "intro": "UDP 1900 is SSDP , the discovery half of UPnP. A device sends an M-SEARCH to the well-known SSDP multicast group 239.255.255.250 - on UDP 1900, and everything that matches answers with a LOCATION header pointing at an XML description document on some other TCP port. It is how a phone finds a Chromecast, how a media player finds a DLNA server, and how a game or torrent client asks the router for a port-forward through UPnP IGD. The listeners are miniupnpd (OpenWrt, pfSense, OPNsense and most consumer firmware), the SSDP Discovery service on Windows, minidlna, Plex and Jellyfin's DLNA endpoints, Sonos and smart TVs. Two very different problems bring people to this port. \"UPnP is not opening ports for my game or torrent client.\" That is entirely a LAN-side function - the client sends its request from inside your network to the router. Check that UPnP or NAT-PMP is enabled on the LAN interface, that the client is on the same subnet as the router (a second router or a mesh node in routed mode breaks it), and that no VLAN sits between them. Nothing about the internet-facing side of port 1900 is involved. \"Is 1900 open on my WAN dangerous?\" Yes. SSDP is a classic reflection and amplification vector: a small spoofed M-SEARCH produces a much larger reply aimed at the victim, and internet-exposed UPnP IGD implementations have been abused to insert port-forwards and NAT mappings into other people's routers. There is no legitimate reason for an internet host to discover your devices. Reading a result here: the checker opens TCP connections and SSDP is UDP, so closed is what you will see either way and it is not proof of anything. Verify at the source instead - in the router's UPnP settings, confirm the service is bound to the LAN interface only, and that there is no WAN firewall rule permitting 1900. On a Linux host, ss -lunp | grep 1900 shows which process holds it, and in miniupnpd.conf the ext_ifname and listening_ip lines decide which side it answers on. If you would rather not run it at all, static port-forwards for the handful of services that need them are safer than letting any application on the LAN open its own.",
  "faq": [
   {
    "q": "Should port 1900 be open on my router's WAN?",
    "a": "No, never. SSDP is meant for the local subnet only, it is a well-known amplification source for reflection attacks, and internet-facing UPnP implementations have been abused to add port-forwards remotely. Bind UPnP to the LAN interface and make sure no WAN rule allows UDP 1900 inbound."
   },
   {
    "q": "Why is UPnP not opening ports for my application?",
    "a": "UPnP requests travel from the client to the router across your LAN, so the usual causes are UPnP or NAT-PMP being disabled on the router, the client sitting behind a second router or on a different VLAN or subnet, or the router's UPnP daemon being bound to the wrong interface. It has nothing to do with whether 1900 is reachable from the internet."
   },
   {
    "q": "Is UPnP safe to leave enabled?",
    "a": "On the LAN it is a convenience with a real trade-off: any application on your network, including malware, can open a port-forward to itself without asking you. If you can live without it, disable UPnP and create the few static forwards you actually need. What is never acceptable is UPnP or SSDP reachable from the WAN side."
   },
   {
    "q": "What uses port 1900 on my network?",
    "a": "DLNA and media discovery (Plex, Jellyfin, minidlna, smart TVs, Sonos), casting devices, Windows' SSDP Discovery service, and any client asking the router for a UPnP port-forward. Seeing 1900 traffic inside the LAN is normal; seeing it arrive from the internet is not."
   }
  ]
 },
 "2049": {
  "intro": "Port 2049 is where nfsd answers - the Linux kernel NFS server, the NFS service on TrueNAS, Synology and QNAP, and the Windows Server NFS role. With NFSv4 this is the only port you need : mount, lock and ACL operations were folded into the single protocol on 2049, and the portmapper is out of the picture. NFSv3 is a different story : it needs rpcbind on port 111 to look up mountd , statd and lockd , each of which grabs a random port at boot unless you pin it. The situation that brings people here is a mount that neither succeeds nor fails - it just sits there, and eventually you get mount.nfs: Connection timed out . That is what a dropped SYN looks like to the NFS client, so this check is a fast way to see whether the packet is reaching the server at all. Order of investigation: On the server: ss -tlnp | grep 2049 and systemctl status nfs-server . If there is no listener, the export never loaded. sudo exportfs -v - the client address or subnet has to be in the export line, and a change to /etc/exports does nothing until you run sudo exportfs -ra . rpcinfo -p 192.168.1.10 from the client shows what the server has registered. Empty or refused usually means rpcbind is down (v3) or you should just be using v4. Force the version to see which layer is broken: sudo mount -t nfs -o vers=4.2 192.168.1.10:/export /mnt . If v4 mounts and v3 does not, the missing piece is port 111 and the v3 helper ports, not 2049. If 2049 is reachable but the mount still fails with access denied by server , the port is fine and the problem is the export: wrong client subnet, or root_squash mapping your root to nobody . Do not reach for no_root_squash to make that go away - it hands remote root full control of the exported tree. Do not publish this port. Classic NFS security is AUTH_SYS : the client asserts a UID and GID and the server believes it. Anyone who can reach port 2049 and guess an export path can present themselves as UID 1000, or as root, and read or write your files accordingly. There is no password anywhere in that exchange. Put NFS on a private network and reach it over WireGuard, an IPsec tunnel or SSH - or, if it must cross untrusted ground natively, use NFSv4 with Kerberos ( sec=krb5p ), which authenticates and encrypts.",
  "faq": [
   {
    "q": "What port does NFS use?",
    "a": "TCP 2049 for NFSv4, which is self-contained and needs nothing else. NFSv3 also uses 2049 for the main protocol but additionally needs rpcbind on port 111 plus mountd, statd and lockd, which take dynamic ports unless you pin them in /etc/nfs.conf. UDP is supported for older versions, but modern deployments are TCP."
   },
   {
    "q": "Do I need port 111 open for NFSv4?",
    "a": "No. NFSv4 folded mounting and locking into the protocol on port 2049, so rpcbind is not consulted at all. If you can mount with -o vers=4.2 but not with vers=3, that is the difference you are seeing, and you can leave port 111 closed."
   },
   {
    "q": "Why does my NFS mount hang instead of returning an error?",
    "a": "A hard mount, which is the default, retries indefinitely rather than failing when the server stops answering - that is deliberate, so a rebooting server does not corrupt in-flight writes. A firewall silently dropping port 2049 looks exactly the same from the client. Add -o soft,timeo=50 while troubleshooting, or test the path with nc -zv server 2049 first."
   },
   {
    "q": "Is it safe to expose NFS to the internet?",
    "a": "No. Standard NFS uses AUTH_SYS, where the client simply states which UID it is acting as and the server trusts that claim, so reaching port 2049 is effectively the same as having an account on the exports. Restrict it to a private network and cross the internet inside a VPN such as WireGuard, or use NFSv4 with sec=krb5p."
   }
  ]
 },
 "2375": {
  "intro": "2375 is the unencrypted Docker Engine remote API . When a daemon is started with -H tcp://0.0.0.0:2375 , the same API that the local docker command uses over its Unix socket is served over plain HTTP with no authentication and no TLS . That is not an oversight in your configuration — there is no password to set. What that means concretely: a stranger who can reach 2375 can run docker -H tcp://your.ip:2375 run -v /:/host -it alpine chroot /host sh and is now root on your host with your filesystem mounted. Internet-wide scanners look for this constantly, and the payload is almost always a cryptominer. If this checker reads OPEN, treat the host as compromised: pull it off the network, look at docker ps -a for containers you did not start, and check /var/log/auth.log and crontabs before you trust it again. How it usually gets opened by accident: A tutorial's /etc/docker/daemon.json containing \"hosts\": [\"tcp://0.0.0.0:2375\", \"unix:///var/run/docker.sock\"] , added to let a CI runner or an IDE connect. A systemd drop-in overriding ExecStart with -H tcp://0.0.0.0:2375 . Docker Desktop's \"Expose daemon on tcp://localhost:2375 without TLS\" option combined with a port-forward or an over-broad WSL bridge. Find it with ss -tlnp | grep 2375 , then systemctl cat docker | grep ExecStart and cat /etc/docker/daemon.json . What to do instead. The modern answer is the SSH transport: docker context create prod --docker \"host=ssh://user@server\" , or simply DOCKER_HOST=ssh://user@server docker ps . It reuses your existing SSH authentication and key material, opens no new port and works through the same firewall you already trust. If you truly need a TCP listener, 2376 with --tlsverify and client certificates is the only defensible form — and even then, restrict it by source address.",
  "faq": [
   {
    "q": "What is port 2375 used for?",
    "a": "It is the Docker daemon's remote API over plain HTTP, used by remote docker clients, CI runners and management tools. Docker does not listen on it unless someone explicitly configures -H tcp://... in daemon.json, a systemd unit or Docker Desktop's settings."
   },
   {
    "q": "Is exposing Docker port 2375 dangerous?",
    "a": "It is about as dangerous as anything gets. The API has no authentication, and it can start a container that mounts the host filesystem, so reaching the port is equivalent to root on the machine. Exposed daemons are found by automated scanners within minutes and are one of the most common sources of cryptomining compromises."
   },
   {
    "q": "How do I manage Docker remotely without opening a port?",
    "a": "Use the SSH transport: DOCKER_HOST=ssh://user@server docker ps, or create a named context with docker context create. Authentication is your existing SSH key, nothing new is exposed to the network, and the daemon can stay on its Unix socket."
   },
   {
    "q": "What is the difference between port 2375 and 2376?",
    "a": "2375 is the API without TLS and without any authentication. 2376 is the same API with TLS, and with --tlsverify it requires a client certificate signed by your CA, which is the only form of TCP exposure worth considering. Many guides enable TLS but omit --tlsverify, which encrypts the traffic while still letting anyone connect."
   }
  ]
 },
 "2376": {
  "intro": "2376 is the Docker Engine API over TLS . It carries exactly the same API as 2375 — create containers, mount host paths, read every environment variable and secret you passed in — but inside a TLS session, and, when configured correctly, only for clients holding a certificate signed by your CA. The distinction that matters is --tls versus --tlsverify . With --tls the daemon presents a certificate and encrypts the connection but accepts anyone — you have made an unauthenticated root API confidential, which helps nobody. Only --tlsverify validates the client certificate against --tlscacert . Check what you are actually running: systemctl cat docker | grep ExecStart and cat /etc/docker/daemon.json — look for \"tlsverify\": true alongside tlscacert , tlscert and tlskey . Test it the way an attacker would: curl -k https://192.168.1.10:2376/version . If that returns JSON instead of a TLS handshake failure, client verification is off and the port is as bad as 2375. A correct client call is docker --tlsverify --tlscacert=ca.pem --tlscert=cert.pem --tlskey=key.pem -H tcp://host:2376 ps , or the same paths in ~/.docker with DOCKER_TLS_VERIFY=1 . Reading the result. OPEN means the port is reachable from the internet; it says nothing about whether client certificates are enforced, because the check completes a TCP handshake and stops. Run the curl -k test above before you consider an OPEN result acceptable. CLOSED is the normal state, and the one you should aim for. If it reads closed and you meant to publish it: confirm the listener with ss -tlnp | grep 2376 — remember that setting hosts in daemon.json while the systemd unit also passes -H makes dockerd refuse to start entirely — then the host firewall and the router forward. Scope the firewall rule to the client's address rather than the world. Before doing any of that, weigh it against the SSH transport, which needs no open port, no CA and no annual certificate scramble.",
  "faq": [
   {
    "q": "What is the difference between --tls and --tlsverify in Docker?",
    "a": "--tls encrypts the connection and presents the server certificate but accepts any client, so the API remains effectively unauthenticated. --tlsverify additionally requires the client to present a certificate signed by the CA given in --tlscacert. Only the second is safe to have listening anywhere untrusted."
   },
   {
    "q": "Is port 2376 safe to expose to the internet?",
    "a": "Only with --tlsverify, a private CA, per-client certificates and a firewall rule limiting the source addresses — and even then it is root-equivalent access to the host, so most people are better served by DOCKER_HOST=ssh://user@host, which opens no additional port."
   },
   {
    "q": "How do I check whether my Docker TLS endpoint requires a client certificate?",
    "a": "Run curl -k https://host:2376/version from a machine with no client certificate. A JSON response means verification is disabled and anyone can drive your daemon; a TLS error about a required certificate means --tlsverify is doing its job."
   },
   {
    "q": "Docker will not start after I edited daemon.json — why?",
    "a": "If daemon.json sets \"hosts\" while the systemd unit's ExecStart also passes -H, dockerd exits with a conflicting options error. Either drop the hosts key and keep the flags in a systemd drop-in, or clear -H from ExecStart with an override and configure everything in daemon.json."
   }
  ]
 },
 "2456": {
  "intro": "UDP 2456 is the game port of a Valheim dedicated server - the -port 2456 argument in start_server.sh or start_headless_server.bat , and the default in LGSM and the common Docker images. It carries the actual gameplay: everything a connected player sends and receives. Valheim needs a contiguous pair . The server also opens the port immediately above the one you set - UDP 2457 - for the Steam query that puts you in the Community list. Set -port 2456 and you must forward 2456 and 2457; set -port 2470 and you forward 2470 and 2471. Older guides say 2456-2458 because early Steam matchmaking used the third port too; forwarding all three does no harm, but 2456 and 2457 are the pair that matters. Expect this checker to say closed. It opens TCP connections and Valheim is UDP only, so there is nothing to answer. That is not evidence of a broken server, and there is no trustworthy external UDP test either. Check it from the server: ss -lunp | grep 2456 - you should see UDP sockets on both 2456 and 2457 owned by valheim_server . sudo tcpdump -ni any udp portrange 2456-2457 while a friend outside your network joins by IP. Packets arriving prove the forward and the ISP path. sudo ufw allow 2456:2457/udp on the host, and make sure the router rule is a UDP forward - a TCP rule here does nothing. Players joining by address use your-ip:2456 in the Join Game screen's Join IP box - the game port, not the query port, even though the server browser found you on 2457. Remember the server password rule too: at least five characters, and it cannot appear inside the server name, or the server refuses to start. If forwarding is impossible - carrier-grade NAT, a router you do not control - turn on crossplay and use the join code. That path is brokered by PlayFab rather than by a direct connection to your WAN address, so it works with no ports open at all, at the cost of routing through Iron Gate's infrastructure.",
  "faq": [
   {
    "q": "What ports does a Valheim dedicated server need?",
    "a": "UDP 2456 for gameplay and UDP 2457 for the Steam query that lists the server, forwarded to the machine running valheim_server. The query port is always the game port plus one, so if you change -port both numbers move together. Older guides also list 2458, which early Steam matchmaking used and current servers do not need."
   },
   {
    "q": "Is Valheim port 2456 TCP or UDP?",
    "a": "UDP. Valheim has no TCP listener at all, so a TCP port check on 2456 reads closed on a perfectly working server. Create the router forward and any firewall rule as UDP; a TCP rule is the most common reason a Valheim forward appears to do nothing."
   },
   {
    "q": "Why can nobody join my Valheim server?",
    "a": "Confirm both 2456 and 2457 are forwarded as UDP to the host's current LAN address, that the host firewall allows them, and that players are connecting to the game port 2456 rather than 2457. Check the server password as well - it must be at least five characters and must not be contained in the server name, or the server will not start."
   },
   {
    "q": "Can I play Valheim together without port forwarding?",
    "a": "Yes. Enable crossplay on the server and share the join code: that connection is brokered through PlayFab rather than made directly to your public IP, so it works behind carrier-grade NAT and routers you cannot configure. A directly forwarded server is still the better option for latency and for appearing in the Community list."
   }
  ]
 },
 "2457": {
  "intro": "UDP 2457 is the Steam query port of a Valheim dedicated server - not the port players connect through. Valheim always opens the port one above its game port, so a server started with -port 2456 listens on 2456 for gameplay and 2457 for the A2S queries that Steam and the in-game Community list use to discover it, read its name and count its players. That split produces a very specific symptom, and it is why most people land on this page: friends can join by typing your IP, but the server never appears in the Community list. That is 2456 forwarded and 2457 not. The reverse also happens - the server shows in the browser with a healthy player count but joining times out - which is 2457 forwarded and 2456 not. Fix it by forwarding both, as UDP, to the same host: Router: two UDP forwards, 2456 and 2457, or a single 2456-2457 range rule if your router supports ranges. Host firewall: sudo ufw allow 2456:2457/udp , or on Windows netsh advfirewall firewall add rule name=\"Valheim\" dir=in action=allow protocol=UDP localport=2456-2457 . Confirm the binds: ss -lunp | grep -E '2456|2457' should show both, owned by valheim_server . This checker is TCP, so it will read closed here regardless. Valheim opens no TCP socket at all. To test the query path honestly, ask someone outside your network to search the Community list for your server name after ticking that filter, or run sudo tcpdump -ni any udp port 2457 and watch for query packets arriving from Steam's infrastructure - they arrive continuously once the listing works. Two related settings. The server must be started with -public 1 to advertise at all; with -public 0 it stays joinable by IP but is deliberately unlisted, and no amount of port forwarding will change that. And if you moved the game port, the query port moved with it - there is no separate option to set it independently.",
  "faq": [
   {
    "q": "Why is my Valheim server not showing in the Community list?",
    "a": "Almost always because UDP 2457, the query port, is not forwarded even though the game port 2456 is - which is exactly why people can still join by IP. Forward both as UDP to the same host, and make sure the server was started with -public 1, because -public 0 keeps it deliberately unlisted."
   },
   {
    "q": "What is the difference between Valheim port 2456 and 2457?",
    "a": "2456 carries the actual gameplay traffic and is the port players type when joining by IP. 2457 answers Steam A2S queries with the server name, map and player count, which is how the Community list and the Steam server browser find you. Both are UDP and both need forwarding for a fully working public server."
   },
   {
    "q": "Can I change the Valheim query port on its own?",
    "a": "No. The query port is always the game port plus one, derived from the -port argument, and there is no separate setting for it. Start the server with -port 2470 and the query listener moves to 2471; forward whichever pair you end up with."
   },
   {
    "q": "Do I need to forward port 2458 for Valheim?",
    "a": "Not for a current server. The 2456-2458 range in older guides dates from the earlier Steam networking behaviour; today the game port and the query port immediately above it are what a public server needs. Forwarding the extra port causes no harm if your router rule is already written as a range."
   }
  ]
 },
 "2525": {
  "intro": "Port 2525 is not an official SMTP port. IANA has 2525 registered to something entirely unrelated to mail, and no RFC assigns it. It exists purely as a convention: SendGrid , Mailgun , Mailjet , Brevo , Postmark and most other transactional-mail providers also listen on 2525 so that a customer whose ISP or hosting provider filters 25 and 587 still has a way to submit mail. Protocol-wise it is identical to 587 - ESMTP, SMTP AUTH, and STARTTLS to encrypt the session. Be clear which direction your problem runs in, because it changes which test you need: Outbound - \"my application cannot reach my provider's SMTP on 2525\". That is a test you run from the sending host: nc -zv smtp.example.net 2525 , or openssl s_client -starttls smtp -connect smtp.example.net:2525 to see the certificate and the AUTH line. The checker on this page cannot answer it, because it only ever connects back to your own address. Inbound - \"I added a 2525 listener to my own mail server as an escape hatch for networks that block 587, and I need to know it is reachable from outside\". That is exactly what this checker tests. OPEN means something completed the handshake on 2525 from the internet. Confirm it is really SMTP and really offers TLS before you rely on it: run openssl s_client -starttls smtp -connect mail.example.com:2525 , send EHLO test , and look for 250-AUTH in the response. If AUTH is advertised before the STARTTLS upgrade, tighten that before any client uses the port. CLOSED almost always means the listener does not exist. On Postfix a 2525 service is an extra master.cf entry copied from the submission block with the port number changed - nothing creates it for you, and ss -tlnp | grep ':2525 ' will show nothing at all until you do. After that check sudo ufw status and sudo ufw allow 2525/tcp , then the router's TCP 2525 forward. Two honest caveats. Moving to 2525 does not defeat a network that blocks outbound mail by inspecting the protocol rather than the port number. And 2525 is submission only - other mail servers deliver to your MX on port 25 and will never try 2525, so it does nothing at all for receiving mail.",
  "faq": [
   {
    "q": "What is port 2525 used for?",
    "a": "It is an unofficial alternate port for SMTP message submission. Transactional-mail providers such as SendGrid, Mailgun, Mailjet, Brevo and Postmark offer it alongside 587 so customers on networks that filter the standard mail ports can still send. The protocol spoken on it is ordinary ESMTP with AUTH and STARTTLS."
   },
   {
    "q": "Is port 2525 an official SMTP port?",
    "a": "No. IANA's registry assigns 2525 to an unrelated service and no mail RFC mentions it, so nothing on the internet is obliged to answer there. It works only because individual providers chose to listen on it, which is why a server that accepts mail on 587 may reject the connection on 2525."
   },
   {
    "q": "Is port 2525 encrypted?",
    "a": "Only if STARTTLS is negotiated, exactly as on 587. There is no implicit-TLS convention on 2525, so the session opens in cleartext and the client must issue STARTTLS before authenticating. Configure the client to require TLS rather than accept it opportunistically, or use 465 where the provider offers it."
   },
   {
    "q": "Should I use port 2525 instead of 587?",
    "a": "Use 587 or 465 by default and keep 2525 as the fallback for a network that blocks them. Because 2525 is unofficial, support varies between providers and some corporate firewalls block high non-standard ports outright, so it solves one class of blocking rather than all of them."
   }
  ]
 },
 "3000": {
  "intro": "Port 3000 has no IANA meaning — it became the default for Node.js tooling and everything downstream copied it. Today the realistic listeners are an Express app, a Next.js or Vite development server, Grafana , Gitea or Metabase . Two very different visitors land here. The first is a developer whose teammate cannot reach http://my-laptop:3000 . The cause is nearly always the bind address: modern dev servers listen on localhost deliberately, and you have to ask for more — next dev --hostname 0.0.0.0 , vite --host , or app.listen(3000, '0.0.0.0') . The second is a self-hoster who has put Grafana or Gitea on 3000 and wants it reachable from outside. Both are real applications with real logins, and both are also scanned relentlessly — Grafana's admin/admin first-run credential and unfinished Gitea installer pages are found by automated scanners within days of being exposed. Reading the result. OPEN means a public TCP connection reached 3000. If that was not deliberate, treat it as something to close now rather than later. CLOSED while the app works locally means the listener is on loopback, the host firewall is dropping the SYN, or the forward is missing — in that order of likelihood. If it reads closed: ss -tlnp | grep ':3000 ' . 127.0.0.1:3000 is the diagnosis; 0.0.0.0:3000 means look at the firewall next. Grafana's bind is http_addr and http_port in grafana.ini ; Gitea's are HTTP_ADDR and HTTP_PORT in app.ini . Changing the port there without restarting the service is a classic wasted hour. sudo ufw allow 3000/tcp on the host, then re-test. For a dev server, do not forward at all — ssh -L 3000:127.0.0.1:3000 user@host gives your colleague the same page with no exposure. For Grafana or Gitea, put nginx or Caddy on 443 in front, set root_url or ROOT_URL to the public HTTPS address so redirects and OAuth callbacks work, and leave 3000 bound to loopback.",
  "faq": [
   {
    "q": "Why can't others access my app on port 3000?",
    "a": "Most Node dev servers bind 127.0.0.1 by default, so nothing outside the machine can connect regardless of firewalls. Start the server with an explicit host — next dev --hostname 0.0.0.0, vite --host, or app.listen(3000, '0.0.0.0') — then allow 3000 through the host firewall and check the router forward."
   },
   {
    "q": "What is running on port 3000?",
    "a": "It is unassigned, so it depends on the host: an Express or Next.js app, a Vite dev server, Grafana, Gitea or Metabase are the common answers. Run ss -tlnp | grep ':3000 ' on Linux, or lsof -nP -iTCP:3000 -sTCP:LISTEN on macOS, to see the actual process."
   },
   {
    "q": "Is it safe to expose Grafana on port 3000?",
    "a": "Not as it ships. Grafana's first-run credential is admin/admin, anonymous access can be enabled by accident, and dashboards frequently contain infrastructure detail you would not publish. Change the admin password, put it behind a reverse proxy on 443 with TLS, and prefer a VPN if only you need access."
   },
   {
    "q": "How do I fix 'port 3000 is already in use'?",
    "a": "Find the process holding it: ss -tlnp | grep ':3000 ' on Linux, lsof -nP -iTCP:3000 -sTCP:LISTEN on macOS, or netstat -ano | findstr :3000 on Windows. Stop that process, or start your app on another port with PORT=3001 npm run dev. A previous run that did not exit cleanly is the usual cause."
   }
  ]
 },
 "3128": {
  "intro": "3128 is Squid 's default http_port . Squid is a forward and caching proxy: clients are configured to send their HTTP requests to it, and it fetches on their behalf, optionally caching, filtering and logging. Other appliances borrow the port for their own forward proxies, and Proxmox VE uses 3128 for its SPICE proxy when you open a VM console — worth knowing if 3128 turns up on a hypervisor you did not configure as a proxy. Squid ships safe. The stock squid.conf defines localnet ACLs, allows those, and ends with http_access deny all . Every open proxy incident starts the same way: someone gets 403 Forbidden or TCP_DENIED/403 in /var/log/squid/access.log , searches for a fix, and pastes http_access allow all into the config. That single line, combined with a port-forward, publishes an anonymous relay to the internet. Reading the result. The right answer for 3128 is CLOSED. If this check reads OPEN, your proxy is reachable from the internet and you should assume it is already being probed — open-proxy scrapers test 3128, 8080 and 1080 first. Two consequences follow quickly: outbound abuse attributed to your address, and requests aimed at internal names, because a forward proxy sits inside your network and will resolve and fetch LAN addresses on a stranger's behalf unless an ACL stops it. If it is open: Confirm what is listening: ss -tlnp | grep ':3128 ' . Read the ACL order in /etc/squid/squid.conf . Rules are evaluated top to bottom and the first match wins, so an allow all anywhere above the deny makes everything below it decorative. Restore http_access deny all as the last rule and run squid -k parse then squid -k reconfigure . Bind it to the inside interface with http_port 192.168.1.10:3128 rather than the default all-interfaces bind. Remove the router forward, and check UPnP has not created one. Grep the log for who has been using it: awk '{print $3}' /var/log/squid/access.log | sort | uniq -c | sort -rn | head . Addresses outside your LAN in that list mean it has already been found. Legitimate remote use of a proxy is a VPN problem, not a firewall problem: connect with WireGuard and point the browser at the proxy's private address.",
  "faq": [
   {
    "q": "What is port 3128 used for?",
    "a": "It is Squid's default HTTP proxy port — clients send their web requests there and Squid fetches, caches and logs on their behalf. Other forward proxies reuse the number, and Proxmox VE also uses 3128 for its SPICE console proxy."
   },
   {
    "q": "Should port 3128 be open to the internet?",
    "a": "No. An internet-reachable Squid is an open proxy the moment its ACLs are loosened, and it will be found by automated scanners within days. The traffic pushed through it is attributed to your IP, and it can also be used to reach hosts inside your own network. Keep it on the LAN and use a VPN for remote access."
   },
   {
    "q": "Why does Squid return 403 Forbidden?",
    "a": "Because the client's source address is not covered by an allow rule, so it falls through to the final http_access deny all. The correct fix is to add that client's subnet to the localnet ACL, not to add allow all — which turns the proxy into an open relay for the entire internet."
   },
   {
    "q": "How do I check who is using my Squid proxy?",
    "a": "Read /var/log/squid/access.log — the third field is the client address. Summarise it with awk '{print $3}' /var/log/squid/access.log | sort | uniq -c | sort -rn | head. Any address that is not on your own network means the proxy has been discovered and is being used by strangers."
   }
  ]
 },
 "3306": {
  "intro": "TCP 3306 is where mysqld and mariadbd listen. Percona Server, the official MySQL Docker image and Amazon RDS for MySQL all use the same default. (MySQL's newer X Protocol is a separate port, 33060, used by mysqlsh and the document store - if a tool is failing there, 3306 is not your problem.) Almost everyone who tests this port is trying to reach a database from another machine. There are two independent gates , and the error message tells you which one you are stuck behind: ERROR 2003 (HY000): Can't connect to MySQL server on 'host' (110) - a network-level failure. Nothing accepted the TCP connection. ERROR 1130 (HY000): Host '203.0.113.10' is not allowed to connect to this MySQL server - good news, in a sense : the port is open and the server answered. This is the grant table, not the firewall. MySQL accounts are user and host: 'app'@'localhost' will not accept a connection from anywhere else. You need CREATE USER 'app'@'192.168.1.%' IDENTIFIED BY '...' and a matching GRANT . For the 2003 case, the cause is nearly always the bind address. Debian and Ubuntu packages ship bind-address = 127.0.0.1 in /etc/mysql/mysql.conf.d/mysqld.cnf (MariaDB uses /etc/mysql/mariadb.conf.d/50-server.cnf ). Confirm with ss -tlnp | grep 3306 : 127.0.0.1:3306 means only local clients will ever connect. Change it to the server's private address - not 0.0.0.0 unless you mean it - restart, then sudo ufw allow from 192.168.1.0/24 to any port 3306 . One Docker trap that catches people out: publishing a container with -p 3306:3306 binds every interface and inserts NAT rules that bypass ufw , so a database you believed was firewalled ends up on the public internet. Use -p 127.0.0.1:3306:3306 instead. Which brings us to the result on this page. CLOSED / filtered is what you want. If this check says OPEN , your MySQL server is accepting connections from the entire internet, and it is being probed right now - port 3306 is one of the most scanned ports there is. Keep the database on the private side, let application servers reach it over the internal network, and tunnel for admin work: ssh -L 3306:127.0.0.1:3306 user@dbhost , then point your client at 127.0.0.1 .",
  "faq": [
   {
    "q": "How do I allow remote connections to MySQL?",
    "a": "Two changes are needed. Set bind-address in mysqld.cnf to the server's private address (Debian and Ubuntu default it to 127.0.0.1) and restart the service. Then create the account with the right host part - CREATE USER 'app'@'192.168.1.%' - and grant it privileges, because a user defined as 'app'@'localhost' can never log in from another machine."
   },
   {
    "q": "What does 'Host is not allowed to connect to this MySQL server' mean?",
    "a": "It means the network path is working and MySQL itself rejected you. MySQL identifies accounts by user and host together, so a login that exists only as 'app'@'localhost' is refused from any other address. Create the account with the correct host pattern, or a wildcard limited to your subnet, and run FLUSH PRIVILEGES if you edited the tables directly."
   },
   {
    "q": "Is it safe to open port 3306 to the internet?",
    "a": "No. Port 3306 is among the most heavily scanned ports on the internet and an exposed instance sees continuous automated login attempts, where one weak or reused password means the whole dataset. Bind mysqld to a private address, allow only the application servers that need it, and use an SSH tunnel for administrative access."
   },
   {
    "q": "Do MySQL and MariaDB use the same port?",
    "a": "Yes, both default to TCP 3306 and speak the same wire protocol, which is why the same clients work against either. MySQL additionally offers the X Protocol on port 33060 for the document store and MySQL Shell, and MariaDB does not. Running both servers on one host means changing the port for one of them."
   }
  ]
 },
 "3389": {
  "intro": "Port 3389 is RDP , Microsoft's Remote Desktop Protocol. On Windows it is served by Remote Desktop Services ( termsrv , hosted inside svchost.exe ); on Linux the listener is normally xrdp . TCP 3389 carries the session and is mandatory. RDP 8 and later can additionally use UDP 3389 as a side channel for graphics and audio, which improves a laggy link but is optional - the connection falls back to TCP alone if UDP is filtered, and this checker tests the TCP half. The usual reason for landing here is that Remote Desktop connects fine from the sofa and times out from work with the remote computer is unreachable . That is the LAN path working and the WAN path not, so the router forward, the Windows firewall or the ISP is at fault. OPEN means the handshake to 3389 completed from the outside world. Before you celebrate, read the sentence above about exposure - an open 3389 is scanned and password-sprayed continuously, and CVE-2019-0708 (BlueKeep) was a pre-authentication, wormable hole in exactly this service. CLOSED means the SYN died somewhere between our probe and termsrv . Working through a closed result on Windows: Is the host even capable? Windows Home editions can run the Remote Desktop client but cannot host a session. You need Pro, Enterprise or Education - this catches people out constantly. Turn it on: Settings, System, Remote Desktop. Then verify the listener with Get-NetTCPConnection -LocalPort 3389 . Check the firewall rule group, not just the profile: netsh advfirewall firewall show rule name=\"Remote Desktop - User Mode (TCP-In)\" . Enabling Remote Desktop opens it for Private networks; if the NIC is classified Public the rule stays shut. If the port was moved, the value lives at HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp\\PortNumber and needs a reboot plus a matching firewall rule. Test that number here instead. On xrdp, ss -tlnp | grep 3389 and systemctl status xrdp ; a stopped xrdp-sesman gives a connection that opens and instantly closes. The better ending to this exercise is a tunnel: bring up WireGuard on the router or the machine itself, dial the VPN, then RDP to the private address. The port-forward disappears, and so does the entire brute-force problem.",
  "faq": [
   {
    "q": "Why is my RDP port 3389 not opening?",
    "a": "In order of frequency: the machine runs Windows Home, which cannot host Remote Desktop; the Windows Defender Firewall rule is enabled only for the Private profile while the network is classified Public; the router forward points at an address the PC no longer has; or the ISP places you behind carrier-grade NAT so no inbound forward can work. Confirm the listener locally with Get-NetTCPConnection -LocalPort 3389 before touching the router again."
   },
   {
    "q": "Is it safe to open port 3389 to the internet?",
    "a": "No. Exposed RDP is one of the most heavily scanned services on the internet and a leading initial-access vector for ransomware, both through credential stuffing and through serious protocol flaws such as BlueKeep (CVE-2019-0708). If you need remote desktop from outside, run WireGuard or Tailscale and RDP over the tunnel, or publish it through an RD Gateway on 443 with multi-factor authentication."
   },
   {
    "q": "Can I change the RDP port from 3389?",
    "a": "Yes - edit PortNumber under HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp, add a firewall rule for the new port and reboot. It cuts down automated scan traffic, but it is obfuscation rather than protection: a scanner that sweeps all 65535 ports still finds it, so keep the VPN in front."
   },
   {
    "q": "Does RDP use TCP or UDP?",
    "a": "TCP 3389 always, and optionally UDP 3389 as well. RDP 8.0 introduced a UDP transport that carries graphics and audio for lower latency on lossy links; if UDP is blocked the client silently uses TCP only. A port checker that tests TCP is testing the part the connection cannot live without."
   }
  ]
 },
 "3478": {
  "intro": "Port 3478 does two related jobs. STUN is a single question and answer - a client asks the server \"what address and port do you see me coming from?\" and uses the reply to advertise a candidate the far end can reach. TURN is the fallback for when that fails: the server relays the media itself, which costs it real bandwidth and is why TURN requires credentials and STUN does not. Both run on 3478 in coturn , the server behind Jitsi Meet, Nextcloud Talk, Matrix/Element calls and most self-hosted WebRTC. The TLS and DTLS variants ( stuns / turns ) use 5349. The reason people end up here is usually one-way audio or video, or a call that connects and then shows nothing . Direct peer-to-peer works between most home networks, but symmetric NAT on one side - common on mobile carriers and corporate firewalls - kills it, and then everything depends on your TURN server being reachable. This page's checker is genuinely useful for 3478 , because coturn's default listening-port=3478 binds TCP as well as UDP. An open result means the TCP half of your relay is reachable from the internet. A closed result with the service running usually means the firewall only allows UDP, which is worth fixing - TCP TURN is what rescues clients on networks that block UDP altogether. Check the listeners: ss -lunp | grep 3478 and ss -ltnp | grep 3478 . Open the whole set: ufw allow 3478 , ufw allow 5349 , and - the step everyone forgets - the relay port range , coturn's min-port / max-port (49152-65535 by default). TURN allocates a fresh UDP port per session inside that range, so if it is closed, TURN negotiates and then relays nothing. Test the server end to end with turnutils_uclient -v -u user -w password 203.0.113.20 , or paste the URL and credentials into a WebRTC ICE candidate test page and look for a relay candidate. coturn behind NAT needs external-ip=<public>/<private> , otherwise it advertises its internal address and every relay candidate is unusable. Games consoles use the same STUN mechanism to decide the NAT type they report; a \"strict\" or type 3 result is about your router's NAT behaviour and UPnP, not about anything listening on 3478 at your house.",
  "faq": [
   {
    "q": "What is the difference between STUN and TURN on port 3478?",
    "a": "STUN just tells a client what public address and port its packets appear to come from, so the two peers can try to connect directly. TURN relays the media through the server when a direct path is impossible, which uses the server's bandwidth and therefore needs authentication. Most deployments run both on 3478 with coturn."
   },
   {
    "q": "Which ports does a coturn TURN server need open?",
    "a": "UDP and TCP 3478 for STUN/TURN, TCP 5349 if you offer TLS (turns:), and the whole relay range set by min-port and max-port - 49152 to 65535 unless you narrow it. Leaving the relay range closed is the most common cause of a TURN server that appears to work but passes no media."
   },
   {
    "q": "Why is my WebRTC call one-way?",
    "a": "One side can reach the other but not the reverse, which almost always means ICE fell back to a relay candidate that only one peer can use. Confirm your TURN server is reachable on 3478 from outside, that credentials are valid, and that coturn knows its own public address via external-ip if it sits behind NAT."
   },
   {
    "q": "Is it safe to expose port 3478 to the internet?",
    "a": "It has to be exposed to work, but never without authentication. An open TURN relay gets found and used as an anonymous proxy, and if it will relay to private ranges it becomes a path into your own LAN. Require long-term credentials or a static auth secret, and deny RFC 1918 and multicast destinations explicitly."
   }
  ]
 },
 "4500": {
  "intro": "UDP 4500 is IPsec NAT traversal . When IKE discovers during its first exchange that one of the peers is behind a NAT device - it compares hashes of the addresses each side thinks it is using - both ends move off port 500 and continue on 4500, and from then on the ESP payload is wrapped inside UDP so a NAT can rewrite it like any other UDP flow. Native ESP is IP protocol 50 and carries no port numbers at all, which is exactly why NAT breaks it and why this port exists. The same daemons listen here as on 500: strongSwan, Libreswan, RRAS on Windows Server, and the built-in IPsec stacks in OPNsense, pfSense, ASA, FortiGate and RouterOS. Practically every modern remote-access IPsec profile - the IKEv2 clients built into Windows, macOS, iOS and Android, and the old L2TP/IPsec ones - ends up on 4500 the moment the user is on a home or hotel network. The classic symptom that brings people here is a tunnel that comes up and then passes nothing : phase 1 and phase 2 both complete, swanctl --list-sas shows an INSTALLED child SA, and the byte counters stay at zero. That is almost always UDP 4500 being blocked or forwarded to the wrong host while 500 is forwarded correctly. Forward both ports to the same internal address. Splitting 500 and 4500 across two hosts produces exactly this failure. Check the listener: ss -lunp | grep 4500 on the gateway. Watch the wire: tcpdump -ni any udp port 4500 while a client connects. Packets in but none out means a firewall or route problem on the gateway; nothing at all means the forward is wrong. Keepalives matter. NAT mappings expire; IPsec sends NAT keepalives every 20 seconds by default so the pinhole stays open. If tunnels die after a few minutes of idle time, that timer or an aggressive router NAT table is the place to look. The checker on this page opens TCP connections, and NAT-T is UDP, so a closed result here proves nothing about your VPN. One nuance: RFC 8229 defines a TCP encapsulation fallback that also uses port 4500 for networks that drop UDP entirely, and some implementations - strongSwan and Apple's client among them - support it. If you have deliberately enabled that, a TCP test can read open; on an ordinary gateway it will not.",
  "faq": [
   {
    "q": "What is UDP port 4500 used for?",
    "a": "IPsec NAT traversal. Once IKE detects a NAT between the peers, the negotiation and the ESP data are both encapsulated in UDP on port 4500 so the NAT device can translate them. Without it, native ESP (IP protocol 50) has no ports for a NAT to rewrite and the tunnel fails."
   },
   {
    "q": "My VPN connects but no traffic passes - is that port 4500?",
    "a": "Very often, yes. If IKE completes on port 500 but the ESP-in-UDP flow on 4500 is blocked or forwarded to a different internal host, you get a tunnel that shows as established with zero bytes transferred. Forward UDP 500 and 4500 to the same gateway and re-test."
   },
   {
    "q": "Do I still need port 4500 if nothing is behind NAT?",
    "a": "Strictly no - two peers with public addresses can use native ESP on IP protocol 50 after negotiating on port 500. In practice you should allow 4500 anyway, because your remote users will be behind hotel, mobile and home NAT, and their clients will insist on it."
   },
   {
    "q": "Can a port checker test UDP 4500?",
    "a": "Not a TCP one. UDP gives no handshake, so an external tool cannot distinguish a listening NAT-T daemon from a dropped packet. Use ike-scan against port 4500, or run tcpdump on the gateway while a real client dials in - that tells you definitively whether the packet arrived."
   }
  ]
 },
 "5000": {
  "intro": "Port 5000 is where four unrelated things collide, which is why it generates more confusion than any other unassigned port. Flask 's development server defaults to 5000, as does ASP.NET Core Kestrel for plain HTTP. Docker Registry (the registry:2 image) listens on 5000, which is why localhost:5000/myimage shows up in every registry tutorial. Synology DSM uses 5000 for its HTTP web interface and 5001 for HTTPS. On macOS Monterey and later , AirPlay Receiver binds 5000 (and 7000) as part of Control Center. A great many Flask tutorials break here: flask run reports Address already in use , or it starts and every request comes back as a 403 from a server calling itself AirTunes . Turn it off in System Settings → General → AirDrop & Handoff → AirPlay Receiver, or run on another port with flask run -p 5001 . There is a fourth listener you did not install: plenty of consumer routers and IGD implementations run their UPnP service on TCP 5000. So an OPEN result for 5000 from the internet, on a network where you never forwarded anything, is quite likely your router offering UPnP to the WAN — which is a genuine problem worth fixing in the router's settings, not a success. Reading the result. OPEN means a public TCP connection completed to 5000 on your address. Confirm what answered before assuming it is your app: curl -sI http://your-public-ip:5000/ from an outside network and look at the Server header — AirTunes , a Synology redirect, and a Werkzeug banner are all easy to tell apart. CLOSED is the correct default for a Flask dev server. If it reads closed and you need it open: check the bind with ss -tlnp | grep ':5000 ' on Linux or lsof -nP -iTCP:5000 -sTCP:LISTEN on macOS. Flask needs flask run --host=0.0.0.0 ; Kestrel needs its URLs set to http://0.0.0.0:5000 . Then sudo ufw allow 5000/tcp . For anything that will stay up, run the app under gunicorn or waitress behind a reverse proxy on 443 rather than exposing the development server, which is single-threaded and has no protection against anything.",
  "faq": [
   {
    "q": "Why is port 5000 already in use on macOS?",
    "a": "Since macOS Monterey, AirPlay Receiver listens on ports 5000 and 7000 as part of Control Center. Flask and other tools that default to 5000 then fail with 'Address already in use', or answer with a 403 from AirTunes. Disable AirPlay Receiver in System Settings under General → AirDrop & Handoff, or run your app on a different port."
   },
   {
    "q": "Why does my Flask app return 403 Forbidden on port 5000?",
    "a": "That response usually is not from Flask at all — it is the macOS AirPlay Receiver service answering on the same port. Check the Server header in the response; if it says AirTunes, turn AirPlay Receiver off or move your app with flask run -p 5001."
   },
   {
    "q": "Is port 5000 open on my router because of UPnP?",
    "a": "It can be. A number of consumer routers run their UPnP or IGD service on TCP 5000, and some expose it on the WAN interface. If this test shows 5000 open and you forwarded nothing, look in the router's settings for UPnP and for WAN-side remote management, and disable both."
   },
   {
    "q": "Should I expose a Docker registry on port 5000?",
    "a": "Not without authentication and TLS. The registry:2 image has no auth by default, so an exposed 5000 lets anyone pull your images and push new ones that your hosts will later run. Put it behind a reverse proxy on 443 with htpasswd auth and a real certificate, or keep it on a private network."
   }
  ]
 },
 "5055": {
  "intro": "5055 is the default HTTP port for Overseerr and its fork Jellyseerr — the request portal you hand to friends so they can ask for a film or a series without touching Sonarr or Radarr. It is one of the few self-hosted admin-adjacent services that is meant to have outside users, which is why the answer here is not simply \"never expose it\". The usual complaint is that it works at http://192.168.1.20:5055 at home and nobody outside can load it. Work through this: Confirm the listener: ss -tlnp | grep ':5055 ' . In Docker the container needs -p 5055:5055 , and the PORT environment variable changes the internal port if you have set it. Check what your users are actually being sent to. Overseerr builds absolute links for notifications and password resets from Settings → General → Application URL ; if that still says a private address, e-mailed links will point into their own LANs and fail confusingly. If you are behind a reverse proxy, Overseerr needs Enable proxy support switched on so it trusts X-Forwarded-For , otherwise every request appears to come from the proxy and rate limiting misbehaves. Reading the result. OPEN means the whole path works from the public internet to 5055 — but if that is how your users reach it, they are sending Plex or Jellyfin credentials over unencrypted HTTP, and browsers will flag the login form. CLOSED simply means nothing inbound reaches that port, which is the right state once you serve the site properly on 443. The configuration to aim for: a reverse proxy (Caddy, nginx, Traefik) holding a certificate for a hostname like requests.example.com , listening on 443, forwarding to 127.0.0.1:5055 , with 5055 itself never forwarded on the router. That gives your users a normal HTTPS site, keeps the Overseerr process off the open internet, and lets you put Fail2ban or a WAF in front. If the portal is only for you, skip all of it and use WireGuard.",
  "faq": [
   {
    "q": "What port does Overseerr use?",
    "a": "TCP 5055 by default, and Jellyseerr uses the same number. It can be changed with the PORT environment variable, though most deployments leave it alone and remap it at the reverse proxy instead."
   },
   {
    "q": "How do I let friends access Overseerr from outside my network?",
    "a": "Point a hostname at your public IP, run a reverse proxy on 443 with a Let's Encrypt certificate, and have it proxy to 127.0.0.1:5055. Forward only 443 on the router, set Application URL in Overseerr's settings to the public https URL, and enable proxy support so client IPs are read from X-Forwarded-For."
   },
   {
    "q": "Is it safe to port forward 5055 directly?",
    "a": "It works, but everything including the Plex or Jellyfin sign-in travels as cleartext HTTP, and you lose the ability to add TLS, rate limiting or an authentication layer in front. Use a reverse proxy on 443 instead; it is the same amount of work once and considerably safer."
   },
   {
    "q": "Why can Overseerr not connect to Sonarr or Radarr?",
    "a": "It is normally a container networking issue rather than a firewall one: inside Docker, localhost refers to the Overseerr container itself, so Sonarr must be addressed by service name or the host's LAN address on 8989, and Radarr on 7878. Confirm the API key and that \"Enable SSL\" matches how those services are actually served."
   }
  ]
 },
 "5060": {
  "intro": "Port 5060 is SIP signalling in the clear - the REGISTER, INVITE and BYE messages that set up and tear down calls. UDP is the historical default and still the most common; TCP is equally valid and is what large deployments tend to use. What binds it is a PBX or proxy: Asterisk (chan_pjsip listens on UDP and TCP 5060 out of the box), FreePBX on top of it, FreeSWITCH (internal profile on 5060, external on 5080), Kamailio, OpenSIPS, 3CX, and every desk phone on your LAN. SIP is not the audio. The media travels as RTP on a separate UDP range - Asterisk defaults to 10000-20000, FreeSWITCH to 16384-32768 - negotiated per call in the SDP body. This is why the number one VoIP complaint, one-way or no audio with calls that otherwise connect, is almost never a port 5060 problem. Signalling got through; RTP did not. Reading a result here. The checker tests TCP. If your PBX has a TCP transport enabled, an open result proves the forward and the daemon are working. If you run SIP over UDP only - the common case - closed is expected and tells you nothing. Locally, ss -lunp | grep 5060 and ss -ltnp | grep 5060 show which transports are actually bound. Turn off SIP ALG on the router. Consumer firmware rewrites SIP headers and SDP bodies badly, and it is the single most common cause of registrations that drop after 30 seconds or calls with no audio. Disable it and let the PBX handle NAT with its own external address settings. Trunk registration usually needs no forward at all. Your PBX registers outbound to the provider and the NAT state carries the replies; a static IP trunk with no registration is the case that needs an inbound rule, scoped to the provider's addresses. Watch the actual SIP dialogue with sngrep on the PBX - it shows the ladder diagram live and will point at a 401, 403 or 408 immediately. In Asterisk, asterisk -rx \"pjsip show endpoints\" and pjsip show registrations tell you whether phones and trunks are up without guessing. If you do open 5060 to the world, assume it will be scanned constantly by tools looking for extensions with weak passwords - toll fraud pays, and that is the entire business model behind the traffic.",
  "faq": [
   {
    "q": "What port does SIP use, 5060 or 5061?",
    "a": "5060 is plain SIP over UDP or TCP with no encryption; 5061 is SIP over TLS. Both carry only the signalling. Audio and video ride on RTP over a separate UDP port range chosen per call, so opening 5060 alone never fixes an audio problem."
   },
   {
    "q": "Why is my VoIP audio one-way?",
    "a": "Because RTP is not flowing in both directions, not because of port 5060. Check that the RTP range your PBX advertises (10000-20000 for Asterisk by default) is allowed and forwarded, that the PBX is telling the far end its public address rather than an internal one, and that SIP ALG on the router is turned off so it stops rewriting the SDP."
   },
   {
    "q": "Do I need to forward port 5060 for a SIP trunk?",
    "a": "Usually not. If your PBX registers to the provider, the outbound registration keeps a NAT mapping open and the calls come back through it. You only need an inbound rule for IP-authenticated trunks or for remote phones registering from outside, and in both cases restrict the source addresses rather than opening 5060 to everyone."
   },
   {
    "q": "Is it safe to expose port 5060 to the internet?",
    "a": "Only with care. Exposed PBXs get automated REGISTER and INVITE scans continuously, and a guessed extension password turns into international call charges quickly. Limit the source addresses, use long random secrets that are not the extension number, disable guest or anonymous SIP, and run fail2ban against the SIP log."
   }
  ]
 },
 "5061": {
  "intro": "Port 5061 is SIP over TLS . It is the same protocol as port 5060 wrapped in a TLS session, so it is TCP only - there is no UDP listener to look for. Anything serious speaks it: Asterisk with a pjsip transport-tls and a certificate, FreePBX, FreeSWITCH, Kamailio, 3CX, Cisco Unified CM for secure trunks, and the session border controllers used for Microsoft Teams Direct Routing, which requires TLS on 5061. What TLS here does and does not protect. It encrypts the signalling - who called whom, the extensions, the headers, and the SDP body. That last part matters more than people expect, because with SDES the SRTP media keys are carried in the SDP; sending them over plain 5060 hands an eavesdropper the keys to the audio. What TLS on 5061 does not do is encrypt the media itself. RTP still leaves on its own UDP range in the clear unless you separately enable SRTP (in Asterisk, media_encryption=sdes or DTLS for WebRTC endpoints). This is one of the few VoIP ports the checker on this page tests properly. 5061 is TCP, so an open result really does mean the port-forward, the host firewall and the TLS listener are all working from the internet's point of view. If it reads closed while the service is up, the usual causes are a firewall rule that only covers 5060, or a PBX that failed to load the transport because the certificate or key file was unreadable. Confirm the listener: ss -ltnp | grep 5061 . Inspect what it presents: openssl s_client -connect 203.0.113.30:5061 prints the certificate chain, the negotiated TLS version and the expiry date. An expired or mismatched certificate is the most common reason phones stop registering overnight. In Asterisk, asterisk -rx \"pjsip show transports\" shows whether the TLS transport actually came up, and pjsip set logger on plus sngrep will show you the dialogue once it does. Phones must trust the chain. A self-signed certificate means loading the CA onto every handset; a publicly trusted certificate is usually less work. If registrations fail on 5061 but succeed on 5060, suspect the certificate or the client's TLS version before you touch the dial plan.",
  "faq": [
   {
    "q": "What is port 5061 used for?",
    "a": "SIP signalling over TLS. It carries the same REGISTER, INVITE and BYE messages as port 5060 but inside an encrypted TCP session, which hides call metadata and protects the SRTP keys carried in the SDP. 5061 is registered for UDP as well, but SIP over TLS is TCP - there is no UDP listener to look for."
   },
   {
    "q": "Does SIP TLS on 5061 encrypt the audio?",
    "a": "No. TLS protects only the signalling channel. The media still travels as RTP on a separate UDP port range and is unencrypted unless you also enable SRTP, which in Asterisk means media_encryption=sdes on the endpoint, or DTLS-SRTP for WebRTC clients."
   },
   {
    "q": "Why do my phones fail to register on 5061 but work on 5060?",
    "a": "Almost always the certificate. Check that it has not expired, that its common name or SAN matches the hostname the phone dials, and that the handset trusts the issuing CA - self-signed certificates have to be installed on each phone. Verify what the server presents with openssl s_client -connect host:5061."
   },
   {
    "q": "Should I use 5060 or 5061?",
    "a": "Use 5061 with TLS for anything crossing the internet, and reserve plain 5060 for a trusted LAN or a trunk restricted to your provider's addresses. TLS costs almost nothing on modern hardware and it is the difference between call metadata and SRTP keys being readable in transit or not."
   }
  ]
 },
 "5353": {
  "intro": "UDP 5353 is multicast DNS. Instead of asking a server, a host shouts a query to the all-mDNS-responders multicast group - the .251 address in the link-local 224.0.0/24 block, or ff02::fb on IPv6 - and whichever device owns that name answers. It resolves .local hostnames and, through DNS-SD, advertises services - which is how your phone finds a Chromecast, an AirPlay speaker, a HomeKit accessory, an AirPrint printer, a Sonos, a Syncthing peer or a Home Assistant instance without you configuring anything. Responders: avahi-daemon on Linux, mDNSResponder on macOS and iOS, the built-in responder in Windows 10 and 11, systemd-resolved when MulticastDNS is enabled, and the firmware of essentially every consumer smart device. Multicast mDNS cannot be forwarded to you from the internet - but a responder can still be exposed on it. The destination is a link-local multicast address in the 224.0.0/24 local network control block, which routers do not forward, so no port-forward will ever carry discovery across the internet. That is not the same as the port being unreachable: a responder bound to a public interface answers unicast queries sent to UDP 5353 from off-link, which is how mDNS leaks hostnames and device inventories and how it gets used as an amplification reflector. This checker opens TCP connections and mDNS is UDP, so it reads closed either way - confirm from outside with nmap -sU -p 5353 , or on the host with ss -lunp | grep ':5353' , and keep the daemon bound to internal interfaces ( allow-interfaces= in /etc/avahi/avahi-daemon.conf ). The real problem that brings people here is a VLAN boundary: the phone is on the guest or IoT network and the Chromecast is on the main one, so the query never reaches it. This is a multicast routing problem, not a port-forward problem, and the fixes are: An mDNS reflector that repeats announcements between interfaces - reflector=yes with allow-interfaces= in /etc/avahi/avahi-daemon.conf , the Avahi plugin on OPNsense and pfSense, or the multicast DNS toggle on a UniFi gateway. Firewall rules permitting UDP 5353 in both directions between the two VLANs - plus the application's own ports, since discovery is only step one. Chromecast then needs 8008, 8009 and 8443; AirPlay needs 7000 and 7100, and on macOS the AirPlay Receiver also holds TCP 5000, which is why so many Flask tutorials fail there. To see what is actually happening: avahi-browse -art lists every service visible from that host, dns-sd -B _services._dns-sd._udp does the same on macOS, and sudo tcpdump -ni eth0 udp port 5353 shows whether the queries are crossing at all. If a daemon will not start, ss -lunp | grep ':5353' usually reveals avahi-daemon and systemd-resolved both trying to own the port.",
  "faq": [
   {
    "q": "What is port 5353 used for?",
    "a": "Multicast DNS, which resolves .local hostnames and advertises services on a local network without a DNS server or any configuration. It is the basis of Apple Bonjour and Linux Avahi, and it is how phones, printers, Chromecasts, AirPlay speakers and smart home devices find each other."
   },
   {
    "q": "Why can't my phone see the Chromecast on another VLAN?",
    "a": "Because mDNS queries go to a link-local multicast address that routers deliberately do not forward, so the discovery packet never leaves the phone's subnet. You need an mDNS reflector or repeater bridging the two interfaces, plus firewall rules allowing UDP 5353 both ways and the device's own control ports, such as 8008, 8009 and 8443 for Chromecast."
   },
   {
    "q": "Should I forward port 5353 through my router?",
    "a": "No. Multicast queries are confined to the local link, so forwarding 5353 will not make discovery work across the internet - but it does create real exposure, because a responder reachable on a public interface will answer unicast queries from anywhere. It leaks your hostnames, device models and service list, and can be used as a reflector in amplification attacks. Use a VPN such as WireGuard or Tailscale for remote access."
   },
   {
    "q": "What is using port 5353 on my machine?",
    "a": "On macOS it is mDNSResponder, which cannot be disabled without breaking AirDrop and printing. On Linux it is usually avahi-daemon, and sometimes systemd-resolved with MulticastDNS enabled - having both running is a common conflict. Run ss -lunp | grep ':5353' to see which process holds it."
   }
  ]
 },
 "5432": {
  "intro": "TCP 5432 is the PostgreSQL server port - the postgres postmaster process, and everything built on it: TimescaleDB, PostGIS-enabled clusters, the official postgres Docker image, managed instances on RDS and friends. PgBouncer usually sits alongside it on 6432, so if your app connects through a pooler, check that port instead. PostgreSQL has two gates in front of every connection , and knowing which one stopped you saves an afternoon: could not connect to server: Connection refused. Is the server running on host \"...\" and accepting TCP/IP connections on port 5432? - gate one. The postmaster is down, or it is not bound to an address you can reach. Default listen_addresses in postgresql.conf is 'localhost' . Check with ss -tlnp | grep 5432 , or ask the server: sudo -u postgres psql -c \"SHOW listen_addresses;\" . FATAL: no pg_hba.conf entry for host \"203.0.113.10\", user \"app\", database \"app\", no encryption - gate two, and it is good news for this page : the port is open, TCP works, and PostgreSQL itself refused you. Add a line to pg_hba.conf such as host app app 192.168.1.0/24 scram-sha-256 and run SELECT pg_reload_conf(); . Note that pg_hba.conf is read top to bottom and the first matching line wins . Change listen_addresses to the server's private address (a full restart is required - a reload is not enough for this parameter) rather than '*' , then allow it narrowly: sudo ufw allow from 192.168.1.0/24 to any port 5432 . PostgreSQL 14 and later default password_encryption to scram-sha-256 ; if you are still writing md5 or, worse, trust lines into pg_hba.conf , fix that first. A trust line means no password at all. CLOSED / filtered from this check is the state you want to see. An OPEN result means your cluster is answering the internet. Every scanner on the network will find it within hours and start guessing role passwords at whatever rate your CPU allows; a superuser login is not just data loss, because COPY ... FROM PROGRAM and large-object functions let a superuser read and write files as the postgres user. The safe pattern for a remote GUI client is a tunnel: ssh -L 5432:127.0.0.1:5432 user@dbhost , then connect to 127.0.0.1:5432 locally.",
  "faq": [
   {
    "q": "How do I allow remote connections to PostgreSQL?",
    "a": "Set listen_addresses in postgresql.conf to the private address you want the server bound to and restart PostgreSQL - that parameter needs a full restart, not a reload. Then add a host line to pg_hba.conf covering the client subnet, database, role and authentication method, and run SELECT pg_reload_conf(). Both files must agree or the connection fails at one gate or the other."
   },
   {
    "q": "What does 'no pg_hba.conf entry for host' mean?",
    "a": "It means the network side is already working: the client reached the server on port 5432 and PostgreSQL rejected the connection because no rule in pg_hba.conf matches that combination of source address, database, user and connection type. Add a matching host line and reload the configuration. Rules are evaluated top to bottom and the first match wins, so order matters."
   },
   {
    "q": "Is it safe to expose port 5432 to the internet?",
    "a": "No. An internet-facing cluster gets continuous automated password guessing, and a compromised superuser role can run COPY FROM PROGRAM to execute commands as the postgres operating-system user. Keep 5432 on a private network, restrict pg_hba.conf to the subnets that genuinely need it, and require scram-sha-256 with TLS on any connection that leaves the host."
   },
   {
    "q": "How do I connect to PostgreSQL through an SSH tunnel?",
    "a": "Run ssh -L 5432:127.0.0.1:5432 user@dbhost, leave that session open, and point your client at 127.0.0.1 port 5432. The tunnel forwards the traffic inside the existing SSH session, so the database only ever needs to listen on loopback and nothing extra is opened on the firewall. If port 5432 is already in use locally, map it to something else such as -L 15432:127.0.0.1:5432."
   }
  ]
 },
 "5900": {
  "intro": "Port 5900/TCP is VNC , which speaks the RFB (Remote Framebuffer) protocol. The listeners you will meet are RealVNC, TigerVNC, TightVNC, UltraVNC, x11vnc on Linux, and macOS Screen Sharing, which is a VNC server built into the OS. The numbering trips people up more than anything else on this port. VNC servers listen on 5900 plus the display number : display :0 is 5900, :1 is 5901, :2 is 5902. A viewer address written host:1 means port 5901, while host::5901 means the literal port. If you started your session with vncserver :1 , testing 5900 here will correctly report closed and nothing is wrong - test 5901. Some servers also open 5800 for a browser-based viewer; that is a separate port. OPEN means the RFB listener accepted a TCP connection from the internet. That is worth acting on rather than celebrating: search engines for exposed devices index open VNC servers by taking a screenshot of whatever is on the desktop, and a large share of them need no password. CLOSED means the connection never got there. Diagnosing a closed result: ss -tlnp | grep 59 on the target shows every VNC listener and its display number in one line. If you see 127.0.0.1:5901 the server is loopback-only - recent TigerVNC packages start Xvnc with -localhost yes deliberately, on the assumption you will tunnel in. On macOS, Screen Sharing must be ticked in System Settings, General, Sharing, and it will not listen at all while the Mac is asleep. sudo ufw status for the host firewall, then the forward on the router - and confirm the external port matches the display you actually run. If you started x11vnc by hand, it exits when the session ends. -forever keeps it alive; without it the second connection attempt of the day finds nothing listening. The right shape for remote access is a tunnel. Leave VNC bound to loopback, forward 22 (or nothing at all, if you run WireGuard), and open ssh -L 5901:localhost:5900 user@host before pointing the viewer at localhost:5901 . You get the same desktop, encrypted, authenticated with a key, and invisible to the scanners.",
  "faq": [
   {
    "q": "What port does VNC use?",
    "a": "TCP 5900 for display :0, and 5900 plus the display number after that - 5901 for :1, 5902 for :2. Viewers accept either the display shorthand (host:1) or an explicit port (host::5901). Some servers additionally publish a web viewer on 5800 plus the display number."
   },
   {
    "q": "Is VNC encrypted?",
    "a": "The base RFB protocol is not. Classic VNC authentication challenges you with DES over a password truncated to eight characters and then sends the session in the clear, so anyone on the path sees the screen and the keystrokes. RealVNC and UltraVNC add proprietary encryption in their own builds, but the portable and safe answer is to carry VNC inside an SSH tunnel or a WireGuard link."
   },
   {
    "q": "Why can I connect to VNC on my LAN but not from outside?",
    "a": "Either the server is bound to loopback (ss -tlnp shows 127.0.0.1:5901, which is the TigerVNC default in many distributions), or the router forward is missing, points at a stale DHCP address, or maps the wrong display's port. A LAN connection never exercises the router rule, so it cannot confirm it."
   },
   {
    "q": "VNC or RDP - which should I use?",
    "a": "On Windows, RDP (3389) is faster and gives each user their own session, so prefer it. VNC mirrors the physical console, which is exactly what you want on a Linux desktop, a Raspberry Pi or a Mac where you need to see what is already on the screen. Neither belongs directly on the internet."
   }
  ]
 },
 "5985": {
  "intro": "Port 5985/TCP is the WinRM HTTP listener - Microsoft's implementation of WS-Management, and the transport underneath PowerShell Remoting ( Enter-PSSession , Invoke-Command ), PowerShell DSC and Ansible's winrm connection plugin. WinRM 1.1 used ports 80 and 443; WinRM 2.0 moved to 5985 and 5986 so it would stop colliding with IIS, and those are the numbers in use today. \"HTTP\" in the name misleads people. With the default Negotiate or Kerberos authentication, the SOAP payload is encrypted at the message layer and AllowUnencrypted is false , so 5985 is not a clear-text channel by default. It becomes one the moment somebody switches to Basic authentication and flips AllowUnencrypted to true to make a script work - which is a good reason to use 5986 whenever the client is not domain-joined. On this page, CLOSED / filtered is the correct outcome. WinRM has no business being reachable from the internet, and if the check comes back OPEN you have a port-forward to delete today: a single valid credential on the far side is a remote shell, and the service is a standing target for password spraying. Most visitors are actually debugging WinRM inside their own network, where the tool to use is Test-NetConnection -ComputerName SERVER -Port 5985 from the client. When that fails: Enable the service on the target with Enable-PSRemoting -Force . It creates the listener and the firewall rule in one step. If that command fails with a network-location error, the NIC is classified Public . That is the single most common cause. Set the profile to Private, or run Enable-PSRemoting -Force -SkipNetworkProfileCheck , which leaves the rule scoped to the local subnet. Confirm the listener exists: winrm enumerate winrm/config/listener should show Transport = HTTP, Port = 5985. Get-NetTCPConnection -LocalPort 5985 confirms the socket. Workgroup (non-domain) clients cannot use Kerberos, so add the target to the client's trusted hosts: Set-Item WSMan:\\localhost\\Client\\TrustedHosts -Value 192.0.2.10 . Without it you get an authentication failure, not a connection failure - the port was fine all along. For Ansible, set ansible_port: 5985 with ansible_winrm_transport: ntlm , or move to 5986 and stop worrying about message-level encryption. If you need PowerShell Remoting across the internet, put a VPN under it. Publishing WinRM through a reverse proxy does not help - the sensitive part is the credential and the shell behind it, not the transport.",
  "faq": [
   {
    "q": "What is the difference between port 5985 and 5986?",
    "a": "5985 is the WinRM HTTP listener and 5986 is the WinRM HTTPS listener. Both carry the same WS-Management traffic; 5986 wraps it in TLS using a certificate on the server, which is what you want for workgroup machines, Basic authentication, or any path you do not fully trust. Domain-joined clients using Kerberos already get message-level encryption on 5985."
   },
   {
    "q": "Is WinRM over port 5985 encrypted?",
    "a": "By default yes, at the message layer: Negotiate/Kerberos encrypts the SOAP body and the service refuses unencrypted traffic because AllowUnencrypted is false. It stops being encrypted if an administrator enables Basic authentication and sets AllowUnencrypted to true, which sends credentials in the clear - use the 5986 HTTPS listener in that situation."
   },
   {
    "q": "How do I open port 5985 on Windows?",
    "a": "Run Enable-PSRemoting -Force in an elevated PowerShell session. It starts the WinRM service, creates the HTTP listener on 5985 and adds the Windows Firewall rule. On a network classified as Public the command refuses; either change the network profile to Private or add -SkipNetworkProfileCheck, which permits access from the local subnet only."
   },
   {
    "q": "Why does Test-NetConnection to port 5985 fail?",
    "a": "Either WinRM was never enabled on the target, the firewall rule exists but only for the Private profile while the adapter is Public, or a network firewall between the two hosts blocks 5985. Check winrm enumerate winrm/config/listener on the server first - if there is no listener, no firewall change will help."
   }
  ]
 },
 "5986": {
  "intro": "Port 5986/TCP is the WinRM HTTPS listener - the same WS-Management service as 5985, wrapped in TLS. PowerShell Remoting reaches it with Enter-PSSession -UseSSL , Ansible with ansible_port: 5986 and ansible_winrm_transport: ntlm or credssp , and Packer's WinRM communicator uses it for image builds. Use 5986 rather than 5985 when the client is not domain-joined, when you must use Basic authentication, or when the traffic crosses anything you do not control - those are the cases where the message-level encryption Kerberos provides on the HTTP listener is either unavailable or not being used. Unlike 5985, the HTTPS listener is not created by Enable-PSRemoting ; it needs a certificate first. Practical setup on the target: Get a server-authentication certificate whose subject or SAN matches the name clients will connect to. For a lab, New-SelfSignedCertificate -DnsName server.example.com -CertStoreLocation Cert:\\LocalMachine\\My . Create the listener: New-Item -Path WSMan:\\localhost\\Listener -Transport HTTPS -Address * -CertificateThumbPrint <thumbprint> -Force . Add the firewall rule yourself - the HTTPS listener does not bring one with it: New-NetFirewallRule -DisplayName \"WinRM HTTPS\" -Direction Inbound -Protocol TCP -LocalPort 5986 -Action Allow . Verify: winrm enumerate winrm/config/listener shows Transport = HTTPS with the thumbprint, and Test-NetConnection -ComputerName server -Port 5986 from the client proves reachability. CLOSED / filtered is the right answer on this page - 5986 should not be reachable from the internet. If it reads OPEN , delete the forward: TLS protects the credential in flight but does nothing about the password-spraying that follows, and a successful login is a shell with that account's privileges. When the connection fails after the TCP handshake, the fault is almost always the certificate rather than the port. A name mismatch or an untrusted self-signed issuer produces an SSL error at session setup; either install the issuer in the client's Trusted Root store, or acknowledge the risk explicitly with New-PSSessionOption -SkipCACheck -SkipCNCheck for PowerShell, or ansible_winrm_server_cert_validation: ignore for Ansible. Note also that certificates expire - a remoting path that worked for a year and then broke overnight is usually one that quietly reached its notAfter date.",
  "faq": [
   {
    "q": "When should I use port 5986 instead of 5985?",
    "a": "Whenever the client cannot use Kerberos - workgroup machines, cross-domain access, cloud build agents - or whenever Basic authentication is in play, because the HTTP listener would then carry credentials in the clear. Domain-joined hosts talking Kerberos on 5985 already get message-level encryption, so the gain there is smaller, but 5986 is still the safer default for anything crossing a network segment you do not own."
   },
   {
    "q": "How do I enable WinRM over HTTPS on 5986?",
    "a": "Install or create a certificate with a Server Authentication EKU whose subject or SAN matches the hostname clients will use, then run New-Item -Path WSMan:\\localhost\\Listener -Transport HTTPS -Address * -CertificateThumbPrint . Add your own inbound firewall rule for TCP 5986 afterwards - unlike Enable-PSRemoting for the HTTP listener, this step does not create one for you."
   },
   {
    "q": "Why does WinRM HTTPS fail with a certificate error?",
    "a": "The connection reached the port, so the port is fine - the TLS handshake is being rejected because the certificate name does not match the name you connected with, or because a self-signed certificate is not trusted by the client. Import the issuing certificate into the client's Trusted Root Certification Authorities store, or bypass the checks deliberately with -SkipCACheck -SkipCNCheck in New-PSSessionOption for testing only."
   },
   {
    "q": "Is it safe to expose port 5986 to the internet?",
    "a": "No. The TLS wrapper protects the traffic but the service behind it still executes commands as whatever account authenticates, so an exposed listener is a permanent brute-force target. Reach it over a VPN, or from a jump host on the management network, and keep the port unforwarded at the router."
   }
  ]
 },
 "6379": {
  "intro": "TCP 6379 is Redis - and equally Valkey, KeyDB and Redis Stack, which all keep the default. Related ports you may meet: 26379 for Sentinel, and in cluster mode a second bus port at your port plus 10000 ( 16379 ), which also has to be reachable between nodes. People arrive here from one of two directions, and they need opposite advice. \"My app on another host cannot reach Redis.\" Read the exact error, because Redis gives you a very specific one: Connection refused - nothing is listening on an address you can reach. The shipped redis.conf has bind 127.0.0.1 -::1 . Confirm with ss -tlnp | grep 6379 . DENIED Redis is running in protected mode because protected mode is enabled and no password is set... - the port is reachable. Protected mode, on by default since Redis 3.2, refuses commands from non-loopback clients when no password is configured. The right fix is to set requirepass (or a proper ACL user), not to turn protected mode off. NOAUTH Authentication required - reachable and authenticated properly. Send AUTH , or use a full URL: redis-cli -u redis://default:password@10.0.0.5:6379 PING . \"Is my Redis exposed?\" That is what this check answers. Run it and hope for CLOSED / filtered . If it reads OPEN , treat it as a live incident: pull the port down first and investigate afterwards, then check INFO keyspace and your key count for signs someone got there before you. Why this port is a \"never\" and not a \"caution\": Redis ships with no password , and its command set includes the ability to reconfigure itself. An attacker who can send commands runs CONFIG SET dir /root/.ssh , CONFIG SET dbfilename authorized_keys , stores a key as a value and calls SAVE - and now has SSH access to the box. Module loading and SLAVEOF / REPLICAOF give other paths to the same place. This is not theoretical; it is one of the most reliably exploited misconfigurations on the internet. Configure it properly instead: keep bind on 127.0.0.1 or a private/VPN address, set requirepass to something long, use ACL users per application on Redis 6 and later, rename or disable CONFIG and FLUSHALL for app users, and enable tls-port if the traffic leaves the host at all. In Docker, publish it as -p 127.0.0.1:6379:6379 - a plain -p 6379:6379 writes NAT rules that step around ufw and puts the port on the public interface.",
  "faq": [
   {
    "q": "Does Redis require a password by default?",
    "a": "No. A stock Redis install has no requirepass and no ACL user beyond the default one, which is why it also ships bound to 127.0.0.1 with protected mode on. Those two defaults are the only thing standing between an unconfigured instance and full remote access, so both must stay in place until you have set real authentication."
   },
   {
    "q": "What does 'DENIED Redis is running in protected mode' mean?",
    "a": "It means you reached the port from a non-loopback address while Redis has no password configured. Protected mode, default since Redis 3.2, blocks those commands rather than serving an open database. Set requirepass or create an ACL user and authenticate - disabling protected mode to make the error go away leaves an unauthenticated database listening."
   },
   {
    "q": "Is it safe to expose port 6379 to the internet?",
    "a": "No, and it is one of the worst ports to get wrong. An unauthenticated Redis can be told to write its dump file anywhere, which attackers use to drop an SSH authorized_keys file or a cron job and take over the host. Bind Redis to loopback or a VPN address and let only your application servers reach it."
   },
   {
    "q": "How do I connect to Redis from another server safely?",
    "a": "Put both machines on a private network or a WireGuard tunnel and bind Redis to that interface, then set requirepass or a per-application ACL user and connect with redis-cli -u redis://user:password@address:6379. Enable tls-port if the traffic crosses anything you do not control. An SSH tunnel with ssh -L 6379:127.0.0.1:6379 works well for one-off admin access."
   }
  ]
 },
 "6443": {
  "intro": "6443 is the Kubernetes API server : the single front door to a cluster. Every kubectl command, every controller, every kubelet joining a node and every CI deployment goes through it over HTTPS. kubeadm, k3s and RKE2 all default to 6443 (k3s additionally offers 6444 for its local loopback path). Two audiences arrive here. One has kubectl failing with connection refused or i/o timeout . The other is deciding whether to publish a home cluster's API so they can deploy from a laptop elsewhere. For a broken kubectl: Check the endpoint your kubeconfig actually targets: kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}' . A freshly installed k3s writes https://127.0.0.1:6443 into /etc/rancher/k3s/k3s.yaml , so copying that file to another machine unchanged points it at itself. On the control-plane node, ss -tlnp | grep 6443 and crictl ps or systemctl status k3s . x509 certificate errors are the other classic: the API certificate only covers the names and addresses it was issued for, so reaching it by a new hostname or public IP needs that name added — --tls-san for k3s, certSANs in the kubeadm config — followed by regenerating the certificate. Reading the result. OPEN means the internet can complete a TCP handshake to your API server. That is not automatically a breach — Kubernetes authenticates every request, and managed providers publish their control planes on this port by default. It does mean your cluster is now on scanners' lists, and that any leaked kubeconfig is directly usable, which matters because client certificates issued by kubeadm cannot be revoked without rotating the cluster CA. If you must expose it: restrict the source addresses at the firewall, prefer short-lived OIDC tokens over long-lived certificates, confirm --anonymous-auth=false or that the anonymous user has no bindings, and check that 10250 (the kubelet, which can exec into pods) is not exposed alongside it. A WireGuard tunnel to the control plane is simpler and better.",
  "faq": [
   {
    "q": "What port does the Kubernetes API server use?",
    "a": "TCP 6443 over HTTPS by default, for kubeadm, k3s and RKE2 alike. Older or customised clusters sometimes use 443 or 8443 in front of a load balancer, and k3s also binds 6444 on loopback for its own internal client."
   },
   {
    "q": "Why does kubectl say connection refused on port 6443?",
    "a": "Either the API server is not running on the host your kubeconfig points at, or the address is wrong. Check the server field with kubectl config view --minify — k3s writes https://127.0.0.1:6443 into k3s.yaml, which fails as soon as you copy it to another machine — then confirm the listener on the control-plane node with ss -tlnp | grep 6443."
   },
   {
    "q": "Is it safe to expose the Kubernetes API to the internet?",
    "a": "It is safer than exposing the Docker API, because every request is authenticated and anonymous access is limited to health endpoints in a default configuration. The real risks are credential leakage — kubeadm client certificates cannot be revoked short of rotating the CA — and any exposed kubelet on 10250. Restrict by source address or put it behind a VPN."
   },
   {
    "q": "I get an x509 certificate error when connecting to 6443. How do I fix it?",
    "a": "The API server certificate lists specific names and IPs, so connecting by a hostname or public address it was not issued for fails validation. Add the name as a SAN — --tls-san for k3s, certSANs in the kubeadm ClusterConfiguration — and regenerate the API server certificate, then reconnect."
   }
  ]
 },
 "6881": {
  "intro": "6881 is the classic BitTorrent peer port . The original client took 6881 and walked up to 6889 if it was busy, so that whole range became shorthand for torrent traffic — and that is precisely why it is a bad default today. ISPs, campus networks and traffic shapers still key on 6881-6889, and DHT (the trackerless peer lookup) also historically ran on UDP 6881. Modern clients no longer use it. qBittorrent generates a random high port on first run and stores it in Options → Connection → Port used for incoming connections ; Transmission defaults to 51413; Deluge picks a random port in a configurable range. So if you are testing 6881 because a guide from 2009 told you to, check what your client is actually bound to first — ss -tlnp | grep -i torrent on Linux, or read the number straight out of the connection settings. Reading the result. OPEN means a TCP handshake from the internet reached a listener on 6881 on your public address — the desired state for a peer port. CLOSED means no forward, a forward pointing at the wrong host, or nothing bound to that particular number, which is the most likely explanation given clients randomise. This check is TCP only; the UDP side used by DHT and µTP cannot be verified from outside, so forward both protocols and judge UDP by whether your DHT node count climbs. If it reads closed and you do want 6881: set the port explicitly in the client rather than leaving it random, forward TCP and UDP 6881 on the router to the machine's reserved LAN address, then allow it locally — sudo ufw allow 6881 , or on Windows netsh advfirewall firewall add rule name=\"BitTorrent\" dir=in action=allow protocol=TCP localport=6881 . Test again. If it is still closed, look for double NAT (a router behind an ISP gateway, both doing NAT) or a WAN address in 100.64.0.0/10 , which means carrier-grade NAT and no inbound connections at all. Torrents that download but never seed, and swarms where your peer count sticks at a handful, are the symptom that this port is unreachable.",
  "faq": [
   {
    "q": "Do I still need to open port 6881 for torrents?",
    "a": "Usually not that specific number. Current clients randomise the incoming port — qBittorrent generates one at install, Transmission defaults to 51413 — so you should forward whatever port your client reports rather than 6881. Downloads work without any forward; the forward is what lets peers connect in so you can seed."
   },
   {
    "q": "What is the BitTorrent port range 6881 to 6889?",
    "a": "The original BitTorrent client tried 6881 first and stepped up through 6889 if earlier ports were in use, which let several torrent processes share one machine. That range is now a fingerprint that traffic shapers look for, so most clients deliberately avoid it."
   },
   {
    "q": "Is port 6881 TCP or UDP?",
    "a": "Both are used. Peer wire connections are TCP, while DHT peer discovery and µTP transport run over UDP on the same port number. Forward both if you set a fixed port; an external checker can only verify the TCP half, because UDP gives no handshake to observe."
   },
   {
    "q": "Is it dangerous to forward a BitTorrent port?",
    "a": "The port itself exposes only your torrent client's peer protocol, not an admin interface, so the risk is far lower than forwarding something like a database or a web console. Keep the client patched, and never forward its web UI (9091 for Transmission, 8080 for qBittorrent) alongside it."
   }
  ]
 },
 "7777": {
  "intro": "7777 is the default port for several unrelated game servers, and the first thing to settle is which protocol yours uses , because that decides whether this TCP check can tell you anything at all. Terraria and tModLoader listen on TCP 7777 ( port=7777 in serverconfig.txt , or -port on the command line). This checker tests them properly: OPEN means players can reach you. ARK: Survival Evolved and Survival Ascended use UDP 7777 for game traffic, with the Steam query on UDP 27015. Survival Evolved also wants UDP 7778 open, because it uses the game port and the one above it. Satisfactory dedicated servers use UDP 7777 for gameplay and TCP 7777 for the HTTPS management API the in-game server manager talks to. Older builds used 15000 and 15777 as well; current ones do not. Unreal Engine dedicated servers default to UDP 7777, which is where most of the rest of this list comes from. For a UDP game, expect this page to read closed even when everything works , and do not chase it. Verify from the server: ss -lunp | grep 7777 for a UDP bind, ss -tlnp | grep 7777 for Terraria's TCP one, then sudo tcpdump -ni any port 7777 while someone off your network tries to join. Arriving packets mean the forward is fine. When Terraria specifically reads closed, work through the usual three: the server bound to loopback rather than 0.0.0.0 , a forward aimed at a LAN address the host no longer holds, or the host firewall - sudo ufw allow 7777/tcp , or on Windows netsh advfirewall firewall add rule name=\"Terraria\" dir=in action=allow protocol=TCP localport=7777 . Terraria's client also lets you join ip:port directly, so test with an explicit port rather than trusting the default. One thing worth knowing about this number: 7777 is scanned constantly precisely because so many game servers sit on it. That is harmless for a game with its own authentication, but it is a poor place to park a web admin panel or a test service you forgot to close.",
  "faq": [
   {
    "q": "Is port 7777 TCP or UDP?",
    "a": "It depends on the game. Terraria and tModLoader use TCP 7777, while ARK, Satisfactory and most Unreal Engine dedicated servers use UDP 7777 for gameplay. Satisfactory uses both: UDP for the game and TCP for its management API. Forward the protocol your game actually uses, because a TCP rule does nothing for a UDP server."
   },
   {
    "q": "What ports does an ARK dedicated server need?",
    "a": "UDP 7777 for game traffic and UDP 27015 for the Steam query that puts the server in the browser. ARK: Survival Evolved also uses UDP 7778, one above the game port, so forward 7777-7778 UDP for it. RCON, if you enable it, is a separate TCP port you should keep off the internet."
   },
   {
    "q": "Why can nobody connect to my Terraria server?",
    "a": "Check that the server is listening on all interfaces rather than 127.0.0.1, that the router forward sends TCP 7777 to the machine's current LAN address, and that the host firewall allows inbound 7777/tcp. If your router's WAN address is inside 100.64.0.0/10 you are behind carrier-grade NAT and no forward will work - host the world elsewhere or use a tunnel."
   },
   {
    "q": "Can I change a game server off port 7777?",
    "a": "Yes, every game listed here takes a port argument, and moving to an unusual high port cuts the constant background scanning this number attracts. Change the port in the server config, forward the new one, and tell players to type address:port. Remember to change the query port too where the game uses a separate one."
   }
  ]
 },
 "7878": {
  "intro": "7878 is the default HTTP port for Radarr , the movie manager in the *arr family. The family deliberately avoids collisions: Sonarr on 8989, Lidarr on 8686, Readarr on 8787, Prowlarr on 9696, Jackett on 9117 — so a full stack runs on one host without any port juggling. The situation that brings people here is usually one of two. Either Radarr's UI will not open at all, or it opens on the LAN and you want it from elsewhere. UI will not open. Start on the host: ss -tlnp | grep ':7878 ' . A listener on 127.0.0.1:7878 instead of 0.0.0.0:7878 is the single most common cause, and it comes from <BindAddress>localhost</BindAddress> in config.xml ( /var/lib/radarr/config.xml on the Debian package, /config/config.xml in the usual container images). In Docker, the container needs -p 7878:7878 ; without it the port exists only inside the container's network namespace and nothing on your LAN can see it. If you set a <UrlBase> for a reverse proxy, the bare root path 404s and you must browse to /radarr . Reading the result. OPEN means a stranger on the internet can complete a TCP handshake to your Radarr and load its login page. CLOSED is the correct answer for a normal home connection: Radarr makes every connection outbound — to indexers, to your download client, to metadata providers — so it needs no inbound port-forward whatsoever to work. If you do want it remotely, in descending order of sanity: WireGuard into the LAN and use the private address; a reverse proxy on 443 with TLS and its own auth layer; or, as a distant third, a forward of 7878 with a strong password set. Whatever you pick, do not leave Authentication Required on Disabled for Local Addresses once a reverse proxy is in front — the proxy connects from a local address, so every request from the internet inherits that exemption and the login screen never appears. Also remember the API key is passed in query strings, so it leaks into proxy logs and browser history far more easily than a password does; rotate it in Settings → General if you have ever pasted a URL containing it.",
  "faq": [
   {
    "q": "What port does Radarr use?",
    "a": "TCP 7878 by default, serving both the web interface and the /api/v3 endpoint from the same listener. The value lives in config.xml and can be overridden with the RADARR__SERVER__PORT environment variable in current container images."
   },
   {
    "q": "Why can I not reach Radarr from another machine?",
    "a": "Check the bind address first — ss -tlnp | grep ':7878 ' showing 127.0.0.1 means Radarr is only listening on loopback, which no firewall change or port-forward can fix. In Docker the equivalent mistake is running the container without -p 7878:7878. After that, rule out the host firewall with sudo ufw status."
   },
   {
    "q": "Do I need to port forward 7878 for Radarr to work?",
    "a": "No. Radarr only makes outbound connections, so it works with every inbound port closed. Forwarding 7878 is purely about you reaching the UI from outside, and a VPN or an authenticated reverse proxy does that without publishing an admin panel."
   },
   {
    "q": "What is the difference between port 7878 and 8989?",
    "a": "They are the same kind of thing for different apps: 7878 is Radarr (movies) and 8989 is Sonarr (TV). The two projects share a codebase and settings layout, which is why their configuration files, API shape and failure modes look nearly identical."
   }
  ]
 },
 "8000": {
  "intro": "Port 8000 has no formal assignment — it is convention, and the convention is development HTTP . Django's manage.py runserver , python3 -m http.server , uvicorn and FastAPI, and PHP's php -S all default here. The single most common reason a port test on 8000 fails: these servers bind to loopback by default . runserver with no arguments listens on 127.0.0.1:8000 , and no port-forward on earth can reach that. You need python manage.py runserver 0.0.0.0:8000 , and Django will then reject the request with DisallowedHost until the hostname or IP is in ALLOWED_HOSTS — which looks exactly like a network problem from the browser but is not one. Uvicorn wants --host 0.0.0.0 for the same reason. Reading the result. OPEN means a TCP connection from the public internet reached something on 8000. For this port that deserves a second look rather than a celebration: if you left a python3 -m http.server running, an OPEN result means the whole directory it was started in — source, .env files, backups — is being served with directory listings to anyone who asks. CLOSED is the normal and usually correct state for a development port. If you genuinely need it open: ss -tlnp | grep ':8000 ' and read the address column: 127.0.0.1:8000 is the answer more often than not. Port already in use? ss -tlnp | grep ':8000 ' names the process; on macOS lsof -nP -iTCP:8000 -sTCP:LISTEN . Host firewall: sudo ufw allow 8000/tcp , then sudo ufw status numbered . For anything beyond a demo, put the app behind a real server: gunicorn or uvicorn on 127.0.0.1:8000 , nginx proxying it on 443 with a certificate. That way the port you forward is 443 and 8000 never leaves the host. If it is only for a colleague to look at for ten minutes, an SSH tunnel beats a firewall hole: ssh -L 8000:127.0.0.1:8000 user@host .",
  "faq": [
   {
    "q": "Why can't I access Django runserver from another computer?",
    "a": "By default runserver binds 127.0.0.1:8000, which only the machine itself can reach. Start it as python manage.py runserver 0.0.0.0:8000, then add the hostname or IP you are browsing to into ALLOWED_HOSTS in settings.py, or Django returns a DisallowedHost error that looks like a server fault. Also open port 8000 in the host firewall."
   },
   {
    "q": "What is running on port 8000?",
    "a": "There is no registered service, so it depends on the machine. Run ss -tlnp | grep ':8000 ' on Linux or lsof -nP -iTCP:8000 -sTCP:LISTEN on macOS and it names the process. The usual answers are a Django, FastAPI, uvicorn or python -m http.server development server."
   },
   {
    "q": "Is it safe to expose port 8000 to the internet?",
    "a": "Generally no. Development servers on 8000 have no TLS, no rate limiting and often no authentication, and python3 -m http.server will serve every file in the directory it was started in, including .env files and backups. Run the app behind nginx on 443, or reach it through an SSH tunnel or VPN."
   },
   {
    "q": "How do I fix 'Address already in use' on port 8000?",
    "a": "Something is already listening. Find it with ss -tlnp | grep ':8000 ' on Linux or lsof -nP -iTCP:8000 -sTCP:LISTEN on macOS, then stop that process or start yours on a different port. A crashed server that left a child process behind is the usual culprit."
   }
  ]
 },
 "8006": {
  "intro": "8006 is the Proxmox VE web interface, served by the pveproxy daemon. It is HTTPS-only and uses a self-signed certificate on a fresh install, so http://host:8006/ never works and https://host:8006/ always warns — both are expected, and both get mistaken for a closed port. Companion ports on the same host help you tell what you are looking at: 8007 is Proxmox Backup Server, 3128 is the SPICE console proxy, 5900 and up back the noVNC console sessions, and cluster corosync traffic runs on UDP 5405 between nodes on the local network. Only 8006 gets you the UI. Reading the result. CLOSED is what you want. OPEN means the login page for your hypervisor is reachable from the internet, and that login leads to a shell on the host and a console on every guest. Proxmox has no built-in fail2ban and no rate limiting on the API by default, so an exposed 8006 collects credential-stuffing attempts continuously; check them with journalctl -u pvedaemon | grep -i 'authentication failure' . If this reads OPEN and you meant it to, at minimum enable two-factor authentication on every account, stop using root@pam for daily work, and restrict the source addresses in the datacenter firewall. If it reads closed and you are troubleshooting local access instead: ss -tlnp | grep ':8006 ' on the node — you should see pveproxy . If nothing is there, systemctl status pveproxy pvedaemon and check whether the root filesystem is full, which is the classic cause of pveproxy failing to start. Proxmox has its own firewall layer on top of the host: look at /etc/pve/firewall/cluster.fw and the node's host.fw , and confirm the management ruleset permits your subnet. A wrong or missing /etc/hosts entry for the node name breaks the cluster filesystem and takes the UI with it — pvecm status tells you quickly. Replace the self-signed certificate with an ACME-issued one from the UI (Datacenter → ACME) using a DNS-01 challenge, so you can stop clicking through warnings without opening port 80. The right remote-access pattern is a WireGuard tunnel into the management network, then browse to 8006 privately. Do not forward it, and do not \"hide\" it on a high port — full-internet scanners sweep every port and 8006 has a distinctive TLS fingerprint.",
  "faq": [
   {
    "q": "What is port 8006 used for?",
    "a": "It is the Proxmox VE web management interface, served over HTTPS by the pveproxy daemon. Related ports on the same host are 8007 for Proxmox Backup Server, 3128 for the SPICE console proxy, and UDP 5405 for corosync cluster traffic between nodes."
   },
   {
    "q": "Should I expose Proxmox port 8006 to the internet?",
    "a": "No. A successful login gives shell access to the hypervisor and console access to every virtual machine on it, and the interface has no rate limiting or lockout by default. Use a WireGuard or OpenVPN tunnel into the management network and reach 8006 privately."
   },
   {
    "q": "Why won't the Proxmox web interface load on port 8006?",
    "a": "Check that you used https:// — pveproxy does not answer plain HTTP. Then confirm the service is running with systemctl status pveproxy, check whether the root filesystem filled up (a common cause of pveproxy failing), and review the Proxmox firewall rules in /etc/pve/firewall/ as well as the node's own network configuration."
   },
   {
    "q": "Can I change the Proxmox web interface port from 8006?",
    "a": "It is not a supported configuration option, and changing it does not improve security since scanners sweep all ports anyway. If you want it reachable on 443, put a reverse proxy in front that forwards to 8006 over HTTPS — and keep the whole thing behind a VPN regardless."
   }
  ]
 },
 "8080": {
  "intro": "8080 is the unprivileged twin of port 80. It has no protocol of its own — it is plain HTTP — and it became the convention because any user can bind a port above 1023 without root. The usual occupants are Apache Tomcat (its default connector), Jenkins , Jetty, the Traefik dashboard, and the enormous population of Docker containers started with -p 8080:80 . Two traps account for most of the visits to this page. Your router may already own 8080. Many consumer gateways and cable modems expose their own admin UI or a remote-management service there. If this check reads OPEN and you get a login page you do not recognise, you have found the router, not your app — and remote management on a WAN interface is worth switching off immediately. Docker publishes around ufw. On Linux, docker run -p 8080:80 writes DNAT rules that are evaluated before ufw's rules, so ufw deny 8080 does not stop it. If 8080 reads OPEN and you did not forward anything, run docker ps --format '{{.Names}}\\t{{.Ports}}' . Publishing to 127.0.0.1:8080:80 instead binds it to loopback only. Reading the result. OPEN means a TCP handshake completed from the internet to 8080 on your public address. CLOSED means the SYN got no answer or was refused — which for 8080 is most often the host firewall, since the app itself is normally already bound to all interfaces. If it reads closed: start with ss -tlnp | grep ':8080 ' . Tomcat writes its bind into conf/server.xml and will start happily even when the connector fails; check logs/catalina.out . Jenkins on Debian reads /etc/default/jenkins ( HTTP_PORT , and --httpListenAddress , which defaults to loopback on some packages). Then open the firewall with sudo ufw allow 8080/tcp and confirm the router forward points at the host's current LAN address. If the app is only meant for you, stop here and reach it over WireGuard rather than finishing the forward — a Jenkins controller on the open internet is a build server that runs other people's code.",
  "faq": [
   {
    "q": "What is the difference between port 80 and port 8080?",
    "a": "None at the protocol level — both carry plain HTTP. Port 80 is the default, so browsers use it when no port is given, but it is privileged and needs root or CAP_NET_BIND_SERVICE to bind on Unix. 8080 is unprivileged, which is why application servers such as Tomcat and Jenkins default to it."
   },
   {
    "q": "Why is port 8080 open when I never forwarded it?",
    "a": "Two usual causes. Your router or modem may publish its own management interface on 8080 over the WAN, which you should disable. Or a Docker container was started with -p 8080:80, which inserts DNAT rules that bypass ufw entirely; check docker ps and republish as 127.0.0.1:8080:80 if it should be local only."
   },
   {
    "q": "Is it safe to expose port 8080 to the internet?",
    "a": "Only if you would be comfortable exposing whatever is behind it with no TLS. 8080 is cleartext by default, so credentials sent to a Tomcat manager or Jenkins login on that port cross the internet in the clear. Put a reverse proxy on 443 in front of it, or keep it on the LAN and use a VPN."
   },
   {
    "q": "Jenkins is running but port 8080 is closed from outside. What now?",
    "a": "Check the listen address first: some packages start Jenkins bound to 127.0.0.1, which no port-forward can rescue. On Debian and Ubuntu that is set in /etc/default/jenkins; on systemd overrides it is the --httpListenAddress argument. After that, open the host firewall and confirm the router forward points at the machine's current DHCP lease."
   }
  ]
 },
 "8096": {
  "intro": "TCP 8096 is the default HTTP port for Jellyfin and for Emby , the server Jellyfin was forked from - the web UI, the API and every client app talk to it here. The matching HTTPS listener is 8920, and client auto-discovery on the LAN uses UDP 7359, which never needs forwarding. The checker is TCP and so is Jellyfin, so the result is meaningful. OPEN means the port really is reachable from the internet - and if you got there by forwarding 8096 directly, that is the thing to change rather than celebrate. CLOSED / filtered when you expected remote access to work usually comes down to: The wrong bind. ss -tlnp | grep 8096 should show 0.0.0.0:8096 . In Docker you need -p 8096:8096 or host networking; a container with no published port is invisible even on the LAN. The host firewall. sudo ufw allow 8096/tcp , or the equivalent rule on Windows. The LAN networks setting. Jellyfin's Networking page has a local-network list; get it wrong and remote clients are treated as untrusted in ways that look like connectivity faults. The right shape for remote access is a reverse proxy : nginx, Caddy, Traefik or your router's own proxy listening on 443 with a real certificate and forwarding to 127.0.0.1:8096 internally. Two settings make that work properly - add the proxy's address to Known proxies so Jellyfin trusts X-Forwarded-For and logs the real client IP, and leave Base URL empty unless you are actually serving Jellyfin under a subpath, because a stray value there breaks the web client with a blank page. Why bother, when 8096 works? Because it is HTTP. Forwarded straight out, every password and every access token crosses the internet unencrypted, and Jellyfin's own documentation recommends a proxy for exactly this reason. Jellyfin has also had real remote-facing bugs - CVE-2021-21402 allowed arbitrary file reads before 10.7.1 - so keep it updated, and if only you and your household use it, a WireGuard tunnel is simpler and safer than any of this.",
  "faq": [
   {
    "q": "What port does Jellyfin use?",
    "a": "TCP 8096 for HTTP and TCP 8920 for its built-in HTTPS listener, both changeable in Dashboard, Networking. Client auto-discovery on the local network uses UDP 7359, and DLNA if enabled uses UDP 1900. Emby uses the same 8096 and 8920 defaults, which is why the two collide if you run both on one host."
   },
   {
    "q": "Should I port forward 8096 for Jellyfin?",
    "a": "Not directly. Port 8096 is unencrypted HTTP, so forwarding it exposes logins and session tokens in cleartext to anyone on the path. Run a reverse proxy on 443 with a real TLS certificate and point it at 127.0.0.1:8096, or keep Jellyfin on the LAN and reach it through a VPN."
   },
   {
    "q": "Why can I not reach Jellyfin from outside my network?",
    "a": "Check the bind first with ss -tlnp | grep 8096 - a container without a published port or a service bound to loopback never leaves the machine. Then check the host firewall, the router forward or proxy rule, and whether you are behind carrier-grade NAT. If you use a reverse proxy, a missing Known proxies entry can also produce failures that look like a network problem."
   },
   {
    "q": "What is the difference between port 8096 and 8920 in Jellyfin?",
    "a": "8096 is the plain HTTP interface and 8920 is the same interface over TLS using a certificate you supply in the Networking settings. Most people leave both on the LAN and terminate TLS at a reverse proxy on 443 instead, because that gets automatic certificate renewal and a normal hostname without managing a PKCS#12 file inside Jellyfin."
   }
  ]
 },
 "8123": {
  "intro": "TCP 8123 is the Home Assistant web interface - the dashboard, the app and the REST API, on every install type from Home Assistant OS to a bare hass process. It is worth knowing that ClickHouse's HTTP interface also defaults to 8123 ; if you find this port open on a server with no smart home on it, that is very likely what you have found. The checker is TCP and Home Assistant is TCP, so the result is real. OPEN means anyone on the internet can load your login page - which for this particular service deserves a hard look, because that one password sits in front of your door locks, cameras and alarm. CLOSED / filtered while the UI works on the LAN is the normal, safe state. When the UI will not load at all, check in this order: ss -tlnp | grep 8123 on the host - Home Assistant binds all interfaces by default, so a loopback-only socket means something set server_host in the http: block. In Docker you need --network host or -p 8123:8123 ; without it, device discovery and the UI both fail. sudo ufw allow from 192.168.1.0/24 to any port 8123 - allow the LAN, not the world. Behind a reverse proxy, the error everyone hits is A request from a reverse proxy was received from 192.168.1.5, but your HTTP integration is not set-up for reverse proxies . Fix it in configuration.yaml : http: then use_x_forwarded_for: true and trusted_proxies: listing the proxy's address, then restart. Without it every login appears to come from the proxy, so ip_ban_enabled: true and login_attempts_threshold end up banning the proxy and locking out the whole household at once. For access from outside, pick one of three: Nabu Casa Cloud, which needs no open port at all and funds the project; a VPN such as WireGuard or Tailscale, which is the option most self-hosters land on; or a reverse proxy on 443 with a real certificate, brute-force bans on, and multi-factor authentication enabled for every account. Forwarding 8123 straight out is the one option not on the list.",
  "faq": [
   {
    "q": "Should I port forward 8123 for Home Assistant?",
    "a": "No. Port 8123 is unencrypted HTTP, and the account behind it can unlock doors, disarm alarms and view cameras, so a forwarded port means credentials in cleartext and continuous automated login attempts. Use Nabu Casa Cloud, a WireGuard or Tailscale tunnel, or a reverse proxy on 443 with TLS and multi-factor authentication."
   },
   {
    "q": "How do I fix 'your HTTP integration is not set-up for reverse proxies'?",
    "a": "Add use_x_forwarded_for: true and a trusted_proxies list containing the proxy's IP address under the http: section of configuration.yaml, then restart Home Assistant. Until you do, Home Assistant refuses to trust the forwarded headers and treats every request as coming from the proxy itself, which breaks per-user IP bans and login logging."
   },
   {
    "q": "Why can I not reach Home Assistant on port 8123?",
    "a": "Confirm the service is listening with ss -tlnp | grep 8123 and that no server_host entry in the http: block has pinned it to loopback. In Docker, the container needs host networking or an explicit -p 8123:8123. After that, check the host firewall and, if you are trying from outside, whether anything is forwarding to it at all."
   },
   {
    "q": "What else uses port 8123 besides Home Assistant?",
    "a": "ClickHouse serves its HTTP interface on 8123 by default, which is a genuine collision if you run both on one machine or scan a server and assume any 8123 is a smart home. An exposed ClickHouse HTTP port is far more dangerous than an exposed dashboard, since it can accept queries, so identify which one you are looking at before deciding what to do about it."
   }
  ]
 },
 "8443": {
  "intro": "8443 is HTTPS on an unprivileged port — the same TLS-then-HTTP that 443 carries, moved somewhere a non-root process can bind. In the wild it means one of a short list of things: a Tomcat TLS connector, the UniFi Network Application web UI, Plesk , a firewall GUI that was moved off 443 so the box could publish real websites there, or a Kubernetes ingress controller's TLS listener. The UniFi case is worth spelling out because it produces so many confused port tests: the controller uses 8443 for the HTTPS management UI, 8080 for device inform (that is the port APs and switches actually adopt over), 8880 and 8843 for guest-portal HTTP and HTTPS, and 3478/udp for STUN. Forwarding 8443 alone gets you the web UI and does nothing for a remote site's devices. Reading the result. OPEN means the TCP handshake completed — nothing more. Almost everything on 8443 ships with a self-signed certificate , so the browser warning you get after an OPEN result is expected behaviour, not a broken port. Conversely, a CLOSED result while the UI works on the LAN nearly always means the listener is bound to a single interface or the forward is missing, not that TLS is misconfigured. If it reads closed: ss -tlnp | grep ':8443 ' — and note which address it shows. Tomcat's TLS connector lives in conf/server.xml and will silently not start if the keystore path or password is wrong; logs/catalina.out says so plainly. On the UniFi application, check system.properties for an overridden unifi.https.port before blaming the network. Open the host firewall: sudo ufw allow 8443/tcp , or on Windows netsh advfirewall firewall add rule name=\"HTTPS-alt\" dir=in action=allow protocol=TCP localport=8443 . Verify from outside once it opens: openssl s_client -connect your-domain:8443 -servername your-domain shows whether a real TLS server is on the other end. Before you finish the forward, ask whether the thing on 8443 should be internet-facing at all. An admin UI with a self-signed certificate is a credential-stuffing target and gives you no way to notice a man-in-the-middle, because you have already taught yourself to click through the warning.",
  "faq": [
   {
    "q": "What service uses port 8443?",
    "a": "There is no single assignment. In practice it is HTTPS on an unprivileged port: Apache Tomcat's TLS connector, the UniFi Network Application's web UI, Plesk, and firewall or appliance GUIs moved off 443. Check locally with ss -tlnp | grep ':8443 ' rather than assuming."
   },
   {
    "q": "Why does port 8443 give a certificate warning?",
    "a": "Most software that listens on 8443 is an admin interface that generates a self-signed certificate at install time, and no public CA has signed it. The warning is expected. If the host has a real domain name, issue a proper certificate and install it, or put a reverse proxy with a trusted certificate in front."
   },
   {
    "q": "Do I need to forward 8443 for a UniFi controller?",
    "a": "Only to reach the web UI from outside, and doing so exposes an admin login to the internet. Devices at a remote site adopt over port 8080 (inform), not 8443, and guest portals use 8880 and 8843. The safer pattern is a VPN to the controller's network rather than any forward at all."
   },
   {
    "q": "Is 8443 more secure than 443?",
    "a": "No. The port number changes nothing about the encryption — both run TLS, and both are scanned constantly by internet-wide scanners that do not care about the number. Using 8443 only avoids needing root to bind and frees 443 for something else."
   }
  ]
 },
 "8883": {
  "intro": "8883 is MQTT over TLS — the same protocol as 1883 wrapped in a TLS session. It is the only sensible way to let a sensor at another site, a vehicle tracker or a remote Raspberry Pi reach your broker, because on 1883 the username and password are visible to every hop in between. A working Mosquitto TLS listener is four lines in /etc/mosquitto/conf.d/tls.conf : listener 8883 certfile /etc/mosquitto/certs/fullchain.pem and keyfile /etc/mosquitto/certs/privkey.pem — the key must be readable by the mosquitto user, which is the most common reason the broker starts but the listener never appears. cafile /etc/ssl/certs/ca-certificates.crt if you also want to verify client certificates with require_certificate true . password_file and allow_anonymous false , exactly as on 1883. TLS authenticates the server , not the client. Reading the result. OPEN means a TCP handshake completed to 8883 from the internet — this checker does not attempt the TLS negotiation, so an OPEN result proves reachability, not that your certificate is valid. Confirm that separately with openssl s_client -connect broker.example.com:8883 -servername broker.example.com and read the chain it prints, or mosquitto_sub -h broker.example.com -p 8883 --capath /etc/ssl/certs -t test -u user -P pass -v . If it reads closed: check the listener exists at all with ss -tlnp | grep 8883 (a bad certificate path makes Mosquitto log Error: Unable to load server key file and skip the listener while the 1883 one keeps working), then the host firewall with sudo ufw allow 8883/tcp , then the router forward. If your certificate comes from Let's Encrypt, remember the renewal hook has to copy the new files and restart the broker — devices with pinned or strictly-validated CAs will drop off silently on renewal day otherwise. Before you forward it, ask whether a WireGuard tunnel would do the job. It usually will, it removes the certificate lifecycle problem entirely, and it keeps the broker off every internet-wide scan list.",
  "faq": [
   {
    "q": "What is the difference between port 1883 and 8883?",
    "a": "Both carry MQTT. 1883 is plaintext, so credentials and payloads are readable in transit; 8883 wraps the same protocol in TLS, so the session is encrypted and the client can verify the broker's certificate. Neither port implies anything about authentication — you still need a password file and allow_anonymous false."
   },
   {
    "q": "How do I enable TLS on Mosquitto?",
    "a": "Add a listener 8883 block with certfile and keyfile pointing at your certificate and private key, make sure the mosquitto user can read the key, and restart. If the key is unreadable or the paths are wrong, Mosquitto logs an error and simply does not open the listener, which looks from outside like a firewall problem."
   },
   {
    "q": "Does an open port 8883 mean my TLS is working?",
    "a": "No. This check completes a TCP handshake only; it does not negotiate TLS or validate a certificate. Verify the crypto separately with openssl s_client -connect host:8883, which prints the chain, the negotiated protocol and any verification error."
   },
   {
    "q": "Is it safe to expose port 8883 to the internet?",
    "a": "It is defensible, unlike 1883, provided the broker requires authentication, refuses anonymous clients, and ideally requires client certificates. TLS stops eavesdropping and tampering but does not stop an unauthenticated stranger from subscribing, so the access controls matter as much as the certificate."
   }
  ]
 },
 "8920": {
  "intro": "TCP 8920 is the HTTPS listener of Jellyfin and Emby - the same web UI and API served on 8096, wrapped in TLS. It is not enabled by default: Jellyfin will not serve HTTPS until you tick Enable HTTPS in Dashboard > Networking and give it a certificate. This checker is TCP, so an OPEN result means something really is listening and reachable on 8920. CLOSED / filtered most often means HTTPS was never actually turned on rather than that the network is broken. Work through it in this order: ss -tlnp | grep 8920 on the server. No socket at all means the certificate is missing or was rejected at startup - Jellyfin logs the reason and falls back to HTTP only. Jellyfin wants a PKCS#12 bundle (a .pfx or .p12 containing the key and the chain) with its path and password entered in Networking. A pair of PEM files will not load; convert with openssl pkcs12 -export -out jellyfin.pfx -inkey privkey.pem -in fullchain.pem . In Docker, publish the port explicitly with -p 8920:8920 and mount the certificate into the container, and remember the path in the settings is the path inside the container. Host firewall: sudo ufw allow 8920/tcp . Confirm what is actually being served with openssl s_client -connect server:8920 -servername your.hostname </dev/null - it prints the certificate chain and the negotiated TLS version, which settles \"is it my certificate or my network\" in one command. The honest recommendation, though, is not to use 8920 from the internet at all. A certificate loaded into Jellyfin has to be converted and re-uploaded every renewal, which means every ninety days with Let's Encrypt, and a lapsed one teaches your household to click past TLS warnings. A reverse proxy on 443 handles renewal automatically, gives you a normal hostname with no port in the URL, and lets you add rate limiting or an auth layer in front - with Jellyfin then reachable only on 127.0.0.1:8096 behind it. Set Known proxies so Jellyfin still sees real client addresses.",
  "faq": [
   {
    "q": "How do I enable HTTPS on port 8920 in Jellyfin?",
    "a": "In Dashboard, Networking, tick Enable HTTPS, set the HTTPS port to 8920 and point the certificate path at a PKCS#12 file containing your key and full chain, with its password if it has one. Restart Jellyfin and check that ss -tlnp | grep 8920 now shows a listener - if it does not, the server log will name the reason the certificate was rejected."
   },
   {
    "q": "Why does my Jellyfin certificate on 8920 show as not trusted?",
    "a": "Either it is self-signed, or the PKCS#12 bundle is missing the intermediate certificates. Browsers need the full chain, so build the bundle from fullchain.pem rather than cert.pem alone. A certificate issued for a hostname will also fail if you connect by IP address, because the name will not match."
   },
   {
    "q": "Do I need port 8920 if I use a reverse proxy?",
    "a": "No. With nginx, Caddy or Traefik terminating TLS on 443 and forwarding to 127.0.0.1:8096, Jellyfin's own HTTPS listener is redundant and can stay off. That also moves certificate renewal to the proxy, which automates it, instead of leaving you to re-export a .pfx every few months."
   },
   {
    "q": "What is the difference between Jellyfin ports 8096 and 8920?",
    "a": "They serve the same application: 8096 is plain HTTP and 8920 is HTTPS with a certificate you supply. Neither should be forwarded straight to the internet as a matter of course - 8096 because it is unencrypted, 8920 because its certificate is managed by hand. Keep both on the LAN and publish through a proxy or a VPN."
   }
  ]
 },
 "8989": {
  "intro": "8989 is the default HTTP port for Sonarr , the TV series manager in the *arr family. Its siblings sit on neighbouring numbers — Radarr on 7878, Lidarr on 8686, Prowlarr on 9696, Jackett on 9117 — which is why a stack of them can run on one host without a single collision. Two situations bring people to this page. The first is a Sonarr UI that will not load at all; the second is wanting to check the queue from work, which is where the interesting decision is. If the UI will not load on your own LAN: confirm the service is up and bound wide with ss -tlnp | grep ':8989 ' . Sonarr stores its bind address, port and URL base in config.xml ( /var/lib/sonarr/config.xml on Debian packages, /config/config.xml in the common container images) — <BindAddress> must be * and not localhost . In Docker, -p 8989:8989 is required; without it the container listens only inside its own network namespace. If you set a <UrlBase> for a reverse proxy, the root URL stops working and you must browse to /sonarr . Reading the result here. OPEN means anyone on the internet can complete a TCP handshake to your Sonarr and reach its login page. CLOSED is the normal, healthy answer for a home connection — Sonarr does not need any inbound forward to do its job, because it makes outbound connections to indexers and to your download client itself. If you want remote access, do it in this order of preference: WireGuard back into the LAN and use the private address; or a reverse proxy on 443 that terminates TLS and adds its own authentication in front of Sonarr; or, last, a forward of 8989 with a strong Sonarr password. Never accept the Authentication Required: Disabled for Local Addresses setting alongside a reverse proxy — the proxy connects from a local address, so every request from the internet arrives pre-trusted and the login page vanishes. That single misconfiguration is the most common way *arr instances end up public.",
  "faq": [
   {
    "q": "What port does Sonarr run on?",
    "a": "TCP 8989 by default for the web interface and the API. It is set in config.xml (or with the SONARR__SERVER__PORT environment variable in recent container images), and the same listener serves both the UI and /api/v3."
   },
   {
    "q": "Why can I not access Sonarr from another computer?",
    "a": "The usual causes are a BindAddress of localhost in config.xml, a Docker container started without -p 8989:8989, or a host firewall. Check with ss -tlnp | grep ':8989 ' on the Sonarr machine: if it shows 127.0.0.1:8989 rather than 0.0.0.0:8989 or *:8989, nothing on the network can reach it."
   },
   {
    "q": "Is it safe to expose Sonarr to the internet?",
    "a": "Only behind a reverse proxy with TLS and authentication, or a VPN. Sonarr's API key grants full control including settings that run scripts on your server, and it is passed as a query parameter, so it ends up in proxy and browser logs. A bare port-forward of 8989 puts that key one leaked URL away from strangers."
   },
   {
    "q": "Does Sonarr need any port forwarded on my router?",
    "a": "No. Sonarr initiates all of its connections outbound — to indexers, to Sabnzbd or your torrent client, to metadata services — so it works perfectly with every inbound port closed. The only reason to forward anything is remote access for yourself, and a VPN does that better."
   }
  ]
 },
 "9000": {
  "intro": "Port 9000 is unassigned and heavily overloaded. Four things realistically listen there, and they have wildly different risk profiles: PHP-FPM , speaking FastCGI — not HTTP. nginx reaches it with fastcgi_pass 127.0.0.1:9000; . Portainer 's web UI (HTTP on 9000, HTTPS on 9443). MinIO 's S3 API (with the console on 9001). SonarQube 's web interface. The PHP-FPM case is the dangerous one. FastCGI is a trusted-transport protocol: it has no authentication whatsoever, and it accepts the script path and environment from whatever connects. Anyone who can reach an FPM pool on 9000 can generally make it execute code. Debian and Ubuntu default to a unix socket at /run/php/php8.x-fpm.sock for exactly this reason, but container images commonly set listen = 9000 on all interfaces — which is fine on a private Docker network and a disaster the moment someone adds -p 9000:9000 and a port-forward. Reading the result. For this port, OPEN is the alarming answer. If 9000 is reachable from the internet and you did not deliberately publish MinIO behind a proxy, treat it as an exposure to fix now: identify the listener with ss -tlnp | grep ':9000 ' and docker ps --format '{{.Names}}\\t{{.Ports}}' . CLOSED is the state you want. Note that a browser pointed at an FPM pool just hangs or shows binary junk, which people mistake for \"nothing is there\" — it is there, it simply does not speak HTTP. To close it properly: PHP-FPM: set listen = /run/php/php8.2-fpm.sock (or listen = 127.0.0.1:9000 plus listen.allowed_clients = 127.0.0.1 ) in the pool config under /etc/php/*/fpm/pool.d/ , then systemctl restart php8.2-fpm . Docker: publish to loopback only — -p 127.0.0.1:9000:9000 — or drop the publish entirely and let containers reach each other over a user-defined network. Portainer, MinIO, SonarQube: front them with nginx or Caddy on 443 with authentication, or skip the forward and use WireGuard. Remember that Portainer with the Docker socket mounted is root on the host by another name. Then re-run this check and confirm it reads closed.",
  "faq": [
   {
    "q": "What is running on port 9000?",
    "a": "It is unassigned, so check the host: PHP-FPM, Portainer, MinIO and SonarQube are the four common answers. Run ss -tlnp | grep ':9000 ' and, if containers are involved, docker ps to see which one published it."
   },
   {
    "q": "Is it safe to expose PHP-FPM on port 9000?",
    "a": "No. FastCGI has no authentication and was designed to be spoken only over loopback or a unix socket between a web server and the pool. An FPM pool reachable from the internet can generally be driven into executing code. Bind it to a unix socket, or to 127.0.0.1 with listen.allowed_clients set."
   },
   {
    "q": "Should I forward port 9000 for Portainer?",
    "a": "No. Portainer with the Docker socket mounted can start privileged containers, which is equivalent to root on the host, so its login page should not be on the public internet. Reach it over a VPN, or put it behind a reverse proxy that authenticates before the request ever gets to Portainer — and use 9443 with TLS rather than cleartext 9000."
   },
   {
    "q": "Port 9000 is open but a browser shows nothing. What is it?",
    "a": "That is the signature of PHP-FPM. It speaks FastCGI, not HTTP, so a browser request either hangs or renders binary noise. It is very much listening, and it needs to be bound back to loopback or a unix socket immediately."
   }
  ]
 },
 "9090": {
  "intro": "9090 is shared by several things, and on any given host you have exactly one of them: Prometheus. The default --web.listen-address is :9090 , serving the expression browser, the targets page and the query API. Cockpit. Red Hat's web console for Linux hosts listens on 9090 by way of a systemd socket unit, and authenticates against PAM — that is, real system accounts, root included. Openfire's admin console, on older XMPP deployments. Identify yours with ss -tlnp | grep ':9090 ' , or curl -s http://127.0.0.1:9090/-/healthy , which answers Prometheus Server is Healthy. Reading the result. CLOSED is the answer you want. OPEN, with Prometheus behind it, means anyone can browse /targets and read a list of every host, container and exporter you monitor, then query /api/v1/query for the data itself — a complete map of your estate handed over without a login, because Prometheus has never shipped an authentication layer. If --web.enable-admin-api is set, they can also delete series. OPEN with Cockpit behind it means a root login prompt on the public internet, which is at least authenticated but is still an invitation to credential stuffing. If Prometheus is unreachable where it should work, check the flag rather than the firewall first: --web.listen-address=127.0.0.1:9090 in the systemd unit beats any router configuration. A --web.external-url set for a reverse proxy also changes the path, so the UI moves to /prometheus/ and the bare root returns 404. In Docker you need -p 9090:9090 , and the scrape targets must be addresses the container can resolve. The right way to publish it is a reverse proxy on 443 terminating TLS and doing basic auth or OIDC, with Prometheus itself bound to loopback — or, simpler, no exposure at all and a WireGuard tunnel when you need the console. Cockpit should get the same treatment; it also honours ListenStream= in a socket override if you want it on a private interface only.",
  "faq": [
   {
    "q": "What service runs on port 9090?",
    "a": "Most often Prometheus, whose web UI and query API default to :9090. Cockpit, the Linux web console shipped with RHEL, Fedora and available on Debian and Ubuntu, also uses 9090, as does Openfire's admin console. Run ss -tlnp | grep ':9090 ' to see which process owns it."
   },
   {
    "q": "Does Prometheus have a login?",
    "a": "Not by default. Prometheus serves its UI and API with no authentication, so anyone who can reach port 9090 can enumerate your targets and query every metric. Recent versions support basic auth and TLS through a web configuration file, but the standard approach is to bind it to localhost and front it with an authenticating reverse proxy."
   },
   {
    "q": "Is it safe to expose Prometheus on the internet?",
    "a": "No. Its targets page is a directory of your infrastructure and its query API returns the data, all unauthenticated, and with --web.enable-admin-api an anonymous caller can delete time series. Keep it on a private address and reach it through a VPN or an authenticated proxy."
   },
   {
    "q": "How do I stop Prometheus listening on all interfaces?",
    "a": "Set --web.listen-address=127.0.0.1:9090 in the ExecStart line of its systemd unit and reload, or publish the container as -p 127.0.0.1:9090:9090 in Docker. Grafana or your proxy then reaches it over loopback while nothing on the network can."
   }
  ]
 },
 "9091": {
  "intro": "Port 9091 is the Transmission RPC port — the same TCP port serves the web UI you open in a browser and the JSON-RPC API that transmission-remote and the phone apps drive. It is not the port peers connect to; that is 51413. In the Prometheus world 9091 is also the Pushgateway , so on a monitoring host the two can collide. Almost everyone arrives here after installing transmission-daemon , opening http://host:9091 and getting either nothing at all or 403: Unauthorized IP Address . Both are the defaults doing their job: The bind. Distro packages set \"rpc-bind-address\": \"0.0.0.0\" but many container images and manual builds bind loopback. Check with ss -tlnp | grep ':9091 ' . The whitelist. \"rpc-whitelist\": \"127.0.0.1\" in settings.json rejects every other source address with that 403 — the TCP handshake completes, so this checker would still read OPEN. Edit it to your LAN, e.g. \"192.168.1.*\" , and stop the daemon before editing: transmission-daemon rewrites settings.json on exit and will overwrite your change. Reading the result. OPEN here means a stranger completed a handshake to your Transmission RPC port, which is the wrong answer even when it is the one you were hoping for. CLOSED is the correct state for a home connection: the peer port at 51413 is what needs forwarding, and Transmission works fine with 9091 unreachable from outside. If you genuinely cannot reach the UI from your own LAN, in order: confirm the daemon is up ( systemctl status transmission-daemon ), confirm the listener with ss -tlnp , test from another LAN host with nc -zv 192.168.1.50 9091 , then open the host firewall with sudo ufw allow from 192.168.1.0/24 to any port 9091 proto tcp . Note the source restriction — a bare ufw allow 9091 plus a careless port-forward is how these boxes end up mining someone else's cryptocurrency. If you need it from outside the house, run WireGuard on 51820 and browse to the LAN address through the tunnel.",
  "faq": [
   {
    "q": "What port does the Transmission web UI use?",
    "a": "TCP 9091. The web interface and the RPC API that transmission-remote and mobile clients use are the same listener, configured by rpc-port in settings.json. The peer port that other BitTorrent clients connect to is separate and defaults to 51413."
   },
   {
    "q": "Why does Transmission say 403 Unauthorized IP Address?",
    "a": "The rpc-whitelist in settings.json defaults to 127.0.0.1, so requests from any other address are refused after the connection is accepted. Stop transmission-daemon first, edit rpc-whitelist to include your LAN (for example 192.168.1.*), then start it again — the daemon rewrites settings.json when it shuts down and will undo edits made while it is running."
   },
   {
    "q": "Should I port forward 9091 so I can manage Transmission remotely?",
    "a": "No. The RPC interface has no password by default and exposes a setting that runs a script when a torrent finishes, which is remote command execution for anyone who finds it. Reach it through a VPN such as WireGuard, or an SSH tunnel: ssh -L 9091:127.0.0.1:9091 user@host, then browse to http://127.0.0.1:9091."
   },
   {
    "q": "Is port 9091 the same as the Transmission peer port?",
    "a": "No. 9091 is management only. Peer traffic uses 51413 by default over both TCP and UDP, and that is the port worth forwarding on your router if your torrents show few connections or no incoming peers."
   }
  ]
 },
 "9100": {
  "intro": "Port 9100 is unusual: two completely unrelated services use it, and which one you have changes everything about the answer. Raw printing (JetDirect / socket / AppSocket). HP's JetDirect cards claimed 9100 and every other vendor copied it. There is no protocol — you open a TCP connection and whatever bytes you send are printed. CUPS drives it with a socket://192.168.1.40:9100 device URI, and Windows calls it a Standard TCP/IP Port in Raw mode. Multi-function devices often expose 9101 and 9102 for the second and third ports. Prometheus node_exporter. The default listen address is :9100 , serving host metrics at /metrics . If you run monitoring, that is almost certainly what is on this port. Reading the result. CLOSED is the correct answer for both. OPEN means either a printer is reachable from the internet — exposed printers get used to print junk, and PJL lets a stranger change the display message or reset settings — or node_exporter is handing your host inventory to anyone who curls it: hostname, kernel version, mounted filesystems, uptime, every interface and its traffic counters. Neither service has a single line of authentication. Diagnosing which one you have: from the LAN, curl -s http://192.168.1.20:9100/metrics | head returns Prometheus text if it is node_exporter and nothing useful if it is a printer. On the host, ss -tlnp | grep ':9100 ' names the process. If printing to 9100 fails on your LAN, test the socket directly with nc -zv 192.168.1.40 9100 ; if that succeeds but jobs vanish, the problem is the driver or PPD, not the network — raw 9100 requires the queue to send data the printer already understands, so a Generic PostScript driver aimed at a PCL-only device silently prints nothing or ejects pages of garbage. Consider ipp:// on 631 instead, which negotiates the format. To fix an exposed node_exporter, start it with --web.listen-address=127.0.0.1:9100 and scrape it through a tunnel, or restrict it with sudo ufw allow from 192.168.1.0/24 to any port 9100 proto tcp .",
  "faq": [
   {
    "q": "What is port 9100 used for?",
    "a": "Two things. Historically it is HP JetDirect raw printing, also called socket or AppSocket printing, where the printer accepts an unstructured byte stream as a print job. In monitoring stacks it is the default port for Prometheus node_exporter, which serves host metrics at /metrics. Check which process is bound with ss -tlnp | grep ':9100 '."
   },
   {
    "q": "Is port 9100 TCP or UDP?",
    "a": "TCP for both uses. Raw printing is a plain TCP stream with no handshake beyond the connection itself, and node_exporter is an HTTP server. Some printers also answer SNMP on UDP 161 for status queries, but that is a separate port."
   },
   {
    "q": "Is it safe to expose port 9100 to the internet?",
    "a": "No, for either service. Raw printing has no authentication at all, so anyone who reaches the port can print, and PJL commands can alter printer settings or the front-panel message. node_exporter serves detailed host information unauthenticated, which is a gift to anyone profiling your network."
   },
   {
    "q": "How do I stop node_exporter listening on all interfaces?",
    "a": "Pass --web.listen-address=127.0.0.1:9100 (or a specific private address) in the systemd unit's ExecStart and reload. If Prometheus runs on another host, bind it to the private interface and restrict the port with a firewall rule scoped to the scraper's address, or scrape across a WireGuard tunnel."
   }
  ]
 },
 "9117": {
  "intro": "9117 is Jackett's HTTP port. Jackett is a translation layer: it logs into torrent trackers with your credentials, scrapes their search pages and re-serves the results as a Torznab feed that Sonarr, Radarr and friends understand. Everything it does is authenticated as you , which is what makes this port different from the other *arr ports. The usual reason for being here is Sonarr or Radarr reporting that an indexer test failed. Nine times in ten that is a container networking problem rather than a router problem. Inside a Docker bridge network, http://localhost:9117 means the *arr container itself, not Jackett — use the service name ( http://jackett:9117/api/v2.0/indexers/.../results/torznab/ ) or the host's LAN address. Verify from the calling container with nc -zv jackett 9117 . Other things that break it: Jackett bound to loopback — check ss -tlnp | grep ':9117 ' ; the setting is BindToAllInterfaces in ServerConfig.json . A base path configured in Jackett but not in the URL you pasted into Sonarr. The wrong API key. Jackett's key is per-installation and shown at the top right of its dashboard; it changes if you regenerate it or recreate the container's config volume. Reading the result. CLOSED is the only correct answer for 9117 on a home connection. If this check reads OPEN, someone forwarded it — and unless you also set an admin password in Jackett's dashboard, anyone who finds the port gets the configuration page listing every tracker you use, with the credentials already saved. Undo the forward now, then change those tracker passwords; a scan-and-scrape of exposed Jackett instances is trivially automated. The right shape is Jackett reachable only from your other containers or your LAN, with sudo ufw allow from 192.168.1.0/24 to any port 9117 proto tcp if it needs to cross hosts, plus a password set on the dashboard as a second layer. For access away from home, terminate WireGuard on the router and treat 9117 as a LAN-only service forever.",
  "faq": [
   {
    "q": "What port does Jackett use?",
    "a": "TCP 9117 for its web dashboard and its Torznab API. Both are served by the same listener, and the port can be changed in ServerConfig.json or from the dashboard's settings page."
   },
   {
    "q": "Why can Sonarr not connect to Jackett?",
    "a": "Most often the URL is wrong for the network layout: in Docker, localhost inside the Sonarr container is Sonarr itself, so Jackett must be addressed by container name or by the host's LAN IP. After that, check the Jackett API key, any configured base path, and whether Jackett is bound to all interfaces rather than 127.0.0.1."
   },
   {
    "q": "Should I expose Jackett on the internet?",
    "a": "No. Jackett has no admin password until you set one, and it holds the login credentials and cookies for every private tracker you have configured. An exposed instance leaks all of them and can also be used as an open proxy to fetch URLs on your behalf."
   },
   {
    "q": "What is the difference between Jackett and Prowlarr?",
    "a": "They solve the same problem — presenting trackers to the *arr apps as a common feed — but Prowlarr (default port 9696) integrates directly with Sonarr and Radarr and pushes indexer configuration to them, while Jackett only publishes Torznab URLs that you paste in by hand. Neither belongs on the public internet."
   }
  ]
 },
 "9200": {
  "intro": "TCP 9200 is the HTTP REST API of Elasticsearch and OpenSearch - the endpoint curl , Kibana, Logstash, Beats and every client library talk to. It is not the port cluster nodes use to talk to each other: that is the transport layer on 9300 , a different binary protocol. Getting these two the wrong way round is the most common confusion on this port. Rule of thumb: if a human or an application is talking to it, 9200; if two nodes are talking to each other, 9300. The classic troubleshooting sequence is that curl http://127.0.0.1:9200 on the server returns the cluster info JSON while the same request from another host times out. The cause is network.host in elasticsearch.yml , which defaults to loopback. Widening it has a side effect people do not expect: setting network.host to a non-loopback address flips Elasticsearch into production mode and it starts enforcing bootstrap checks , so the node then refuses to start over things like vm.max_map_count being too low or discovery.seed_hosts being unset. If your cluster stopped starting right after you \"just changed the bind address\", that is what happened - read the errors in /var/log/elasticsearch/ , they name the failed check precisely. Other checks worth running: ss -tlnp | grep -E ':(9200|9300)' on the node. curl -k -u elastic:PASSWORD https://127.0.0.1:9200/_cluster/health?pretty - on version 8 and later the API is HTTPS with a self-signed certificate out of the box, so plain http:// fails even locally. sudo ufw allow from 192.168.1.0/24 to any port 9200 - allow the subnet, never the world. Never publish 9200. It is not a query port, it is your entire administrative surface: an unauthenticated caller can read every document, create and delete indices, and issue DELETE /* . Clusters left open have been found and emptied by automated sweeps - the 2020 \"meow\" wave wiped thousands of them - and before that they were a steady source of exposed-data stories. Modern versions help: Elasticsearch 8 enables security and TLS by default with a generated elastic password. Do not disable that to make a client work. If a browser app needs search, put a reverse proxy in front that authenticates users and permits only the specific read endpoints, or reach the cluster over a VPN.",
  "faq": [
   {
    "q": "What is the difference between port 9200 and port 9300?",
    "a": "9200 serves the HTTP REST API that clients, Kibana, Logstash and curl use. 9300 is the transport port, a binary protocol nodes use to talk to each other for discovery, replication and cluster coordination. Applications should only ever need 9200, and 9300 should be reachable between cluster nodes on a private network and nowhere else."
   },
   {
    "q": "Does Elasticsearch have authentication by default?",
    "a": "In version 8 and later, yes - security is on by default, the HTTP API is TLS-protected with a self-signed certificate, and an elastic superuser password is generated at first start. Earlier 7.x versions had the security features available but off unless you set xpack.security.enabled, and versions before that had no authentication at all, which is why so many old clusters were left open."
   },
   {
    "q": "Why does Elasticsearch fail to start after I changed network.host?",
    "a": "Setting network.host to anything other than a loopback address puts the node into production mode, at which point bootstrap checks become hard errors rather than warnings. Typical failures are vm.max_map_count being below 262144, no discovery.seed_hosts or cluster.initial_master_nodes configured, or too low a file-descriptor limit. The startup log names the exact check that failed."
   },
   {
    "q": "Is it safe to expose Elasticsearch on port 9200 to the internet?",
    "a": "No. Port 9200 is a full read-write administrative API: whoever reaches it can read every document and delete every index. Open clusters are found by automated scanning and have been wiped en masse, most visibly in the 2020 meow attacks. Keep 9200 on a private network and put an authenticating reverse proxy in front of any search endpoint a browser must reach."
   }
  ]
 },
 "10000": {
  "intro": "Port 10000 has two real occupants. The first is Webmin (and Virtualmin, which is built on it): a web control panel whose miniserv.pl daemon runs as root and can edit any configuration file, manage users, and open a shell. The second is NDMP , the Network Data Management Protocol used by backup software and storage appliances to move data — if 10000 is listening on a NAS or a backup host and you never installed Webmin, that is what it is. A detail that sends people to a port checker unnecessarily: Webmin defaults to HTTPS with a self-signed certificate . Browsing to http://host:10000/ gives you a broken or empty response and it looks like the port is shut, when the service is running perfectly on https://host:10000/ . Check ssl=1 in /etc/webmin/miniserv.conf before you conclude anything, and expect a certificate warning either way. Reading the result. CLOSED is the correct outcome. OPEN means a root-privileged administration panel is answering the public internet. Webmin's history makes that specific: releases 1.890 to 1.920 shipped from a compromised build server carrying an injected command-execution backdoor (CVE-2019-15107) — reachable without credentials in 1.890's default configuration, and in later builds where password expiry was enabled — and exposed instances are still probed for it years later. Treat an OPEN 10000 as something to fix in the next few minutes, then check /var/webmin/miniserv.log and the system auth log for login attempts you did not make. To close it: Identify the listener: ss -tlnp | grep ':10000 ' — miniserv.pl is Webmin, ndmpd or a vendor agent is backup software. Bind Webmin to the inside interface: set bind=192.168.1.10 in /etc/webmin/miniserv.conf and restart with systemctl restart webmin . There is also an allow= line for source restrictions. Delete the router port-forward, and check UPnP has not recreated one. Update. Webmin is packaged and patched frequently; running a years-old copy on a machine that was ever exposed deserves a fresh look for changes you did not make. For remote administration, use SSH on 22 with keys, or WireGuard into the network and then browse to the panel privately.",
  "faq": [
   {
    "q": "What is port 10000 used for?",
    "a": "Two things in practice. Webmin and Virtualmin serve their web administration interface there, and NDMP backup agents on NAS and storage systems use it to move backup data. Run ss -tlnp | grep ':10000 ' on the host to see which process is actually listening."
   },
   {
    "q": "Is it safe to expose Webmin on port 10000?",
    "a": "No. Webmin runs as root and can change any file on the system, and a compromised release once shipped with an injected command-execution backdoor (CVE-2019-15107), usable without credentials in 1.890's default configuration, that scanners still look for. Bind it to the local network and reach it over a VPN or an SSH tunnel."
   },
   {
    "q": "Why can't I reach Webmin on port 10000?",
    "a": "Most often because you used http:// — Webmin defaults to HTTPS with a self-signed certificate, so try https://host:10000/ and accept the warning. If that fails, check the bind and ssl settings in /etc/webmin/miniserv.conf, whether the service is running, and the host firewall."
   },
   {
    "q": "How do I change the Webmin port?",
    "a": "Edit the port= line in /etc/webmin/miniserv.conf and restart the service with systemctl restart webmin. Moving it does not make it safe — internet-wide scanners sweep every port — so pair the change with a bind= restriction to your internal address or a VPN-only path."
   }
  ]
 },
 "11211": {
  "intro": "Port 11211 is memcached - a plain key-value cache with no persistence, sitting in front of a database for PHP, Django, Rails and similar stacks. It historically listened on both TCP and UDP , which is the single most important fact on this page. There is no authentication in the ordinary configuration. The text protocol is exactly what it looks like: connect and type. echo -e 'stats\\r' | nc -q1 127.0.0.1 11211 returns the server's statistics to anyone who asks, and get returns cached values - which in a typical web application means session tokens and query results. There is no password to guess because there is no password. The UDP interface made it worse. A tiny spoofed stats or get query to UDP 11211 makes the server send a much larger reply to whatever source address the attacker forged, which is how memcached became the amplification vector behind the record-breaking DDoS attacks of February 2018 . The project responded in version 1.5.6 by disabling UDP by default, and distributions bind to localhost - but old builds, hand-rolled containers and cloud images still turn up listening on every interface. So the result you want from this check is CLOSED / filtered . If it says OPEN , fix it now: Debian and Ubuntu: /etc/memcached.conf should contain -l 127.0.0.1 and -U 0 . Red Hat family: the same flags in /etc/sysconfig/memcached . Verify both transports afterwards - ss -tlnp | grep 11211 and ss -ulnp | grep 11211 . A clean TCP listing means nothing if UDP is still bound. Docker: -p 127.0.0.1:11211:11211 , never a bare -p 11211:11211 , which publishes on all interfaces and writes NAT rules that bypass ufw . If an application server on another host legitimately needs the cache, bind memcached to the private address ( -l 192.168.1.20 ), restrict the firewall to that one client ( sudo ufw allow from 192.168.1.30 to any port 11211 proto tcp ), and keep UDP off. SASL authentication exists with the binary protocol and -S , but it is fiddly and rarely deployed; network isolation is the control people actually rely on. Simplest of all: keep memcached on the same host as the application and never let it leave loopback.",
  "faq": [
   {
    "q": "Should port 11211 ever be open to the internet?",
    "a": "No. Memcached has no authentication in its normal configuration, so anyone who reaches the port can read and overwrite cached values - often session data - and can query the server's statistics. It is designed to sit on the same private network as the application it serves, bound to loopback or an internal address."
   },
   {
    "q": "Does memcached still listen on UDP?",
    "a": "Not by default. Memcached 1.5.6 disabled the UDP listener after the February 2018 amplification attacks, and current packages ship it off. Older builds, custom containers and some cloud images still enable it, so verify with ss -ulnp | grep 11211 and pass -U 0 explicitly rather than assuming your build is recent enough."
   },
   {
    "q": "How do I bind memcached to localhost?",
    "a": "Add -l 127.0.0.1 to the daemon options - on Debian and Ubuntu in /etc/memcached.conf, on Red Hat derivatives in /etc/sysconfig/memcached - and restart the service. Add -U 0 in the same place to disable UDP. Confirm with ss -tlnp and ss -ulnp that only the loopback socket remains."
   },
   {
    "q": "Why was memcached used in DDoS amplification attacks?",
    "a": "Because its UDP interface answered a very small spoofed request with a much larger reply sent to the forged source address, giving attackers a large traffic multiplier from every exposed server. That produced the record-setting attacks of February 2018. Disabling UDP with -U 0 and binding to a private address removes your server from that pool entirely."
   }
  ]
 },
 "19132": {
  "intro": "UDP 19132 is the default port for a Minecraft: Bedrock Edition server - the official bedrock_server binary from Mojang, plus PocketMine-MP, Nukkit and GeyserMC, which listens here to let Bedrock clients into a Java world. Bedrock rides on RakNet over UDP, which is why the number is different from Java's TCP 25565 and why the two editions cannot join each other's servers directly. Expect this checker to say closed even on a perfectly working server. It opens TCP connections, and there is no TCP listener on 19132 to answer. That is not a fault and there is no honest external test for it - a UDP port with no reply looks the same as a firewalled one. Verify it from the server side instead: ss -lunp | grep 19132 on Linux - you want 0.0.0.0:19132 , not a loopback bind. sudo tcpdump -ni any udp port 19132 while a friend tries to connect. Packets arriving means the forward is fine and the problem is the server; nothing arriving means the forward, the ISP or CGNAT. Ask someone off your network to add the server manually with your public IP and port 19132. Bedrock's LAN list only discovers servers on the same broadcast domain, so it proving nothing from inside is normal. Configuration lives in server.properties : server-port=19132 for IPv4 and server-portv6=19133 for IPv6 - the dedicated server binds both, so a forward for 19132 alone is enough for IPv4 players. Forward UDP , not TCP; a rule created as TCP is the single most common reason a Bedrock forward does nothing. On Windows, netsh advfirewall firewall add rule name=\"Bedrock\" dir=in action=allow protocol=UDP localport=19132 . Two Bedrock-specific traps. Consoles cannot type an arbitrary IP into the Servers tab, which is why console players use a DNS-redirect helper such as BedrockConnect rather than joining you directly - phones, tablets and Windows can add a server with address and port normally. And if you run several worlds on one host, each needs its own port (19133, 19134 and so on) and its own UDP forward, because they cannot share 19132.",
  "faq": [
   {
    "q": "Is port 19132 TCP or UDP?",
    "a": "UDP. Minecraft Bedrock uses the RakNet protocol over UDP, so a TCP port check on 19132 will report closed no matter how healthy the server is. Create the router forward and firewall rule as UDP - creating them as TCP is the most common reason a Bedrock port forward appears to do nothing."
   },
   {
    "q": "How do I check if my Bedrock server port is open?",
    "a": "You cannot do it reliably from outside, because a silent UDP port and a blocked one look identical. Run ss -lunp | grep 19132 on the server to confirm it is bound, then tcpdump -ni any udp port 19132 while someone off your network tries to join. If their packets arrive, the network path is fine."
   },
   {
    "q": "What is port 19133 used for in Bedrock?",
    "a": "19133 is server-portv6, the IPv6 listener of the same Bedrock dedicated server. The binary opens both by default: 19132 for IPv4 and 19133 for IPv6. If your players connect over IPv4 you only need the 19132 forward, and IPv6 clients need a firewall rule for the host's own global address rather than a forward, because IPv6 has no NAT."
   },
   {
    "q": "Can Java players join a Bedrock server on 19132?",
    "a": "Not directly - the two editions speak different protocols. GeyserMC bridges them by listening on UDP 19132 as a Bedrock server and translating to a Java server behind it, usually with Floodgate so Bedrock players do not need a Java account. The Java side stays on TCP 25565."
   }
  ]
 },
 "19999": {
  "intro": "19999 is the Netdata agent's dashboard and API port. Netdata's appeal is its granularity — per-second metrics for every disk, interface, container, systemd service and process on the box, with no configuration — and that same granularity is why an exposed agent is a problem. The agent dashboard has no authentication. There is no user, no password and no login page; the design assumes the port is reachable only from a trusted network, with authentication provided by Netdata Cloud or a reverse proxy. So if this check reads OPEN, anyone on the internet can see your hostname, kernel and distribution, your container and service names, your disk layout and free space, your user sessions, and a live view of network connections — everything an attacker would otherwise spend an afternoon enumerating. Locking it down. In /etc/netdata/netdata.conf , under [web] : bind to = 127.0.0.1 for local-only, or bind to = 192.168.1.20 to keep it on the LAN interface. allow connections from = localhost 192.168.1.* as a second layer. Restart with systemctl restart netdata , verify with ss -tlnp | grep 19999 , and confirm from outside that this checker now reads CLOSED. Use sudo edit-config netdata.conf rather than editing the stock file directly — the packaged netdata.conf is regenerated on upgrade. If the dashboard will not load at all, confirm the agent is running ( systemctl status netdata ) and that nothing else grabbed the port; in Docker the container needs -p 19999:19999 along with the host mounts Netdata expects, and a container without --pid=host reports the container's own view rather than the host's. From another LAN machine, nc -zv 192.168.1.20 19999 separates a firewall problem from a bind problem. For remote viewing, claim the node into Netdata Cloud (the agent connects outbound, so nothing needs forwarding), tunnel with ssh -L 19999:127.0.0.1:19999 user@host , or reach the LAN address over WireGuard.",
  "faq": [
   {
    "q": "What port does Netdata use?",
    "a": "TCP 19999 by default for the agent's dashboard and its API. It is set under the [web] section of netdata.conf with the \"default port\" and \"bind to\" options, and the same listener serves both the web UI and the JSON endpoints under /api/."
   },
   {
    "q": "Does Netdata have a password?",
    "a": "The agent dashboard has no authentication of any kind. Access control is expected to come from binding it to a private address, the \"allow connections from\" setting, a reverse proxy with basic auth or SSO, or Netdata Cloud. Never rely on the port being obscure."
   },
   {
    "q": "How do I stop Netdata being accessible from the internet?",
    "a": "Set bind to = 127.0.0.1 (or your LAN address) under [web] in netdata.conf using sudo edit-config netdata.conf, add allow connections from = localhost 192.168.1.*, restart the agent, and remove any port-forward for 19999 on the router. Re-run this check afterwards to confirm it reads closed."
   },
   {
    "q": "How can I view Netdata remotely without exposing port 19999?",
    "a": "Three good options: claim the node into Netdata Cloud, where the agent makes an outbound connection and no inbound port is needed; tunnel it with ssh -L 19999:127.0.0.1:19999 user@host and browse to localhost; or connect to your LAN over WireGuard and use the private address."
   }
  ]
 },
 "25565": {
  "intro": "TCP 25565 is the default listen port for a Minecraft: Java Edition server - the vanilla server.jar from Mojang and every fork that keeps the default: Paper, Spigot, Purpur, Fabric and Forge, plus panels such as Pterodactyl that hand the first instance this port. Bedrock Edition is a different protocol on UDP 19132 ; if the people who cannot join are on phones, consoles or the Microsoft Store version, you are on the wrong page. Java Edition gameplay is plain TCP, so this checker tests exactly the right thing. OPEN means a full TCP handshake completed on 25565 from outside your network: the forward works and something is listening behind it. CLOSED / filtered with the server definitely running is almost always one of these four: The server is bound to the wrong address. server-ip= in server.properties must be left empty to listen on every interface. Check with ss -tlnp | grep 25565 - you want 0.0.0.0:25565 or *:25565 , not 127.0.0.1:25565 . The forward points at a stale LAN address. Give the host a DHCP reservation; a rule aimed at 192.168.1.42 dies the day that box takes .57 instead. The host firewall. sudo ufw allow 25565/tcp on Linux; on Windows netsh advfirewall firewall add rule name=\"Minecraft\" dir=in action=allow protocol=TCP localport=25565 . The rule Windows offers to create is usually for the launcher, not for the JAR you started from a terminal. Carrier-grade NAT. If your router's WAN address sits in 100.64.0.0/10 and does not match the public IP this site shows you, no port forward can work - you need a tunnel or a hosted box. Once it reads OPEN, players type your-ip:25565 , or just the address on its own since 25565 is the default. Running on a different port? Publish an SRV record - _minecraft._tcp.play.example.com pointing at the host and real port - and players can still type the bare hostname. Two neighbours that are not this port: RCON defaults to TCP 25575 and sends its password in cleartext, so leave enable-rcon=false or keep it on the LAN; the optional query listener is UDP on query.port and is off until you set enable-query=true . Keep the server build current too - Minecraft servers were squarely inside the Log4Shell blast radius.",
  "faq": [
   {
    "q": "How do I port forward 25565 for Minecraft?",
    "a": "Give the machine running the server a static or DHCP-reserved LAN address, then create a forward on your router sending TCP port 25565 to that address on port 25565. Allow 25565/tcp in the host firewall as well, because the router rule only gets the packet to the machine. Then run this check: OPEN means the whole path works."
   },
   {
    "q": "Why can my friends not join my Minecraft server?",
    "a": "The usual causes are a server bound to 127.0.0.1 instead of every interface, a forward aimed at an internal IP the server no longer has, a host firewall blocking inbound TCP 25565, or carrier-grade NAT on your ISP connection. Also confirm nobody is trying to join a Java server from Bedrock - the two editions cannot connect to each other without a proxy such as Geyser."
   },
   {
    "q": "Do I need to open port 25565 for a LAN world?",
    "a": "No. Opening a single-player world to LAN picks a random high port and announces it over the local network, so nothing needs forwarding and nothing outside your house can reach it. Port 25565 only matters for a dedicated server you want people on the internet to join."
   },
   {
    "q": "Can I run a Minecraft server on a different port?",
    "a": "Yes - set server-port in server.properties to any free port and forward that instead. Players then have to type address:port unless you publish an SRV record at _minecraft._tcp.yourdomain pointing at the host and port, which lets them use the plain hostname. Moving off 25565 cuts down opportunistic scanning but is not a security control on its own."
   }
  ]
 },
 "27015": {
  "intro": "27015 is Valve's default for a Source dedicated server - srcds running Counter-Strike 2, CS:GO, Team Fortress 2, Garry's Mod, Left 4 Dead 2 and the rest of the family. It is also the query port ARK and several other Unreal-based games borrow, which is why it shows up in port-forward guides for games Valve never made. The number carries two different protocols , and confusing them is why this page exists: UDP 27015 is the real game port. Player traffic and the Steam A2S_INFO server-browser query both arrive here. This is what you must forward. TCP 27015 is Source RCON, the remote console. It only listens once rcon_password is set, and the protocol has no encryption at all - the password is sent in the clear on every login. So a TCP check on 27015 is genuinely ambiguous. CLOSED here is the normal, healthy state for a game server with RCON disabled and says nothing about whether players can connect. OPEN means an RCON listener is exposed to the internet, which is worth a second look: anyone who guesses or sniffs that password gets a console that can change maps, ban players and run server commands. To prove the game side works, use the game's own machinery rather than a TCP probe. From another network, connect your-ip:27015 in the client console. On the server, ss -lunp | grep 27015 should show a UDP bind, and status in the server console shows the port it actually took - -port 27015 on the command line overrides the default, and running two instances on one box means the second needs its own port and its own forward. SourceTV, if enabled, is a separate UDP listener on 27020. If the server runs but never appears in the community browser, check sv_lan 0 , that the Game Server Login Token in sv_setsteamaccount is valid, and that UDP 27015 is forwarded - the browser listing is built from A2S queries that have to reach you. Those same queries have been abused for reflection attacks, so Source servers rate-limit them via sv_max_queries_sec and sv_max_queries_sec_global ; leave those at their defaults rather than raising them to make a monitoring script happy.",
  "faq": [
   {
    "q": "Is port 27015 TCP or UDP?",
    "a": "Both, for different things. Game traffic and Steam server-browser queries are UDP 27015, and that is the one you forward for players to connect. TCP 27015 is Source RCON, which only listens when rcon_password is set and should not be reachable from the internet."
   },
   {
    "q": "Why is my Source server not showing in the server browser?",
    "a": "The browser list is built from A2S queries sent to UDP 27015, so if that port is not forwarded the server stays invisible even though direct connects work. Check that sv_lan is 0, that the server has a valid Game Server Login Token set with sv_setsteamaccount, and that the forward is UDP rather than TCP."
   },
   {
    "q": "What ports does a Steam game server need?",
    "a": "For a standard Source server, UDP 27015 for game traffic and queries, plus UDP 27020 if you enable SourceTV. Some titles also use UDP 27005 on the client side, which needs nothing forwarded because it is an outbound connection. Extra instances on the same host each need their own port and forward."
   },
   {
    "q": "Should I expose Source RCON on port 27015?",
    "a": "No. Source RCON sends its password unencrypted on every authentication, so anyone in the path can capture it and anyone on the internet can brute force it. Administer the server over SSH, or if you must use a remote RCON tool, restrict TCP 27015 in the firewall to the single address you administer from."
   }
  ]
 },
 "27017": {
  "intro": "TCP 27017 is the default port for mongod , and for the mongos router in front of a sharded cluster. A replica set adds nothing new - every member listens on 27017 unless you move it - while sharded deployments conventionally use 27018 for shard members and 27019 for config servers. The usual reason to test this port is a driver that will not connect. MongoDB drivers do not fail fast; they run server discovery in the background and eventually raise something like MongoServerSelectionError: connection <monitor> to 203.0.113.10:27017 timed out . That message means the SYN went unanswered, which is exactly what this check measures - so an OPEN result here with a failing driver points at authentication or TLS, and a CLOSED result points at binding, firewall or NAT. Start on the server: ss -tlnp | grep 27017 - since MongoDB 3.6 the packaged /etc/mongod.conf sets net.bindIp: 127.0.0.1 , so a fresh install is deliberately local-only. sudo systemctl status mongod and tail /var/log/mongodb/mongod.log - a bad bindIp (an address the host does not own) stops the service from starting at all. mongosh --host 192.168.1.20 --port 27017 --eval 'db.runCommand({ping:1})' from the client side. When you widen bindIp , add the private address rather than 0.0.0.0 , and there is a second trap with replica sets: members advertise the hostname recorded in the replica-set config, so a client can reach 27017 on the seed host, be redirected to a name it cannot resolve, and time out anyway. Check with rs.conf() . This port must not face the internet. MongoDB has no access control until you enable it - security.authorization: enabled in mongod.conf , plus an admin user created before you restart. Instances left open with the old 0.0.0.0 default were found and emptied at scale in the 2017 ransom campaigns, and open clusters are still located and wiped by automated sweeps within hours of appearing. If this check reports OPEN, assume the data has been read and act accordingly. Do it the boring way instead: bind to loopback or a WireGuard address, enable authorization with a per-application user and role, turn on TLS if traffic leaves the host, and tunnel for admin work with ssh -L 27017:127.0.0.1:27017 user@dbhost .",
  "faq": [
   {
    "q": "Does MongoDB have authentication enabled by default?",
    "a": "No. A stock mongod runs with access control disabled, so any client that can reach port 27017 has full read and write access. You enable it by setting security.authorization to enabled in mongod.conf, after creating an administrative user. Since version 3.6 the packaged configuration also binds to 127.0.0.1, which is what keeps most default installs from being reachable."
   },
   {
    "q": "Why can't I connect to MongoDB from another machine?",
    "a": "Almost always net.bindIp in /etc/mongod.conf, which defaults to 127.0.0.1. Add the server's private address, restart mongod and confirm with ss -tlnp | grep 27017, then open the firewall to just the client subnet. If you are connecting to a replica set, also check rs.conf(), because members advertise the hostnames listed there and the client must be able to resolve them."
   },
   {
    "q": "Is it safe to expose port 27017 to the internet?",
    "a": "No. MongoDB ships without access control, and internet-facing instances have been found, emptied and held to ransom in large automated sweeps since 2017. Even with authentication enabled, exposing the port invites credential attacks against your whole dataset. Keep it on a private network and reach it over a VPN or SSH tunnel."
   },
   {
    "q": "What ports does a MongoDB replica set use?",
    "a": "Every replica-set member listens on 27017 by default, and they need to reach each other on that port for elections and replication. Sharded clusters conventionally place shard members on 27018 and config servers on 27019, with the mongos routers on 27017 facing the application. All of it should live on a private network."
   }
  ]
 },
 "28015": {
  "intro": "UDP 28015 is the default game port for RustDedicated , the Rust dedicated server - set with +server.port 28015 and used by LGSM, Oxide/uMod and Carbon installs alike. It carries player traffic and the Steam server-browser query, so it is the one port that genuinely has to reach the internet. This checker speaks TCP, and Rust's game port is UDP, so expect a closed result even on a healthy server. There is no honest external UDP test: a server that ignores a stray packet looks exactly like a firewall dropping it. Confirm from the box instead: ss -lunp | grep 28015 - you want a UDP socket on 0.0.0.0:28015 owned by RustDedicated . sudo tcpdump -ni any udp port 28015 while someone outside your network runs client.connect your-ip:28015 in the F1 console. Packets arriving means the router forward and the ISP path are fine. Forward the rule as UDP . A TCP forward for 28015 is the single most common mistake and produces exactly this symptom - server runs, console looks clean, nobody can connect. The other ports around it are separate services and should be treated differently. TCP 28016 is Rust's WebSocket RCON ( +rcon.port 28016 , +rcon.password ), which tools like RustAdmin use; it is protected by one shared password and belongs on a VPN or restricted to your admin address, not forwarded to the world. TCP 28082 is the Rust+ companion app port ( +app.port ) and is only needed if players use the phone app. The Steam browser query rides the same UDP game port unless you override it with +server.queryport . If the server is reachable by direct connect but missing from the in-game list, that is a listing problem rather than a port problem: check that +server.ip is not pinned to the wrong interface, that the server has finished loading the map (a server compiling a new procedural map does not advertise), and that the query traffic on UDP 28015 is not being rate-limited by an upstream firewall.",
  "faq": [
   {
    "q": "Is Rust port 28015 TCP or UDP?",
    "a": "UDP. The Rust game port and the Steam browser query both use UDP 28015, so the router forward and any host firewall rule must be created as UDP. A TCP-only check of 28015 will always report closed, which is normal and does not mean your server is unreachable."
   },
   {
    "q": "What ports do I need to open for a Rust server?",
    "a": "UDP 28015 for the game and the server-browser query is the only one that must face the internet. TCP 28016 is RCON and should be kept private, and TCP 28082 is the Rust+ companion app port, needed only if your players use it. Each extra server instance on the same host needs its own port."
   },
   {
    "q": "Why is my Rust server not showing in the server list?",
    "a": "Give it time to finish generating the map first - a server still loading does not advertise itself. After that, confirm UDP 28015 is forwarded and reaching the host with tcpdump, that server.ip is not bound to the wrong interface, and that the server has a valid identity and hostname set. Direct connects working while the listing is empty points at the query traffic, not at gameplay."
   },
   {
    "q": "Is it safe to expose Rust RCON on 28016?",
    "a": "Not to the whole internet. Rust's WebSocket RCON is guarded by a single password, so an exposed port invites automated guessing, and a successful login gives full server control. Restrict TCP 28016 to your own address in the firewall or reach it over WireGuard, and use a long random rcon.password either way."
   }
  ]
 },
 "32400": {
  "intro": "TCP 32400 is the Plex Media Server port - the web interface at http://server:32400/web , the API every Plex client speaks, and the single port that needs to reach the internet for remote access. Everything else Plex opens is local discovery or a secondary service. This checker is TCP and Plex is TCP, so the result means something. OPEN is what a working Remote Access setup looks like from outside. CLOSED / filtered alongside \"Not available outside your network\" in Settings > Remote Access is the classic pairing, and the causes are: UPnP did not take. Untick Enable automatic port mapping , set Manually specify public port to 32400, and create the forward on the router by hand: external TCP 32400 to the server's LAN address, port 32400. Automatic mapping fails silently on a lot of consumer routers and on every double-NAT setup. Double NAT. An ISP box in front of your own router means you need the forward on both, or bridge mode on the outer one. Carrier-grade NAT. A WAN address inside 100.64.0.0/10 that does not match the public IP shown on this site means inbound connections cannot reach you at all - Plex will fall back to its relay, which is bandwidth limited and transcodes hard. The container or host firewall. In Docker, host networking or an explicit -p 32400:32400 is required; on Linux, sudo ufw allow 32400/tcp . Confirm the bind with ss -tlnp | grep 32400 . An Indirect connection in Plex's status means it gave up on the direct path and is proxying through the Plex Relay - proof the port is not reachable even when playback works. Fix the forward and the badge returns to a direct connection. Plex's other ports are worth knowing so you do not forward them: UDP 32410, 32412, 32413 and 32414 are GDM local discovery, TCP 32469 is the DLNA server, UDP 1900 is SSDP, TCP 3005 is Plex Companion and TCP 8324 serves Roku control. None of them need to leave your LAN, and the Plex SSDP listener has been abused as a DDoS reflector, so leaving them local is the right call. Note also that remote playback now depends on your account tier as well as your port - a working forward does not bypass Plex's own entitlement checks.",
  "faq": [
   {
    "q": "What port does Plex use for remote access?",
    "a": "TCP 32400, forwarded from your router to the machine running Plex Media Server. That is the only port that needs to face the internet; the UDP discovery ports and the DLNA and Companion ports are for your local network only. Plex wraps the connection in TLS using a certificate for a hashed plex.direct hostname, so remote streams are encrypted even though you are forwarding a plain port number."
   },
   {
    "q": "Why does Plex say 'Not available outside your network'?",
    "a": "Plex could not confirm an inbound path to port 32400. Turn off automatic port mapping, set the manual public port to 32400, and create the forward on the router yourself; then check for double NAT or carrier-grade NAT, which block inbound connections regardless of what you configure. Running this port check afterwards tells you whether the path is genuinely open."
   },
   {
    "q": "What does an indirect connection mean in Plex?",
    "a": "It means the client could not reach your server directly and is being relayed through Plex's own infrastructure instead. Playback usually still works but the relay is bandwidth limited, which forces heavy transcoding and lower quality. A working TCP 32400 forward removes the relay and restores a direct connection."
   },
   {
    "q": "Is it safe to forward port 32400 to the internet?",
    "a": "It is the intended design: Plex authenticates against your plex.tv account and serves remote clients over TLS. Keep 'Allow insecure connections' set to Never so clients cannot fall back to plaintext, apply server updates promptly, and use strong credentials with two-factor authentication on the Plex account itself, since that account is what guards the library."
   }
  ]
 },
 "34197": {
  "intro": "UDP 34197 is Factorio's multiplayer port - used both by the headless server binary and by a normal client that hosts a game from the menu. Factorio's netcode is UDP only; there is no TCP listener to find, and the port is set with --port on the command line or port= in config.ini . So this TCP checker will report closed even when your factory is happily accepting engineers. No external service can honestly test a silent UDP port. Verify it where the answers are: ss -lunp | grep 34197 on the server - a UDP socket on 0.0.0.0:34197 owned by factorio . sudo tcpdump -ni any udp port 34197 while someone outside your network uses Multiplayer > Connect to address with your public IP. Packets arriving means the router forward works and the fault is above it. sudo ufw allow 34197/udp , and check the router rule is a UDP forward - a TCP rule for 34197 does nothing at all. The other half of Factorio multiplayer trips people separately: appearing in the public games list is a different problem from being reachable . Publishing requires \"visibility\": {\"public\": true} in server-settings.json plus valid Factorio.com credentials - a username with either a password or a token - and the server must be able to reach the matchmaking service outbound. Without those the server runs perfectly, accepts direct connections, and stays invisible. Factorio does not hole-punch its way through NAT for you, so a published server with no forward is listed but unjoinable, which looks like a broken server to everyone who clicks it. If you host from the client rather than the headless binary, the same port and the same forward apply - the game hosts on 34197 from your machine. Running two servers on one host means giving the second its own --port and its own forward. RCON, if you enable it with --rcon-port and --rcon-password , is a separate TCP listener and has no reason to be reachable from outside your network.",
  "faq": [
   {
    "q": "Is Factorio port 34197 TCP or UDP?",
    "a": "UDP. Factorio's multiplayer protocol runs entirely over UDP, so a TCP check of 34197 reads closed on a working server and tells you nothing. Create the port forward and firewall rules as UDP - a TCP forward is the most common reason a Factorio server appears unreachable."
   },
   {
    "q": "How do I check if my Factorio server port is open?",
    "a": "From the server, run ss -lunp | grep 34197 to confirm the bind, then tcpdump -ni any udp port 34197 while someone outside your network tries Multiplayer, Connect to address with your public IP. If their packets show up, the forward and your ISP path are fine and any remaining problem is in the server itself."
   },
   {
    "q": "Why is my Factorio server not showing in the public list?",
    "a": "Publishing needs visibility.public set to true in server-settings.json and valid Factorio.com credentials - a username plus a token or password - so the server can authenticate to the matchmaking service. That is separate from reachability: a listed server with no UDP 34197 forward appears in the browser but times out when anyone clicks it."
   },
   {
    "q": "Can I change the Factorio server port from 34197?",
    "a": "Yes, pass --port to the headless binary or set port in config.ini, then forward the new UDP port instead. Players joining by address type ip:port. Use a different port per instance if you run several games on one machine, since they cannot share 34197."
   }
  ]
 },
 "51413": {
  "intro": "51413 is Transmission's default peer port — the socket other BitTorrent clients dial to reach you, over both TCP and UDP (Transmission speaks µTP, which is BitTorrent over UDP, on the same number). Transmission picked a high, unregistered port on purpose: the older 6881-6889 range is the first thing traffic-shaping gear looks for. People land here because Transmission's own Network preferences say Port is closed , or because torrents download fine but never seed and peer counts stay low. Both point at the same thing: outbound connections work through NAT without any help, incoming ones need an explicit forward. Reading the result. OPEN means a TCP connection from the internet reached your client, which is exactly what you want here — unlike most ports on this site, open is the goal. CLOSED means either no forward exists, it points at the wrong internal host, or Transmission is not running. Note that this checker tests TCP only; µTP on UDP 51413 cannot be probed from outside, so forward both in your router even though only one can be verified. If it reads closed, in order: Confirm something is listening: ss -tlnp | grep 51413 on the host. If Transmission has Randomize port on launch ticked, the number moved — untick it, or your forward will be stale after every restart. Check the forward targets the seedbox's current LAN address, not an old DHCP lease. Give it a reservation. Open the host firewall: sudo ufw allow 51413 covers TCP and UDP in one rule. Turn off Use UPnP or NAT-PMP port forwarding if you have also configured a manual forward — the two fight, and UPnP silently re-maps to a different external port. If you run Transmission through a commercial VPN , forwarding on your own router does nothing: inbound traffic arrives at the VPN exit, not your WAN. You need a provider that hands out a forwarded port, and you must set that number as Transmission's peer port. If your WAN address is inside 100.64.0.0/10 you are behind carrier-grade NAT and no forward will ever work; you need a static public IP or a tunnel. An unreachable peer port is not fatal — you still connect out to peers who are reachable — but it caps your swarm connections and hurts your ratio badly on private trackers.",
  "faq": [
   {
    "q": "What port does Transmission use for torrents?",
    "a": "TCP and UDP 51413 by default for peer traffic. The web interface and RPC API are separate, on TCP 9091. If \"Randomize port on launch\" is enabled in the Network preferences, Transmission picks a new peer port on every start, which breaks any static router forward."
   },
   {
    "q": "Transmission says the port is closed — how do I fix it?",
    "a": "Forward TCP and UDP 51413 on your router to the machine's LAN address, give that machine a DHCP reservation so the forward does not go stale, and allow the port in the host firewall with sudo ufw allow 51413. Disable UPnP in Transmission once you have a manual forward, since the two can conflict."
   },
   {
    "q": "Do I need to forward port 51413 to use BitTorrent?",
    "a": "No. Downloads work without it because your client makes outbound connections, which NAT allows. Forwarding it lets peers connect in, which raises your connection count and lets you seed properly — the difference between a \"connectable\" and a non-connectable client on trackers that report it."
   },
   {
    "q": "Why is my port still closed when I use a VPN?",
    "a": "Because inbound packets arrive at the VPN provider's exit address, not your router, so a forward on your own gateway is never consulted. Only a VPN that offers port forwarding can help, and you must configure the port number it assigns as Transmission's peer port."
   }
  ]
 },
 "51820": {
  "intro": "UDP 51820 is the port wg-quick picks by default when a config has no ListenPort . WireGuard is UDP only - there is no TCP mode, and every project that offers you \"WireGuard over TCP\" is wrapping it in something else. Anything running the kernel module or the userspace implementation binds here: a hand-rolled wg0.conf , PiVPN, wg-easy, the WireGuard plugins in OPNsense and pfSense, RouterOS, Netmaker, Firezone. Expect a closed result on this page, even when everything works. Two reasons stack up. The checker is TCP and this is a UDP service, so there is nothing to connect to; and WireGuard is deliberately silent - it does not reply to any packet that is not a valid handshake initiation authenticated with the right keys. A port scanner cannot tell a WireGuard server from an empty address, which is exactly what its designers wanted. Do not go looking for an external check that proves 51820 is open; there isn't an honest one. Verify it the way the protocol lets you: On the server, sudo wg show . The latest handshake line for a peer is the only proof that matters - a timestamp within the last two minutes means the round trip is working. ss -lunp | grep 51820 confirms the socket is bound, and sudo wg show wg0 listen-port confirms which port it actually took. On the client, watch the transfer counters in wg show . Bytes sent climbing with bytes received stuck at zero means your packets leave and nothing returns: fix the router forward (UDP 51820 to the server's LAN address) or the host firewall, ufw allow 51820/udp . tcpdump -ni any udp port 51820 on the server tells you in one line whether the handshake ever arrives. Two structural points people miss. Only the peer that receives the first handshake needs an open port, so a laptop roaming between networks needs nothing forwarded - and if a peer sits behind NAT and you want it reachable from the other side, set PersistentKeepalive = 25 so the mapping stays alive. And if your router's WAN address is inside 100.64.0.0/10 , you are behind carrier-grade NAT and no forward will ever work; you need a public IP or a relay host that both sides dial out to.",
  "faq": [
   {
    "q": "How do I check if my WireGuard port is open?",
    "a": "You cannot do it usefully from outside. WireGuard ignores every packet that is not a correctly keyed handshake, so an external UDP or TCP scan of 51820 looks identical whether the server is running or not. Run sudo wg show on the server and look at the latest handshake time for the peer - that is the real test."
   },
   {
    "q": "Why does WireGuard say handshake did not complete?",
    "a": "Either the initiation is not reaching the server or the reply is not getting back. Check that UDP 51820 is forwarded to the server's internal address and allowed by its firewall, that the endpoint address and port in the client config are right, and that the public keys on each side actually belong to the other peer. A tcpdump on udp port 51820 at the server settles which half is broken."
   },
   {
    "q": "Can I change WireGuard's port from 51820?",
    "a": "Yes - ListenPort is arbitrary, and moving it is common when a network blocks unusual UDP ports. Some people run it on UDP 443 or 53 to slip through restrictive Wi-Fi. Update the client's Endpoint to match and forward the new port; nothing else in the config depends on 51820."
   },
   {
    "q": "Do both WireGuard peers need a port forward?",
    "a": "No, only whichever side receives the first handshake. A client roaming on mobile data needs nothing opened. If both peers are behind NAT, neither can be reached directly, and you need a third host with a public address that both dial out to, plus PersistentKeepalive to hold the NAT mappings open."
   }
  ]
 }
};
