/* IP Calc core: IPv4 / VLSM / IPv6.
   Ported from github.com/NickelFace/ipcalc-android (Kotlin core, same behaviour). */
(function (root) {
  'use strict';

  var ALL_ONES = 0xFFFFFFFF;

  /* ---------------------------------------------------------------- IPv4 */

  function parse4(text) {
    var parts = String(text).trim().split('.');
    if (parts.length !== 4) return null;
    var acc = 0;
    for (var i = 0; i < 4; i++) {
      var p = parts[i];
      if (!p.length || p.length > 3 || !/^[0-9]+$/.test(p)) return null;
      var o = parseInt(p, 10);
      if (o > 255) return null;
      acc = acc * 256 + o;
    }
    return acc;
  }

  function format4(value) {
    var v = value >>> 0;
    return ((v >>> 24) & 255) + '.' + ((v >>> 16) & 255) + '.' + ((v >>> 8) & 255) + '.' + (v & 255);
  }

  function mask4(prefix) {
    if (prefix <= 0) return 0;
    return (ALL_ONES << (32 - prefix)) >>> 0;
  }

  function wildcard4(prefix) {
    return (mask4(prefix) ^ ALL_ONES) >>> 0;
  }

  function prefixOfMask(mask) {
    var m = mask >>> 0;
    for (var p = 0; p <= 32; p++) if (mask4(p) === m) return p;
    return null;
  }

  function binaryChars4(value, prefix) {
    var v = value >>> 0;
    var out = [];
    for (var i = 0; i < 32; i++) {
      var bit = (v >>> (31 - i)) & 1;
      out.push({ char: bit ? '1' : '0', isHostBit: i >= prefix, isSeparator: false });
      var emitted = i + 1;
      if (emitted < 32 && emitted % 8 === 0) out.push({ char: '.', isHostBit: false, isSeparator: true });
      if (emitted >= 1 && emitted <= 31 && emitted === prefix) out.push({ char: ' ', isHostBit: false, isSeparator: true });
    }
    return out;
  }

  function binaryString4(value, prefix) {
    return binaryChars4(value, prefix).map(function (c) { return c.char; }).join('');
  }

  var CLASSES = {
    A: { letter: 'A', defaultPrefix: 8 },
    B: { letter: 'B', defaultPrefix: 16 },
    C: { letter: 'C', defaultPrefix: 24 },
    D: { letter: 'D', defaultPrefix: null },
    E: { letter: 'E', defaultPrefix: null }
  };

  function classOf(address) {
    var first = ((address >>> 0) >>> 24) & 255;
    if (first <= 127) return CLASSES.A;
    if (first <= 191) return CLASSES.B;
    if (first <= 223) return CLASSES.C;
    if (first <= 239) return CLASSES.D;
    return CLASSES.E;
  }

  var SCOPES = [
    ['0.0.0.0', 8, 'This Network'],
    ['10.0.0.0', 8, 'Private Internet'],
    ['172.16.0.0', 12, 'Private Internet'],
    ['192.168.0.0', 16, 'Private Internet'],
    ['127.0.0.0', 8, 'Loopback'],
    ['169.254.0.0', 16, 'Link-Local'],
    ['100.64.0.0', 10, 'Shared Address Space'],
    ['192.0.0.0', 24, 'IETF Protocol Assignments'],
    ['192.0.2.0', 24, 'Documentation (TEST-NET-1)'],
    ['198.51.100.0', 24, 'Documentation (TEST-NET-2)'],
    ['203.0.113.0', 24, 'Documentation (TEST-NET-3)'],
    ['198.18.0.0', 15, 'Benchmark Testing'],
    ['192.88.99.0', 24, '6to4 Relay Anycast'],
    ['224.0.0.0', 4, 'Multicast'],
    ['240.0.0.0', 4, 'Reserved']
  ];

  function scopeOf(address) {
    var a = address >>> 0;
    if (a === ALL_ONES >>> 0) return 'Limited Broadcast';
    for (var i = 0; i < SCOPES.length; i++) {
      var base = parse4(SCOPES[i][0]);
      if (((a & mask4(SCOPES[i][1])) >>> 0) === base) return SCOPES[i][2];
    }
    return 'Public Internet';
  }

  function parentPrefixOf(prefix) {
    if (prefix > 24) return 24;
    if (prefix > 16) return 16;
    if (prefix > 8) return 8;
    return 0;
  }

  function Subnet4(address, prefix) {
    if (!(prefix >= 0 && prefix <= 32)) throw new Error('prefix out of range: ' + prefix);
    var self = {};
    var addr = address >>> 0;
    self.address = addr;
    self.prefix = prefix;
    self.mask = mask4(prefix);
    self.wildcard = wildcard4(prefix);
    self.network = (addr & self.mask) >>> 0;
    self.broadcast = (self.network | self.wildcard) >>> 0;
    self.totalAddresses = Math.pow(2, 32 - prefix);
    self.usableHosts = prefix === 32 ? 1 : (prefix === 31 ? 2 : self.totalAddresses - 2);
    self.firstHost = (prefix === 32 || prefix === 31) ? self.network : self.network + 1;
    self.lastHost = prefix === 32 ? self.network : (prefix === 31 ? self.broadcast : self.broadcast - 1);
    self.hasBroadcast = prefix <= 30;
    self.addressClass = classOf(addr);
    self.scope = scopeOf(addr);
    self.classDescription = 'Class ' + self.addressClass.letter + ', ' + self.scope;
    var dp = self.addressClass.defaultPrefix;
    var classfulCache;
    Object.defineProperty(self, 'classfulNetwork', {
      enumerable: true,
      get: function () {
        if (dp === null) return null;
        if (classfulCache === undefined) classfulCache = Subnet4((addr & mask4(dp)) >>> 0, dp);
        return classfulCache;
      }
    });
    self.isSubnetted = dp === null ? false : prefix > dp;
    self.borrowedBits = dp === null ? null : Math.max(prefix - dp, 0);
    self.cidr = function () { return format4(self.network) + '/' + prefix; };
    self.contains = function (other) {
      var o = other >>> 0;
      return o >= self.network && o <= self.broadcast;
    };
    return self;
  }

  function listSiblings(subnet) {
    var parentPrefix = parentPrefixOf(subnet.prefix);
    var parent = Subnet4((subnet.address & mask4(parentPrefix)) >>> 0, parentPrefix);
    var step = Math.pow(2, 32 - subnet.prefix);
    var count = Math.pow(2, subnet.prefix - parentPrefix);
    var base = parent.network;
    var subnets = [];
    for (var i = 0; i < count; i++) subnets.push(Subnet4(base + i * step, subnet.prefix));
    return {
      parent: parent,
      prefix: subnet.prefix,
      subnets: subnets,
      currentIndex: Math.floor((subnet.network - base) / step)
    };
  }

  function pad(s, n) {
    s = String(s);
    while (s.length < n) s += ' ';
    return s;
  }

  function classicReport(subnet) {
    var lines = [];
    function row(label, value, tail) { lines.push(pad(label, 11) + pad(value, 21) + tail); }
    function bits(v) { return binaryString4(v, subnet.prefix); }

    row('Address:', format4(subnet.address), bits(subnet.address));
    row('Netmask:', format4(subnet.mask) + ' = ' + subnet.prefix, bits(subnet.mask));
    row('Wildcard:', format4(subnet.wildcard), bits(subnet.wildcard));
    lines.push('=>');
    row('Network:', subnet.cidr(), bits(subnet.network));
    row('HostMin:', format4(subnet.firstHost), bits(subnet.firstHost));
    row('HostMax:', format4(subnet.lastHost), bits(subnet.lastHost));
    if (subnet.hasBroadcast) row('Broadcast:', format4(subnet.broadcast), bits(subnet.broadcast));
    row('Hosts/Net:', String(subnet.usableHosts), ' ' + subnet.classDescription);

    if (subnet.classfulNetwork) {
      lines.push('');
      row('Classful:', subnet.classfulNetwork.cidr(), ' ' + format4(subnet.classfulNetwork.mask));
      row('Subnets:',
        subnet.isSubnetted ? subnet.borrowedBits + ' bits borrowed' : 'not subnetted',
        ' from the classful /' + subnet.classfulNetwork.prefix);
    }
    return lines.join('\n') + '\n';
  }

  /* ---------------------------------------------------------------- VLSM */

  function prefixFor(hosts) {
    var prefix = 30;
    while (prefix > 0 && Subnet4(0, prefix).usableHosts < hosts) prefix--;
    return prefix;
  }

  function trailingZeroSize(v) {
    if (v === 0) return Math.pow(2, 32);
    var k = 0;
    while (k < 32 && (v / Math.pow(2, k)) % 2 === 0) k++;
    return Math.pow(2, k);
  }

  function highestPowerOfTwo(v) {
    var h = 1;
    while (h * 2 <= v) h *= 2;
    return h;
  }

  function freeBlocks(startInclusive, endInclusive) {
    if (startInclusive > endInclusive) return [];
    var out = [];
    var cursor = startInclusive;
    while (cursor <= endInclusive) {
      var alignment = trailingZeroSize(cursor);
      var remaining = endInclusive - cursor + 1;
      var size = Math.min(alignment, highestPowerOfTwo(remaining));
      var prefix = 32 - Math.round(Math.log2(size));
      out.push(Subnet4(cursor, prefix));
      cursor += size;
    }
    return out;
  }

  function plan(base, requests) {
    var valid = requests.filter(function (r) { return r.hosts > 0; });
    var ordered = valid.slice().sort(function (a, b) {
      if (b.hosts !== a.hosts) return b.hosts - a.hosts;
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });

    var cursor = base.network;
    var end = base.broadcast;
    var allocations = [];
    var unallocated = [];

    ordered.forEach(function (request) {
      var prefix = prefixFor(request.hosts);
      var size = Math.pow(2, 32 - prefix);
      if (prefix < base.prefix || cursor + size - 1 > end) {
        unallocated.push(request);
        return;
      }
      var subnet = Subnet4(cursor, prefix);
      allocations.push({
        name: request.name,
        requested: request.hosts,
        subnet: subnet,
        usable: subnet.usableHosts,
        wasted: subnet.usableHosts - request.hosts
      });
      cursor += size;
    });

    var free = freeBlocks(cursor, end);
    return {
      base: base,
      allocations: allocations,
      unallocated: unallocated,
      free: free,
      usedAddresses: allocations.reduce(function (s, a) { return s + a.subnet.totalAddresses; }, 0),
      freeAddresses: free.reduce(function (s, b) { return s + b.totalAddresses; }, 0)
    };
  }

  function planReport(p) {
    var out = [];
    out.push('VLSM plan for ' + p.base.cidr() + '  (mask ' + format4(p.base.mask) + ')');
    out.push('');
    p.allocations.forEach(function (a) {
      out.push(a.name);
      out.push('  Network:   ' + a.subnet.cidr());
      out.push('  Mask:      ' + format4(a.subnet.mask));
      out.push('  Range:     ' + format4(a.subnet.firstHost) + ' - ' + format4(a.subnet.lastHost));
      if (a.subnet.hasBroadcast) out.push('  Broadcast: ' + format4(a.subnet.broadcast));
      out.push('  Hosts:     ' + a.usable + ' usable / ' + a.requested + ' needed (' + a.wasted + ' spare)');
      out.push('');
    });
    if (p.unallocated.length) {
      out.push('Does not fit:');
      p.unallocated.forEach(function (r) { out.push('  ' + r.name + ' - ' + r.hosts + ' hosts'); });
      out.push('');
    }
    out.push('Used: ' + p.usedAddresses + ' of ' + p.base.totalAddresses + ' addresses');
    if (p.free.length) {
      out.push('Free blocks:');
      p.free.forEach(function (b) { out.push('  ' + b.cidr() + ' (' + b.totalAddresses + ' addresses)'); });
    }
    return out.join('\n') + '\n';
  }

  /* ---------------------------------------------------------------- IPv6 */

  var V6_MAX = (1n << 128n) - 1n;

  function parseGroup6(g) {
    if (!g.length || g.length > 4) return null;
    if (!/^[0-9a-fA-F]+$/.test(g)) return null;
    return parseInt(g, 16);
  }

  function parse6(text) {
    var s = String(text).trim();
    if (!s.length) return null;
    var pct = s.indexOf('%');
    if (pct !== -1) s = s.slice(0, pct);
    if (s.length > 1 && s[0] === '[' && s[s.length - 1] === ']') s = s.slice(1, -1);
    if (s.indexOf(':::') !== -1) return null;

    var left, right;
    var compressed = s.indexOf('::') !== -1;
    if (compressed) {
      if (s.indexOf('::') !== s.lastIndexOf('::')) return null;
      var cut = s.indexOf('::');
      var h0 = s.slice(0, cut);
      var h1 = s.slice(cut + 2);
      left = h0.length ? h0.split(':') : [];
      right = h1.length ? h1.split(':') : [];
    } else {
      left = s.split(':');
      right = [];
    }

    var source = right.length ? right : left;
    var tail = source.length ? source[source.length - 1] : null;
    var leftGroups = left;
    var rightGroups = right;
    if (tail !== null && tail.indexOf('.') !== -1) {
      var v4 = parse4(tail);
      if (v4 === null) return null;
      var hi = ((v4 >>> 16) & 0xFFFF).toString(16);
      var lo = (v4 & 0xFFFF).toString(16);
      if (right.length) rightGroups = right.slice(0, -1).concat([hi, lo]);
      else leftGroups = left.slice(0, -1).concat([hi, lo]);
    }

    var explicit = leftGroups.length + rightGroups.length;
    if (compressed) { if (explicit > 7) return null; }
    else { if (explicit !== 8) return null; }

    var groups = [];
    var i, g;
    for (i = 0; i < leftGroups.length; i++) {
      g = parseGroup6(leftGroups[i]);
      if (g === null) return null;
      groups.push(g);
    }
    for (i = 0; i < 8 - explicit; i++) groups.push(0);
    for (i = 0; i < rightGroups.length; i++) {
      g = parseGroup6(rightGroups[i]);
      if (g === null) return null;
      groups.push(g);
    }

    var value = 0n;
    for (i = 0; i < groups.length; i++) value = (value << 16n) | BigInt(groups[i]);
    return value;
  }

  function groupsOf(value) {
    var out = [];
    for (var i = 7; i >= 0; i--) out.push(Number((value >> BigInt(i * 16)) & 0xFFFFn));
    return out;
  }

  function expand6(value) {
    return groupsOf(value).map(function (g) {
      var s = g.toString(16);
      while (s.length < 4) s = '0' + s;
      return s;
    }).join(':');
  }

  function compress6(value) {
    var groups = groupsOf(value);
    var bestStart = -1, bestLen = 0, i = 0;
    while (i < 8) {
      if (groups[i] !== 0) { i++; continue; }
      var j = i;
      while (j < 8 && groups[j] === 0) j++;
      if (j - i > bestLen) { bestLen = j - i; bestStart = i; }
      i = j;
    }
    var hex = function (g) { return g.toString(16); };
    if (bestLen < 2) return groups.map(hex).join(':');
    var head = groups.slice(0, bestStart).map(hex).join(':');
    var tail = groups.slice(bestStart + bestLen).map(hex).join(':');
    return head + '::' + tail;
  }

  function mask6(prefix) {
    if (prefix <= 0) return 0n;
    return (V6_MAX >> BigInt(128 - prefix)) << BigInt(128 - prefix);
  }

  function networkOf6(value, prefix) { return value & mask6(prefix); }
  function lastOf6(value, prefix) { return networkOf6(value, prefix) | (V6_MAX ^ mask6(prefix)); }
  function totalAddresses6(prefix) { return 2n ** BigInt(128 - prefix); }

  function subnetCount6(prefix, targetPrefix) {
    if (targetPrefix === undefined) targetPrefix = 64;
    return prefix > targetPrefix ? 0n : 2n ** BigInt(targetPrefix - prefix);
  }

  var V6_TYPES = [
    ['::ffff:0:0', 96, 'IPv4-mapped'],
    ['64:ff9b::', 96, 'NAT64 well-known prefix'],
    ['2001:db8::', 32, 'Documentation'],
    ['2002::', 16, '6to4'],
    ['2001::', 32, 'Teredo'],
    ['ff00::', 8, 'Multicast'],
    ['fe80::', 10, 'Link-Local Unicast'],
    ['fc00::', 7, 'Unique Local (ULA)'],
    ['2000::', 3, 'Global Unicast']
  ];

  function typeOf6(value) {
    if (value === 0n) return 'Unspecified (::/128)';
    if (value === 1n) return 'Loopback (::1/128)';
    for (var i = 0; i < V6_TYPES.length; i++) {
      var base = parse6(V6_TYPES[i][0]);
      if (networkOf6(value, V6_TYPES[i][1]) === base) return V6_TYPES[i][2];
    }
    return 'Reserved by IETF';
  }

  function hexChars6(value, prefix) {
    var digits = expand6(value).split(':').join('');
    var boundary = Math.floor(prefix / 4);
    var out = [];
    for (var index = 0; index < digits.length; index++) {
      out.push({ char: digits[index], isHostNibble: index >= boundary, isSeparator: false });
      var emitted = index + 1;
      if (emitted < 32 && emitted % 4 === 0) out.push({ char: ':', isHostNibble: false, isSeparator: true });
      if (emitted >= 1 && emitted <= 31 && emitted === boundary) out.push({ char: ' ', isHostNibble: false, isSeparator: true });
    }
    return out;
  }

  function reversePointer6(value) {
    return expand6(value).split(':').join('').split('').reverse().join('.') + '.ip6.arpa';
  }

  function Prefix6(address, prefix) {
    if (!(prefix >= 0 && prefix <= 128)) throw new Error('prefix out of range: ' + prefix);
    var self = {};
    self.address = address;
    self.prefix = prefix;
    self.network = networkOf6(address, prefix);
    self.last = lastOf6(address, prefix);
    self.total = totalAddresses6(prefix);
    self.type = typeOf6(address);
    self.isNibbleAligned = prefix % 4 === 0;
    self.cidr = function () { return compress6(self.network) + '/' + prefix; };
    self.report = function () {
      return [
        'Address:   ' + compress6(address),
        'Full:      ' + expand6(address),
        'Prefix:    /' + prefix,
        'Network:   ' + self.cidr(),
        'Range:     ' + compress6(self.network) + ' - ' + compress6(self.last),
        'Addresses: ' + self.total.toString(),
        '/64 nets:  ' + subnetCount6(prefix).toString(),
        'Type:      ' + self.type
      ].join('\n') + '\n';
    };
    return self;
  }

  var api = {
    ALL_ONES: ALL_ONES,
    v4: {
      parse: parse4, format: format4, mask: mask4, wildcard: wildcard4,
      prefixOfMask: prefixOfMask, binaryChars: binaryChars4, binaryString: binaryString4,
      classOf: classOf, scopeOf: scopeOf, parentPrefixOf: parentPrefixOf,
      Subnet: Subnet4, listSiblings: listSiblings, classicReport: classicReport
    },
    vlsm: { prefixFor: prefixFor, plan: plan, freeBlocks: freeBlocks, report: planReport },
    v6: {
      MAX: V6_MAX, parse: parse6, expand: expand6, compress: compress6, mask: mask6,
      networkOf: networkOf6, lastOf: lastOf6, totalAddresses: totalAddresses6,
      subnetCount: subnetCount6, typeOf: typeOf6, hexChars: hexChars6,
      reversePointer: reversePointer6, Prefix: Prefix6
    }
  };

  root.IPCalc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* ------------------------------------------------------------------ UI */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var C = window.IPCalc;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  function rows(target, pairs) {
    target.innerHTML = '';
    pairs.forEach(function (p) {
      if (p === null) return;
      var r = el('div', 'ic-row');
      r.appendChild(el('div', 'ic-key', p[0]));
      r.appendChild(el('div', 'ic-val' + (p[2] ? ' ' + p[2] : ''), p[1]));
      target.appendChild(r);
    });
  }

  function bitsInto(target, chars, hostFlag) {
    target.innerHTML = '';
    chars.forEach(function (c) {
      var span = el('span', c.isSeparator ? 'ic-sep' : (c[hostFlag] ? 'ic-host' : 'ic-net'), c.char);
      target.appendChild(span);
    });
  }

  function copyButton(btn, getText) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = getText();
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = old; }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = el('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  function setError(node, message) {
    node.textContent = message || '';
    node.hidden = !message;
  }

  /* ---------------------------------------------------------- tabs */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ic-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.ic-panel'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) {
        var on = x === t;
        x.classList.toggle('on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
    });
  });

  /* ---------------------------------------------------------- IPv4 */

  var v4Addr = $('v4Addr'), v4Prefix = $('v4Prefix'), v4Slider = $('v4Slider'),
      v4Mask = $('v4Mask'), v4Err = $('v4Err'), v4Out = $('v4Out'),
      v4Details = $('v4Details'), v4Bits = $('v4Bits'), v4Classic = $('v4Classic'),
      v4Siblings = $('v4Siblings'), v4SibHead = $('v4SibHead');

  if (v4Mask) {
    for (var p = 0; p <= 32; p++) {
      var opt = el('option', null, '/' + p + '  ' + C.v4.format(C.v4.mask(p)));
      opt.value = String(p);
      v4Mask.appendChild(opt);
    }
  }

  var lastV4 = null;

  function renderV4() {
    var addr = C.v4.parse(v4Addr.value);
    var prefix = parseInt(v4Prefix.value, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      setError(v4Err, 'Prefix must be between 0 and 32.');
      v4Out.hidden = true;
      return;
    }
    if (addr === null) {
      setError(v4Err, 'Enter a dotted decimal address, for example 192.168.1.1');
      v4Out.hidden = true;
      return;
    }
    setError(v4Err, '');
    v4Out.hidden = false;
    v4Slider.value = String(prefix);
    v4Mask.value = String(prefix);

    var s = C.v4.Subnet(addr, prefix);
    lastV4 = s;
    var cf = s.classfulNetwork;

    rows(v4Details, [
      ['Address', C.v4.format(s.address)],
      ['Class and scope', s.classDescription],
      ['Netmask', C.v4.format(s.mask) + ' = /' + prefix],
      ['Wildcard', C.v4.format(s.wildcard)],
      ['Network', s.cidr(), 'ic-strong'],
      ['First host', C.v4.format(s.firstHost)],
      ['Last host', C.v4.format(s.lastHost)],
      s.hasBroadcast ? ['Broadcast', C.v4.format(s.broadcast)] : null,
      ['Usable hosts', s.usableHosts.toLocaleString('en-US')],
      ['Total addresses', s.totalAddresses.toLocaleString('en-US')],
      cf ? ['Classful network', cf.cidr() + '  (' + C.v4.format(cf.mask) + ')'] : null,
      cf ? ['Borrowed bits', s.isSubnetted ? s.borrowedBits + ' from the classful /' + cf.prefix : 'not subnetted'] : null
    ]);

    bitsInto(v4Bits, C.v4.binaryChars(s.address, prefix), 'isHostBit');
    v4Classic.textContent = C.v4.classicReport(s);

    var listing = C.v4.listSiblings(s);
    v4SibHead.textContent = listing.subnets.length + ' subnets of /' + prefix + ' inside ' + listing.parent.cidr();
    v4Siblings.innerHTML = '';
    listing.subnets.forEach(function (sub, i) {
      var r = el('div', 'ic-sib' + (i === listing.currentIndex ? ' on' : ''));
      r.appendChild(el('span', 'ic-sib-i', '#' + i));
      r.appendChild(el('span', 'ic-sib-net', sub.cidr()));
      r.appendChild(el('span', 'ic-sib-range',
        C.v4.format(sub.firstHost) + ' - ' + C.v4.format(sub.lastHost)));
      v4Siblings.appendChild(r);
    });
  }

  if (v4Addr) {
    v4Addr.addEventListener('input', renderV4);
    v4Prefix.addEventListener('input', renderV4);
    v4Slider.addEventListener('input', function () { v4Prefix.value = v4Slider.value; renderV4(); });
    v4Mask.addEventListener('change', function () { v4Prefix.value = v4Mask.value; renderV4(); });
    copyButton($('v4Copy'), function () { return lastV4 ? C.v4.classicReport(lastV4) : ''; });
    renderV4();
  }

  /* ---------------------------------------------------------- VLSM */

  var vBase = $('vBase'), vReq = $('vReq'), vErr = $('vErr'), vOut = $('vOut'),
      vAlloc = $('vAlloc'), vUnalloc = $('vUnalloc'), vFree = $('vFree'), vSummary = $('vSummary');

  var lastPlan = null;

  function parseRequests(text) {
    return text.split('\n').map(function (line) {
      var t = line.trim();
      if (!t || t.charAt(0) === '#') return null;
      var cut = Math.max(t.lastIndexOf(','), t.lastIndexOf(':'));
      var name, hosts;
      if (cut === -1) {
        var m = t.match(/^(.*?)\s+(\d+)$/);
        if (!m) return null;
        name = m[1].trim();
        hosts = parseInt(m[2], 10);
      } else {
        name = t.slice(0, cut).trim();
        hosts = parseInt(t.slice(cut + 1).trim(), 10);
      }
      if (!name || isNaN(hosts) || hosts <= 0) return null;
      return { name: name, hosts: hosts };
    }).filter(Boolean);
  }

  function renderVlsm() {
    var raw = vBase.value.trim();
    var parts = raw.split('/');
    var addr = C.v4.parse(parts[0] || '');
    var prefix = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
    if (addr === null || isNaN(prefix) || prefix < 0 || prefix > 32) {
      setError(vErr, 'Enter the base block in CIDR form, for example 192.168.1.0/24');
      vOut.hidden = true;
      return;
    }
    var requests = parseRequests(vReq.value);
    if (!requests.length) {
      setError(vErr, 'Add one subnet per line: a name, then a comma, then the host count.');
      vOut.hidden = true;
      return;
    }
    setError(vErr, '');
    vOut.hidden = false;

    var base = C.v4.Subnet(addr, prefix);
    var plan = C.vlsm.plan(base, requests);
    lastPlan = plan;

    vAlloc.innerHTML = '';
    plan.allocations.forEach(function (a) {
      var r = el('div', 'ic-alloc');
      r.appendChild(el('span', 'ic-alloc-name', a.name));
      r.appendChild(el('span', 'ic-alloc-net', a.subnet.cidr()));
      r.appendChild(el('span', 'ic-alloc-mask', C.v4.format(a.subnet.mask)));
      r.appendChild(el('span', 'ic-alloc-range',
        C.v4.format(a.subnet.firstHost) + ' - ' + C.v4.format(a.subnet.lastHost)));
      r.appendChild(el('span', 'ic-alloc-hosts', a.usable + ' usable / ' + a.requested + ' needed'));
      r.appendChild(el('span', 'ic-alloc-spare', a.wasted + ' spare'));
      vAlloc.appendChild(r);
    });

    vUnalloc.innerHTML = '';
    vUnalloc.hidden = plan.unallocated.length === 0;
    if (plan.unallocated.length) {
      vUnalloc.appendChild(el('div', 'ic-warn-title', 'Does not fit in ' + base.cidr()));
      plan.unallocated.forEach(function (r) {
        vUnalloc.appendChild(el('div', 'ic-warn-row', r.name + ' needs ' + r.hosts + ' hosts'));
      });
    }

    vFree.innerHTML = '';
    plan.free.forEach(function (b) {
      var r = el('div', 'ic-free');
      r.appendChild(el('span', 'ic-free-net', b.cidr()));
      r.appendChild(el('span', 'ic-free-size', b.totalAddresses.toLocaleString('en-US') + ' addresses'));
      vFree.appendChild(r);
    });

    vSummary.textContent = plan.usedAddresses.toLocaleString('en-US') + ' of ' +
      base.totalAddresses.toLocaleString('en-US') + ' addresses used, ' +
      plan.freeAddresses.toLocaleString('en-US') + ' free in ' + plan.free.length + ' block' +
      (plan.free.length === 1 ? '' : 's');
  }

  if (vBase) {
    vBase.addEventListener('input', renderVlsm);
    vReq.addEventListener('input', renderVlsm);
    copyButton($('vCopy'), function () { return lastPlan ? C.vlsm.report(lastPlan) : ''; });
    renderVlsm();
  }

  /* ---------------------------------------------------------- IPv6 */

  var v6Addr = $('v6Addr'), v6Prefix = $('v6Prefix'), v6Slider = $('v6Slider'),
      v6Err = $('v6Err'), v6Out = $('v6Out'), v6Details = $('v6Details'),
      v6Nibbles = $('v6Nibbles'), v6Ptr = $('v6Ptr');

  var lastV6 = null;

  function renderV6() {
    var prefix = parseInt(v6Prefix.value, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 128) {
      setError(v6Err, 'Prefix must be between 0 and 128.');
      v6Out.hidden = true;
      return;
    }
    var addr = C.v6.parse(v6Addr.value);
    if (addr === null) {
      setError(v6Err, 'Enter an IPv6 address, for example 2001:db8:acad:1::42');
      v6Out.hidden = true;
      return;
    }
    setError(v6Err, '');
    v6Out.hidden = false;
    v6Slider.value = String(prefix);

    var pfx = C.v6.Prefix(addr, prefix);
    lastV6 = pfx;
    var subnets = C.v6.subnetCount(prefix);

    rows(v6Details, [
      ['Address', C.v6.compress(addr)],
      ['Expanded', C.v6.expand(addr)],
      ['Type', pfx.type],
      ['Network', pfx.cidr(), 'ic-strong'],
      ['Range', C.v6.compress(pfx.network) + ' - ' + C.v6.compress(pfx.last)],
      ['Addresses', pfx.total.toString()],
      ['/64 links', subnets.toString()],
      ['Nibble aligned', pfx.isNibbleAligned ? 'yes' : 'no, the prefix ends mid-nibble']
    ]);

    bitsInto(v6Nibbles, C.v6.hexChars(addr, prefix), 'isHostNibble');
    v6Ptr.textContent = C.v6.reversePointer(addr);
  }

  if (v6Addr) {
    v6Addr.addEventListener('input', renderV6);
    v6Prefix.addEventListener('input', renderV6);
    v6Slider.addEventListener('input', function () { v6Prefix.value = v6Slider.value; renderV6(); });
    copyButton($('v6Copy'), function () { return lastV6 ? lastV6.report() : ''; });
    copyButton($('v6PtrCopy'), function () { return v6Ptr.textContent; });
    renderV6();
  }
})();
