---
title: "OSPF over GRE tunnel"
description: "Configured ospf over GRE tunnel in which packets are double tagged with ip header, useful when there is no direct connection between the 2 routers but still we need to run ospf."
icon: "📡"
tags: ["GRE", "IP", "OSPF"]
date: 2026-08-31
capture_file: "ospf over gre tunnel.cap"
packets: "63"
duration: "241s"
filesize: "8.2 KB"
---

<div class="intro-card">
Configured ospf over GRE tunnel in which packets are double tagged with ip header, useful when there is no direct connection between the 2 routers but still we need to run ospf.
</div>

| | |
|---|---|
| File | `ospf over gre tunnel.cap` |
| Packets | 63 |
| Duration | 241s |
| Size | 8.2 KB |
| Protocols | GRE · IP · OSPF |

[Download `ospf over gre tunnel.cap`](/pcap/ospf over gre tunnel.cap)

Open it with `wireshark ospf over gre tunnel.cap` or inspect from the shell:

```bash
tshark -r ospf over gre tunnel.cap -c 20
tcpdump -r ospf over gre tunnel.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
