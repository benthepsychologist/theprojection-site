/* money-map.js: the three-box money map (experimental, v0.1). Plain JS, no libraries.
   Reads the flat table the hub writes (data/money_map.json, embedded in the page): one row per claim.
   Rows: side 'in' (financing: money coming in) or 'out' (spending); a = payer or funder, b = payee,
   d = destination, l = layer, y = year recorded (2025, 2026, other), s = realized | pledged | guided, u = dollars,
   sa / sb = payer / payee is a supplier of physical things. 'guided' rows are guidance, estimates, floors or
   ceilings: shown apart from firm figures and never added to a total (total = realized + pledged; all = with guided). */
(function (root) {
  'use strict';
  var LAYERS = ['construction', 'hardware', 'above'];
  var AUTO_SHARE = 0.9, AUTO_CAP = 12;

  function usd(x) {
    if (x >= 1e9) return '$' + (x / 1e9).toFixed(1) + 'B';
    if (x >= 1e6) return '$' + (x / 1e6).toFixed(0) + 'M';
    return '$' + Math.round(x).toLocaleString('en-US');
  }

  /* Which rows each box counts. Box A: money in, by year. Boxes B and C: spending, by year and layer. The edge
     of the box (Ben, 2026-11-03): by default it ends at atoms, so a supplier of physical things is outside it
     and its own spending is not counted; a payment to it counts when received. With suppliersInside the
     reverse: what a supplier spends counts, and what is paid to it does not (that would count it twice). */
  function rowsIn(rows, st) {
    return rows.filter(function (r) { return r.side === 'in' && (st.year === 'all' || r.y === st.year); });
  }
  function rowsOut(rows, st) {
    return rows.filter(function (r) {
      return r.side === 'out' && (st.year === 'all' || r.y === st.year) && st.layers.indexOf(r.l) >= 0 &&
        (st.suppliersInside ? !r.sb : !r.sa);
    });
  }

  function group(rows, keyFn) {
    var m = {}, out = [];
    rows.forEach(function (r) {
      var k = keyFn(r), g = m[k];
      if (!g) { g = m[k] = { key: k, realized: 0, pledged: 0, guided: 0, total: 0, all: 0, rows: [] }; out.push(g); }
      g[r.s === 'realized' ? 'realized' : (r.s === 'guided' ? 'guided' : 'pledged')] += r.u;
      if (r.s !== 'guided') g.total += r.u;
      g.all += r.u;
      g.rows.push(r);
    });
    return out.sort(function (a, b) { return b.all - a.all; });
  }

  function merge(groups, label) {
    var o = { key: label, realized: 0, pledged: 0, guided: 0, total: 0, all: 0, rows: [], members: groups };
    groups.forEach(function (g) { o.realized += g.realized; o.pledged += g.pledged; o.guided += g.guided; o.total += g.total; o.all += g.all; o.rows = o.rows.concat(g.rows); });
    return o;
  }

  /* The scree rule. How many players are named before the rest become one "Other".
       auto  the fewest players that cover 90% of the dollars, at most 12, and never so few that "Other" is
             larger than the smallest player shown (it should not dwarf them);
       count a number of players;  pct  the fewest that cover that share of the dollars;
       min   every player at or above a dollar size. */
  function scree(groups, rule) {
    var n = groups.length, total = 0, i;
    groups.forEach(function (g) { total += g.all; });
    if (!n) return { shown: [], other: null, n: 0, of: 0, share: 0 };
    function cover(share) { var c = 0; for (i = 0; i < n; i++) { c += groups[i].all; if (c >= share * total - 1e-6) return i + 1; } return n; }
    function after(N) { var c = 0; for (i = N; i < n; i++) c += groups[i].all; return c; }
    var N;
    if (rule.mode === 'count') N = Math.max(1, Math.min(n, Math.round(rule.value) || 1));
    else if (rule.mode === 'min') N = groups.filter(function (g) { return g.all >= rule.value; }).length;
    else if (rule.mode === 'pct') N = cover(Math.max(0, Math.min(100, rule.value)) / 100);
    else {
      N = Math.min(cover(AUTO_SHARE), AUTO_CAP);
      while (N < Math.min(n, AUTO_CAP) && after(N) > groups[N - 1].all) N++;
    }
    var shown = groups.slice(0, N), rest = groups.slice(N);
    var other = rest.length ? merge(rest, 'Other (' + rest.length + ' more)') : null;
    var c = 0; shown.forEach(function (g) { c += g.all; });
    return { shown: shown, other: other, n: N, of: n, share: total ? c / total : 0 };
  }

  var api = { usd: usd, rowsIn: rowsIn, rowsOut: rowsOut, group: group, scree: scree, LAYERS: LAYERS };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.MoneyMap = api;

  /* ---------- the page ---------- */
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function claimList(rows) {
    var ul = el('ul', 'mm-claims');
    rows.slice().sort(function (a, b) { return b.u - a.u; }).forEach(function (r) {
      var li = el('li'), a = el('a', null, r.a + ' → ' + r.b);
      a.href = '/q1claim/' + r.id + '/';
      li.appendChild(a);
      li.appendChild(el('span', 'mm-claim-meta', ' ' + usd(r.u) + ' · ' + (r.s === 'guided' ? 'guided or estimated (' + (r.q || 'stated') + ')' : r.s) + ' · recorded ' + (r.y === 'other' ? 'earlier or undated' : r.y) + (r.d ? ' · ' + r.d : '')));
      ul.appendChild(li);
    });
    return ul;
  }

  function bars(container, groups, max) {
    groups.forEach(function (g) {
      var row = el('div', 'mm-row'), head = el('button', 'mm-label', g.key);
      head.type = 'button';
      var track = el('div', 'mm-track'), a = el('span', 'mm-real'), b = el('span', 'mm-pled'), c = el('span', 'mm-guid');
      a.style.width = (max ? 100 * g.realized / max : 0) + '%';
      b.style.width = (max ? 100 * g.pledged / max : 0) + '%';
      c.style.width = (max ? 100 * g.guided / max : 0) + '%';
      track.appendChild(a); track.appendChild(b); track.appendChild(c);
      var amt = el('span', 'mm-amt', g.total ? usd(g.total) : '—');
      if (g.guided) amt.appendChild(el('small', 'mm-gnote', '+' + usd(g.guided) + ' guided'));
      row.appendChild(head); row.appendChild(track); row.appendChild(amt);
      var detail = el('div', 'mm-detail'); detail.hidden = true;
      detail.appendChild(g.members ? bulletGroups(g.members) : claimList(g.rows));
      head.addEventListener('click', function () { detail.hidden = !detail.hidden; row.classList.toggle('open', !detail.hidden); });
      container.appendChild(row); container.appendChild(detail);
    });
  }
  function bulletGroups(members) {
    var ul = el('ul', 'mm-claims');
    members.forEach(function (g) { ul.appendChild(el('li', null, g.key + ' — ' + (g.total ? usd(g.total) : '—') + (g.guided ? ' (+' + usd(g.guided) + ' guided)' : ''))); });
    return ul;
  }

  function init() {
    var host = document.getElementById('money-map');
    if (!host) return;
    var data = JSON.parse(document.getElementById('money-map-data').textContent), rows = data.rows;
    var st = { year: 'all', layers: LAYERS.slice(), suppliersInside: false, view: 'buys', mode: 'auto', value: 10 };

    function box(id) { var b = document.getElementById(id); b.innerHTML = ''; return b; }
    function render() {
      var rule = { mode: st.mode, value: st.mode === 'min' ? st.value * 1e9 : st.value };
      function fill(id, groups, note) {
        var b = box(id), s = scree(groups, rule), max = 0;
        s.shown.concat(s.other ? [s.other] : []).forEach(function (g) { if (g.all > max) max = g.all; });
        var total = 0, gd = 0; groups.forEach(function (g) { total += g.total; gd += g.guided; });
        b.appendChild(el('p', 'mm-total', usd(total) + ' recorded' + (gd ? ' (+' + usd(gd) + ' guided or estimated, not added)' : '')));
        if (!groups.length) { b.appendChild(el('p', 'mm-empty', 'Nothing recorded under these filters.')); return; }
        bars(b, s.shown.concat(s.other ? [s.other] : []), max);
        b.appendChild(el('p', 'mm-foot', note + 'Showing ' + s.n + ' of ' + s.of + ', ' + Math.round(100 * s.share) + '% of the dollars.'));
      }
      fill('mm-in', group(rowsIn(rows, st), function (r) { return r.a; }), '');
      var out = rowsOut(rows, st);
      fill('mm-spend', group(out, function (r) { return r.a; }), '');
      if (st.view === 'buys') {
        var b = box('mm-buys'), total = 0, gd = 0, max = 0, byLayer = {};
        out.forEach(function (r) { if (r.s === 'guided') gd += r.u; else total += r.u; });
        b.appendChild(el('p', 'mm-total', usd(total) + ' recorded' + (gd ? ' (+' + usd(gd) + ' guided or estimated, not added)' : '')));
        LAYERS.forEach(function (L) {
          var gs = group(out.filter(function (r) { return r.l === L; }), function (r) { return r.d; });
          gs.forEach(function (g) { if (g.all > max) max = g.all; });
          byLayer[L] = gs;
        });
        LAYERS.forEach(function (L) {
          if (!byLayer[L].length) return;
          var sub = 0; byLayer[L].forEach(function (g) { sub += g.total; });
          b.appendChild(el('h4', 'mm-layer', L + ' · ' + usd(sub)));
          bars(b, byLayer[L], max);
        });
        if (!out.length) b.appendChild(el('p', 'mm-empty', 'Nothing recorded under these filters.'));
      } else {
        fill('mm-buys', group(out, function (r) { return r.b; }), '');
      }
    }

    function bind(name, fn) {
      Array.prototype.forEach.call(host.querySelectorAll('[name="' + name + '"]'), function (n) { n.addEventListener('change', function () { fn(n); render(); }); });
    }
    bind('year', function (n) { st.year = n.value; });
    bind('layer', function () {
      st.layers = Array.prototype.filter.call(host.querySelectorAll('[name="layer"]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
    });
    bind('inside', function (n) { st.suppliersInside = n.checked; });
    bind('view', function (n) { st.view = n.value; });
    bind('mode', function (n) { st.mode = n.value; host.querySelector('[name="value"]').disabled = n.value === 'auto'; });
    var v = host.querySelector('[name="value"]');
    v.addEventListener('input', function () { st.value = parseFloat(v.value) || 0; render(); });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : this);
