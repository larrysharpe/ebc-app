# Ministries module — features

| Module | `src/modules/ministries` |
| **Business source** | [Ministries & programs](../../../operations/ministries.md) · [website registry](../../../church/website-reference.md) |
| **Phase** | 1 |
| **Status** | In progress (preview) |

## Purpose in EBC APP

Registry of Ebenezer's ministries with **personnel**, **ministry calendar**, and **SOP editing** — so leaders can run teams without scattered spreadsheets and email threads.

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Ministry registry | [ministry-registry.md](ministry-registry.md) | `/ministries` |
| Ministry detail — personnel | [ministry-roster.md](ministry-roster.md) | `/ministries/[slug]?tab=personnel` |
| Ministry calendar | [ministry-calendar.md](ministry-calendar.md) | `/ministries/[slug]?tab=calendar` |
| Ministry SOPs | [ministry-sops.md](ministry-sops.md) | `/ministries/[slug]?tab=sops` |
| Ministry media library | [ministry-media-library.md](ministry-media-library.md) | `/ministries/[slug]?tab=media` |
| Ministry documents | [ministry-media-library.md](ministry-media-library.md) | `/ministries/[slug]?tab=documents` |

## Seed ministries (from website)

Christian Education · Counseling · Youth · Young Adult · Mountain Men · Women's · Golden Eagles · JAMM · Missionary · Prison · Deacon · Deaconess · Trustee · **Music & choir** · COUNT ME IN · Nehemiah Project · Sports · Usher · Media/AV

Categories: `education` · `fellowship` · `outreach` · `leadership` · `service` · `capital`

## Shared data model

| Entity | Description |
|--------|-------------|
| `Ministry` | name, slug, category, description, website_url, meeting_summary |
| `MinistryPerson` | roster entry with **personId** → church `Person`, role, duties |
| `Person` | church directory individual (members module) |
| `MinistryEvent` | ministry_id, title, start_at, location, recurring, notes |
| `MinistrySop` | title, content, template/kind, document control (version, status, prepared/reviewed/approved), updated_at, updated_by — see [ministry-sops.md](ministry-sops.md) |
| `MinistryMediaAsset` | ministry_id, file metadata + storage_key — see [ministry-media-library.md](ministry-media-library.md) |

## Dev storage

Phase 0 uses PostgreSQL via Prisma. Seed data lives in `ministries.seed.ts` and is loaded with `npm run db:seed`.

## Open questions

- [x] Link personnel to member records — **yes**; roster entries use `personId` (open roles allowed without a link)
- [ ] Children's records — guardian linkage rules (members module)
