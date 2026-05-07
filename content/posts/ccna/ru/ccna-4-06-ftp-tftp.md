---
title: "CCNA — 4.6 FTP и TFTP"
date: 2026-04-08
description: "Сравнение TFTP (UDP 69) и FTP (TCP 20/21): возможности, применение для резервного копирования IOS и конфигураций Cisco, а также SCP как безопасная альтернатива."
tags: ["CCNA", "Cisco", "FTP", "TFTP", "IP-сервисы"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-4-06-ftp-tftp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 4.9 Describe the capabilities and function of TFTP/FTP in the network
**Odom:** Vol.2, Ch. 12 (Miscellaneous IP Services)

---

## TFTP — Trivial File Transfer Protocol

**TFTP** — упрощённый протокол передачи файлов без аутентификации.

| Параметр | Значение |
|---|---|
| Транспорт | **UDP порт 69** |
| Аутентификация | Нет |
| Директории | Нет (нет навигации) |
| Скорость | Медленнее FTP (ack за каждый блок) |
| Безопасность | Нет шифрования |
| Применение | IOS образы, конфигурации на Cisco |

**Применение в Cisco IOS:**
```
! Копировать running-config на TFTP-сервер:
copy running-config tftp:
! Введи: IP TFTP-сервера, имя файла

! Загрузить IOS образ с TFTP:
copy tftp: flash:
! Введи: IP TFTP-сервера, имя файла

! Восстановить конфигурацию с TFTP:
copy tftp: running-config
copy tftp: startup-config
```

**Верификация:**
```
show flash:          ! Просмотр содержимого flash
dir flash:           ! Список файлов
```

---

## FTP — File Transfer Protocol

**FTP** — полнофункциональный протокол передачи файлов с аутентификацией.

| Параметр | Значение |
|---|---|
| Транспорт | **TCP порт 21** (управление) + **TCP порт 20** (данные) |
| Аутентификация | Логин/пароль |
| Директории | Да — навигация по файловой системе |
| Режимы | Active (сервер подключается к клиенту) / Passive (клиент подключается к серверу) |
| Безопасность | Нет шифрования (открытый текст) |
| Безопасная версия | **FTPS** (FTP + TLS) или **SFTP** (FTP через SSH) |

**FTP в Cisco IOS:**
```
! Настройка FTP-клиента:
ip ftp username admin
ip ftp password cisco123

! Копирование через FTP:
copy ftp: flash:
copy running-config ftp:
```

---

## Сравнение TFTP и FTP

| Параметр | TFTP | FTP |
|---|---|---|
| Протокол | UDP 69 | TCP 20/21 |
| Аутентификация | Нет | Да (user/pass) |
| Навигация | Нет | Да |
| Надёжность | Низкая (UDP) | Высокая (TCP) |
| Безопасность | Нет | Нет (открытый текст) |
| Безопасная альтернатива | — | FTPS, SFTP |
| Применение в Cisco | IOS backup/restore | IOS backup/restore |

---

## SCP — рекомендуемая альтернатива

**SCP** (Secure Copy Protocol) — копирование через SSH, шифрованное. Рекомендуется вместо TFTP/FTP.

```
! Скопировать running-config на SCP-сервер:
copy running-config scp:

! Загрузить с SCP:
copy scp: flash:
```
