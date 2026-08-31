---
title: "MPLS encapsulation"
description: "Capture taken from the PE1-P1 link. ICMP traffic between CE1 and CE2 is encapsulated outbound with MPLS label 18. Note that returning traffic is not labeled, due to penultimate hop popping (PHP)."
icon: "📡"
tags: ["Ethernet", "ICMP", "IP", "MPLS"]
date: 2026-08-31
capture_file: "MPLS_encapsulation.cap"
packets: "10"
duration: "n/a"
filesize: "1.3 KB"
---

<div class="intro-card">
Capture taken from the PE1-P1 link. ICMP traffic between CE1 and CE2 is encapsulated outbound with MPLS label 18. Note that returning traffic is not labeled, due to penultimate hop popping (PHP).
</div>

| | |
|---|---|
| File | `MPLS_encapsulation.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.3 KB |
| Protocols | Ethernet · ICMP · IP · MPLS |

[Download `MPLS_encapsulation.cap`](/pcap/MPLS_encapsulation.cap)

Open it with `wireshark MPLS_encapsulation.cap` or inspect from the shell:

```bash
tshark -r MPLS_encapsulation.cap -c 20
tcpdump -r MPLS_encapsulation.cap -nn -v
```
