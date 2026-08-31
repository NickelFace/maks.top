---
title: "PPP EAP"
description: "PPP link negotiation employing EAP MD5 authentication"
icon: "📡"
tags: ["CDP", "CDPCP", "EAP", "IPCP", "LCP", "PPP"]
date: 2026-08-31
capture_file: "PPP_EAP.cap"
packets: "52"
duration: "52s"
filesize: "2.5 KB"
---

<div class="intro-card">
PPP link negotiation employing EAP MD5 authentication
</div>

| | |
|---|---|
| File | `PPP_EAP.cap` |
| Packets | 52 |
| Duration | 52s |
| Size | 2.5 KB |
| Protocols | CDP · CDPCP · EAP · IPCP · LCP · PPP |

[Download `PPP_EAP.cap`](/pcap/PPP_EAP.cap)

Open it with `wireshark PPP_EAP.cap` or inspect from the shell:

```bash
tshark -r PPP_EAP.cap -c 20
tcpdump -r PPP_EAP.cap -nn -v
```
