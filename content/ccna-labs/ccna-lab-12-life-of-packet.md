---
title: "Lab 12 — The Life of a Packet"
date: 2026-10-06
description: "Tracing a packet's path through the network: ARP, DNS, and MAC address changes at each hop"
tags: ["CCNA", "Cisco", "Lab", "ARP", "DNS", "Packet Flow"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-12-life-of-packet/"
---

## Overview

Guided walkthrough — tracing a packet's path through the network. Exploring DNS client behavior and the ARP cache.

## Topology

```
PC1 ---- SW1 ---- R1 ---- R2 ---- SW2 ---- Server (DNS + HTTP)
              10.10.10.0/24    10.10.20.0/24
```

## Tasks

### ARP Cache
1. On PC1, view the ARP cache (empty initially)
2. Ping the default gateway
3. View the ARP cache again — an entry for the gateway will appear
4. Ping the remote host (Server)
5. Explain: PC1's ARP cache shows only the gateway, not the Server

### DNS
6. Ping the Server by name: `ping server.lab`
7. Trace the DNS query to the server
8. View the DNS cache on the PC (if available)

### Packet Path
9. Use `traceroute` to display the hop-by-hop path
10. Explain why the MAC address changes at each hop (L2) while the IP address remains unchanged (L3)

## Key Commands

```
R1#show ip arp                        ! router ARP table
SW1#show mac address-table            ! switch MAC address table
R1#show ip route                      ! routing table
PC> ping server.lab                   ! DNS resolution + ping
PC> tracert 10.10.20.10               ! packet path
```

> **💡 Tip:**
> The key concept: **the MAC address changes at every hop** (L2 is rewritten by the router), while the **IP address remains unchanged** from source to destination (L3).
