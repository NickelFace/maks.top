---
title: "OCSP Good"
description: "OCSP_Good (CRL HTTPS CA Verisign)"
icon: "📡"
tags: ["DNS", "HTTP", "IP", "OCSP", "TCP", "UDP"]
date: 2026-08-31
capture_file: "OCSP-Good.cap"
packets: "14"
duration: "1s"
filesize: "3.5 KB"
---

<div class="intro-card">
OCSP_Good (CRL HTTPS CA Verisign)
</div>

| | |
|---|---|
| File | `OCSP-Good.cap` |
| Packets | 14 |
| Duration | 1s |
| Size | 3.5 KB |
| Protocols | DNS · HTTP · IP · OCSP · TCP · UDP |

[Download `OCSP-Good.cap`](/pcap/OCSP-Good.cap)

Open it with `wireshark OCSP-Good.cap` or inspect from the shell:

```bash
tshark -r OCSP-Good.cap -c 20
tcpdump -r OCSP-Good.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
