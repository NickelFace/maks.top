---
title: "Network Engineer — 03. HSRP"
date: 2025-09-06
description: "Lab: configuring first-hop redundancy with HSRP. Active/standby routers, virtual IP, priority and preemption."
tags: ["Networking", "HSRP", "Redundancy", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
lang_pair: "/posts/neteng/ru/neteng-03-hsrp/"
---

## Lab: Configuring HSRP (First-Hop Redundancy)

### Topology

![HSRP topology](/img/neteng/03/HSRP.png)

### Addressing table

| Device | Interface    | IP address      | Subnet Mask     | Gateway     |
| ------ | ------------ | --------------- | --------------- | ----------- |
| R1     | G0/1         | 192.168.1.1     | 255.255.255.0   | —           |
|        | S0/0/0 (DCE) | 10.1.1.1        | 255.255.255.252 | —           |
| R2     | S0/0/0       | 10.1.1.2        | 255.255.255.252 | —           |
|        | S0/0/1 (DCE) | 10.2.2.2        | 255.255.255.252 | —           |
|        | Lo1          | 209.165.200.225 | 255.255.255.224 | —           |
| R3     | G0/1         | 192.168.1.3     | 255.255.255.0   | —           |
|        | S0/0/1       | 10.2.2.1        | 255.255.255.252 | —           |
| PC-A   | NIC          | 192.168.1.31    | 255.255.255.0   | 192.168.1.1 |
| PC-C   | NIC          | 192.168.1.33    | 255.255.255.0   | 192.168.1.3 |

### Goals

- **Part 1.** Build the network and verify connectivity
- **Part 2.** Configure HSRP first-hop redundancy

---

### Part 1 — Basic router setup

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R1
enable secret class
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/0
 ip address 10.1.1.1 255.255.255.252
 clock rate 128000
 no shutdown
interface Ethernet0/0
 ip address 192.168.1.1 255.255.255.0
 duplex full
 no shutdown
do copy run start
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R2
enable secret class
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/0
 ip address 10.1.1.2 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 10.2.2.2 255.255.255.252
 clock rate 128000
 no shutdown
interface Loopback0
 ip address 209.165.200.225 255.255.255.224
do copy run start
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R3
enable secret class
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/1
 ip address 10.2.2.1 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.1.3 255.255.255.0
 duplex full
 no shutdown
do copy run start
</code></pre>
</details>
<details>
<summary>PC-A</summary>
<pre><code>
set pcname PC-A
ip 192.168.1.31 192.168.1.1 24
</code></pre>
</details>
<details>
<summary>PC-C</summary>
<pre><code>
set pcname PC-C
ip 192.168.1.33 192.168.1.3 24
</code></pre>
</details>

---

### OSPF for Internet access

<details>
<summary>R1</summary>
<pre><code>
router ospf 1
 router-id 1.1.1.1
 network 10.1.1.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
router ospf 1
 router-id 2.2.2.2
 network 10.1.1.0 0.0.0.3 area 0
 network 10.2.2.0 0.0.0.3 area 0
 default-information originate
ip route 0.0.0.0 0.0.0.0 Loopback0
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
router ospf 1
 router-id 3.3.3.3
 network 10.2.2.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0
</code></pre>
</details>

Verify routing tables and ping from PCs to `209.165.200.225`.

<details>
<summary>PC-A trace</summary>
<pre><code>
PC-A> trace 209.165.200.225
1   192.168.1.1   1.555 ms
2   10.1.1.2      10.647 ms
</code></pre>
</details>

---

### Part 2 — HSRP configuration

HSRP provides a virtual IP address shared between R1 and R3. R1 becomes Active with priority 150; R3 becomes Standby.

<details>
<summary>R1 (Active)</summary>
<pre><code>
interface Ethernet0/0
 standby 1 ip 192.168.1.254
 standby version 2
 standby 1 priority 150
 standby 1 preempt
</code></pre>
</details>
<details>
<summary>R3 (Standby)</summary>
<pre><code>
interface Ethernet0/0
 standby 1 ip 192.168.1.254
 standby version 2
</code></pre>
</details>

Change default gateway on PC-A, PC-C, S1, S3 to the virtual IP: **192.168.1.254**

---

### Verification

```
show standby brief
```

<details>
<summary>R1</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    150 P Active  local           unknown         192.168.1.254
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    100   Standby 192.168.1.1     local           192.168.1.254
</code></pre>
</details>

Test failover — ping Internet continuously and disconnect R1:

<details>
<summary>PC-A continuous ping</summary>
<pre><code>
PC-A> ping 209.165.200.225 -t
84 bytes icmp_seq=1  time=12 ms
...
209.165.200.225 icmp_seq=9 timeout   ← R1 disconnected
209.165.200.225 icmp_seq=10 timeout
84 bytes icmp_seq=11 time=11 ms      ← R3 took over
</code></pre>
</details>

---

### Changing HSRP priorities

Raise R3 priority to 200 and make it Active:

```
R3(config)# interface Ethernet0/0
R3(config-if)# standby 1 priority 200
R3(config-if)# standby 1 preempt
```

<details>
<summary>R3 after change</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    200 P Active  local           unknown         192.168.1.254
</code></pre>
</details>

**Key insight:** Without `preempt`, a higher-priority router will not take over from the currently Active router. Both `priority` and `preempt` are needed.

---

*Network Engineer Course | Lab 03*
