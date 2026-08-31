---
title: "BGP redist"
description: "The OSPF metric is preserved and propagated within the MPLS cloud by the MP-BGP MED attribute."
icon: "📡"
tags: ["BGP", "HDLC", "IP", "MPLS", "TCP"]
date: 2026-08-31
capture_file: "BGP_redist.cap"
packets: "2"
duration: "n/a"
filesize: "378 bytes"
---

<div class="intro-card">
The OSPF metric is preserved and propagated within the MPLS cloud by the MP-BGP MED attribute.
</div>

| | |
|---|---|
| File | `BGP_redist.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 378 bytes |
| Protocols | BGP · HDLC · IP · MPLS · TCP |

[Download `BGP_redist.cap`](/pcap/BGP_redist.cap)

Open it with `wireshark BGP_redist.cap` or inspect from the shell:

```bash
tshark -r BGP_redist.cap -c 20
tcpdump -r BGP_redist.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
