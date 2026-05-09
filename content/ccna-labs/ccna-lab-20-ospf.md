---
title: "Lab 20-1 — OSPF Configuration"
date: 2026-10-26
description: "Configuring OSPFv2: neighbors, DR/BDR election, and interface cost"
tags: ["CCNA", "Cisco", "Lab", "OSPF", "DR/BDR"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-20-ospf/"
---

## Overview

Configure OSPFv2, verify neighbor relationships, observe DR/BDR election, adjust interface cost, and configure passive-interface.

## Topology

```
R1 (G0/0: 10.10.10.1) ----10.10.10.0/24 (broadcast)---- R2 (G0/0: 10.10.10.2, G0/1: 10.10.20.1)
                                                          |
                                                         R3 (G0/0: 10.10.20.2)
Loopbacks: R1=1.1.1.1, R2=2.2.2.2, R3=3.3.3.3 (/32)
```

## Tasks

1. Configure IP addresses and loopbacks on all routers
2. Configure OSPFv2 on all routers:
   ```
   R1(config)#router ospf 1
   R1(config-router)#router-id 1.1.1.1
   R1(config-router)#network 10.10.10.0 0.0.0.255 area 0
   R1(config-router)#network 1.1.1.1 0.0.0.0 area 0
   ```
3. Verify neighbors: `show ip ospf neighbor`
4. Observe the DR/BDR election (broadcast network 10.10.10.0/24)
5. Verify the routing table (O = OSPF): `show ip route ospf`
6. Check the LSDB: `show ip ospf database`
7. Change the interface cost:
   ```
   R1(config-if)#ip ospf cost 100
   ```
8. Change the reference bandwidth: `auto-cost reference-bandwidth 1000`
9. Configure passive-interface on the loopback
10. Verify with `show ip protocols`

## Key Commands

```
R1(config)#router ospf 1
R1(config-router)#router-id 1.1.1.1
R1(config-router)#network 10.10.10.0 0.0.0.255 area 0
R1(config-router)#passive-interface Loopback0
R1(config-router)#auto-cost reference-bandwidth 1000
R1(config-if)#ip ospf cost 100
R1(config-if)#ip ospf priority 100     ! DR/BDR election
R1#show ip ospf neighbor
R1#show ip ospf database
R1#show ip route ospf
R1#show ip protocols
R1#show ip ospf interface brief
```

> **💡 Tip:**
> DR/BDR is elected on broadcast segments. Priority 0 = does not participate. Highest Priority → DR. Equal priority → highest Router-ID wins. **Elections are not re-run when a new router joins** (non-preemptive).
