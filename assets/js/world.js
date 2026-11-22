"use strict";
/* allknowdev v2 — world page (world.html).
   Pick your country → currency conversion for real prices + availability,
   privacy-law and payments notes for your region. */

(function () {
  const regionGrid = document.getElementById("regionGrid");
  if (!regionGrid) return;

  const details = document.getElementById("regionDetails");
  const currencyPanel = document.getElementById("currencyPanel");
  const currencySelect = document.getElementById("currencySelect");
  const priceTableBody = document.getElementById("priceTableBody");
  const disclaimer = document.getElementById("regionDisclaimer");

  let regions = [];
  let fx = null;
  let current = AKD.region.get() ? AKD.region.get().code : null;

  Promise.all([AKD.getMeta("regions"), AKD.getMeta("fx"), AKD.getServices()]).then(([r, f, s]) => {
    regions = (r && r.regions) || [];
    fx = f;
    if (disclaimer && r && r.disclaimer) disclaimer.textContent = r.disclaimer;

    // currency dropdown
    if (currencySelect && fx) {
      fx.currencies.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.code;
        opt.textContent = c.symbol + " " + c.code + " — " + c.name;
        currencySelect.appendChild(opt);
      });
      currencySelect.value = AKD.currencyCode();
      currencySelect.addEventListener("change", () => {
        // manual currency override: store pseudo-region {code: null, currency}
        try { localStorage.setItem("akd-region", JSON.stringify({ code: current, currency: currencySelect.value })); } catch (e) { /* ignore */ }
        paintPrices(s.list);
      });
    }

    // region buttons
    regions.forEach((reg) => {
      const btn = AKD.el("button", "region-card" + (reg.code === current ? " active" : ""));
      btn.type = "button";
      btn.appendChild(AKD.el("span", "flag", reg.flag));
      btn.appendChild(AKD.el("b", null, reg.name));
      btn.appendChild(AKD.el("span", null, (AKD.currencyMeta(AKD.currencyForRegion(reg.code)) || {}).code || "USD"));
      btn.addEventListener("click", () => {
        current = reg.code;
        AKD.region.set(reg.code);
        regionGrid.querySelectorAll(".region-card").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        paintRegion(reg);
        if (currencySelect) currencySelect.value = AKD.currencyCode();
        paintPrices(s.list);
      });
      regionGrid.appendChild(btn);
    });

    // stored region?
    const stored = current && regions.find((x) => x.code === current);
    if (stored) paintRegion(stored);
    paintPrices(s.list);
  });

  function paintRegion(reg) {
    details.replaceChildren();
    details.appendChild(AKD.el("h2", null, reg.flag + " " + reg.name + " — what you should know"));

    const grid = AKD.el("div", "law-grid mt-lg");

    const avail = AKD.el("div", "law-card");
    avail.appendChild(AKD.el("span", "law-tag", "availability"));
    avail.appendChild(AKD.el("h3", null, "🌍 What works here"));
    const availList = AKD.el("ul");
    (reg.availability || []).forEach((a) => availList.appendChild(AKD.el("li", null, a)));
    avail.appendChild(availList);
    grid.appendChild(avail);

    if (reg.privacy) {
      const law = AKD.el("div", "law-card");
      law.appendChild(AKD.el("span", "law-tag", "privacy law"));
      law.appendChild(AKD.el("h3", null, "⚖️ " + reg.privacy.law));
      law.appendChild(AKD.el("p", null, reg.privacy.note));
      if (reg.privacy.url) {
        const link = AKD.el("a", "text-link", "Official source ↗");
        link.href = reg.privacy.url; link.target = "_blank"; link.rel = "noreferrer";
        law.appendChild(link);
      }
      grid.appendChild(law);
    }

    if (reg.payments && reg.payments.length) {
      const pay = AKD.el("div", "law-card");
      pay.appendChild(AKD.el("span", "law-tag", "payments"));
      pay.appendChild(AKD.el("h3", null, "💳 Paying & getting paid"));
      const payList = AKD.el("ul");
      reg.payments.forEach((p) => payList.appendChild(AKD.el("li", null, p)));
      pay.appendChild(payList);
      grid.appendChild(pay);
    }

    details.appendChild(grid);
  }

  function paintPrices(list) {
    if (!priceTableBody) return;
    const cur = AKD.currencyCode();
    const picks = ["github-copilot", "chatgpt", "claude-ai", "notion", "canva", "vercel", "supabase", "netlify"];
    const rows = [];
    picks.forEach((pid) => {
      const e = list.find((x) => x.id === pid);
      if (!e || !e.paid_from || typeof e.paid_from.amount !== "number") return;
      const converted = AKD.convert(e.paid_from.amount, cur);
      if (converted == null) return;
      rows.push(priceRow(e, converted));
    });
    // add a few more interesting conversions from all data
    const extras = list
      .filter((e) => e.paid_from && typeof e.paid_from.amount === "number" && e.paid_from.amount >= 5)
      .filter((e) => !picks.includes(e.id))
      .sort((a, b) => a.paid_from.amount - b.paid_from.amount)
      .slice(0, 12);
    extras.forEach((e) => {
      const converted = AKD.convert(e.paid_from.amount, cur);
      if (converted == null) return;
      rows.push(priceRow(e, converted));
    });
    priceTableBody.replaceChildren(...rows);
    const headCur = document.getElementById("priceTableCur");
    if (headCur) headCur.textContent = cur;
  }

  function priceRow(e, converted) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = e.product;
    const plan = document.createElement("td");
    plan.textContent = e.paid_from.plan || "Paid plan";
    const usd = document.createElement("td");
    usd.className = "num";
    usd.textContent = "$" + e.paid_from.amount + "/mo";
    const local = document.createElement("td");
    local.className = "num";
    local.textContent = AKD.formatMoney(converted, AKD.currencyCode()) + "/mo";
    tr.appendChild(name); tr.appendChild(plan); tr.appendChild(usd); tr.appendChild(local);
    return tr;
  }
})();
