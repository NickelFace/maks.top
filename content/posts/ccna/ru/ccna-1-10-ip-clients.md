---
title: "CCNA — 1.10 Проверка IP-параметров на клиентских ОС"
date: 2026-02-15
description: "Команды для проверки IP-адреса, маски, шлюза, DNS и ARP-таблицы на Windows, macOS и Linux, а также шаблон диагностики сетевых проблем."
tags: ["CCNA", "Cisco", "Windows", "Linux", "диагностика"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-1-10-ip-clients/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 1.10 Verify IP parameters for Client OS (Windows, Mac OS, Linux)

## Windows

### Графический интерфейс

`Панель управления → Сетевые подключения → Свойства адаптера → IPv4`

### Командная строка

```cmd
ipconfig                    ! Краткий вывод: IP, маска, шлюз
ipconfig /all               ! Полный вывод: + MAC, DHCP-сервер, DNS, lease

ipconfig /release           ! Освободить DHCP-аренду
ipconfig /renew             ! Запросить новый IP от DHCP
ipconfig /flushdns          ! Очистить кэш DNS

ping 8.8.8.8                ! Проверить связность
tracert 8.8.8.8             ! Трассировка маршрута
nslookup google.com         ! DNS-запрос
netstat -an                 ! Активные соединения и открытые порты
arp -a                      ! ARP-таблица
```

**Ключевые поля `ipconfig /all`:**
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
ifconfig                    ! Все интерфейсы (en0 = Ethernet, en1 = Wi-Fi)
ifconfig en0                ! Только Ethernet

networksetup -getinfo "Ethernet"    ! IP, маска, шлюз для интерфейса
networksetup -getdnsservers "Ethernet"  ! DNS-серверы

ping 8.8.8.8
traceroute 8.8.8.8
nslookup google.com
arp -a                      ! ARP-таблица
netstat -rn                 ! Таблица маршрутизации
```

**System Preferences → Network** — графический интерфейс для IP-настроек.

---

## Linux

```bash
ip addr                     ! Все интерфейсы с IP-адресами (замена ifconfig)
ip addr show eth0           ! Только eth0
ip route show               ! Таблица маршрутизации (+ default gateway)
ip neigh                    ! ARP-таблица

# Старые команды (ifconfig, route — пакет net-tools):
ifconfig
ifconfig eth0
route -n

# DNS:
cat /etc/resolv.conf        ! DNS-серверы
nslookup google.com
dig google.com

# Проверка связности:
ping 8.8.8.8
traceroute 8.8.8.8          ! (или tracepath)

# DHCP:
dhclient eth0               ! Запросить IP от DHCP (Debian/Ubuntu)
nmcli con show              ! NetworkManager — список соединений
```

---

## Сравнительная таблица команд

| Задача | Windows | macOS | Linux |
|---|---|---|---|
| Показать IP | `ipconfig` | `ifconfig` или `networksetup` | `ip addr` |
| Полная информация | `ipconfig /all` | `networksetup -getinfo` | `ip addr` + `ip route` |
| Шлюз по умолчанию | `ipconfig` (Default Gateway) | `netstat -rn` | `ip route show` |
| DNS-серверы | `ipconfig /all` | `networksetup -getdnsservers` | `cat /etc/resolv.conf` |
| ARP-таблица | `arp -a` | `arp -a` | `ip neigh` |
| Ping | `ping` | `ping` | `ping` |
| Трассировка | `tracert` | `traceroute` | `traceroute` |
| DNS-запрос | `nslookup` | `nslookup` / `dig` | `nslookup` / `dig` |
| Обновить DHCP | `ipconfig /renew` | Reconnect в GUI | `dhclient` |

---

## Troubleshooting шаблон (для экзамена)

1. `ipconfig /all` (Win) / `ip addr` (Linux) → проверить IP, маску, шлюз
2. `ping 127.0.0.1` → проверить стек TCP/IP
3. `ping <default gateway>` → проверить связь с роутером
4. `ping 8.8.8.8` → проверить связь с интернетом
5. `nslookup google.com` → проверить DNS
