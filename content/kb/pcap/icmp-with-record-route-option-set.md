---
title: "ICMP with record route option set"
description: "ping packet with record route option set and IP addresses of all outgoing and incoming interfaces along the path.In that we can also see position of current pointer."
icon: "📡"
tags: ["ICMP", "IP"]
date: 2026-08-31
capture_file: "icmp with record route option set.cap"
packets: "10"
duration: "2s"
filesize: "1.2 KB"
---

<div class="intro-card">
ping packet with record route option set and IP addresses of all outgoing and incoming interfaces along the path.In that we can also see position of current pointer.
</div>

| | |
|---|---|
| File | `icmp with record route option set.cap` |
| Packets | 10 |
| Duration | 2s |
| Size | 1.2 KB |
| Protocols | ICMP · IP |

[Download `icmp with record route option set.cap`](/pcap/icmp with record route option set.cap)

Open it with `wireshark icmp with record route option set.cap` or inspect from the shell:

```bash
tshark -r icmp with record route option set.cap -c 20
tcpdump -r icmp with record route option set.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
