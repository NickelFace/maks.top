---
title: "LPIC-2 210.2 — PAM Authentication"
date: 2026-04-05
description: "Типы модулей PAM (auth/account/password/session), управляющие флаги (required/requisite/sufficient/optional), pam_unix, pam_cracklib, pam_limits, pam_listfile, pam_ldap, SSSD с pam_sss, структура /etc/passwd и /etc/shadow, nsswitch.conf. Тема экзамена LPIC-2 210.2."
tags: ["Linux", "LPIC-2", "PAM", "authentication", "SSSD", "security"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-210-2-pam/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 210.2** — PAM Authentication (вес: 3). Охватывает типы модулей PAM, управляющие флаги, ключевые модули PAM, формат `/etc/shadow`, nsswitch.conf и интеграцию с SSSD.

---

## Что такое PAM

**PAM (Pluggable Authentication Modules)** — набор библиотек и API, предоставляющий приложениям единый интерфейс аутентификации. Программы вроде `login` и `su` вызывают API PAM, а PAM решает, где проверить пароль — в `/etc/shadow`, LDAP или где-то ещё.

```
App1  ─┐
App2  ─┤──► PAM ──► pam_unix.so  ──► /etc/passwd, /etc/shadow
App3  ─┘       └──► pam_ldap.so  ──► LDAP-сервер
```

Без PAM каждому приложению пришлось бы реализовывать собственный код аутентификации для каждого метода.

---

## Четыре типа модулей

Каждая строка в конфигурации PAM относится к одному из четырёх типов:

| Тип | Назначение |
|---|---|
| `auth` | Проверяет, что пользователь является тем, за кого себя выдаёт (пароль, токен и т.д.) |
| `account` | Проверяет допустимость учётной записи: истечение пароля, разрешён ли вход |
| `password` | Управляет изменением пароля |
| `session` | Действия при открытии/закрытии сессии (логирование, монтирование домашнего каталога и т.д.) |

---

## Управляющие флаги

Управляющий флаг определяет, что делать при успехе или неудаче модуля:

| Флаг | При неудаче | При успехе |
|---|---|---|
| `requisite` | Немедленно завершить с отказом | Продолжить обработку |
| `required` | Записать неудачу, продолжить проверку других модулей | Продолжить обработку |
| `sufficient` | Продолжить обработку | Немедленно успех (если не было предшествующих неудач `required`) |
| `optional` | Игнорируется, если есть другие модули | Игнорируется, если есть другие модули |

> **Ключевое различие для экзамена:**
> - `requisite` — мгновенный отказ, обработка немедленно останавливается
> - `required` — фиксирует неудачу, но продолжает все модули
> - `sufficient` — мгновенный успех при прохождении

---

## Конфигурация

### Два метода конфигурации:

**Метод 1: единый файл `/etc/pam.conf`**

```
service  type  control  module-path  module-arguments
```

Пример:
```
login  auth  required  pam_unix.so
```

**Метод 2: каталог `/etc/pam.d/` (рекомендуется)**

Каждый сервис получает собственный файл, названный по имени сервиса: `/etc/pam.d/login`, `/etc/pam.d/sshd`, `/etc/pam.d/su`.

Тот же формат, но без поля `service`:
```
type  control  module-path  module-arguments
```

> Если существует каталог `/etc/pam.d/`, файл `/etc/pam.conf` **полностью игнорируется**.

> В Debian/Ubuntu общие настройки находятся в разделяемых файлах: `common-auth`, `common-account`, `common-password`, `common-session`. Конфигурации сервисов подключают их через `@include`.

### Пример `/etc/pam.d/login`:

```bash
# Аутентификация через /etc/passwd и /etc/shadow
auth     required  pam_unix.so nullok

# Проверка состояния учётной записи (истечение пароля и т.д.)
account  required  pam_unix.so

# Логировать начало и конец сессии
session  required  pam_unix.so

# Смена пароля с минимальной длиной 4, максимальной 8
password required  pam_unix.so nullok obscure min=4 max=8
```

---

## pam_unix

Стандартный модуль. Работает с `/etc/passwd` и `/etc/shadow`. Поддерживает все четыре типа.

### Полезные аргументы:

| Аргумент | Описание |
|---|---|
| `nullok` | Разрешить пустые пароли |
| `try_first_pass` | Попробовать пароль от предыдущего модуля, запросить только при неудаче |
| `use_first_pass` | Использовать пароль от предыдущего модуля, немедленно завершить при ошибке |
| `use_authtok` | Использовать пароль, установленный предыдущим модулем (для типа `password`) |
| `remember=N` | Запомнить N последних паролей, запретить повторное использование |
| `md5` | Использовать MD5 вместо crypt() |
| `debug` | Логировать через syslog |
| `audit` | Расширенное логирование syslog |

Тип `session` записывает имя пользователя и тип сессии в syslog при запуске и завершении.

---

## pam_nis

Аутентификация через NIS (Network Information Service). NIS считается устаревшим и передаёт данные открытым текстом. Современная замена: LDAP/SSSD.

```bash
# /etc/pam.d/login — NIS как основной, pam_unix как запасной
auth    sufficient pam_nis.so item=user sense=allow map=users.byname value=compsci
auth    required   pam_unix.so try_first_pass

account sufficient pam_ldap.so item=user sense=deny map=cancelled.byname error=expired
account required   pam_unix.so
```

---

## pam_ldap

Прямая аутентификация через LDAP без SSSD. Модуль `pam_ldap.so` обращается к LDAP-серверу напрямую.

```bash
# /etc/pam.d/login
auth    sufficient pam_ldap.so
auth    required   pam_unix.so try_first_pass

account sufficient pam_ldap.so
account required   pam_unix.so
```

> `pam_ldap.so` проще, но не кэширует данные — при недоступности сервера вход невозможен. SSSD через `pam_sss.so` кэширует учётные данные и работает офлайн.

---

## pam_cracklib

Проверяет надёжность новых паролей по словарям, сравнивает со старым паролем, проверяет сложность.

```bash
password required pam_cracklib.so difok=3 minlen=15 dcredit=2 ocredit=2
password required pam_unix.so use_authtok nullok md5
```

| Аргумент | Описание |
|---|---|
| `minlen=N` | Минимальная длина пароля |
| `difok=N` | Минимальное количество символов, отличных от старого пароля |
| `dcredit=N` | Зачёт за цифры (снижает требование minlen) |
| `ucredit=N` | Зачёт за буквы верхнего регистра |
| `ocredit=N` | Зачёт за специальные символы |
| `lcredit=N` | Зачёт за буквы нижнего регистра |

> `pam_cracklib.so` должен стоять **перед** `pam_unix.so` в блоке `password`. Иначе пароль сохраняется до проверки надёжности.

---

## pam_limits

Устанавливает ограничения ресурсов для пользовательских сессий. Работает и для `uid=0`.

Конфигурация берётся из `/etc/security/limits.conf` и файлов в `/etc/security/limits.d/`.

```bash
session required pam_limits.so
```

Формат `/etc/security/limits.conf`:

```
# домен   тип    элемент  значение
*           soft   nofile  1024
*           hard   nofile  4096
@students   hard   nproc   20
john        hard   cpu     300
```

Типы ограничений: `soft` (пользователь может повышать до hard), `hard` (изменить может только root).

Распространённые значения `item`:
- `nofile` — количество открытых файлов
- `nproc` — количество процессов
- `cpu` — процессорное время в минутах
- `maxlogins` — максимальное количество одновременных сессий

---

## pam_listfile

Разрешает или запрещает доступ на основе текстового файла-списка. Одна запись на строку.

```bash
auth required pam_listfile.so \
  item=user sense=allow file=/etc/allowed_users onerr=fail
```

| Параметр | Описание |
|---|---|
| `item` | Что проверять: `user`, `tty`, `rhost`, `ruser`, `group`, `shell` |
| `sense` | `allow` — разрешить только тем, кто в списке; `deny` — запретить тем, кто в списке |
| `file` | Путь к файлу-списку |
| `onerr` | Что делать при ошибке чтения файла: `succeed` или `fail` |

---

## /etc/passwd и /etc/shadow

`/etc/passwd` — публичная информация об учётных записях:
```
username:x:UID:GID:GECOS:home_dir:shell
```
Поле `x` означает, что пароль хранится в `/etc/shadow`.

`/etc/shadow` — защищённый файл с хешами паролей (только для root):
```
username:$6$salt$hash:lastchg:min:max:warn:inactive:expire:
```

Поля shadow:

| Поле | Описание |
|---|---|
| `lastchg` | Последняя смена пароля (дни с 1970-01-01) |
| `min` | Минимальный возраст пароля в днях |
| `max` | Максимальный возраст пароля в днях |
| `warn` | Дней до истечения для предупреждения |
| `inactive` | Дней после истечения до блокировки |
| `expire` | Дата истечения учётной записи |

Префикс типа хеша: `$1$` = MD5, `$5$` = SHA-256, `$6$` = SHA-512.

---

## nsswitch.conf

`/etc/nsswitch.conf` определяет порядок источников данных для различных системных баз данных. PAM использует его при проверке пользователей.

```
passwd:   files ldap
shadow:   files
group:    files ldap
hosts:    files dns
```

`passwd: files ldap` означает: сначала искать в `/etc/passwd`, затем в LDAP.

При использовании SSSD:
```
passwd:   files sss
group:    files sss
shadow:   files sss
```

---

## SSSD и LDAP

**SSSD (System Security Services Daemon)** — промежуточный слой между PAM/NSS и сетевыми каталогами (LDAP, Active Directory). Кэширует учётные данные, обеспечивая вход даже без доступа к сети.

PAM подключается к SSSD через `pam_sss.so`.

### Настройка SSSD для LDAP:

```bash
# Установка (RHEL/CentOS)
yum install sssd sssd-ldap authconfig

# Настройка через authconfig
authconfig \
  --enablesssd \
  --enablesssdauth \
  --enableldap \
  --enableldapauth \
  --ldapserver=ldap://ldap.example.com:389 \
  --ldapbasedn=dc=example,dc=com \
  --enablerfc2307bis \
  --enablemkhomedir \
  --enablecachecreds \
  --update
```

### `/etc/sssd/sssd.conf`:

```ini
[sssd]
services = nss, pam
config_file_version = 2
domains = LDAP

[domain/LDAP]
id_provider = ldap
auth_provider = ldap
ldap_uri = ldap://ldap.example.com:389
ldap_search_base = dc=example,dc=com
ldap_tls_cacertdir = /etc/pki/tls/cacerts
cache_credentials = true
```

```bash
chmod 600 /etc/sssd/sssd.conf    # обязательно!
systemctl enable --now sssd
```

### Конфигурация PAM для SSSD:

```bash
# /etc/pam.d/system-auth
auth     sufficient pam_sss.so
auth     required   pam_unix.so try_first_pass
account  required   pam_unix.so
account  sufficient pam_sss.so
password sufficient pam_sss.so use_authtok
session  optional   pam_sss.so
```

### Автоматическое создание домашнего каталога при первом входе:

```bash
session optional pam_mkhomedir.so skel=/etc/skel umask=077
```

---

## Шпаргалка для экзамена

### Файлы и пути

| Путь | Назначение |
|---|---|
| `/etc/pam.conf` | Единая конфигурация PAM (если `/etc/pam.d/` не существует) |
| `/etc/pam.d/` | Каталог конфигурации по сервисам |
| `/etc/passwd` | Публичная информация об учётных записях |
| `/etc/shadow` | Хеши паролей (только root) |
| `/etc/nsswitch.conf` | Порядок источников NSS |
| `/etc/security/limits.conf` | Ограничения ресурсов для pam_limits |
| `/etc/security/limits.d/` | Дополнительные файлы ограничений |
| `/etc/sssd/sssd.conf` | Конфигурация SSSD (должен быть chmod 600) |

### Каталог модулей PAM

| Дистрибутив | Путь |
|---|---|
| Debian/Ubuntu (64-бит) | `/lib/x86_64-linux-gnu/security/` |
| RHEL/CentOS/Fedora | `/lib64/security/` |
| Универсальный (устаревший) | `/lib/security/` |

### Ключевые модули

| Модуль | Назначение |
|---|---|
| `pam_unix.so` | `/etc/passwd` и `/etc/shadow` |
| `pam_cracklib.so` | Проверка надёжности пароля |
| `pam_limits.so` | Ограничения ресурсов из `/etc/security/limits.conf` |
| `pam_listfile.so` | Разрешение/запрет по файлу-списку |
| `pam_ldap.so` | Прямая LDAP-аутентификация (без SSSD) |
| `pam_sss.so` | Аутентификация через SSSD |
| `pam_deny.so` | Всегда отказывает (безопасный запасной вариант) |
| `pam_mkhomedir.so` | Создаёт домашний каталог при первом входе |

### Сводная таблица управляющих флагов

| Флаг | Неудача | Успех |
|---|---|---|
| `requisite` | Немедленная остановка + отказ | Продолжить |
| `required` | Отметить неудачу, продолжить | Продолжить |
| `sufficient` | Продолжить | Немедленная остановка + разрешение |
| `optional` | Игнорируется | Игнорируется |

### Формат строки конфигурации

```
# /etc/pam.conf
service  type  control  /lib/security/module.so  [args]

# /etc/pam.d/service_name
type  control  /lib/security/module.so  [args]
```

### Типичные ошибки

| Ошибка | Правило |
|---|---|
| `pam.conf` и `pam.d/` вместе | `pam.d/` полностью перекрывает `pam.conf` |
| Отсутствует 600 на sssd.conf | SSSD не запустится |
| `pam_unix` перед `pam_cracklib` в блоке password | Пароль сохраняется до проверки надёжности |
| Забыт `pam_sss.so` во всех четырёх типах | SSSD будет работать частично |
