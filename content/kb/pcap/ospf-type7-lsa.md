---
title: "OSPF type7 LSA"
description: "Area 10 is configured as a not-so-stubby area (NSSA). The capture records the adjacency formed between routers 2 and 3. The link state update in packet #11 includes several type 7 LSAs from R2. Capture perspective from R3's 10.0.10.1 interface."
icon: "📡"
tags: ["Ethernet", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_type7_LSA.cap"
packets: "25"
duration: "32s"
filesize: "3.6 KB"
---

<div class="intro-card">
Area 10 is configured as a not-so-stubby area (NSSA). The capture records the adjacency formed between routers 2 and 3. The link state update in packet #11 includes several type 7 LSAs from R2. Capture perspective from R3's 10.0.10.1 interface.
</div>

| | |
|---|---|
| File | `OSPF_type7_LSA.cap` |
| Packets | 25 |
| Duration | 32s |
| Size | 3.6 KB |
| Protocols | Ethernet · IP · OSPF |

[Download `OSPF_type7_LSA.cap`](/pcap/OSPF_type7_LSA.cap)

Open it with `wireshark OSPF_type7_LSA.cap` or inspect from the shell:

```bash
tshark -r OSPF_type7_LSA.cap -c 20
tcpdump -r OSPF_type7_LSA.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
