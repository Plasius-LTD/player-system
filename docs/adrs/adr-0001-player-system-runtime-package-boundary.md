# ADR-0001: Player System Runtime Package Boundary

## Status

Accepted

## Context

The Player System needs a reusable package boundary that can model runtime
session state, focus state, module orchestration, and preference-learning
signals without taking ownership of rendering or world-authority behavior.

## Decision

`@plasius/player-system` will own the non-rendering runtime boundary for the
Player System. Rendering belongs in `@plasius/player-system-interface`, while
institutional and crafting authority stays in external systems.

The package inherits the Player System package-family parent feature flag
`isekai.player-system.packages.enabled`. No capability is required at bootstrap
time because this repository defines reusable package contracts, not end-user
discoverability or entitlement.

## Consequences

- Host apps can consume a stable orchestration package without coupling to UI.
- The package can model bounded handoff readiness into external systems.
- Future runtime integrations have a clear place to compose governance and
  evaluation adapters.
- Rollback for early adoption remains centralized: disable
  `isekai.player-system.packages.enabled`.
