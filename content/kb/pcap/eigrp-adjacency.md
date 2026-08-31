---
title: "EIGRP adjacency"
description: "Formation of an EIGRP adjacency between routers R1 and R2. Capture point is R1's 10.0.0.1 interface."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IP"]
date: 2026-08-31
capture_file: "EIGRP_adjacency.cap"
packets: "53"
duration: "104s"
filesize: "5.1 KB"
---

<div class="intro-card">
Formation of an EIGRP adjacency between routers R1 and R2. Capture point is R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `EIGRP_adjacency.cap` |
| Packets | 53 |
| Duration | 104s |
| Size | 5.1 KB |
| Protocols | EIGRP · Ethernet · IP |

[Download `EIGRP_adjacency.cap`](/pcap/EIGRP_adjacency.cap)

Open it with `wireshark EIGRP_adjacency.cap` or inspect from the shell:

```bash
tshark -r EIGRP_adjacency.cap -c 20
tcpdump -r EIGRP_adjacency.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
