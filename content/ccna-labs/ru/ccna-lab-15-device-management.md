---
title: "Lab 15 — Cisco Device Management"
date: 2026-10-13
description: "Factory reset, восстановление пароля, резервное копирование конфига и IOS через TFTP"
tags: ["CCNA", "Cisco", "Lab", "Password Recovery", "TFTP", "IOS Upgrade"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-15-device-management/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Factory reset, password recovery, backup конфигурации и IOS-образа через TFTP, обновление IOS на коммутаторе.

## Топология

```
R1 (2911, G0/0: 10.10.10.1/24) ----F0/1-[ SW1 (2960-24TT, Vlan1: 10.10.10.2) ]-F0/2---- TFTP-Server (10.10.10.10/24)
```

## Задачи

### Factory Reset
1. Просмотреть running-config на R1, скопировать в блокнот
2. Factory reset: `R1#write erase` → `reload`
3. Наблюдать процесс загрузки (bootup) в консоли
4. После загрузки: отказаться от Setup Wizard (`no`)
5. Вставить сохранённый конфиг обратно через консоль, сохранить

### Password Recovery
6. Установить enable secret: `R1(config)#enable secret Cisco123!`
7. Сохранить конфиг
8. Настроить загрузку в rommon: `R1(config)#config-register 0x2142` → `reload`
9. В rommon: игнорировать startup-config при загрузке
10. После загрузки: скопировать startup-config в running: `copy start run`
11. Поднять интерфейс G0/0: `no shutdown`
12. Удалить enable secret: `no enable secret`
13. Вернуть нормальный config-register: `config-register 0x2102`
14. Сохранить конфиг

### Configuration Backup
15. Backup в flash: `R1#copy run flash:` (имя: `config-backup`)
16. Backup на TFTP: `R1#copy startup-config tftp:` → адрес: 10.10.10.10
17. Проверить файлы на TFTP-сервере

### IOS Image Backup и Upgrade
18. Backup IOS-образа на TFTP: `R1#copy flash: tftp:`
19. Удалить IOS-образ из flash: `delete flash:c2911-...`
20. Перезагрузить → роутер загружается в rommon (нет образа)
21. Восстановить образ через TFTP в rommon
22. Проверить, что SW1 запускает `C2960-LANBASE-M Version 12.2(25)FX`
23. Обновить IOS на SW1 на `c2960-lanbasek9-mz.150-2.SE4.bin` через TFTP
24. Перезагрузить и проверить новую версию

## Ключевые команды

```
R1#write erase                           ! factory reset
R1#reload
R1(config)#enable secret Cisco123!
R1(config)#config-register 0x2142       ! boot в rommon
rommon> confreg 0x2142
rommon> reset
R1#copy startup-config running-config    ! восстановить конфиг
R1(config)#config-register 0x2102       ! нормальная загрузка
R1#copy run flash:                       ! backup конфига
R1#copy startup-config tftp:
R1#copy flash: tftp:                     ! backup IOS
SW1#show version                         ! проверить версию IOS
SW1#copy tftp: flash:                    ! загрузить новый IOS
SW1(config)#boot system flash:c2960-lanbasek9-mz.150-2.SE4.bin
```

> **⚠️ Важно:**
> При Password Recovery не выполняй `write erase`! Используй `copy start run` для восстановления конфигурации — иначе конфиг будет удалён.
