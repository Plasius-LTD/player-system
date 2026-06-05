# Player System Training Routing Orchestration

## Problem

`@plasius/player-system` already exposed generic runtime contracts, but the
training-routing logic lived only in `plasius-ltd-site` as a UI-local helper.
That left no reusable package model for:

- resolving the next best training surface from player growth focus and
  institution readiness
- carrying blocked prerequisite explanations, including trust or mission gates
- representing authority-safe handoff readiness for training and downstream
  crafting systems

## Decision

Add a package-level training-routing orchestration surface behind
`isekai.player-system.training-routing.enabled`.

The package now exports:

- semantic readiness and handoff shapes instead of UI translation keys
- helpers to create frozen institution-readiness and authority-handoff records
- a routing resolver that distinguishes internalized, externalized, and hybrid
  growth focus when multiple institution routes are available
- explicit blocked prerequisite summaries that preserve trust and mission
  requirements supplied by the caller

The package reuses `@plasius/training` for institutional vocabulary and MCC
track types rather than duplicating them locally.

## Alternatives Considered

- Keep the logic site-local.
  Rejected because the route resolution belongs to the reusable Player System
  orchestration boundary, not one frontend surface.
- Export UI copy keys from the package.
  Rejected because localization remains a host concern; the package should
  publish semantic routing decisions only.
- Model crafting readiness as a single generic commerce handoff.
  Rejected because downstream consumers need to distinguish spellcraft,
  item-crafting, and dungeon-crafting authority seams when those exist.

## Impact

- Frontend shells can consume a shared routing state instead of re-implementing
  route priority logic.
- Callers retain control over human-readable copy while still receiving stable,
  typed reasoning signals.
- Package consumers must provide institutional readiness and authority-handoff
  inputs from their own authoritative sources.

## Validation

- Add unit coverage for focus-aware route selection, blocked prerequisite
  preservation, default track support, and crafting handoff filtering.
- Rebuild the package and rerun type checking after introducing the new public
  surface.
