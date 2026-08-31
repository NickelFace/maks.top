---
title: "BGP med"
description: "BGP metric value set to 242( just a random value), used as a suggestion for peer in neighboring AS to influence incoming traffic."
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "bgp med.pcapng.cap"
packets: "1"
duration: "n/a"
filesize: "364 bytes"
---

<div class="intro-card">
BGP metric value set to 242( just a random value), used as a suggestion for peer in neighboring AS to influence incoming traffic.
</div>

| | |
|---|---|
| File | `bgp med.pcapng.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 364 bytes |
| Protocols | BGP · IP · TCP |

[Download `bgp med.pcapng.cap`](/pcap/bgp med.pcapng.cap)

Open it with `wireshark bgp med.pcapng.cap` or inspect from the shell:

```bash
tshark -r bgp med.pcapng.cap -c 20
tcpdump -r bgp med.pcapng.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
