---
title: "LPIC-2 212.3 — Secure Shell (OpenSSH)"
date: 2026-06-14
description: "Настройка клиента и сервера OpenSSH, аутентификация по ключам, ssh-keygen/ssh-agent/ssh-copy-id, проброс портов, перенаправление X11, SCP/SFTP, усиление безопасности sshd_config. Тема экзамена LPIC-2 212.3."
tags: ["Linux", "LPIC-2", "OpenSSH", "SSH", "SCP", "SFTP", "port forwarding", "X11"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-212-3-openssh/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.3** — Secure shell (OpenSSH) (вес: 4). Охватывает настройку клиента и сервера SSH, управление ключами, проброс портов и перенаправление X11.

---

## Компоненты OpenSSH

| Двоичный файл | Роль |
|---|---|
| `ssh` | Клиент — подключение к удалённым хостам |
| `sshd` | Серверный демон — принимает входящие соединения |
| `ssh-keygen` | Генерация и управление парами ключей |
| `ssh-agent` | Агент аутентификации (кэширует приватные ключи) |
| `ssh-add` | Добавление ключей в ssh-agent |
| `ssh-copy-id` | Копирование публичного ключа в authorized_keys на удалённом сервере |
| `scp` | Безопасное копирование (передача файлов через SSH) |
| `sftp` | Подсистема безопасного FTP через SSH |
| `ssh-keyscan` | Сбор публичных ключей с серверов |

Порт по умолчанию: **22**

---

## Конфигурация сервера — sshd_config

Основной конфиг сервера: `/etc/ssh/sshd_config`

```bash
systemctl restart sshd     # применить изменения
systemctl reload sshd      # перезагрузить конфиг без разрыва соединений
sshd -t                    # проверить синтаксис конфига
```

### Ключевые параметры

```ini
Port 22                          # порт прослушивания (можно указать несколько строк Port)
ListenAddress 0.0.0.0            # слушать на всех IPv4-интерфейсах
ListenAddress ::                 # слушать на всех IPv6-интерфейсах

PermitRootLogin no               # отключить вход root (рекомендуется)
# PermitRootLogin prohibit-password  # разрешить root только с аутентификацией по ключу
# PermitRootLogin yes            # разрешить root с паролем (небезопасно)

PasswordAuthentication yes       # разрешить аутентификацию по паролю (установить no для принудительного использования ключей)
PubkeyAuthentication yes         # разрешить аутентификацию по ключу
AuthorizedKeysFile .ssh/authorized_keys  # расположение авторизованных ключей

PermitEmptyPasswords no          # запретить аккаунты с пустыми паролями
MaxAuthTries 3                   # максимум попыток входа перед отключением
MaxSessions 10                   # максимум сессий на одно соединение

UsePAM yes                       # использовать PAM для аутентификации

X11Forwarding yes                # разрешить перенаправление X11
AllowTcpForwarding yes           # разрешить проброс портов

# Ограничить доступ конкретными пользователями/группами
AllowUsers alice bob             # только эти пользователи могут входить
AllowGroups ssh-users            # только члены этой группы
DenyUsers mallory                # запретить конкретным пользователям
DenyGroups badgroup

# Тайм-аут простоя
ClientAliveInterval 300          # отправлять keepalive каждые 300 секунд
ClientAliveCountMax 2            # отключить после 2 пропущенных keepalive

Banner /etc/issue.net            # показывать содержимое файла до входа

Subsystem sftp /usr/lib/openssh/sftp-server   # включить подсистему SFTP
```

> **Факт для экзамена:** Изменения в `sshd_config` требуют выполнения `systemctl reload sshd` (или сначала `sshd -t` для проверки синтаксиса).

### Значения PermitRootLogin

| Значение | Поведение |
|---|---|
| `yes` | Root может входить с паролем или ключом |
| `no` | Root не может входить вообще |
| `prohibit-password` | Root может входить только с ключом (без пароля) |
| `forced-commands-only` | Root может входить с ключом только если указана принудительная команда |

---

## Конфигурация клиента

Конфиг пользователя: `~/.ssh/config`  
Общесистемный конфиг: `/etc/ssh/ssh_config`

```
# ~/.ssh/config
Host webserver
    HostName 192.168.1.100
    User deploy
    Port 2222
    IdentityFile ~/.ssh/deploy_key

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ForwardAgent no
```

```bash
ssh webserver          # использует настройки из ~/.ssh/config для "webserver"
```

### Распространённые опции ssh

```bash
ssh -p 2222 user@host              # подключиться на порт 2222
ssh -i ~/.ssh/mykey user@host      # использовать конкретный приватный ключ
ssh -l user host                   # указать имя пользователя
ssh -v user@host                   # подробный вывод (отладка)
ssh -vv user@host                  # более подробный вывод
ssh -o StrictHostKeyChecking=no    # пропустить проверку ключа хоста (небезопасно, использовать с осторожностью)
```

---

## Аутентификация по ключу

### Создание пары ключей

```bash
ssh-keygen -t ed25519 -C "alice@example.com"    # Ed25519 (современный, рекомендуется)
ssh-keygen -t rsa -b 4096 -C "alice@example.com"    # RSA 4096 бит
ssh-keygen -t ecdsa -b 521                           # ECDSA
```

```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/alice/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase): ****
```

Созданные файлы:
- `~/.ssh/id_ed25519` — приватный ключ (права доступа должны быть 0600)
- `~/.ssh/id_ed25519.pub` — публичный ключ

> **Типы ключей:** RSA — традиционный выбор. Ed25519 — современный, короче и быстрее. DSA устарел и отключён в OpenSSH 7.0+.

### Копирование публичного ключа на сервер

```bash
ssh-copy-id user@server                              # скопировать ключ по умолчанию
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server    # скопировать конкретный ключ
```

Это добавляет публичный ключ в `~/.ssh/authorized_keys` на сервере.

Ручной эквивалент:

```bash
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### authorized_keys

`~/.ssh/authorized_keys` — один публичный ключ на строку. Права доступа должны быть:
- Каталог `~/.ssh/`: **0700**
- `~/.ssh/authorized_keys`: **0600**
- принадлежать пользователю

```
# ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3Nza... alice@laptop
# Ограничить ключ одной командой:
command="backup.sh",no-port-forwarding,no-x11-forwarding ssh-ed25519 AAAAC3Nza... backup@server
```

Опции ключа (перед типом ключа):
- `command="cmd"` — принудительно выполнять указанную команду при использовании этого ключа
- `no-port-forwarding` — отключить проброс портов для этого ключа
- `no-x11-forwarding` — отключить перенаправление X11
- `no-agent-forwarding` — отключить пересылку агента
- `from="192.168.1.*"` — разрешить этот ключ только с совпадающих IP

### known_hosts

При первом подключении к серверу ssh сохраняет его ключ хоста:
- `~/.ssh/known_hosts` — для пользователя
- `/etc/ssh/ssh_known_hosts` — общесистемный

```bash
ssh-keyscan -H hostname >> ~/.ssh/known_hosts    # предварительно заполнить
ssh-keygen -R hostname                           # удалить ключ хоста (после пересборки сервера)
```

---

## ssh-agent

ssh-agent кэширует расшифрованные приватные ключи, чтобы не вводить кодовую фразу многократно.

```bash
eval "$(ssh-agent)"         # запустить агента и установить переменные окружения
ssh-add ~/.ssh/id_ed25519   # добавить ключ (запросит кодовую фразу один раз)
ssh-add -l                  # список кэшированных ключей
ssh-add -d ~/.ssh/id_ed25519  # удалить ключ
ssh-add -D                  # удалить все ключи
```

**Пересылка агента** — передаёт соединение агента через SSH, чтобы можно было использовать локальные ключи на промежуточных серверах:

```bash
ssh -A user@jumphost         # переслать агента на jumphost
```

```ini
# ~/.ssh/config
Host jumphost
    ForwardAgent yes
```

> **Предупреждение о безопасности:** Пересылка агента удобна, но рискованна — любой, кто имеет root на промежуточном сервере, может использовать ваши ключи пока вы подключены.

---

## Проброс портов (туннелирование)

### Локальный проброс портов (-L)

Открывает локальный порт, перенаправляющий на удалённый хост/порт через SSH:

```
ssh -L [local_addr:]local_port:remote_host:remote_port user@sshserver
```

```bash
# Доступ к удалённому MySQL (3306) как к локальному
ssh -L 3307:localhost:3306 user@dbserver
# Теперь подключиться: mysql -h 127.0.0.1 -P 3307

# Доступ к внутреннему веб-серверу через SSH jump-хост
ssh -L 8080:internal-web:80 user@jumphost
# Теперь открыть: http://localhost:8080
```

### Удалённый проброс портов (-R)

Открывает порт на **удалённом** сервере, который перенаправляет обратно на локальный хост/порт:

```
ssh -R [remote_addr:]remote_port:local_host:local_port user@sshserver
```

```bash
# Сделать локальный веб-сервер (порт 80) доступным на порту 8080 удалённого сервера
ssh -R 8080:localhost:80 user@remoteserver
# На remoteserver: curl http://localhost:8080 → достигает локального порта 80
```

Применение: открыть локальный сервис через брандмауэр (обратный туннель).

### Динамический проброс портов (-D)

Создаёт прокси SOCKS:

```bash
ssh -D 1080 user@sshserver
# Настроить браузер на использование прокси SOCKS5 localhost:1080
```

### Флаги -N и -f

```bash
ssh -N -L 3307:localhost:3306 user@server   # -N: не выполнять удалённую команду
ssh -f -N -L 3307:localhost:3306 user@server  # -f: перейти в фоновый режим
```

---

## Перенаправление X11

Позволяет запускать GUI-приложения на удалённом сервере и отображать их локально.

**Сервер (`/etc/ssh/sshd_config`):**
```ini
X11Forwarding yes
X11DisplayOffset 10      # первый номер дисплея для использования (по умолчанию: 10)
```

**Клиент:**
```bash
ssh -X user@server       # включить перенаправление X11
ssh -Y user@server       # доверенное перенаправление X11 (менее безопасно, меньше ограничений)
```

```bash
# После подключения с -X:
firefox &                # открывает окно Firefox на вашем локальном дисплее
```

`-X` = ненадёжное (безопаснее, некоторые приложения могут отказаться работать)  
`-Y` = доверенное (все разрешения X11 предоставлены)

---

## SCP — безопасное копирование

```bash
# Скопировать локальный файл на удалённый сервер
scp file.txt user@host:/remote/path/

# Скопировать удалённый файл локально
scp user@host:/remote/file.txt /local/path/

# Рекурсивно скопировать каталог
scp -r /local/dir/ user@host:/remote/dir/

# Использовать другой порт
scp -P 2222 file.txt user@host:/path/

# Сохранить временные метки и права доступа
scp -p file.txt user@host:/path/

# Указать ключ
scp -i ~/.ssh/mykey file.txt user@host:/path/
```

---

## SFTP — протокол передачи файлов через SSH

SFTP — подсистема SSH, а не FTP через SSH. Предоставляет протокол передачи файлов поверх SSH.

```bash
sftp user@host
sftp> ls
sftp> cd /remote/dir
sftp> get remotefile.txt
sftp> put localfile.txt
sftp> mkdir newdir
sftp> rm file.txt
sftp> bye
```

Ограничить пользователя только SFTP (без оболочки) через `sshd_config`:

```ini
Match User ftpuser
    ForceCommand internal-sftp
    ChrootDirectory /var/sftp/%u
    AllowTcpForwarding no
    X11Forwarding no
```

```bash
# /var/sftp/ftpuser должен принадлежать root
chown root:root /var/sftp/ftpuser
chmod 755 /var/sftp/ftpuser
# Создать каталог для загрузок с правом записи внутри
mkdir /var/sftp/ftpuser/upload
chown ftpuser:ftpuser /var/sftp/ftpuser/upload
```

---

## Управление ключами хоста

Ключи хоста сервера находятся в `/etc/ssh/`:

```
/etc/ssh/ssh_host_rsa_key       (приватный, 0600)
/etc/ssh/ssh_host_rsa_key.pub   (публичный)
/etc/ssh/ssh_host_ed25519_key
/etc/ssh/ssh_host_ed25519_key.pub
```

Пересоздать ключи хоста (например, после клонирования VM):

```bash
rm /etc/ssh/ssh_host_*
dpkg-reconfigure openssh-server    # Debian
ssh-keygen -A                      # пересоздать все отсутствующие ключи хоста
```

---

## Шпаргалка для экзамена

### Файлы и пути

| Путь | Описание |
|---|---|
| `/etc/ssh/sshd_config` | Конфигурация сервера SSH |
| `/etc/ssh/ssh_config` | Настройки клиента SSH по умолчанию (общесистемные) |
| `~/.ssh/config` | Конфиг клиента SSH (для пользователя) |
| `~/.ssh/id_ed25519` | Приватный ключ (0600) |
| `~/.ssh/id_ed25519.pub` | Публичный ключ |
| `~/.ssh/authorized_keys` | Разрешённые публичные ключи для этого пользователя (0600) |
| `~/.ssh/known_hosts` | Доверенные ключи хоста сервера |
| `/etc/ssh/ssh_known_hosts` | Общесистемные доверенные ключи хоста |
| `/etc/ssh/ssh_host_*_key` | Приватные ключи хоста сервера (0600) |

### Ключевые команды

```bash
ssh-keygen -t ed25519              # создать пару ключей Ed25519
ssh-copy-id user@server            # установить публичный ключ на сервере
ssh -L 3307:localhost:3306 user@db # локальный проброс портов
ssh -R 8080:localhost:80 user@srv  # удалённый проброс портов
ssh -D 1080 user@server            # прокси SOCKS
ssh -X user@server                 # перенаправление X11
scp file.txt user@host:/path/      # безопасное копирование
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| Права `authorized_keys` | Должны быть 0600; `~/.ssh/` должен быть 0700 |
| `-L` vs `-R` | `-L` = локальный порт перенаправляется на удалённый; `-R` = удалённый порт перенаправляется на локальный |
| `-X` vs `-Y` | `-X` = ненадёжное (безопаснее); `-Y` = доверенное (некоторые приложения могут требовать) |
| SFTP vs FTP | SFTP — подсистема SSH, не FTP через SSH — совершенно разные протоколы |
| `PermitRootLogin prohibit-password` | Root может входить с ключом, но не с паролем |
| Reload vs restart | `reload` сохраняет соединения; `restart` разрывает их |
| Несоответствие ключа хоста | Отредактировать `~/.ssh/known_hosts` или выполнить `ssh-keygen -R hostname` |
| Ключи DSA | Отключены в OpenSSH 7.0+ — не использовать |
