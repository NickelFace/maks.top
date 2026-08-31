---
title: "MSTP Intra Region BPDUs"
description: "MSTP BPDUs captured on an intra-region root port."
icon: "📡"
tags: ["LLC", "STP", "VLAN"]
date: 2026-08-31
capture_file: "MSTP_Intra-Region_BPDUs.cap"
packets: "10"
duration: "10s"
filesize: "1.7 KB"
---

<div class="intro-card">
MSTP BPDUs captured on an intra-region root port.
</div>

| | |
|---|---|
| File | `MSTP_Intra-Region_BPDUs.cap` |
| Packets | 10 |
| Duration | 10s |
| Size | 1.7 KB |
| Protocols | LLC · STP · VLAN |

[Download `MSTP_Intra-Region_BPDUs.cap`](/pcap/MSTP_Intra-Region_BPDUs.cap)

Open it with `wireshark MSTP_Intra-Region_BPDUs.cap` or inspect from the shell:

```bash
tshark -r MSTP_Intra-Region_BPDUs.cap -c 20
tcpdump -r MSTP_Intra-Region_BPDUs.cap -nn -v
```
