---
title: "Docker"
description: "Containers: run, manage, logs, cleanup — docker run, ps, stop, rm, exec, inspect"
icon: "🐳"
group: "Cloud & DevOps"
tags: ["Docker", "Containers", "DevOps"]
date: 2026-04-14
page_lang: "en"
lang_pair: "/kb/ru/docker/"
---

<div class="intro-card">
Docker: <strong>container lifecycle</strong> — run, stop, remove. Key <code>docker run</code> flags, log inspection, monitoring, running commands inside containers.
</div>

## Container lifecycle

```
docker run ──► running ──► stopped ──► (removed)
                  │                        ▲
                  └── docker stop ─────────┤
                        docker start ◄─────┘
                              docker rm
```

`docker run` = `docker create` + `docker start`. Without `-d` the container occupies the terminal.

---

## docker run — start a container

<div class="ref-panel">
<div class="ref-panel-head">Key flags</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Flag</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">-d</td><td class="desc">Run in background, return container ID</td></tr>
<tr><td class="mono">--name myapp</td><td class="desc">Assign a name (otherwise random)</td></tr>
<tr><td class="mono">-p 8080:80</td><td class="desc">Publish port: host:container</td></tr>
<tr><td class="mono">-p 127.0.0.1:8080:80</td><td class="desc">Publish on localhost only</td></tr>
<tr><td class="mono">--rm</td><td class="desc">Remove container automatically on exit</td></tr>
<tr><td class="mono">-e KEY=VALUE</td><td class="desc">Set environment variable</td></tr>
<tr><td class="mono">--env-file .env</td><td class="desc">Load variables from file</td></tr>
<tr><td class="mono">-v /host:/container</td><td class="desc">Bind mount: host path → container path</td></tr>
<tr><td class="mono">--network mynet</td><td class="desc">Connect to a network</td></tr>
<tr><td class="mono">--restart unless-stopped</td><td class="desc">Restart policy (no / on-failure / always / unless-stopped)</td></tr>
<tr><td class="mono">-it</td><td class="desc">Interactive mode with pseudo-TTY</td></tr>
<tr><td class="mono">--entrypoint bash</td><td class="desc">Override image entrypoint</td></tr>
</tbody>
</table>
</div>
</div>

```bash
# nginx in background, port 8080 → 80
docker run -d -p 8080:80 --name webserver nginx

# alpine — run a command and remove the container
docker run --rm alpine echo "hello"

# interactive shell inside ubuntu
docker run -it --rm ubuntu bash
```

---

## docker ps — list containers

```bash
docker ps                              # running only
docker ps -a                           # all, including stopped
docker ps -q                           # IDs only (useful in scripts)
docker ps --filter "name=web"          # filter by name
docker ps --filter "status=exited"     # stopped containers only
docker ps --format "{{.Names}}\t{{.Status}}"  # custom format
```

---

## Stop and remove

```bash
docker stop webserver    # SIGTERM → waits for graceful shutdown (10 s default)
docker kill webserver    # SIGKILL → terminates immediately

docker start webserver   # start a stopped container
docker restart webserver # stop + start
```

`stop` gives the application time to finish cleanly: flush data, close connections. Use `kill` only in emergencies.

```bash
docker rm webserver             # remove a stopped container
docker rm -f webserver          # force-remove (even if running)
docker container prune          # remove all stopped containers
```

---

## exec — run commands inside a container

```bash
docker exec -it webserver bash          # interactive shell
docker exec webserver cat /etc/nginx/nginx.conf  # one-off command
docker exec -e DEBUG=1 webserver sh     # with extra env variable
docker exec -u root webserver id        # as a specific user
```

---

## Logs and monitoring

```bash
docker logs webserver              # all logs
docker logs -f webserver           # follow in real time
docker logs --tail 20 webserver    # last 20 lines
docker logs --since 5m webserver   # last 5 minutes
docker logs --timestamps webserver # include timestamps
```

```bash
docker inspect webserver           # full metadata as JSON
docker inspect -f '{{.NetworkSettings.IPAddress}}' webserver  # container IP

docker stats                       # live CPU/RAM for all containers
docker stats --no-stream           # one-shot snapshot
docker top webserver               # processes inside the container
docker port webserver              # port mapping
```

---

## Copying files

```bash
docker cp webserver:/etc/nginx/nginx.conf ./nginx.conf  # from container
docker cp ./index.html webserver:/usr/share/nginx/html/ # into container
```

Works for both running and stopped containers.

---

## Full workflow

```bash
# 1. Start
docker run -d -p 8080:80 --name web nginx

# 2. Check
curl http://localhost:8080

# 3. View logs
docker logs web

# 4. Shell in
docker exec -it web bash

# 5. Stop
docker stop web

# 6. Remove
docker rm web
```
