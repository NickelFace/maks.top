---
title: "Network Engineer — 03. EtherChannel"
date: 2026-04-14
description: "Lab: configuring EtherChannel with LACP and PAgP. Port-channel setup, VLAN trunking over aggregated links."
tags: ["Networking", "EtherChannel", "LACP", "PAgP", "Cisco"]
categories: ["Network Engineer"]
---

## Lab: Configuring EtherChannel

### Topology

![EtherChannel topology](/img/neteng/03/Etherchannel.png)

### Addressing table

| Device | Interface | IP address    | Subnet Mask   |
| ------ | --------- | ------------- | ------------- |
| S1     | VLAN 99   | 192.168.99.11 | 255.255.255.0 |
| S2     | VLAN 99   | 192.168.99.12 | 255.255.255.0 |
| S3     | VLAN 99   | 192.168.99.13 | 255.255.255.0 |
| PC-A   | NIC       | 192.168.10.1  | 255.255.255.0 |
| PC-B   | NIC       | 192.168.10.2  | 255.255.255.0 |
| PC-C   | NIC       | 192.168.10.3  | 255.255.255.0 |

### Goals

- **Part 1.** Configure basic switch parameters
- **Part 2.** Configure PAgP EtherChannel (S1–S3)
- **Part 3.** Configure LACP EtherChannel (S1–S2)

---

### Part 1 — Basic switch setup

<details>
<summary>S1</summary>
<pre><code>
enable
conf t
hostname S1
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.11 255.255.255.0
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
enable
conf t
hostname S2
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.12 255.255.255.0
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
enable
conf t
hostname S3
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.13 255.255.255.0
do copy run start
</code></pre>
</details>

---

### Part 2 — PAgP EtherChannel (S1–S3)

PAgP (Port Aggregation Protocol) is a Cisco proprietary protocol. Modes: `desirable` (active negotiation) and `auto` (passive).

<details>
<summary>S1</summary>
<pre><code>
interface range f0/3-4
channel-group 1 mode desirable
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 1
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
interface range f0/3-4
channel-group 1 mode auto
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 1
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>

Verify:

```
show etherchannel summary
show etherchannel port-channel
```

---

### Part 3 — LACP EtherChannel (S1–S2)

LACP (Link Aggregation Control Protocol) is an open standard (802.3ad). Modes: `active` and `passive`.

<details>
<summary>S1</summary>
<pre><code>
interface range f0/1-2
channel-group 2 mode active
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 2
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
interface range f0/1-2
channel-group 2 mode passive
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 2
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>

---

*Network Engineer Course | Lab 03*
