---
title: "PPP TCP compression"
description: "A telnet session is established to 191.1.13.3 across a PPP link performing TCP header compression. The user at 191.1.13.1 logs in with the password \"cisco\" and terminates the connection."
icon: "📡"
tags: ["IP", "LCP", "PPP", "TCP"]
date: 2026-08-31
capture_file: "PPP_TCP_compression.cap"
packets: "43"
duration: "3s"
filesize: "1.5 KB"
---

<div class="intro-card">
A telnet session is established to 191.1.13.3 across a PPP link performing TCP header compression. The user at 191.1.13.1 logs in with the password "cisco" and terminates the connection.
</div>

| | |
|---|---|
| File | `PPP_TCP_compression.cap` |
| Packets | 43 |
| Duration | 3s |
| Size | 1.5 KB |
| Protocols | IP · LCP · PPP · TCP |

[Download `PPP_TCP_compression.cap`](/pcap/PPP_TCP_compression.cap)

Open it with `wireshark PPP_TCP_compression.cap` or inspect from the shell:

```bash
tshark -r PPP_TCP_compression.cap -c 20
tcpdump -r PPP_TCP_compression.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
