---
title: "Lab 26-1 — EtherChannel Configuration"
date: 2026-11-10
description: "Настройка EtherChannel: LACP, PAgP и статический режим с балансировкой нагрузки"
tags: ["CCNA", "Cisco", "Lab", "EtherChannel", "LACP", "PAgP"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-26-etherchannel/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка EtherChannel с использованием LACP, PAgP и статического режима. Верификация и балансировка нагрузки.

## Топология

```
SW1 ----F0/1,F0/2,F0/3 (bundle) ---- SW2
        PortChannel1
```

## Задачи

### LACP EtherChannel
1. Настроить EtherChannel на SW1 (active) и SW2 (passive):
   ```
   SW1(config)#interface range f0/1-3
   SW1(config-if-range)#channel-group 1 mode active
   SW2(config)#interface range f0/1-3
   SW2(config-if-range)#channel-group 1 mode passive
   ```
2. Настроить Port-Channel интерфейс как trunk:
   ```
   SW1(config)#interface port-channel 1
   SW1(config-if)#switchport mode trunk
   ```
3. Проверить состояние: `show etherchannel summary`
4. Убедиться, что флаги: **P** (в bundle), **U** (используется)

### PAgP EtherChannel
5. Удалить LACP конфигурацию
6. Настроить PAgP (desirable/auto):
   ```
   SW1(config-if-range)#channel-group 1 mode desirable
   SW2(config-if-range)#channel-group 1 mode auto
   ```

### Статический EtherChannel
7. Режим `on` — без протокола согласования:
   ```
   SW1(config-if-range)#channel-group 1 mode on
   ```

### Балансировка нагрузки
8. Изменить метод балансировки: `port-channel load-balance src-dst-mac`
9. Просмотреть текущий метод: `show etherchannel load-balance`

## Ключевые команды

```
SW1(config-if-range)#channel-group 1 mode active    ! LACP
SW1(config-if-range)#channel-group 1 mode passive   ! LACP
SW1(config-if-range)#channel-group 1 mode desirable ! PAgP
SW1(config-if-range)#channel-group 1 mode auto      ! PAgP
SW1(config-if-range)#channel-group 1 mode on        ! Static
SW1#show etherchannel summary
SW1#show etherchannel port-channel
SW1#show interfaces port-channel 1
SW1(config)#port-channel load-balance src-dst-mac
```

> **💡 Совет:**
> Совместимость режимов: **LACP**: active+active, active+passive. **PAgP**: desirable+desirable, desirable+auto. **Static**: on+on. Смешивать LACP и PAgP нельзя.
