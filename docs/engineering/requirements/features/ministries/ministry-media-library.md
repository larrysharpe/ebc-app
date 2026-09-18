# Ministry media library

| Field | Value |
|-------|-------|
| **Module** | `src/modules/ministries` |
| **Feature folder** | `features/ministry-media-library/` |
| **Route** | `/ministries/[slug]?tab=media` |
| **Phase** | 1 |
| **Status** | In progress (local storage) |
| **Business source** | [ministries.md](../../../operations/ministries.md) |

## Overview

Each ministry has a **media library** for photos, videos, documents, and audio used by that team (flyers, event photos, reference files). Metadata lives in Postgres; file bytes live in object storage.

## Users & roles

| Role | Access |
|------|--------|
| Users who can access the ministry | View / download |
| Users who can manage the ministry | Upload / remove |
| `admin` / global ministry roles | Full access |

## Functional requirements

### Must have (MVP)

- [x] FR-1: Media tab on ministry detail
- [x] FR-2: Upload multiple files (images, video, audio, documents)
- [x] FR-3: List with kind filter; open/download; remove (managers)
- [x] FR-4: Authz on upload/delete/download
- [x] FR-5: Storage via `storageKey` + provider (`local` now)

### Should have

- [x] FR-6: Virtual folders (path labels like `2026/CLC Retreat`) — browse, upload into folder, move files
- [x] FR-6b: Separate **Documents** tab (same UX; `library=documents`)
- [ ] FR-7: Edit display name / notes
- [ ] FR-8: S3-compatible object storage (`STORAGE_PROVIDER=s3`)

## Data

| Entity / field | Notes |
|----------------|-------|
| `MinistryMediaAsset` | ministry_id, file_name, display_name, mime_type, size_bytes, storage_key, storage_provider, kind, **library** (`media` \| `documents`), **folder_path** (virtual), notes, uploaded_by |

`folder_path` is a virtual organizer only (e.g. `2026/VBS`). Object storage keys stay flat under `ministries/{ministryId}/{assetId}/…` so S3 migration stays simple. Media and Documents share the table but stay separated by `library`.

Files are **not** stored in git. Local path: `.data/object-storage/ministries/...`. Production target: S3-compatible bucket (same pattern as [song catalog](../music/song-catalog.md)).

## Storage

`src/lib/storage` — `ObjectStorage` interface with a local adapter today. Swap in an S3 adapter without changing ministry media services.
