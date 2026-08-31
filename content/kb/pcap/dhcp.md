---
title: "DHCP"
description: "R0 is the client and R1 is the DHCP server. Lease time is 1 minute."
icon: "📡"
tags: ["BOOTP", "Ethernet", "IP", "UDP"]
date: 2026-08-31
capture_file: "DHCP.cap"
packets: "12"
duration: "153s"
filesize: "5.8 KB"
---

<div class="intro-card">
R0 is the client and R1 is the DHCP server. Lease time is 1 minute.
</div>

| | |
|---|---|
| File | `DHCP.cap` |
| Packets | 12 |
| Duration | 153s |
| Size | 5.8 KB |
| Protocols | BOOTP · Ethernet · IP · UDP |

[Download `DHCP.cap`](/pcap/DHCP.cap)

Open it with `wireshark DHCP.cap` or inspect from the shell:

```bash
tshark -r DHCP.cap -c 20
tcpdump -r DHCP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
