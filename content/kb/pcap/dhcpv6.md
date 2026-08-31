---
title: "DHCPV6"
description: "sample dhcpv6 client server transaction solicit(fresh lease)/advertise/request/reply/release/reply."
icon: "📡"
tags: ["DHCPV6", "ICMPv6", "IPv6", "UDP"]
date: 2026-08-31
capture_file: "DHCPv6.cap"
packets: "12"
duration: "13s"
filesize: "1.6 KB"
---

<div class="intro-card">
sample dhcpv6 client server transaction solicit(fresh lease)/advertise/request/reply/release/reply.
</div>

| | |
|---|---|
| File | `DHCPv6.cap` |
| Packets | 12 |
| Duration | 13s |
| Size | 1.6 KB |
| Protocols | DHCPV6 · ICMPv6 · IPv6 · UDP |

[Download `DHCPv6.cap`](/pcap/DHCPv6.cap)

Open it with `wireshark DHCPv6.cap` or inspect from the shell:

```bash
tshark -r DHCPv6.cap -c 20
tcpdump -r DHCPv6.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
