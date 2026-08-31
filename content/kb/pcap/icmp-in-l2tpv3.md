---
title: "ICMP in l2tpv3"
description: "This capture contains icmp packet transported in l2tpv3."
icon: "📡"
tags: ["ARP", "IP", "L2TP", "L2TP.L2_SPEC_DEF", "UDP"]
date: 2026-08-31
capture_file: "icmp_in_l2tpv3.cap"
packets: "45"
duration: "43s"
filesize: "7.1 KB"
---

<div class="intro-card">
This capture contains icmp packet transported in l2tpv3.
</div>

| | |
|---|---|
| File | `icmp_in_l2tpv3.cap` |
| Packets | 45 |
| Duration | 43s |
| Size | 7.1 KB |
| Protocols | ARP · IP · L2TP · L2TP.L2_SPEC_DEF · UDP |

[Download `icmp_in_l2tpv3.cap`](/pcap/icmp_in_l2tpv3.cap)

Open it with `wireshark icmp_in_l2tpv3.cap` or inspect from the shell:

```bash
tshark -r icmp_in_l2tpv3.cap -c 20
tcpdump -r icmp_in_l2tpv3.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
