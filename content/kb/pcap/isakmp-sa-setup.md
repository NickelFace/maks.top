---
title: "ISAKMP sa setup"
description: "An ISAKMP session is established prior to setting up an IPsec tunnel. Phase one occurs in main mode, and phase two occurs in quick mode."
icon: "📡"
tags: ["Ethernet", "IP", "ISAKMP", "UDP"]
date: 2026-08-31
capture_file: "ISAKMP_sa_setup.cap"
packets: "9"
duration: "n/a"
filesize: "2.0 KB"
---

<div class="intro-card">
An ISAKMP session is established prior to setting up an IPsec tunnel. Phase one occurs in main mode, and phase two occurs in quick mode.
</div>

| | |
|---|---|
| File | `ISAKMP_sa_setup.cap` |
| Packets | 9 |
| Duration | n/a |
| Size | 2.0 KB |
| Protocols | Ethernet · IP · ISAKMP · UDP |

[Download `ISAKMP_sa_setup.cap`](/pcap/ISAKMP_sa_setup.cap)

Open it with `wireshark ISAKMP_sa_setup.cap` or inspect from the shell:

```bash
tshark -r ISAKMP_sa_setup.cap -c 20
tcpdump -r ISAKMP_sa_setup.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
