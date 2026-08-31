---
title: "Rpvstp trunk native vid1"
description: "Rapid per-VLAN spanning tree capture of a trunk port, configured with native VLAN 1 (default), VLAN 5 is also active over the trunk."
icon: "📡"
tags: ["DTP", "Ethernet", "LLC", "LOOP", "STP", "VLAN", "VTP"]
date: 2026-08-31
capture_file: "rpvstp-trunk-native-vid1.pcap.cap"
packets: "81"
duration: "45s"
filesize: "6.4 KB"
---

<div class="intro-card">
Rapid per-VLAN spanning tree capture of a trunk port, configured with native VLAN 1 (default), VLAN 5 is also active over the trunk.
</div>

| | |
|---|---|
| File | `rpvstp-trunk-native-vid1.pcap.cap` |
| Packets | 81 |
| Duration | 45s |
| Size | 6.4 KB |
| Protocols | DTP · Ethernet · LLC · LOOP · STP · VLAN · VTP |

[Download `rpvstp-trunk-native-vid1.pcap.cap`](/pcap/rpvstp-trunk-native-vid1.pcap.cap)

Open it with `wireshark rpvstp-trunk-native-vid1.pcap.cap` or inspect from the shell:

```bash
tshark -r rpvstp-trunk-native-vid1.pcap.cap -c 20
tcpdump -r rpvstp-trunk-native-vid1.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
