---
title: "Lab 34 — Network Device Management"
date: 2026-11-25
description: "Настройка SNMP, Syslog и NTP для мониторинга сетевых устройств"
tags: ["CCNA", "Cisco", "Lab", "SNMP", "Syslog", "NTP"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-34-device-mgmt/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка SNMP (v2c и v3), Syslog, NTP. Мониторинг сетевых устройств.

## Топология

```
R1 ----SW1---- Management-Server (Syslog + SNMP + NTP, 10.10.10.100)
```

## Задачи

### Syslog
1. Настроить отправку syslog на сервер:
   ```
   R1(config)#logging host 10.10.10.100
   R1(config)#logging trap informational     ! level 6 и выше
   R1(config)#logging buffered 8192 debugging
   ```
2. Включить timestamp:
   ```
   R1(config)#service timestamps log datetime msec
   ```
3. Проверить: `show logging`
4. Симулировать событие (shutdown/no shutdown интерфейса) → проверить syslog-сервер

### SNMP v2c
5. Настроить community string:
   ```
   R1(config)#snmp-server community public RO
   R1(config)#snmp-server community private RW
   ```
6. Настроить SNMP traps:
   ```
   R1(config)#snmp-server host 10.10.10.100 version 2c public
   R1(config)#snmp-server enable traps
   ```

### SNMP v3 (более безопасный)
7. Создать SNMP v3 пользователя:
   ```
   R1(config)#snmp-server group MYGROUP v3 priv
   R1(config)#snmp-server user MYUSER MYGROUP v3 auth sha Auth1! priv aes 128 Priv1!
   ```

### NTP
8. Настроить NTP-сервер:
   ```
   R1(config)#ntp server 10.10.10.100
   ```
9. Проверить синхронизацию: `show ntp status`
10. Проверить ассоциации: `show ntp associations`
11. Настроить timezone: `clock timezone MSK 3`

## Ключевые команды

```
R1(config)#logging host 10.10.10.100
R1(config)#logging trap informational
R1(config)#service timestamps log datetime msec
R1(config)#snmp-server community public RO
R1(config)#snmp-server host 10.10.10.100 version 2c public
R1(config)#snmp-server enable traps
R1(config)#ntp server 10.10.10.100
R1(config)#clock timezone MSK 3
R1#show logging
R1#show ntp status
R1#show ntp associations
R1#show snmp
```

> **💡 Совет:**
> Syslog уровни (0=Emergency..7=Debug). Logging trap задаёт минимальный уровень для отправки на сервер. SNMP v3 с `priv` = шифрование + аутентификация. Для CCNA важно знать порты: SNMP=UDP 161, SNMP Trap=UDP 162, Syslog=UDP 514, NTP=UDP 123.
