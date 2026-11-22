"use strict";
/* allknowdev v2 — ask page (ask.html).
   Three request types, each composed into a prefilled GitHub issue.
   No backend, no signup — GitHub is the inbox. */

(function () {
  const root = document.getElementById("askRoot");
  if (!root) return;

  const LABELS = {
    help:    { title: "🤝 Ask for help",    heading: "Ask Sujeeth anything",    sub: "Stuck choosing a stack? Want a second opinion on your project or learning path? Describe it — you'll get a personal, honest answer via GitHub.", label: "help-request", cta: "Send via GitHub" },
    suggest: { title: "🧩 Suggest a tool",  heading: "Know a free tier we're missing?", sub: "Add it to the atlas. One JSON entry — or open an issue and a maintainer will add it with you.", label: "tool-suggestion", cta: "Suggest via GitHub" },
    fix:     { title: "🔧 Report a change", heading: "Something changed?",     sub: "Free tiers shrink, prices move, tools die. Tell us what changed and we'll verify and update the entry.", label: "data-fix", cta: "Report via GitHub" }
  };

  const TABS = ["help", "suggest", "fix"];
  const tabsEl = root.querySelector(".ask-tabs");
  const panel = root.querySelector(".ask-form");
  const heading = document.getElementById("askHeading");
  const sub = document.getElementById("askSub");
  const ctaBtn = document.getElementById("askSubmit");
  const copyBtn = document.getElementById("askCopy");
  let mode = "help";

  TABS.forEach((t) => {
    const btn = AKD.el("button", "ask-tab" + (t === mode ? " active" : ""));
    btn.type = "button";
    btn.textContent = LABELS[t].title;
    btn.dataset.mode = t;
    btn.addEventListener("click", () => {
      mode = t;
      tabsEl.querySelectorAll(".ask-tab").forEach((b) => b.classList.toggle("active", b.dataset.mode === t));
      paint();
    });
    tabsEl.appendChild(btn);
  });

  function fields() {
    if (mode === "help") return [
      f("What are you trying to do or build?", "textarea", "e.g. I want to build a portfolio site and a small AI chatbot, but I'm not sure which free hosting or API to start with."),
      f("Your current situation (optional)", "textarea", "e.g. I know basic HTML, I'm in India, budget ₹0, laptop is 6 years old…"),
      f("Your name / handle (optional)", "input", "how should we address you?")
    ];
    if (mode === "suggest") return [
      f("Tool name + official URL", "input", "e.g. Excalidraw — https://excalidraw.com"),
      f("What's free about it?", "textarea", "e.g. Unlimited boards free, no account needed, paid plan only adds teams."),
      f("Which category fits?", "input", "e.g. Design & Assets, AI Coding Tools…")
    ];
    return [
      f("Which tool/entry changed?", "input", "e.g. Vercel Hobby — what used to be true vs what you see now"),
      f("What changed + source link (optional)", "textarea", "e.g. bandwidth cut from 100GB to X — changelog URL here")
    ];
  }

  function f(labelText, type, placeholder) {
    const wrap = AKD.el("div", "field");
    const id = "f-" + labelText.replace(/[^a-z]/gi, "").slice(0, 18).toLowerCase();
    const label = AKD.el("label", null, labelText);
    label.htmlFor = id;
    let input;
    if (type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    input.id = id;
    input.placeholder = placeholder || "";
    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap, input, label: labelText };
  }

  let currentFields = [];
  function paint() {
    const L = LABELS[mode];
    heading.textContent = L.heading;
    sub.textContent = L.sub;
    ctaBtn.textContent = L.cta;
    currentFields = fields();
    panel.replaceChildren(...currentFields.map((x) => x.wrap));
  }
  paint();

  function compose() {
    const lines = currentFields
      .filter((x) => x.input.value.trim())
      .map((x) => "**" + x.label + "**\n" + x.input.value.trim());
    const meta = "\n\n---\n_Sent from allknowdev " + LABELS[mode].title.split(" ")[0] + " form · " + new Date().toISOString().slice(0, 10) + "_";
    return { title: LABELS[mode].title.replace(/^\S+\s/, "[" + LABELS[mode].label + "] "), body: lines.join("\n\n") + meta };
  }

  ctaBtn.addEventListener("click", () => {
    const { title, body } = compose();
    const url = AKD.REPO_NEW_ISSUE + "?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
    window.open(url, "_blank", "noopener");
  });

  copyBtn.addEventListener("click", async () => {
    const { title, body } = compose();
    const text = title + "\n\n" + body;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "✓ Copied";
    } catch (e) {
      copyBtn.textContent = "Select & copy manually";
    }
    setTimeout(() => { copyBtn.textContent = "Copy message"; }, 2200);
  });
})();
