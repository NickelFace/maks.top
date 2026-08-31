---
title: "ICMP over L2TPv3 Pseudowire"
description: "ICMP pings from a CE to a second CE via a L2TPv3 pseudowire."
icon: "📡"
tags: ["Ethernet", "IP", "L2TP", "LOOP", "OSPF"]
date: 2026-08-31
capture_file: "ICMP_over_L2TPv3_Pseudowire.pcap.cap"
packets: "38"
duration: "30s"
filesize: "5.3 KB"
---

<div class="intro-card">
ICMP pings from a CE to a second CE via a L2TPv3 pseudowire.
</div>

| | |
|---|---|
| File | `ICMP_over_L2TPv3_Pseudowire.pcap.cap` |
| Packets | 38 |
| Duration | 30s |
| Size | 5.3 KB |
| Protocols | Ethernet · IP · L2TP · LOOP · OSPF |

[Download `ICMP_over_L2TPv3_Pseudowire.pcap.cap`](/pcap/ICMP_over_L2TPv3_Pseudowire.pcap.cap)

Open it with `wireshark ICMP_over_L2TPv3_Pseudowire.pcap.cap` or inspect from the shell:

```bash
tshark -r ICMP_over_L2TPv3_Pseudowire.pcap.cap -c 20
tcpdump -r ICMP_over_L2TPv3_Pseudowire.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
