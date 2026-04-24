---
title: "Linux Networking"
description: "ip, ss, tcpdump, nmcli, iptables — commands and examples"
icon: "🌐"
group: "Networking"
tags: ["Linux", "ip", "ss", "tcpdump", "iptables", "nmcli"]
date: 2026-04-14
page_lang: "en"
lang_pair: "/kb/ru/linux-network/"
---

<div class="intro-card">
Quick reference for Linux networking tools. Covers the modern stack: <strong>iproute2</strong> (ip, ss), traffic capture (<strong>tcpdump</strong>), connection management (<strong>nmcli</strong>), and firewall (<strong>iptables</strong>).
</div>

## ip addr

<div class="ref-panel">
<div class="ref-panel-head">Address management</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ip addr</td><td class="desc">Show all interfaces with addresses</td></tr>
<tr><td class="mono">ip a show dev eth0</td><td class="desc">Single interface only</td></tr>
<tr><td class="mono">ip a add 192.168.1.10/24 dev eth0</td><td class="desc">Add an IP address</td></tr>
<tr><td class="mono">ip a del 192.168.1.10/24 dev eth0</td><td class="desc">Remove an IP address</td></tr>
<tr><td class="mono">ip a flush dev eth0</td><td class="desc">Remove all addresses from an interface</td></tr>
<tr><td class="mono">ip -6 a</td><td class="desc">IPv6 addresses only</td></tr>
<tr><td class="mono">ip -br a</td><td class="desc">Brief output</td></tr>
</tbody>
</table>
</div>
</div>

## ip link

<div class="ref-panel">
<div class="ref-panel-head">Interface management</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ip link show</td><td class="desc">List all interfaces</td></tr>
<tr><td class="mono">ip -br link</td><td class="desc">Brief output with statuses</td></tr>
<tr><td class="mono">ip link set eth0 up</td><td class="desc">Bring interface up</td></tr>
<tr><td class="mono">ip link set eth0 down</td><td class="desc">Bring interface down</td></tr>
<tr><td class="mono">ip link set eth0 mtu 9000</td><td class="desc">Set MTU (jumbo frames)</td></tr>
<tr><td class="mono">ip link set eth0 promisc on</td><td class="desc">Enable promiscuous mode</td></tr>
<tr><td class="mono">ip link set eth0 name lan0</td><td class="desc">Rename an interface</td></tr>
<tr><td class="mono">ip link add veth0 type veth peer name veth1</td><td class="desc">Create a veth pair</td></tr>
<tr><td class="mono">ip link add br0 type bridge</td><td class="desc">Create a bridge</td></tr>
<tr><td class="mono">ip link set eth0 master br0</td><td class="desc">Add interface to bridge</td></tr>
<tr><td class="mono">ip link del veth0</td><td class="desc">Delete an interface</td></tr>
</tbody>
</table>
</div>
</div>

## ip route

<div class="ref-panel">
<div class="ref-panel-head">Routing table</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ip route</td><td class="desc">Show routing table</td></tr>
<tr><td class="mono">ip r show table all</td><td class="desc">All routing tables</td></tr>
<tr><td class="mono">ip r add default via 192.168.1.1</td><td class="desc">Set default gateway</td></tr>
<tr><td class="mono">ip r add 10.0.0.0/8 via 10.1.0.1 dev eth0</td><td class="desc">Add a static route</td></tr>
<tr><td class="mono">ip r del 10.0.0.0/8</td><td class="desc">Delete a route</td></tr>
<tr><td class="mono">ip r replace 10.0.0.0/8 via 10.2.0.1</td><td class="desc">Replace / upsert a route</td></tr>
<tr><td class="mono">ip r get 8.8.8.8</td><td class="desc">Route to a specific host</td></tr>
<tr><td class="mono">ip r add blackhole 10.10.0.0/16</td><td class="desc">Blackhole (silent drop)</td></tr>
<tr><td class="mono">ip r add prohibit 10.10.0.0/16</td><td class="desc">Reject with ICMP admin-prohibited</td></tr>
<tr><td class="mono">ip r flush cache</td><td class="desc">Flush route cache</td></tr>
</tbody>
</table>
</div>
</div>

## ip neigh

<div class="ref-panel">
<div class="ref-panel-head">ARP / NDP table</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ip neigh show</td><td class="desc">Show ARP/NDP table</td></tr>
<tr><td class="mono">ip n show dev eth0</td><td class="desc">ARP for a specific interface</td></tr>
<tr><td class="mono">ip n add 192.168.1.1 lladdr aa:bb:cc:dd:ee:ff dev eth0 nud permanent</td><td class="desc">Add a static ARP entry</td></tr>
<tr><td class="mono">ip n del 192.168.1.1 dev eth0</td><td class="desc">Delete an ARP entry</td></tr>
<tr><td class="mono">ip n flush dev eth0</td><td class="desc">Flush ARP for an interface</td></tr>
<tr><td class="mono">ip n flush all</td><td class="desc">Flush the entire ARP cache</td></tr>
</tbody>
</table>
</div>
</div>

## ss

<div class="ref-panel">
<div class="ref-panel-head">Socket statistics (netstat replacement)</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ss -tuln</td><td class="desc">Listening TCP/UDP ports</td></tr>
<tr><td class="mono">ss -tulnp</td><td class="desc">Same + process names (root)</td></tr>
<tr><td class="mono">ss -ta</td><td class="desc">All TCP connections</td></tr>
<tr><td class="mono">ss -ua</td><td class="desc">All UDP sockets</td></tr>
<tr><td class="mono">ss -xa</td><td class="desc">Unix domain sockets</td></tr>
<tr><td class="mono">ss -s</td><td class="desc">Socket summary statistics</td></tr>
<tr><td class="mono">ss -4 state established</td><td class="desc">Established IPv4 connections</td></tr>
<tr><td class="mono">ss -tnp dst 10.0.0.1</td><td class="desc">Connections to a specific host</td></tr>
<tr><td class="mono">ss -tnp dport = :443</td><td class="desc">Connections to port 443</td></tr>
<tr><td class="mono">ss -tnp sport = :22</td><td class="desc">Connections from port 22</td></tr>
<tr><td class="mono">ss -tnp state time-wait</td><td class="desc">Connections in TIME-WAIT state</td></tr>
</tbody>
</table>
</div>
</div>

`ss` flags: `-t` TCP · `-u` UDP · `-l` listening · `-a` all · `-n` no resolve · `-p` processes · `-4`/`-6` IPv4/IPv6

## tcpdump

<div class="ref-panel">
<div class="ref-panel-head">Packet capture</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">tcpdump -i eth0</td><td class="desc">Capture on an interface</td></tr>
<tr><td class="mono">tcpdump -i any</td><td class="desc">Capture on all interfaces</td></tr>
<tr><td class="mono">tcpdump -i eth0 -n</td><td class="desc">No DNS resolution</td></tr>
<tr><td class="mono">tcpdump -i eth0 -nn</td><td class="desc">No DNS and no port name resolution</td></tr>
<tr><td class="mono">tcpdump -i eth0 -c 100</td><td class="desc">Capture 100 packets then exit</td></tr>
<tr><td class="mono">tcpdump -i eth0 -w file.pcap</td><td class="desc">Save to file (open in Wireshark)</td></tr>
<tr><td class="mono">tcpdump -r file.pcap</td><td class="desc">Read from file</td></tr>
<tr><td class="mono">tcpdump -i eth0 -v</td><td class="desc">Verbose output</td></tr>
<tr><td class="mono">tcpdump -i eth0 port 80</td><td class="desc">Filter by port</td></tr>
<tr><td class="mono">tcpdump -i eth0 host 10.0.0.1</td><td class="desc">Filter by host</td></tr>
<tr><td class="mono">tcpdump -i eth0 net 10.0.0.0/24</td><td class="desc">Filter by subnet</td></tr>
<tr><td class="mono">tcpdump -i eth0 src host 10.0.0.1</td><td class="desc">From source host only</td></tr>
<tr><td class="mono">tcpdump -i eth0 tcp and not port 22</td><td class="desc">TCP excluding SSH</td></tr>
<tr><td class="mono">tcpdump 'tcp[tcpflags] & tcp-syn != 0'</td><td class="desc">SYN packets only</td></tr>
<tr><td class="mono">tcpdump 'tcp[tcpflags] == tcp-syn|tcp-ack'</td><td class="desc">SYN-ACK only (handshake)</td></tr>
<tr><td class="mono">tcpdump -i eth0 icmp</td><td class="desc">ICMP (ping) only</td></tr>
<tr><td class="mono">tcpdump -i eth0 udp port 53</td><td class="desc">DNS queries</td></tr>
</tbody>
</table>
</div>
</div>

## nmcli

<div class="ref-panel">
<div class="ref-panel-head">NetworkManager CLI</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">nmcli device status</td><td class="desc">Status of all devices</td></tr>
<tr><td class="mono">nmcli device show eth0</td><td class="desc">Detailed interface information</td></tr>
<tr><td class="mono">nmcli connection show</td><td class="desc">List all connections</td></tr>
<tr><td class="mono">nmcli connection show --active</td><td class="desc">Active connections only</td></tr>
<tr><td class="mono">nmcli con up "name"</td><td class="desc">Activate a connection</td></tr>
<tr><td class="mono">nmcli con down "name"</td><td class="desc">Deactivate a connection</td></tr>
<tr><td class="mono">nmcli con reload</td><td class="desc">Reload configuration files</td></tr>
<tr><td class="mono">nmcli con add type ethernet ifname eth0 con-name myconn</td><td class="desc">Create an Ethernet connection</td></tr>
<tr><td class="mono">nmcli con mod "name" ipv4.addresses "192.168.1.10/24"</td><td class="desc">Set a static IP</td></tr>
<tr><td class="mono">nmcli con mod "name" ipv4.gateway "192.168.1.1"</td><td class="desc">Set the gateway</td></tr>
<tr><td class="mono">nmcli con mod "name" ipv4.dns "8.8.8.8 1.1.1.1"</td><td class="desc">Set DNS servers</td></tr>
<tr><td class="mono">nmcli con mod "name" ipv4.method manual</td><td class="desc">Switch to static addressing</td></tr>
<tr><td class="mono">nmcli con mod "name" ipv4.method auto</td><td class="desc">Switch to DHCP</td></tr>
<tr><td class="mono">nmcli con del "name"</td><td class="desc">Delete a connection</td></tr>
<tr><td class="mono">nmcli general hostname myhost</td><td class="desc">Set the hostname</td></tr>
<tr><td class="mono">nmcli networking off / on</td><td class="desc">Disable / enable networking</td></tr>
</tbody>
</table>
</div>
</div>

## iptables

<div class="ref-panel">
<div class="ref-panel-head">Listing & flushing rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -L -n -v</td><td class="desc">All rules with counters</td></tr>
<tr><td class="mono">iptables -L INPUT --line-numbers</td><td class="desc">Rules with line numbers</td></tr>
<tr><td class="mono">iptables -t nat -L -n -v</td><td class="desc">NAT table</td></tr>
<tr><td class="mono">iptables -F</td><td class="desc">Flush all rules (filter table)</td></tr>
<tr><td class="mono">iptables -F INPUT</td><td class="desc">Flush INPUT chain only</td></tr>
<tr><td class="mono">iptables -X</td><td class="desc">Delete user-defined chains</td></tr>
<tr><td class="mono">iptables -Z</td><td class="desc">Zero counters</td></tr>
<tr><td class="mono">iptables -D INPUT 3</td><td class="desc">Delete rule #3 in INPUT</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Common rules</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Allow established / related traffic</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 -j ACCEPT</td><td class="desc">Allow SSH</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 80,443 -j ACCEPT</td><td class="desc">Allow HTTP/HTTPS</td></tr>
<tr><td class="mono">iptables -A INPUT -i lo -j ACCEPT</td><td class="desc">Allow loopback</td></tr>
<tr><td class="mono">iptables -A INPUT -j DROP</td><td class="desc">Drop everything else</td></tr>
<tr><td class="mono">iptables -I INPUT 1 -s 10.0.0.0/8 -j ACCEPT</td><td class="desc">Insert rule at the top</td></tr>
<tr><td class="mono">iptables -A INPUT -p icmp -j ACCEPT</td><td class="desc">Allow ping</td></tr>
<tr><td class="mono">iptables -A INPUT -m limit --limit 3/min -j LOG --log-prefix "DROP: "</td><td class="desc">Log with rate limiting</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">NAT & Forwarding</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A FORWARD -i eth0 -o eth1 -j ACCEPT</td><td class="desc">Allow forwarding</td></tr>
<tr><td class="mono">iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE</td><td class="desc">NAT / masquerade (PAT)</td></tr>
<tr><td class="mono">iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -o eth0 -j SNAT --to-source 1.2.3.4</td><td class="desc">SNAT with a fixed IP</td></tr>
<tr><td class="mono">iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.10:80</td><td class="desc">Port forwarding (DNAT)</td></tr>
<tr><td class="mono">iptables-save > /etc/iptables/rules.v4</td><td class="desc">Save rules</td></tr>
<tr><td class="mono">iptables-restore < /etc/iptables/rules.v4</td><td class="desc">Restore rules</td></tr>
</tbody>
</table>
</div>
</div>

Chains: `INPUT` (inbound to host) · `OUTPUT` (outbound from host) · `FORWARD` (transit) · `PREROUTING` · `POSTROUTING`  
Tables: `filter` (default) · `nat` · `mangle` · `raw`
