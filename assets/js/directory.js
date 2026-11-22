"use strict";
/* allknowdev v2 — directory page.
   Instant search + category/tier/oss/student filters + sort, URL-synced,
   batched rendering, currency-aware price labels. */

(function () {
  const grid = document.getElementById("toolGrid");
  if (!grid) return;

  const searchInput = document.getElementById("dirSearch");
  const catRow = document.getElementById("catRow");
  const tierSelect = document.getElementById("tierSelect");
  const ossChip = document.getElementById("ossChip");
  const studentChip = document.getElementById("studentChip");
  const sortSelect = document.getElementById("sortSelect");
  const countEl = document.getElementById("resultCount");
  const moreBtn = document.getElementById("moreBtn");
  const PAGE = 24;

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get("q") || "",
    cat: params.get("cat") || "all",
    tier: params.get("tier") || "all",
    oss: params.get("oss") === "1",
    student: params.get("student") === "1",
    sort: params.get("sort") || "featured"
  };
  let shown = PAGE;

  function syncURL() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cat !== "all") p.set("cat", state.cat);
    if (state.tier !== "all") p.set("tier", state.tier);
    if (state.oss) p.set("oss", "1");
    if (state.student) p.set("student", "1");
    if (state.sort !== "featured") p.set("sort", state.sort);
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  function matches(entry) {
    if (state.cat !== "all") {
      if (state.cat === "ai") { if (!(entry.category === "ai" || entry.category.startsWith("ai-"))) return false; }
      else if (entry.category !== state.cat) return false;
    }
    if (state.tier !== "all" && AKD.tier(entry).id !== state.tier) return false;
    if (state.oss && !entry.oss) return false;
    if (state.student && !entry.student) return false;
    if (state.q) {
      const q = state.q.toLowerCase();
      const hay = [entry.product, entry.provider, entry.best_for || "", (entry.tags || []).join(" "), (entry.what_free || []).join(" "), entry.category].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function sortList(list) {
    const by = state.sort;
    if (by === "az") return [...list].sort((a, b) => a.product.localeCompare(b.product));
    if (by === "new") return [...list].sort((a, b) => (b.last_verified || "").localeCompare(a.last_verified || ""));
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  function render(list) {
    grid.replaceChildren();
    if (!list.length) {
      const empty = AKD.el("div", "empty-state");
      empty.appendChild(AKD.el("div", "big", "🔍"));
      empty.appendChild(AKD.el("p", null, "Nothing matches those filters — try a broader search."));
      grid.appendChild(empty);
    } else {
      list.slice(0, shown).forEach((entry) => grid.appendChild(AKD.toolCard(entry)));
    }
    countEl.replaceChildren();
    countEl.appendChild(document.createElement("b")).textContent = list.length;
    countEl.appendChild(document.createTextNode(" services" + (state.q ? " for \u201C" + state.q + "\u201D" : "")));
    moreBtn.style.display = list.length > shown ? "" : "none";
    moreBtn.textContent = "Load " + Math.min(PAGE, list.length - shown) + " more ↓";
  }

  function update() {
    syncURL();
    AKD.getServices().then((s) => {
      if (AKD.failed()) { AKD.showDataError(grid); return; }
      render(sortList(s.list.filter(matches)));
    });
  }

  /* controls */
  searchInput.value = state.q;
  let debounce = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.q = searchInput.value.trim(); shown = PAGE; update(); }, 130);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
  });

  tierSelect.value = state.tier;
  tierSelect.addEventListener("change", () => { state.tier = tierSelect.value; shown = PAGE; update(); });

  sortSelect.value = state.sort;
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; update(); });

  ossChip.classList.toggle("active", state.oss);
  ossChip.addEventListener("click", () => { state.oss = !state.oss; ossChip.classList.toggle("active", state.oss); shown = PAGE; update(); });

  studentChip.classList.toggle("active", state.student);
  studentChip.addEventListener("click", () => { state.student = !state.student; studentChip.classList.toggle("active", state.student); shown = PAGE; update(); });

  moreBtn.addEventListener("click", () => { shown += PAGE; update(); });

  AKD.getCategories().then((cats) => {
    AKD.getServices().then((s) => {
      if (AKD.failed()) return;
      const counts = {};
      s.list.forEach((e) => {
        counts[e.category] = (counts[e.category] || 0) + 1;
        if (e.category === "ai" || e.category.startsWith("ai-")) counts.ai = (counts.ai || 0) + 1;
      });
      const chips = [];
      const all = AKD.el("button", "chip" + (state.cat === "all" ? " active" : ""));
      all.type = "button";
      all.textContent = "All · " + s.list.length;
      all.addEventListener("click", () => { state.cat = "all"; shown = PAGE; setActive(all); update(); });
      chips.push(all);

      cats.list.forEach((c) => {
        const n = counts[c.id] || 0;
        if (!n) return;
        const chip = AKD.el("button", "chip" + (state.cat === c.id ? " active" : ""));
        chip.type = "button";
        chip.textContent = c.emoji + " " + c.name;
        const cnt = AKD.el("span", "chip-count", String(n));
        chip.appendChild(cnt);
        chip.addEventListener("click", () => { state.cat = c.id; shown = PAGE; setActive(chip); update(); });
        chips.push(chip);
      });

      function setActive(btn) {
        catRow.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
      catRow.replaceChildren(...chips);
    });
  });

  // currency change → re-render prices
  AKD.onRegionChange(() => update());

  update();
})();
