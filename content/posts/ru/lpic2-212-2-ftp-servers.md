---
title: "LPIC-2 212.2 — Managing FTP Servers"
date: 2026-06-05
description: "Активный и пассивный режимы FTP, настройка vsftpd, Pure-FTPd, ProFTPD, анонимный FTP, /etc/ftpusers, FTPS/TLS, порты FTP 20 и 21. Тема экзамена LPIC-2 212.2."
tags: ["Linux", "LPIC-2", "FTP", "vsftpd", "ProFTPD", "Pure-FTPd", "TLS"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-212-2-ftp-servers/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.2** — Managing FTP Servers (вес: 2). Охватывает настройку vsftpd, анонимный FTP, управление доступом, TLS и базовое знакомство с Pure-FTPd и ProFTPD.

---

## Основы протокола FTP

FTP использует два TCP-соединения:

| Соединение | Порт | Назначение |
|---|---|---|
| Управляющее | 21 | Команды и ответы (на всю сессию) |
| Данных | 20 (активный) или эфемерный (пассивный) | Непосредственная передача файлов |

FTP передаёт учётные данные в открытом виде — никогда не используйте обычный FTP через ненадёжные сети. Используйте FTPS (FTP + TLS) или SFTP (передача файлов через SSH, не связанная с FTP).

---

## Активный и пассивный режимы

### Активный режим (PORT)

1. Клиент подключается к порту 21 сервера (управление).
2. Клиент открывает случайный локальный порт и отправляет серверу свой IP + порт через команду `PORT`.
3. **Сервер** инициирует соединение данных с порта 20 на порт клиента.

Проблема: брандмауэры/NAT на стороне клиента блокируют входящие соединения от сервера.

### Пассивный режим (PASV)

1. Клиент подключается к порту 21 сервера (управление).
2. Клиент отправляет команду `PASV`.
3. **Сервер** открывает случайный высокий порт и сообщает клиенту.
4. **Клиент** инициирует соединение данных на случайный порт сервера.

Пассивный режим удобен для брандмауэров, потому что клиент инициирует оба соединения. Современные FTP-клиенты используют пассивный режим по умолчанию.

```
Активный:  сервер → клиент (сервер инициирует соединение данных)
Пассивный: клиент → сервер (клиент инициирует оба соединения)
```

---

## vsftpd

**vsftpd** (Very Secure FTP Daemon) — наиболее распространённый FTP-сервер на Linux. Основная тема экзамена LPIC-2.

```bash
apt install vsftpd          # Debian/Ubuntu
yum install vsftpd          # RHEL/CentOS
systemctl start vsftpd
systemctl enable vsftpd
```

Конфигурационный файл: `/etc/vsftpd.conf`

### Ключевые параметры

```ini
# Основные
listen=YES                    # автономный режим (не через inetd)
listen_ipv6=NO                # установить YES для прослушивания IPv6 (отключает listen=YES)
anonymous_enable=YES          # разрешить анонимный вход
local_enable=YES              # разрешить локальным пользователям системы
write_enable=YES              # включить команды записи (STOR, DELE и т.д.)
local_umask=022               # umask для загружаемых файлов

# Баннер
ftpd_banner=Welcome to FTP service.

# Ограничить локальных пользователей их домашними каталогами
chroot_local_user=YES
chroot_list_enable=YES
chroot_list_file=/etc/vsftpd/chroot_list   # пользователи в этом списке НЕ ограничены chroot

# Логирование
xferlog_enable=YES
xferlog_file=/var/log/vsftpd.log
xferlog_std_format=YES

# Диапазон портов для пассивного режима
pasv_enable=YES
pasv_min_port=40000
pasv_max_port=50000
pasv_address=203.0.113.5     # внешний IP (за NAT)

# Ограничения соединений
max_clients=100
max_per_ip=10
```

### Анонимный FTP

```ini
anonymous_enable=YES
anon_root=/var/ftp             # корневой каталог для анонимных пользователей
anon_upload_enable=YES         # разрешить анонимную загрузку (также требует write_enable=YES)
anon_mkdir_write_enable=YES    # разрешить анонимным создавать каталоги
anon_other_write_enable=YES    # разрешить анонимным переименовывать/удалять
no_anon_password=YES           # пропустить запрос пароля для анонимных
```

Анонимные пользователи входят как `ftp` или `anonymous`. Системный пользователь `ftp` должен существовать, его домашний каталог должен быть задан как `anon_root`.

```bash
mkdir -p /var/ftp/pub
chown root:root /var/ftp         # root владеет корневым каталогом (предотвращает ошибку vsftpd)
chmod 755 /var/ftp
chown ftp:ftp /var/ftp/pub       # подкаталог с правом записи для загрузок
```

> **Безопасность:** Корневой каталог анонимного FTP должен принадлежать root, а не ftp. Если ftp владеет им, vsftpd откажется запускаться (проверка безопасности).

### Локальные пользователи

```ini
local_enable=YES
write_enable=YES
chroot_local_user=YES          # заключить пользователей в их домашний каталог
```

При `chroot_local_user=YES` пользователи не могут перейти выше своего домашнего каталога. Если их домашний каталог доступен для записи ими, vsftpd может отказать в входе (проверка безопасности). Исправление:

```bash
chmod a-w /home/user           # сделать домашний каталог недоступным для записи пользователем
# или
allow_writeable_chroot=YES     # отключить проверку безопасности (менее безопасно)
```

---

## Файлы управления доступом

### /etc/ftpusers

Список пользователей, которым **запрещён** доступ по FTP. По одному имени пользователя на строку. Всегда существует — содержит системные аккаунты (root, daemon, bin и т.д.), которые никогда не должны входить через FTP.

```
root
daemon
nobody
```

> **Факт для экзамена:** `/etc/ftpusers` — это **чёрный список** — перечисленным пользователям доступ ЗАПРЕЩЁН.

### /etc/vsftpd/user_list

Работает по-разному в зависимости от `userlist_deny`:

```ini
userlist_enable=YES
userlist_file=/etc/vsftpd/user_list
userlist_deny=YES    # (по умолчанию) перечисленным пользователям ЗАПРЕЩЕНО
userlist_deny=NO     # перечисленным пользователям РАЗРЕШЕНО; остальным запрещено (белый список)
```

> **Факт для экзамена:** `/etc/vsftpd/user_list` может работать как чёрный список (`userlist_deny=YES`) или белый список (`userlist_deny=NO`). `/etc/ftpusers` всегда является чёрным списком.

Оба файла могут сосуществовать. `user_list` проверяется первым; если пользователю там отказано, `ftpusers` не проверяется.

---

## FTPS — FTP через TLS

Два режима FTPS:

| Режим | Описание | Порт |
|---|---|---|
| Явный FTPS (STARTTLS) | Клиент подключается обычно, затем переходит на TLS через команду `AUTH TLS` | 21 |
| Неявный FTPS | TLS с самого начала | 990 |

Явный FTPS более распространён и рекомендован.

Конфигурация TLS для vsftpd:

```ini
ssl_enable=YES
allow_anon_ssl=NO               # не разрешать анонимный TLS (необязательно)
force_local_data_ssl=YES        # требовать TLS для соединений данных
force_local_logins_ssl=YES      # требовать TLS для входа
ssl_tlsv1=YES
ssl_sslv2=NO
ssl_sslv3=NO

rsa_cert_file=/etc/ssl/certs/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.pem
```

Создать самоподписанный сертификат:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/vsftpd.pem \
  -out /etc/ssl/certs/vsftpd.pem
```

---

## Pure-FTPd

Pure-FTPd настраивается через аргументы командной строки или небольшие файлы в `/etc/pure-ftpd/conf/`. Каждый параметр — отдельный файл со своим значением.

```bash
apt install pure-ftpd
```

```bash
# Пример: установить диапазон пассивных портов
echo "40000 50000" > /etc/pure-ftpd/conf/PassivePortRange

# Включить TLS (1 = разрешить TLS, 2 = требовать TLS)
echo 1 > /etc/pure-ftpd/conf/TLS

# Виртуальные пользователи
pure-pw useradd john -u ftpuser -d /home/john/ftp
pure-pw mkdb                   # скомпилировать базу виртуальных пользователей
```

> **Для LPIC-2:** Достаточно общего знакомства с Pure-FTPd. Знайте, что он существует и использует `/etc/pure-ftpd/conf/`.

---

## ProFTPD

ProFTPD использует конфигурационный файл в стиле Apache.

```
# /etc/proftpd/proftpd.conf
ServerName    "FTP Server"
ServerType    standalone
DefaultRoot   ~            # ограничить пользователей домашним каталогом

<Anonymous /var/ftp>
  User         ftp
  Group        nogroup
  UserAlias    anonymous ftp
  MaxClients   10
  <Limit WRITE>
    DenyAll
  </Limit>
</Anonymous>
```

```bash
# Управление доступом
/etc/proftpd/ftpusers       # запрещённые пользователи (та же роль что и /etc/ftpusers)
```

> **Для LPIC-2:** Достаточно общего знакомства с ProFTPD. Знайте, что он использует конфиг в стиле Apache в `/etc/proftpd/proftpd.conf`.

---

## Тестирование FTP

```bash
# Подключиться через FTP-клиент
ftp localhost
ftp> user anonymous
ftp> pass anything@test.com
ftp> ls
ftp> get file.txt
ftp> bye

# Тест с lftp
lftp -u user,password ftp://server

# Явно протестировать пассивный режим
ftp> passive
ftp> ls
```

---

## Шпаргалка для экзамена

### Порты

| Порт | Протокол |
|---|---|
| 20 | Данные FTP (активный режим) |
| 21 | Управление FTP |
| 990 | Неявный FTPS |

### Файлы и пути

| Путь | Описание |
|---|---|
| `/etc/vsftpd.conf` | Основная конфигурация vsftpd |
| `/etc/ftpusers` | Пользователи с запретом FTP (чёрный список, всегда активен) |
| `/etc/vsftpd/user_list` | Список пользователей vsftpd (чёрный или белый список) |
| `/var/log/vsftpd.log` | Лог передач vsftpd |
| `/var/ftp` | Корневой каталог анонимного FTP по умолчанию |
| `/etc/proftpd/proftpd.conf` | Конфигурация ProFTPD |
| `/etc/pure-ftpd/conf/` | Каталог конфигурации Pure-FTPd |

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| Активный vs пассивный | Активный: сервер инициирует данные; Пассивный: клиент инициирует данные |
| `/etc/ftpusers` | Всегда чёрный список — нет параметра для изменения этого |
| `userlist_deny=NO` | user_list становится белым списком — остальным запрещено |
| Владелец корневого каталога анонимного FTP | Должен принадлежать root, а не ftp, иначе vsftpd откажется запускаться |
| `chroot_local_user=YES` + домашний каталог с правом записи | vsftpd отказывает в входе — исправить через `allow_writeable_chroot=YES` или `chmod a-w` |
| FTPS vs SFTP | FTPS = FTP + TLS; SFTP = подсистема SSH — совершенно разные протоколы |
