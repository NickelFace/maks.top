---
title: "Lab 16 — Routing Fundamentals"
date: 2026-05-07
description: "Configuring static routing and analyzing the routing table"
tags: ["CCNA", "Cisco", "Lab", "Static Routing"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-16-routing-fundamentals/"
---

## Overview

Configure static routing and analyze the routing table.

## Topology

```
PC1 (10.10.10.10/24)
 |
SW1
 |
R1 (F0/0: 10.10.10.1, F0/1: 10.10.20.1) ---- R2 (F0/0: 10.10.20.2, F0/1: 10.10.30.1) ---- R3 (F0/0: 10.10.30.2)
                                                                                                |
                                                                                              PC2 (10.10.30.10/24)
```

## Tasks

1. Configure IP addresses on all router interfaces
2. Verify Connected routes are present: `show ip route`
3. Add a static route on R1 to 10.10.30.0/24: `ip route 10.10.30.0 255.255.255.0 10.10.20.2`
4. Add a static route on R3 to 10.10.10.0/24: `ip route 10.10.10.0 255.255.255.0 10.10.30.1`
5. Add routes on R2 (both directions)
6. Verify the routing table (S = Static, C = Connected): `show ip route`
7. Ping PC2 from PC1 — it should succeed
8. Add a default route on R1: `ip route 0.0.0.0 0.0.0.0 10.10.20.2`
9. Verify Longest Prefix Match: the more specific route always wins

## Key Commands

```
R1(config)#ip route 10.10.30.0 255.255.255.0 10.10.20.2    ! next-hop IP
R1(config)#ip route 10.10.30.0 255.255.255.0 F0/1          ! exit interface
R1(config)#ip route 0.0.0.0 0.0.0.0 10.10.20.2             ! default route
R1#show ip route
R1#show ip route static
R1#ping 10.10.30.10 source 10.10.10.1
```

> **💡 Tip:**
> Routing table codes: **C** = Connected, **S** = Static, **S*** = default static route. Longest prefix match — the router always selects the most specific route.
