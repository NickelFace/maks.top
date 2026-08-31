---
title: "SSHv2"
description: "An SSH version 2 session between two routers. All communication is securely encrypted."
icon: "📡"
tags: ["Ethernet", "IP", "SSH", "TCP"]
date: 2026-08-31
capture_file: "SSHv2.cap"
packets: "90"
duration: "7s"
filesize: "11.4 KB"
---

<div class="intro-card">
An SSH version 2 session between two routers. All communication is securely encrypted.
</div>

| | |
|---|---|
| File | `SSHv2.cap` |
| Packets | 90 |
| Duration | 7s |
| Size | 11.4 KB |
| Protocols | Ethernet · IP · SSH · TCP |

[Download `SSHv2.cap`](/pcap/SSHv2.cap)

Open it with `wireshark SSHv2.cap` or inspect from the shell:

```bash
tshark -r SSHv2.cap -c 20
tcpdump -r SSHv2.cap -nn -v
```
