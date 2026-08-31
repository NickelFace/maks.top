---
title: "GRE and 4over6"
description: "Ipv4-over-IPv6, GRE protocol."
icon: "📡"
tags: ["GRE", "IP", "IPv6", "VLAN"]
date: 2026-08-31
capture_file: "gre_and_4over6.cap"
packets: "2"
duration: "n/a"
filesize: "521 bytes"
---

<div class="intro-card">
Ipv4-over-IPv6, GRE protocol.
</div>

| | |
|---|---|
| File | `gre_and_4over6.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 521 bytes |
| Protocols | GRE · IP · IPv6 · VLAN |

[Download `gre_and_4over6.cap`](/pcap/gre_and_4over6.cap)

Open it with `wireshark gre_and_4over6.cap` or inspect from the shell:

```bash
tshark -r gre_and_4over6.cap -c 20
tcpdump -r gre_and_4over6.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
