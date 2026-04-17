---
title: "LPIC-2 211.1 — Using E-mail Servers"
date: 2026-05-01
description: "Протокол SMTP, архитектура Postfix, main.cf и master.cf, псевдонимы, виртуальные домены, таблицы поиска, настройка relay, TLS в Postfix, конфигурационные файлы Sendmail, Exim, утилиты Postfix (postconf/postmap/postqueue/postsuper). Тема экзамена LPIC-2 211.1."
tags: ["Linux", "LPIC-2", "Postfix", "SMTP", "email", "Sendmail", "Exim", "MTA"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-211-1-email-servers/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 211.1** — Using E-mail Servers (вес: 4). Охватывает настройку Postfix, очереди почты, псевдонимы, виртуальные домены, TLS, а также базовое знакомство с Sendmail/Exim.

---

## Протокол SMTP

SMTP описан в RFC 5321. Команды состоят из четырёх символов; ответы сервера начинаются с трёхзначного кода.

**Коды ответов:**
- `2xx` — успех
- `4xx` — временная ошибка (повтор возможен)
- `5xx` — постоянная ошибка (сообщение отклонено)

Распространённые коды: `220` = сервер готов, `250` = команда выполнена, `550` = получатель не найден.

### Пример SMTP-сессии:

```bash
telnet mailserver 25
EHLO localhost
MAIL FROM:<sender@example.com>
RCPT TO:<user@example.com>
DATA
Subject: Test
.
QUIT
```

### Отключение команды VRFY (безопасность):

```ini
# /etc/postfix/main.cf
disable_vrfy_command = yes
```

> Команда VRFY отключается из соображений безопасности: она позволяет перечислять действительные адреса на сервере.

---

## Архитектура MTA

**MTA (Mail Transfer Agent)** — принимает и доставляет почту.

| Компонент | Роль |
|---|---|
| **MTA** | Пересылает почту между серверами (Postfix, Sendmail, Exim) |
| **MDA** | Конечная доставка в почтовый ящик пользователя (procmail, maildrop) |
| **MUA** | Почтовый клиент (Thunderbird, Evolution) |

---

## Обзор Postfix

Postfix разделяет обработку почты на отдельные программы, каждая со своим каталогом хранения (ускоряет восстановление после сбоев).

### Основные процессы Postfix:

| Процесс | Роль |
|---|---|
| `master` | Главный процесс, запускает все остальные |
| `smtpd` | Принимает входящие SMTP-соединения |
| `smtp` | Отправляет почту на удалённые серверы |
| `qmgr` | Управляет очередью почты |
| `pickup` | Забирает почту из локальной очереди |
| `cleanup` | Нормализует заголовки |

### Каталог очереди: `/var/spool/postfix/`

| Подкаталог | Назначение |
|---|---|
| `incoming` | Новые входящие сообщения |
| `active` | Сообщения, активно обрабатываемые qmgr |
| `deferred` | Сообщения, отложенные из-за временных ошибок |
| `bounce` | Уведомления о недоставке |
| `hold` | Сообщения на удержании |
| `corrupt` | Повреждённые сообщения |
| `maildrop` | Локальные сообщения от команд, совместимых с sendmail |

---

## Конфигурационные файлы

Все файлы находятся в `/etc/postfix/`:

| Файл | Назначение |
|---|---|
| `main.cf` | Параметры обработки почты |
| `master.cf` | Управление процессами |
| `install.cf` | Параметры установки |

```bash
postfix reload          # применить изменения main.cf без перезапуска
systemctl restart postfix
```

```bash
postconf -d    # все параметры включая значения по умолчанию (877+ строк)
postconf -n    # только явно заданные параметры
postconf -e 'home_mailbox = Maildir/'   # изменить параметр без редактирования файла
```

Пример конфига: `/usr/share/postfix/main.cf.dist` (Debian)

---

## main.cf — Ключевые параметры

```ini
myhostname = mail.example.com           # имя хоста сервера
mydomain = example.com                  # домен сервера
myorigin = $mydomain                    # домен отправителя в исходящей почте
mydestination = $mydomain, localhost.$mydomain, localhost  # принимать почту для этих доменов
inet_interfaces = all                   # интерфейсы для прослушивания
inet_protocols = all                    # IPv4 и IPv6
mynetworks = 192.168.1.0/24, 127.0.0.0/8  # авторизованные клиенты для relay
soft_bounce = no                        # тестовый режим: откладывать вместо отклонения
```

### mynetworks_style (если mynetworks не задан вручную):

| Значение | Поведение |
|---|---|
| `subnet` | Доверять клиентам из той же подсети (по умолчанию) |
| `class` | Доверять всей сети класса A/B/C |
| `host` | Доверять только локальной машине |

### Канонические карты:

```ini
sender_canonical_maps = hash:/etc/postfix/sender_canonical    # перезапись только отправителя
recipient_canonical_maps = hash:/etc/postfix/recipient_canonical  # перезапись только получателя
```

> **Факт для экзамена:** `sender_canonical_maps` изменяет только адрес отправителя. `alias_maps` изменяет только получателя. Это разные вещи!

---

## master.cf — Управление процессами

Каждая строка описывает один сервис. Продолжение строки осуществляется через отступ (пробел в начале следующей строки).

```
service  type  private  unpriv  chroot  wakeup  maxproc  command
```

```
smtp      inet  n       -       -       -       -       smtpd
pickup    unix  n       -       -       60      1       pickup
cleanup   unix  n       -       -       -       0       cleanup
qmgr      unix  n       -       n       300     1       qmgr
```

> **Факт для экзамена:** Строки в master.cf продолжаются через отступ (пробел/таб в начале следующей строки) — НЕ через обратный слеш.

> Поле `chroot`: по умолчанию `n` в Postfix >= 3.0, `y` в Postfix < 3.0.

---

## Псевдонимы — /etc/aliases

Перенаправляет почту с одного адреса на другой:

```
postmaster: root
root:       admin@example.com
webmaster:  john, mary
devnull:    /dev/null
```

```bash
newaliases        # пересоздать aliases.db
# эквивалентно:
sendmail -bi
```

> **В любой конфигурации обязательны два псевдонима:** `mailer-daemon: postmaster` и `postmaster: root`.

---

## Виртуальные домены

```ini
# main.cf
virtual_alias_domains = example.com, other.nl
virtual_alias_maps = hash:/etc/postfix/virtual
```

`/etc/postfix/virtual`:
```
postmaster@example.com   peter
info@other.nl            gerda
sales@example.com        petra
@example.com             jim       # catch-all: несовпавшие → jim
```

```bash
postmap /etc/postfix/virtual    # создать virtual.db
postfix reload
```

> После каждого изменения таблицы поиска: выполните `postmap`, затем `postfix reload`.

---

## Таблицы поиска

| Таблица | Назначение |
|---|---|
| `access` | Разрешить/запретить SMTP-хосты |
| `alias` | Перенаправить на локальные почтовые ящики |
| `canonical` | Перезаписывать адреса в заголовках |
| `relocated` | Старый адрес → новый адрес |
| `transport` | Домен → метод доставки |
| `virtual` | Домены и получатели → локальные почтовые ящики |

```bash
postmap /etc/postfix/access    # скомпилировать текстовый файл в хэш-базу
```

---

## Настройка relay

```ini
relay_domains =               # не выполнять relay ни для кого (наиболее безопасно)
relay_domains = $mydomain     # relay только для собственного домена

relayhost =                   # прямая доставка в интернет
relayhost = mail.example.com  # маршрутизировать исходящую почту через relay провайдера
```

> Если `relay_domains` слишком широк, сервер становится **открытым relay** и используется для спама. Ограничивайте с помощью `mynetworks`.

---

## TLS в Postfix

Значения `smtpd_tls_security_level`:

| Значение | Поведение |
|---|---|
| `none` | Не анонсировать STARTTLS |
| `may` | TLS доступен, но не обязателен (рекомендуется по RFC 2487) |
| `encrypt` | TLS обязателен — может заблокировать всю входящую почту, если удалённый сервер не поддерживает его |
| `dane` | Использовать DNS-записи TLSA (DANE) |

```bash
# Создать самоподписанный сертификат (без пароля на ключ — требование Postfix)
openssl req -nodes -x509 -newkey rsa:2048 \
  -keyout postfixkey.pem -out postfixcert.pem -days 356
```

```ini
# RSA (рекомендуется)
smtpd_tls_cert_file = /etc/postfix/postfixcert.pem
smtpd_tls_key_file  = /etc/postfix/postfixkey.pem

# DSA
smtpd_tls_dcert_file = /etc/postfix/postfixcert.pem
smtpd_tls_dkey_file  = /etc/postfix/postfixkey.pem
```

> **`smtpd_tls_` vs `smtp_tls_`:** `smtpd_tls_` = поведение сервера (входящие). `smtp_tls_` = поведение клиента (исходящие). Не путайте их.

```ini
smtpd_tls_CAfile = /etc/postfix/cacerts.pem   # единый файл CA
smtpd_tls_CApath = /etc/postfix/certs/         # каталог CA
smtpd_tls_mandatory_exclude_ciphers = aNULL, MD5  # отключить анонимные шифры
```

Уровни логирования TLS (`smtpd_tls_loglevel`): 0=нет, 1=сводка рукопожатия, 2=детали переговоров, 3=hex-дамп, 4=полный дамп SMTP.

---

## Эмуляция Sendmail

Postfix включает команды, совместимые с sendmail:

| Команда | Назначение | Нативный Postfix |
|---|---|---|
| `sendmail` | Отправить почту / принять из stdin | — |
| `mailq` | Показать очередь сообщений | `postqueue -p` |
| `newaliases` | Пересоздать базу псевдонимов | `postalias /etc/aliases` |
| `sendmail -bp` | Показать очередь | `mailq` |
| `sendmail -bi` | Пересоздать псевдонимы | `newaliases` |

---

## Конфигурация Sendmail

| Файл | Назначение |
|---|---|
| `/etc/mail/sendmail.cf` | Основной конфиг (генерируется через m4, никогда не редактировать напрямую) |
| `/etc/mail/local-host-names` | Домены для приёма почты |
| `/etc/mail/access` | Разрешить/запретить хосты (access.db) |
| `/etc/mail/virtusertable` | Виртуальные пользователи и домены |
| `/etc/mail/aliases` | Псевдонимы |
| `/etc/mail/mailertable` | Маршрутизация почты по доменам |
| `/etc/mail/genericstable` | Перезапись исходящей: локальное имя → внешний домен |
| `/etc/mail/domaintable` | Маппинг старый домен → новый домен |

```bash
m4 sendmail.mc > /etc/mail/sendmail.cf    # сгенерировать конфиг
killall -HUP sendmail                     # перезагрузить
makemap hash /etc/mail/virtusertable < sourcefile
```

### Действия /etc/mail/access:

| Действие | Поведение |
|---|---|
| `OK` | Принять почту даже если другие правила отклоняют её. НЕ включает relay. |
| `RELAY` | Принять и разрешить relay. Включает OK. |
| `REJECT` | Отклонить с сообщением об ошибке |
| `DISCARD` | Удалить без уведомления |
| `SKIP` | Прекратить поиск для этой записи |

> **Ключевой факт для экзамена:** `OK` не включает relay. `RELAY` включает relay и неявно содержит OK.

---

## Exim

Exim был разработан в Кембридже. Конфигурация: `exim.conf`. Документация: `man exim4-config_files`. Для LPIC-2 достаточно общего знакомства.

---

## Утилиты Postfix

| Утилита | Назначение |
|---|---|
| `postfix` | Запуск, остановка, перезагрузка, проверка |
| `postconf` | Чтение/изменение main.cf |
| `postmap` | Создание/запрос таблиц поиска |
| `postalias` | Работа с базой псевдонимов |
| `postqueue` | Управление очередью (просмотр, сброс) |
| `postsuper` | Удаление, удержание, повторная постановка в очередь сообщений |
| `postcat` | Просмотр файлов из очереди |

```bash
# postfix
postfix start / stop / reload / restart / check / status / flush

# postconf
postconf -n                              # только явно заданные параметры
postconf -d                              # только значения по умолчанию
postconf myhostname                      # показать конкретный параметр
postconf -e 'myhostname = mail.x.com'   # изменить параметр
postconf -f                              # проверить синтаксис

# postmap
postmap /etc/postfix/virtual             # скомпилировать текст → хэш-базу
postmap -q user@example.com hash:/etc/postfix/virtual  # запрос к таблице

# postqueue
postqueue -p                             # показать очередь (= mailq)
postqueue -f                             # сбросить отложенные

# postsuper
postsuper -d ALL                         # удалить все из очереди
postsuper -d ALL deferred                # удалить только отложенные
postsuper -h ALL                         # поставить все на удержание
postsuper -r ALL                         # повторно поставить все в очередь

# postcat
postcat -q <ID>                          # показать сообщение по ID очереди
```

---

## Шпаргалка для экзамена

### Файлы и пути

```
/etc/postfix/main.cf        основной конфиг Postfix
/etc/postfix/master.cf      управление процессами
/etc/aliases                глобальные псевдонимы
/var/spool/postfix/         очередь почты
/var/log/maillog            лог почты
/etc/postfix/virtual        виртуальные домены
/etc/mail/sendmail.cf       конфиг sendmail
/usr/share/postfix/main.cf.dist   пример конфига (Debian)
```

### Ключевые команды

```bash
postfix reload              # перезагрузить конфиг
postfix check               # проверить конфиг + права доступа к файлам
postconf -n                 # показать только нестандартные параметры
postconf -e 'param = val'   # изменить параметр без редактирования файла
postmap /etc/postfix/virtual  # скомпилировать таблицу поиска
newaliases                  # пересоздать aliases.db
mailq                       # показать очередь
postqueue -p                # то же (нативный Postfix)
postsuper -d ALL            # удалить все сообщения из очереди
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| После изменения таблицы поиска | Запустить `postmap`, затем `postfix reload` |
| После изменения `/etc/aliases` | Запустить `newaliases` |
| `relay_domains` vs `relayhost` | relay_domains = входящий relay; relayhost = исходящий relay |
| `sender_canonical_maps` | Перезаписывает только отправителя, не получателя |
| Продолжение строки в master.cf | Отступ (пробел/таб) — НЕ обратный слеш |
| Пароль на ключ TLS | Postfix требует отсутствия пароля на приватном ключе |
| `smtpd_tls_` vs `smtp_tls_` | smtpd = входящий сервер; smtp = исходящий клиент |
| Sendmail `OK` vs `RELAY` | `OK` ≠ relay; `RELAY` = relay + OK |
| Обязательные псевдонимы | `mailer-daemon: postmaster` и `postmaster: root` |
