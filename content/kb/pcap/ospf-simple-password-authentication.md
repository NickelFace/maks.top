---
title: "OSPF simple password authentication"
description: "Simple password authentication in ospf in which we can see password in clear text."
icon: "📡"
tags: ["IP", "OSPF"]
date: 2026-08-31
capture_file: "ospf simple password authentication.cap"
packets: "7"
duration: "60s"
filesize: "766 bytes"
---

<div class="intro-card">
Simple password authentication in ospf in which we can see password in clear text.
</div>

| | |
|---|---|
| File | `ospf simple password authentication.cap` |
| Packets | 7 |
| Duration | 60s |
| Size | 766 bytes |
| Protocols | IP · OSPF |

[Download `ospf simple password authentication.cap`](/pcap/ospf simple password authentication.cap)

Open it with `wireshark ospf simple password authentication.cap` or inspect from the shell:

```bash
tshark -r ospf simple password authentication.cap -c 20
tcpdump -r ospf simple password authentication.cap -nn -v
```
