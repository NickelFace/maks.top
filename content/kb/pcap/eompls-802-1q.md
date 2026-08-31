---
title: "EoMPLS 802.1q"
description: "ICMP over EoMPLS with 802.1q tagging"
icon: "📡"
tags: ["Ethernet", "MPLS"]
date: 2026-08-31
capture_file: "EoMPLS_802.1q.pcap.cap"
packets: "10"
duration: "1s"
filesize: "1.6 KB"
---

<div class="intro-card">
ICMP over EoMPLS with 802.1q tagging
</div>

| | |
|---|---|
| File | `EoMPLS_802.1q.pcap.cap` |
| Packets | 10 |
| Duration | 1s |
| Size | 1.6 KB |
| Protocols | Ethernet · MPLS |

[Download `EoMPLS_802.1q.pcap.cap`](/pcap/EoMPLS_802.1q.pcap.cap)

Open it with `wireshark EoMPLS_802.1q.pcap.cap` or inspect from the shell:

```bash
tshark -r EoMPLS_802.1q.pcap.cap -c 20
tcpdump -r EoMPLS_802.1q.pcap.cap -nn -v
```
