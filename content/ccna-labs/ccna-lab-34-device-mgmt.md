---
title: "Lab 34 — Network Device Management"
date: 2026-05-07
description: "Configuring SNMP, Syslog, and NTP for network device monitoring"
tags: ["CCNA", "Cisco", "Lab", "SNMP", "Syslog", "NTP"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-34-device-mgmt/"
---

## Overview

Configure SNMP (v2c and v3), Syslog, and NTP for network device monitoring.

## Topology

```
R1 ----SW1---- Management-Server (Syslog + SNMP + NTP, 10.10.10.100)
```

## Tasks

### Syslog
1. Configure syslog forwarding to the server:
   ```
   R1(config)#logging host 10.10.10.100
   R1(config)#logging trap informational     ! level 6 and above
   R1(config)#logging buffered 8192 debugging
   ```
2. Enable timestamps:
   ```
   R1(config)#service timestamps log datetime msec
   ```
3. Verify: `show logging`
4. Simulate an event (shutdown/no shutdown an interface) → check the syslog server

### SNMP v2c
5. Configure community strings:
   ```
   R1(config)#snmp-server community public RO
   R1(config)#snmp-server community private RW
   ```
6. Configure SNMP traps:
   ```
   R1(config)#snmp-server host 10.10.10.100 version 2c public
   R1(config)#snmp-server enable traps
   ```

### SNMP v3 (more secure)
7. Create an SNMP v3 user:
   ```
   R1(config)#snmp-server group MYGROUP v3 priv
   R1(config)#snmp-server user MYUSER MYGROUP v3 auth sha Auth1! priv aes 128 Priv1!
   ```

### NTP
8. Configure the NTP server:
   ```
   R1(config)#ntp server 10.10.10.100
   ```
9. Verify synchronization: `show ntp status`
10. Check associations: `show ntp associations`
11. Set the timezone: `clock timezone MSK 3`

## Key Commands

```
R1(config)#logging host 10.10.10.100
R1(config)#logging trap informational
R1(config)#service timestamps log datetime msec
R1(config)#snmp-server community public RO
R1(config)#snmp-server host 10.10.10.100 version 2c public
R1(config)#snmp-server enable traps
R1(config)#ntp server 10.10.10.100
R1(config)#clock timezone MSK 3
R1#show logging
R1#show ntp status
R1#show ntp associations
R1#show snmp
```

> **💡 Tip:**
> Syslog levels (0=Emergency…7=Debug). `logging trap` sets the minimum level for forwarding to the server. SNMP v3 with `priv` = encryption + authentication. Key ports for CCNA: SNMP=UDP 161, SNMP Trap=UDP 162, Syslog=UDP 514, NTP=UDP 123.
