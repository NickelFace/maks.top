---
title: "iptables / nftables"
description: "Linux firewall: chains, tables, NAT, stateful filtering, persistence"
icon: "🔥"
group: "Security"
tags: ["Security", "iptables", "nftables", "Linux", "Firewall"]
date: 2026-04-14
page_lang: "en"
lang_pair: "/kb/ru/iptables-nftables/"
---

<div class="intro-card">
Linux firewall reference: <strong>iptables</strong> (chains, tables, stateful filtering, NAT, logging, persistence) and <strong>nftables</strong> (modern syntax). Covers LPIC-2 topic 212.1.
</div>

## iptables — structure

<div class="ref-panel">
<div class="ref-panel-head">Tables & chains</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Table</th><th>Chains</th><th>Purpose</th></tr></thead>
<tbody>
<tr><td class="mono">filter</td><td class="desc">INPUT · OUTPUT · FORWARD</td><td class="desc">Default table — allow/drop/reject</td></tr>
<tr><td class="mono">nat</td><td class="desc">PREROUTING · OUTPUT · POSTROUTING</td><td class="desc">Address translation</td></tr>
<tr><td class="mono">mangle</td><td class="desc">All five</td><td class="desc">Packet modification (TTL, TOS, marks)</td></tr>
<tr><td class="mono">raw</td><td class="desc">PREROUTING · OUTPUT</td><td class="desc">Conntrack bypass</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Chain flow</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Traffic</th><th>Path</th></tr></thead>
<tbody>
<tr><td class="mono">Incoming to host</td><td class="desc">PREROUTING → INPUT → local process</td></tr>
<tr><td class="mono">Outgoing from host</td><td class="desc">local process → OUTPUT → POSTROUTING</td></tr>
<tr><td class="mono">Forwarded (router)</td><td class="desc">PREROUTING → FORWARD → POSTROUTING</td></tr>
</tbody>
</table>
</div>
</div>

## Listing & reset

<div class="ref-panel">
<div class="ref-panel-head">Viewing rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -L -n -v --line-numbers</td><td class="desc">All filter rules with counters and line numbers</td></tr>
<tr><td class="mono">iptables -L INPUT -n -v --line-numbers</td><td class="desc">INPUT chain only</td></tr>
<tr><td class="mono">iptables -t nat -L -n -v</td><td class="desc">NAT table</td></tr>
<tr><td class="mono">iptables -t mangle -L -n -v</td><td class="desc">Mangle table</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Reset to clean state</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -F</td><td class="desc">Flush all filter rules</td></tr>
<tr><td class="mono">iptables -F INPUT</td><td class="desc">Flush INPUT chain only</td></tr>
<tr><td class="mono">iptables -X</td><td class="desc">Delete user-defined chains</td></tr>
<tr><td class="mono">iptables -Z</td><td class="desc">Zero counters</td></tr>
<tr><td class="mono">iptables -Z INPUT</td><td class="desc">Zero INPUT counters only</td></tr>
<tr><td class="mono">iptables -t nat -F</td><td class="desc">Flush NAT table</td></tr>
<tr><td class="mono">iptables -t mangle -F</td><td class="desc">Flush mangle table</td></tr>
<tr><td class="mono">iptables -P INPUT ACCEPT</td><td class="desc">Reset default INPUT policy</td></tr>
</tbody>
</table>
</div>
</div>

## Policies & rule management

<div class="ref-panel">
<div class="ref-panel-head">Adding, inserting, deleting rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -P INPUT DROP</td><td class="desc">Set default policy to DROP</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 -j ACCEPT</td><td class="desc">Append rule to end of chain</td></tr>
<tr><td class="mono">iptables -I INPUT 1 -s 10.0.0.0/8 -j ACCEPT</td><td class="desc">Insert rule at position 1</td></tr>
<tr><td class="mono">iptables -D INPUT 3</td><td class="desc">Delete rule by line number</td></tr>
<tr><td class="mono">iptables -D INPUT -p tcp --dport 80 -j ACCEPT</td><td class="desc">Delete rule by specification</td></tr>
<tr><td class="mono">iptables -R INPUT 2 -p tcp --dport 443 -j ACCEPT</td><td class="desc">Replace rule at position 2</td></tr>
</tbody>
</table>
</div>
</div>

## Common filter rules

<div class="ref-panel">
<div class="ref-panel-head">Essential INPUT rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -i lo -j ACCEPT</td><td class="desc">Allow loopback (always required)</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Allow established/related traffic</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate INVALID -j DROP</td><td class="desc">Drop invalid packets</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 -j ACCEPT</td><td class="desc">Allow SSH</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT</td><td class="desc">Allow HTTP/HTTPS (multiport)</td></tr>
<tr><td class="mono">iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT</td><td class="desc">Allow ping</td></tr>
<tr><td class="mono">iptables -A INPUT -j DROP</td><td class="desc">Drop everything else</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Source/destination filtering</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT</td><td class="desc">Allow from subnet</td></tr>
<tr><td class="mono">iptables -A INPUT -s 10.0.0.55 -j DROP</td><td class="desc">Block a specific IP</td></tr>
<tr><td class="mono">iptables -A INPUT -i eth0 -p tcp --dport 22 -j ACCEPT</td><td class="desc">SSH on specific interface only</td></tr>
<tr><td class="mono">iptables -A INPUT -m iprange --src-range 10.0.0.10-10.0.0.11 -j ACCEPT</td><td class="desc">Allow IP range</td></tr>
<tr><td class="mono">iptables -A INPUT -m mac --mac-source aa:bb:cc:dd:ee:ff -j DROP</td><td class="desc">Block by MAC (L2 only)</td></tr>
<tr><td class="mono">iptables -A OUTPUT -m owner --uid-owner nobody -j DROP</td><td class="desc">Drop traffic from user (OUTPUT only)</td></tr>
</tbody>
</table>
</div>
</div>

## Stateful filtering (conntrack)

<div class="ref-panel">
<div class="ref-panel-head">Connection states</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>State</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td class="mono">NEW</td><td class="desc">First packet of a new connection</td></tr>
<tr><td class="mono">ESTABLISHED</td><td class="desc">Connection is established, packets flowing both ways</td></tr>
<tr><td class="mono">RELATED</td><td class="desc">Related to an existing connection (FTP data, ICMP error)</td></tr>
<tr><td class="mono">INVALID</td><td class="desc">Does not match any known connection, should be dropped</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">conntrack commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Core stateful rule</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate INVALID -j DROP</td><td class="desc">Drop invalid</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 --syn -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">New SSH connections only</td></tr>
<tr><td class="mono">conntrack -L</td><td class="desc">Show connection tracking table</td></tr>
<tr><td class="mono">conntrack -S</td><td class="desc">Conntrack statistics</td></tr>
</tbody>
</table>
</div>
</div>

## NAT

<div class="ref-panel">
<div class="ref-panel-head">SNAT & MASQUERADE</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -t nat -A POSTROUTING -s 192.168.10.0/24 -o eth0 -j MASQUERADE</td><td class="desc">MASQUERADE — dynamic source IP (DHCP, PPPoE)</td></tr>
<tr><td class="mono">iptables -t nat -A POSTROUTING -s 192.168.10.0/24 -o eth0 -j SNAT --to-source 203.0.113.10</td><td class="desc">SNAT — fixed source IP (faster than MASQUERADE)</td></tr>
<tr><td class="mono">echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward</td><td class="desc">Enable IP forwarding (required for NAT router)</td></tr>
<tr><td class="mono">net.ipv4.ip_forward = 1</td><td class="desc">Persist in /etc/sysctl.conf, apply with sysctl -p</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">DNAT & port forwarding</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 10.0.0.50:80</td><td class="desc">Forward port 8080 → internal host:80</td></tr>
<tr><td class="mono">iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 10000:10010 -j DNAT --to-destination 10.0.0.50</td><td class="desc">Forward port range (mapped 1:1)</td></tr>
<tr><td class="mono">iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080</td><td class="desc">Redirect to local port (PREROUTING/OUTPUT only)</td></tr>
<tr><td class="mono">iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 80 -d 10.0.0.50 -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">FORWARD rule required alongside DNAT</td></tr>
<tr><td class="mono">conntrack -L -j</td><td class="desc">Show active NAT translations</td></tr>
</tbody>
</table>
</div>
</div>

## Logging & custom chains

<div class="ref-panel">
<div class="ref-panel-head">Logging</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -j LOG --log-prefix "[DROP] " --log-level 4</td><td class="desc">Log (does NOT stop processing — packet continues)</td></tr>
<tr><td class="mono">iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "[INPUT-DROP] "</td><td class="desc">Log with rate limit (last rule before default policy)</td></tr>
<tr><td class="mono">journalctl -k | grep DROP</td><td class="desc">Read kernel log (iptables LOG target)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Custom chains</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -N LOGDROP</td><td class="desc">Create custom chain</td></tr>
<tr><td class="mono">iptables -A LOGDROP -j LOG --log-prefix "[DROP] "</td><td class="desc">Add LOG to custom chain</td></tr>
<tr><td class="mono">iptables -A LOGDROP -j DROP</td><td class="desc">Add DROP to custom chain</td></tr>
<tr><td class="mono">iptables -A INPUT -s 10.0.0.55 -j LOGDROP</td><td class="desc">Send traffic to custom chain</td></tr>
<tr><td class="mono">iptables -A chain -j RETURN</td><td class="desc">Return to parent chain (continue processing there)</td></tr>
</tbody>
</table>
</div>
</div>

## Rate limiting

<div class="ref-panel">
<div class="ref-panel-head">limit & recent modules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 5/second --limit-burst 10 -j ACCEPT</td><td class="desc">Limit ping to 5/s (burst 10)</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 --syn -m conntrack --ctstate NEW -m limit --limit 1/second --limit-burst 5 -j ACCEPT</td><td class="desc">SSH brute-force protection</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m recent --set --name HTTP</td><td class="desc">Track new HTTP connections per IP</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m recent --update --seconds 1 --hitcount 20 --name HTTP -j DROP</td><td class="desc">Drop if >20 new connections/s from same IP</td></tr>
</tbody>
</table>
</div>
</div>

## FORWARD & routing

<div class="ref-panel">
<div class="ref-panel-head">Routing / forwarding rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Allow established forwarded traffic</td></tr>
<tr><td class="mono">iptables -A FORWARD -s 192.168.10.0/24 -i eth1 -o eth0 -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">Allow internal LAN to initiate connections outward</td></tr>
<tr><td class="mono">iptables -I FORWARD 1 -s 192.168.10.50 -j DROP</td><td class="desc">Block a single internal host from forwarding</td></tr>
</tbody>
</table>
</div>
</div>

## Persistence

<div class="ref-panel">
<div class="ref-panel-head">Save & restore</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables-save > /etc/iptables/rules.v4</td><td class="desc">Save rules to file</td></tr>
<tr><td class="mono">iptables-restore < /etc/iptables/rules.v4</td><td class="desc">Restore rules atomically</td></tr>
<tr><td class="mono">sudo apt install iptables-persistent</td><td class="desc">Auto-load rules on boot</td></tr>
<tr><td class="mono">sudo netfilter-persistent save</td><td class="desc">Save current rules via persistent service</td></tr>
<tr><td class="mono">sudo netfilter-persistent reload</td><td class="desc">Reload rules from /etc/iptables/</td></tr>
</tbody>
</table>
</div>
</div>

## Minimal server template

```bash
# Safe order: allow SSH first, then set DROP policy
iptables -F; iptables -X
iptables -A INPUT -p tcp --dport 22 -j ACCEPT   # SSH before DROP policy
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 5/s -j ACCEPT
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "[DROP] "

netfilter-persistent save
```

## nftables

<div class="ref-panel">
<div class="ref-panel-head">Key differences from iptables</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Feature</th><th>iptables</th><th>nftables</th></tr></thead>
<tbody>
<tr><td class="mono">CLI</td><td class="desc">iptables / ip6tables / arptables</td><td class="desc">nft (single tool)</td></tr>
<tr><td class="mono">Atomic update</td><td class="desc">No (rule-by-rule)</td><td class="desc">Yes (transactions)</td></tr>
<tr><td class="mono">Sets</td><td class="desc">ipset (external)</td><td class="desc">Built-in named sets</td></tr>
<tr><td class="mono">Tables</td><td class="desc">Built-in (filter/nat/…)</td><td class="desc">User-defined</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">nft syntax</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">nft list ruleset</td><td class="desc">Show all tables, chains, rules</td></tr>
<tr><td class="mono">nft add table inet filter</td><td class="desc">Create table (inet = IPv4+IPv6)</td></tr>
<tr><td class="mono">nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'</td><td class="desc">Create input chain with DROP policy</td></tr>
<tr><td class="mono">nft add rule inet filter input ct state established,related accept</td><td class="desc">Allow established</td></tr>
<tr><td class="mono">nft add rule inet filter input tcp dport { 22, 80, 443 } accept</td><td class="desc">Allow ports (set literal)</td></tr>
<tr><td class="mono">nft add rule inet filter input iif lo accept</td><td class="desc">Allow loopback</td></tr>
<tr><td class="mono">nft delete rule inet filter input handle 5</td><td class="desc">Delete rule by handle number</td></tr>
<tr><td class="mono">nft -f /etc/nftables.conf</td><td class="desc">Load ruleset from file</td></tr>
<tr><td class="mono">nft list ruleset > /etc/nftables.conf</td><td class="desc">Save ruleset to file</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">iptables → nftables equivalents</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>iptables</th><th>nftables equivalent</th></tr></thead>
<tbody>
<tr><td class="mono">-p tcp --dport 22 -j ACCEPT</td><td class="desc">tcp dport 22 accept</td></tr>
<tr><td class="mono">-s 192.168.1.0/24 -j DROP</td><td class="desc">ip saddr 192.168.1.0/24 drop</td></tr>
<tr><td class="mono">-m conntrack --ctstate ESTABLISHED -j ACCEPT</td><td class="desc">ct state established accept</td></tr>
<tr><td class="mono">-t nat -A POSTROUTING -j MASQUERADE</td><td class="desc">ip saddr ... masquerade (in postrouting chain)</td></tr>
<tr><td class="mono">-m multiport --dports 80,443</td><td class="desc">tcp dport { 80, 443 }</td></tr>
<tr><td class="mono">-m limit --limit 5/s -j ACCEPT</td><td class="desc">limit rate 5/second accept</td></tr>
<tr><td class="mono">-j LOG --log-prefix "DROP: "</td><td class="desc">log prefix "DROP: "</td></tr>
</tbody>
</table>
</div>
</div>
