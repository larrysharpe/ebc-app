# People B-roll — Come As You Are

Licensed stock under the type. **Not Ebenezer members.** When the church
films its own greeters, drop those files in `source/people/` and point
`PEOPLE_CLIPS` in `config.py` at them.

Do **not** use photos or video of EBC children without parent/guardian
consent.

## What we chose (and what we left out)

The ask was **diverse, not controversial** — a church-family welcome,
not a culture-war poster.

**In**

| Beat | File | What you see |
|------|------|----------------|
| COME AS YOU ARE | `greeting-congregation.mp4` | Stock handshake (Pexels). EBC has no aisle-greeting clip on YouTube. |
| ALL ARE WELCOME | `ebc-choir.mp4` | Ebenezer praise team — Aug 16, 2026 livestream. |
| SUNDAY 9:45 AM | `ebc-congregation.mp4` | Ebenezer pews — same service. Sunday clothes and everyday clothes. |
| EBENEZERBC.ORG | `gospel-choir.mp4` | Stock choir + gold cross (Pexels). The EBC archive is 360p. |

All four are church or worship rooms. Greeting, singing, prayer, choir.
No protest, no political signs, no nightlife, no alcohol.

**Out**

- A seniors “party” clip with wine on the table (wrong room for this board).
- Catholic / Orthodox liturgy that would look like a different church.
- Stock that makes a stranger look like “this is Pastor Lundy.”
- EBC kids from the phone roll (consent).

Pink hair and jeans in the greeting clip are on purpose — that is the
campaign. The gospel-choir clip keeps the board grounded in an African
American church family, not a generic corporate diversity ad.

## License

Pexels License — free to use, including church and commercial use.
Attribution is not required; we keep it here so a volunteer can re-download.

| File | Pexels | Author |
|------|--------|--------|
| greeting-congregation.mp4 | [8776902](https://www.pexels.com/video/people-standing-in-the-room-8776902/) | Pavel Danilyuk |
| congregation-clapping.mp4 | [8775631](https://www.pexels.com/video/people-dancing-while-clapping-their-hands-8775631/) | Pavel Danilyuk |
| people-praying.mp4 | [8775636](https://www.pexels.com/video/people-praying-together-8775636/) | Pavel Danilyuk |
| gospel-choir.mp4 | [16864283](https://www.pexels.com/video/gospel-choir-director-16864283/) | Shout! Productions |

Spare on disk (not in the loop): `church-hug.mp4` (Pexels 8775881, same
Pavel series). Swap it onto a beat in `config.py` if you prefer a hug
at the pulpit over one of the clips above.

## Fetch / rebuild

```bash
cd "scripts/media-campaigns/2026-caya/sign-roadside"
./run.sh fetch-people
./run.sh build
```

The large MP4s stay out of git. The 1672×941 and 1920×1080 loops get
the people. The 240×120 file stays type-only.

To go back to solid burgundy, set `USE_PEOPLE_VIDEO = False` in `config.py`.
