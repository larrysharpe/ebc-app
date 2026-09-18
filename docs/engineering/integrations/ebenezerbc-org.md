# ebenezerbc.org Integration

Public church website — separate from EBC APP and Realm back office.

| Field | Value |
|-------|-------|
| **URL** | https://ebenezerbc.org/ |
| **Platform** | WordPress (My Church Website Design) |
| **Business reference** | [website-reference.md](../../church/website-reference.md) |

## What the website provides

| Content | EBC APP approach |
|---------|------------------|
| Public announcements & calendar | Read-only sync or deep links — TBD |
| Sermons, Bible study | Link to `/resources/sermons` |
| Online giving page | Link to `/other/give` — processing via Realm |
| Ministry pages | Reference for business docs; not duplicated in app |
| Staff login | Website CMS only — not EBC APP auth |

## Sitemap

WordPress sitemap index: `https://ebenezerbc.org/wp-sitemap-posts-page-1.xml`

Event posts: `wp-sitemap-posts-mec-events-1.xml`  
Sermons: `wp-sitemap-posts-sermon-1.xml`

## Integration options (future)

| Approach | Use when |
|----------|----------|
| **Deep links** | Staff or members jump to live site for sermons, give, calendar |
| **RSS / WP REST API** | Pull announcements or events into EBC APP dashboard |
| **Manual** | Business docs updated when website changes (current) |

Do not scrape or store public leader personal emails in EBC APP beyond what church leadership approves for directory use.

## Open items

- [ ] WordPress REST API availability and auth for calendar sync
- [ ] Facebook page URL for worship stream
- [ ] Confirm whether website member directory ties to Realm
