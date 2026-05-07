---
title: "CCNA — 1.10 Проверка IP-параметров на клиентских ОС"
date: 2026-05-07
description: "Commands for verifying IP address, subnet mask, gateway, DNS and ARP table on Windows, macOS and Linux, plus a network troubleshooting template."
tags: ["CCNA", "Cisco", "Windows", "Linux", "диагностика"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-10-ip-clients/"
---

**Exam topic:** 1.10 Verify IP parameters for Client OS (Windows, Mac OS, Linux)

## Windows

### Graphical Interface

`Control Panel → Network Connections → Adapter Properties → IPv4`

### Command Line

```cmd
ipconfig                    ! Brief output: IP, mask, gateway
ipconfig /all               ! Full output: + MAC, DHCP server, DNS, lease

ipconfig /release           ! Release DHCP lease
ipconfig /renew             ! Request new IP from DHCP
ipconfig /flushdns          ! Flush DNS cache

ping 8.8.8.8                ! Check connectivity
tracert 8.8.8.8             ! Trace route
nslookup google.com         ! DNS query
netstat -an                 ! Active connections and open ports
arp -a                      ! ARP table
```

**Key fields in `ipconfig /all`:**
- IPv4 Address
- Subnet Mask
- Default Gateway
- DHCP Server
- DNS Servers
- Physical Address (MAC)
- DHCP Enabled (Yes/No)
- Lease Obtained / Lease Expires

---

## macOS

```bash
ifconfig                    ! All interfaces (en0 = Ethernet, en1 = Wi-Fi)
ifconfig en0                ! Ethernet only

networksetup -getinfo "Ethernet"    ! IP, mask, gateway for interface
networksetup -getdnsservers "Ethernet"  ! DNS servers

ping 8.8.8.8
traceroute 8.8.8.8
nslookup google.com
arp -a                      ! ARP table
netstat -rn                 ! Routing table
```

**System Preferences → Network** — GUI for IP settings.

---

## Linux

```bash
ip addr                     ! All interfaces with IP addresses (replaces ifconfig)
ip addr show eth0           ! eth0 only
ip route show               ! Routing table (includes default gateway)
ip neigh                    ! ARP table

# Legacy commands (ifconfig, route — net-tools package):
ifconfig
ifconfig eth0
route -n

# DNS:
cat /etc/resolv.conf        ! DNS servers
nslookup google.com
dig google.com

# Connectivity checks:
ping 8.8.8.8
traceroute 8.8.8.8          ! (or tracepath)

# DHCP:
dhclient eth0               ! Request IP from DHCP (Debian/Ubuntu)
nmcli con show              ! NetworkManager — list connections
```

---

## Command Comparison Table

| Task | Windows | macOS | Linux |
|---|---|---|---|
| Show IP | `ipconfig` | `ifconfig` or `networksetup` | `ip addr` |
| Full information | `ipconfig /all` | `networksetup -getinfo` | `ip addr` + `ip route` |
| Default gateway | `ipconfig` (Default Gateway) | `netstat -rn` | `ip route show` |
| DNS servers | `ipconfig /all` | `networksetup -getdnsservers` | `cat /etc/resolv.conf` |
| ARP table | `arp -a` | `arp -a` | `ip neigh` |
| Ping | `ping` | `ping` | `ping` |
| Traceroute | `tracert` | `traceroute` | `traceroute` |
| DNS query | `nslookup` | `nslookup` / `dig` | `nslookup` / `dig` |
| Renew DHCP | `ipconfig /renew` | Reconnect in GUI | `dhclient` |

---

## Troubleshooting Template (for the exam)

1. `ipconfig /all` (Win) / `ip addr` (Linux) → verify IP, mask, gateway
2. `ping 127.0.0.1` → verify TCP/IP stack
3. `ping <default gateway>` → verify connectivity to router
4. `ping 8.8.8.8` → verify internet connectivity
5. `nslookup google.com` → verify DNS
