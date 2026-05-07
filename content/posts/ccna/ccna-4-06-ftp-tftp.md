---
title: "CCNA — 4.6 FTP и TFTP"
date: 2026-05-07
description: "Comparison of TFTP (UDP 69) and FTP (TCP 20/21): capabilities, usage for Cisco IOS and configuration backup, and SCP as a secure alternative."
tags: ["CCNA", "Cisco", "FTP", "TFTP", "IP-сервисы"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-4-06-ftp-tftp/"
---

**Exam topic:** 4.9 Describe the capabilities and function of TFTP/FTP in the network
**Odom:** Vol.2, Ch. 12 (Miscellaneous IP Services)

---

## TFTP — Trivial File Transfer Protocol

**TFTP** — a simplified file transfer protocol with no authentication.

| Parameter | Value |
|---|---|
| Transport | **UDP port 69** |
| Authentication | None |
| Directories | None (no navigation) |
| Speed | Slower than FTP (ack per block) |
| Security | No encryption |
| Usage | IOS images, configurations on Cisco |

**Usage on Cisco IOS:**
```
! Copy running-config to TFTP server:
copy running-config tftp:
! Enter: TFTP server IP, filename

! Download IOS image from TFTP:
copy tftp: flash:
! Enter: TFTP server IP, filename

! Restore configuration from TFTP:
copy tftp: running-config
copy tftp: startup-config
```

**Verification:**
```
show flash:          ! View flash contents
dir flash:           ! List files
```

---

## FTP — File Transfer Protocol

**FTP** — a full-featured file transfer protocol with authentication.

| Parameter | Value |
|---|---|
| Transport | **TCP port 21** (control) + **TCP port 20** (data) |
| Authentication | Username/password |
| Directories | Yes — file system navigation |
| Modes | Active (server connects to client) / Passive (client connects to server) |
| Security | No encryption (plaintext) |
| Secure version | **FTPS** (FTP + TLS) or **SFTP** (FTP over SSH) |

**FTP on Cisco IOS:**
```
! Configure FTP client:
ip ftp username admin
ip ftp password cisco123

! Copy via FTP:
copy ftp: flash:
copy running-config ftp:
```

---

## TFTP vs FTP Comparison

| Parameter | TFTP | FTP |
|---|---|---|
| Protocol | UDP 69 | TCP 20/21 |
| Authentication | None | Yes (user/pass) |
| Navigation | None | Yes |
| Reliability | Low (UDP) | High (TCP) |
| Security | None | None (plaintext) |
| Secure alternative | — | FTPS, SFTP |
| Usage on Cisco | IOS backup/restore | IOS backup/restore |

---

## SCP — Recommended Alternative

**SCP** (Secure Copy Protocol) — encrypted copy over SSH. Recommended over TFTP/FTP.

```
! Copy running-config to SCP server:
copy running-config scp:

! Download from SCP:
copy scp: flash:
```
