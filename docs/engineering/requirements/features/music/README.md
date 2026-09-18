# Music module — features

| Module | `src/modules/music` |
| **Business source** | [Music & choir ministry](../../../operations/music-ministry.md) |
| **Phase** | 2 |

## Purpose in EBC APP

Worship music planning and choir equipping — **song catalog** (lyrics, parts, musician resources) and **service music plans** directors send for specific dates.

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Song catalog | [song-catalog.md](song-catalog.md) | `/music/songs` |
| Service music planner | [service-music-planner.md](service-music-planner.md) | `/music/plans` |

## Shared data model

| Entity | Description |
|--------|-------------|
| `Song` | title, artist, default_key, tempo, themes[], lyrics_text, copyright_notes |
| `SongAsset` | song_id, type, file_url or rich text, voice_part (SATB) |
| `ServiceMusicPlan` | event_id, service_date, status, director_notes |
| `PlanSong` | plan_id, song_id, sort_order, key_override, notes |
| `PlanDistribution` | plan_id, sent_at, channel (email, in-app) |

### Song asset types

`s lyrics` · `choir_soprano` · `choir_alto` · `choir_tenor` · `choir_bass` · `chord_chart` · `lead_sheet` · `piano` · `guitar` · `bass` · `drums` · `reference_audio` · `reference_video` · `how_to_play` (rich text or PDF)

## Permissions (draft)

| Action | music_director | musician | choir_member | admin | pastor |
|--------|----------------|----------|--------------|-------|--------|
| Manage catalog | ✓ | — | — | ✓ | View |
| Create / send plan | ✓ | — | — | ✓ | View |
| View plan for date | ✓ | ✓ | ✓ | ✓ | ✓ |
| Download parts | ✓ | Own parts | Own voice part | ✓ | — |

Voice part on user profile or choir roster — TBD.

## Open questions

- [ ] CCLI song number field for reporting?
- [ ] Choir members get portal login in phase 5 or read-only links?
