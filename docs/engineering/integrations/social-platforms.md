# Social platform integrations

Third-party APIs for the `social` module.

| Field | Value |
|-------|-------|
| **Business source** | [social-media-community.md](../../operations/social-media-community.md) |
| **Feature specs** | [social module](../requirements/features/social/README.md) |

## Platforms

| Platform | API | EBC APP use | Phase |
|----------|-----|-------------|-------|
| **YouTube** | Google / YouTube Data API v3 | Channel stats; detect new uploads for suggestions; **not** replacing Studio for uploads initially | 3 |
| **Facebook Page** | Meta Graph API | Schedule posts, page insights | 3 |
| **Instagram** | Meta Graph API (Business account) | Schedule feed posts/reels | 3b |
| **Website** | ebenezerbc.org links only | No OAuth — link in posts | — |

Known channel: [YouTube @EBCWoodbridgeVA](https://www.youtube.com/@EBCWoodbridgeVA)

## Authentication

- OAuth 2.0 per platform; tokens in hosting secret store
- Church **Business Manager** (Meta) and **Google Cloud project** (YouTube) owned by church — not developer personal accounts in production
- Scopes: minimum required (publish, read insights — not personal data)

## Community event data sources

| Source | Method | Notes |
|--------|--------|-------|
| Manual / staff URL | Form in app | Always available |
| Prince William County | iCal/RSS/API — TBD | Research official feed |
| Eventbrite | Public event search API | Geo + radius; rate limits |
| Facebook Events | Graph API | Limited; policy changes frequent |
| Partner orgs | Manual allowlist | Missionary ministry contacts |
| Google Places / local | TBD | Discovery assist only |

**Principle:** Prefer official public feeds and manual curation over aggressive scraping.

## Suggestion engine

| Component | Implementation |
|-----------|----------------|
| Rule engine | Cron job + church calendar queries (MVP) |
| LLM assist | Optional phase — caption drafts; church policy required |
| No auto-publish | Human always confirms in [Flow 2](../requirements/features/social/flows.md) |

## Security & compliance

- No member PII in social APIs or suggestion prompts
- Meta/Google terms of service compliance — church legal review for ads/boosting
- Audit log: who published, when, which platforms

## Environment variables (planned)

| Variable | Purpose |
|----------|---------|
| `META_APP_ID` / `META_APP_SECRET` | Facebook/Instagram |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | YouTube |
| `SOCIAL_TOKEN_ENCRYPTION_KEY` | At-rest token encryption |
| `COMMUNITY_EVENTS_INGEST_CRON` | Schedule |

## Open decisions

- [ ] Meta Business verification status
- [ ] Budget for Eventbrite or paid event APIs
- [ ] AI vendor for caption suggestions (if any)
