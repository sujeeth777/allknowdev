# Contributing to allknowdev

Thanks for helping make engineering knowledge easier to access.

## What you can contribute

- A provider, product or subscription plan
- A verified pricing or plan comparison
- A free learning resource or certification
- A roadmap for an engineering role
- A country-specific technology or company resource
- A correction, accessibility or performance improvement

## Resource submission rules

1. Prefer official provider pages for plan details and prices.
2. Include direct product and pricing URLs.
3. State currency and billing period.
4. Explain limits, exclusions and eligibility requirements.
5. Include a last_verified date in YYYY-MM-DD format.
6. Never present an estimate as an official price.
7. If a detail cannot be verified, write unknown rather than guessing.
8. Disclose referral or affiliate relationships.

## Suggested resource data shape

~~~json
{
  "id": "provider-product-plan",
  "provider": "Provider name",
  "product": "Product name",
  "plan": "Plan name",
  "category": "ai",
  "pricing": {
    "type": "subscription",
    "amount": null,
    "currency": null,
    "billing_period": null
  },
  "availability": {
    "free_tier": false,
    "student_access": "unknown",
    "regions": []
  },
  "includes": [],
  "limits": [],
  "official_url": "https://example.com/",
  "pricing_url": "https://example.com/pricing",
  "last_verified": "YYYY-MM-DD",
  "notes": []
}
~~~

This is a proposed example schema, not a claim about a real provider.

## Pull request checklist

- [ ] Links point to official or clearly identified sources.
- [ ] Prices include currency and billing period, or are marked unknown.
- [ ] Last-verified date is present.
- [ ] No unsupported claims or copied marketing text.
- [ ] Website works on desktop and mobile.
- [ ] Images have useful alternative text (or empty alt for decoration).
- [ ] No API keys, credentials or private data are committed.

## Local preview

~~~bash
python -m http.server 5500
~~~

Open http://localhost:5500.
