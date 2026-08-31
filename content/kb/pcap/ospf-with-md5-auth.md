---
title: "OSPF with MD5 auth"
description: "An OSPF adjacency is formed between two routers configured to use MD5 authentication."
icon: "📡"
tags: ["Ethernet", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_with_MD5_auth.cap"
packets: "34"
duration: "63s"
filesize: "4.6 KB"
---

<div class="intro-card">
An OSPF adjacency is formed between two routers configured to use MD5 authentication.
</div>

| | |
|---|---|
| File | `OSPF_with_MD5_auth.cap` |
| Packets | 34 |
| Duration | 63s |
| Size | 4.6 KB |
| Protocols | Ethernet · IP · OSPF |

[Download `OSPF_with_MD5_auth.cap`](/pcap/OSPF_with_MD5_auth.cap)

Open it with `wireshark OSPF_with_MD5_auth.cap` or inspect from the shell:

```bash
tshark -r OSPF_with_MD5_auth.cap -c 20
tcpdump -r OSPF_with_MD5_auth.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
