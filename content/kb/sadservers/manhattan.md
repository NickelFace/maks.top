---
title: "Manhattan: can't write into the database"
description: "PostgreSQL 14 refuses to start because backups filled the volume holding the data directory"
icon: "🐘"
group: "Cases"
tags: ["Linux", "PostgreSQL", "systemd", "Debian", "disk", "Troubleshooting", "SadServers"]
date: 2026-08-31
page_lang: "en"
difficulty: "Medium"
time_limit: "20 min"
solved_in: "12 min"
---

<div class="intro-card">
<strong>Scenario:</strong> a Debian-family box running PostgreSQL 14. Insert one row into an
existing table. That is the whole test, and it takes 20 minutes because the database is not
running and the reason is two layers deep.
</div>

| | |
|---|---|
| Scenario | Manhattan |
| Level | Medium |
| Time limit | 20 min |
| Solved in | 12 min |
| Goal | one successful `INSERT` |

![Manhattan scenario walkthrough at a glance](/img/sadservers/manhattan.png)

## Step 1. Ask systemd, get a green light

The obvious first move, and the one that cost me three minutes.

```bash
systemctl status postgresql
```

```
● postgresql.service - PostgreSQL RDBMS
   Active: active (exited) since Sun 12:44:10 UTC
  Process: 660 ExecStart=/bin/true (code=exited, status=0/SUCCESS)
```

Green dot, exit code 0, empty journal. I read that as "the database is up" and went looking for
a problem in my SQL. There was no problem in my SQL.

Look at `ExecStart` again. It is `/bin/true`.

## Step 2. Find the unit that actually runs Postgres

On Debian and Ubuntu, `postgresql.service` is a wrapper. It runs `/bin/true`, exits, and reports
success. It never touches a database. The real work happens in a per-cluster template unit:

```
postgresql.service           wrapper, /bin/true
└── postgresql@14-main.service      the real one
    └── pg_ctlcluster 14-main start
        └── postgres -D /opt/pgdata/main
```

So the command worth running is:

```bash
systemctl status postgresql@14-main
systemctl list-units 'postgresql*'
```

That one was not running, and its journal had something to say. Status and logs are only useful
on the `@14-main` instance.

## Step 3. Find out where the data actually lives

Before checking disk space, check which disk to look at. Debian puts the config in
`/etc/postgresql/<version>/<cluster>/`, and the data directory is often moved off the root
filesystem:

```bash
grep ^data_directory /etc/postgresql/14/main/postgresql.conf
```

```
data_directory = '/opt/pgdata/main'
```

Not `/var/lib/postgresql`. Anyone who checked `df -h /` here would have seen plenty of free
space and moved on.

## Step 4. Check the right filesystem

```bash
df -h /opt/pgdata
```

```
/dev/nvme0n1   8.0G  8.0G   28K  100%
```

28 kilobytes free on the volume holding the data directory. Postgres will not start with that,
and it says so in the `@14-main` journal rather than in the wrapper's.

## Step 5. Find what ate eight gigabytes

Walk the tree one level at a time. `-x` keeps `du` on a single filesystem so a mount somewhere
below does not skew the numbers:

```bash
du -xh /opt/pgdata --max-depth=1 | sort -h
```

```
50M   /opt/pgdata/main      the actual database
8.0G  /opt/pgdata
```

The database is 50 megabytes. Everything else is sitting next to it:

```bash
ls -lh /opt/pgdata/
```

```
-rw-r--r--  root      7.0G  May 21  2022  file1.bk
-rw-r--r--  root      923M  May 21  2022  file2.bk
-rw-r--r--  root      488K  May 21  2022  file3.bk
drwx------  postgres  4.0K  May 21  2022  main
```

Backups from May 2022, owned by root, parked on the same volume as live data. Classic.

## Step 6. Free space, start the cluster, insert the row

Deleting the largest file is enough. There is no need to clear all three:

```bash
rm /opt/pgdata/file1.bk
df -h /opt/pgdata
```

```
1014M used, 7.1G free, 13%
```

Now start the unit that matters:

```bash
systemctl start postgresql@14-main
systemctl status postgresql@14-main
```

```
Active: active (running)   Main PID: 889 (postgres)
```

And the actual test:

```bash
sudo -u postgres psql -d dt -c "insert into persons(name) values ('jane smith');"
```

```
INSERT 0 1
```

Eight minutes left on the clock.

## What I took from it

`Active` in systemd means the unit did what it was told. On Debian and Ubuntu, what
`postgresql.service` was told to do is run `/bin/true`. A green dot there is not evidence that
a database exists, let alone that it is accepting connections.

Two habits came out of this one. Check `systemctl list-units 'postgresql*'` instead of the bare
service name. And read `data_directory` out of the config before trusting any `df` output,
because the interesting filesystem is rarely the one you checked first.

<div class="ref-panel">

**Commands worth keeping**

```bash
systemctl list-units 'postgresql*'          # find the real cluster unit
journalctl -u postgresql@14-main -n 50      # logs that are not empty
pg_lsclusters                               # Debian cluster overview
grep ^data_directory /etc/postgresql/14/main/postgresql.conf
du -xh /some/path --max-depth=1 | sort -h   # one level at a time, one filesystem
```

</div>
