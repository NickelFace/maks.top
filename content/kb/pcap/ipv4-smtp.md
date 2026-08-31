---
title: "Ipv4 SMTP"
description: "SMTP over IPv4 to Google - GMAIL."
icon: "📡"
tags: ["IP", "SMTP", "TCP"]
date: 2026-08-31
capture_file: "ipv4-smtp.cap"
packets: "15"
duration: "9s"
filesize: "1.5 KB"
---

<div class="intro-card">
SMTP over IPv4 to Google - GMAIL.
</div>

| | |
|---|---|
| File | `ipv4-smtp.cap` |
| Packets | 15 |
| Duration | 9s |
| Size | 1.5 KB |
| Protocols | IP · SMTP · TCP |

[Download `ipv4-smtp.cap`](/pcap/ipv4-smtp.cap)

Open it with `wireshark ipv4-smtp.cap` or inspect from the shell:

```bash
tshark -r ipv4-smtp.cap -c 20
tcpdump -r ipv4-smtp.cap -nn -v
```
