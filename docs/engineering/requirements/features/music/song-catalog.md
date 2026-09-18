# Song catalog

| Field | Value |
|-------|-------|
| **Module** | `src/modules/music` |
| **Feature folder** | `features/song-catalog/` |
| **Route** | `/music/songs`, `/music/songs/[id]` |
| **Phase** | 2 |
| **Status** | Draft |
| **Business source** | [music-ministry.md](../../../operations/music-ministry.md) |

## Overview

Central library of worship songs — lyrics, **choir parts** (SATB), chord charts, lead sheets, and **how to play** notes for musicians. Directors search and attach catalog songs to [service plans](service-music-planner.md).

## Users & roles

| Role | Access |
|------|--------|
| `music_director` | Full CRUD on songs and assets |
| `admin` | Full CRUD |
| `musician` | View songs; download musician assets |
| `choir_member` | View songs; download assigned voice part only |
| `pastor` | View (approval context) |

## User stories

- As **music director**, I want to add a song with soprano and alto PDFs so that choir members have their parts.
- As **music director**, I want chord charts and a short how-to-play note so that the band learns quickly.
- As a **choir member**, I want to read lyrics and my part before rehearsal.
- As a **musician**, I want to filter songs by key and theme when planning set lists.

## Functional requirements

### Must have (MVP)

- [ ] FR-1: Song list — search title, artist, theme; filter by key, theme tag
- [ ] FR-2: Song detail — title, artist/composer, default key, tempo (BPM optional), themes/tags
- [ ] FR-3: **Lyrics** — full text field (formatted plain or markdown); print-friendly view
- [ ] FR-4: **Assets** per song — multiple files/sections by type:
  - Choir: soprano, alto, tenor, bass (PDF upload or external link)
  - Musicians: chord chart, lead sheet, piano, guitar, how-to-play (text or PDF)
  - Reference: audio/video URL (YouTube, Drive — link only)
- [ ] FR-5: Asset upload — PDF, image; max size limit; virus scan TBD
- [ ] FR-6: Copyright / license notes field (CCLI #, public domain, etc.)
- [ ] FR-7: Song status — `draft`, `approved` (director or pastor approve for congregational use)
- [ ] FR-8: Mobile-friendly lyrics view for choir phones

### Should have

- [ ] FR-9: Transpose display key on detail (UI only — does not change stored chart without new asset)
- [ ] FR-10: Duplicate song as template
- [ ] FR-11: Usage history — which service dates used this song (from plans)
- [ ] FR-12: Bulk import metadata from spreadsheet

### Won't have

- Full music engraving editor (use external tools; upload PDFs)
- Automatic chord transcription from audio
- Public internet streaming of copyrighted recordings (links out only)

## Data

| Entity / field | Notes |
|----------------|-------|
| `Song` | core metadata + lyrics_text |
| `SongAsset` | song_id, asset_type, voice_part?, file_storage_key or url, content_text for how-to-play |
| `SongTag` | theme: e.g. praise, communion, advent |

Store files in object storage (S3-compatible) — not git.

## Integrations

None required for MVP; optional link to YouTube for reference tracks.

## UI notes

- Catalog browse: card grid with title + key
- Detail: tabs — Lyrics | Choir parts | Musicians | Reference
- Download buttons per asset; choir_member sees only their part tab if role-scoped
- [Branding](../../../church/branding.md) — reverent, readable typography (Roboto Condensed body)

## Dependencies

- [Auth & roles](../auth-and-roles.md) — `music_director`, `choir_member`, `musician`
- [Service music planner](service-music-planner.md) — consumes catalog

## Acceptance criteria

- [ ] AC-1: PDF opens inline or downloads on mobile Safari/Chrome
- [ ] AC-2: `choir_member` API never returns other voice part file URLs
- [ ] AC-3: Unapproved `draft` songs not addable to published service plan
- [ ] AC-4: Lyrics view usable without horizontal scroll on phone

## Open questions

- [ ] Max file size per asset?
- [ ] Who approves songs — director only or pastor sign-off?
- [ ] Store chord charts as text (ChordPro) in future?
