---
title: "Cisco VLANs, STP & EtherChannel"
description: "VLAN, VTP, SVI, STP/RSTP, EtherChannel, FlexLinks — Layer 2 switching commands"
icon: "🔌"
group: "Networking"
tags: ["Cisco", "VLAN", "VTP", "STP", "RSTP", "EtherChannel", "LACP", "IOS", "switching"]
date: 2026-04-22
---

<div class="intro-card">
Cisco IOS Layer 2 cheat sheet: <strong>VLANs, VTP, SVI interfaces, Spanning Tree (STP/RSTP), EtherChannel (LACP/PAgP), and FlexLinks</strong>. Configuration and diagnostics commands.
</div>

## VLANs

<div class="ref-panel">
<div class="ref-panel-head">VLAN Configuration</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">vlan 2</td><td class="desc">Enter VLAN 2 configuration</td></tr>
<tr><td class="mono">name sales</td><td class="desc">Assign name to VLAN</td></tr>
<tr><td class="mono">switchport mode access</td><td class="desc">Set port to access mode (one VLAN, toward end user)</td></tr>
<tr><td class="mono">switchport access vlan 2</td><td class="desc">Assign access port to VLAN 2</td></tr>
<tr><td class="mono">switchport nonegotiate</td><td class="desc">Disable DTP auto-negotiation</td></tr>
<tr><td class="mono">switchport trunk encapsulation dot1q</td><td class="desc">Set encapsulation to 802.1Q (required if ISL is supported)</td></tr>
<tr><td class="mono">switchport mode trunk</td><td class="desc">Set port to trunk mode</td></tr>
<tr><td class="mono">switchport trunk allowed vlan 2,3,4,5,99</td><td class="desc">Allow only specific VLANs on trunk</td></tr>
<tr><td class="mono">switchport trunk native vlan 99</td><td class="desc">Change native VLAN to 99</td></tr>
<tr><td class="mono">vlan dot1q tag native</td><td class="desc">Tag native VLAN frames (security hardening)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">VLAN Diagnostics</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">show vlan</td><td class="desc">List all VLANs and their port assignments</td></tr>
<tr><td class="mono">show vlan id 2</td><td class="desc">Details for a specific VLAN</td></tr>
<tr><td class="mono">show int fasteth 0/1 switchport</td><td class="desc">VLAN info for a specific port</td></tr>
<tr><td class="mono">show int trunk</td><td class="desc">Trunk ports and allowed VLANs</td></tr>
</tbody>
</table>
</div>
</div>

---

## VTP (VLAN Trunking Protocol)

<div class="ref-panel">
<div class="ref-panel-head">VTP Configuration</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">vtp mode transparent</td><td class="desc">Disable VTP VLAN sync; store VLAN DB in config file</td></tr>
<tr><td class="mono">vtp mode server</td><td class="desc">Full VTP server mode (can create/modify/delete VLANs)</td></tr>
<tr><td class="mono">vtp mode client</td><td class="desc">Client mode — cannot modify VLANs from CLI</td></tr>
<tr><td class="mono">vtp mode off</td><td class="desc">VTP v3: completely disabled, does not forward announcements</td></tr>
<tr><td class="mono">vtp version 2</td><td class="desc">Select VTP version</td></tr>
<tr><td class="mono">vtp domain darkmaycal</td><td class="desc">Set VTP domain name</td></tr>
<tr><td class="mono">vtp password 123 [hidden|secret]</td><td class="desc">Set VTP password</td></tr>
<tr><td class="mono">vtp primary-server</td><td class="desc">Designate as primary VTP server (v3)</td></tr>
<tr><td class="mono">show vtp status</td><td class="desc">Show VTP status and revision number</td></tr>
<tr><td class="mono">show vtp password</td><td class="desc">Show VTP domain password</td></tr>
</tbody>
</table>
</div>
</div>

---

## SVI — Virtual Layer 3 Interfaces

Configuration is done on the **switch**. Enables inter-VLAN routing on L3 switches.

<div class="ref-panel">
<div class="ref-panel-head">SVI Setup</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">ip routing</td><td class="desc">Enable routing engine on the switch</td></tr>
<tr><td class="mono">int vlan 2</td><td class="desc">Create SVI for VLAN 2</td></tr>
<tr><td class="mono">ip address 192.168.2.50 255.255.255.0</td><td class="desc">Assign IP to SVI</td></tr>
<tr><td class="mono">no shutdown</td><td class="desc">Bring up the SVI</td></tr>
</tbody>
</table>
</div>
</div>

---

## STP / RSTP — Spanning Tree Protocol

<div class="ref-panel">
<div class="ref-panel-head">STP Configuration</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">spanning-tree mode rapid-pvst</td><td class="desc">Switch to Rapid PVST+ (recommended)</td></tr>
<tr><td class="mono">spanning-tree vlan 1 root primary</td><td class="desc">Become root bridge for VLAN 1</td></tr>
<tr><td class="mono">spanning-tree vlan 1 root secondary</td><td class="desc">Become backup root bridge</td></tr>
<tr><td class="mono">spanning-tree vlan 1 priority 110</td><td class="desc">Set bridge priority for VLAN 1 (lower = more preferred root)</td></tr>
<tr><td class="mono">spanning-tree vlan 1 forward-time 12</td><td class="desc">Set forwarding delay (convergence time)</td></tr>
<tr><td class="mono">spanning-tree pathcost method long</td><td class="desc">Use 32-bit path cost (802.1t): cost = 20 000 000 000 / speed Kbps</td></tr>
<tr><td class="mono">spanning-tree vlan 1 cost 5</td><td class="desc">Set interface cost for STP</td></tr>
<tr><td class="mono">spanning-tree vlan 1 port-priority 50</td><td class="desc">Set port priority (affects designated port election)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">STP Security Features</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">spanning-tree portfast</td><td class="desc">Skip listening/learning states (for end-host ports only)</td></tr>
<tr><td class="mono">spanning-tree portfast default</td><td class="desc">Enable PortFast on all access ports globally</td></tr>
<tr><td class="mono">spanning-tree bpduguard enable</td><td class="desc">Shut port if a BPDU is received (protects against rogue switches)</td></tr>
<tr><td class="mono">spanning-tree portfast bpdufilter default</td><td class="desc">Enable BPDU filter on all PortFast ports globally</td></tr>
<tr><td class="mono">spanning-tree bpdufilter enable</td><td class="desc">Stop sending and receiving BPDUs on interface</td></tr>
<tr><td class="mono">spanning-tree guard loop</td><td class="desc">Enable Loop Guard on interface (or use spanning-tree loopguard default)</td></tr>
<tr><td class="mono">spanning-tree guard root</td><td class="desc">Protect against unauthorized root bridge on interface</td></tr>
<tr><td class="mono">spanning-tree link-type point-to-point</td><td class="desc">Set link type for Rapid PVST+ fast convergence</td></tr>
<tr><td class="mono">spanning-tree backbonefast</td><td class="desc">Enable BackboneFast (PVST+ only)</td></tr>
<tr><td class="mono">spanning-tree uplinkfast</td><td class="desc">Enable UplinkFast for fast uplink failover (PVST+ only)</td></tr>
<tr><td class="mono">udld enable</td><td class="desc">Enable UDLD globally (fiber interfaces only)</td></tr>
<tr><td class="mono">udld port enable</td><td class="desc">Force-enable UDLD on copper interface</td></tr>
<tr><td class="mono">udld reset</td><td class="desc">Restore interfaces blocked by UDLD</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">STP Diagnostics</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">show spanning-tree summary</td><td class="desc">All enabled STP features (bpduguard, loopguard, etc.)</td></tr>
<tr><td class="mono">show spanning-tree [vlan 1]</td><td class="desc">STP info per VLAN (root, port roles, costs)</td></tr>
<tr><td class="mono">show spanning-tree int fa0/1 portfast</td><td class="desc">Check if PortFast is active on a port</td></tr>
<tr><td class="mono">show udld</td><td class="desc">UDLD status</td></tr>
<tr><td class="mono">debug spanning-tree events</td><td class="desc">Real-time STP event output</td></tr>
</tbody>
</table>
</div>
</div>

---

## EtherChannel

<div class="ref-panel">
<div class="ref-panel-head">L2 EtherChannel (LACP)</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">int range fa0/1-2</td><td class="desc">Enter range configuration for fa0/1–fa0/2</td></tr>
<tr><td class="mono">switchport mode trunk</td><td class="desc">Set ports to trunk mode</td></tr>
<tr><td class="mono">switchport nonegotiate</td><td class="desc">Disable DTP</td></tr>
<tr><td class="mono">switchport trunk allowed vlan 1,2,...</td><td class="desc">Specify allowed VLANs on the trunk</td></tr>
<tr><td class="mono">channel-group 1 mode active</td><td class="desc">Add ports to EtherChannel group 1 with LACP (active)</td></tr>
<tr><td class="mono">channel-group 1 mode auto</td><td class="desc">PAgP passive mode</td></tr>
<tr><td class="mono">channel-group 1 mode on</td><td class="desc">Static EtherChannel (no negotiation protocol)</td></tr>
<tr><td class="mono">port-channel load-balance dst-ip</td><td class="desc">Load balance by destination IP</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">L3 EtherChannel on Switch</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">int port-channel 1</td><td class="desc">Create port-channel interface manually</td></tr>
<tr><td class="mono">no switchport</td><td class="desc">Put port-channel in routed mode</td></tr>
<tr><td class="mono">ip address 10.0.1.1 255.255.255.0</td><td class="desc">Assign IP to port-channel</td></tr>
<tr><td class="mono">int range fa0/1, fa0/2</td><td class="desc">Select physical ports</td></tr>
<tr><td class="mono">no switchport</td><td class="desc">Set physical ports to routed mode</td></tr>
<tr><td class="mono">channel-group 1 mode active</td><td class="desc">Add physical ports to EtherChannel (LACP)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">EtherChannel Diagnostics</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">show etherchannel summary</td><td class="desc">EtherChannel status and port flags</td></tr>
<tr><td class="mono">show etherchannel port-channel</td><td class="desc">Detailed EtherChannel info</td></tr>
<tr><td class="mono">show etherchannel load-balance</td><td class="desc">Current load-balancing method</td></tr>
<tr><td class="mono">show int port-channel 1</td><td class="desc">Port-channel interface status (not available in PacketTracer)</td></tr>
</tbody>
</table>
</div>
</div>

> **L3 EtherChannel on routers:** static aggregation only (no LACP/PAgP); max 2 port-channels; max 4 ports per bundle; source+destination IP load balancing (not changeable).

---

## FlexLinks

Simple active/standby failover — alternative to STP for access layer.

<div class="ref-panel">
<div class="ref-panel-head">FlexLinks Configuration</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">int fa0/1</td><td class="desc">Enter primary interface</td></tr>
<tr><td class="mono">switchport backup interface fa0/2</td><td class="desc">Set fa0/2 as standby for fa0/1 (activates when fa0/1 goes down)</td></tr>
<tr><td class="mono">show interface switchport backup</td><td class="desc">Show FlexLinks pairs and their status</td></tr>
</tbody>
</table>
</div>
</div>

---

*Cisco IOS Command Reference | VLANs, STP, EtherChannel*
