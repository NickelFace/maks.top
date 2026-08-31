---
title: "NHRP registration"
description: "R2 registers a multipoint GRE tunnel with R1. Capture perspective from the R1-R5 link."
icon: "📡"
tags: ["Ethernet", "GRE", "IP", "NHRP"]
date: 2026-08-31
capture_file: "NHRP_registration.cap"
packets: "4"
duration: "n/a"
filesize: "648 bytes"
---

<div class="intro-card">
R2 registers a multipoint GRE tunnel with R1. Capture perspective from the R1-R5 link.
</div>

| | |
|---|---|
| File | `NHRP_registration.cap` |
| Packets | 4 |
| Duration | n/a |
| Size | 648 bytes |
| Protocols | Ethernet · GRE · IP · NHRP |

[Download `NHRP_registration.cap`](/pcap/NHRP_registration.cap)

Open it with `wireshark NHRP_registration.cap` or inspect from the shell:

```bash
tshark -r NHRP_registration.cap -c 20
tcpdump -r NHRP_registration.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
