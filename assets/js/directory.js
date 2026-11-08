"use strict";
/* allknowdev v1.0 — directory renderer
   Fetches data/*.json, renders searchable/filterable "free vs paid" cards.
   No dependencies, no build step. */

(function () {
  const CATEGORIES = [
    { key: "ai", file: "ai-ml.json", title: "AI & Machine Learning", blurb: "Model APIs, coding assistants, GPUs, vector databases" },
    { key: "cloud", file: "cloud-hosting.json", title: "Cloud & Hosting", blurb: "Static hosts, serverless, VMs, PaaS, tunnels" },
    { key: "data", file: "databases-auth.json", title: "Databases & Auth", blurb: "Postgres, NoSQL, caches, identity providers" },
    { key: "tools", file: "devtools.json", title: "Developer Tools", blurb: "Editors, IDEs, CI, observability, security" },
    { key: "apis", file: "apis-services.json", title: "APIs & Services", blurb: "Payments, email, storage, maps, notifications" },
    { key: "learning", file: "learning.json", title: "Learning & Certifications", blurb: "Courses, labs, certifications, student perks" },
    { key: "design", file: "design.json", title: "Design & Assets", blurb: "Fonts, icons, illustrations, photos, UI kits" }
  ];

  const SYMBOLS = { USD: "$", EUR: "\u20AC", GBP: "\u00A3", INR: "\u20B9" };

  const searchInput = document.getElementById("directorySearch");
  const filterBar = document.getElementById("directoryFilters");
  const summary = document.getElementById("directorySummary");
  const results = document.getElementById("directoryResults");
  const emptyState = document.getElementById("directoryEmpty");

  let entries = [];
  let activeCategory = "all";
  let toggles = { free: false, oss: false, student: false };
  let searchQuery = "";
  let sortMode = "recommended";
  const STORAGE_KEY = "allknowdev-directory";
  let searchTimer = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function currency(entry) {
    const paid = entry.paid_from;
    if (!paid) return { price: null, plan: null };
    const symbol = SYMBOLS[paid.currency] || (paid.currency ? paid.currency + " " : "");
    let price = null;
    if (typeof paid.amount === "number") {
      const suffix = paid.period === "once" ? " one-time" : "/" + (paid.period || "mo").replace("month", "mo").replace("transaction", "transaction");
      price = symbol + paid.amount + (paid.period === "transaction" ? "+ per transaction" : suffix);
    }
    return { price: price, plan: paid.plan || null };
  }

  function badges(entry) {
    const list = [];
    if (entry.free_tier_exists) list.push({ cls: "badge-free", text: "Free tier" });
    else list.push({ cls: "badge-paid", text: "No free tier" });
    if (entry.oss) list.push({ cls: "badge-oss", text: "OSS" });
    if (entry.student) list.push({ cls: "badge-student", text: "Student" });
    if (entry.confidence !== "official") list.push({ cls: "badge-volatile", text: "Verify" });
    return list;
  }

  function renderBadges(entry) {
    const wrap = el("div", "dir-badges");
    badges(entry).forEach(function (b) {
      wrap.appendChild(el("span", b.cls, b.text));
    });
    return wrap;
  }

  function renderEntry(entry) {
    const card = el("article", "dir-card");
    card.dataset.id = entry.id;

    const head = el("div", "dir-head");
    const titleWrap = el("div");
    titleWrap.appendChild(el("h3", null, entry.product));
    titleWrap.appendChild(el("span", "provider", entry.provider));
    head.appendChild(titleWrap);
    head.appendChild(renderBadges(entry));
    card.appendChild(head);

    if (entry.tags && entry.tags.length) {
      card.appendChild(el("div", "dir-tags", entry.tags.join(" \u00B7 ")));
    }

    const cols = el("div", "dir-cols");
    const freeCol = el("div", "dir-col free");
    const tierName = (entry.free_tier_name || "").toLowerCase();
    const freeHeading = tierName && !tierName.includes("free") && tierName !== "n/a"
      ? "What you get on " + entry.free_tier_name
      : "What you get for free";
    freeCol.appendChild(el("h4", null, freeHeading));
    const freeList = el("ul");
    (entry.what_free || []).slice(0, 4).forEach(function (item) { freeList.appendChild(el("li", null, item)); });
    if (!(entry.what_free || []).length) freeList.appendChild(el("li", null, "No free offering \u2014 this is a paid-only service."));
    freeCol.appendChild(freeList);
    cols.appendChild(freeCol);

    const paidCol = el("div", "dir-col paid");
    paidCol.appendChild(el("h4", null, "What money unlocks"));
    const money = currency(entry);
    if (money.price || money.plan) {
      paidCol.appendChild(el("span", "price", money.price ? "from " + money.price : money.plan));
    } else {
      paidCol.appendChild(el("span", "price", "no paid plan needed"));
    }
    const paidList = el("ul");
    (entry.what_paid || []).slice(0, 3).forEach(function (item) { paidList.appendChild(el("li", null, item)); });
    paidCol.appendChild(paidList);
    cols.appendChild(paidCol);
    card.appendChild(cols);

    const details = el("div", "dir-details");
    if (entry.best_for) {
      const best = el("p", "dir-best");
      best.appendChild(el("b", null, "Best for: "));
      best.appendChild(document.createTextNode(entry.best_for));
      details.appendChild(best);
    }
    if (entry.watch_out && entry.watch_out.length) {
      details.appendChild(el("h5", null, "Watch out"));
      const warn = el("ul");
      entry.watch_out.forEach(function (item) { warn.appendChild(el("li", null, item)); });
      details.appendChild(warn);
    }
    card.appendChild(details);

    const more = el("div", "dir-more");
    const toggleBtn = el("button", null, "Details");
    toggleBtn.type = "button";
    toggleBtn.addEventListener("click", function () {
      card.classList.toggle("open");
      toggleBtn.textContent = card.classList.contains("open") ? "Close" : "Details";
    });
    more.appendChild(toggleBtn);
    more.appendChild(el("span", "disclaimer", "checked " + entry.last_verified + " \u00B7 " + entry.confidence));
    card.appendChild(more);

    const meta = el("div", "dir-meta");
    meta.appendChild(el("a", null, "Official site \u2197")).href = entry.official_url;
    meta.appendChild(el("a", "pricing-link", "Pricing \u2197")).href = entry.pricing_url || entry.official_url;
    card.appendChild(meta);

    return card;
  }

  function matches(entry) {
    if (activeCategory !== "all" && entry.category !== activeCategory) return false;
    if (toggles.free && !entry.free_tier_exists) return false;
    if (toggles.oss && !entry.oss) return false;
    if (toggles.student && !entry.student) return false;
    if (searchQuery) {
      const haystack = [
        entry.provider, entry.product, entry.free_tier_name, entry.best_for,
        (entry.tags || []).join(" "), (entry.what_free || []).join(" "), (entry.what_paid || []).join(" ")
      ].join(" ").toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }
    return true;
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    const query = params.toString();
    const next = location.pathname + (query ? "?" + query : "") + (activeCategory !== "all" ? "#" + activeCategory : "");
    history.replaceState(null, "", next);
  }

  function sortEntries(list) {
    return [...list].sort(function (a, b) {
      if (sortMode === "name") return String(a.product || "").localeCompare(String(b.product || ""));
      if (sortMode === "free-first") return Number(Boolean(b.free_tier_exists)) - Number(Boolean(a.free_tier_exists)) || String(a.product || "").localeCompare(String(b.product || ""));
      if (sortMode === "student-first") return Number(Boolean(b.student)) - Number(Boolean(a.student)) || String(a.product || "").localeCompare(String(b.product || ""));
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(a.product || "").localeCompare(String(b.product || ""));
    });
  }

  function render() {
    if (!results) return;
    results.classList.remove("dir-skeleton");
    results.replaceChildren();

    let shown = 0;
    CATEGORIES.forEach(function (cat) {
      const inCat = sortEntries(entries.filter(function (e) { return e.category === cat.key && matches(e); }));
      if (!inCat.length) return;
      if (activeCategory === "all" || activeCategory === cat.key) {
        const section = el("div");
        section.id = cat.key;
        const head = el("div", "dir-section");
        head.appendChild(el("h2", null, cat.title));
        head.appendChild(el("span", null, inCat.length + (inCat.length === 1 ? " service" : " services")));
        section.appendChild(head);
        if (activeCategory === "all") section.appendChild(el("p", "disclaimer", cat.blurb));
        const grid = el("div", "dir-grid");
        inCat.forEach(function (entry) { grid.appendChild(renderEntry(entry)); });
        section.appendChild(grid);
        results.appendChild(section);
        shown += inCat.length;
      }
    });

    if (summary) {
      summary.replaceChildren();
      summary.appendChild(el("span", null, "Showing "));
      summary.appendChild(el("b", null, String(shown)));
      summary.appendChild(el("span", null, " of " + entries.length + " services" +
        (searchQuery ? " for \u201C" + searchQuery + "\u201D" : "")));
    }
    if (emptyState) emptyState.hidden = shown !== 0;
    updateUrl();
    const countNode = document.getElementById("directoryResultCount");
    if (countNode) countNode.textContent = shown + " shown";
  }

  function setCategory(key) {
    activeCategory = key;
    saveState();
    if (filterBar) {
      filterBar.querySelectorAll("[data-filter]").forEach(function (btn) {
        const on = btn.dataset.filter === key;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-pressed", String(on));
      });
    }
    render();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        category: activeCategory,
        toggles: toggles,
        sort: sortMode
      }));
    } catch (_) {}
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      if (saved.category && (saved.category === "all" || CATEGORIES.some(function (c) { return c.key === saved.category; }))) activeCategory = saved.category;
      if (saved.toggles) toggles = Object.assign(toggles, saved.toggles);
      if (saved.sort) sortMode = saved.sort;
    } catch (_) {}
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim().toLowerCase();
    if (q && searchInput) searchInput.value = q;
    searchQuery = q;
    const hash = (location.hash || "").replace("#", "");
    if (hash && CATEGORIES.some(function (c) { return c.key === hash; })) activeCategory = hash;
  }

  function addControls() {
    if (!summary || document.getElementById("directoryControls")) return;
    const controls = el("div", "directory-controls");
    const copy = el("span", "control-copy");
    copy.id = "directoryResultCount";
    copy.textContent = "Loading…";
    const select = el("select");
    select.id = "directorySort";
    select.setAttribute("aria-label", "Sort directory");
    [
      ["recommended", "Recommended"],
      ["name", "Name A–Z"],
      ["free-first", "Free tier first"],
      ["student-first", "Student perks first"]
    ].forEach(function (item) {
      const option = el("option");
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });
    select.value = sortMode;
    select.addEventListener("change", function () {
      sortMode = select.value;
      saveState();
      render();
    });
    controls.appendChild(copy);
    controls.appendChild(select);
    summary.parentNode.insertBefore(controls, summary);
  }

  function loadData() {
    return Promise.all(CATEGORIES.map(function (cat) {
      return fetch("../data/" + cat.file).then(function (res) {
        if (!res.ok) throw new Error(cat.file + ": HTTP " + res.status);
        return res.json();
      });
    })).then(function (lists) {
      entries = [];
      lists.forEach(function (list) { entries = entries.concat(list); });
      setCategory(activeCategory);
    }).catch(function (err) {
      if (results) {
        results.replaceChildren();
        const fail = el("div", "dir-skeleton");
        fail.textContent = "Could not load the directory data (" + err.message + "). If you opened this file directly, serve the site with: python -m http.server 5500";
        results.appendChild(fail);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = searchInput.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(render, 120);
    });
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        searchInput.value = "";
        searchQuery = "";
        render();
      }
    });
  }

  if (filterBar) {
    filterBar.addEventListener("click", function (event) {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      if (btn.dataset.filter === "__toggle") {
        const key = btn.dataset.toggle;
        toggles[key] = !toggles[key];
        saveState();
        btn.classList.toggle("active", toggles[key]);
        btn.setAttribute("aria-pressed", String(toggles[key]));
        render();
        return;
      }
      setCategory(btn.dataset.filter);
    });
  }

  restoreState();
  readUrl();
  addControls();
  if (filterBar) {
    filterBar.querySelectorAll("[data-toggle]").forEach(function (btn) {
      const key = btn.dataset.toggle;
      const on = Boolean(toggles[key]);
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }
  loadData();
})();
