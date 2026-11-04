<div align="center">

# allknowdev

### ⚡ The free-tier atlas for engineers

**What $0 gets you. What your money unlocks.**

[![Live site](https://img.shields.io/badge/Live_site-sujeeth777.github.io%2Fallknowdev-b6ff70?style=flat-square&labelColor=0c120e)](https://sujeeth777.github.io/allknowdev/)
[![License](https://img.shields.io/github/license/sujeeth777/allknowdev?style=flat-square&labelColor=0c120e)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-67f0c2?style=flat-square&labelColor=0c120e)](CONTRIBUTING.md)
[![Data](https://img.shields.io/badge/Data-150%2B%20services%20in%20JSON-69dfe8?style=flat-square&labelColor=0c120e)](data/)
[![No deps](https://img.shields.io/badge/Dependencies-zero-ffce70?style=flat-square&labelColor=0c120e)](#)

**No ads · No affiliate links · No tracking · MIT licensed**

</div>

---

Most "free tier" lists stop at the name of the plan. **allknowdev shows both columns**: the exact limits you get at $0 — *and* what your first payment actually unlocks — with official pricing links and the date every entry was last checked.

Built for students, self-taught devs and engineers who want to **build first and spend deliberately**.

## 🧭 What's inside

| | |
|---|---|
| 🔍 **[Searchable directory](https://sujeeth777.github.io/allknowdev/pages/directory.html)** | 150+ real services across 6 fields, filterable by *has free tier*, *open source*, *student perk* |
| 💸 **Free vs paid, side by side** | Every entry shows what $0 includes and what "from $X/mo" actually buys |
| 🧱 **The $0 Stacks** | Complete curated stacks — full-stack web, AI builder, solo SaaS, student, self-hosted — that run entirely on free tiers, with the exact point you'd outgrow them |
| 💰 **Budget explorer** | Set a monthly budget → get the genuinely-free baseline plus the one upgrade worth paying for |
| 🎓 **Student section** | What the GitHub Student Developer Pack really contains, plus every student perk in the directory |
| 🗺️ **4 field guides** | Step-by-step paths for AI, cloud, security and software engineering — wired to free tools |

### A taste of the data

| Service | What you get for $0 | Paid from | |
|---|---|---|---|
| [Vercel](https://vercel.com/pricing) | 100 GB/mo bandwidth, serverless, preview deploys | $20/mo (Pro, per user) | ⚠️ non-commercial only |
| [Cloudflare Pages](https://pages.cloudflare.com) | **Unlimited** static bandwidth | $5/mo (Workers paid) | |
| [Supabase](https://supabase.com/pricing) | 500 MB Postgres, 50k auth MAU, 1 GB storage | $25/mo | ⚠️ pauses after 1 week idle |
| [Oracle Cloud](https://www.oracle.com/cloud/free/) | 4 ARM cores + 24 GB RAM **free forever** | pay-as-you-go | |
| [Neon](https://neon.com/pricing) | 1 GB serverless Postgres, branching | $19/mo | |
| [Google AI Studio](https://ai.google.dev/gemini-api/docs/pricing) | Free Gemini Flash-class API tier | pay-per-token | ⚠️ 2026: no more free Pro models |
| [Groq](https://console.groq.com/docs/rate-limits) | Free LLM API, ~30 req/min | pay-per-token | |
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/pricing) | 512 MB free forever, vector search included | ~$9/mo | |
| [PocketBase](https://pocketbase.io) | Entire backend in one binary — free OSS | — | |
| [GitHub Student Pack](https://education.github.com/pack) | Copilot + JetBrains + $300 cloud credits + domain | — | students only |

…plus **140 more** in the [directory](https://sujeeth777.github.io/allknowdev/pages/directory.html) — including the traps, like PlanetScale removing its free tier or Railway's "free" plan being a one-time $5 credit.

## 🚀 Run locally

Zero dependencies. No build step. No Node.

```bash
git clone https://github.com/sujeeth777/allknowdev.git
cd allknowdev
python -m http.server 5500
```

Open http://localhost:5500. That's it.

## 🗂️ Repository structure

```
├── data/                  ← THE data. One JSON file per field.
│   ├── ai-ml.json            model APIs, assistants, GPUs, vector DBs
│   ├── cloud-hosting.json    static hosts, serverless, VMs, PaaS
│   ├── databases-auth.json   Postgres, NoSQL, caches, identity
│   ├── devtools.json         editors, CI, observability, security
│   ├── apis-services.json    payments, email, storage, maps
│   ├── learning.json         courses, certs, student perks
│   └── stacks.json           the curated $0 stacks + budget picks
├── assets/
│   ├── css/style.css       design system (no framework)
│   └── js/                 vanilla JS: directory renderer + site behaviour
├── pages/
│   ├── directory.html      the searchable free-vs-paid directory
│   └── *.html              4 field guides + learning hub
└── index.html              landing page
```

## 🧬 Entry format

One object per service, one file per field. The site and this repo are the same data — improving a row improves the site.

```json
{
  "id": "supabase",
  "provider": "Supabase",
  "product": "Supabase",
  "category": "data",
  "free_tier_exists": true,
  "free_tier_name": "Free",
  "what_free": ["500 MB Postgres", "50,000 MAU (Auth)", "1 GB storage"],
  "paid_from": { "amount": 25, "currency": "USD", "period": "month", "plan": "Pro" },
  "what_paid": ["100k MAU", "8 GB database", "No pausing"],
  "best_for": "All-in-one free backend",
  "watch_out": ["Free projects pause after ~1 week of inactivity"],
  "official_url": "https://supabase.com",
  "pricing_url": "https://supabase.com/pricing",
  "last_verified": "2026-11-04",
  "confidence": "official"
}
```

`confidence` is either `official` (checked against the provider's own docs) or `reported` (community-sourced — shown with a **verify** badge on the site). Entries with `"confidence": "reported"` always link to the official pricing page so you can confirm in one click.

## 🤝 Contributing

**This project only stays useful if the data stays fresh** — free tiers change constantly. Contributions are the whole point:

1. **Fix or add an entry** — edit a `data/*.json` file (see [CONTRIBUTING.md](CONTRIBUTING.md) for the rules and schema). One PR = one service keeps review fast.
2. **Report a stale price** — [open an issue](https://github.com/sujeeth777/allknowdev/issues) with the official source linked.
3. **Verify an entry marked "verify"** — check the official page and flip `confidence` to `official` with today's date.

**Data quality rules (enforced by CI):**
- Official URLs for every claim — never invent prices; `null` beats a guess
- `last_verified` date in `YYYY-MM-DD` on every entry
- Limits, exclusions and watch-outs spelled out, not hidden

## 🛡️ Honesty policy

- **No affiliate links. No paid placements.** The only "promotion" here is open source.
- Every price carries a **last-checked date** — treat the directory as a map, then confirm on the official page.
- Free tiers **change without notice**; entries flagged `verify` are known-volatile.
- Deployment CI validates every JSON file (schema + URL + date format) before the site ships.

## 📜 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**If this saved you from a surprise bill, consider ⭐ starring the repo** — it helps other builders find it.

[![Star History Chart](https://api.star-history.com/svg?repos=sujeeth777/allknowdev&type=Date)](https://star-history.com/#sujeeth777/allknowdev&Date)

</div>
