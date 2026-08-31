---
title: "FCOE Flogi FDisc Negotiation"
description: "FCoE negotiation between Client and Fabric"
icon: "📡"
tags: ["FC", "FCCT", "FCDNS", "FCELS", "FCOE", "FIP"]
date: 2026-08-31
capture_file: "FCoE_Flogi_FDisc_Negotiation.cap"
packets: "41"
duration: "17s"
filesize: "6.7 KB"
---

<div class="intro-card">
FCoE negotiation between Client and Fabric
</div>

| | |
|---|---|
| File | `FCoE_Flogi_FDisc_Negotiation.cap` |
| Packets | 41 |
| Duration | 17s |
| Size | 6.7 KB |
| Protocols | FC · FCCT · FCDNS · FCELS · FCOE · FIP |

[Download `FCoE_Flogi_FDisc_Negotiation.cap`](/pcap/FCoE_Flogi_FDisc_Negotiation.cap)

Open it with `wireshark FCoE_Flogi_FDisc_Negotiation.cap` or inspect from the shell:

```bash
tshark -r FCoE_Flogi_FDisc_Negotiation.cap -c 20
tcpdump -r FCoE_Flogi_FDisc_Negotiation.cap -nn -v
```
