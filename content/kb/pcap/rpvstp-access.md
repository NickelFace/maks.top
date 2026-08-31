---
title: "Rpvstp access"
description: "Rapid per-VLAN spanning tree capture of an access port (without portfast), configured in VLAN 5."
icon: "📡"
tags: ["DNS", "Ethernet", "IP", "LLC", "LOOP", "STP", "UDP"]
date: 2026-08-31
capture_file: "rpvstp-access.pcap.cap"
packets: "49"
duration: "77s"
filesize: "3.7 KB"
---

<div class="intro-card">
Rapid per-VLAN spanning tree capture of an access port (without portfast), configured in VLAN 5.
</div>

| | |
|---|---|
| File | `rpvstp-access.pcap.cap` |
| Packets | 49 |
| Duration | 77s |
| Size | 3.7 KB |
| Protocols | DNS · Ethernet · IP · LLC · LOOP · STP · UDP |

[Download `rpvstp-access.pcap.cap`](/pcap/rpvstp-access.pcap.cap)

Open it with `wireshark rpvstp-access.pcap.cap` or inspect from the shell:

```bash
tshark -r rpvstp-access.pcap.cap -c 20
tcpdump -r rpvstp-access.pcap.cap -nn -v
```
