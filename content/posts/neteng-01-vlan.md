---
title: "Network Engineer — 01. VLAN"
date: 2026-04-14
description: "Lab: configuring Extended VLAN, VTP and STP networks. Trunk links, DTP, extended-range VLANs."
tags: ["Networking", "VLAN", "VTP", "Cisco"]
categories: ["Network Engineer"]
---

## Lab: Configuring Extended VLAN, VTP and STP Networks

### Topology

![VLAN topology](/img/neteng/01/VLAN.png)

### Addressing table

| Device | Interface | IP address   | Subnet Mask   |
| ------ | --------- | ------------ | ------------- |
| S1     | VLAN 99   | 192.168.99.1 | 255.255.255.0 |
| S2     | VLAN 99   | 192.168.99.2 | 255.255.255.0 |
| S3     | VLAN 99   | 192.168.99.3 | 255.255.255.0 |
| PC-A   | NIC       | 192.168.10.1 | 255.255.255.0 |
| PC-B   | NIC       | 192.168.20.1 | 255.255.255.0 |
| PC-C   | NIC       | 192.168.10.2 | 255.255.255.0 |

### Goals

- Configure VTP, DTP and trunk links between switches
- S2 acts as VTP server; S1 and S3 as clients
- Add VLANs and assign ports
- Configure extended-range VLANs on S1 in VTP transparent mode

---

### Part 1 — Basic device setup

1. Build the network according to the topology.

<details>
<summary>S1</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
hostname S1
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.2 255.255.255.0
no shutdown
exit
hostname S2
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.3 255.255.255.0
no shutdown
exit
hostname S3
do copy run start
</code></pre>
</details>

2. Disable DNS lookup on each switch:

```
no ip domain-lookup
```

3. Set privileged and console passwords, enable logging synchronous:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
</code></pre>
</details>

4. Set a login banner:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
Banner motd "**This is a secure system. Authorized Access Only!
</code></pre>
</details>

---

### Part 2 — VTP configuration

<details>
<summary>S1 (client)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode client
</code></pre>
</details>
<details>
<summary>S2 (server)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode server
end
vtp primary server force
</code></pre>
</details>
<details>
<summary>S3 (client)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode client
</code></pre>
</details>

---

### Part 3 — Trunk ports

Switch ports to trunk mode so VTP can propagate:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
interface Ethernet 0/3
switchport trunk encapsulation dot1q
switchport mode trunk
interface Ethernet 0/1
switchport trunk encapsulation dot1q
switchport mode trunk
</code></pre>
</details>

```
show interfaces trunk
```

<details>
<summary>S3 output</summary>
<pre><code>
Port        Mode             Encapsulation  Status        Native vlan
Et0/1       on               802.1q         trunking      1
Et0/3       on               802.1q         trunking      1
</code></pre>
</details>

---

### Part 4 — Create VLANs on the server

<details>
<summary>S2</summary>
<pre><code>
vlan 999
name VTP_Lab
vlan 10
name Red
vlan 20
name Blue
vlan 30
name Yellow
vlan 99
name Management
</code></pre>
</details>

Verify VLANs propagated to clients:

<details>
<summary>S1 — show vlan brief</summary>
<pre><code>
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/2
10   Red                              active
20   Blue                             active
30   Yellow                           active
999  VTP_Lab                          active
</code></pre>
</details>
<details>
<summary>S3 — show vlan brief</summary>
<pre><code>
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/2
10   Red                              active
20   Blue                             active
30   Yellow                           active
999  VTP_Lab                          active
</code></pre>
</details>

---

### Part 5 — Connectivity check

<details>
<summary>PC-A</summary>
<pre><code>
VPCS> ping 192.168.10.2
84 bytes from 192.168.10.2 icmp_seq=1 ttl=64 time=0.722 ms
84 bytes from 192.168.10.2 icmp_seq=2 ttl=64 time=1.135 ms
84 bytes from 192.168.10.2 icmp_seq=3 ttl=64 time=1.121 ms
</code></pre>
</details>
<details>
<summary>PC-C</summary>
<pre><code>
VPCS> ping 192.168.10.1
84 bytes from 192.168.10.1 icmp_seq=1 ttl=64 time=0.822 ms
84 bytes from 192.168.10.1 icmp_seq=2 ttl=64 time=1.187 ms
84 bytes from 192.168.10.1 icmp_seq=3 ttl=64 time=1.427 ms
</code></pre>
</details>

---

*Network Engineer Course | Lab 01*
