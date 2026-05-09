---
title: "Lab 23-1 — DHCP Configuration"
date: 2026-10-31
description: "Configuring a DHCP server on a router and DHCP Relay (ip helper-address)"
tags: ["CCNA", "Cisco", "Lab", "DHCP", "Relay"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-23-dhcp/"
---

## Overview

Configure a DHCP server on a router, a DHCP client, and DHCP Relay (ip helper-address). Verify address assignment.

## Topology

```
PC1 ----SW1---- R1 (DHCP Server, G0/0: 10.10.10.1) ----G0/1---- R2 (G0/0: 10.10.20.1)
                                                                    |
                                                                   PC2 (different subnet)
```

## Tasks

### DHCP Server on R1
1. Configure a DHCP pool for VLAN 10:
   ```
   R1(config)#ip dhcp pool VLAN10
   R1(dhcp-config)#network 10.10.10.0 255.255.255.0
   R1(dhcp-config)#default-router 10.10.10.1
   R1(dhcp-config)#dns-server 8.8.8.8
   R1(dhcp-config)#lease 7
   ```
2. Exclude the router's addresses: `ip dhcp excluded-address 10.10.10.1 10.10.10.10`
3. Configure PC1 to obtain an address automatically
4. Verify the issued leases: `R1#show ip dhcp binding`
5. Check statistics: `R1#show ip dhcp server statistics`

### DHCP Relay (ip helper-address)
6. PC2 is on a different network (10.10.20.0/24), and the DHCP server is R1
7. On R2, configure relay on the interface facing PC2's network:
   ```
   R2(config-if)#ip helper-address 10.10.10.1
   ```
8. Create a pool for 10.10.20.0/24 on R1
9. Verify that PC2 receives an address through the relay

## Key Commands

```
R1(config)#ip dhcp excluded-address 10.10.10.1 10.10.10.10
R1(config)#ip dhcp pool VLAN10
R1(dhcp-config)#network 10.10.10.0 255.255.255.0
R1(dhcp-config)#default-router 10.10.10.1
R1(dhcp-config)#dns-server 8.8.8.8
R1(dhcp-config)#lease 7
R1#show ip dhcp binding
R1#show ip dhcp server statistics
R2(config-if)#ip helper-address 10.10.10.1
```

> **💡 Tip:**
> `ip helper-address` intercepts broadcast DHCP requests and forwards them as unicast to the DHCP server. Without relay, DHCP only works within a single broadcast domain.
