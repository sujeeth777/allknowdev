"use strict";
/* allknowdev v2 — AI hub page (ai.html).
   Editorial intro + every AI field rendered from the data files. */

(function () {
  const root = document.getElementById("aiHub");
  if (!root) return;

  const FIELDS = [
    { id: "ai-chat", heading: "AI Chat & Assistants", blurb: "The chatbots everyone talks about — see exactly what each one gives you free before you pick a favourite." },
    { id: "ai-image", heading: "AI Image & Photo", blurb: "Generators, editors and upscalers. Free daily generations exist on every major platform — and the open-source ones have no limits at all." },
    { id: "ai-video", heading: "AI Video & Editing", blurb: "Text-to-video is young and credit-limited; AI editors are generous. Local open-source models make the pipeline fully free." },
    { id: "ai-audio", heading: "AI Audio, Music & Voice", blurb: "Music generators, voice cloning, TTS and transcription — with serious open-source alternatives for anything rate-limited." },
    { id: "ai-coding", heading: "AI Coding Tools", blurb: "Copilots, agents and app builders. GitHub Copilot is free for everyone now; local runtimes make it unlimited." },
    { id: "ai", heading: "Model APIs & AI Infrastructure", blurb: "The raw layer: LLM APIs with free tiers, free GPUs, embeddings and vector databases you can build products on at $0." }
  ];

  Promise.all([AKD.getServices(), AKD.getCategories()]).then(([s, cats]) => {
    if (AKD.failed()) { AKD.showDataError(root); return; }

    /* stats */
    const aiList = s.list.filter((e) => e.category === "ai" || e.category.startsWith("ai-"));
    document.querySelectorAll("[data-ai-stat]").forEach((el) => {
      const kind = el.dataset.aiStat;
      const n = kind === "all" ? aiList.length
        : kind === "oss" ? aiList.filter((e) => e.oss).length
        : kind === "free" ? aiList.filter((e) => e.free_tier_exists).length
        : 0;
      AKD.countUp(el, n, { suffix: "+" });
    });

    FIELDS.forEach((field, fi) => {
      const cat = cats.byId[field.id];
      const entries = aiList
        .filter((e) => e.category === field.id)
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      if (!entries.length) return;

      const section = AKD.el("section", "section tight");
      const head = AKD.el("div", "section-head");
      const kicker = AKD.el("p", "kicker", "AI field " + String(fi + 1).padStart(2, "0"));
      head.appendChild(kicker);
      const h2 = AKD.el("h2");
      h2.appendChild(document.createTextNode((cat && cat.emoji) + " "));
      h2.appendChild(document.createTextNode(field.heading));
      head.appendChild(h2);
      head.appendChild(AKD.el("p", "lede", field.blurb));
      section.appendChild(head);

      const grid = AKD.el("div", "tool-grid stagger");
      entries.slice(0, 9).forEach((e) => grid.appendChild(AKD.toolCard(e, { bullets: 2 })));
      section.appendChild(grid);

      const more = AKD.el("div", "center mt-lg");
      const moreBtn = AKD.el("a", "btn btn-ghost", "See all " + entries.length + " in " + (cat ? cat.name : field.heading) + " →");
      moreBtn.href = "directory.html?cat=" + encodeURIComponent(field.id);
      more.appendChild(moreBtn);
      section.appendChild(more);

      root.appendChild(section);
      // observe new stagger container
      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver((es, o) => {
          es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); o.unobserve(en.target); } });
        }, { threshold: 0.08 });
        obs.observe(grid);
      } else grid.classList.add("visible");
    });
  });
})();
