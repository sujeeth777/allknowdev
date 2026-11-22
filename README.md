<div align="center">

# allknowdev

### 🌍 Every free tool on the internet, mapped.

**1,000+ services · 16 categories · 41 currencies · your country's rules**

[![Live site](https://img.shields.io/badge/Live_site-allknowdev.vercel.app-5B4DFF?style=flat-square&labelColor=201943)](https://allknowdev.vercel.app/)
[![License](https://img.shields.io/github/license/sujeeth777/allknowdev?style=flat-square&labelColor=201943)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-3E7BFA?style=flat-square&labelColor=201943)](CONTRIBUTING.md)
[![Data](https://img.shields.io/badge/Data-1%2C000%2B%20services%20in%20JSON-0FB5A0?style=flat-square&labelColor=201943)](data/)
[![No deps](https://img.shields.io/badge/Dependencies-zero-F0447C?style=flat-square&labelColor=201943)](#)

**No ads · No affiliate links · No tracking · MIT licensed**

</div>

---

Most "free tier" lists stop at the name of the plan. **allknowdev shows the whole picture**: the exact limits you get at ₹0/$0 — *and* what your first payment actually unlocks — with official pricing links, the date every entry was last checked, **prices converted to your currency**, and **region notes** for your country (availability, privacy law, payment rails).

Built for students, self-taught devs and creators who want to **build first and spend deliberately**.

## 🧭 What's inside

| | |
|---|---|
| 🔍 **[The atlas](https://allknowdev.vercel.app/directory.html)** | 1,000+ real services across 16 colour-coded categories — instant search, tier filters, open-source and student filters, `/` to search |
| 🤖 **[AI Hub](https://allknowdev.vercel.app/ai.html)** | Every AI mapped by field: chat, image, video, audio, coding tools and the model APIs behind them |
| 💸 **Free vs paid, side by side** | Every entry shows what $0 includes and what "from $X/mo" actually buys |
| 🌐 **[World page](https://allknowdev.vercel.app/world.html)** | Pick your country → prices in your currency (41 currencies), availability notes, the privacy law that governs your data, payment rails that work where you live |
| 🧱 **The $0 Stacks** | Complete curated stacks — full-stack web, AI builder, solo SaaS, self-hosted — that run entirely on free tiers, with the exact point you'd outgrow them |
| 💰 **Budget explorer** | Set a monthly budget → get the genuinely-free baseline plus the one upgrade worth paying for |
| 🛠️ **[Guides](https://allknowdev.vercel.app/learn.html)** | 12 step-by-step guides with checkable progress (saved in your browser): first website, AI chatbot, RAG notebook, podcast, faceless YouTube, self-hosting… plus 4 career roadmaps |
| 🙋 **[Ask me](https://allknowdev.vercel.app/ask.html)** | A real human answers: stack advice, tool suggestions, data fixes — via GitHub issues |
| 🖥️ **[Per-tool pages](https://allknowdev.vercel.app/tool.html?id=vercel)** | What you get free, what paying unlocks, watch-outs, currency conversion, similar tools |

## 🗂️ The data

```
data/
├── ai-ml.json            # model APIs, GPUs, vector DBs (the raw AI layer)
├── ai-chat.json          # chatbots & assistants
├── ai-image.json         # image generation & editing
├── ai-video.json         # video generation & editing
├── ai-audio.json         # music, TTS, speech-to-text
├── ai-coding.json        # copilots, agents, local AI
├── ai-extra.json         # more AI infra: OSS runtimes, frameworks, MLOps
├── ai-media-extra.json   # more AI chat/image/video/audio/coding tools
├── cloud-hosting.json    # hosts, serverless, VMs
├── cloud-extra.json      # CDNs, sandboxes, tunnels, VPS trials, self-host infra
├── databases-auth.json   # DBs, storage, identity
├── databases-extra.json  # more DBs, search engines, headless CMS, auth
├── devtools.json         # editors, CI, monitoring
├── devtools-extra.json   # runtimes, CLI legends, containers, testing, security scans
├── apis-services.json    # payments, email, maps…
├── apis-extra.json       # realtime, media, weather, crypto, datasets, more
├── design.json           # fonts, icons, assets
├── design-assets.json    # 60+ more: icons, photos, 3D, mockups, color tools
├── learning.json         # courses, certs, practice
├── learning-extra.json   # Indian platforms, free textbooks, interview prep
├── software.json         # legendary OSS desktop apps
├── software-extra.json   # CLI legends, media tools, CAD, editors
├── productivity.json     # notes, docs, tasks
├── productivity-extra.json # time tracking, wikis, read-it-later, self-host
├── security.json         # VPNs, privacy, encryption
├── security-extra.json   # firewalls, routers, private OSes, encryption CLIs
├── storage.json          # cloud drives, transfer, backup
├── storage-extra.json    # more drives, photo backup, file hosts
├── categories.json       # taxonomy: 16 categories, 4 groups
├── fx.json               # snapshot FX rates (41 currencies)
├── regions.json          # 18 regions: availability, privacy law, payments
├── guides.json           # 12 step-by-step guides + 4 career paths
└── stacks.json           # curated $0 stacks + budget picks
```

**Every entry carries:** `what_free` (exact limits), `paid_from` (real price), `watch_out` (honest traps), `official_url` (+ `pricing_url`), `last_verified` (date), `confidence` (`official` / `reported`), plus `oss` / `student` / `featured` flags. CI validates all of it on every push.

### A taste of the data

| Service | What you get for $0 | Paid from | |
|---|---|---|---|
| [Vercel](https://vercel.com/pricing) | 100 GB/mo bandwidth, serverless, preview deploys | $20/mo (Pro, per user) | ⚠️ non-commercial only |
| [Cloudflare Pages](https://pages.cloudflare.com) | **Unlimited** static bandwidth | $5/mo (Workers paid) | |
| [Supabase](https://supabase.com/pricing) | 500 MB Postgres, 50k auth MAU, 1 GB storage | $25/mo | ⚠️ pauses after 1 week idle |
| [Oracle Cloud](https://www.oracle.com/cloud/free/) | 4 ARM cores + 24 GB RAM **free forever** | pay-as-you-go | |
| [Groq](https://groq.com) | Fast free LLM API, ~30 req/min per model | pay-per-token | |
| [Blender](https://www.blender.org) | Full 3D pipeline — no limits, no account, forever | — | 🔓 OSS |

## 🚀 Run it locally

Zero build step, zero dependencies:

```bash
git clone https://github.com/sujeeth777/allknowdev.git
cd allknowdev
python -m http.server 8000      # or: npx serve
# → http://localhost:8000
```

## 🤝 Contribute

One JSON entry = a better map for everyone.

- **Add or fix a service** → edit a file in `data/`, follow the schema in [CONTRIBUTING.md](CONTRIBUTING.md)
- **Spot stale data?** → [open an issue](https://github.com/sujeeth777/allknowdev/issues) or use the [Ask page](https://allknowdev.vercel.app/ask.html)
- **Star the repo** ⭐ — it's the only metric this project cares about

## ⚠️ Honest disclaimer

Prices and limits change without notice. Every entry carries its check date and a direct link to the official pricing page — treat this as a **map, not gospel**. Region/currency data is general orientation, not legal or financial advice.

---

<div align="center">
<b>Built with plain HTML/CSS/JS · zero dependencies · one human + open data</b>
</div>
