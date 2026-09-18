# Git & Workflow

How changes are made, reviewed, and released for EBC APP.

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; always deployable |
| `feature/<short-description>` | New features or enhancements |
| `fix/<short-description>` | Bug fixes |
| `docs/<short-description>` | Documentation-only changes |

Examples: `feature/member-directory`, `fix/giving-report-date-filter`, `docs/engineering-standards`

Do not commit directly to `main` once CI and team review are in place. During solo early development, direct commits to `main` are acceptable until the first production deploy.

## Commits

- **Atomic commits** — One logical change per commit when possible
- **Present tense, imperative mood** — `Add member search`, not `Added member search`
- **Focus on why** — Especially for non-obvious changes

```
Add role check to giving report export

Finance data must be restricted to authorized roles per
security standards.
```

- **No secrets** — Never commit `.env`, credentials, or real member data

## Pull requests

1. Branch from `main`
2. Keep PRs focused — prefer several small PRs over one large one
3. Link to relevant business or requirements docs when behavior changes
4. Ensure CI passes (lint, typecheck, tests) before requesting review
5. Squash merge to `main` unless history preservation is needed

### PR description template

```markdown
## Summary
Brief description of the change.

## Related docs
- operations/members.md (if business-aligned)
- engineering/requirements/... (if applicable)

## Test plan
- [ ] Steps to verify locally
```

## Documentation changes

Documentation-only PRs use the `docs/` prefix branch and do not require the full test plan — but must be reviewed for accuracy against business operations when process is described.

## Releases

Tag releases on `main` once production deploys begin:

- **Format** — `v0.1.0` (semver)
- **Changelog** — Summarize user-visible changes; note migrations or env var additions

| Version part | When to bump |
|--------------|--------------|
| MAJOR | Breaking API or data migration requiring coordinated rollout |
| MINOR | New features, backward compatible |
| PATCH | Bug fixes, small improvements |

## Database migrations

- Migrations live in version control and run in CI against a test database
- **Never edit** a migration that has been applied to production — add a new migration instead
- Destructive migrations (column drops, data deletes) require explicit review and backup confirmation
