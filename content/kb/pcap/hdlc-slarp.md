---
title: "HDLC SLARP"
description: "We can have our serial interface automatically assign itself ip address from neighbor router, like DHCP for serial interfaces.which is called as SLARP(serial line address resolution protocol).Here is a packet capture of slarp and the router requesting the addresss and mask from neighbor router.Also the neighboring router responds with its own ip address and mask and this router looks into the mask and assigns itself the next available ip address from the subnet."
icon: "📡"
tags: ["SLARP"]
date: 2026-08-31
capture_file: "hdlc slarp.pcapng.cap"
packets: "7"
duration: "22s"
filesize: "612 bytes"
---

<div class="intro-card">
We can have our serial interface automatically assign itself ip address from neighbor router, like DHCP for serial interfaces.which is called as SLARP(serial line address resolution protocol).Here is a packet capture of slarp and the router requesting the addresss and mask from neighbor router.Also the neighboring router responds with its own ip address and mask and this router looks into the mask and assigns itself the next available ip address from the subnet.
</div>

| | |
|---|---|
| File | `hdlc slarp.pcapng.cap` |
| Packets | 7 |
| Duration | 22s |
| Size | 612 bytes |
| Protocols | SLARP |

[Download `hdlc slarp.pcapng.cap`](/pcap/hdlc slarp.pcapng.cap)

Open it with `wireshark hdlc slarp.pcapng.cap` or inspect from the shell:

```bash
tshark -r hdlc slarp.pcapng.cap -c 20
tcpdump -r hdlc slarp.pcapng.cap -nn -v
```
