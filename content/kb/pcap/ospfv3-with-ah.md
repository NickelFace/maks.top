---
title: "OSPFv3 with AH"
description: "The adjacency between R1 and R2 in the 2001:db8:0:12::/64 subnet is configured with IPsec AH authentication. Note the inclusion of an IPsec AH header immediately following the IPv6 header of each OSPF packet."
icon: "📡"
tags: ["Ethernet", "IPv6", "OSPF"]
date: 2026-08-31
capture_file: "OSPFv3_with_AH.cap"
packets: "61"
duration: "170s"
filesize: "10.7 KB"
---

<div class="intro-card">
The adjacency between R1 and R2 in the 2001:db8:0:12::/64 subnet is configured with IPsec AH authentication. Note the inclusion of an IPsec AH header immediately following the IPv6 header of each OSPF packet.
</div>

| | |
|---|---|
| File | `OSPFv3_with_AH.cap` |
| Packets | 61 |
| Duration | 170s |
| Size | 10.7 KB |
| Protocols | Ethernet · IPv6 · OSPF |

[Download `OSPFv3_with_AH.cap`](/pcap/OSPFv3_with_AH.cap)

Open it with `wireshark OSPFv3_with_AH.cap` or inspect from the shell:

```bash
tshark -r OSPFv3_with_AH.cap -c 20
tcpdump -r OSPFv3_with_AH.cap -nn -v
```
