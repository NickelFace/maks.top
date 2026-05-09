---
title: "CCNA — 4.5 QoS"
date: 2026-09-03
description: "Quality of Service: traffic classification and marking (DSCP/CoS), LLQ/CBWFQ queuing, policing vs shaping and WRED — Per-Hop Behavior model for VoIP and video prioritization."
tags: ["CCNA", "Cisco", "QoS", "DSCP", "IP services"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-4-05-qos/"
---

**Exam topic:** 4.7 Explain the forwarding per-hop behavior (PHB) for QoS such as classification, marking, queuing, congestion, policing, and shaping
**Odom:** Vol.2, Ch. 11

---

## Why QoS is Needed

In modern networks, a single link carries **voice (VoIP)**, **video**, and **data**. Without QoS, all traffic competes for bandwidth equally. QoS allows:
- Prioritizing delay-sensitive traffic (VoIP, video)
- Limiting undesirable traffic
- Guaranteeing minimum bandwidth for critical applications

**Key problems without QoS:**

| Problem | Impact on VoIP |
|---|---|
| **Bandwidth** (insufficient) | Interruptions, packet loss |
| **Delay** | Echo, out-of-sync conversation |
| **Jitter** | Uneven delays → voice distortion |
| **Packet loss** | Dropped words |

> VoIP requirements: delay < 150 ms, jitter < 30 ms, loss < 1%.

---

## Per-Hop Behavior (PHB) — QoS Model

QoS works on the **PHB** principle: each node (router/switch) processes a packet independently, based on its marking.

### QoS Steps:

```
1. Classification
2. Marking
3. Queuing
4. Scheduling
5. Policing / Shaping
6. Congestion avoidance
```

---

## 1. Classification

Identifying the traffic type to apply a policy.

**Classification methods:**
- **ACL** (IP addresses, ports)
- **NBAR** (Network-Based Application Recognition — by application signature)
- **DSCP/CoS marking** (by existing mark)

```
class-map match-any VOICE
 match protocol rtp            ! NBAR: RTP traffic
 match dscp ef                 ! or by DSCP EF
```

---

## 2. Marking

Tags packets for processing on downstream devices.

### L3 — IP Precedence and DSCP

**DSCP** (Differentiated Services Code Point) — 6 bits in the IP header (part of the ToS/DSCP field).

| Class | DSCP Name | Value | Usage |
|---|---|---|---|
| Best Effort | BE / CS0 | 0 | Regular data |
| Expedited Forwarding | **EF** | 46 | VoIP (voice) |
| Assured Forwarding 4 | **AF41** | 34 | Video |
| Assured Forwarding 3 | **AF31** | 26 | Critical data |
| Class Selector 3 | CS3 | 24 | Signaling |

**AF (Assured Forwarding):** AFxy — x = class (1–4), y = drop probability (1–3).
- AF11, AF12, AF13 — class 1 (low/medium/high drop)
- AF41, AF42, AF43 — class 4

### L2 — CoS (Class of Service)

**CoS** — 3 bits in the 802.1Q tag (Ethernet with VLAN only). Values 0–7.

```
interface GigabitEthernet0/0
 mls qos trust dscp          ! Trust DSCP from IP phone
 mls qos trust cos           ! Trust CoS (switchport)
```

**Trust boundary:**
- Typically at the IP phone or access point
- PCs are NOT trusted — they can forge DSCP

```
! Marking in policy-map:
policy-map MARK-VOICE
 class VOICE
  set dscp ef
 class VIDEO
  set dscp af41
 class class-default
  set dscp default
```

---

## 3. Queuing and Scheduling

### FIFO (First In, First Out)
- Single queue, no priorities
- Not suitable for mixed traffic

### WFQ (Weighted Fair Queuing)
- Multiple weighted queues
- Automatically separates flows

### CBWFQ (Class-Based WFQ)
- Queues defined by class-maps
- Guaranteed bandwidth per class

### LLQ (Low Latency Queuing) = CBWFQ + Priority Queue
- **Priority queue (PQ)** for VoIP — serviced first
- Other classes handled by CBWFQ

```
policy-map QOS-POLICY
 class VOICE
  priority 512                ! PQ: 512 kbps guaranteed
 class VIDEO
  bandwidth 2048              ! CBWFQ: minimum 2 Mbps
 class CRITICAL-DATA
  bandwidth percent 20        ! 20% of total bandwidth
 class class-default
  fair-queue                  ! WFQ for remaining traffic
```

---

## 4. Policing vs Shaping

| Parameter | Policing | Shaping |
|---|---|---|
| Action when exceeded | **Drop packets** | **Buffer** (delay) |
| Applied to | Inbound/outbound | Outbound only |
| Effect on delay | None | Increases delay |
| Usage | ISP rate limiting | Traffic smoothing |

```
! Policing: limit inbound HTTP traffic to 1 Mbps
policy-map POLICE-HTTP
 class HTTP
  police rate 1000000 bps
   conform-action transmit
   exceed-action drop

! Shaping: limit outbound traffic (smoothing)
policy-map SHAPE-OUTPUT
 class class-default
  shape average 1000000       ! 1 Mbps
```

---

## 5. Congestion Avoidance — WRED

**WRED** (Weighted Random Early Detection) — starts dropping packets **randomly** as queue fills, without waiting for 100% capacity. Higher DSCP → lower drop probability.

Goal: prevent **TCP global synchronization** (when all flows simultaneously reduce their rates).

---

## Applying QoS

```
interface GigabitEthernet0/1
 service-policy input MARK-VOICE          ! On inbound traffic
 service-policy output QOS-POLICY         ! On outbound traffic
```

**Verification:**
```
show policy-map interface Gi0/1
show class-map
show policy-map
```

---

## QoS Exam Checklist

- Classification → Marking → Queuing → Scheduling → Policing/Shaping
- DSCP EF = 46 = VoIP
- LLQ = CBWFQ + Priority Queue for voice
- Policing = drop, Shaping = buffer/delay
- Trust boundary — where we start trusting DSCP/CoS
- `service-policy input/output` applies the policy
