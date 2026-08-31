---
title: "OSPF LSA types"
description: "Capture of adjacency formation between OSPF routers 4 and 5 in area 20. Packet #12 contains LSAs of types 1, 2, 3, 4, and 5."
icon: "📡"
tags: ["Ethernet", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_LSA_types.cap"
packets: "30"
duration: "63s"
filesize: "4.0 KB"
---

<div class="intro-card">
Capture of adjacency formation between OSPF routers 4 and 5 in area 20. Packet #12 contains LSAs of types 1, 2, 3, 4, and 5.
</div>

| | |
|---|---|
| File | `OSPF_LSA_types.cap` |
| Packets | 30 |
| Duration | 63s |
| Size | 4.0 KB |
| Protocols | Ethernet · IP · OSPF |

[Download `OSPF_LSA_types.cap`](/pcap/OSPF_LSA_types.cap)

Open it with `wireshark OSPF_LSA_types.cap` or inspect from the shell:

```bash
tshark -r OSPF_LSA_types.cap -c 20
tcpdump -r OSPF_LSA_types.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
