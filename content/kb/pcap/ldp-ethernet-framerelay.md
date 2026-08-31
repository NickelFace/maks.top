---
title: "LDP Ethernet FrameRelay"
description: "LDP with pseudowire FEC elements (Ethernet and Frame-Relay DLCI-to-DLCI)"
icon: "📡"
tags: ["Ethernet", "IP", "LDP", "MPLS", "TCP", "UDP"]
date: 2026-08-31
capture_file: "LDP_Ethernet_FrameRelay.pcap.cap"
packets: "14"
duration: "7s"
filesize: "2.1 KB"
---

<div class="intro-card">
LDP with pseudowire FEC elements (Ethernet and Frame-Relay DLCI-to-DLCI)
</div>

| | |
|---|---|
| File | `LDP_Ethernet_FrameRelay.pcap.cap` |
| Packets | 14 |
| Duration | 7s |
| Size | 2.1 KB |
| Protocols | Ethernet · IP · LDP · MPLS · TCP · UDP |

[Download `LDP_Ethernet_FrameRelay.pcap.cap`](/pcap/LDP_Ethernet_FrameRelay.pcap.cap)

Open it with `wireshark LDP_Ethernet_FrameRelay.pcap.cap` or inspect from the shell:

```bash
tshark -r LDP_Ethernet_FrameRelay.pcap.cap -c 20
tcpdump -r LDP_Ethernet_FrameRelay.pcap.cap -nn -v
```
