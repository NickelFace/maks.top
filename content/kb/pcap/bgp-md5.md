---
title: "BGP MD5"
description: "An EBGP with TCP MD5 authentication enabled"
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "BGP_MD5.cap"
packets: "16"
duration: "61s"
filesize: "1.7 KB"
---

<div class="intro-card">
An EBGP with TCP MD5 authentication enabled
</div>

| | |
|---|---|
| File | `BGP_MD5.cap` |
| Packets | 16 |
| Duration | 61s |
| Size | 1.7 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `BGP_MD5.cap`](/pcap/BGP_MD5.cap)

Open it with `wireshark BGP_MD5.cap` or inspect from the shell:

```bash
tshark -r BGP_MD5.cap -c 20
tcpdump -r BGP_MD5.cap -nn -v
```
