---
title: "ICMPv6 echos"
description: "Five ICMPv6 echo requests and their subsequent replies between routers 1 and 2."
icon: "📡"
tags: ["Ethernet", "ICMPv6", "IPv6"]
date: 2026-08-31
capture_file: "ICMPv6_echos.cap"
packets: "10"
duration: "n/a"
filesize: "1.3 KB"
---

<div class="intro-card">
Five ICMPv6 echo requests and their subsequent replies between routers 1 and 2.
</div>

| | |
|---|---|
| File | `ICMPv6_echos.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.3 KB |
| Protocols | Ethernet · ICMPv6 · IPv6 |

[Download `ICMPv6_echos.cap`](/pcap/ICMPv6_echos.cap)

Open it with `wireshark ICMPv6_echos.cap` or inspect from the shell:

```bash
tshark -r ICMPv6_echos.cap -c 20
tcpdump -r ICMPv6_echos.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
