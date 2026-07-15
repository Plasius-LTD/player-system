# ADR-0010: Tutorial Progression and Coaching Boundary

- Status: Accepted
- Date: 2026-07-15

## Context

Tutorial hosts need a consistent way to expose awakening help, stage-based
unlocking, prerequisite explanations, replayable help, and bounded combat
coaching. A host-specific implementation could accidentally treat a tutorial
surface as authoritative progression or open a full focused pane during a
combat-safe interaction.

## Decision

`@plasius/player-system` exposes
`createPlayerSystemTutorialProgressionState()` behind
`isekai.player-system.tutorial.enabled`. The helper consumes the current
stage, completed step identifiers, bounded tutorial step definitions, and
caller-owned prerequisite outcomes. It derives locked, blocked, available,
completed, and replaying step state without advancing progression.

Combat coaching is modeled as either `reduced-combat` or `focused-pane`.
Reduced coaching is a bounded, non-focused surface available in combat-safe
mode. Full focused-pane coaching is separate and is withheld in combat-safe
mode. Neither mode mutates combat, tutorial, or world authority.

## Alternatives considered

- Let each renderer derive tutorial unlocks: rejected because stage and
  prerequisite semantics would drift across host surfaces.
- Let Player System advance stages: rejected because progression authority
  remains with the host and game systems.
- Treat all combat help as a focused pane: rejected because reduced coaching
  must remain available without interrupting combat-safe flows.

## Consequences

Consumers must provide current authoritative stage and prerequisite outcomes,
persist completion outside this package, and localize/render the returned
summaries. The feature flag is the rollback path: disabling it removes
tutorial and coaching surfaces while leaving authoritative state unchanged.
