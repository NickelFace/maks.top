---
title: "RIPv2"
description: "A RIPv2 router periodically flooding its database. Capture perspective from R1's 10.0.0.1 interface."
icon: "📡"
tags: ["Ethernet", "IP", "RIP", "UDP"]
date: 2026-08-31
capture_file: "RIPv2.cap"
packets: "12"
duration: "141s"
filesize: "1.7 KB"
---

<div class="intro-card">
A RIPv2 router periodically flooding its database. Capture perspective from R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `RIPv2.cap` |
| Packets | 12 |
| Duration | 141s |
| Size | 1.7 KB |
| Protocols | Ethernet · IP · RIP · UDP |

[Download `RIPv2.cap`](/pcap/RIPv2.cap)

Open it with `wireshark RIPv2.cap` or inspect from the shell:

```bash
tshark -r RIPv2.cap -c 20
tcpdump -r RIPv2.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
