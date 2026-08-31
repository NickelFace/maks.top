---
title: "EIGRP subnet up"
description: "R4's 192.168.4.0/24 subnet is brought online. R1 receives updates from both R2 and R3 (only R2's update is shown in the capture). The poison-reverse in packet #9 informs R2 not to use R1 as a path to 192.168.4.0/24. The capture perspective is from R1's 10.0.0.1 interface."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IP"]
date: 2026-08-31
capture_file: "EIGRP_subnet_up.cap"
packets: "15"
duration: "18s"
filesize: "1.3 KB"
---

<div class="intro-card">
R4's 192.168.4.0/24 subnet is brought online. R1 receives updates from both R2 and R3 (only R2's update is shown in the capture). The poison-reverse in packet #9 informs R2 not to use R1 as a path to 192.168.4.0/24. The capture perspective is from R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `EIGRP_subnet_up.cap` |
| Packets | 15 |
| Duration | 18s |
| Size | 1.3 KB |
| Protocols | EIGRP · Ethernet · IP |

[Download `EIGRP_subnet_up.cap`](/pcap/EIGRP_subnet_up.cap)

Open it with `wireshark EIGRP_subnet_up.cap` or inspect from the shell:

```bash
tshark -r EIGRP_subnet_up.cap -c 20
tcpdump -r EIGRP_subnet_up.cap -nn -v
```
