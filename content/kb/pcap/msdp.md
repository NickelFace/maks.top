---
title: "MSDP"
description: "R2 and R3 become MSDP peers and exchange keepalives. A multicast source 172.16.40.10 begins sending traffic to group 239.123.123.123, and R2 begins sending periodic source active messages to R3. Capture perspective is the R2-R3 link."
icon: "📡"
tags: ["Ethernet", "IP", "MSDP", "TCP"]
date: 2026-08-31
capture_file: "MSDP.cap"
packets: "35"
duration: "391s"
filesize: "4.1 KB"
---

<div class="intro-card">
R2 and R3 become MSDP peers and exchange keepalives. A multicast source 172.16.40.10 begins sending traffic to group 239.123.123.123, and R2 begins sending periodic source active messages to R3. Capture perspective is the R2-R3 link.
</div>

| | |
|---|---|
| File | `MSDP.cap` |
| Packets | 35 |
| Duration | 391s |
| Size | 4.1 KB |
| Protocols | Ethernet · IP · MSDP · TCP |

[Download `MSDP.cap`](/pcap/MSDP.cap)

Open it with `wireshark MSDP.cap` or inspect from the shell:

```bash
tshark -r MSDP.cap -c 20
tcpdump -r MSDP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
