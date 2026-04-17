---
title: "LPIC-2 208.1 — Basic Apache Configuration"
date: 2026-02-03
description: "Архитектура Apache httpd, файлы конфигурации, модели MPM, модули DSO, управление доступом (синтаксис 2.2 и 2.4), виртуальный хостинг, mod_perl, mod_php, логирование и мониторинг. Тема экзамена LPIC-2 208.1."
tags: ["Linux", "LPIC-2", "Apache", "HTTP", "VirtualHost", "web server"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-208-1-apache-basic-configuration/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 208.1** — Базовая конфигурация Apache (вес: 4). Охватывает установку Apache httpd, структуру конфигурации, модули, MPM, управление доступом, виртуальные хосты и базовую настройку производительности.

---

## Обзор Apache

**Apache HTTP Server** (httpd) — наиболее широко распространённый веб-сервер в мире. Обрабатывает HTTP/HTTPS запросы и поддерживает богатую экосистему модулей.

**Порт по умолчанию:** 80 (HTTP), 443 (HTTPS)

### Расположение файлов конфигурации:

| Дистрибутив | Основной конфиг | Дополнительные |
|---|---|---|
| RHEL / CentOS | `/etc/httpd/conf/httpd.conf` | `/etc/httpd/conf.d/*.conf` |
| Debian / Ubuntu | `/etc/apache2/apache2.conf` | Разделены по нескольким директориям |

### Структура директорий Debian/Ubuntu:

```
/etc/apache2/
├── apache2.conf          # Основной конфиг
├── ports.conf            # Listen directives
├── sites-available/      # All virtual host configs
├── sites-enabled/        # Symlinks to active sites
├── mods-available/       # All module configs (.load + .conf)
├── mods-enabled/         # Symlinks to active modules
└── conf-available/       # Additional config snippets
    conf-enabled/         # Symlinks to active snippets
```

---

## Управление Apache

### apache2ctl / apachectl

```bash
apache2ctl start           # start Apache
apache2ctl stop            # stop Apache
apache2ctl restart         # restart (drops connections)
apache2ctl graceful        # graceful restart (waits for requests to finish)
apache2ctl graceful-stop   # graceful stop
apache2ctl configtest      # test configuration (-t shorthand)
apache2ctl status          # show server status (requires mod_status)
apache2ctl -M              # list loaded modules
apache2ctl -S              # list virtual hosts
apache2ctl -l              # list statically compiled modules (httpd -l)
```

### Вспомогательные утилиты Debian:

```bash
a2enmod  rewrite           # enable module
a2dismod rewrite           # disable module
a2ensite 000-default       # enable virtual host
a2dissite 000-default      # disable virtual host
a2enconf security          # enable config snippet
a2disconf security         # disable config snippet
```

---

## Модули Apache

### Статические и DSO-модули

| Тип | Способ загрузки | Обнаружение |
|---|---|---|
| **Статический** | Скомпилирован в бинарный файл | `httpd -l` (встроенный список) |
| **DSO** | Загружается во время выполнения через `LoadModule` | `httpd -M` или `apache2ctl -M` |

DSO (Dynamic Shared Object) требует наличия `mod_so` в скомпилированном виде.

### Синтаксис LoadModule:

```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule php7_module      /usr/lib/apache2/modules/libphp7.so
```

Расположение файлов модулей:
- RHEL: `/etc/httpd/modules/` → символическая ссылка на `/usr/lib64/httpd/modules/`
- Debian: `/usr/lib/apache2/modules/`

### Сборка модулей с помощью apxs:

```bash
apxs -c -i -a mod_example.c
# -c  compile
# -i  install into modules directory
# -a  enable in httpd.conf (adds LoadModule)
```

---

## MPM — Multi-Processing Module

Apache может использовать один из нескольких бэкендов MPM:

### Prefork MPM (по умолчанию для совместимости с mod_php)

Каждый запрос обрабатывается **отдельным процессом** (без потоков). Безопаснее с не потокобезопасными библиотеками.

```apache
<IfModule mpm_prefork_module>
    StartServers          5
    MinSpareServers       5
    MaxSpareServers      10
    MaxRequestWorkers   150
    MaxConnectionsPerChild 0
</IfModule>
```

| Директива | По умолчанию | Описание |
|---|---|---|
| `StartServers` | 5 | Начальное число дочерних процессов |
| `MinSpareServers` | 5 | Минимальное число простаивающих процессов |
| `MaxSpareServers` | 10 | Максимальное число простаивающих процессов |
| `MaxRequestWorkers` | 150 | Максимальное число одновременных подключений |
| `MaxConnectionsPerChild` | 0 | Максимум запросов на дочерний процесс (0 = без ограничений) |

### Worker MPM

Гибрид: несколько процессов, каждый с несколькими **потоками**. Эффективнее, но требует потокобезопасного кода.

```apache
<IfModule mpm_worker_module>
    StartServers          2
    MinSpareThreads      25
    MaxSpareThreads      75
    ThreadsPerChild      25
    MaxRequestWorkers   150
    MaxConnectionsPerChild 0
</IfModule>
```

> **MaxRequestWorkers** защищает доступную оперативную память от истощения при высокой нагрузке.

---

## Логирование

### Журнал доступа

Расположение по умолчанию: `/var/log/apache2/access.log` (Debian) или `/var/log/httpd/access_log` (RHEL)

**Common Log Format (CLF):**

```
%h %l %u %t "%r" %>s %b
```

| Токен | Значение |
|---|---|
| `%h` | Имя хоста/IP удалённого клиента |
| `%l` | Идентификатор (от identd, обычно `-`) |
| `%u` | Аутентифицированный пользователь (или `-`) |
| `%t` | Время запроса |
| `%r` | Первая строка запроса (`GET /path HTTP/1.1`) |
| `%>s` | Итоговый код HTTP-статуса |
| `%b` | Отправленные байты (без заголовков; `-` если ноль) |

**Формат Combined** добавляет:

```
%h %l %u %t "%r" %>s %b "%{Referer}i" "%{User-Agent}i"
```

### Определение форматов логов:

```apache
LogFormat "%h %l %u %t \"%r\" %>s %b" common
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined

CustomLog /var/log/apache2/access.log combined
```

### Журнал ошибок

```apache
ErrorLog  /var/log/apache2/error.log
LogLevel  warn
```

**Значения LogLevel** (от наименее до наиболее подробного):

```
emerg → alert → crit → error → warn → notice → info → debug → trace1 → trace8
```

**LogLevel для отдельных модулей или директорий** (Apache 2.3.6+):

```apache
LogLevel info ssl:warn
LogLevel warn
<Directory /var/www/debug>
    LogLevel debug
</Directory>
```

---

## Управление доступом

### Два типа:

| Тип | Механизм | Описание |
|---|---|---|
| **DAC** (Аутентификация) | `authn_file`, `htpasswd` | На основе имени пользователя и пароля |
| **MAC** (Авторизация) | `authz_host`, правила по IP | На основе IP-адреса или имени хоста |

### Синтаксис Apache 2.2 (устаревший):

```apache
Order Deny,Allow
Deny from all
Allow from 192.168.1.0/24

Order Allow,Deny
Allow from all
Deny from 10.0.0.0/8
```

`Satisfy Any` — доступ разрешается, если ВЫПОЛНЯЕТСЯ ХОТЯ БЫ ОДНО условие: аутентификация ИЛИ IP.

### Синтаксис Apache 2.4 (актуальный):

```apache
# Allow by IP:
Require ip 192.168.1.0/24

# Allow localhost:
Require local

# Allow authenticated users:
Require valid-user

# Allow specific user:
Require user alice

# Allow group:
Require group admins

# Combine (all must match):
<RequireAll>
    Require valid-user
    Require ip 192.168.1.0/24
</RequireAll>

# Combine (any must match):
<RequireAny>
    Require ip 10.0.0.0/8
    Require valid-user
</RequireAny>

# Deny specific, allow rest:
<RequireNone>
    Require ip 1.2.3.4
</RequireNone>
```

---

## Аутентификация по паролю

### htpasswd

```bash
htpasswd -cB /etc/apache2/.htpasswd alice    # create file + add user (bcrypt)
htpasswd -B  /etc/apache2/.htpasswd bob      # add user to existing file
htpasswd     /etc/apache2/.htpasswd alice    # update password (MD5 default)
htpasswd -D  /etc/apache2/.htpasswd alice    # delete user
```

> **Безопасность:** Файл паролей ДОЛЖЕН храниться **за пределами** DocumentRoot.

### Параметры htpasswd:

| Параметр | Описание |
|---|---|
| `-c` | Создать новый файл (перезаписывает при наличии) |
| `-B` | Использовать bcrypt (рекомендуется) |
| `-m` | Использовать MD5 (по умолчанию на большинстве систем) |
| `-s` | Использовать SHA-1 |
| `-D` | Удалить пользователя |

### Конфигурация базовой аутентификации:

```apache
<Directory /var/www/html/private>
    AuthType Basic
    AuthName "Restricted Area"
    AuthUserFile /etc/apache2/.htpasswd
    AuthGroupFile /etc/apache2/.htgroups
    Require valid-user
</Directory>
```

### Файлы .htaccess

Переопределения на уровне директории (перезапуск сервера не требуется):

```apache
# In httpd.conf or VirtualHost:
<Directory /var/www/html>
    AllowOverride All     # allow .htaccess to override everything
    # AllowOverride None  # disable .htaccess (more secure)
</Directory>
```

---

## mod_perl

Встраивает интерпретатор Perl внутрь Apache — скрипты остаются в памяти между запросами (быстро).

```apache
LoadModule perl_module modules/mod_perl.so
AddModule  mod_perl.c

PerlModule Apache::Registry

Alias /perl /var/www/perl
<Directory /var/www/perl>
    SetHandler perl-script
    PerlHandler Apache::Registry
    Options +ExecCGI
    PerlSendHeader On
</Directory>
```

---

## mod_php

Встраивает интерпретатор PHP внутрь Apache.

### Два режима:

| Режим | Описание | Производительность |
|---|---|---|
| **CGI** | PHP как внешний процесс | Медленно (новый процесс на каждый запрос) |
| **DSO** | PHP как модуль Apache | Быстро (выполняется внутри процесса) |

### Конфигурация DSO:

```apache
LoadModule php7_module /usr/lib/apache2/modules/libphp7.so

<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Alternatively:
AddType application/x-httpd-php .php .phtml
```

### Настройки PHP в конфигурации Apache:

```apache
php_value  upload_max_filesize 10M
php_flag   display_errors      Off
```

> Настройки PHP в `.htaccess` требуют `AllowOverride Options`.

---

## Виртуальный хостинг

### Виртуальный хостинг на основе имени (рекомендуется)

Несколько сайтов на одном IP, различаемых по заголовку `Host:`.

```apache
# Debian: Listen is usually in ports.conf
Listen 80

<VirtualHost *:80>
    ServerName   www.example.com
    ServerAlias  example.com
    DocumentRoot /var/www/example
    ErrorLog     /var/log/apache2/example-error.log
    CustomLog    /var/log/apache2/example-access.log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName   www.other.com
    DocumentRoot /var/www/other
</VirtualHost>
```

> **Примечание:** Директива `NameVirtualHost` **устарела в Apache 2.4** — теперь это поведение по умолчанию при использовании `*:80`.

> **Первый VirtualHost**, соответствующий IP/порту, является **виртуальным хостом по умолчанию**, если заголовок `Host:` не совпал ни с одним.

### Виртуальный хостинг на основе IP

Каждый сайт использует отдельный IP-адрес:

```apache
<VirtualHost 192.168.1.10:80>
    ServerName site1.example.com
    DocumentRoot /var/www/site1
</VirtualHost>

<VirtualHost 192.168.1.20:80>
    ServerName site2.example.com
    DocumentRoot /var/www/site2
</VirtualHost>
```

### Вывод списка настроенных виртуальных хостов:

```bash
apache2ctl -S
httpd -S
```

---

## Перенаправления

### mod_alias:

```apache
Redirect permanent /old    https://example.com/new     # 301
Redirect temp     /promo   https://example.com/sale    # 302 (default)
Redirect seeother /moved   https://example.com/here    # 303
Redirect gone     /removed                              # 410

RedirectMatch permanent ^/blog/(.*)$ /articles/$1      # regex redirect
```

### mod_rewrite:

```apache
RewriteEngine On
RewriteCond   %{HTTP_HOST} ^old\.example\.com$
RewriteRule   ^(.*)$       https://new.example.com$1 [R=301,L]

# Force HTTPS:
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$    https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

---

## Мониторинг и производительность

### MRTG → RRDtool → Cricket

Эволюция инструментов графического отображения сетевых/серверных данных:

| Инструмент | Описание |
|---|---|
| **MRTG** | Multi Router Traffic Grapher — оригинальный инструмент на основе SNMP |
| **RRDtool** | Round Robin Database — движок хранения и построения графиков, преемник MRTG |
| **Cricket** | Система мониторинга на основе конфигурации, построенная на RRDtool |

### mod_status

```apache
<Location /server-status>
    SetHandler server-status
    Require ip 127.0.0.1
</Location>
```

```bash
apache2ctl status          # requires mod_status + lynx
```

### Ключевая директива производительности:

```apache
# Prefork: limits total simultaneous connections
MaxRequestWorkers 150

# Tune based on: RAM / (RAM per process)
# e.g., 2GB / 20MB per process = ~100 workers
```

---

## Справочник ключевых директив конфигурации

```apache
ServerRoot      /etc/httpd                  # base for relative paths
ServerName      www.example.com:80          # server's hostname
DocumentRoot    /var/www/html               # default document root
Listen          80                          # port to listen on
User            apache                      # run as this user
Group           apache                      # run as this group
DirectoryIndex  index.html index.php        # default files

# Performance:
KeepAlive        On                         # persistent connections
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# Security:
ServerTokens     Prod                       # minimal version in headers
ServerSignature  Off                        # no version in error pages
```

---

## Шпаргалка к экзамену

### Файлы и пути

```
/etc/httpd/conf/httpd.conf         # RHEL main config
/etc/apache2/apache2.conf          # Debian main config
/etc/apache2/sites-available/      # virtual host configs
/etc/apache2/sites-enabled/        # active virtual hosts (symlinks)
/etc/apache2/mods-available/       # available modules
/etc/apache2/mods-enabled/         # active modules (symlinks)
/var/log/apache2/access.log        # access log (Debian)
/var/log/apache2/error.log         # error log (Debian)
/var/log/httpd/access_log          # access log (RHEL)
```

### Команды

```bash
apache2ctl configtest             # test config (-t)
apache2ctl -M                     # list loaded modules (DSO + static)
apache2ctl -S                     # list virtual hosts
httpd -l                          # list static (compiled-in) modules only
a2enmod rewrite && apache2ctl graceful
htpasswd -cB /etc/apache2/.htpasswd user   # create file + bcrypt
htpasswd -D  /etc/apache2/.htpasswd user   # delete user
apxs -c -i -a mod_example.c               # compile + install + enable module
```

### Сравнение MPM

| MPM | Модель | Лучше для |
|---|---|---|
| **Prefork** | 1 процесс на запрос | mod_php (не потокобезопасный) |
| **Worker** | Потоки на процесс | Высокая конкурентность, потокобезопасный код |
| **Event** | Async keep-alive | Современные высоконагруженные сайты |

### Управление доступом: 2.2 против 2.4

| Apache 2.2 | Эквивалент Apache 2.4 |
|---|---|
| `Order Allow,Deny` + `Allow from all` | `Require all granted` |
| `Order Deny,Allow` + `Deny from all` | `Require all denied` |
| `Allow from 192.168.1.0/24` | `Require ip 192.168.1.0/24` |
| `Satisfy Any` | `<RequireAny>` |

### Токены формата логирования

| Токен | Значение |
|---|---|
| `%h` | IP клиента |
| `%u` | Аутентифицированный пользователь |
| `%t` | Временная метка |
| `%r` | Строка запроса |
| `%>s` | Код статуса |
| `%b` | Отправленные байты |
| `%{Referer}i` | Заголовок Referer |
| `%{User-Agent}i` | Заголовок User-Agent |

### Правила виртуальных хостов

| Правило | Примечание |
|---|---|
| Первый совпавший VirtualHost | становится хостом по умолчанию |
| `NameVirtualHost` | устарело в Apache 2.4 |
| Директива `Listen` | обязательна (обычно в ports.conf на Debian) |
| `ServerAlias` | дополнительные имена для того же VirtualHost |
