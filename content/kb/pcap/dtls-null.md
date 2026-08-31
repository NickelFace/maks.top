---
title: "Dtls null"
description: "DTLS handshake with one application data packet."
icon: "📡"
tags: ["IP", "UDP"]
date: 2026-08-31
capture_file: "dtls_null.cap"
packets: "7"
duration: "7s"
filesize: "2.2 KB"
---

<div class="intro-card">
DTLS handshake with one application data packet.
</div>

| | |
|---|---|
| File | `dtls_null.cap` |
| Packets | 7 |
| Duration | 7s |
| Size | 2.2 KB |
| Protocols | IP · UDP |

[Download `dtls_null.cap`](/pcap/dtls_null.cap)

Open it with `wireshark dtls_null.cap` or inspect from the shell:

```bash
tshark -r dtls_null.cap -c 20
tcpdump -r dtls_null.cap -nn -v
```
