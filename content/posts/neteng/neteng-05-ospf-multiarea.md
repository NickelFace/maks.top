---
title: "Network Engineer — 05. OSPF Multiarea"
date: 2025-09-22
description: "Lab: configuring OSPFv2 for multiple areas. ABR, ASBR, inter-area summarization, MD5 authentication."
tags: ["Networking", "OSPF", "Multiarea", "Routing", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
lang_pair: "/posts/neteng/ru/neteng-05-ospf-multiarea/"
---

## Lab: Configuring OSPFv2 for Multiple Areas

### Topology

![OSPFv2 multiarea topology](/img/neteng/05/OSPFv2.png)

### Addressing table

| Device | Interface    | IP address      | Subnet Mask     |
| ------ | ------------ | --------------- | --------------- |
| R1     | Lo0          | 209.165.200.225 | 255.255.255.252 |
|        | Lo1          | 192.168.1.1     | 255.255.255.0   |
|        | Lo2          | 192.168.2.1     | 255.255.255.0   |
|        | S0/0/0 (DCE) | 192.168.12.1    | 255.255.255.252 |
| R2     | Lo6          | 192.168.6.1     | 255.255.255.0   |
|        | S0/0/0       | 192.168.12.2    | 255.255.255.252 |
|        | S0/0/1 (DCE) | 192.168.23.1    | 255.255.255.252 |
| R3     | Lo4          | 192.168.4.1     | 255.255.255.0   |
|        | Lo5          | 192.168.5.1     | 255.255.255.0   |
|        | S0/0/1       | 192.168.23.2    | 255.255.255.252 |

### Router roles

| Router | Role |
| ------ | ---- |
| R1     | ASBR, ABR, Backbone router |
| R2     | ABR, Backbone router |
| R3     | Internal router (Area 3) |

### Goals

- **Part 1.** Build the network, configure basic device parameters
- **Part 2.** Configure OSPFv2 multiarea (process ID 1)
- **Part 3.** Configure inter-area summary routes

---

### Part 1 — Basic device setup

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
hostname R1
interface Loopback0
 ip address 209.165.200.225 255.255.255.252
interface Loopback1
 ip address 192.168.1.1 255.255.255.0
interface Loopback2
 ip address 192.168.2.1 255.255.255.0
interface Serial0/0
 ip address 192.168.12.1 255.255.255.252
 clock rate 128000
 no shutdown
no ip domain-lookup
enable secret class
line vty 0 15
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
hostname R2
interface Loopback6
 ip address 192.168.6.1 255.255.255.0
interface Serial0/0
 ip address 192.168.12.2 255.255.255.252
 no shutdown
interface Serial1/0
 ip address 192.168.23.1 255.255.255.252
 clock rate 128000
 no shutdown
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
enable
configure terminal
hostname R3
interface Serial0/0
 ip address 192.168.23.2 255.255.255.252
 no shutdown
interface Loopback4
 ip address 192.168.4.1 255.255.255.0
interface Loopback5
 ip address 192.168.5.1 255.255.255.0
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>

Verify interface status:

<details>
<summary>R1 — show ip interface brief</summary>
<pre><code>
Interface      IP-Address       OK? Status    Protocol
Serial1/0      192.168.12.1     YES up        up
Loopback0      209.165.200.225  YES up        up
Loopback1      192.168.1.1      YES up        up
Loopback2      192.168.2.1      YES up        up
</code></pre>
</details>

---

### Part 2 — OSPF multiarea configuration

Each loopback LAN interface must be passive. MD5 authentication with key **Cisco123** on all serial interfaces.

<details>
<summary>R1 (Area 0 + Area 1, ASBR)</summary>
<pre><code>
router ospf 1
 router-id 1.1.1.1
 network 192.168.1.0 0.0.0.255 area 1
 network 192.168.2.0 0.0.0.255 area 1
 network 192.168.12.0 0.0.0.3 area 0
 passive-interface Loopback1
 passive-interface Loopback2
 default-information originate
ip route 0.0.0.0 0.0.0.0 Loopback0
do clear ip ospf process
</code></pre>
</details>
<details>
<summary>R2 (Area 0 + Area 3, ABR)</summary>
<pre><code>
router ospf 1
 router-id 2.2.2.2
 network 192.168.6.0 0.0.0.255 area 3
 network 192.168.12.0 0.0.0.3 area 0
 network 192.168.23.0 0.0.0.3 area 3
 passive-interface Loopback6
do clear ip ospf process
</code></pre>
</details>
<details>
<summary>R3 (Area 3, internal)</summary>
<pre><code>
router ospf 1
 router-id 3.3.3.3
 network 192.168.23.0 0.0.0.3 area 3
 network 192.168.4.0 0.0.0.255 area 3
 network 192.168.5.0 0.0.0.255 area 3
 passive-interface Loopback4
 passive-interface Loopback5
do clear ip ospf process
</code></pre>
</details>

Verify adjacency:

<details>
<summary>R1 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
2.2.2.2        0  FULL/ -    00:00:33   192.168.12.2   Serial1/0
</code></pre>
</details>
<details>
<summary>R2 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
1.1.1.1        0  FULL/ -    00:00:39   192.168.12.1   Serial1/0
3.3.3.3        0  FULL/ -    00:00:37   192.168.23.2   Serial1/1
</code></pre>
</details>

Check interface costs:

<details>
<summary>R1 — show ip ospf interface brief</summary>
<pre><code>
Interface  PID  Area  IP Address/Mask    Cost  State  Nbrs F/C
Se1/0      1    0     192.168.12.1/30    64    P2P    1/1
Lo1        1    1     192.168.1.1/24     1     LOOP   0/0
Lo2        1    1     192.168.2.1/24     1     LOOP   0/0
</code></pre>
</details>

---

### MD5 authentication on serial interfaces

<details>
<summary>R1</summary>
<pre><code>
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
interface Serial0/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>

Verify adjacency is restored after authentication is applied:

<details>
<summary>R2 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
1.1.1.1        0  FULL/ -    00:00:39   192.168.12.1   Serial1/0
3.3.3.3        0  FULL/ -    00:00:37   192.168.23.2   Serial1/1
</code></pre>
</details>

---

### Part 3 — Inter-area summarization

Without summarization, each loopback network in Area 1 is advertised separately. Add a summary route on R1 (ABR for Area 1):

```
R1(config)# router ospf 1
R1(config-router)# area 1 range 192.168.0.0 255.255.252.0
```

This sends a single summary route `192.168.0.0/22` to Area 0 instead of individual /24 entries.

Similarly on R2 for Area 3:

```
R2(config)# router ospf 1
R2(config-router)# area 3 range 192.168.4.0 255.255.254.0
```

Verify the routing table shrinks on R3 — inter-area routes `O IA` should be summarized.

---

*Network Engineer Course | Lab 05*
