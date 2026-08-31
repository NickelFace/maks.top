---
title: "OCSP Revoked"
description: "OCSP (Comodo - FAKE crt Addons-mozilla-org)"
icon: "📡"
tags: ["HTTP", "IP", "OCSP", "TCP"]
date: 2026-08-31
capture_file: "OCSP-Revoked.cap"
packets: "10"
duration: "n/a"
filesize: "1.8 KB"
---

<div class="intro-card">
OCSP (Comodo - FAKE crt Addons-mozilla-org)
</div>

| | |
|---|---|
| File | `OCSP-Revoked.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.8 KB |
| Protocols | HTTP · IP · OCSP · TCP |

[Download `OCSP-Revoked.cap`](/pcap/OCSP-Revoked.cap)

Open it with `wireshark OCSP-Revoked.cap` or inspect from the shell:

```bash
tshark -r OCSP-Revoked.cap -c 20
tcpdump -r OCSP-Revoked.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
