---
title: "IPv6 in IP"
description: "ICMPv6 echos across an IPv6-in-IP tunnel."
icon: "📡"
tags: ["Ethernet", "ICMPv6", "IP", "IPv6"]
date: 2026-08-31
capture_file: "IPv6_in_IP.cap"
packets: "10"
duration: "n/a"
filesize: "1.5 KB"
---

<div class="intro-card">
ICMPv6 echos across an IPv6-in-IP tunnel.
</div>

| | |
|---|---|
| File | `IPv6_in_IP.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.5 KB |
| Protocols | Ethernet · ICMPv6 · IP · IPv6 |

[Download `IPv6_in_IP.cap`](/pcap/IPv6_in_IP.cap)

Open it with `wireshark IPv6_in_IP.cap` or inspect from the shell:

```bash
tshark -r IPv6_in_IP.cap -c 20
tcpdump -r IPv6_in_IP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
