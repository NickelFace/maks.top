---
title: "CCNA — 1.9 Virtualization and VRF"
date: 2026-05-07
description: "Server virtualization fundamentals (Type 1/Type 2 hypervisors), Docker/Kubernetes containers and VRF for creating isolated routing tables on Cisco IOS."
tags: ["CCNA", "Cisco", "virtualization", "VRF", "containers"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-09-virtualization/"
---

**Exam topic:** 1.12 Explain virtualization fundamentals (server virtualization, containers, VRF)

## Server Virtualization

A **hypervisor** is a software layer that allows multiple virtual machines (VMs) to run on a single physical server.

| Type | Description | Examples |
|---|---|---|
| **Type 1 (Bare-metal)** | Runs directly on hardware, no host OS | VMware ESXi, Microsoft Hyper-V, KVM |
| **Type 2 (Hosted)** | Runs on top of a regular OS | VMware Workstation, VirtualBox |

**Benefits of virtualization:**
- Reduced physical hardware (server consolidation)
- Application isolation
- Rapid deployment
- Snapshots (backup without downtime)
- Live VM migration between hosts (vMotion)

### vSwitch — Virtual Switch

Each hypervisor includes a **vSwitch** — a software switch that connects VMs to each other and to the physical network. Cisco Nexus 1000v is an example of an advanced vSwitch with VLAN, QoS and port security support.

---

## Containers

A **container** is a lightweight isolation method: applications share the host OS kernel but are isolated from each other.

| Parameter | VM | Container |
|---|---|---|
| Isolation | Full (separate OS) | Partial (shared kernel) |
| Overhead | High (GB) | Low (MB) |
| Startup time | Seconds to minutes | Milliseconds |
| Examples | VMware, Hyper-V | Docker, Kubernetes, LXC |

> Docker is the most widely used tool. Kubernetes (K8s) is used for container orchestration in a cluster.

---

## VRF — Virtual Routing and Forwarding

**VRF** creates multiple independent routing tables on a single physical router. Each VRF is an isolated "virtual network."

**Use cases:**
- Separating traffic between customers/departments without additional hardware
- MPLS VPN (VRF-Lite in enterprise networks)
- Separating management and data plane

```
! Create VRFs
ip vrf CUSTOMER-A
 rd 1:1

ip vrf CUSTOMER-B
 rd 1:2

! Assign interface to VRF
interface GigabitEthernet0/1
 ip vrf forwarding CUSTOMER-A
 ip address 192.168.1.1 255.255.255.0

! Routing within VRF
ip route vrf CUSTOMER-A 0.0.0.0 0.0.0.0 10.0.0.1

! Verification
show ip route vrf CUSTOMER-A
show ip vrf
show ip vrf interfaces
```

> **VRF-Lite** — a simplified version without MPLS, used in enterprise networks for traffic isolation.
