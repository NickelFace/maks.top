---
title: "LPIC-2 208.4 — Nginx as Web Server and Reverse Proxy"
date: 2026-03-01
description: "Архитектура Nginx, конфигурация обратного прокси, настройка виртуальных серверов, PHP через FastCGI (php-fpm), proxy_pass против fastcgi_pass, блоки location, try_files. Тема экзамена LPIC-2 208.4."
tags: ["Linux", "LPIC-2", "Nginx", "reverse proxy", "FastCGI", "web server"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-208-4-nginx/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 208.4** — Nginx как веб-сервер и обратный прокси (вес: 2). Охватывает установку и настройку Nginx в качестве обратного прокси и базового HTTP-сервера.

---

## Что такое Nginx

**Nginx** (произносится «engine-x») — многофункциональный сервер с открытым исходным кодом. Может работать как:

- HTTP-веб-сервер
- HTTP-сервер обратного прокси
- Прокси IMAP/POP3

> Такие платформы как **Netflix**, **WordPress** и **GitHub** используют Nginx.

**Ключевые особенности:**

- Не использует потоки — работает на **событийно-ориентированной (асинхронной) архитектуре**
- Малое потребление памяти
- Предсказуемая производительность при высокой нагрузке
- Подходит как для небольших, так и для крупных окружений
- Коммерческая версия: **Nginx Plus**

---

## Обратный прокси

**Прокси-сервер** — посредник, который перенаправляет запросы множества клиентов на различные серверы в интернете.

**Обратный прокси** — прокси-сервер, который:

- Располагается **за межсетевым экраном** в частной сети
- Маршрутизирует клиентские запросы к соответствующим **бэкенд-серверам**
- Обеспечивает дополнительный уровень абстракции и управления трафиком

### Варианты использования:

| Вариант использования | Описание |
|---|---|
| **Балансировка нагрузки** | Распределяет запросы по серверам, предотвращает перегрузку; перенаправляет трафик при отказе сервера |
| **Ускорение трафика** | Сжатие данных, кэширование, SSL-разгрузка бэкенд-серверов |
| **Безопасность и анонимность** | Скрывает бэкенд-серверы, защищает от атак, позволяет нескольким серверам работать под одним URL |

---

## Файлы конфигурации

| Путь | Описание |
|---|---|
| `/etc/nginx/` | Директория конфигурации |
| `/etc/nginx/nginx.conf` | Основной файл конфигурации |
| `/etc/nginx/sites-enabled/default` | Конфигурация сайта по умолчанию (Debian-based) |

---

## Базовая конфигурация обратного прокси

```nginx
location / {
    proxy_set_header X-Real-IP        $remote_addr;
    proxy_set_header X-Forwarded-For  $remote_addr;
    proxy_set_header Host             $host;
    proxy_pass       http://localhost:8000;
}
```

> Все запросы Nginx перенаправляет на HTTP-сервер по адресу `localhost:8000`.

### Полный пример с PHP-прокси:

```nginx
server {
    listen   80;

    root /var/www/;
    index index.php index.html index.htm;

    server_name example.com www.example.com;

    location / {
        try_files $uri $uri/ /index.php;
    }

    location ~ \.php$ {
        proxy_set_header X-Real-IP       $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host            $host;
        proxy_pass http://localhost:8080;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

> `location ~ /\.ht` — предотвращает раздачу содержимого файла `.htaccess`.
> `try_files` — пытается отдать запрошенный файл; если не найден, передаёт запрос прокси.

---

## Базовая конфигурация веб-сервера

```nginx
server {
    # Listen on all interfaces (or specific IP: listen x.x.x.x:80;)
    listen 80;

    # Server name. Wildcard: *.example.com — subdomains only.
    # For domain + subdomains: example.com and *.example.com
    server_name example.com www.example.com;

    # Document root (best placed at server level, not inside location)
    root /usr/local/www/example.com;

    # Logs. Error log cannot be disabled.
    access_log /var/log/nginx/example.access.log;
    error_log  /var/log/nginx/example.error.log;

    location / {
        # Rewrite rules and other conditions
        # Avoid if() where possible
    }
}
```

---

## Поддержка PHP через FastCGI

Для работы с PHP Nginx использует **спаунер FastCGI**. Рекомендуется: **php-fpm**.

Возможности php-fpm:
- Адаптивный запуск рабочих процессов
- Статистика
- Рабочие процессы с разными `uid/gid/chroot/environment` и `php.ini`
- Замена `safe_mode`

Лучшая практика — выделить конфигурацию PHP в отдельный файл и включить его:

```nginx
# At the end of nginx.conf:
include php.conf;
```

Содержимое `php.conf`:

```nginx
location ~ \.php {
    # Security: return 404 if file doesn't exist
    try_files $uri =404;

    fastcgi_param  QUERY_STRING       $query_string;
    fastcgi_param  REQUEST_METHOD     $request_method;
    fastcgi_param  CONTENT_TYPE       $content_type;
    fastcgi_param  CONTENT_LENGTH     $content_length;

    fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
    fastcgi_param  SCRIPT_FILENAME    $request_filename;

    fastcgi_param  REQUEST_URI        $request_uri;
    fastcgi_param  DOCUMENT_URI       $document_uri;
    fastcgi_param  DOCUMENT_ROOT      $document_root;
    fastcgi_param  SERVER_PROTOCOL    $server_protocol;

    fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
    fastcgi_param  SERVER_SOFTWARE    nginx;

    fastcgi_param  REMOTE_ADDR        $remote_addr;
    fastcgi_param  REMOTE_PORT        $remote_port;
    fastcgi_param  SERVER_ADDR        $server_addr;
    fastcgi_param  SERVER_PORT        $server_port;
    fastcgi_param  SERVER_NAME        $server_name;

    # Unix socket:
    # fastcgi_pass unix:/tmp/php5-fpm.sock;

    # TCP connection:
    fastcgi_pass 127.0.0.1:9000;
}
```

---

## Установка

### Debian / Ubuntu:

```bash
apt-get install nginx
# nginx starts automatically
```

### Red Hat / CentOS:

```bash
# First add EPEL repository
yum install epel-release
yum install nginx

# Start and enable manually
systemctl start nginx
systemctl enable nginx
```

> Если **Apache** уже запущен на порту 80 — остановите его перед запуском Nginx, либо настройте оба сервера на **разные порты**.

---

## Шпаргалка к экзамену

### Ключевые директивы:

| Директива | Назначение |
|---|---|
| `listen 80` | Порт для прослушивания |
| `server_name` | Имя(имена) хоста для данного серверного блока |
| `root` | Корневая директория документов |
| `proxy_pass` | Перенаправление запросов на HTTP-бэкенд |
| `fastcgi_pass` | Перенаправление запросов на FastCGI-бэкенд (PHP) |
| `try_files` | Попытка отдать файл, с откатом к прокси/индексу |
| `access_log` | Путь к журналу доступа |
| `error_log` | Путь к журналу ошибок (нельзя отключить) |
| `include` | Включить дополнительный файл конфигурации |

### proxy_pass против fastcgi_pass:

| Директива | Когда использовать |
|---|---|
| `proxy_pass` | Проксирование на HTTP/HTTPS сервер |
| `fastcgi_pass` | Проксирование на FastCGI-приложение (PHP-FPM) |

### Ключевые факты для экзамена:

| Вопрос | Ответ |
|---|---|
| Архитектура Nginx | Событийно-ориентированная, асинхронная — без потоков |
| Директория конфигурации | `/etc/nginx/` |
| Основной файл конфигурации | `/etc/nginx/nginx.conf` |
| Метод интеграции PHP | FastCGI через `fastcgi_pass` |
| Директива для корневой директории документов | `root` |
| Блокировка раздачи `.htaccess` | `location ~ /\.ht { deny all; }` |
