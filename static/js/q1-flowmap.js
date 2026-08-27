/* q1-flowmap.js — renders the Q1 money-flow map from the JSON graph/export_q1.py
   writes to data/q1_flows.json (embedded inline by layouts/research/single.html
   as #q1-flow-data). Layout (x/y per node) is computed server-side in the
   export script; this file only draws it and wires up click-to-inspect,
   text search, and the core-buildout-cut highlight toggle. No dependency,
   consistent with this site's other data-driven pages (map.js). */
(function () {
  "use strict";
  var dataEl = document.getElementById("q1-flow-data");
  var container = document.getElementById("q1-flowmap");
  var panel = document.getElementById("fm-panel");
  if (!dataEl || !container) return;

  var data = JSON.parse(dataEl.textContent);
  var NODE_W = 200, NODE_H = 18, PAD = 30;

  var nodesById = {};
  data.nodes.forEach(function (n) { nodesById[n.id] = n; });

  var edgesByNode = {};
  data.edges.forEach(function (e) {
    (edgesByNode[e.source] = edgesByNode[e.source] || []).push(e);
    (edgesByNode[e.target] = edgesByNode[e.target] || []).push(e);
  });

  var maxX = 0, maxY = 0;
  data.nodes.forEach(function (n) {
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  });
  var svgW = maxX + NODE_W + PAD * 2;
  var svgH = maxY + NODE_H + PAD * 2;

  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", svgW);
  svg.setAttribute("height", svgH);
  svg.setAttribute("class", "fm-svg");
  var g = document.createElementNS(svgNS, "g");
  g.setAttribute("transform", "translate(" + PAD + "," + PAD + ")");
  svg.appendChild(g);

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function truncate(s, n) { s = s || ""; return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function fmtAmount(v) {
    if (v == null) return null;
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
    return "$" + Number(v).toLocaleString();
  }

  // edges (drawn first, under the node rects)
  data.edges.forEach(function (e) {
    var s = nodesById[e.source], t = nodesById[e.target];
    if (!s || !t) return;
    var sx = s.x + NODE_W, sy = s.y + NODE_H / 2;
    var tx = t.x, ty = t.y + NODE_H / 2;
    var mx = (sx + tx) / 2;
    var path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M" + sx + "," + sy + " C" + mx + "," + sy + " " + mx + "," + ty + " " + tx + "," + ty);
    path.setAttribute("class", "fm-edge" + (e.total_amount ? "" : " fm-edge-thin") + (e.vendor_unspecified ? " fm-edge-vendor-unspecified" : ""));
    path.dataset.source = e.source;
    path.dataset.target = e.target;
    g.appendChild(path);
  });

  // nodes
  var nodeEls = {};
  data.nodes.forEach(function (n) {
    var grp = document.createElementNS(svgNS, "g");
    grp.setAttribute("transform", "translate(" + n.x + "," + n.y + ")");
    grp.setAttribute("class", "fm-node fm-node-" + (n.atom_type || "entity") + (n.core_buildout ? " fm-core" : ""));
    grp.tabIndex = 0;
    grp.dataset.id = n.id;

    var rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("width", NODE_W);
    rect.setAttribute("height", NODE_H);
    rect.setAttribute("rx", 3);
    grp.appendChild(rect);

    var label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", 6);
    label.setAttribute("y", 13);
    label.textContent = truncate(n.facet_label || n.canonical_label || n.entity_slug || n.id, 32);
    grp.appendChild(label);

    grp.addEventListener("click", function () { selectNode(n.id); });
    grp.addEventListener("keydown", function (ev) { if (ev.key === "Enter") selectNode(n.id); });

    g.appendChild(grp);
    nodeEls[n.id] = grp;
  });

  container.appendChild(svg);

  var selectedId = null;

  function clearHighlight() {
    Object.keys(nodeEls).forEach(function (id) { nodeEls[id].classList.remove("fm-dim", "fm-selected"); });
    g.querySelectorAll(".fm-edge").forEach(function (p) { p.classList.remove("fm-dim", "fm-edge-active"); });
  }

  function selectNode(id) {
    var n = nodesById[id];
    if (!n) return;
    selectedId = id;
    clearHighlight();
    var connected = edgesByNode[id] || [];
    var keep = {};
    keep[id] = true;
    connected.forEach(function (e) {
      keep[e.source] = true;
      keep[e.target] = true;
      g.querySelectorAll('.fm-edge[data-source="' + e.source + '"][data-target="' + e.target + '"]').forEach(function (p) {
        p.classList.add("fm-edge-active");
      });
    });
    g.querySelectorAll(".fm-edge:not(.fm-edge-active)").forEach(function (p) { p.classList.add("fm-dim"); });
    Object.keys(nodeEls).forEach(function (k) { if (!keep[k]) nodeEls[k].classList.add("fm-dim"); });
    nodeEls[id].classList.add("fm-selected");
    renderPanel(n, connected);
    nodeEls[id].scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }

  function renderPanel(n, connected) {
    if (!panel) return;
    panel.hidden = false;
    var html = "<button class='fm-close' aria-label='Close'>×</button>";
    html += "<h2>" + escapeHtml(n.facet_label || n.canonical_label || n.entity_slug) + "</h2>";
    if (n.activity) html += "<p class='fm-activity'>" + escapeHtml(n.activity) + "</p>";
    if (n.core_buildout) html += "<p class='fm-tag'>inside cut:core-buildout</p>";
    html += "<h3>" + connected.length + " connected flow" + (connected.length === 1 ? "" : "s") + "</h3>";
    html += "<ul class='fm-flows'>";
    connected.forEach(function (e) {
      var otherId = e.source === n.id ? e.target : e.source;
      var other = nodesById[otherId];
      var dir = e.source === n.id ? "→ " : "← ";
      html += "<li><span class='fm-dir'>" + dir + "</span>";
      html += "<a href='#' class='fm-jump' data-id='" + escapeHtml(otherId) + "'>" + escapeHtml(other ? (other.facet_label || other.canonical_label || other.id) : otherId) + "</a>";
      if (e.total_amount) html += " <span class='fm-fa'>" + fmtAmount(e.total_amount) + "</span>";
      if (e.role) html += " <span class='fm-role'>(" + escapeHtml(e.role) + ")</span>";
      if (e.vendor_unspecified) html += " <span class='fm-role'>(paid to unnamed vendor(s) — this source doesn't say who)</span>";
      (e.flows || []).forEach(function (f) {
        html += "<div class='fm-flow-detail'>";
        if (f.amount) html += "<span class='fm-fa'>" + fmtAmount(f.amount) + (f.basis && f.basis !== "point" ? " (" + escapeHtml(f.basis) + ")" : "") + "</span> ";
        if (f.flow_type) html += "<span class='fm-ft'>" + escapeHtml(f.flow_type) + "</span> ";
        if (f.date) html += "<span class='fm-internal-src'>" + escapeHtml(f.date) + "</span> ";
        html += "<span class='fm-summary'>" + escapeHtml(f.summary || "") + "</span>";
        (f.source_urls || []).forEach(function (u) {
          if (/^https?:\/\//.test(u)) {
            html += " <a href='" + u.replace(/"/g, "&quot;") + "' target='_blank' rel='noopener'>source →</a>";
          } else {
            html += " <span class='fm-internal-src'>(" + escapeHtml(u) + ")</span>";
          }
        });
        html += "</div>";
      });
      html += "</li>";
    });
    html += "</ul>";
    panel.innerHTML = html;
    panel.querySelector(".fm-close").addEventListener("click", closePanel);
    panel.querySelectorAll(".fm-jump").forEach(function (a) {
      a.addEventListener("click", function (ev) { ev.preventDefault(); selectNode(a.dataset.id); });
    });
  }

  function closePanel() {
    if (panel) panel.hidden = true;
    selectedId = null;
    clearHighlight();
  }

  var search = document.getElementById("fm-search");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      Object.keys(nodeEls).forEach(function (id) {
        var n = nodesById[id];
        var match = !q || (n.facet_label || n.canonical_label || "").toLowerCase().indexOf(q) !== -1;
        nodeEls[id].classList.toggle("fm-search-dim", !match);
      });
    });
  }

  var coreToggle = document.getElementById("fm-core-toggle");
  if (coreToggle) {
    coreToggle.addEventListener("change", function () {
      container.classList.toggle("fm-core-mode", coreToggle.checked);
    });
  }
})();
