---
title: "Lab 13 — The Cisco Troubleshooting Methodology"
date: 2026-10-08
description: "Practicing the troubleshooting methodology using a broken DNS scenario"
tags: ["CCNA", "Cisco", "Lab", "Troubleshooting", "DNS"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-13-troubleshooting-methodology/"
---

## Overview

Practice the fault-diagnosis methodology. DNS is not working — find and fix several simultaneous problems.

## Topology

```
DNS-Server (10.10.10.10)
    |
   F0/3
   SW1 ----F0/2---- R2 (F0/0: 10.10.10.2, F1/0: 10.10.20.2)
   F0/1              |
    |               SW2
   R1               F0/1
  (F0/0: 10.10.10.1) |
                     R3 (F0/0: 10.10.20.1)
```

Starting configuration: R3 uses R1 as its DNS server. Static routes are configured between R1 and R3.

## Tasks

1. Users report that DNS is not working
2. From R3, check DNS server reachability via Telnet: `R3#telnet 10.10.10.10`
3. Ping the DNS server from R3: `R3#ping 10.10.10.10`
4. Use traceroute to isolate the problem: `R3#traceroute 10.10.10.10`
5. Check R2's interfaces (find the shutdown interface): `R2#show ip interface brief`
6. Bring up the R2 interface: `R2(config-if)#no shutdown`
7. Fix the DNS configuration on R3: `R3(config)#no ip name-server 10.10.10.1` → `ip name-server 10.10.10.10`
8. Verify the DNS service is enabled on the DNS Server (GUI → Services → DNS → On)
9. Final test: `R3#ping R1` (should resolve through DNS)

## Issues in this Lab (Spoiler)

- FastEthernet0/0 on R2 is **administratively down**
- R3 is configured with the **wrong DNS server IP** (10.10.10.1 instead of 10.10.10.10)
- The DNS service on the server is **disabled** (DNS Service: Off)

## Key Commands

```
R3#telnet 10.10.10.10
R3#ping 10.10.10.10
R3#traceroute 10.10.10.10
R2#show ip interface brief
R2(config)#interface fastEthernet 0/0
R2(config-if)#no shutdown
R3(config)#no ip name-server 10.10.10.1
R3(config)#ip name-server 10.10.10.10
R3#ping R1
```

> **💡 Tip:**
> Cisco methodology: 1) Did it ever work? 2) Does it affect everyone or just one user? → Ping → Traceroute → Check layer by layer (L1→L2→L3→L4→L7).
