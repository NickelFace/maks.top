---
title: "Docker"
description: "Контейнеры: запуск, управление, логи, очистка — docker run, ps, stop, rm, exec, inspect"
icon: "🐳"
group: "Cloud & DevOps"
tags: ["Docker", "Containers", "DevOps"]
date: 2026-04-14
page_lang: "ru"
lang_pair: "/kb/docker/"
pagefind_ignore: true
build:
  list: never
  render: always
---

<div class="intro-card">
Docker: <strong>жизненный цикл контейнера</strong> — запуск, остановка, удаление. Ключевые флаги <code>docker run</code>, просмотр логов, мониторинг, работа внутри контейнера.
</div>

## Жизненный цикл контейнера

```
docker run ──► running ──► stopped ──► (удалён)
                  │                        ▲
                  └── docker stop ─────────┤
                        docker start ◄─────┘
                              docker rm
```

`docker run` = `docker create` + `docker start`. Без флага `-d` контейнер занимает терминал.

---

## docker run — запуск контейнера

<div class="ref-panel">
<div class="ref-panel-head">Основные флаги</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Флаг</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">-d</td><td class="desc">Запустить в фоне, вернуть ID контейнера</td></tr>
<tr><td class="mono">--name myapp</td><td class="desc">Дать контейнеру имя (иначе — случайное)</td></tr>
<tr><td class="mono">-p 8080:80</td><td class="desc">Пробросить порт: хост:контейнер</td></tr>
<tr><td class="mono">-p 127.0.0.1:8080:80</td><td class="desc">Пробросить только на localhost</td></tr>
<tr><td class="mono">--rm</td><td class="desc">Удалить контейнер автоматически после завершения</td></tr>
<tr><td class="mono">-e KEY=VALUE</td><td class="desc">Переменная окружения</td></tr>
<tr><td class="mono">--env-file .env</td><td class="desc">Переменные из файла</td></tr>
<tr><td class="mono">-v /host:/container</td><td class="desc">Bind mount: папка хоста → папка контейнера</td></tr>
<tr><td class="mono">--network mynet</td><td class="desc">Подключить к сети</td></tr>
<tr><td class="mono">--restart unless-stopped</td><td class="desc">Политика перезапуска (no / on-failure / always / unless-stopped)</td></tr>
<tr><td class="mono">-it</td><td class="desc">Интерактивный режим с псевдотерминалом</td></tr>
<tr><td class="mono">--entrypoint bash</td><td class="desc">Переопределить entrypoint образа</td></tr>
</tbody>
</table>
</div>
</div>

```bash
# nginx в фоне, порт 8080 → 80
docker run -d -p 8080:80 --name webserver nginx

# alpine — выполнить команду и сразу удалить контейнер
docker run --rm alpine echo "hello"

# интерактивная оболочка внутри ubuntu
docker run -it --rm ubuntu bash
```

---

## docker ps — список контейнеров

```bash
docker ps                              # только запущенные
docker ps -a                           # все, включая остановленные
docker ps -q                           # только ID (удобно для скриптов)
docker ps --filter "name=web"          # фильтрация по имени
docker ps --filter "status=exited"     # только завершённые
docker ps --format "{{.Names}}\t{{.Status}}"  # кастомный формат
```

---

## Остановка и удаление

```bash
docker stop webserver    # SIGTERM → ждёт graceful shutdown (10 с по умолчанию)
docker kill webserver    # SIGKILL → убивает мгновенно

docker start webserver   # запустить остановленный
docker restart webserver # stop + start
```

`stop` даёт приложению время корректно завершить работу: сохранить данные, закрыть соединения. `kill` — только в экстренных случаях.

```bash
docker rm webserver             # удалить остановленный контейнер
docker rm -f webserver          # удалить принудительно (даже запущенный)
docker container prune          # удалить все остановленные контейнеры
```

---

## exec — команды внутри контейнера

```bash
docker exec -it webserver bash          # интерактивная оболочка
docker exec webserver cat /etc/nginx/nginx.conf  # разовая команда
docker exec -e DEBUG=1 webserver sh     # с переменной окружения
docker exec -u root webserver id        # от имени другого пользователя
```

---

## Логи и мониторинг

```bash
docker logs webserver              # все логи
docker logs -f webserver           # следить в реальном времени
docker logs --tail 20 webserver    # последние 20 строк
docker logs --since 5m webserver   # за последние 5 минут
docker logs --timestamps webserver # с временными метками
```

```bash
docker inspect webserver           # полные метаданные в JSON
docker inspect -f '{{.NetworkSettings.IPAddress}}' webserver  # IP контейнера

docker stats                       # живой мониторинг CPU/RAM всех контейнеров
docker stats --no-stream           # snapshot без обновления
docker top webserver               # процессы внутри контейнера
docker port webserver              # маппинг портов
```

---

## Копирование файлов

```bash
docker cp webserver:/etc/nginx/nginx.conf ./nginx.conf  # из контейнера
docker cp ./index.html webserver:/usr/share/nginx/html/ # в контейнер
```

Работает для запущенных и остановленных контейнеров.

---

## Полный цикл

```bash
# 1. Запустить
docker run -d -p 8080:80 --name web nginx

# 2. Проверить
curl http://localhost:8080

# 3. Посмотреть логи
docker logs web

# 4. Зайти внутрь
docker exec -it web bash

# 5. Остановить
docker stop web

# 6. Удалить
docker rm web
```
