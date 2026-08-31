---
title: "PPTP negotiation"
description: "PPTP negotiation between PNS and PAC
PPTP RFC: https://www.ietf.org/rfc/rfc2637.txt"
icon: "📡"
tags: ["ARP", "GRE", "IP", "IPCP", "LCP", "PAP", "PPP", "PPTP", "TCP"]
date: 2026-08-31
capture_file: "PPTP_negotiation.cap"
packets: "28"
duration: "71s"
filesize: "2.7 KB"
---

<div class="intro-card">
PPTP negotiation between PNS and PAC
PPTP RFC: https://www.ietf.org/rfc/rfc2637.txt
</div>

| | |
|---|---|
| File | `PPTP_negotiation.cap` |
| Packets | 28 |
| Duration | 71s |
| Size | 2.7 KB |
| Protocols | ARP · GRE · IP · IPCP · LCP · PAP · PPP · PPTP · TCP |

[Download `PPTP_negotiation.cap`](/pcap/PPTP_negotiation.cap)

Open it with `wireshark PPTP_negotiation.cap` or inspect from the shell:

```bash
tshark -r PPTP_negotiation.cap -c 20
tcpdump -r PPTP_negotiation.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
