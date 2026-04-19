---
title: "LPIC-2 212.2 — Managing FTP Servers"
date: 2026-06-05
description: "Активный и пассивный режимы FTP, настройка vsftpd, Pure-FTPd, ProFTPD, анонимный FTP, /etc/ftpusers, FTPS/TLS, порты FTP 20 и 21. Тема экзамена LPIC-2 212.2."
tags: ["Linux", "LPIC-2", "FTP", "vsftpd", "ProFTPD", "Pure-FTPd", "TLS"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-212-2-ftp-servers/"
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

## Активный и пассивный режим FTP

### Активный режим (Active / PORT)

1. Клиент открывает командный канал от своего порта к порту 21 сервера.
2. Клиент сообщает серверу свой IP и порт для данных командой `PORT`.
3. **Сервер** сам инициирует соединение данных от порта 20 к порту клиента.

Проблема: если клиент за NAT или firewall, входящее соединение от сервера блокируется.

### Пассивный режим (Passive / PASV)

1. Клиент подключается к порту 21 сервера (управление).
2. Клиент отправляет команду `PASV`.
3. **Сервер** открывает случайный непривилегированный порт и сообщает клиенту его номер.
4. **Клиент** сам подключается к этому порту.

Пассивный режим удобен для брандмауэров, потому что клиент инициирует оба соединения. Современные FTP-клиенты используют пассивный режим по умолчанию.

```
Активный:  сервер → клиент (сервер инициирует соединение данных)
Пассивный: клиент → сервер (клиент инициирует оба соединения)
```

---

## vsftpd

**vsftpd** (Very Secure FTP Daemon) — наиболее распространённый FTP-сервер на Linux. Основной конфигурационный файл: `/etc/vsftpd.conf` или `/etc/vsftpd/vsftpd.conf`.

```bash
apt install vsftpd          # Debian/Ubuntu
yum install vsftpd          # RHEL/CentOS
systemctl start vsftpd
systemctl enable vsftpd
```

### Ключевые параметры vsftpd.conf

```ini
# Запуск как самостоятельный демон (не через inetd)
listen=YES                    # автономный режим
listen_ipv6=NO                # YES для прослушивания IPv6 (отключает listen=YES)

# Разрешения
anonymous_enable=YES          # разрешить анонимный вход
local_enable=YES              # разрешить локальным пользователям системы
write_enable=YES              # включить команды записи (STOR, DELE и т.д.)
local_umask=022               # umask для загружаемых файлов

# Анонимный FTP
anon_root=/var/ftp             # корневой каталог для анонимных пользователей
anon_upload_enable=YES         # разрешить анонимную загрузку (также требует write_enable=YES)
anon_mkdir_write_enable=YES    # разрешить анонимным создавать каталоги
anon_world_readable_only=NO    # отключить для более гибких прав
no_anon_password=YES           # пропустить запрос пароля для анонимных

# Баннер
ftpd_banner=Welcome to FTP service.

# chroot — ограничить локальных пользователей их домашними каталогами
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

### Три условия для анонимной загрузки в vsftpd

В `vsftpd.conf` должны быть включены:

```ini
write_enable=YES
anon_upload_enable=YES
```

Плюс пользователь ftp должен иметь права записи на директорию загрузки.

Для `anon_upload_enable=YES` обязательно должен быть включён `write_enable=YES`. Без него загрузка не работает, даже если права на директорию правильные.

### Настройка vsftpd для анонимного доступа

```bash
# 1. Создать пользователя ftp
useradd --home /var/ftp --shell /bin/false ftp

# 2. Создать директорию для загрузок с нужными правами
mkdir -p /var/ftp/pub
chown root:root /var/ftp         # root владеет корневым каталогом (vsftpd требует)
chmod 755 /var/ftp
mkdir -p --mode 733 /var/ftp/pub/incoming
chown ftp:ftp /var/ftp/pub/incoming

# 3. Настроить inetd (добавить в /etc/inetd.conf)
# ftp stream tcp nowait root /usr/sbin/tcpd /usr/sbin/vsftpd

# 4. Перезагрузить inetd
kill -HUP $(cat /var/run/inetd.pid)
```

Директория для анонимной загрузки должна иметь права 733 (rwx-wx-wx): владелец может всё, группа и остальные могут записывать, но не читать список файлов. Это не позволяет анонимным пользователям видеть, что уже загружено.

Безопасность: Корневой каталог анонимного FTP должен принадлежать root, а не ftp. Если ftp владеет им, vsftpd откажется запускаться (проверка безопасности).

### Настройка vsftpd на современной Ubuntu (systemd)

```bash
sudo apt install vsftpd
sudo systemctl enable --now vsftpd
```

Домашняя директория пользователя `ftp` на Ubuntu — `/srv/ftp/`, **не** `/var/ftp/` как на старых системах.

Настройка firewall (UFW) для FTP в passive-режиме:

```bash
sudo ufw allow ftp                                          # открывает 21 (команды)
sudo ufw allow 20/tcp                                       # active mode data (опционально)
sudo ufw allow 10000:20000/tcp comment 'VSFTPD passive mode'
```

### Listen-директивы: подвох dual-stack

В дефолтном `/etc/vsftpd.conf` на Ubuntu:

```conf
listen=NO
listen_ipv6=YES
```

Выглядит так, будто vsftpd ничего не слушает. На самом деле `listen_ipv6=YES` включает **dual-stack** — и IPv4, и IPv6. Если нужен только IPv4 — `listen=YES` + `listen_ipv6=NO`. Для конкретного интерфейса: `listen_address=192.168.1.10`.

### Passive mode — не задан в дефолтном конфиге

В дефолтном `/etc/vsftpd.conf` **нет** passive-директив, их нужно добавить вручную:

```conf
pasv_enable=YES
pasv_min_port=10000
pasv_max_port=20000
```

Без этого клиенты за NAT не смогут загружать/скачивать файлы.

### Изменение владельца загруженных файлов

```ini
chown_uploads=YES
chown_username=другой_пользователь
```

### Локальные пользователи

```ini
local_enable=YES
write_enable=YES
chroot_local_user=YES          # заключить пользователей в их домашний каталог
```

При `chroot_local_user=YES` если домашний каталог доступен для записи пользователем, vsftpd может отказать в входе (проверка безопасности). Исправление:

```bash
chmod a-w /home/user           # сделать домашний каталог недоступным для записи
# или
allow_writeable_chroot=YES     # отключить проверку безопасности (менее безопасно)
```

### Логи vsftpd

По умолчанию логирование включено (`xferlog_enable=YES`):

```bash
sudo tail -f /var/log/vsftpd.log
```

---

## Файлы управления доступом

### /etc/ftpusers

Список пользователей, которым **запрещён** доступ по FTP. По одному имени пользователя на строку. Всегда существует — содержит системные аккаунты (root, daemon, bin и т.д.).

**Факт для экзамена:** `/etc/ftpusers` — это **чёрный список** — перечисленным пользователям доступ ЗАПРЕЩЁН.

### /etc/vsftpd/user_list

Работает по-разному в зависимости от `userlist_deny`:

```ini
userlist_enable=YES
userlist_file=/etc/vsftpd/user_list
userlist_deny=YES    # (по умолчанию) перечисленным пользователям ЗАПРЕЩЕНО
userlist_deny=NO     # перечисленным пользователям РАЗРЕШЕНО; остальным запрещено (белый список)
```

**Факт для экзамена:** `/etc/vsftpd/user_list` может работать как чёрный список (`userlist_deny=YES`) или белый список (`userlist_deny=NO`). `/etc/ftpusers` всегда является чёрным списком.

Оба файла могут сосуществовать. `user_list` проверяется первым.

---

## FTPS — FTP через TLS

Два режима FTPS:

| Режим | Описание | Порт |
|---|---|---|
| Явный FTPS (STARTTLS) | Клиент подключается обычно, затем переходит на TLS через команду `AUTH TLS` | 21 |
| Неявный FTPS | TLS с самого начала | 990 |

Конфигурация TLS для vsftpd:

```ini
ssl_enable=YES
rsa_cert_file=/etc/ssl/certs/vsftpd.pem
rsa_private_key_file=/etc/ssl/private/vsftpd.pem
force_local_data_ssl=YES        # требовать TLS для соединений данных
force_local_logins_ssl=YES      # требовать TLS для входа
ssl_tlsv1=YES
ssl_sslv2=NO
ssl_sslv3=NO
```

Создать самоподписанный сертификат:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/vsftpd.pem \
  -out /etc/ssl/certs/vsftpd.pem
```

**Режимы FTPS в клиентах (FileZilla):**

| Режим | Поведение |
|---|---|
| Use explicit FTP over TLS if available | TLS если поддерживается, иначе plaintext |
| Require explicit | TLS обязателен, иначе обрыв соединения |
| Require implicit | Сервер сразу ожидает TLS при подключении |
| Only plain FTP | Без шифрования (не использовать) |

**FTPS ≠ SFTP.** FTPS — это FTP поверх SSL/TLS (порт 21 + passive range). SFTP — файловая подсистема SSH (порт 22), совершенно другой протокол. SFTP встроен в каждый OpenSSH-сервер.

---

## Pure-FTPd

**Pure-FTPd** — гибкий, безопасный и быстрый FTP-сервер.

### Особенность конфигурации

Pure-FTPd не читает конфигурационный файл напрямую (за исключением режимов LDAP и SQL). Вместо этого он принимает параметры командной строки. Для удобства существует wrapper, который читает файл и запускает `pure-ftpd` с нужными ключами.

Конфигурационный файл (в зависимости от дистрибутива):

- `/etc/pure-ftpd/pure-ftpd.conf`
- `/etc/default/pure-ftpd`

### Важные ключи командной строки pure-ftpd

| Короткий | Длинный | Описание |
|---|---|---|
| `-4` | `--ipv4only` | Слушать только IPv4 |
| `-6` | `--ipv6only` | Слушать только IPv6 |
| `-A` | `--chrooteveryone` | Chroot для всех клиентов, кроме root |
| `-a gid` | `--trustedgid gid` | Не делать chroot для клиентов с GID gid |
| `-B` | `--daemonize` | Запустить в фоновом режиме |
| `-C num` | `--maxclientsperip num` | Максимум подключений с одного IP |
| `-c num` | `--maxclientsnumber num` | Максимум одновременных клиентов (по умолчанию 50) |
| `-d` | `--verboselog` | Логировать команды (дважды — и ответы) |
| `-e` | `--anonymousonly` | Только анонимные пользователи |
| `-E` | `--noanonymous` | Только аутентифицированные пользователи |
| `-i` | `--anonymouscantupload` | Запретить анонимную загрузку |
| `-I time` | `--maxidletime time` | Максимальное время простоя (минуты), по умолчанию 15 |
| `-k num` | `--maxdiskusagepct num` | Запретить загрузку, если раздел заполнен на num% |
| `-M` | `--anonymouscancreatedirs` | Разрешить анонимным создавать директории |
| `-r` | `--autorename` | Переименовывать файлы при конфликте имён |
| `-S port` | `--port port` | Слушать на нестандартном порту |
| `-S ip,port` | `--port ip,port` | Слушать на конкретном IP и порту |
| `-U umask` | `--umask umask` | Umask для загружаемых файлов |
| `-u uid` | `--minuid uid` | Запретить вход пользователям с UID ниже uid |
| `-V ipaddr` | `--trustedip ipaddr` | Разрешить неанонимный доступ только с этого IP |
| `-Z` | `--customerproof` | Блокировать типичные ошибки FTP-клиентов |

### Примеры запуска pure-ftpd

```bash
# Слушать на нестандартном порту 42
/usr/local/sbin/pure-ftpd -S 42

# Слушать только на конкретном IP и порту 21
/usr/local/sbin/pure-ftpd -S 192.168.0.42,21

# Ограничить 50 одновременными подключениями
/usr/local/sbin/pure-ftpd -c 50 &
```

### Настройка pure-ftpd для анонимной загрузки

```bash
# 1. Создать пользователя ftp
useradd --home /var/ftp --shell /bin/false ftp

# 2. Создать структуру директорий
# Корень и pub - только чтение (555), запись запрещена
mkdir -p --mode 555 /var/ftp
mkdir -p --mode 555 /var/ftp/pub
# Директория загрузки - чтение и запись (755)
mkdir -p --mode 755 /var/ftp/pub/incoming

# 3. Задать владельца
chown -R ftp:ftp /var/ftp/

# 4. Настроить inetd (/etc/inetd.conf)
# Флаг -e = anonymousonly (только анонимные пользователи)
# ftp stream tcp nowait root /usr/sbin/tcpd /usr/sbin/pure-ftpd -e

# 5. Перезагрузить inetd
killall -HUP inetd
```

Через конфигурационный файл нужно изменить директиву:

```ini
# Разрешить анонимную загрузку (AnonymousCantUpload no = загрузка разрешена)
AnonymousCantUpload no
```

```bash
systemctl restart pure-ftpd
```

**Ловушка двойного отрицания:** параметр `AnonymousCantUpload` инвертирован: `AnonymousCantUpload=no` → анонимы **разрешены**, `AnonymousCantUpload=yes` → **запрещены**. Флаг `-i` (`--anonymouscantupload`) в командной строке ЗАПРЕЩАЕТ загрузку анонимным.

### Папочная конфигурация на Debian/Ubuntu

Pure-FTPd на Debian/Ubuntu использует уникальную схему конфигурации через папку `/etc/pure-ftpd/conf/`:

- **имя файла** = имя параметра
- **содержимое файла** = значение параметра

```bash
# Запретить анонимов
echo "yes" | sudo tee /etc/pure-ftpd/conf/NoAnonymous

# Диапазон портов для passive mode
echo "10000 20000" | sudo tee /etc/pure-ftpd/conf/PassivePortRange
```

Зачем так сделано: переносимость — чтобы скопировать конфигурацию на другой сервер, достаточно `rsync`-нуть папку `conf/`.

Параметр `NoAnonymous` инвертирован: `NoAnonymous=no` → анонимы **разрешены**, `NoAnonymous=yes` → **запрещены**.

### Логирование Pure-FTPd (AltLog)

По умолчанию логирование включено через параметр `AltLog`. В дефолтном конфиге:

```
CLF:/var/log/pure-ftpd/transfer.log
```

Pure-FTPd поддерживает несколько форматов одновременно:

```
CLF:/var/log/pure-ftpd/transfer.log
W3C:/var/log/pure-ftpd/transfer-w3c.log
stats:/var/log/pure-ftpd/transfer-stats.log
```

| Формат | Применение |
|---|---|
| `CLF` | Стандартный текстовый лог (по умолчанию) |
| `W3C` | Формат W3C extended — для централизованного сбора логов / SIEM |
| `stats` | Оптимизирован под автоматическую статистику и отчётность |

После правки — перезапуск:

```bash
sudo systemctl restart pure-ftpd
```

### TLS для Pure-FTPd

**Шаг 1** — включить TLS:

```bash
echo "1" | sudo tee /etc/pure-ftpd/conf/TLS
```

Значения параметра `TLS`:

| Значение | Режим |
|---|---|
| `0` | Выключен |
| `1` | Опционально (TLS или plain на выбор клиента) |
| `2` | Обязательно (только TLS-соединения) |

**Шаг 2** — сгенерировать self-signed сертификат:

```bash
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout pure-ftpd.pem \
  -out pure-ftpd.pem \
  -days 730
```

Важные флаги:

- `-nodes` — без парольной фразы на ключе (демону нужен бесключевой доступ)
- `-x509` — сразу self-signed сертификат, а не CSR
- Ключ и сертификат записываются в **один** `.pem` файл — Pure-FTPd ожидает именно такой формат

**Шаг 3** — положить в стандартное место с правильными правами:

```bash
sudo cp pure-ftpd.pem /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/pure-ftpd.pem
sudo systemctl restart pure-ftpd
```

Имя файла `pure-ftpd.pem` используется **по умолчанию**. Права `600` **обязательны** — демон откажется стартовать при более широких правах.

---

## ProFTPd

ProFTPd (Professional FTP Server) — мощный конфигурируемый FTP-сервер.

Ключевые факты:

- Конфигурационный файл: `/etc/proftpd/proftpd.conf` — формат в стиле Apache
- Можно запускать как standalone-демон или через inetd
- При получении сигнала SIGHUP в standalone-режиме перечитывает конфигурацию
- PID файл: `/var/run/proftpd.pid`

```
# /etc/proftpd/proftpd.conf (пример)
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

Файл управления доступом: `/etc/proftpd/ftpusers` — запрещённые пользователи (та же роль что и `/etc/ftpusers`).

На экзамене LPIC-2 требуется только осведомлённость о существовании ProFTPd.

---

## Разрешения и безопасность при анонимной загрузке

### Права директорий

| Сценарий | Права | Значение |
|---|---|---|
| Только чтение | `755` | Все видят и читают файлы |
| Только запись (secure) | `733` | Анонимные пишут, но не видят содержимое |
| Чтение и запись | `777` | Небезопасно, не рекомендуется |

### Меры безопасности при разрешении анонимной загрузки

- Использовать права `733` на директорию: пользователи не видят чужие загрузки
- Ограничить дисковое пространство (`-k` в Pure-FTPd)
- Ограничить количество подключений с одного IP (`-C` в Pure-FTPd)
- Регулярно проверять содержимое директории загрузки
- Включить логирование (`-d -d` в Pure-FTPd)
- Запустить сервер в chroot (`-A` в Pure-FTPd)

---

## FTP через firewall

### Активный режим

Для активного FTP в iptables нужно разрешить:

- Входящие подключения на порт 21
- Исходящие подключения с порта 20

### Пассивный режим

Для пассивного FTP нужно загрузить модуль отслеживания соединений:

```bash
# Загрузить модуль для отслеживания FTP-соединений
modprobe ip_conntrack_ftp

# Разрешить related-соединения в iptables
iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
```

Для пассивного FTP через iptables модуль `ip_conntrack_ftp` должен быть загружен, а соединения со статусом `RELATED` разрешены.

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

| Файл / путь | Назначение |
|---|---|
| `/etc/vsftpd.conf` | Основной конфиг vsftpd |
| `/etc/vsftpd/vsftpd.conf` | Альтернативный путь vsftpd (зависит от дистрибутива) |
| `/var/log/vsftpd.log` | Лог vsftpd (xferlog) |
| `/etc/ftpusers` | Пользователи с запретом FTP (чёрный список, всегда активен) |
| `/etc/vsftpd/user_list` | Список пользователей vsftpd (чёрный или белый список) |
| `/etc/pure-ftpd/pure-ftpd.conf` | Конфиг Pure-FTPd (CentOS) |
| `/etc/default/pure-ftpd` | Конфиг Pure-FTPd (Debian/Ubuntu) |
| `/etc/pure-ftpd/conf/` | Папочная конфигурация Pure-FTPd (файл=параметр, Debian/Ubuntu) |
| `/etc/ssl/private/pure-ftpd.pem` | Дефолтный путь TLS-сертификата Pure-FTPd |
| `/etc/proftpd/proftpd.conf` | Конфиг ProFTPd |
| `/var/run/proftpd.pid` | PID-файл ProFTPd |
| `/etc/inetd.conf` | Конфиг суперсервера inetd (legacy) |
| `/var/ftp/` | Типичная домашняя директория пользователя ftp |
| `/srv/ftp/` | Альтернативная директория ftp (Ubuntu) |

### Команды

```bash
# Запуск pure-ftpd на нестандартном порту
pure-ftpd -S 42

# Запуск pure-ftpd на конкретном IP
pure-ftpd -S 192.168.0.42,21

# Ограничить число клиентов
pure-ftpd -c 50

# Загрузить модуль для FTP через firewall
modprobe ip_conntrack_ftp

# Перезагрузить inetd
kill -HUP $(cat /var/run/inetd.pid)
```

### Критические директивы vsftpd

| Директива | По умолчанию | Для анонимной загрузки |
|---|---|---|
| `anonymous_enable` | YES | YES (нужен) |
| `write_enable` | NO | YES (обязателен) |
| `anon_upload_enable` | NO | YES (обязателен) |
| `anon_mkdir_write_enable` | NO | YES (если нужно создание директорий) |
| `anon_world_readable_only` | YES | NO (для гибких прав) |

### Типичные ошибки на экзамене

- Активный vs пассивный: в пассивном клиент инициирует оба соединения
- Забыть включить `write_enable=YES` при настройке `anon_upload_enable=YES` — загрузка не работает
- vsftpd: `listen=NO` + `listen_ipv6=YES` = dual-stack (не «сервер не слушает»!)
- vsftpd: passive-порты **не заданы** в дефолтном конфиге — добавлять вручную (`pasv_min_port`, `pasv_max_port`)
- vsftpd на Ubuntu: анонимный root — `/srv/ftp/`, **не** `/var/ftp/`
- `/etc/ftpusers` — всегда чёрный список, нет параметра для изменения этого
- `userlist_deny=NO` — user_list становится белым списком; остальным запрещено
- Pure-FTPd: `AnonymousCantUpload no` разрешает загрузку (двойное отрицание)
- Pure-FTPd: флаг `-i` (`--anonymouscantupload`) ЗАПРЕЩАЕТ загрузку анонимным
- Pure-FTPd: папочная конфигурация `/etc/pure-ftpd/conf/` — файл=параметр, содержимое=значение
- Pure-FTPd TLS: ключ и сертификат **в одном** `.pem` файле, права `600` обязательны
- FTPS (FTP+TLS, порт 21) ≠ SFTP (подсистема SSH, порт 22)
- Владелец корневого каталога анонимного FTP должен принадлежать root, а не ftp
- `chroot_local_user=YES` + домашний каталог с правом записи — vsftpd отказывает в входе
- ProFTPd на экзамене — только awareness, не детальная конфигурация

---

## Практические вопросы

**1. Какое минимальное число директив vsftpd.conf нужно включить, чтобы анонимные пользователи могли загружать файлы?**

Две директивы — `write_enable=YES` и `anon_upload_enable=YES`. Плюс пользователь ftp должен иметь права записи на директорию загрузки.

**2. Чем пассивный режим FTP отличается от активного?**

В активном режиме сервер сам инициирует соединение данных от порта 20 к порту клиента. В пассивном режиме клиент инициирует оба соединения — командное и данных. Пассивный режим используется, когда клиент за firewall или NAT.

**3. Как запустить Pure-FTPd на порту 2121 и ограничить 30 одновременными подключениями?**

```bash
pure-ftpd -S 2121 -c 30 &
```

**4. Какие права должна иметь директория для анонимной загрузки, чтобы пользователи не видели содержимое?**

Права `733` (rwx-wx-wx). Владелец имеет полный доступ, группа и остальные могут записывать, но не читать список файлов.

**5. Какой модуль ядра нужно загрузить для работы пассивного FTP через iptables?**

`ip_conntrack_ftp`. Команда: `modprobe ip_conntrack_ftp`. Также нужно разрешить `RELATED` соединения в iptables.

**6. Как запретить анонимную загрузку через командную строку Pure-FTPd?**

Использовать флаг `-i` или `--anonymouscantupload`:

```bash
pure-ftpd -i
```

**7. Как изменить директиву в pure-ftpd.conf, чтобы разрешить анонимную загрузку?**

```ini
AnonymousCantUpload no
```

Затем перезапустить: `systemctl restart pure-ftpd`

**8. На каких портах работает FTP в активном режиме?**

Командный канал — порт 21 (сервер слушает). Канал данных — порт 20 (сервер инициирует соединение). Клиент использует непривилегированные порты выше 1023.
