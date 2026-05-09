---
title: "Lab 30-1 — IPv6 Configuration"
date: 2026-11-20
description: "Configuring IPv6: manual addressing, EUI-64, SLAAC, and static routes"
tags: ["CCNA", "Cisco", "Lab", "IPv6", "SLAAC"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-30-ipv6/"
---

## Overview

Configure IPv6 addressing (manual and EUI-64), IPv6 static routes, and SLAAC for automatic host configuration.

## Topology

```
PC1 ----SW1---- R1 (G0/0: 2001:db8:0:1::1/64, G0/1: 2001:db8:0:2::1/64) ---- R2 (G0/0: 2001:db8:0:2::2/64)
                     Link-local: FE80::1                                              Link-local: FE80::2
```

## Tasks

### Enable IPv6
1. Enable IPv6 unicast routing:
   ```
   R1(config)#ipv6 unicast-routing
   ```
2. Configure IPv6 addresses manually:
   ```
   R1(config-if)#ipv6 address 2001:db8:0:1::1/64
   R1(config-if)#ipv6 address FE80::1 link-local
   ```
3. Configure EUI-64 (derived automatically from MAC):
   ```
   R1(config-if)#ipv6 address 2001:db8:0:1::/64 eui-64
   ```
4. Verify IPv6 addresses: `show ipv6 interface brief`

### SLAAC for Hosts
5. On R1, Router Advertisements (RA) are enabled by default when `ipv6 unicast-routing` is on
6. The PC will automatically obtain a Global Unicast address from the RA prefix + EUI-64 MAC
7. Verify the PC's address

### IPv6 Static Routes
8. Configure a static route:
   ```
   R1(config)#ipv6 route 2001:db8:0:3::/64 2001:db8:0:2::2
   ```
9. Default route in IPv6:
   ```
   R1(config)#ipv6 route ::/0 FE80::2 g0/1
   ```
10. Check the routing table: `show ipv6 route`
11. Ping R2's IPv6 address: `ping 2001:db8:0:2::2`

## Key Commands

```
R1(config)#ipv6 unicast-routing
R1(config-if)#ipv6 address 2001:db8:0:1::1/64
R1(config-if)#ipv6 address FE80::1 link-local
R1(config-if)#ipv6 address 2001:db8:0:1::/64 eui-64
R1(config)#ipv6 route 2001:db8:0:3::/64 2001:db8:0:2::2
R1(config)#ipv6 route ::/0 FE80::2 g0/1
R1#show ipv6 interface brief
R1#show ipv6 route
R1#ping ipv6 2001:db8:0:2::2
```

> **💡 Tip:**
> EUI-64: take the MAC (xx:xx:xx:xx:xx:xx), insert **FF:FE** in the middle, and invert bit 7. The result is a 64-bit interface identifier. Link-local addresses always start with FE80::/10.
