---
title: "Auto RP"
description: "Routers 2 and 3 have been configured as candidate RPs, and multicast RP announcements to 239.0.1.39. Router 1 is the RP. R1 sees the candidate RP announcements from R2 and R3, and designates R3 the RP because it has a higher IP address (3.3.3.3). R1 multicasts the RP mapping to 224.0.1.40. The capture is from the R1-R2 link."
icon: "📡"
tags: ["Auto-RP", "Ethernet", "IP", "UDP"]
date: 2026-08-31
capture_file: "Auto-RP.cap"
packets: "9"
duration: "239s"
filesize: "726 bytes"
---

<div class="intro-card">
Routers 2 and 3 have been configured as candidate RPs, and multicast RP announcements to 239.0.1.39. Router 1 is the RP. R1 sees the candidate RP announcements from R2 and R3, and designates R3 the RP because it has a higher IP address (3.3.3.3). R1 multicasts the RP mapping to 224.0.1.40. The capture is from the R1-R2 link.
</div>

| | |
|---|---|
| File | `Auto-RP.cap` |
| Packets | 9 |
| Duration | 239s |
| Size | 726 bytes |
| Protocols | Auto-RP · Ethernet · IP · UDP |

[Download `Auto-RP.cap`](/pcap/Auto-RP.cap)

Open it with `wireshark Auto-RP.cap` or inspect from the shell:

```bash
tshark -r Auto-RP.cap -c 20
tcpdump -r Auto-RP.cap -nn -v
```
