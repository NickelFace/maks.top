---
title: "Gmail"
description: "Sample packet capture I created during an attempt to view login details."
icon: "📡"
tags: ["ARP", "DHCPV6", "DNS", "HTTP", "IP", "IPv6", "NBNS", "SSL", "TCP", "TEREDO", "UDP"]
date: 2026-08-31
capture_file: "gmail.pcapng.cap"
packets: "793"
duration: "32s"
filesize: "508.6 KB"
---

<div class="intro-card">
Sample packet capture I created during an attempt to view login details.
</div>

| | |
|---|---|
| File | `gmail.pcapng.cap` |
| Packets | 793 |
| Duration | 32s |
| Size | 508.6 KB |
| Protocols | ARP · DHCPV6 · DNS · HTTP · IP · IPv6 · NBNS · SSL · TCP · TEREDO · UDP |

[Download `gmail.pcapng.cap`](/pcap/gmail.pcapng.cap)

Open it with `wireshark gmail.pcapng.cap` or inspect from the shell:

```bash
tshark -r gmail.pcapng.cap -c 20
tcpdump -r gmail.pcapng.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
