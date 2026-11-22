"use strict";
/* allknowdev v2 — guides.
   learn.html  → filterable guide list + career paths.
   guide.html  → step-by-step guide with checkable steps and saved progress. */

(function () {
  const guideGrid = document.getElementById("guideGrid");
  if (guideGrid) renderGuideList(guideGrid);

  const guideBody = document.getElementById("guideBody");
  if (guideBody) renderGuideDetail(guideBody);

  /* ---------- list ---------- */
  function renderGuideList(grid) {
    let guides = [];
    let filter = "all";

    AKD.getMeta("guides").then((data) => {
      guides = (data && data.guides) || [];

      // level filter chips
      const chipRow = document.getElementById("guideFilters");
      if (chipRow) {
        [["all", "All guides"], ["beginner", "🌱 Beginner"], ["intermediate", "🚀 Intermediate"]].forEach(([id, label]) => {
          const chip = AKD.el("button", "chip" + (id === filter ? " active" : ""));
          chip.type = "button";
          chip.textContent = label;
          chip.addEventListener("click", () => {
            filter = id;
            chipRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            draw();
          });
          chipRow.appendChild(chip);
        });
      }

      // career paths strip
      const pathsRow = document.getElementById("pathRow");
      if (pathsRow && data.paths) {
        data.paths.forEach((p) => {
          const card = AKD.el("a", "cat-card");
          card.style.setProperty("--cat", "var(--primary)");
          card.href = p.link; card.target = "_blank"; card.rel = "noreferrer";
          card.appendChild(AKD.el("span", "cat-emoji", p.emoji));
          card.appendChild(AKD.el("h3", null, p.name));
          card.appendChild(AKD.el("p", null, p.blurb));
          const foot = AKD.el("div", "cat-foot");
          foot.appendChild(AKD.el("b", null, "roadmap.sh"));
          foot.appendChild(AKD.el("span", null, "open map ↗"));
          card.appendChild(foot);
          pathsRow.appendChild(card);
        });
        pathsRow.classList.add("visible");
      }

      draw();
    });

    function draw() {
      const list = guides.filter((g) => filter === "all" || g.level === filter);
      grid.replaceChildren();
      if (!list.length) {
        grid.appendChild(AKD.el("div", "empty-state", "No guides at this level yet — more are being written."));
        return;
      }
      list.forEach((g) => {
        const card = AKD.el("a", "guide-card");
        card.href = "guide.html?id=" + encodeURIComponent(g.id);
        card.appendChild(AKD.el("span", "guide-level " + g.level, g.level));
        card.appendChild(AKD.el("h3", null, g.title));
        card.appendChild(AKD.el("p", "outcome", g.outcome));
        const foot = AKD.el("div", "guide-foot");
        foot.appendChild(AKD.el("span", null, "⏱ " + g.time + " · " + (g.steps || []).length + " steps"));
        foot.appendChild(AKD.el("span", "go", "Start →"));
        card.appendChild(foot);
        grid.appendChild(card);
      });
    }
  }

  /* ---------- detail ---------- */
  function renderGuideDetail(root) {
    const id = new URLSearchParams(location.search).get("id");
    const PROG_KEY = "akd-guide-" + id;

    AKD.getMeta("guides").then((data) => {
      root.replaceChildren();
      const guide = ((data && data.guides) || []).find((g) => g.id === id);
      if (!guide) {
        document.title = "Guide not found — allknowdev";
        const box = AKD.el("div", "empty-state");
        box.appendChild(AKD.el("div", "big", "🧭"));
        box.appendChild(AKD.el("p", null, "No guide with that id."));
        const back = AKD.el("a", "btn btn-primary", "All guides →");
        back.href = "learn.html";
        box.appendChild(back);
        root.replaceChildren(box);
        return;
      }

      document.title = guide.title + " — step-by-step guide | allknowdev";

      let done = [];
      try { done = JSON.parse(localStorage.getItem(PROG_KEY) || "[]"); } catch (e) { done = []; }

      const hero = AKD.el("div", "guide-hero container");
      const bc = AKD.el("nav", "breadcrumb");
      const home = AKD.el("a", null, "Home"); home.href = "index.html";
      const learn = AKD.el("a", null, "Learn"); learn.href = "learn.html";
      bc.appendChild(home); bc.appendChild(AKD.el("span", "sep", "›"));
      bc.appendChild(learn); bc.appendChild(AKD.el("span", "sep", "›"));
      bc.appendChild(document.createTextNode(guide.title));
      hero.appendChild(bc);

      const meta = AKD.el("div", "guide-meta");
      meta.appendChild(AKD.el("span", "guide-level " + guide.level, guide.level));
      meta.appendChild(AKD.badge("badge-muted", "⏱ " + guide.time));
      meta.appendChild(AKD.badge("badge-muted", (guide.steps || []).length + " steps"));
      hero.appendChild(meta);

      hero.appendChild(AKD.el("h1", null, guide.title));
      hero.appendChild(AKD.el("p", "guide-intro", guide.intro));

      const tools = AKD.el("div", "guide-tools");
      AKD.getServices().then((s) => {
        (guide.tool_ids || []).forEach((tid) => {
          const entry = s.byId[tid];
          const chip = AKD.el("a", null, entry ? entry.product : tid);
          chip.href = "tool.html?id=" + encodeURIComponent(tid);
          if (!entry) chip.title = "tool entry coming soon";
          tools.appendChild(chip);
        });
      });
      hero.appendChild(tools);

      // progress
      const wrap = AKD.el("div", "progress-wrap");
      const label = AKD.el("div", "progress-label");
      const labelLeft = AKD.el("span", null, "your progress");
      const labelRight = AKD.el("span", null, "");
      label.appendChild(labelLeft); label.appendChild(labelRight);
      wrap.appendChild(label);
      const bar = AKD.el("div", "progress-bar");
      const fill = AKD.el("i");
      bar.appendChild(fill);
      wrap.appendChild(bar);
      hero.appendChild(wrap);
      root.appendChild(hero);

      // steps
      const stepsEl = AKD.el("div", "steps container");
      (guide.steps || []).forEach((step, i) => {
        const node = AKD.el("article", "step");
        node.dataset.n = i + 1;
        const h = AKD.el("h3", null, step.title);
        const toggle = AKD.el("label", "step-done-toggle");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = done.includes(i);
        toggle.appendChild(cb);
        toggle.appendChild(document.createTextNode(" done"));
        h.appendChild(toggle);
        node.appendChild(h);
        node.appendChild(AKD.el("p", null, step.detail));
        if (step.tip) {
          const tip = AKD.el("p", "tip");
          tip.appendChild(AKD.el("b", null, "💡 Tip — "));
          tip.appendChild(document.createTextNode(step.tip));
          node.appendChild(tip);
        }
        if (step.link) {
          const linkRow = AKD.el("div", "step-link");
          const link = AKD.el("a", "text-link", "Open ↗");
          link.href = step.link; link.target = "_blank"; link.rel = "noreferrer";
          linkRow.appendChild(link);
          node.appendChild(linkRow);
        }
        cb.addEventListener("change", () => {
          if (cb.checked && !done.includes(i)) done.push(i);
          if (!cb.checked) done = done.filter((x) => x !== i);
          try { localStorage.setItem(PROG_KEY, JSON.stringify(done)); } catch (e) { /* ignore */ }
          node.classList.toggle("done", cb.checked);
          paint();
        });
        if (cb.checked) node.classList.add("done");
        stepsEl.appendChild(node);
      });
      root.appendChild(stepsEl);

      if ((guide.outgrow || []).length) {
        const out = AKD.el("div", "guide-outgrow container");
        out.appendChild(AKD.el("b", null, "🚀 When you outgrow the free path"));
        const ul = AKD.el("ul", "free-list");
        guide.outgrow.forEach((o) => ul.appendChild(AKD.el("li", null, o)));
        out.appendChild(ul);
        root.appendChild(out);
      }

      const foot = AKD.el("div", "container center mt-lg");
      const resetBtn = AKD.el("button", "btn btn-ghost btn-small", "↺ Reset progress");
      resetBtn.addEventListener("click", () => {
        done = [];
        try { localStorage.removeItem(PROG_KEY); } catch (e) { /* ignore */ }
        stepsEl.querySelectorAll(".step").forEach((s) => { s.classList.remove("done"); const c = s.querySelector("input"); if (c) c.checked = false; });
        paint();
      });
      foot.appendChild(resetBtn);
      const next = AKD.el("a", "btn btn-ghost btn-small", "More guides →");
      next.href = "learn.html";
      foot.appendChild(next);
      root.appendChild(foot);

      function paint() {
        const pct = Math.round((done.length / (guide.steps || []).length) * 100);
        fill.style.width = pct + "%";
        labelRight.textContent = done.length + " of " + (guide.steps || []).length + " steps · " + pct + "%";
      }
      paint();
    });
  }
})();
