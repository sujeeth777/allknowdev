"use strict";
/* allknowdev v2 — tool detail page (tool.html?id=<id>). */

(function () {
  const root = document.getElementById("toolDetail");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");

  Promise.all([AKD.getServices(), AKD.getCategories()]).then(([s, cats]) => {
    root.replaceChildren();
    if (AKD.failed()) { AKD.showDataError(root); return; }
    const entry = s.byId[id];
    const cat = entry ? (cats.byId[entry.category] || {}) : null;

    if (!entry) {
      document.title = "Tool not found — allknowdev";
      const box = AKD.el("div", "empty-state");
      box.appendChild(AKD.el("div", "big", "🤔"));
      box.appendChild(AKD.el("p", null, "No service with that id. It may have been renamed — browse the directory instead."));
      const back = AKD.el("a", "btn btn-primary", "Open the directory →");
      back.href = "directory.html";
      box.appendChild(back);
      root.replaceChildren(box);
      return;
    }

    document.title = entry.product + " — free tier, limits and pricing | allknowdev";
    const tier = AKD.tier(entry);

    /* hero */
    const hero = AKD.el("div", "tool-hero container");
    if (cat) hero.style.setProperty("--cat", cat.color);
    const bc = AKD.el("nav", "breadcrumb");
    const home = AKD.el("a", null, "Home"); home.href = "index.html";
    const dir = AKD.el("a", null, "Directory"); dir.href = "directory.html";
    const catName = cat ? cat.name : entry.category;
    const catLink = AKD.el("a", null, catName); catLink.href = "directory.html?cat=" + encodeURIComponent(entry.category);
    bc.appendChild(home); bc.appendChild(AKD.el("span", "sep", "›"));
    bc.appendChild(dir); bc.appendChild(AKD.el("span", "sep", "›"));
    bc.appendChild(catLink);
    hero.appendChild(bc);

    const top = AKD.el("div", "tool-hero-top");
    top.appendChild(AKD.el("span", "tool-emoji", (cat && cat.emoji) || "🧩"));
    const idline = AKD.el("div");
    idline.appendChild(AKD.el("span", "tool-provider", entry.provider));
    idline.appendChild(AKD.el("h1", null, entry.product));
    top.appendChild(idline);
    hero.appendChild(top);

    hero.appendChild(AKD.entryBadges(entry));
    if (entry.best_for) {
      const sub = AKD.el("p", "tool-hero-sub");
      sub.appendChild(document.createTextNode("Best for: "));
      const b = AKD.el("strong", null, entry.best_for);
      sub.appendChild(b);
      hero.appendChild(sub);
    }
    if ((entry.tags || []).length) {
      const tags = AKD.el("div", "tool-badges");
      entry.tags.forEach((t) => tags.appendChild(AKD.badge("badge-muted", t)));
      hero.appendChild(tags);
    }
    const links = AKD.el("div", "tool-hero-links");
    const official = AKD.el("a", "btn btn-primary", "Official site ↗");
    official.href = entry.official_url; official.target = "_blank"; official.rel = "noreferrer";
    links.appendChild(official);
    if (entry.pricing_url) {
      const pricing = AKD.el("a", "btn btn-ghost", "Official pricing ↗");
      pricing.href = entry.pricing_url; pricing.target = "_blank"; pricing.rel = "noreferrer";
      links.appendChild(pricing);
    }
    const report = AKD.el("a", "btn btn-ghost", "Report a change");
    report.href = AKD.REPO_NEW_ISSUE + "?title=" + encodeURIComponent("Outdated data: " + entry.product)
      + "&body=" + encodeURIComponent("Entry id: " + entry.id + "\nWhat changed: \nSource: ");
    links.appendChild(report);
    hero.appendChild(links);
    root.appendChild(hero);

    /* fact strip + panels */
    const main = AKD.el("div", "container");
    const facts = AKD.el("div", "fact-strip");
    facts.appendChild(fact("Tier", tier.label));
    facts.appendChild(fact("Free tier", entry.free_tier_exists ? (entry.free_tier_name || "Yes") : "No free tier"));
    const cur = AKD.currencyCode();
    const price = AKD.priceLabel(entry, cur);
    facts.appendChild(fact("Paid from", price || "—"));
    facts.appendChild(fact("Checked", entry.last_verified));
    main.appendChild(facts);

    const dgrid = AKD.el("div", "detail-grid");
    const freePanel = AKD.el("div", "detail-panel free");
    freePanel.appendChild(AKD.el("h3", null, "✅ What you get free"));
    const freeList = AKD.el("ul");
    (entry.what_free || []).forEach((i) => freeList.appendChild(AKD.el("li", null, i)));
    freePanel.appendChild(freeList);
    dgrid.appendChild(freePanel);

    const paidPanel = AKD.el("div", "detail-panel paid");
    paidPanel.appendChild(AKD.el("h3", null, "💳 What paying unlocks"));
    const paidList = AKD.el("ul");
    (entry.what_paid || []).forEach((i) => paidList.appendChild(AKD.el("li", null, i)));
    paidPanel.appendChild(paidList);
    dgrid.appendChild(paidPanel);

    if ((entry.watch_out || []).length) {
      const warn = AKD.el("div", "detail-panel warn");
      warn.appendChild(AKD.el("h3", null, "⚠️ Watch out"));
      const warnList = AKD.el("ul");
      entry.watch_out.forEach((i) => warnList.appendChild(AKD.el("li", null, i)));
      warn.appendChild(warnList);
      dgrid.appendChild(warn);
    }
    main.appendChild(dgrid);

    /* currency note */
    if (price && cur !== "USD") {
      const note = AKD.el("p", "disclaimer");
      note.textContent = "Prices converted from USD at a snapshot rate (" + AKD.currencyMeta(cur).name + "). The service bills in USD — your bank's rate and fees apply at checkout. ";
      const wl = AKD.el("a", "text-link", "Check your region →");
      wl.href = "world.html";
      note.appendChild(wl);
      main.appendChild(note);
    }

    /* related */
    const related = s.list.filter((e) => e.category === entry.category && e.id !== entry.id);
    if (related.length) {
      const sec = AKD.el("section", "section tight");
      sec.appendChild(AKD.el("h2", null, "Similar in " + (cat ? cat.name : "this category")));
      const grid = AKD.el("div", "tool-grid");
      related.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 4)
        .forEach((e) => grid.appendChild(AKD.toolCard(e)));
      sec.appendChild(grid);
      main.appendChild(sec);
    }
    root.appendChild(main);

    function fact(label, value) {
      const f = AKD.el("div", "fact");
      f.appendChild(AKD.el("span", null, label));
      f.appendChild(AKD.el("b", null, value));
      return f;
    }
  });
})();
