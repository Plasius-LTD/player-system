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

The runtime boundary also owns the explicit portability contract behind
`isekai.player-system.runtime-portability.enabled`, including:

- session-data minimization rules for package payloads
- composition-scale assumptions for concurrent module and pane consumers
- portable adapter expectations that avoid renderer-specific or host-specific coupling

## Consequences

- Host apps can consume a stable orchestration package without coupling to UI.
- The package can model bounded handoff readiness into external systems.
- Future runtime integrations have a clear place to compose governance and
  evaluation adapters.
- Privacy and portability expectations become testable API surfaces instead of
  prose-only guidance.
