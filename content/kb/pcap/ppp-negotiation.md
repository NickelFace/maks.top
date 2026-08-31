---
title: "PPP negotiation"
description: "CDP
CDPCP
CHAP
ICMP
IP
IPCP
LCP
PPP"
icon: "📡"
tags: ["CDP", "CDPCP", "CHAP", "ICMP", "IP", "IPCP", "LCP", "PPP"]
date: 2026-08-31
capture_file: "PPP_negotiation.cap"
packets: "63"
duration: "67s"
filesize: "4.6 KB"
---

<div class="intro-card">
CDP
CDPCP
CHAP
ICMP
IP
IPCP
LCP
PPP
</div>

| | |
|---|---|
| File | `PPP_negotiation.cap` |
| Packets | 63 |
| Duration | 67s |
| Size | 4.6 KB |
| Protocols | CDP · CDPCP · CHAP · ICMP · IP · IPCP · LCP · PPP |

[Download `PPP_negotiation.cap`](/pcap/PPP_negotiation.cap)

Open it with `wireshark PPP_negotiation.cap` or inspect from the shell:

```bash
tshark -r PPP_negotiation.cap -c 20
tcpdump -r PPP_negotiation.cap -nn -v
```
