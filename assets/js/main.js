"use strict";
/* allknowdev v2 — shared core ("Aurora Paper").
   Theme, navigation, scroll reveals, count-up, data loading, region/currency
   store, price formatting and card renderers. Exposed as window.AKD.
   Zero dependencies. Classic scripts so everything works from file:// too. */

(function () {
  const AKD = (window.AKD = {});
  AKD.REPO = "https://github.com/sujeeth777/allknowdev";
  AKD.REPO_NEW_ISSUE = AKD.REPO + "/issues/new";
  AKD.REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= theme ================= */
  const THEME_KEY = "akd-theme";
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.textContent = t === "dark" ? "☀️" : "🌙";
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }
  let theme = null;
  try { theme = localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
  applyTheme(theme === "dark" ? "dark" : "light");
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-toggle");
    if (!btn) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* ignore */ }
    applyTheme(next);
  });

  /* ================= navigation ================= */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    const close = () => {
      navLinks.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    };
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    window.addEventListener("resize", () => { if (innerWidth > 780) close(); });
  }

  // current-page highlighting
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href === page || (page === "index.html" && href === "index.html")) a.setAttribute("aria-current", "page");
  });

  /* ================= header scroll state ================= */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ================= reveal / stagger observers ================= */
  const revealables = document.querySelectorAll(".reveal, .stagger, .reveal-scale");
  if ("IntersectionObserver" in window && !AKD.REDUCED_MOTION) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); o.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    revealables.forEach((el) => obs.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("visible"));
  }

  /* ================= count-up ================= */
  AKD.countUp = function (el, target, opts) {
    const o = opts || {};
    const suffix = o.suffix || "";
    const finish = () => { el.textContent = new Intl.NumberFormat().format(target) + suffix; };
    if (AKD.REDUCED_MOTION || !("requestAnimationFrame" in window)) { finish(); return; }
    const dur = 1100;
    const start = performance.now();
    const fmt = new Intl.NumberFormat();
    // rAF drives the animation; a timeout guarantee snaps to the final value
    // even if the tab throttles rAF (background, headless, busy CPU).
    const timer = setTimeout(finish, dur + 120);
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else clearTimeout(timer);
    })(start);
  };

  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const run = (el) => AKD.countUp(el, Number(el.dataset.countTo) || 0, { suffix: el.dataset.suffix || "" });
    if ("IntersectionObserver" in window && !AKD.REDUCED_MOTION) {
      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((en) => { if (en.isIntersecting) { run(en.target); o.unobserve(en.target); } });
      }, { threshold: 0.4 });
      counters.forEach((el) => obs.observe(el));
    } else counters.forEach(run);
  }

  /* ================= footer year ================= */
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  /* ================= data loading ================= */
  const SERVICE_FILES = [
    "ai-ml.json", "ai-chat.json", "ai-image.json", "ai-video.json", "ai-audio.json", "ai-coding.json",
    "cloud-hosting.json", "databases-auth.json", "devtools.json", "apis-services.json",
    "learning.json", "design.json", "software.json", "productivity.json", "security.json", "storage.json"
  ];
  const dataCache = {};
  let loadError = false;

  function fetchJSON(path) {
    return fetch(path).then((r) => {
      if (!r.ok) throw new Error(path + ": HTTP " + r.status);
      return r.json();
    });
  }

  function failure() {
    loadError = true;
    return null;
  }

  AKD.failed = () => loadError;

  AKD.getServices = function () {
    if (!dataCache.services) {
      let loaded = 0;
      dataCache.services = Promise.all(
        SERVICE_FILES.map((f) => fetchJSON("data/" + f).catch(() => null))
      ).then((lists) => {
        const entries = [];
        const byId = {};
        lists.forEach((list) => {
          if (!Array.isArray(list)) return;
          loaded++;
          list.forEach((e) => {
            if (e && e.id && !byId[e.id]) { byId[e.id] = e; entries.push(e); }
          });
        });
        if (!loaded && !entries.length) loadError = true; // nothing at all loaded
        else if (loaded < SERVICE_FILES.length) {
          console.warn("allknowdev: some data files failed to load (" + (SERVICE_FILES.length - loaded) + " skipped)");
        }
        return { list: entries, byId };
      });
    }
    return dataCache.services;
  };

  AKD.getMeta = function (name) {
    if (!dataCache[name]) dataCache[name] = fetchJSON("data/" + name + ".json").catch(failure);
    return dataCache[name];
  };

  /* ================= categories ================= */
  let catIndex = null;
  AKD.getCategories = function () {
    if (!catIndex) {
      catIndex = AKD.getMeta("categories").then((data) => {
        const map = {};
        (data && data.categories ? data.categories : []).forEach((c) => { map[c.id] = c; });
        return { list: (data && data.categories) || [], groups: (data && data.groups) || [], byId: map };
      });
    }
    return catIndex;
  };
  AKD.catEmoji = (entry) => {
    const c = catIndex && catIndex.byIdCache && catIndex.byIdCache[entry.category];
    return (c && c.emoji) || "🧩";
  };
  // resolved once categories load
  AKD.getCategories().then((cats) => { catIndex.byIdCache = cats.byId; });

  /* ================= region / currency store ================= */
  const REGION_KEY = "akd-region";
  let fxData = null;
  AKD.getMeta("fx").then((d) => { fxData = d; document.dispatchEvent(new CustomEvent("akd:fxready")); });

  const listeners = [];
  AKD.onRegionChange = function (fn) { listeners.push(fn); };

  AKD.region = {
    get() {
      try { return JSON.parse(localStorage.getItem(REGION_KEY) || "null"); } catch (e) { return null; }
    },
    set(code) {
      try { localStorage.setItem(REGION_KEY, JSON.stringify({ code })); } catch (e) { /* ignore */ }
      listeners.forEach((fn) => { try { fn(code); } catch (err) { /* ignore */ } });
    },
    clear() {
      try { localStorage.removeItem(REGION_KEY); } catch (e) { /* ignore */ }
      listeners.forEach((fn) => { try { fn(null); } catch (err) { /* ignore */ } });
    }
  };

  AKD.currencyCode = function () {
    const r = AKD.region.get();
    if (r && fxData) {
      const c = fxData.currencies.find((c) => c.code === currencyForRegion(r.code));
      if (c) return c.code;
    }
    return "USD";
  };

  function currencyForRegion(code) {
    const map = { IN: "INR", US: "USD", GB: "GBP", EU: "EUR", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR", IE: "EUR", AT: "EUR", BE: "EUR", FI: "EUR", GR: "EUR",
      CA: "CAD", AU: "AUD", BR: "BRL", MX: "MXN", NG: "NGN", KE: "KES", ZA: "ZAR", SG: "SGD", ID: "IDR", PH: "PHP", PK: "PKR", BD: "BDT", AE: "AED", JP: "JPY", LK: "LKR", NP: "NPR", EG: "EGP", TR: "TRY", PL: "PLN", SE: "SEK", NO: "NOK", DK: "DKK", CZ: "CZK", RO: "RON", UA: "UAH", KR: "KRW", HK: "HKD", TW: "TWD", NZ: "NZD", IL: "ILS", SA: "SAR", QA: "QAR", CH: "CHF", CN: "CNY", MY: "MYR", TH: "THB", VN: "VND" };
    return map[code] || "USD";
  }
  AKD.currencyForRegion = currencyForRegion;

  AKD.currencyMeta = function (code) {
    if (!fxData) return null;
    return fxData.currencies.find((c) => c.code === code) || null;
  };

  AKD.convert = function (usdAmount, code) {
    if (!fxData || typeof usdAmount !== "number") return null;
    const c = fxData.currencies.find((x) => x.code === code);
    if (!c) return null;
    return usdAmount * c.rate;
  };

  AKD.formatMoney = function (amount, code) {
    const meta = AKD.currencyMeta(code);
    const decimals = meta && meta.rate >= 50 ? 0 : 2;
    try {
      return new Intl.NumberFormat(meta ? meta.locale : undefined, {
        style: "currency", currency: code, maximumFractionDigits: decimals, minimumFractionDigits: 0
      }).format(amount);
    } catch (e) {
      return (meta ? meta.symbol : "$") + Math.round(amount * 100) / 100;
    }
  };

  /* price label for an entry, in current currency */
  AKD.priceLabel = function (entry, code) {
    const cur = code || AKD.currencyCode();
    const paid = entry.paid_from;
    if (!paid) return null;
    if (typeof paid.amount === "number") {
      const converted = AKD.convert(paid.amount, cur);
      if (converted != null) {
        const suffix = paid.period === "once" ? " one-time"
          : paid.period === "transaction" ? "+ per transaction"
          : "/" + (paid.period || "mo").replace("month", "mo");
        return AKD.formatMoney(converted, cur) + suffix;
      }
      const sym = (AKD.currencyMeta(paid.currency) || {}).symbol || "$";
      return "from " + sym + paid.amount + "/" + (paid.period || "mo").replace("month", "mo");
    }
    return paid.plan || null;
  };

  /* ================= tiers ================= */
  AKD.tier = function (entry) {
    if (entry.oss) return { id: "oss", label: "Open source", badge: "badge-oss" };
    if (!entry.free_tier_exists) return { id: "paid", label: "Paid / trial", badge: "badge-paid" };
    if (entry.paid_from && typeof entry.paid_from.amount === "number") return { id: "freemium", label: "Free tier + paid", badge: "badge-freemium" };
    return { id: "free", label: "Free", badge: "badge-free" };
  };

  /* ================= card renderers ================= */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  AKD.el = el;

  AKD.badge = function (cls, text) { return el("span", "badge " + cls, text); };

  AKD.entryBadges = function (entry) {
    const row = el("div", "tool-badges");
    const tier = AKD.tier(entry);
    row.appendChild(AKD.badge(tier.badge, tier.label));
    if (entry.student) row.appendChild(AKD.badge("badge-student", "Student"));
    if (entry.confidence !== "official") row.appendChild(AKD.badge("badge-verify", "Verify"));
    return row;
  };

  AKD.toolCard = function (entry, opts) {
    const o = opts || {};
    const cats = catIndex && catIndex.byIdCache;
    const cat = cats ? cats[entry.category] : null;
    const card = el("a", "tool-card" + (entry.featured ? " featured-star" : ""));
    card.href = "tool.html?id=" + encodeURIComponent(entry.id);
    card.style.setProperty("--cat", (cat && cat.color) || "var(--primary)");

    const head = el("div", "tool-head");
    head.appendChild(el("span", "tool-emoji", (cat && cat.emoji) || "🧩"));
    const idline = el("div", "tool-idline");
    idline.appendChild(el("span", "tool-provider", entry.provider));
    idline.appendChild(el("div", "tool-name", entry.product));
    head.appendChild(idline);
    card.appendChild(head);

    if (o.showBadges !== false) card.appendChild(AKD.entryBadges(entry));

    const bullets = o.bullets != null ? o.bullets : 2;
    if (bullets > 0 && (entry.what_free || []).length) {
      const list = el("ul", "free-list");
      entry.what_free.slice(0, bullets).forEach((item) => list.appendChild(el("li", null, item)));
      card.appendChild(list);
    }

    const meta = el("div", "tool-meta");
    const price = AKD.priceLabel(entry);
    meta.appendChild(el("span", "tool-price", price ? "Paid: " + price : (AKD.tier(entry).id === "oss" ? "Free forever" : "Free tier")));
    meta.appendChild(el("span", null, "checked " + entry.last_verified));
    card.appendChild(meta);
    return card;
  };

  /* ================= ticker ================= */
  AKD.buildTicker = function (elId) {
    const holder = document.getElementById(elId);
    if (!holder) return;
    AKD.getServices().then((s) => {
      AKD.getCategories().then((cats) => {
        const counts = {};
        s.list.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
        const items = cats.list
          .filter((c) => counts[c.id])
          .map((c) => {
            const item = el("span", "ticker-item");
            item.style.setProperty("--cat", c.color);
            item.appendChild(el("span", "dot"));
            item.appendChild(document.createTextNode(c.emoji + " " + c.name + " · " + counts[c.id] + " free ways in"));
            return item;
          });
        const track = el("div", "ticker-track");
        items.forEach((i) => track.appendChild(i));
        items.forEach((i) => track.appendChild(i.cloneNode(true)));
        holder.replaceChildren(track);
      });
    });
  };

  /* ================= stat fill ================= */
  AKD.fillStats = function () {
    const nodes = document.querySelectorAll("[data-stat-key]");
    if (!nodes.length) return;
    AKD.getServices().then((s) => {
      const all = s.list;
      const counts = {
        services: all.length,
        free: all.filter((e) => e.free_tier_exists).length,
        oss: all.filter((e) => e.oss).length,
        student: all.filter((e) => e.student).length,
        ai: all.filter((e) => e.category === "ai" || e.category.startsWith("ai-")).length,
        guides: 0
      };
      AKD.getMeta("guides").then((g) => {
        if (g && g.guides) {
          counts.guides = g.guides.length;
        }
        nodes.forEach((node) => {
          const key = node.dataset.statKey;
          if (key && counts[key] !== undefined) AKD.countUp(node, counts[key], { suffix: node.dataset.suffix || "+" });
        });
        nodes.forEach((node) => { if (!node.textContent || node.textContent === "—") node.textContent = "·"; });
      });
    });
  };
  if (document.querySelectorAll("[data-stat-key]").length) AKD.fillStats();

  /* ================= homepage builders ================= */
  AKD.buildCatGrid = function (elId, opts) {
    const holder = document.getElementById(elId);
    if (!holder) return;
    const o = opts || {};
    AKD.getCategories().then((cats) => {
      AKD.getServices().then((s) => {
        if (AKD.failed()) { AKD.showDataError(holder); return; }
        const counts = {};
        s.list.forEach((e) => {
          counts[e.category] = (counts[e.category] || 0) + 1;
          if (e.category === "ai" || e.category.startsWith("ai-")) counts.ai = (counts.ai || 0) + 1;
        });
        const list = cats.list
          .map((c) => ({ c, n: c.id === "ai" ? counts.ai : counts[c.id] || 0 }))
          .filter((x) => x.n > 0)
          .sort((a, b) => b.n - a.n);
        const shown = o.limit ? list.slice(0, o.limit) : list;
        const frag = document.createDocumentFragment();
        shown.forEach(({ c, n }, i) => {
          const card = AKD.el("a", "cat-card reveal");
          card.style.setProperty("--cat", c.color);
          card.style.setProperty("--d", (i % 4) * 0.06 + "s");
          card.href = (o.href || "directory.html") + "?cat=" + encodeURIComponent(c.id);
          card.appendChild(AKD.el("span", "cat-emoji", c.emoji));
          card.appendChild(AKD.el("h3", null, c.name));
          card.appendChild(AKD.el("p", null, c.blurb));
          const foot = AKD.el("div", "cat-foot");
          foot.appendChild(AKD.el("b", null, n + " free ways in"));
          foot.appendChild(AKD.el("span", null, "browse →"));
          card.appendChild(foot);
          frag.appendChild(card);
        });
        holder.replaceChildren(frag);
        holder.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      });
    });
  };

  AKD.buildFeatured = function (elId, limit) {
    const holder = document.getElementById(elId);
    if (!holder) return;
    AKD.getServices().then((s) => {
      if (AKD.failed()) { AKD.showDataError(holder); return; }
      const featured = s.list.filter((e) => e.featured && e.free_tier_exists);
      holder.replaceChildren();
      featured.slice(0, limit || 12).forEach((e) => holder.appendChild(AKD.toolCard(e, { bullets: 2 })));
    });
  };

  AKD.buildStacks = function (elId, featuredOnly) {
    const holder = document.getElementById(elId);
    if (!holder) return;
    AKD.getMeta("stacks").then((data) => {
      const stacks = ((data && data.stacks) || []).filter((x) => !featuredOnly || x.featured);
      if (!stacks.length) { AKD.showDataError(holder); return; }
      holder.replaceChildren();
      stacks.forEach((stack) => {
        const card = AKD.el("article", "stack-card reveal");
        const head = AKD.el("header");
        head.appendChild(AKD.el("h3", null, stack.name));
        head.appendChild(AKD.el("p", null, stack.tagline));
        head.appendChild(AKD.badge("badge-free", stack.budget || "$0"));
        card.appendChild(head);
        const layers = AKD.el("div", "stack-layers");
        (stack.layers || []).forEach((layer) => {
          const row = AKD.el("div", "stack-layer");
          row.appendChild(AKD.el("span", "name", layer.layer));
          const pick = AKD.el("span", "pick", layer.pick);
          if (layer.detail) {
            const small = AKD.el("small", null, layer.detail);
            pick.appendChild(small);
          }
          row.appendChild(pick);
          row.appendChild(AKD.el("span", "cost", layer.cost));
          layers.appendChild(row);
        });
        card.appendChild(layers);
        if ((stack.outgrow || []).length) {
          const out = AKD.el("div", "stack-outgrow");
          out.appendChild(AKD.el("span", "label", "When you outgrow it"));
          const ul = AKD.el("ul");
          stack.outgrow.forEach((x) => ul.appendChild(AKD.el("li", null, x)));
          out.appendChild(ul);
          card.appendChild(out);
        }
        holder.appendChild(card);
        requestAnimationFrame(() => card.classList.add("visible"));
      });
    });
  };

  AKD.buildGuideTeasers = function (elId, limit) {
    const holder = document.getElementById(elId);
    if (!holder) return;
    AKD.getMeta("guides").then((data) => {
      const guides = (data && data.guides) || [];
      holder.replaceChildren();
      guides.slice(0, limit || 3).forEach((g) => {
        const card = AKD.el("a", "guide-card reveal");
        card.href = "guide.html?id=" + encodeURIComponent(g.id);
        card.appendChild(AKD.el("span", "guide-level " + g.level, g.level));
        card.appendChild(AKD.el("h3", null, g.title));
        card.appendChild(AKD.el("p", "outcome", g.outcome));
        const foot = AKD.el("div", "guide-foot");
        foot.appendChild(AKD.el("span", null, "⏱ " + g.time + " · " + (g.steps || []).length + " steps"));
        foot.appendChild(AKD.el("span", "go", "Start →"));
        card.appendChild(foot);
        holder.appendChild(card);
        requestAnimationFrame(() => card.classList.add("visible"));
      });
    });
  };

  AKD.buildBudget = function () {
    const range = document.getElementById("budgetRange");
    if (!range) return;
    const currency = document.getElementById("budgetCurrency");
    const output = document.getElementById("budgetOutput");
    const adviceTitle = document.getElementById("budgetAdviceTitle");
    const advice = document.getElementById("budgetAdvice");
    const tags = document.getElementById("budgetTags");
    const picks = document.getElementById("budgetPicks");

    const BANDS = [
      { max: 0, title: "Start with what is free.", copy: "Everything below runs on genuinely free tiers. Track usage limits before depending on any service — and set billing alerts the day you add a card.", band: "zero", tags: ["Open source", "Free tiers", "Student access"] },
      { max: 5000, title: "One upgrade, chosen well.", copy: "Your first real spend should buy exactly one bottleneck: a small VPS you control, a paid AI API, or the tool that saves you hours. One at a time.", band: "low", tags: ["Pick one bottleneck", "Cheap VPS", "Usage caps"] },
      { max: 25000, title: "Room to run real things.", copy: "Upgrade the platform your product depends on: always-on hosting, bigger databases, better AI tools. Keep a reserve for usage-based surprises.", band: "mid", tags: ["Pro hosting", "Bigger database", "AI tooling"] },
      { max: Infinity, title: "Think in total cost of ownership.", copy: "Beyond hosting, budget for observability, security, support and growth. Compare platforms on outages and migration cost — not just sticker price.", band: "high", tags: ["Observability", "Reliability", "Growth buffer"] }
    ];

    let servicesById = {};
    let stacksData = { budget_picks: {} };
    AKD.getServices().then((s) => { servicesById = s.byId; paint(); });
    AKD.getMeta("stacks").then((d) => { stacksData = d || stacksData; paint(); });

    function paint() {
      const amount = Number(range.value);
      const cur = currency.value;
      output.textContent = cur + new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount);
      const band = BANDS.find((b) => amount <= b.max);
      adviceTitle.textContent = band.title;
      advice.textContent = band.copy;
      tags.replaceChildren(...band.tags.map((t) => AKD.el("span", null, t)));
      picks.replaceChildren();
      const ids = (stacksData.budget_picks || {})[band.band] || [];
      const entries = ids.map((id) => servicesById[id]).filter(Boolean);
      if (!entries.length) {
        picks.appendChild(AKD.el("p", "disclaimer", "Loading suggestions…"));
        return;
      }
      entries.slice(0, 6).forEach((entry) => {
        const row = AKD.el("div", "budget-pick");
        row.appendChild(AKD.el("b", null, entry.product));
        const label = band.band === "zero" && entry.free_tier_exists
          ? "free tier: " + (entry.free_tier_name || "yes")
          : (AKD.priceLabel(entry) || "free");
        row.appendChild(AKD.el("span", null, label));
        picks.appendChild(row);
      });
    }
    range.addEventListener("input", paint);
    currency.addEventListener("change", paint);
    paint();
  };
  AKD.buildBudget();

  /* ================= error notice ================= */
  AKD.showDataError = function (container) {
    if (!container) return;
    container.replaceChildren();
    const box = el("div", "empty-state");
    box.appendChild(el("div", "big", "📡"));
    box.appendChild(el("p", null, "Could not load the data files. If you opened the site from the filesystem, serve it over HTTP instead (e.g. `python -m http.server`) and refresh."));
    container.appendChild(box);
  };

  /* ================= region chips in headers ================= */
  function refreshRegionChips() {
    const code = AKD.currencyCode();
    const meta = AKD.currencyMeta(code);
    const r = AKD.region.get();
    document.querySelectorAll(".region-chip").forEach((chip) => {
      const flagEl = chip.querySelector(".flag");
      const labelEl = chip.querySelector(".cur-label");
      if (labelEl) labelEl.textContent = code;
      if (flagEl) flagEl.textContent = r ? (regionFlag(r.code) || (meta ? meta.symbol : "🌐")) : "🌐";
    });
  }
  function regionFlag(code) {
    // fallback: build flag emoji from ISO code (works for most countries)
    if (!code || code === "EU") return code === "EU" ? "🇪🇺" : "";
    try {
      return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
    } catch (e) { return ""; }
  }
  document.addEventListener("akd:fxready", refreshRegionChips);
  AKD.onRegionChange(refreshRegionChips);
  if (document.readyState !== "loading") refreshRegionChips();
  else document.addEventListener("DOMContentLoaded", refreshRegionChips);
})();
