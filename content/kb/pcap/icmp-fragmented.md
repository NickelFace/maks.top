---
title: "ICMP fragmented"
description: "pinged google.com with -l option in windows which allows us to set the data size of the packet.Data size of 15000 bytes has been chosen and we can see that it is fragmented through the network into a maximum data size 1480 bytes in each packet.We can also see offset and identification field set in the ip header."
icon: "📡"
tags: ["ICMP", "IP"]
date: 2026-08-31
capture_file: "icmp fragmented.cap"
packets: "77"
duration: "11s"
filesize: "106.4 KB"
---

<div class="intro-card">
pinged google.com with -l option in windows which allows us to set the data size of the packet.Data size of 15000 bytes has been chosen and we can see that it is fragmented through the network into a maximum data size 1480 bytes in each packet.We can also see offset and identification field set in the ip header.
</div>

| | |
|---|---|
| File | `icmp fragmented.cap` |
| Packets | 77 |
| Duration | 11s |
| Size | 106.4 KB |
| Protocols | ICMP · IP |

[Download `icmp fragmented.cap`](/pcap/icmp fragmented.cap)

Open it with `wireshark icmp fragmented.cap` or inspect from the shell:

```bash
tshark -r icmp fragmented.cap -c 20
tcpdump -r icmp fragmented.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
