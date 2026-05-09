---
title: "Lab 18 — Connectivity Troubleshooting"
date: 2026-10-21
description: "Finding and fixing connectivity issues using the Cisco troubleshooting methodology"
tags: ["CCNA", "Cisco", "Lab", "Troubleshooting", "Connectivity"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-18-connectivity-troubleshooting/"
---

## Overview

Finding and fixing connectivity issues in a multi-tier network. Several intentional configuration errors are present.

## Tasks

1. Verify basic connectivity: `ping` between all devices
2. Identify unreachable hosts
3. Apply the Cisco methodology: Physical → Data Link → Network
4. Use diagnostic tools:
   - `show ip interface brief` — interface status
   - `show ip route` — routing table
   - `ping` / `traceroute` — connectivity verification
   - `show cdp neighbors` — topology discovery
5. Fix the identified problems
6. Verify full connectivity

## Common Issues in Lab Networks

| Symptom | Cause | Diagnostic Command |
|---|---|---|
| Interface down/down | Cable / shutdown | `show ip int brief` |
| Interface up/down | Incorrect encapsulation | `show interface` |
| No route | Static route or protocol error | `show ip route` |
| Wrong next-hop | Error in `ip route` | `show ip route` |
| Wrong subnet mask | Summarization | `show ip route` |

## Key Commands

```
R1#show ip interface brief
R1#show interface f0/0
R1#show ip route
R1#ping 10.x.x.x
R1#traceroute 10.x.x.x
R1#show cdp neighbors detail
R1#debug ip routing              ! enable only for troubleshooting
R1#undebug all                   ! disable all debug
```

> **💡 Tip:**
> Work bottom-up through the layers: start with Physical (cables, shutdown), then Data Link (encapsulation, duplex), then Network (IP addresses, masks, routes).
