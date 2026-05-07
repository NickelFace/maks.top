---
title: "Lab 28-1 — ACL Configuration"
date: 2026-05-07
description: "Configuring standard and extended ACLs for traffic filtering"
tags: ["CCNA", "Cisco", "Lab", "ACL", "Security"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-28-acl/"
---

## Overview

Configure standard and extended ACLs for traffic filtering. Apply them to interfaces (in/out). Named ACL.

## Topology

```
PC1 (10.10.10.10) ----SW1---- R1 (G0/0: 10.10.10.1, G0/1: 10.10.20.1) ---- Server (10.10.20.10)
PC2 (10.10.10.20) ----SW1
```

## Tasks

### Standard ACL (filter by source IP)
1. Deny PC1 access to the server (Standard ACL #10):
   ```
   R1(config)#access-list 10 deny 10.10.10.10
   R1(config)#access-list 10 permit any
   ```
2. Apply it on G0/1 (outbound):
   ```
   R1(config-if)#ip access-group 10 out
   ```
3. Verify: PC1 → ping server → fail; PC2 → ping server → success
4. View the ACL with hit counters: `show access-lists`

### Extended ACL (filter by src+dst+protocol)
5. Allow only HTTP from PC2 to the server, deny ping:
   ```
   R1(config)#access-list 110 permit tcp 10.10.10.20 0.0.0.0 10.10.20.10 0.0.0.0 eq 80
   R1(config)#access-list 110 deny icmp 10.10.10.20 0.0.0.0 10.10.20.10 0.0.0.0
   R1(config)#access-list 110 permit ip any any
   ```
6. Apply on G0/0 (inbound) — close to the source:
   ```
   R1(config-if)#ip access-group 110 in
   ```

### Named ACL
7. Create a Named Extended ACL:
   ```
   R1(config)#ip access-list extended BLOCK-TELNET
   R1(config-ext-nacl)#deny tcp any any eq 23
   R1(config-ext-nacl)#permit ip any any
   ```
8. Apply it and verify

## Key Commands

```
R1(config)#access-list 10 deny 10.10.10.10 0.0.0.0
R1(config)#access-list 10 permit any
R1(config-if)#ip access-group 10 out
R1(config-if)#ip access-group 10 in
R1#show access-lists
R1#show ip interface g0/0            ! shows the applied ACL
R1(config)#no access-list 10         ! delete ACL
R1(config)#ip access-list extended MYACL
```

> **📌 Important:**
> Wildcard mask is the inverse of the subnet mask: 255.255.255.0 → 0.0.0.255. Implicit deny any at the end of every ACL! Apply Standard ACLs **close to the destination**, Extended ACLs **close to the source**.
