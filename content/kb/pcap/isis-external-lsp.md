---
title: "ISIS external lsp"
description: "R2 floods the external routes redistributed from RIP into area 10. Packet #9 includes the IP external reachability TLV. Capture perspective from R3's 10.0.10.1 interface."
icon: "📡"
tags: ["Ethernet", "ISIS", "LLC"]
date: 2026-08-31
capture_file: "ISIS_external_lsp.cap"
packets: "15"
duration: "23s"
filesize: "17.0 KB"
---

<div class="intro-card">
R2 floods the external routes redistributed from RIP into area 10. Packet #9 includes the IP external reachability TLV. Capture perspective from R3's 10.0.10.1 interface.
</div>

| | |
|---|---|
| File | `ISIS_external_lsp.cap` |
| Packets | 15 |
| Duration | 23s |
| Size | 17.0 KB |
| Protocols | Ethernet · ISIS · LLC |

[Download `ISIS_external_lsp.cap`](/pcap/ISIS_external_lsp.cap)

Open it with `wireshark ISIS_external_lsp.cap` or inspect from the shell:

```bash
tshark -r ISIS_external_lsp.cap -c 20
tcpdump -r ISIS_external_lsp.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
