# Facilities module — features

| Module | `src/modules/facilities` |
| **Business source** | [Facilities](../../../operations/facilities.md) |
| **Phase** | 3 |

## Features

| Feature | Spec | Route |
|---------|------|-------|
| Space reservations | [space-reservations.md](space-reservations.md) | `/facilities` |

## Shared data model

| Entity | Description |
|--------|-------------|
| `Space` | name, capacity, type (gym, classroom, kitchen, chapel) |
| `Reservation` | space_id, event_id, start, end, status, requester |

Seed spaces (campus catalog):

**1st floor** — Gym, Room A (New Member room), Room B (Deaconess room), Teen Room, Multipurpose Room, Bathrooms, Kitchen  

**2nd floor** — Chapel, Media Booth, Crow's Nest (Media Booth for the gym), Executive Conference Room, Bathrooms  

**3rd floor** — Room D (Deacon Room), Ministers Room, Assistant Pastors Room, Pastors Room, First Lady's Room, Church Admin Room, Class Room A, Class Room B
