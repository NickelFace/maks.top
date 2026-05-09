---
title: "Lab 33-1 — Cisco Device Security Configuration"
date: 2026-11-23
description: "Комплексная настройка безопасности устройств: SSH, AAA, пароли и hardening"
tags: ["CCNA", "Cisco", "Lab", "SSH", "AAA", "Hardening"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-33-device-security/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Комплексная настройка безопасности устройств: AAA, SSH, banner, service password-encryption, privilege levels.

## Задачи

### Пароли и шифрование
1. Установить enable secret:
   ```
   R1(config)#enable secret Cisco123!
   ```
2. Зашифровать все открытые пароли:
   ```
   R1(config)#service password-encryption
   ```
3. Настроить console и VTY пароли:
   ```
   R1(config)#line console 0
   R1(config-line)#password cisco
   R1(config-line)#login
   ```

### Локальные пользователи
4. Создать локального пользователя:
   ```
   R1(config)#username admin privilege 15 secret Admin1!
   ```
5. Настроить VTY для local login:
   ```
   R1(config)#line vty 0 15
   R1(config-line)#login local
   R1(config-line)#transport input ssh
   ```

### SSH
6. Настроить hostname и domain:
   ```
   R1(config)#hostname R1
   R1(config)#ip domain-name lab.local
   ```
7. Сгенерировать RSA-ключ (2048 бит):
   ```
   R1(config)#crypto key generate rsa modulus 2048
   ```
8. Включить SSHv2:
   ```
   R1(config)#ip ssh version 2
   ```
9. Подключиться по SSH: `ssh -l admin 10.10.10.1`
10. Проверить SSH-сессии: `show ssh`

### Banner
11. Настроить MOTD banner:
    ```
    R1(config)#banner motd # Authorized access only! #
    ```

### Hardening
12. Отключить ненужные сервисы:
    ```
    R1(config)#no ip http server
    R1(config)#no ip http secure-server
    R1(config)#no cdp run              ! если CDP не нужен
    ```
13. Настроить exec-timeout:
    ```
    R1(config)#line vty 0 15
    R1(config-line)#exec-timeout 5 0
    ```

## Ключевые команды

```
R1(config)#enable secret Cisco123!
R1(config)#service password-encryption
R1(config)#username admin privilege 15 secret Admin1!
R1(config)#ip domain-name lab.local
R1(config)#crypto key generate rsa modulus 2048
R1(config)#ip ssh version 2
R1(config)#line vty 0 15
R1(config-line)#login local
R1(config-line)#transport input ssh
R1(config-line)#exec-timeout 5 0
R1#show ssh
R1#show users
```

> **⚠️ Важно:**
> `enable password` хранится в MD5 с `service password-encryption`. `enable secret` использует более стойкий хэш (MD5/SHA). Всегда используй `enable secret`, а не `enable password`.
