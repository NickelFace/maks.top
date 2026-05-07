---
title: "CCNA — 5.5 IPsec and VPN"
date: 2026-04-24
description: "VPN types (site-to-site and remote access), IPsec protocols (AH and ESP), Transport and Tunnel modes, IKE phases and negotiation algorithms, GRE over IPsec, and SSL VPN (Cisco AnyConnect)."
tags: ["CCNA", "Cisco", "IPsec", "VPN", "security"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-5-05-ipsec-vpn/"
---

**Exam topic:** 5.5 Describe IPsec remote access and site-to-site VPNs
**Odom:** Vol.2, Security chapters

---

## What is a VPN

**VPN** (Virtual Private Network) creates an encrypted tunnel over a public network (the Internet), ensuring data confidentiality and integrity.

**VPN goals:**
- **Confidentiality** — data encryption
- **Integrity** — protection against data modification in transit
- **Authentication** — verifying the identity of participants
- **Anti-replay** — protection against replay attacks

---

## VPN Types

### Site-to-Site VPN

Connects two offices over the Internet. The tunnel is permanent and configured on routers or firewalls.

```
Office A                       Office B
[LAN] → [Router] ==IPsec==> [Router] → [LAN]
           ↑                      ↑
     192.168.1.0/24          192.168.2.0/24
```

- Transparent to end users
- Example: branch office connecting to headquarters

### Remote Access VPN

An individual user connects to the corporate network from anywhere.

```
[Employee Laptop] ==IPsec/SSL==> [VPN Concentrator/ASA] → [Corporate Network]
```

- Requires a VPN client on the user's device
- Example: Cisco AnyConnect (SSL/TLS VPN)

---

## IPsec — Protocol Stack

**IPsec** (IP Security) is a suite of protocols for securing IP traffic.

### IPsec Modes

| Mode | What is encrypted | Use case |
|---|---|---|
| **Transport Mode** | Payload only (data) | Host-to-Host |
| **Tunnel Mode** | Entire IP packet (new IP header added outside) | Site-to-Site VPN |

### IPsec Protocols

| Protocol | Encryption | Authentication | Description |
|---|---|---|---|
| **AH** (Authentication Header) | No | Yes | Integrity only, no encryption |
| **ESP** (Encapsulating Security Payload) | **Yes** | Yes | Encryption + integrity. Used in real VPNs |

> For the exam: **ESP** is the standard for IPsec VPN (AH does not encrypt).

---

## IKE — Parameter Negotiation

**IKE** (Internet Key Exchange) is a protocol for automatically negotiating IPsec parameters.

**Phase 1 (IKE Phase 1):**
- Establishes a secure management channel (ISAKMP SA)
- Negotiates: encryption algorithm, hash, authentication, DH group
- Modes: Main Mode (6 messages, protected) / Aggressive Mode (3 messages, faster)

**Phase 2 (IKE Phase 2):**
- Creates IPsec SA (Security Association) for data traffic
- Negotiates: protocol (ESP/AH), encryption and authentication algorithms

**IKEv2** — a more modern version, simpler and more efficient than IKEv1.

---

## IPsec Algorithms

| Type | Algorithms | Recommendation |
|---|---|---|
| Encryption | DES, 3DES, **AES-128/256** | AES-256 |
| Hash/Integrity | MD5, SHA-1, **SHA-256/384** | SHA-256+ |
| Authentication | Pre-Shared Key (PSK), RSA | PKI/certificates |
| DH Group | 1, 2, 5, **14, 19, 20** | 14+ |

> DES and MD5 are legacy algorithms — use only when backward compatibility is required.

---

## GRE over IPsec

**GRE** (Generic Routing Encapsulation) is a tunneling protocol that supports routing protocols (OSPF, EIGRP) inside the tunnel. IPsec encrypts the GRE traffic.

```
interface Tunnel0
 ip address 10.0.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 203.0.113.2
 tunnel mode gre ip
```

---

## SSL/TLS VPN — Cisco AnyConnect

**SSL VPN** uses HTTPS (TCP 443). No IPsec client required — works through a browser or AnyConnect.

| Type | Description |
|---|---|
| **Clientless SSL VPN** | Browser-based, no client — limited access |
| **Full Tunnel (AnyConnect)** | Full network access, client installed on PC |

---

## Site-to-Site vs Remote Access Comparison

| Parameter | Site-to-Site | Remote Access |
|---|---|---|
| Participants | Two devices (routers) | Device — VPN server |
| Tunnel | Permanent | On-demand |
| Configuration | On routers/firewalls | VPN client on user device |
| Protocol | IPsec (ESP, IKEv1/v2) | IPsec or SSL/TLS |
| Cisco example | Crypto map / VTI | ASA + AnyConnect |
