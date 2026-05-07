---
title: "CCNA — Subnetting — Practice and Method"
date: 2026-05-07
description: "Subnetting practice problems with solutions: fast calculation algorithm, VLSM exercises, wildcard masks and common exam mistakes."
tags: ["CCNA", "Cisco", "subnetting", "VLSM", "IPv4"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-05a-subnetting/"
---

## Fast Algorithm (for the exam)

### Step 1 — Identify Network Parameters

Given: `192.168.1.0/26`

```
/26 = 255.255.255.192

Hosts: 2^(32-26) - 2 = 2^6 - 2 = 64 - 2 = 62
Block size: 256 - 192 = 64
```

### Step 2 — List Subnets (count blocks by step)

```
Network:      192.168.1.0    Broadcast: 192.168.1.63
Hosts:        .1 – .62

Network:      192.168.1.64   Broadcast: 192.168.1.127
Hosts:        .65 – .126

Network:      192.168.1.128  Broadcast: 192.168.1.191
Hosts:        .129 – .190

Network:      192.168.1.192  Broadcast: 192.168.1.255
Hosts:        .193 – .254
```

### Mask Step Reference Table

| Mask | CIDR | Block Size | Hosts | Subnets from /24 |
|---|---|---|---|---|
| 255.255.255.0 | /24 | 1 (from /24) | 254 | 1 |
| 255.255.255.128 | /25 | 128 | 126 | 2 |
| 255.255.255.192 | /26 | 64 | 62 | 4 |
| 255.255.255.224 | /27 | 32 | 30 | 8 |
| 255.255.255.240 | /28 | 16 | 14 | 16 |
| 255.255.255.248 | /29 | 8 | 6 | 32 |
| 255.255.255.252 | /30 | 4 | 2 | 64 |
| 255.255.255.254 | /31 | 2 | 0 (point-to-point) | 128 |
| 255.255.255.255 | /32 | 1 | 0 (loopback/host) | 256 |

---

## Practice Problems — Level 1 (Basic)

### Problem 1.1

Given network `10.0.0.0/8`. How many hosts are in this network?

<details>
<summary>Answer</summary>

`/8` → `32 - 8 = 24 host bits`
`2^24 - 2 = 16,777,214 hosts`

</details>

---

### Problem 1.2

A host has address `172.16.45.200/20`. Determine:
- Network address
- Broadcast
- Host range
- Subnet mask

<details>
<summary>Answer</summary>

`/20` → mask `255.255.240.0`
Block size in third octet: `256 - 240 = 16`

Third octet: `45 / 16 = 2` (remainder 13) → block starts at `2 × 16 = 32`

```
Network:   172.16.32.0
Broadcast: 172.16.47.255
Hosts:     172.16.32.1 – 172.16.47.254
Mask:      255.255.240.0
```

</details>

---

### Problem 1.3

Host `192.168.10.57/27`. Determine:
- Network address
- Broadcast
- First/last host

<details>
<summary>Answer</summary>

`/27` → mask `255.255.255.224`
Block size: `256 - 224 = 32`

`57 / 32 = 1` (remainder 25) → block: `1 × 32 = 32`

```
Network:    192.168.10.32
Broadcast:  192.168.10.63
First host: 192.168.10.33
Last host:  192.168.10.62
```

</details>

---

### Problem 1.4

You need to accommodate 50 hosts in a single subnet. What is the minimum mask?

<details>
<summary>Answer</summary>

50 hosts → need `2^n - 2 ≥ 50`
- `/26` → `2^6 - 2 = 62` ✓ (minimum mask)
- `/27` → `2^5 - 2 = 30` ✗ (too few)

**Answer: /26 (255.255.255.192)**

</details>

---

### Problem 1.5

Which of the following addresses belong to the subnet `192.168.5.0/28`?
- A) `192.168.5.14`
- B) `192.168.5.16`
- C) `192.168.5.12`
- D) `192.168.5.17`

<details>
<summary>Answer</summary>

`/28` → block size 16

Subnets: `.0–.15`, `.16–.31`, `.32–.47`...

In `192.168.5.0/28`, valid hosts are `.1–.14` (`.0` = network, `.15` = broadcast)

- A) `.14` ✓
- B) `.16` ✗ (next subnet)
- C) `.12` ✓
- D) `.17` ✗ (next subnet)

**Answer: A and C**

</details>

---

## Practice Problems — Level 2 (Intermediate)

### Problem 2.1

Divide `192.168.1.0/24` into 4 equal subnets. List the network address, mask and broadcast for each.

<details>
<summary>Answer</summary>

4 subnets from /24 → need 2 bits for subnets → `/24 + 2 = /26`

Block size: 64

```
Subnet 1:  192.168.1.0/26    → Broadcast: 192.168.1.63
Subnet 2:  192.168.1.64/26   → Broadcast: 192.168.1.127
Subnet 3:  192.168.1.128/26  → Broadcast: 192.168.1.191
Subnet 4:  192.168.1.192/26  → Broadcast: 192.168.1.255
```

</details>

---

### Problem 2.2

Host `172.30.100.100/18`. Is this a private address? Identify:
- Class and private range
- Network address
- Number of hosts

<details>
<summary>Answer</summary>

`172.30.x.x` → Class B, private range `172.16.0.0 – 172.31.255.255` ✓

`/18` → mask `255.255.192.0`
Block size in second octet: `256 - 192 = 64`

`100 / 64 = 1` (remainder 36) → block: `1 × 64 = 64`

```
Network:   172.30.64.0/18
Broadcast: 172.30.127.255
Hosts:     2^14 - 2 = 16,382
```

</details>

---

### Problem 2.3

Determine whether two hosts are correctly placed in the same subnet:
- Host A: `10.1.50.130/26`
- Host B: `10.1.50.190/26`

<details>
<summary>Answer</summary>

`/26` → block size 64

Subnets: `10.1.50.0/26` (hosts .1–.62), `10.1.50.64/26` (hosts .65–.126), `10.1.50.128/26` (hosts .129–.190), `10.1.50.192/26`...

- Host A `.130` → subnet `10.1.50.128/26`
- Host B `.190` → subnet `10.1.50.128/26`

**.130 and .190 — same subnet `10.1.50.128/26` ✓**

Broadcast for this subnet: `10.1.50.191`

</details>

---

### Problem 2.4 (Exam format)

Router R1 has interface `192.168.10.65/27`. A client must have an IP in the same subnet. Which option **will NOT work**?

- A) `192.168.10.70`
- B) `192.168.10.90`
- C) `192.168.10.94`
- D) `192.168.10.63`

<details>
<summary>Answer</summary>

`/27` → block size 32

`.65` → block: `64` (2 × 32 = 64)
Subnet: `192.168.10.64/27`, hosts `.65–.94`, broadcast `.95`

- A) `.70` ✓ (in range)
- B) `.90` ✓ (in range)
- C) `.94` ✓ (last valid host)
- D) `.63` ✗ (this is the broadcast of the previous subnet `192.168.10.32/27`)

**Answer: D**

</details>

---

## VLSM — Problems

### What is VLSM

**VLSM** (Variable Length Subnet Masking) — different subnets use different masks. This avoids wasting address space.

**Rule**: always start with the **largest** subnet.

---

### VLSM Problem 3.1

Given network `192.168.20.0/24`. Create subnets for:
- Department A: 60 hosts
- Department B: 28 hosts
- Department C: 12 hosts
- WAN link: 2 hosts

<details>
<summary>Answer</summary>

**Step 1: Sort by descending size**
60 → 28 → 12 → 2

**Step 2: Select masks**

| Department | Hosts | Mask | Available Hosts |
|---|---|---|---|
| A | 60 | /26 (62 hosts) | 62 |
| B | 28 | /27 (30 hosts) | 30 |
| C | 12 | /28 (14 hosts) | 14 |
| WAN | 2 | /30 (2 hosts) | 2 |

**Step 3: Assign addresses**

```
Dept A:  192.168.20.0/26    → hosts .1–.62,  broadcast .63
Dept B:  192.168.20.64/27   → hosts .65–.94, broadcast .95
Dept C:  192.168.20.96/28   → hosts .97–.110, broadcast .111
WAN:     192.168.20.112/30  → hosts .113–.114, broadcast .115
```

Remaining free: `192.168.20.116 – 192.168.20.255`

</details>

---

### VLSM Problem 3.2

Company network: `10.0.0.0/22`. Requirements:
- Production: 400 hosts
- Office: 200 hosts
- Warehouse: 50 hosts
- Management: 10 hosts

<details>
<summary>Answer</summary>

`/22` = `10.0.0.0 – 10.0.3.255` (1022 usable hosts total)

**Masks:**

| Network | Hosts | Mask | Size |
|---|---|---|---|
| Production | 400 | /23 (510 hosts) | 512 addresses |
| Office | 200 | /24 (254 hosts) | 256 addresses |
| Warehouse | 50 | /26 (62 hosts) | 64 addresses |
| Management | 10 | /28 (14 hosts) | 16 addresses |

**Allocation:**

```
Production: 10.0.0.0/23   → 10.0.0.1 – 10.0.1.254, broadcast 10.0.1.255
Office:     10.0.2.0/24   → 10.0.2.1 – 10.0.2.254, broadcast 10.0.2.255
Warehouse:  10.0.3.0/26   → 10.0.3.1 – 10.0.3.62,  broadcast 10.0.3.63
Management: 10.0.3.64/28  → 10.0.3.65 – 10.0.3.78, broadcast 10.0.3.79
```

Remaining free: `10.0.3.80 – 10.0.3.255`

</details>

---

## Wildcard Masks — Practice

**Wildcard** = inverse of a subnet mask. Used in ACL and OSPF.

| Mask | Wildcard | How to calculate |
|---|---|---|
| /24 = 255.255.255.0 | 0.0.0.255 | 255-255=0, 255-255=0, 255-255=0, 255-0=255 |
| /25 = 255.255.255.128 | 0.0.0.127 | 255-128=127 |
| /26 = 255.255.255.192 | 0.0.0.63 | 255-192=63 |
| /27 = 255.255.255.224 | 0.0.0.31 | 255-224=31 |
| /28 = 255.255.255.240 | 0.0.0.15 | 255-240=15 |
| /30 = 255.255.255.252 | 0.0.0.3 | 255-252=3 |
| /16 = 255.255.0.0 | 0.0.255.255 | |
| /8 = 255.0.0.0 | 0.255.255.255 | |

### Special Wildcards

| Wildcard | Meaning | Example usage |
|---|---|---|
| `0.0.0.0` | Exact host match | `permit host 10.0.0.1` |
| `255.255.255.255` | Any address | `permit any` |

### Wildcard Practice Problem

An ACL must permit only the network `172.16.16.0/20`. What wildcard should be used?

<details>
<summary>Answer</summary>

`/20` = `255.255.240.0`
Wildcard = `255.255.255.255 - 255.255.240.0 = 0.0.15.255`

```
access-list 10 permit 172.16.16.0 0.0.15.255
```

</details>

---

## Counting Subnets

**How many /Y subnets can be created from a /X network?**

Formula: `2^(Y-X)` — number of subnets

| Original | New | Subnets |
|---|---|---|
| /24 | /25 | 2^1 = 2 |
| /24 | /26 | 2^2 = 4 |
| /24 | /27 | 2^3 = 8 |
| /24 | /28 | 2^4 = 16 |
| /24 | /30 | 2^6 = 64 |
| /16 | /24 | 2^8 = 256 |
| /8 | /16 | 2^8 = 256 |

---

## Common Exam Mistakes

| Mistake | Correct approach |
|---|---|
| Including the network address in the host range | `.0` is the network address; hosts start at `.1` |
| Including the broadcast in the host range | Broadcast is the last address in the block, not a host |
| Using the subnet mask instead of wildcard in ACL | `permit 10.0.0.0 255.0.0.0` is wrong; use `0.255.255.255` |
| Forgetting /31 for point-to-point | /31 = 2 addresses, no network/broadcast (RFC 3021) |
| Counting hosts as 2^n instead of 2^n-2 | Always subtract 2 for normal subnets |
