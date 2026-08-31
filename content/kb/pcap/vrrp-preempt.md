---
title: "VRRP preempt"
description: "Initially R3 is the master, R2 is backup, and R1 is offline. R1 comes back online with a priority of 200, preempting R3 to become the master router."
icon: "📡"
tags: ["Ethernet", "IP", "VRRP"]
date: 2026-08-31
capture_file: "VRRP_preempt.cap"
packets: "16"
duration: "14s"
filesize: "1.2 KB"
---

<div class="intro-card">
Initially R3 is the master, R2 is backup, and R1 is offline. R1 comes back online with a priority of 200, preempting R3 to become the master router.
</div>

| | |
|---|---|
| File | `VRRP_preempt.cap` |
| Packets | 16 |
| Duration | 14s |
| Size | 1.2 KB |
| Protocols | Ethernet · IP · VRRP |

[Download `VRRP_preempt.cap`](/pcap/VRRP_preempt.cap)

Open it with `wireshark VRRP_preempt.cap` or inspect from the shell:

```bash
tshark -r VRRP_preempt.cap -c 20
tcpdump -r VRRP_preempt.cap -nn -v
```
