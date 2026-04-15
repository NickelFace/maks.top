---
title: "LPIC-2 211.3 — Managing Mailbox Access"
date: 2026-05-18
description: "Протоколы POP3 и IMAP, базовое знакомство с Courier MTA, настройка Dovecot IMAP/POP3 (10-auth/10-mail/10-ssl/10-master.conf), механизмы аутентификации, maildir и mbox, настройка TLS, утилиты doveadm/doveconf. Тема экзамена LPIC-2 211.3."
tags: ["Linux", "LPIC-2", "Dovecot", "Courier", "IMAP", "POP3", "email", "TLS"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-211-3-mailbox-access/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 211.3** — Managing Mailbox Access (вес: 2). Охватывает настройку Dovecot IMAP/POP3, настройку TLS, механизмы аутентификации и базовое знакомство с Courier.

---

## POP3 и IMAP

| Характеристика | POP3 (Post Office Protocol v3) | IMAP (Internet Message Access Protocol) |
|---|---|---|
| Хранение почты | Загружает на клиент, удаляет с сервера (копию можно сохранить) | Почта остаётся на сервере |
| Доступ с нескольких устройств | Затруднён: первое устройство загружает сообщения | Полная поддержка |
| Синхронизация статуса | Нет | Да (прочитано, помечено) |
| Риск потери данных при сбое клиента | Низкий (сообщения загружены) | Высокий (всё на сервере) |
| Использование дискового пространства сервера | Низкое | Требует места для всех сообщений всех пользователей |

Ключевое отличие: IMAP оставляет оригинал на сервере и загружает только копию. POP3 забирает сообщение с сервера полностью — если телефон загрузит почту через POP3, компьютер эти сообщения не увидит.

---

## Courier

Courier — полноценный MTA со встроенной поддержкой ESMTP, IMAP, POP3, веб-почты и списков рассылки. На практике чаще всего используется для IMAP/POP3, а не как основной MTA. Courier устанавливается вместе с Postfix или sendmail для добавления поддержки IMAP/POP3.

Courier хранит почту в формате maildir нативно, но может работать и с mbox.

```bash
# Debian/Ubuntu
apt-get install courier-imap courier-pop

# RHEL/CentOS
yum install courier-imap
yum install courier-pop
```

Конфигурационные файлы: `/etc/courier/`

| Файл | Назначение |
|---|---|
| `authdaemonrc` | Настройки демона аутентификации |
| `imapd` | Настройки IMAP |
| `pop3d` | Настройки POP3 |

Очередь почты: `/var/spool/mqueue`

Ключевые параметры конфигурации:

| Параметр | Описание |
|---|---|
| `ADDRESS` | IP-адрес для входящих соединений. 0 = слушать на всех интерфейсах |
| `PORT` | TCP-порт для входящих соединений |
| `MAXDAEMONS` | Максимальное количество клиентских соединений |
| `MAXPERIP` | Максимальное количество соединений с одного IP |
| `MAILDIRPATH` | Путь к каталогу хранения почты |

Параметры по умолчанию в `imapd`:

| Параметр | Значение по умолчанию | Описание |
|---|---|---|
| `ADDRESS` | 0 | IP прослушивания. 0 = все интерфейсы |
| `PORT` | 143 | Порт IMAP |
| `MAXDAEMONS` | 40 | Максимальное количество IMAP-процессов |
| `MAXPERIP` | 20 | Максимальное количество соединений с одного IP |
| `MAILDIRPATH` | Maildir | Имя каталога почты |
| `IMAPDSTART` | YES | Запускать IMAP при загрузке |

Порт POP3 по умолчанию — 110; `MAXPERIP` по умолчанию — 4.

Для базовой настройки укажите `MAILDIRPATH` в обоих файлах в соответствии с тем, куда MTA доставляет почту:

```
MAILDIRPATH=mail/inbox
```

```bash
systemctl restart courier-imap.service
systemctl restart courier-pop.service
```

Проверка через telnet:

```bash
# IMAP (порт 143)
telnet localhost 143
# выход:
a01 LOGOUT

# POP3 (порт 110)
telnet localhost 110
# выход:
QUIT
```

> **Примечание для экзамена:** Для LPIC-2 Courier нужно знать только на уровне осведомлённости. Глубокая настройка не проверяется.

---

## Dovecot

Dovecot — открытый IMAP- и POP3-сервер для Linux/Unix, написанный с приоритетом на безопасность. Основная специализация — IMAP, но POP3 тоже поддерживается.

Типичная схема: Postfix принимает и отправляет почту через SMTP; Dovecot раздаёт её клиентам через IMAP или POP3. Поверх можно добавить Roundcube для веб-интерфейса.

```bash
# Только IMAP
apt install dovecot-imapd

# Только POP3
apt install dovecot-pop3d

# Оба протокола
apt install dovecot-pop3d dovecot-imapd
```

apt автоматически подтянет `dovecot-core` и зависимости. После установки Dovecot запускается сразу, но требует ручной настройки перед использованием.

Конфигурационные файлы: `/etc/dovecot/conf.d/`

| Файл | Настраивает |
|---|---|
| `10-auth.conf` | Механизмы аутентификации |
| `10-mail.conf` | Расположение почтовых ящиков |
| `10-ssl.conf` | Параметры SSL/TLS |
| `10-master.conf` | Слушатели (порты и протоколы) |

---

## Аутентификация

Dovecot поддерживает следующие бэкенды паролей:

- PAM (наиболее распространённый)
- BSDAuth
- LDAP
- passwd
- SQL: MySQL, PostgreSQL, SQLite

Конфигурация PAM находится в `/etc/pam.d/`. Dovecot использует имя сервиса `dovecot` по умолчанию.

Пример `/etc/pam.d/dovecot`:

```
#%PAM-1.0
@include common-auth
@include common-account
@include common-session
```

Механизм аутентификации настраивается в `10-auth.conf` через `auth_mechanisms`.

**Открытые механизмы** (безопасны только через SSL/TLS):
- `PLAIN` — пароль передаётся в открытом виде
- `LOGIN` — аналогичен PLAIN, используется некоторыми клиентами

**Защищённые механизмы (не открытые):**
- `CRAM-MD5`, `DIGEST-MD5`, `SCRAM-SHA1`, `SCRAM-SHA-256`
- `NTLM`, `GSSAPI`, `GSS-SPNEGO`
- `APOP`, `RPA`, `OTP`, `SKEY`, `ANONYMOUS`

> **Факт для экзамена:** Незащищённые (non-plaintext) механизмы несовместимы с PAM. PAM может проверять только открытый пароль, который ему передаётся. Эти механизмы также не работают с хешами DES или MD5.

> **Факт для экзамена:** По умолчанию включён только `PLAIN`.

Включить несколько механизмов в `10-auth.conf`:

```
auth_mechanisms = plain login cram-md5
```

По умолчанию Dovecot запрещает аутентификацию открытым текстом без TLS. Чтобы разрешить:

```
disable_plaintext_auth = no
```

> Разрешение открытого текста без TLS небезопасно — пароли передаются в открытом виде. Это оправдано только если шифрование гарантировано на другом уровне.

---

## Расположение почтового ящика

Настраивается в `10-mail.conf` через `mail_location`.

Формат maildir:

```
mail_location = maildir:~/Maildir
```

Формат mbox:

```
mail_location = mbox:~/mail:INBOX=/var/mail/%u
```

`%u` подставляет имя пользователя. Почта пользователя john находится в `/var/mail/john` в режиме mbox.

> Maildir предпочтительнее mbox: нет проблем с блокировкой, устойчив к повреждениям, работает на сетевых файловых системах.

Структура maildir:
- `new/` — новые непрочитанные сообщения
- `cur/` — прочитанные сообщения
- `tmp/` — временные файлы во время доставки

---

## SSL/TLS

Настройка SSL находится в `10-ssl.conf`.

Создать самоподписанный сертификат:

```bash
/usr/share/dovecot/mkcert.sh
```

Скрипт создаёт:
- Сертификат: `/etc/dovecot/dovecot.pem` (права 0440)
- Ключ: `/etc/dovecot/private/dovecot.pem` (права 0400, только root)

Минимальная конфигурация SSL в `10-ssl.conf`:

```
ssl = required
ssl_cert = </etc/dovecot/dovecot.pem
ssl_key = </etc/dovecot/private/dovecot.pem
```

> `ssl = required` отклоняет соединения без SSL/TLS. `ssl = yes` разрешает незашифрованные соединения.

Усиление безопасности:

```
# Минимальная версия протокола (защита от POODLE)
ssl_min_protocol = TLSv1.2

# Набор шифров (защита от Logjam)
ssl_cipher_list = AES256+EECDH:AES256+EDH

# Предпочитать шифры сервера перед клиентскими (защита от даунгрейда)
ssl_prefer_server_ciphers = yes

# Длина ключа DH (защита от Logjam)
ssl_dh_parameters_length = 2048
```

`AES256+EECDH` — обмен ключами: Ephemeral Elliptic Curve Diffie-Hellman; шифрование: AES-256.  
`AES256+EDH` — то же, но с RSA вместо эллиптических кривых.

Альтернативная генерация сертификата через openssl:

```bash
openssl req -new -x509 -days 1000 -nodes \
  -out "/etc/dovecot/dovecot.pem" \
  -keyout "/etc/dovecot/private/dovecot.key"
```

Проверить SSL-соединение:

```bash
openssl s_client -connect server1:995    # POP3S
openssl s_client -connect server1:imaps  # IMAPS
```

---

## Настройка портов (10-master.conf)

Слушатели настраиваются в `10-master.conf`. Чтобы включить только зашифрованные порты (IMAPS 993, POP3S 995):

```
service imap-login {
  inet_listener imap {
    port = 0        # отключить незашифрованный IMAP (143)
  }
  inet_listener imaps {
    port = 993
    ssl = yes
  }
}

service pop3-login {
  inet_listener pop3 {
    port = 0        # отключить незашифрованный POP3 (110)
  }
  inet_listener pop3s {
    port = 995
    ssl = yes
  }
}
```

`port = 0` отключает слушатель — сервис не будет принимать соединения на этом порту.

### Интеграция с Postfix через UNIX-слушатель

Когда Dovecot работает с реальными системными пользователями Linux (не виртуальными), добавьте UNIX-сокет в `10-master.conf`, чтобы Postfix мог передавать почту напрямую:

```
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}
```

```bash
systemctl restart dovecot
systemctl status dovecot
```

Проверить, что порты слушают:

```bash
netstat -anp | egrep '993|995'
lsof -i | grep dovecot
```

Тестирование POP3-сессии через telnet:

```bash
telnet 127.0.0.1 110
# Сервер отвечает: +OK Dovecot ready.

USER dpezet
# +OK
PASS mypassword
# +OK Logged in.

LIST
# +OK 1 messages

RETR 1
# +OK <текст сообщения>

QUIT
```

---

## doveadm

`doveadm` — основной инструмент администрирования Dovecot.

```bash
# Управление процессами
doveadm reload                                        # перезагрузить конфиг
doveadm stop                                          # остановить

# Управление соединениями
doveadm who                                           # список текущих пользователей
doveadm kick user                                     # отключить пользователя

# Управление почтовыми ящиками
doveadm mailbox list -u user@example.com              # список папок
doveadm fetch -u user "subject" mailbox INBOX         # найти сообщения
doveadm expunge -u user mailbox INBOX all             # удалить всё из INBOX
doveadm deduplicate -u user mailbox INBOX             # удалить дубликаты
doveadm backup -u user dsync://backup-server          # синхронизировать с удалённым сервером
doveadm copy -u user destmailbox Archive mailbox INBOX  # скопировать сообщения
doveadm move -u user destmailbox Archive mailbox INBOX  # переместить сообщения

# Диагностика
doveadm log find                                      # найти файл лога
doveadm penalty                                       # текущие штрафы ограничения скорости
doveadm stats                                         # статистика почтовых ящиков
```

---

## doveconf

`doveconf` читает все конфигурационные файлы Dovecot и выводит итоговые настройки в упрощённом формате. Полезен для диагностики без ручного чтения двадцати файлов.

```bash
doveconf | less       # показать все настройки включая значения по умолчанию
doveconf -n           # показать только нестандартные настройки
```

Пример вывода `doveconf -n`:

```
mail_location = maildir:~/mail/inbox
passdb {
  driver = pam
}
protocols = " imap pop3"
ssl = no
userdb {
  driver = passwd
}
```

---

## Синтаксис include в dovecot.conf

Dovecot использует нестандартный синтаксис include. Восклицательный знак перед `include` — часть синтаксиса, а не отрицание:

```
!include conf.d/*.conf       # включить все файлы из conf.d/
!include_try local.conf      # включить если файл существует (без ошибки при отсутствии)
```

Файлы из `conf.d/` сортируются по ASCII и читаются в этом порядке. Файлы с меньшим числовым префиксом обрабатываются первыми: `10-auth.conf` загружается раньше `20-imap.conf`.

---

## Шпаргалка для экзамена

### Порты

| Порт | Протокол |
|---|---|
| 110 | POP3 |
| 143 | IMAP |
| 993 | IMAPS |
| 995 | POP3S |

### Файлы и пути

| Путь | Описание |
|---|---|
| `/etc/courier/` | Каталог конфигурации Courier |
| `/etc/courier/authdaemonrc` | Аутентификация Courier |
| `/etc/courier/imapd` | Настройки IMAP Courier |
| `/etc/courier/pop3d` | Настройки POP3 Courier |
| `/var/spool/mqueue` | Очередь почты Courier |
| `/etc/dovecot/conf.d/` | Каталог конфигурации Dovecot |
| `/etc/dovecot/conf.d/10-auth.conf` | Механизмы аутентификации |
| `/etc/dovecot/conf.d/10-mail.conf` | Расположение почтовых ящиков |
| `/etc/dovecot/conf.d/10-ssl.conf` | SSL/TLS |
| `/etc/dovecot/conf.d/10-master.conf` | Слушатели/порты |
| `/etc/pam.d/dovecot` | Конфиг PAM для Dovecot |
| `/usr/share/dovecot/mkcert.sh` | Скрипт генерации сертификата |
| `/etc/dovecot/dovecot.pem` | SSL-сертификат (0440) |
| `/etc/dovecot/private/dovecot.pem` | SSL-ключ (0400) |

### Ключевые параметры конфигурации

| Параметр | Файл | Значение по умолчанию |
|---|---|---|
| `auth_mechanisms` | 10-auth.conf | `plain` |
| `mail_location` | 10-mail.conf | зависит от дистрибутива |
| `ssl` | 10-ssl.conf | `yes` |
| `disable_plaintext_auth` | 10-auth.conf | `yes` |

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| Незащищённые механизмы + PAM | Несовместимы — PAM может проверять только открытые пароли |
| Незащищённые механизмы + хеши MD5/DES | Тоже несовместимы |
| `port = 0` | Отключает слушатель (НЕ устанавливает порт 0) |
| Права доступа к ключу | 0400 (только root); сертификат 0440 (общедоступный для чтения) |
| `ssl = required` vs `ssl = yes` | `required` = отклонить без TLS; `yes` = TLS необязателен |
| Перезапуск после установки | Перезапустить `dovecot`, а не `dovecot-imapd` или `dovecot-pop3d` |
