---
title: "Network Engineer — 04. OSPF Basics"
date: 2025-09-14
description: "Lab: configuring OSPFv2 single-area. Router IDs, passive interfaces, neighbors, routing table, OSPF metric."
tags: ["Networking", "OSPF", "Routing", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
lang_pair: "/posts/ru/neteng-04-ospf-basics/"
---

## Lab: Configuring OSPFv2 for One Area

### Topology

![OSPFv2 topology](/img/neteng/04/OSPFv2.png)

### Addressing table

| Device | Interface    | IP address   | Subnet Mask     | Gateway     |
| ------ | ------------ | ------------ | --------------- | ----------- |
| R1     | G0/0         | 192.168.1.1  | 255.255.255.0   | —           |
|        | S0/0/0 (DCE) | 192.168.12.1 | 255.255.255.252 | —           |
|        | S0/0/1       | 192.168.13.1 | 255.255.255.252 | —           |
| R2     | G0/0         | 192.168.2.1  | 255.255.255.0   | —           |
|        | S0/0/0       | 192.168.12.2 | 255.255.255.252 | —           |
|        | S0/0/1 (DCE) | 192.168.23.1 | 255.255.255.252 | —           |
| R3     | G0/0         | 192.168.3.1  | 255.255.255.0   | —           |
|        | S0/0/0 (DCE) | 192.168.13.2 | 255.255.255.252 | —           |
|        | S0/0/1       | 192.168.23.2 | 255.255.255.252 | —           |
| PC-A   | NIC          | 192.168.1.3  | 255.255.255.0   | 192.168.1.1 |
| PC-B   | NIC          | 192.168.2.3  | 255.255.255.0   | 192.168.2.1 |
| PC-C   | NIC          | 192.168.3.3  | 255.255.255.0   | 192.168.3.1 |

### Goals

- **Part 1.** Build the network, configure basic device parameters
- **Part 2.** Configure and verify OSPF routing
- **Part 3.** Change router IDs
- **Part 4.** Configure passive interfaces
- **Part 5.** Change the OSPF metric

---

### Part 1 — Basic device setup

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R1
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Ethernet0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
interface Serial1/0
 clock rate 128000
 ip address 192.168.12.1 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 192.168.13.1 255.255.255.252
 no shutdown
end
write
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
hostname R2
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Serial1/0
 ip address 192.168.12.2 255.255.255.252
 no shutdown
interface Serial1/1
 clock rate 128000
 ip address 192.168.23.1 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.2.1 255.255.255.0
 no shutdown
end
write
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
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Serial1/0
 clock rate 128000
 ip address 192.168.13.2 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 192.168.23.2 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.3.1 255.255.255.0
 no shutdown
do write
</code></pre>
</details>
<details>
<summary>PC-A / PC-B / PC-C</summary>
<pre><code>
set pcname PC-A
ip 192.168.1.3 24 192.168.1.1

set pcname PC-B
ip 192.168.2.3 24 192.168.2.1

set pcname PC-C
ip 192.168.3.3 24 192.168.3.1
</code></pre>
</details>

---

### Part 2 — Configure and verify OSPF

<details>
<summary>R1</summary>
<pre><code>
router ospf 1
network 192.168.1.0 0.0.0.255 area 0
network 192.168.12.0 0.0.0.3 area 0
network 192.168.13.0 0.0.0.3 area 0
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
router ospf 1
network 192.168.2.0 0.0.0.255 area 0
network 192.168.12.0 0.0.0.3 area 0
network 192.168.23.0 0.0.0.3 area 0
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
router ospf 1
network 192.168.3.0 0.0.0.255 area 0
network 192.168.13.0 0.0.0.3 area 0
network 192.168.23.0 0.0.0.3 area 0
</code></pre>
</details>

Check neighbors and routing table:

```
show ip ospf neighbor
show ip route
show ip protocols
show ip ospf interface brief
```

<details>
<summary>R1 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.23.2      0   FULL/  -        00:00:34    192.168.13.2    Serial1/1
192.168.23.1      0   FULL/  -        00:00:39    192.168.12.2    Serial1/0
</code></pre>
</details>
<details>
<summary>R1 — show ip route</summary>
<pre><code>
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, Ethernet0/0
O     192.168.2.0/24 [110/74] via 192.168.12.2, Serial1/0
O     192.168.3.0/24 [110/74] via 192.168.13.2, Serial1/1
      192.168.12.0/30 is directly connected, Serial1/0
      192.168.13.0/30 is directly connected, Serial1/1
O        192.168.23.0 [110/128] via 192.168.13.2, Serial1/1
</code></pre>
</details>
<details>
<summary>R1 — show ip ospf interface brief</summary>
<pre><code>
Interface    PID   Area    IP Address/Mask      Cost  State  Nbrs F/C
Se1/1        1     0       192.168.13.1/30      64    P2P    1/1
Se1/0        1     0       192.168.12.1/30      64    P2P    1/1
Et0/0        1     0       192.168.1.1/24       10    DR     0/0
</code></pre>
</details>

Verify end-to-end connectivity:

<details>
<summary>PC-A ping</summary>
<pre><code>
PC-A> ping 192.168.2.3
84 bytes from 192.168.2.3 icmp_seq=1 ttl=62 time=10.127 ms
PC-A> ping 192.168.3.3
84 bytes from 192.168.3.3 icmp_seq=1 ttl=62 time=11.863 ms
</code></pre>
</details>

---

### Part 3 — Router IDs

OSPF uses the Router ID to identify each router in the process. Selection order:
1. Explicitly configured `router-id` command
2. Highest loopback IP
3. Highest active physical interface IP

Assign explicit Router IDs:

```
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# end
R1# clear ip ospf process
```

Repeat for R2 (`2.2.2.2`) and R3 (`3.3.3.3`).

---

### Part 4 — Passive interfaces

A passive interface stops sending OSPF hello packets — useful for LAN interfaces with no OSPF neighbors:

```
R1(config)# router ospf 1
R1(config-router)# passive-interface GigabitEthernet0/0
```

To make all interfaces passive by default and then selectively enable:

```
passive-interface default
no passive-interface Serial1/0
no passive-interface Serial1/1
```

---

### Part 5 — OSPF metric (cost)

OSPF cost = reference bandwidth / interface bandwidth. Default reference: 100 Mbps.

Change reference bandwidth (apply on all routers):

```
router ospf 1
auto-cost reference-bandwidth 1000
```

Override cost on a specific interface:

```
interface Serial1/0
ip ospf cost 50
```

---

*Network Engineer Course | Lab 04*
