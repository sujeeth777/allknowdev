"use strict";
/* allknowdev v1.0 — shared behaviours + homepage data modules.
   Fetches data/*.json for counters, highlights, comparisons, stacks and the
   budget explorer. Everything is guarded, so child pages stay lightweight. */

(function () {
  /* ---------- mobile navigation ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    const close = () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    };
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    window.addEventListener("resize", () => { if (innerWidth > 760) close(); });
  }

  /* ---------- footer year ---------- */
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- reveal animations ---------- */
  const reveal = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
    }), { threshold: 0.12 });
    reveal.forEach((item) => observer.observe(item));
  } else {
    reveal.forEach((item) => item.classList.add("visible"));
  }

  /* ---------- homepage data modules ---------- */
  const DATA_FILES = ["ai-ml.json", "cloud-hosting.json", "databases-auth.json", "devtools.json", "apis-services.json", "learning.json", "design.json"];
  const SYMBOLS = { USD: "$", EUR: "\u20AC", GBP: "\u00A3", INR: "\u20B9" };
  let index = null;       // id -> entry
  let stacks = null;      // stacks.json contents

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function money(entry) {
    const paid = entry.paid_from;
    if (!paid) return null;
    const symbol = SYMBOLS[paid.currency] || (paid.currency ? paid.currency + " " : "");
    if (typeof paid.amount === "number") {
      const suffix = paid.period === "once" ? " one-time"
        : paid.period === "transaction" ? "+ per transaction"
        : "/" + (paid.period || "mo").replace("month", "mo");
      return "from " + symbol + paid.amount + suffix;
    }
    return paid.plan || null;
  }

  function badge(cls, text) { return el("span", "badge " + cls, text); }

  function loadData() {
    if (index !== null) return Promise.resolve();
    const files = DATA_FILES.map((f) => fetch("data/" + f).then((r) => {
      if (!r.ok) throw new Error(f + ": HTTP " + r.status);
      return r.json();
    }));
    const stackFile = fetch("data/stacks.json").then((r) => { if (!r.ok) throw new Error("stacks.json"); return r.json(); });
    return Promise.all([Promise.all(files), stackFile]).then(([lists, stackData]) => {
      index = {};
      lists.flat().forEach((entry) => { index[entry.id] = entry; });
      stacks = stackData;
    }).catch(() => {
      index = {};
      stacks = { stacks: [], budget_picks: {} };
    });
  }

  /* ----- hero counters ----- */
  const heroStats = document.getElementById("heroStats");
  if (heroStats) {
    loadData().then(() => {
      const all = Object.values(index);
      const counts = {
        services: all.length,
        free: all.filter((e) => e.free_tier_exists).length,
        oss: all.filter((e) => e.oss).length,
        student: all.filter((e) => e.student).length
      };
      heroStats.querySelectorAll("[data-count]").forEach((node) => {
        const value = counts[node.dataset.count];
        if (value !== undefined) node.textContent = value + "+";
      });
    });
  }

  /* ----- featured free tiers ----- */
  const highlightGrid = document.getElementById("highlightGrid");
  if (highlightGrid) {
    loadData().then(() => {
      const featured = Object.values(index).filter((e) => e.featured && e.free_tier_exists).slice(0, 6);
      if (!featured.length) { highlightGrid.textContent = "Featured picks unavailable."; return; }
      highlightGrid.replaceChildren();
      featured.forEach((entry) => {
        const card = el("a", "hl-card");
        card.href = "pages/directory.html#" + entry.category;
        card.appendChild(el("span", "provider", entry.provider));
        card.appendChild(el("h3", null, entry.product));
        const badgeRow = el("div", "badge-row");
        if (entry.oss) badgeRow.appendChild(badge("badge-oss", "OSS"));
        if (entry.student) badgeRow.appendChild(badge("badge-student", "Student"));
        if (entry.confidence !== "official") badgeRow.appendChild(badge("badge-volatile", "Verify"));
        if (badgeRow.children.length) card.appendChild(badgeRow);
        const list = el("ul", "hl-free");
        (entry.what_free || []).slice(0, 3).forEach((item) => list.appendChild(el("li", null, item)));
        card.appendChild(list);
        const meta = el("div", "hl-meta");
        const price = money(entry);
        meta.appendChild(el("span", "hl-price", price ? "Paid " + price : "Free forever"));
        meta.appendChild(badge("badge-muted", "checked " + entry.last_verified));
        card.appendChild(meta);
        highlightGrid.appendChild(card);
      });
    });
  }

  /* ----- free vs paid comparisons ----- */
  const COMPARE_IDS = ["vercel", "supabase", "github-copilot"];
  const compareGrid = document.getElementById("compareGrid");
  if (compareGrid) {
    loadData().then(() => {
      const picks = COMPARE_IDS.map((id) => index[id]).filter(Boolean);
      if (!picks.length) { compareGrid.textContent = "Comparisons unavailable."; return; }
      compareGrid.replaceChildren();
      picks.forEach((entry) => {
        const card = el("article", "compare-card");
        const head = el("div", "compare-head");
        head.appendChild(el("span", "provider", entry.provider));
        head.appendChild(el("h3", null, entry.product));
        card.appendChild(head);
        const cols = el("div", "compare-cols");
        const freeCol = el("div", "compare-col free");
        freeCol.appendChild(el("h4", null, "At $0"));
        const price0 = el("span", "price free-price", entry.free_tier_name || "Free");
        freeCol.appendChild(price0);
        const freeList = el("ul");
        (entry.what_free || []).slice(0, 3).forEach((item) => freeList.appendChild(el("li", null, item)));
        freeCol.appendChild(freeList);
        cols.appendChild(freeCol);
        const paidCol = el("div", "compare-col paid");
        paidCol.appendChild(el("h4", null, "When you pay"));
        const price = money(entry);
        paidCol.appendChild(el("span", "price", price || "pay-per-use"));
        const paidList = el("ul");
        (entry.what_paid || []).slice(0, 3).forEach((item) => paidList.appendChild(el("li", null, item)));
        paidCol.appendChild(paidList);
        cols.appendChild(paidCol);
        card.appendChild(cols);
        const foot = el("div", "compare-foot");
        foot.appendChild(el("span", "disclaimer", "checked " + entry.last_verified));
        const link = el("a", null, "Official pricing ↗");
        link.href = entry.pricing_url || entry.official_url;
        foot.appendChild(link);
        card.appendChild(foot);
        compareGrid.appendChild(card);
      });
    });
  }

  /* ----- $0 stacks ----- */
  const stacksGrid = document.getElementById("stacksGrid");
  if (stacksGrid) {
    loadData().then(() => {
      const list = (stacks.stacks || []).filter((s) => s.featured).slice(0, 4);
      if (!list.length) { stacksGrid.textContent = "Stacks unavailable."; return; }
      stacksGrid.replaceChildren();
      list.forEach((stack) => {
        const card = el("article", "stack-card");
        const head = el("header");
        head.appendChild(el("h3", null, stack.name));
        head.appendChild(el("p", null, stack.tagline));
        head.appendChild(el("span", "badge badge-free", stack.budget || "$0"));
        card.appendChild(head);
        const layers = el("div", "stack-layers");
        (stack.layers || []).forEach((layer) => {
          const row = el("div", "stack-layer");
          row.appendChild(el("span", "name", layer.layer));
          row.appendChild(el("span", "pick", layer.pick));
          row.appendChild(el("span", "cost", layer.cost));
          layers.appendChild(row);
        });
        card.appendChild(layers);
        if (stack.outgrow && stack.outgrow.length) {
          const out = el("div", "stack-outgrow");
          out.appendChild(el("span", "label", "When you outgrow it"));
          const outList = el("ul");
          stack.outgrow.forEach((item) => outList.appendChild(el("li", null, item)));
          out.appendChild(outList);
          card.appendChild(out);
        }
        stacksGrid.appendChild(card);
      });
    });
  }

  /* ----- budget explorer (data-driven) ----- */
  const range = document.getElementById("budgetRange");
  const currency = document.getElementById("budgetCurrency");
  const output = document.getElementById("budgetOutput");
  const adviceTitle = document.getElementById("budgetAdviceTitle");
  const advice = document.getElementById("budgetAdvice");
  const tags = document.getElementById("budgetTags");
  const picks = document.getElementById("budgetPicks");

  const BANDS = [
    {
      max: 0,
      title: "Start with what is free.",
      copy: "Everything below runs on genuinely free tiers. Track usage limits before depending on any service — and set billing alerts the day you add a card.",
      tags: ["Open source", "Free tiers", "Student access"],
      band: "zero"
    },
    {
      max: 5000,
      title: "One upgrade, chosen well.",
      copy: "Your first real spend should buy exactly one bottleneck: a small VPS you control, a paid AI API, or the tools that save you hours. One at a time.",
      tags: ["Pick one bottleneck", "Cheap VPS", "Usage caps"],
      band: "low"
    },
    {
      max: 25000,
      title: "Room to run real things.",
      copy: "Upgrade the platform your product depends on: always-on hosting, bigger databases, better AI tools. Keep a reserve for usage-based surprises.",
      tags: ["Pro hosting", "Bigger database", "AI tooling"],
      band: "mid"
    },
    {
      max: Infinity,
      title: "Think in total cost of ownership.",
      copy: "Beyond hosting, budget for observability, security, support and growth. Compare platforms on outages and migration cost — not just the sticker price.",
      tags: ["Observability", "Reliability", "Growth buffer"],
      band: "high"
    }
  ];

  function formatPick(entry) {
    const price = money(entry);
    return price || "free";
  }

  function updateBudget() {
    if (!range || !output || !currency) return;
    const amount = Number(range.value);
    output.textContent = currency.value + new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount);
    const band = BANDS.find((b) => amount <= b.max);
    if (adviceTitle) adviceTitle.textContent = band.title;
    if (advice) advice.textContent = band.copy;
    if (tags) {
      tags.replaceChildren(...band.tags.map((t) => {
        const chip = el("span", null, t);
        return chip;
      }));
    }
    if (picks) {
      picks.replaceChildren();
      const ids = (stacks && stacks.budget_picks && stacks.budget_picks[band.band]) || [];
      const entries = ids.map((id) => index && index[id]).filter(Boolean);
      if (!entries.length) {
        picks.appendChild(el("p", "disclaimer", "Loading suggestions…"));
      } else {
        entries.slice(0, 6).forEach((entry) => {
          const row = el("div", "budget-pick");
          const name = el("b", null, entry.product);
          row.appendChild(name);
          const isZeroBand = band.band === "zero";
          const label = isZeroBand && entry.free_tier_exists
            ? "free tier: " + (entry.free_tier_name || "yes")
            : formatPick(entry);
          row.appendChild(el("span", null, label));
          picks.appendChild(row);
        });
      }
    }
  }

  if (range) {
    range.addEventListener("input", updateBudget);
    currency.addEventListener("change", updateBudget);
    loadData().then(updateBudget);
    updateBudget();
  }
})();
