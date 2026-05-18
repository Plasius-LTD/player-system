# ADR-0002: Player Event Log and Achievement Read Model Boundary

## Status

Proposed

## Context

The Player System needs a stable runtime contract for event recall and
achievement views, but the underlying ingestion and processing architecture will
live in blob-backed backend services with timer-triggered Azure Functions.

If `@plasius/player-system` absorbs raw storage layout, batch processing, or
projection mechanics, the package will drift away from its non-rendering
orchestration role and become tightly coupled to one backend implementation.

## Decision

`@plasius/player-system` will own only the curated player-facing read model for
event logs and achievements.

Raw observed-event JSON persistence, blob layout, checkpointing, timed batch
processing, highlight selection, and achievement projection remain outside the
package and belong to backend services.

The package will align with feature flag
`isekai.player-system.events-achievements.enabled` and capability
`player-system.events-achievements.view` so host applications can compose the
runtime surface with the same rollout and discoverability controls used by the
backend.

## Consequences

- Host runtimes can consume a stable, privacy-safe event and achievement
  contract without coupling to storage mechanics.
- The package stays consistent with the Player System's orchestration-only
  boundary.
- Backend integrations must translate curated blob-backed datasets into the
  package contract before UI or gameplay consumers use them.
