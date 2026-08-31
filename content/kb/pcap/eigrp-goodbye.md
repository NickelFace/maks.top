---
title: "EIGRP goodbye"
description: "R2 designates its interface facing R1 as passive. The final hello message from R2 (packet #9) has all its K values set to 255, designating the message as a \"goodbye.\" Capture perspective is from R1's 10.0.0.1 interface."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IP"]
date: 2026-08-31
capture_file: "EIGRP_goodbye.cap"
packets: "15"
duration: "43s"
filesize: "1.3 KB"
---

<div class="intro-card">
R2 designates its interface facing R1 as passive. The final hello message from R2 (packet #9) has all its K values set to 255, designating the message as a "goodbye." Capture perspective is from R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `EIGRP_goodbye.cap` |
| Packets | 15 |
| Duration | 43s |
| Size | 1.3 KB |
| Protocols | EIGRP · Ethernet · IP |

[Download `EIGRP_goodbye.cap`](/pcap/EIGRP_goodbye.cap)

Open it with `wireshark EIGRP_goodbye.cap` or inspect from the shell:

```bash
tshark -r EIGRP_goodbye.cap -c 20
tcpdump -r EIGRP_goodbye.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
