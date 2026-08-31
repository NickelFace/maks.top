---
title: "ARP l2tpv3"
description: "ARP request packet encapsulated in L2TPv3 over Ethernet Pseudowire."
icon: "📡"
tags: ["IP", "L2TP", "L2TP.L2_SPEC_DEF", "UDP"]
date: 2026-08-31
capture_file: "arp_l2tpv3.cap"
packets: "3"
duration: "2s"
filesize: "414 bytes"
---

<div class="intro-card">
ARP request packet encapsulated in L2TPv3 over Ethernet Pseudowire.
</div>

| | |
|---|---|
| File | `arp_l2tpv3.cap` |
| Packets | 3 |
| Duration | 2s |
| Size | 414 bytes |
| Protocols | IP · L2TP · L2TP.L2_SPEC_DEF · UDP |

[Download `arp_l2tpv3.cap`](/pcap/arp_l2tpv3.cap)

Open it with `wireshark arp_l2tpv3.cap` or inspect from the shell:

```bash
tshark -r arp_l2tpv3.cap -c 20
tcpdump -r arp_l2tpv3.cap -nn -v
```
