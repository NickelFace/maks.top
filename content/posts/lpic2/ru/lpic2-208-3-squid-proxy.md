---
title: "LPIC-2 208.3 — Squid Caching Proxy"
date: 2026-02-20
description: "Конфигурация Squid 3.x: параметры squid.conf, типы ACL, правила http_access, схемы аутентификации пользователей (basic/digest/ntlm/negotiate), редиректоры, управление памятью и команды squid -k. Тема экзамена LPIC-2 208.3."
tags: ["Linux", "LPIC-2", "Squid", "proxy", "cache", "ACL"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-208-3-squid-proxy/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 208.3** — Кэширующий прокси Squid (вес: 2). Охватывает конфигурацию Squid 3.x, определение ACL, управление доступом, аутентификацию клиентов и редиректоры.

---

## Что такое веб-кэш

Веб-кэш (HTTP-прокси) — промежуточный сервер между клиентами и веб-серверами:

1. Клиент настроен на использование прокси (хост + порт)
2. Все запросы браузера идут к прокси, а не напрямую к серверу
3. Прокси обращается к целевому серверу, сохраняет ответ в кэше
4. При повторных запросах — отдаёт контент из кэша (быстро, без нагрузки на сеть)

**Преимущества:** снижение трафика · ускорение доступа · фильтрация контента · балансировка нагрузки

### Прозрачный прокси

Прозрачный прокси перехватывает трафик **без какой-либо настройки на стороне клиента**. Реализуется как комбинация прокси-сервера и маршрутизатора с перенаправлением трафика. Клиент не знает о наличии прокси.

---

## Расположение файлов конфигурации

| Дистрибутив | Путь |
|---|---|
| Debian / Ubuntu | `/etc/squid3/` или `/etc/squid/` |
| Red Hat / CentOS | `/etc/squid/` |
| Скомпилированный из исходников | `/usr/local/squid/etc/` |

Основной файл конфигурации: **`squid.conf`** (~125 параметров, для запуска достаточно ~8).

> Если директива отсутствует в `squid.conf`, Squid использует значение по умолчанию. Технически Squid может запуститься с пустым конфигом — но все клиенты будут заблокированы.

---

## Ключевые параметры squid.conf

| Параметр | Назначение | По умолчанию |
|---|---|---|
| `http_port` | Порт для входящих запросов | **3128** (также 8080) |
| `cache_dir` | Директория и параметры дискового кэша | 100 МБ, 16×256 поддиректорий |
| `cache_mem` | RAM для «горячих» объектов | — |
| `maximum_object_size` | Максимальный размер кэшируемого объекта | **4 МБ** |
| `minimum_object_size` | Минимальный размер кэшируемого объекта | **0 КБ** (без ограничений) |
| `cache_swap` | Максимальный размер дискового кэша | — |
| `auth_param` | Настройки программы аутентификации | — |
| `redirect_program` | Внешняя программа-редиректор | — |
| `redirect_children` | Количество процессов редиректора | — |

### Формат cache_dir:

```squid
cache_dir /usr/local/squid/cache/ 100 16 256
#                                  |   |   |
#                                  |   |   └─ 2nd-level subdirectory count
#                                  |   └───── 1st-level subdirectory count
#                                  └───────── cache size in MB
```

> Squid создаёт множество поддиректорий с небольшим количеством файлов в каждой — поиск в директории с 1 000 000 записей крайне медленен. Разбиение на поддиректории ускоряет дисковый доступ.

---

## Списки контроля доступа (ACL)

ACL — именованный фильтр. Squid обрабатывает правила **сверху вниз** и останавливается на **первом совпадении**.

### Структура:

```squid
acl <name> <type> <value>
http_access allow|deny <name>
```

### Типы ACL:

| Тип | Описание |
|---|---|
| `src` | IP-адрес/сеть источника (клиент) |
| `dst` | IP-адрес/сеть назначения (сервер) |
| `srcdomain` | Доменное имя источника |
| `dstdomain` | Доменное имя назначения |
| `port` | TCP-порт |
| `time` | Время суток и день недели |
| `proto` | Протокол (HTTP, FTP и т.д.) |
| `browser` | Тип браузера (User-Agent) |
| `proxy_auth` | Аутентификация пользователя |
| `url_regex` | Регулярное выражение для URL |

### Примеры ACL:

**Разрешить только внутреннюю сеть:**

```squid
acl ourallowedhosts src 192.168.1.0/255.255.255.0
acl all src 0.0.0.0/0.0.0.0

http_access allow ourallowedhosts
http_access deny all
```

**Разрешить доступ только в обеденный перерыв:**

```squid
acl allowed_hosts src 192.168.1.0/255.255.255.0
acl lunchtime MTWHF 12:00-13:00
http_access allow allowed_hosts lunchtime
```

> `MTWHF` = понедельник–пятница | `WHFAS` = среда–воскресенье

**Заблокировать сайты по доменному имени:**

```squid
acl adults dstdomain playboy.com sex.com
acl ourallowedhosts src 192.168.1.0/255.255.255.0
acl all src 0.0.0.0/0.0.0.0

http_access deny adults
http_access allow ourallowedhosts
http_access deny all
```

**Заблокировать социальные сети, кроме обеденного времени:**

```squid
acl socialmedia dstdomain www.facebook.com www.twitter.com
acl lunch MTWHF 12:00-13:00
http_access allow socialmedia lunch
http_access deny socialmedia
```

---

## Важные правила поведения ACL

> **Правило последнего правила:** Squid автоматически добавляет **противоположное правило** после последней записи:
> - Последнее правило — `allow` → Squid неявно добавляет `deny all`
> - Последнее правило — `deny` → Squid неявно добавляет `allow all`
>
> **Всегда явно завершайте список правилом `http_access deny all`!**

> **Ловушка аутентификации:** Правило `http_access allow name` с ACL `proxy_auth` **работает как `deny !name`** — оно блокирует неаутентифицированных пользователей, но НЕ предоставляет доступ аутентифицированным!
>
> Чтобы действительно предоставить доступ аутентифицированным пользователям, добавьте явное разрешение:
> ```squid
> http_access allow name
> http_access allow all
> ```

> **Распространённая ошибка:** `http_access allow name` + неявный `deny all` = аутентифицированные пользователи будут **заблокированы**. Это одна из самых частых ошибок начинающих в Squid.

---

## Аутентификация пользователей

### Как работает аутентификация:

```
Browser → request without authorization header
Squid   → HTTP 407 (Proxy Authentication Required)
Browser → prompts user for login/password
Browser → repeat request with Authorization header
Squid   → passes credentials to external authenticator (stdin)
Auth.   → responds OK or ERR (stdout)
Squid   → allows or blocks the request
```

### Схемы аутентификации:

| Схема | Безопасность | Описание |
|---|---|---|
| `basic` | Низкая | Логин/пароль в Base64 (открытый текст) |
| `digest` | Средняя | Передача хэшированного пароля |
| `ntlm` | Высокая | Аутентификация Windows NTLM |
| `negotiate` | Высокая | Kerberos/NTLM (наиболее безопасная) |

> `digest`, `ntlm` и `negotiate` не передают пароли в открытом виде. Порядок схем в `squid.conf` определяет порядок, в котором они предлагаются клиентам.

### Бэкенды аутентификации:

| Бэкенд | Описание |
|---|---|
| `LDAP` | Lightweight Directory Access Protocol |
| `NCSA` | Файл логин/пароль в стиле NCSA |
| `PAM` | Подключаемые модули аутентификации Unix |
| `SMB` | Windows NT / Samba |
| `MSNT` | Домен Windows NT |
| `SASL` | Simple Authentication and Security Layer |
| `YP` | База данных NIS |
| `getpwam` | Старый файл Unix `/etc/passwd` |

### Пример аутентификации через PAM:

```squid
auth_param basic program /usr/lib/squid/pam_auth
auth_param basic children 5 startup=5 idle=1
auth_param basic realm Squid proxy-caching web server
auth_param basic credentialsttl 2 hours

acl ourhosts proxy_auth REQUIRED
http_access allow ourhosts
http_access allow all        # required! otherwise access will be denied
```

---

## Редиректоры

Squid может пропускать каждый URL через **внешний редиректор** — программу или скрипт, который читает URL из `stdin` и возвращает новый URL (или пустую строку, если изменений нет).

> Редиректор — не стандартная часть Squid, а внешняя программа. Примеры находятся в директории `contrib/` исходного кода. Готовый простой редиректор — **squirm** (использует библиотеку регулярных выражений).

```squid
redirect_program /usr/bin/my_redirector
redirect_children 5
```

### Формат входной строки:

```
URL  ip-address/fqdn  ident  method
```

| Поле | Описание |
|---|---|
| `URL` | Запрошенный URL |
| `ip-address/fqdn` | IP-адрес и доменное имя клиента |
| `ident` | Результат IDENT/AUTH (или `-`) |
| `method` | HTTP-метод: GET, POST и т.д. |

### Пример входных/выходных данных:

```
# Input:
ftp://ftp.gnome.org/pub/GNOME/stable/README  192.168.12.34/-  -  GET

# Output (redirect to mirror):
ftp://ftp.mirror.org/gnome/stable/README  192.168.12.34/-  -  GET
```

> Для HTTP-перенаправления ответ должен начинаться с `301:` или `302:`

### Пример редиректора на Perl:

```perl
#!/usr/local/bin/perl
$|=1;           # Disable output buffering
while (<>) {
    s@http://fromhost.com@http://tohost.org@;
    print;
}
```

---

## Управление памятью

Squid активно использует оперативную память — чтение из памяти значительно быстрее, чем с диска.

### Метаданные (StoreEntry) на объект:

| Архитектура | StoreEntry | + MD5-ключ | Итого |
|---|---|---|---|
| 32-бит (Intel, MIPS, Sparc) | 56 байт | 16 байт | **72 байта** |
| 64-бит (Alpha) | 88 байт | 16 байт | **104 байта** |

> Кэш из **1 000 000 объектов** требует ~**72 МБ** только для метаданных.

### Что ещё находится в памяти:

- Буферы чтения/записи диска
- Буферы сетевого ввода/вывода
- Кэш IP-адресов и FQDN-кэш
- База данных ICMP (Netdb)
- Текущее состояние запросов (заголовки)
- «Горячие» объекты целиком (часто запрашиваемые)

### Параметры памяти:

```squid
cache_mem 64 MB               # RAM for hot objects
maximum_object_size 4096 KB   # max size for disk caching (4 MB)
minimum_object_size 0 KB      # min size (0 = no limit)
cache_swap 1024               # max disk cache in MB
```

---

## Применение изменений

```bash
squid -k reconfigure    # reload config without restarting
squid -k shutdown       # stop Squid
squid -k parse          # parse and check config for errors
```

---

## Шпаргалка к экзамену

### Краткий справочник директив

| Директива | Действие |
|---|---|
| `http_port 3128` | Порт по умолчанию |
| `cache_dir ufs /var/spool/squid 100 16 256` | Дисковый кэш 100 МБ |
| `acl NAME src 192.168.1.0/24` | ACL по IP-адресу источника |
| `acl NAME dstdomain example.com` | ACL по доменному имени назначения |
| `acl NAME time MTWHF 08:00-18:00` | ACL по времени |
| `acl NAME proxy_auth REQUIRED` | ACL с требованием аутентификации |
| `http_access allow NAME` | Разрешить ACL |
| `http_access deny NAME` | Запретить ACL |
| `auth_param basic program /path` | Программа аутентификации |
| `squid -k reconfigure` | Применить конфиг без перезапуска |

### Минимальная рабочая конфигурация:

```squid
http_port 3128
cache_dir ufs /var/spool/squid 100 16 256

acl localnet src 192.168.0.0/255.255.0.0
acl all src 0.0.0.0/0.0.0.0

http_access allow localnet
http_access deny all
```

### Буквы дней недели для ACL `time`:

| Буква | День |
|---|---|
| M | Понедельник (Monday) |
| T | Вторник (Tuesday) |
| W | Среда (Wednesday) |
| H | Четверг (Thursday) |
| F | Пятница (Friday) |
| A | Суббота (Saturday) |
| S | Воскресенье (Sunday) |

### Ключевые факты для экзамена

| Факт | Значение |
|---|---|
| Порт Squid по умолчанию | **3128** |
| HTTP-статус при требовании аутентификации через прокси | **407** |
| Тип ACL для аутентификации пользователя | `proxy_auth` |
| Перезагрузка без перезапуска | `squid -k reconfigure` |
| Неявное значение по умолчанию последнего правила | противоположное направление добавляется автоматически |
| Безопасность аутентификации `basic` | Base64 = открытый текст — самая низкая безопасность |
| `maximum_object_size 4096 KB` | объекты > 4 МБ не кэшируются на диск |
