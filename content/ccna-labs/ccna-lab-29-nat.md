---
title: "Lab 29-1 — NAT Configuration"
date: 2026-11-18
description: "Configuring Static NAT, Dynamic NAT, and PAT on Cisco IOS"
tags: ["CCNA", "Cisco", "Lab", "NAT", "PAT"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-29-nat/"
---

## Overview

Configure Static NAT, Dynamic NAT, and PAT (Port Address Translation). Verify translations.

## Topology

```
PC1 (10.10.10.10) ----SW1---- R1 (inside: G0/0 10.10.10.1, outside: G0/1 203.0.113.1) ---- Internet
PC2 (10.10.10.20)
```

## Tasks

### Static NAT
1. Configure a static IP mapping:
   ```
   R1(config)#ip nat inside source static 10.10.10.10 203.0.113.10
   ```
2. Mark the interfaces:
   ```
   R1(config-if)#ip nat inside     ! G0/0
   R1(config-if)#ip nat outside    ! G0/1
   ```
3. Verify: `show ip nat translations`

### Dynamic NAT
4. Create a NAT pool:
   ```
   R1(config)#ip nat pool MYPOOL 203.0.113.20 203.0.113.30 netmask 255.255.255.0
   ```
5. Create an ACL for inside hosts:
   ```
   R1(config)#access-list 1 permit 10.10.10.0 0.0.0.255
   ```
6. Apply Dynamic NAT:
   ```
   R1(config)#ip nat inside source list 1 pool MYPOOL
   ```
7. Check active translations: `show ip nat translations`

### PAT (Overload)
8. PAT uses a single IP with different port numbers:
   ```
   R1(config)#ip nat inside source list 1 interface g0/1 overload
   ```
9. Ping from both PCs → verify translations with different ports
10. Check statistics: `show ip nat statistics`

## Key Commands

```
R1(config)#ip nat inside source static 10.10.10.10 203.0.113.10
R1(config)#ip nat pool MYPOOL 203.0.113.20 203.0.113.30 netmask 255.255.255.0
R1(config)#ip nat inside source list 1 pool MYPOOL
R1(config)#ip nat inside source list 1 interface g0/1 overload
R1(config-if)#ip nat inside
R1(config-if)#ip nat outside
R1#show ip nat translations
R1#show ip nat statistics
R1#clear ip nat translation *        ! clear all translations
```

> **💡 Tip:**
> Inside Local = the real IP inside the network. Inside Global = the public IP after translation. PAT (overload) is the most common in real networks: one public IP for thousands of devices.
