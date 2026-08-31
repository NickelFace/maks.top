---
title: "MGRE ICMP"
description: "R2 begins sending ICMP traffic to R4, but it currently only has a GRE tunnel open to R1. The first two ICMP requests (packets #1 and #4) are routed through R1 while R2 sends an NHRP request to R1 for R4's spoke address. Once a GRE tunnel is dynamically built between spoke routers R2 and R4, R2 begins routing the ICMP traffic directly to R4. Capture perspective from the R2-R5 link."
icon: "📡"
tags: ["Ethernet", "GRE", "IP", "NHRP"]
date: 2026-08-31
capture_file: "mGRE_ICMP.cap"
packets: "24"
duration: "10s"
filesize: "3.7 KB"
---

<div class="intro-card">
R2 begins sending ICMP traffic to R4, but it currently only has a GRE tunnel open to R1. The first two ICMP requests (packets #1 and #4) are routed through R1 while R2 sends an NHRP request to R1 for R4's spoke address. Once a GRE tunnel is dynamically built between spoke routers R2 and R4, R2 begins routing the ICMP traffic directly to R4. Capture perspective from the R2-R5 link.
</div>

| | |
|---|---|
| File | `mGRE_ICMP.cap` |
| Packets | 24 |
| Duration | 10s |
| Size | 3.7 KB |
| Protocols | Ethernet · GRE · IP · NHRP |

[Download `mGRE_ICMP.cap`](/pcap/mGRE_ICMP.cap)

Open it with `wireshark mGRE_ICMP.cap` or inspect from the shell:

```bash
tshark -r mGRE_ICMP.cap -c 20
tcpdump -r mGRE_ICMP.cap -nn -v
```
