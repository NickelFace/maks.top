---
title: "PIMv2 hellos"
description: "Routers 1 and 2 exchange PIMv2 hello packets."
icon: "📡"
tags: ["Ethernet", "IP", "PIM"]
date: 2026-08-31
capture_file: "PIMv2_hellos.cap"
packets: "6"
duration: "63s"
filesize: "528 bytes"
---

<div class="intro-card">
Routers 1 and 2 exchange PIMv2 hello packets.
</div>

| | |
|---|---|
| File | `PIMv2_hellos.cap` |
| Packets | 6 |
| Duration | 63s |
| Size | 528 bytes |
| Protocols | Ethernet · IP · PIM |

[Download `PIMv2_hellos.cap`](/pcap/PIMv2_hellos.cap)

Open it with `wireshark PIMv2_hellos.cap` or inspect from the shell:

```bash
tshark -r PIMv2_hellos.cap -c 20
tcpdump -r PIMv2_hellos.cap -nn -v
```
