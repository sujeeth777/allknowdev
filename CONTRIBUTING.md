# Contributing to allknowdev

Thanks for helping keep the free-tier atlas honest. **Fresh data is the product** — every fix you make saves someone else from a surprise bill or a dead tutorial.

## What you can contribute

- **Add a service** to any `data/*.json` file (one PR = one service keeps review fast)
- **Correct an entry** — limits changed, price changed, free tier removed (these are the most valuable PRs of all)
- **Verify an entry flagged `verify`** — check the official page, update `last_verified`, flip `confidence` to `"official"`
- **Improve a $0 stack** in `data/stacks.json`
- **Site fixes** — accessibility, mobile layout, typos in the guides

## Data files

| File | Category | Covers |
|---|---|---|
| `data/ai-ml.json` | `ai` | model APIs, coding assistants, GPUs, vector DBs |
| `data/cloud-hosting.json` | `cloud` | static hosts, serverless, VMs, PaaS, tunnels |
| `data/databases-auth.json` | `data` | SQL/NoSQL, caches, identity providers |
| `data/devtools.json` | `tools` | editors, CI, observability, security tooling |
| `data/apis-services.json` | `apis` | payments, email, storage, maps, notifications |
| `data/learning.json` | `learning` | courses, certifications, student perks |
| `data/design.json` | `design` | fonts, icons, illustrations, photos, UI kits |
| `data/stacks.json` | — | curated $0 stacks + budget-explorer picks |

## Entry schema

```json
{
  "id": "unique-kebab-id",
  "provider": "Provider name",
  "product": "Product name",
  "category": "ai",
  "tags": ["short", "searchable", "tags"],
  "oss": false,
  "student": false,
  "featured": false,
  "free_tier_exists": true,
  "free_tier_name": "Free",
  "what_free": [
    "Concrete limit: 100 GB/mo bandwidth",
    "What else is included at $0"
  ],
  "paid_from": { "amount": 20, "currency": "USD", "period": "month", "plan": "Pro" },
  "what_paid": ["What money actually unlocks"],
  "best_for": "One-line verdict",
  "watch_out": ["Limits, traps, gotchas"],
  "official_url": "https://example.com",
  "pricing_url": "https://example.com/pricing",
  "last_verified": "YYYY-MM-DD",
  "confidence": "official"
}
```

### Field rules

| Field | Rule |
|---|---|
| `free_tier_exists` | `false` when the service has no free tier (e.g. Heroku today) — then `what_free` should say so explicitly |
| `paid_from.amount` | `null` when you can't verify a number **or** pricing is purely pay-per-use; put the model in `plan` |
| `paid_from.period` | one of `month`, `year`, `once`, `transaction` |
| `what_free` | concrete limits, not marketing ("500 MB database", not "generous storage") |
| `watch_out` | traps, pauses, expirations, removed features — this field is why people trust the site |
| `oss` / `student` | `true` only when genuinely true |
| `featured` | reserved for standout free tiers; keep it rare (site shows featured entries on the homepage) |
| `official_url` / `pricing_url` | official provider pages only; `pricing_url` may be `null` if `official_url` already covers pricing |
| `last_verified` | `YYYY-MM-DD` — the date **you** checked the official source |
| `confidence` | `official` = verified against the provider's own pages · `reported` = from reliable secondary sources; the site shows a **verify** badge for these |

### Honesty rules (enforced by CI + review)

1. **Never invent prices.** Unknown → `null`. Estimates are not official prices.
2. Only official provider pages as sources — no blog aggregators for pricing facts.
3. Currency and billing period always stated.
4. Write `"unknown"`/omit rather than guess when a detail can't be verified.
5. No affiliate or referral links, ever.
6. Today's generous free tier may be tomorrow's removed plan — if a tier was removed, keep the entry and say so (see `planetscale`, `heroku`, `railway` for the pattern).

## CI validation

The deploy workflow validates every `data/*.json` before shipping:
- valid JSON, non-empty
- required fields present (`id`, `provider`, `product`, `category`, `what_free`, `official_url`, `last_verified`, `confidence`)
- unique `id`s across all files
- `official_url`/`pricing_url` are `https://` URLs
- `last_verified` matches `YYYY-MM-DD`
- `confidence` is `official` or `reported`

Run the same check locally:

```bash
python -m http.server 5500   # then open http://localhost:5500
python -I -c "import json,glob;[json.load(open(f,encoding='utf-8')) for f in glob.glob('data/*.json')];print('ok')"
```

## Pull request checklist

- [ ] One service per PR (corrections can bundle small fixes)
- [ ] Fields follow the schema table above
- [ ] `last_verified` is today's date and you actually opened the official page
- [ ] Currency + billing period present, or `amount: null` with the model in `plan`
- [ ] `watch_out` filled in — the gotchas matter most
- [ ] No API keys, credentials or private data committed
- [ ] If you touched site code: checked desktop + mobile rendering

## Local preview

```bash
python -m http.server 5500
```

Open http://localhost:5500. The directory page is at `/pages/directory.html`.
If you open files via `file://`, `fetch()` of the JSON data will fail — always use the local server.

## Review process

A maintainer reviews the official source, checks the numbers and merges. Clear, well-sourced PRs get merged fast — stale-data fixes usually within a day.
