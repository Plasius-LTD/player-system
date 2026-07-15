# TDR-0002: Player Event Log and Achievement Runtime Surface

## Summary

Extend `@plasius/player-system` with runtime contracts for:

- filtered event-log recall
- highlighted recent moments
- earned achievements and progress state
- projection freshness metadata
- rollout identifiers for the host runtime

## Direction

The runtime surface should represent the curated datasets produced by the
blob-backed observed-event pipeline, not the raw event lake itself.

The package exposes `createPlayerSystemEventAchievementReadModel()` for the
gated aggregate and `filterPlayerSystemEventLog()` for bounded recall. Event
entries are sorted by occurrence time, highlights by rank, achievements by
update time, and all returned collections are immutable. Freshness includes
last projection time, source observation time, source lag, and a stale decision.
The capability gate is `player-system.events-achievements.view` and the
rollout flag is `isekai.player-system.events-achievements.enabled`.

The package should expose types and helpers for player-facing consumption while
excluding:

- raw file partitioning
- Azure Function scheduling and checkpointing
- achievement rule execution
- gossip export workers

Host applications should treat the package contracts as the stable boundary
between backend projection services and Player System presentation layers.
