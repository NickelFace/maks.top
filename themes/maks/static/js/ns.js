/**
 * ns.js — Linux Namespaces page shared logic
 * Patterns: copy buttons, tabs, card toggle, TOC, read progress
 */

// ─── DATA ────────────────────────────────────────────────────────────────────

const NS_DATA = [
  {name:"UTS",flag:"CLONE_NEWUTS",icon:"🖥️",color:"#00d4ff",
   summary:"Hostname & domain isolation",
   desc:"Isolates hostname and NIS domain name. Allows each container to have its own hostname without affecting the host.",
   host:[{pid:1,name:"init",label:"hostname: server01"}],
   ns:[{pid:12345,name:"bash",label:"hostname: container1"}],
   tabs:[
     {label:"unshare",code:`sudo unshare --uts bash\nhostname container1\nhostname\n<span class="out">container1</span>\n\n<span class="cm"># в другом терминале:</span>\nhostname\n<span class="out">server01  ← не изменился</span>`},
     {label:"check",code:`lsns -t uts\nreadlink /proc/$$/ns/uts`}
   ]},
  {name:"PID",flag:"CLONE_NEWPID",icon:"⚙️",color:"#7c3aed",
   summary:"Process ID isolation — PID 1 inside container",
   desc:"First process in a new PID namespace becomes PID 1. It cannot see host PIDs. Docker's init process is always PID 1 inside the container, even if it's PID 84521 on the host.",
   host:[{pid:84521,name:"nginx",label:"PID 84521 на хосте"},{pid:84522,name:"worker",label:"PID 84522"}],
   ns:[{pid:1,name:"nginx",label:"PID 1 в ns"},{pid:2,name:"worker",label:"PID 2 в ns"}],
   tabs:[
     {label:"unshare",code:`sudo unshare --pid --fork --mount-proc bash\nps aux\n<span class="out">PID TTY ... COMMAND\n  1 pts bash\n  7 pts ps aux</span>\n\n<span class="cm"># PID 1 = наш bash!</span>`},
     {label:"check",code:`lsns -t pid\n\n<span class="cm"># Реальный PID контейнера на хосте:</span>\ndocker inspect --format '{{.State.Pid}}' myc`}
   ]},
  {name:"NET",flag:"CLONE_NEWNET",icon:"🌐",color:"#10b981",
   summary:"Network stack isolation — own interfaces",
   desc:"Each network namespace has its own network interfaces, IP addresses, routing tables, netfilter rules, and sockets. Docker creates a veth pair — one end in container, one on host bridge.",
   host:[{pid:1,name:"eth0",label:"192.168.1.10"},{pid:2,name:"docker0",label:"172.17.0.1"}],
   ns:[{pid:1,name:"eth0",label:"172.17.0.2"},{pid:2,name:"lo",label:"127.0.0.1"}],
   tabs:[
     {label:"unshare",code:`sudo unshare --net bash\nip link\n<span class="out">1: lo: &lt;LOOPBACK&gt;</span>\n<span class="cm"># Только loopback! eth0 не виден.</span>\n\nip route\n<span class="out">(empty)</span>`},
     {label:"veth",code:`<span class="cm"># Как Docker создаёт сеть:</span>\nip link add veth0 type veth peer name veth1\nip link set veth1 netns &lt;container_pid&gt;\nip addr add 172.17.0.1/16 dev veth0\nip link set veth0 up`}
   ]},
  {name:"MNT",flag:"CLONE_NEWNS",icon:"📁",color:"#f59e0b",
   summary:"Filesystem mount isolation",
   desc:"The oldest namespace (Linux 2.4.19). Isolates the mount table. Each namespace has its own view of the filesystem tree. Basis for container rootfs isolation with pivot_root/chroot.",
   host:[{pid:1,name:"/",label:"host rootfs"},{pid:2,name:"/proc",label:"real /proc"}],
   ns:[{pid:1,name:"/",label:"container rootfs"},{pid:2,name:"/proc",label:"ns /proc"}],
   tabs:[
     {label:"unshare",code:`sudo unshare --mount bash\nmount --bind /tmp/newroot /mnt\nls /mnt\n<span class="cm"># Хост это примонтирование не видит</span>`},
     {label:"nsenter",code:`CPID=$(docker inspect \\\n  --format '{{.State.Pid}}' myc)\nsudo nsenter \\\n  --target $CPID --mount bash\nls /   <span class="out"># → rootfs контейнера</span>`}
   ]},
  {name:"IPC",flag:"CLONE_NEWIPC",icon:"📨",color:"#f472b6",
   summary:"IPC objects isolation — queues, semaphores, shm",
   desc:"Isolates System V IPC (message queues, semaphores, shared memory) and POSIX message queues. Without IPC namespace processes from different containers could share memory.",
   host:[{pid:1,name:"shmid=3",label:"1024 bytes shm"},{pid:2,name:"semid=1",label:"sem array"}],
   ns:[{pid:1,name:"(empty)",label:"no shm visible"},{pid:2,name:"(empty)",label:"no sem visible"}],
   tabs:[
     {label:"example",code:`ipcmk -M 1024\n<span class="out">Shared memory id: 3</span>\n\nsudo unshare --ipc bash\nipcs -m\n<span class="out"># (empty) — изолировано</span>`},
     {label:"check",code:`lsns -t ipc\nipcs -a`}
   ]},
  {name:"User",flag:"CLONE_NEWUSER",icon:"👤",color:"#818cf8",
   summary:"UID/GID isolation — rootless containers",
   desc:"The most powerful namespace. Unprivileged user gets UID 0 (root) inside while remaining regular user outside. Rootless Docker, Podman — everything without sudo is built on this.",
   host:[{pid:1000,name:"maks",label:"UID 1000 на хосте"},{pid:1001,name:"regular",label:"no privileges"}],
   ns:[{pid:0,name:"root",label:"UID 0 внутри"},{pid:1,name:"daemon",label:"mapped: 1000"}],
   tabs:[
     {label:"example",code:`<span class="cm"># Без sudo!</span>\nunshare --user --map-root-user bash\n\nid\n<span class="out">uid=0(root) gid=0(root)</span>\n\ncat /proc/$$/uid_map\n<span class="out">0  1000  1</span>`},
     {label:"check",code:`lsns -t user\nsysctl kernel.unprivileged_userns_clone\n<span class="out"># 1 = enabled (Ubuntu default)</span>`}
   ]},
  {name:"Cgroup",flag:"CLONE_NEWCGROUP",icon:"📊",color:"#34d399",
   summary:"Cgroup hierarchy isolation (Linux 4.6+)",
   desc:"Process inside container sees / as cgroup root instead of /docker/abc123/... path. Prevents container escape via cgroup path enumeration.",
   host:[{pid:1,name:"/docker/abc",label:"full cgroup path"}],
   ns:[{pid:1,name:"/",label:"видит только /"}],
   tabs:[
     {label:"example",code:`cat /proc/$$/cgroup\n<span class="out">0::/user.slice/user-1000.slice/...</span>\n\nsudo unshare --cgroup bash\ncat /proc/$$/cgroup\n<span class="out">0::/   ← видит только корень</span>`},
     {label:"check",code:`lsns -t cgroup\nreadlink /proc/&lt;PID&gt;/ns/cgroup`}
   ]},
  {name:"Time",flag:"CLONE_NEWTIME",icon:"⏱️",color:"#fb923c",
   summary:"Clock isolation — MONOTONIC & BOOTTIME (5.6+)",
   desc:"Newest namespace (Linux 5.6, 2020). Useful for live container migration between hosts — monotonic clock offset survives the transfer. CLOCK_REALTIME cannot be isolated.",
   host:[{pid:1,name:"MONOTONIC",label:"T+86400s (uptime)"},{pid:2,name:"BOOTTIME",label:"T+86400s"}],
   ns:[{pid:1,name:"MONOTONIC",label:"T+0s (reset)"},{pid:2,name:"BOOTTIME",label:"T+0s (reset)"}],
   tabs:[
     {label:"check",code:`uname -r   <span class="out"># need 5.6+</span>\nreadlink /proc/$$/ns/time\nlsns -t time\n\ncat /proc/self/timens_offsets\n<span class="out">monotonic  0  0\nboottime   0  0</span>`}
   ]}
];

const CHEAT_DATA = [
  {cmd:"lsns",                            desc:"List all namespaces on system",          type:"proc"},
  {cmd:"lsns -t uts",                     desc:"List only UTS namespaces",               type:"proc"},
  {cmd:"unshare --uts bash",              desc:"New UTS namespace",                      type:"kernel"},
  {cmd:"unshare --pid --fork --mount-proc",desc:"New PID namespace with proc",           type:"proc"},
  {cmd:"unshare --net bash",              desc:"New network namespace",                  type:"net"},
  {cmd:"unshare --user --map-root-user",  desc:"Rootless user namespace",                type:"proc"},
  {cmd:"nsenter --target PID --net",      desc:"Enter NET ns of process",                type:"net"},
  {cmd:"nsenter --target PID --mount bash",desc:"Enter MNT ns of process",              type:"fs"},
  {cmd:"ip netns add myns",               desc:"Create named network namespace",         type:"net"},
  {cmd:"ip netns exec myns ip link",      desc:"Run command in net namespace",           type:"net"},
  {cmd:"readlink /proc/$$/ns/uts",        desc:"Show current UTS ns inode",              type:"kernel"},
  {cmd:"ls -la /proc/$$/ns/",             desc:"List all ns of current process",         type:"kernel"},
  {cmd:"mount --bind /proc /ns-proc",     desc:"Persist namespace via bind mount",       type:"fs"},
  {cmd:"clone(CLONE_NEWPID|..., ...)",    desc:"Syscall to create new namespace",        type:"kernel"},
];

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────
// Usage: <button class="copy-btn" onclick="NSLib.copyCode(event,this)">copy</button>

const NSLib = (() => {

  function copyCode(e, btn) {
    e.stopPropagation();
    const pre = btn.closest('.code-block, .mob-code').querySelector('pre');
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'ok!';
      btn.classList.add('ok');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('ok'); }, 1500);
    });
  }

  // ─── TABS ───────────────────────────────────────────────────────────────────
  // Usage: <button class="tab-btn" onclick="NSLib.switchTab(event,'tab-id')">label</button>

  function switchTab(e, id) {
    e.stopPropagation();
    const body = e.target.closest('.ns-body, .mob-ns-body');
    body.querySelectorAll('.tab-btn, .mob-tab-btn').forEach(b => b.classList.remove('active'));
    body.querySelectorAll('.tab-content, .mob-tab-content').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(id).classList.add('active');
  }

  // ─── CARD TOGGLE ────────────────────────────────────────────────────────────

  function toggleCard(el) { el.classList.toggle('active'); }
  function toggleMobCard(el) { el.classList.toggle('open'); }

  // ─── THEME ──────────────────────────────────────────────────────────────────

  function toggleTheme(artId, btnId) {
    const art = document.getElementById(artId);
    const btn = document.getElementById(btnId);
    const isDark = !art.classList.contains('light');
    art.classList.toggle('light', isDark);
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }

  // ─── READ PROGRESS ──────────────────────────────────────────────────────────
  // Tracks how many cards were opened. Call initProgress(total, fillId, txtId).

  function initProgress(total, fillId, txtId) {
    let opened = new Set();
    document.querySelectorAll('.ns-card[data-idx], .mob-ns-card[data-idx]').forEach(card => {
      const observer = new MutationObserver(() => {
        const isOpen = card.classList.contains('active') || card.classList.contains('open');
        const idx = card.dataset.idx;
        if (isOpen) opened.add(idx); else opened.delete(idx);
        const pct = Math.round((opened.size / total) * 100);
        const fill = document.getElementById(fillId);
        const txt  = document.getElementById(txtId);
        if (fill) fill.style.width = pct + '%';
        if (txt)  txt.innerHTML = `<span>${opened.size} из ${total} типов</span><span style="color:var(--accent)">${pct}%</span>`;
      });
      observer.observe(card, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ─── TOC HIGHLIGHT ──────────────────────────────────────────────────────────
  // Highlights TOC item when card scrolls into view.

  function initTocHighlight(tocSelector) {
    const items = document.querySelectorAll(tocSelector);
    const cards = document.querySelectorAll('.ns-card[data-idx]');
    if (!cards.length || !items.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const idx = en.target.dataset.idx;
          items.forEach(it => it.classList.toggle('cur', it.dataset.idx === idx));
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(c => io.observe(c));
  }

  // ─── BUILD HELPERS ──────────────────────────────────────────────────────────

  function buildVisRows(arr, color) {
    return arr.map(p => `
      <div style="margin-bottom:6px">
        <span class="proc-badge" style="color:${color};border-color:${color};background:color-mix(in srgb,${color} 10%,transparent)">
          ${typeof p.pid === 'string' ? p.pid : 'PID ' + p.pid}
        </span>
        <span style="font-size:9.5px;color:var(--text2);margin-left:5px">${p.name}</span>
        <div style="font-size:8.5px;color:var(--text3);margin-top:1px;padding-left:4px">${p.label}</div>
      </div>`).join('');
  }

  function buildDesktopCard(n, i) {
    const tabs = n.tabs.map((t, ti) =>
      `<button class="tab-btn${ti===0?' active':''}" onclick="NSLib.switchTab(event,'dt${i}${ti}')" style="--cc:${n.color}">${t.label}</button>`
    ).join('');
    const contents = n.tabs.map((t, ti) =>
      `<div id="dt${i}${ti}" class="tab-content${ti===0?' active':''}">
         <div class="code-block">
           <div class="code-label"><span>bash</span><button class="copy-btn" onclick="NSLib.copyCode(event,this)">copy</button></div>
           <pre>${t.code}</pre>
         </div>
       </div>`
    ).join('');

    return `
    <div class="ns-card" id="nc${i}" data-idx="${i}" style="--cc:${n.color};animation:fadeUp .3s ease ${i*.04}s both" onclick="NSLib.toggleCard(this)">
      <div class="ns-header">
        <div class="ns-icon">${n.icon}</div>
        <div><div class="ns-name">${n.name} Namespace</div><div class="ns-flag-lbl">${n.flag}</div></div>
        <div class="ns-summary">${n.summary}</div>
        <div class="ns-arr">›</div>
      </div>
      <div class="ns-body">
        <div class="ns-desc">${n.desc}</div>
        <div class="proc-vis" style="--cc:${n.color}">
          <div class="proc-vis-title">Изоляция: до и после</div>
          <div class="proc-boxes">
            <div class="proc-host"><div class="proc-label">Хост</div>${buildVisRows(n.host,n.color)}</div>
            <div class="proc-sep"></div>
            <div class="proc-ns-box"><div class="proc-label">Внутри namespace</div>${buildVisRows(n.ns,n.color)}</div>
          </div>
        </div>
        <div class="tabs">${tabs}</div>
        ${contents}
      </div>
    </div>`;
  }

  function buildMobileCard(n, i) {
    const tabs = n.tabs.map((t, ti) =>
      `<button class="mob-tab-btn${ti===0?' active':''}" onclick="NSLib.switchTab(event,'mt${i}${ti}')" style="--cc:${n.color}">${t.label}</button>`
    ).join('');
    const contents = n.tabs.map((t, ti) =>
      `<div id="mt${i}${ti}" class="mob-tab-content${ti===0?' active':''}">
         <div class="mob-code">
           <div class="mob-code-lbl"><span>bash</span><button class="mob-copy copy-btn" onclick="NSLib.copyCode(event,this)">copy</button></div>
           <pre>${t.code}</pre>
         </div>
       </div>`
    ).join('');

    return `
    <div class="mob-ns-card" id="mc${i}" data-idx="${i}" style="--cc:${n.color}" onclick="NSLib.toggleMobCard(this)">
      <div class="mob-ns-hdr">
        <div class="mob-ns-ic">${n.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="mob-ns-nm">${n.name} Namespace</div>
          <div class="mob-ns-fl">${n.flag}</div>
        </div>
        <div class="mob-ns-arr">›</div>
      </div>
      <div class="mob-ns-body">
        <div class="mob-ns-desc">${n.desc}</div>
        <div class="mob-vis" style="--cc:${n.color}">
          <div class="mob-vis-lbl">Изоляция</div>
          <div class="mob-vis-row">
            <div>
              <div class="mob-vis-col-lbl">Хост</div>
              <div class="mob-vis-box">
                <div class="mob-vis-pid">HOST</div>
                <div class="mob-vis-name">${n.host[0].label}</div>
              </div>
            </div>
            <div class="mob-vis-sep">⟷</div>
            <div>
              <div class="mob-vis-col-lbl">Namespace</div>
              <div class="mob-vis-box">
                <div class="mob-vis-pid" style="color:${n.color}">NS</div>
                <div class="mob-vis-name">${n.ns[0].label}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="mob-tabs">${tabs}</div>
        ${contents}
      </div>
    </div>`;
  }

  function buildCheatTable(filter, tbodyId) {
    const TAG = {kernel:'sk',proc:'sp',net:'sn',fs:'sf'};
    const LBL = {kernel:'kernel',proc:'process',net:'network',fs:'filesystem'};
    const rows = CHEAT_DATA.filter(c => filter === 'all' || c.type === filter);
    document.getElementById(tbodyId).innerHTML = rows.map(c => `
      <tr>
        <td class="mono" style="white-space:nowrap">${c.cmd}</td>
        <td class="desc">${c.desc}</td>
        <td><span class="stag ${TAG[c.type]}">${LBL[c.type]}</span></td>
      </tr>`).join('');
  }

  return { copyCode, switchTab, toggleCard, toggleMobCard, toggleTheme,
           initProgress, initTocHighlight,
           buildDesktopCard, buildMobileCard, buildCheatTable,
           NS_DATA, CHEAT_DATA };
})();
