---
title: "MPLS address label mapping"
description: "MPLS address label mappings communication over TCP (here R6 to R5)
In this packet we can see the address bound to that neighbor (R6) in the address list TLV.
Also the address and labels are encoded as TLV(type length value).
We should remember that the transport address of the neighbor should be reachable and not mpls router ID, because the TCP handshake is done via transport address and not MPLS router id.
The address label mapping is exchanged once the TCP handshake is done."
icon: "📡"
tags: ["IP", "LDP", "TCP"]
date: 2026-08-31
capture_file: "mpls address label mapping.pcapng.cap"
packets: "1"
duration: "n/a"
filesize: "708 bytes"
---

<div class="intro-card">
MPLS address label mappings communication over TCP (here R6 to R5)
In this packet we can see the address bound to that neighbor (R6) in the address list TLV.
Also the address and labels are encoded as TLV(type length value).
We should remember that the transport address of the neighbor should be reachable and not mpls router ID, because the TCP handshake is done via transport address and not MPLS router id.
The address label mapping is exchanged once the TCP handshake is done.
</div>

| | |
|---|---|
| File | `mpls address label mapping.pcapng.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 708 bytes |
| Protocols | IP · LDP · TCP |

[Download `mpls address label mapping.pcapng.cap`](/pcap/mpls address label mapping.pcapng.cap)

Open it with `wireshark mpls address label mapping.pcapng.cap` or inspect from the shell:

```bash
tshark -r mpls address label mapping.pcapng.cap -c 20
tcpdump -r mpls address label mapping.pcapng.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
