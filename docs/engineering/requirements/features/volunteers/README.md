# Volunteers module — features

| Module | `src/modules/volunteers` |
| **Business source** | [Volunteers](../../../operations/volunteers.md) · [COUNT ME IN](https://ebenezerbc.org/connect/count-me-in-volunteer-program) |
| **Phase** | 2 |

## Features

| Feature | Spec | Route |
|---------|------|-------|
| COUNT ME IN registry | [count-me-in-registry.md](count-me-in-registry.md) | `/volunteers` |
| Volunteer scheduling | [volunteer-scheduling.md](volunteer-scheduling.md) | `/volunteers/schedule` |

## Shared data model

| Entity | Description |
|--------|-------------|
| `VolunteerProfile` | person_id, skills[], interests[], hours_logged |
| `VolunteerRole` | name, ministry_id, description |
| `VolunteerAssignment` | role_id, person_id, date, status |

## Open questions

- [ ] Is volunteer database the same system COUNT ME IN references on website?
