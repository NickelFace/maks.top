---
title: "PIMv2 bootstrap"
description: "Router 1 is the BSR and routers 2 and 3 are candidate RPs with the default priority of 0. R1 collects the RP advertisement unicasts from R2 and R3 and combines them in a bootstrap multicast to all PIM routers. Capture perspective is the R1-R3 link."
icon: "📡"
tags: ["Ethernet", "IP", "PIM"]
date: 2026-08-31
capture_file: "PIMv2_bootstrap.cap"
packets: "8"
duration: "184s"
filesize: "712 bytes"
---

<div class="intro-card">
Router 1 is the BSR and routers 2 and 3 are candidate RPs with the default priority of 0. R1 collects the RP advertisement unicasts from R2 and R3 and combines them in a bootstrap multicast to all PIM routers. Capture perspective is the R1-R3 link.
</div>

| | |
|---|---|
| File | `PIMv2_bootstrap.cap` |
| Packets | 8 |
| Duration | 184s |
| Size | 712 bytes |
| Protocols | Ethernet · IP · PIM |

[Download `PIMv2_bootstrap.cap`](/pcap/PIMv2_bootstrap.cap)

Open it with `wireshark PIMv2_bootstrap.cap` or inspect from the shell:

```bash
tshark -r PIMv2_bootstrap.cap -c 20
tcpdump -r PIMv2_bootstrap.cap -nn -v
```
