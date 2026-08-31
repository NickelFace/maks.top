---
title: "Frame Relay over MPLS"
description: "ICMP on a Frame-relay over MPLS link. If Wireshark doesn't understand it's FR, right click on a packet, select \"Decode as\" from the menu and select \"Frame Relay DLCI PW\" on the \"MPLS\" tab."
icon: "📡"
tags: ["Ethernet", "MPLS"]
date: 2026-08-31
capture_file: "Frame-Relay over MPLS.pcap.cap"
packets: "10"
duration: "1s"
filesize: "1.4 KB"
---

<div class="intro-card">
ICMP on a Frame-relay over MPLS link. If Wireshark doesn't understand it's FR, right click on a packet, select "Decode as" from the menu and select "Frame Relay DLCI PW" on the "MPLS" tab.
</div>

| | |
|---|---|
| File | `Frame-Relay over MPLS.pcap.cap` |
| Packets | 10 |
| Duration | 1s |
| Size | 1.4 KB |
| Protocols | Ethernet · MPLS |

[Download `Frame-Relay over MPLS.pcap.cap`](/pcap/Frame-Relay over MPLS.pcap.cap)

Open it with `wireshark Frame-Relay over MPLS.pcap.cap` or inspect from the shell:

```bash
tshark -r Frame-Relay over MPLS.pcap.cap -c 20
tcpdump -r Frame-Relay over MPLS.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
