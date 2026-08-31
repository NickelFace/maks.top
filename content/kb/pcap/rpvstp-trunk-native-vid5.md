---
title: "Rpvstp trunk native vid5"
description: "Rapid per-VLAN spanning tree capture of a trunk port, configured with native VLAN 5, VLAN 1 is also active over the trunk."
icon: "📡"
tags: ["DTP", "Ethernet", "LLC", "LOOP", "STP", "VLAN", "VTP"]
date: 2026-08-31
capture_file: "rpvstp-trunk-native-vid5.pcap.cap"
packets: "22"
duration: "11s"
filesize: "1.8 KB"
---

<div class="intro-card">
Rapid per-VLAN spanning tree capture of a trunk port, configured with native VLAN 5, VLAN 1 is also active over the trunk.
</div>

| | |
|---|---|
| File | `rpvstp-trunk-native-vid5.pcap.cap` |
| Packets | 22 |
| Duration | 11s |
| Size | 1.8 KB |
| Protocols | DTP · Ethernet · LLC · LOOP · STP · VLAN · VTP |

[Download `rpvstp-trunk-native-vid5.pcap.cap`](/pcap/rpvstp-trunk-native-vid5.pcap.cap)

Open it with `wireshark rpvstp-trunk-native-vid5.pcap.cap` or inspect from the shell:

```bash
tshark -r rpvstp-trunk-native-vid5.pcap.cap -c 20
tcpdump -r rpvstp-trunk-native-vid5.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
