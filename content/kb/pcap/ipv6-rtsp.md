---
title: "IPv6 RTSP"
description: "This capture contains IPv6_RTSP packets. Accessed IPv6 enabled RTSP server using 6in4 tunnel."
icon: "📡"
tags: ["IP", "UDP"]
date: 2026-08-31
capture_file: "IPv6_RTSP.cap"
packets: "17"
duration: "3s"
filesize: "15.5 KB"
---

<div class="intro-card">
This capture contains IPv6_RTSP packets. Accessed IPv6 enabled RTSP server using 6in4 tunnel.
</div>

| | |
|---|---|
| File | `IPv6_RTSP.cap` |
| Packets | 17 |
| Duration | 3s |
| Size | 15.5 KB |
| Protocols | IP · UDP |

[Download `IPv6_RTSP.cap`](/pcap/IPv6_RTSP.cap)

Open it with `wireshark IPv6_RTSP.cap` or inspect from the shell:

```bash
tshark -r IPv6_RTSP.cap -c 20
tcpdump -r IPv6_RTSP.cap -nn -v
```
