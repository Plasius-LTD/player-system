# ADR-0009: MCC Guidance and Spellcraft Authority Boundary

- Status: Accepted
- Date: 2026-07-15

## Context

The Player System needs to steer missions and explain MCC readiness, but MCC
feasibility and spellcraft grammar are authoritative outside the package.
Duplicating those decisions in a renderer or guidance helper would allow stale
or partial runtime data to appear as permission to commit a spell.

## Decision

`@plasius/player-system` exposes a bounded MCC guidance state that consumes
caller-supplied readiness, feasibility, and warning outcomes. It may derive
focus-aware mission bias and a spellcraft preview verdict, but it never
executes a spell, changes MCC state, grants progression, or overrides an
authority handoff.

Guidance is rollout-controlled by
`isekai.player-system.mcc-guidance.enabled`. All returned arrays and nested
records are immutable, and warning input is capped at eight records to keep
the public summary bounded.

## Alternatives considered

- Keep MCC guidance in the site frontend: rejected because mission bias and
  authority-safe summaries are reusable Player System behavior.
- Recompute MCC feasibility in this package: rejected because MCC and
  spellcraft systems own resource, grammar, and risk truth.
- Expose raw MCC telemetry: rejected because the Player System contract should
  publish bounded, player-safe summaries.

## Consequences

Consumers must provide current authoritative outcomes and remain responsible
for localization and rendering. Disabling the flag removes derived guidance
without mutating world or MCC state. Final spell admission remains external.
