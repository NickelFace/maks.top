---
title: "Network Engineer — 02. STP"
date: 2026-04-14
description: "Lab: deploying a switched network with redundant links. Root bridge election, port cost, port priority."
tags: ["Networking", "STP", "Spanning Tree", "Cisco"]
categories: ["Network Engineer"]
---

## Lab: Deploying a Switched Network with Redundant Links

### Topology

![STP scheme](/img/neteng/02/Scheme.png)

### Addressing table

| Device | Interface | IP address  | Subnet Mask   |
| ------ | --------- | ----------- | ------------- |
| S1     | VLAN 1    | 192.168.1.1 | 255.255.255.0 |
| S2     | VLAN 1    | 192.168.1.2 | 255.255.255.0 |
| S3     | VLAN 1    | 192.168.1.3 | 255.255.255.0 |

### Goals

- **Part 1.** Build the network and configure basic device parameters
- **Part 2.** Elect the Root bridge
- **Part 3.** Observe STP port selection based on port cost
- **Part 4.** Observe STP port selection based on port priority

---

### Part 1 — Basic setup

Build the network and assign IP addresses to VLAN 1.

<details>
<summary>S1</summary>
<pre><code>
enable
conf t
hostname S1
interface vlan 1
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
enable
conf t
hostname S2
interface vlan 1
ip address 192.168.1.2 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
enable
conf t
hostname S3
interface vlan 1
ip address 192.168.1.3 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>

---

### Part 2 — Root bridge election

Check current STP status on each switch:

```
show spanning-tree
```

<details>
<summary>STP status example</summary>

![STP status](/img/neteng/02/stp_status.png)

</details>

The switch with the lowest Bridge ID becomes the Root bridge. The Bridge ID consists of priority (default 32768) and MAC address.

To force a specific switch to become Root:

```
spanning-tree vlan 1 root primary
```

---

### Part 3 — Port selection by cost

STP selects the path with the lowest cost to the Root. Default port costs:

| Link speed | Cost |
| ---------- | ---- |
| 10 Mbps    | 100  |
| 100 Mbps   | 19   |
| 1 Gbps     | 4    |

Change port cost to influence path selection:

```
interface Ethernet 0/1
spanning-tree cost 18
```

<details>
<summary>Port cost result</summary>

![Port cost after change](/img/neteng/02/44res_cost.png)

</details>

---

### Part 4 — Port selection by priority

When costs are equal, STP prefers the port with the lowest port priority. Default is 128.

```
interface Ethernet 0/1
spanning-tree port-priority 64
```

<details>
<summary>Port status after priority change</summary>

![Port status after](/img/neteng/02/port_status_after.png)

</details>

---

*Network Engineer Course | Lab 02*
