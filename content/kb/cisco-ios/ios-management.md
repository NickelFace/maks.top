---
title: "Cisco IOS Management"
description: "IOS upgrade, password recovery, ROMMON recovery, err-disabled ports"
icon: "⚙️"
group: "Networking"
tags: ["Cisco", "IOS", "ROMMON", "password-recovery", "upgrade", "troubleshooting"]
date: 2026-04-22
---

<div class="intro-card">
Cisco IOS management tasks: <strong>IOS firmware upgrade</strong>, <strong>password recovery</strong> on routers and Catalyst switches, <strong>ROMMON-based IOS restore</strong>, and recovering ports from <strong>err-disabled</strong> state.
</div>

## IOS Upgrade

<div class="ref-panel">
<div class="ref-panel-head">Step-by-Step IOS Upgrade</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">show flash:</td><td class="desc">1. Check available flash space</td></tr>
<tr><td class="mono">copy flash:old.bin ftp://user:pass@172.10.1.2/old.bin</td><td class="desc">2. Back up current IOS to FTP server</td></tr>
<tr><td class="mono">copy flash: ftp:</td><td class="desc">Interactive backup wizard (if direct copy fails)</td></tr>
<tr><td class="mono">delete c2801-ipbasek9-mz.124-24.T.bin</td><td class="desc">3. Delete old IOS if flash is full</td></tr>
<tr><td class="mono">copy ftp://user:pass@172.10.1.2/new.bin flash:new.bin</td><td class="desc">4. Download new IOS from FTP</td></tr>
<tr><td class="mono">copy tftp: flash:</td><td class="desc">Or download via TFTP (interactive)</td></tr>
<tr><td class="mono">verify /md5 flash:new.bin</td><td class="desc">5. Verify MD5 hash — compare with Cisco download page</td></tr>
<tr><td class="mono">boot system flash:new.bin</td><td class="desc">6. Tell the router which image to boot</td></tr>
<tr><td class="mono">reload</td><td class="desc">7. Reboot and verify</td></tr>
</tbody>
</table>
</div>
</div>

---

## Password Recovery — Router

All steps require **console access** only — SSH/Telnet cannot be used.

<div class="ref-panel">
<div class="ref-panel-head">Router Password Recovery Procedure</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">Ctrl+Break (Pause)</td><td class="desc">1. Interrupt boot sequence to enter ROMMON</td></tr>
<tr><td class="mono">rommon> confreg 0x2142</td><td class="desc">2. Change config register — boot without loading startup-config</td></tr>
<tr><td class="mono">rommon> boot</td><td class="desc">2. Reboot into IOS with empty config (no password prompt)</td></tr>
<tr><td class="mono">Router# copy startup-config running-config</td><td class="desc">3. Load old config into running-config (startup-config preserved)</td></tr>
<tr><td class="mono">Router(config)# enable secret NEW_PASSWORD</td><td class="desc">4. Set new enable password</td></tr>
<tr><td class="mono">Router(config)# username admin secret NEW_PASS</td><td class="desc">4. Reset user passwords as needed</td></tr>
<tr><td class="mono">rommon> confreg 0x2102</td><td class="desc">5. Reboot into ROMMON, restore config register to 0x2102</td></tr>
<tr><td class="mono">rommon> boot</td><td class="desc">5. Boot normally with restored config</td></tr>
</tbody>
</table>
</div>
</div>

> **After recovery:** all interfaces will be `administratively down` — bring them up manually with `no shutdown`.

> If `no service password-recovery` is set, ROMMON protection is enabled. The only option then is a **factory reset** (wipes startup-config).

**Break sequence by terminal program:**

| Program | Key sequence |
|---|---|
| Hyperterminal / SecureCRT | Ctrl+Break |
| TeraTerm | Alt+B |
| Minicom (Linux) | Ctrl+A, then F |
| PuTTY | none (use right-click → Special Command → Break) |

---

## Password Recovery — Cisco Catalyst Switch

<div class="ref-panel">
<div class="ref-panel-head">Catalyst Switch Password Recovery</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">Power cycle + hold Mode button 15 s</td><td class="desc">1. Interrupt boot, enter bootstrap loader</td></tr>
<tr><td class="mono">switch: flash_init</td><td class="desc">2. Initialize flash filesystem</td></tr>
<tr><td class="mono">switch: load_helper</td><td class="desc">2. Load helper libraries</td></tr>
<tr><td class="mono">switch: dir flash:</td><td class="desc">3. List flash contents (find config.text)</td></tr>
<tr><td class="mono">switch: rename flash:config.text flash:config.text.old</td><td class="desc">4. Rename config so switch boots without it</td></tr>
<tr><td class="mono">switch: boot</td><td class="desc">5. Boot with no config (no password prompt)</td></tr>
<tr><td class="mono">Switch# rename flash:/config.text.old flash:/config.text</td><td class="desc">6. Rename config file back</td></tr>
<tr><td class="mono">Switch# copy flash:config.text running-config</td><td class="desc">6. Load old config into running-config</td></tr>
<tr><td class="mono">Switch(config)# enable secret NEW_PASSWORD</td><td class="desc">7. Set new password</td></tr>
<tr><td class="mono">Switch# copy run start</td><td class="desc">8. Save configuration</td></tr>
</tbody>
</table>
</div>
</div>

---

## ROMMON Recovery — Restore IOS via TFTP

Used when flash is corrupted or IOS image is missing. **TFTP only — FTP is not supported in ROMMON.**

<div class="ref-panel">
<div class="ref-panel-head">ROMMON TFTP Recovery — Router / Switch</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">rommon> IP_ADDRESS=192.168.0.1</td><td class="desc">Set device IP address</td></tr>
<tr><td class="mono">rommon> IP_SUBNET_MASK=255.255.255.0</td><td class="desc">Set subnet mask</td></tr>
<tr><td class="mono">rommon> DEFAULT_GATEWAY=192.168.0.2</td><td class="desc">Set gateway (even if server is in same subnet)</td></tr>
<tr><td class="mono">rommon> TFTP_SERVER=192.168.0.2</td><td class="desc">TFTP server IP</td></tr>
<tr><td class="mono">rommon> TFTP_FILE=c2600-ipbasek9-mz.124-13b.bin</td><td class="desc">IOS image filename on TFTP server</td></tr>
<tr><td class="mono">rommon> set</td><td class="desc">Apply the configuration</td></tr>
<tr><td class="mono">rommon> tftpdnld</td><td class="desc">Download IOS from TFTP</td></tr>
<tr><td class="mono">rommon> boot</td><td class="desc">Boot the new IOS</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">ROMMON TFTP Recovery — Cisco ASA</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">rommon> ADDRESS=192.168.0.1</td><td class="desc">Device IP</td></tr>
<tr><td class="mono">rommon> SERVER=192.168.0.2</td><td class="desc">TFTP server IP</td></tr>
<tr><td class="mono">rommon> GATEWAY=192.168.0.2</td><td class="desc">Gateway IP</td></tr>
<tr><td class="mono">rommon> IMAGE=f1/asa800-232-k8.bin</td><td class="desc">ASA firmware image filename</td></tr>
<tr><td class="mono">rommon> PORT=Ethernet0/0</td><td class="desc">Interface to use for TFTP</td></tr>
<tr><td class="mono">rommon> set</td><td class="desc">Apply settings</td></tr>
<tr><td class="mono">rommon> ping server</td><td class="desc">Verify connectivity to TFTP server</td></tr>
<tr><td class="mono">rommon> tftp</td><td class="desc">Download firmware</td></tr>
<tr><td class="mono">rommon> boot</td><td class="desc">Boot new firmware</td></tr>
</tbody>
</table>
</div>
</div>

---

## Err-Disabled Port Recovery

<div class="ref-panel">
<div class="ref-panel-head">Err-Disabled Recovery</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">errdisable recovery cause all</td><td class="desc">Enable auto-recovery for all err-disable causes</td></tr>
<tr><td class="mono">errdisable recovery interval 300</td><td class="desc">Auto-recovery timer (default: 300 s; range: 30–86400 s)</td></tr>
<tr><td class="mono">show interface fa0/1 status</td><td class="desc">Check if port is in err-disabled state</td></tr>
<tr><td class="mono">show interfaces status</td><td class="desc">Status of all ports including err-disabled</td></tr>
<tr><td class="mono">show errdisable recovery</td><td class="desc">Recovery timers per cause</td></tr>
<tr><td class="mono">show errdisable detect</td><td class="desc">Causes that can trigger err-disabled</td></tr>
</tbody>
</table>
</div>
</div>

> **Manual recovery:** fix the root cause → `shutdown` → `no shutdown` on the affected interface.

---

*Cisco IOS Command Reference | IOS Management*
