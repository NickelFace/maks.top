---
title: "ARP pcap"
description: "ARP Request reply packet captures"
icon: "📡"
tags: ["ARP", "CDP", "LLC", "LOOP"]
date: 2026-08-31
capture_file: "arp_pcap.pcapng.cap"
packets: "16"
duration: "50s"
filesize: "2.2 KB"
---

<div class="intro-card">
ARP Request reply packet captures
</div>

| | |
|---|---|
| File | `arp_pcap.pcapng.cap` |
| Packets | 16 |
| Duration | 50s |
| Size | 2.2 KB |
| Protocols | ARP · CDP · LLC · LOOP |

[Download `arp_pcap.pcapng.cap`](/pcap/arp_pcap.pcapng.cap)

Open it with `wireshark arp_pcap.pcapng.cap` or inspect from the shell:

```bash
tshark -r arp_pcap.pcapng.cap -c 20
tcpdump -r arp_pcap.pcapng.cap -nn -v
```
