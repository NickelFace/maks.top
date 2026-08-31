---
title: "Path MTU discovery"
description: "Tracepath is used to determine the MTU of the path between hosts 192.168.0.2 and .1.2. Packet #6 contains an ICMP \"fragmentation needed\" message, indicating the MTU for that hop is 1400 bytes."
icon: "📡"
tags: ["Ethernet", "ICMP", "IP", "UDP"]
date: 2026-08-31
capture_file: "path_MTU_discovery.cap"
packets: "8"
duration: "n/a"
filesize: "6.2 KB"
---

<div class="intro-card">
Tracepath is used to determine the MTU of the path between hosts 192.168.0.2 and .1.2. Packet #6 contains an ICMP "fragmentation needed" message, indicating the MTU for that hop is 1400 bytes.
</div>

| | |
|---|---|
| File | `path_MTU_discovery.cap` |
| Packets | 8 |
| Duration | n/a |
| Size | 6.2 KB |
| Protocols | Ethernet · ICMP · IP · UDP |

[Download `path_MTU_discovery.cap`](/pcap/path_MTU_discovery.cap)

Open it with `wireshark path_MTU_discovery.cap` or inspect from the shell:

```bash
tshark -r path_MTU_discovery.cap -c 20
tcpdump -r path_MTU_discovery.cap -nn -v
```
