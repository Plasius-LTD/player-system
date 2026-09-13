# ADR 0012: Preserve the Player System audio gate with speech 1.x

Status: Accepted

## Context

Dependency Task #85 under Plasius-LTD/plasius-ltd-site#293 consumes the verified
speech and training 1.0.2 releases. Speech 1.x changed its audio rollout key from
`isekai.player-system.audio.enabled` to `harmony.player-system.audio.enabled`.
Passing existing caller snapshots directly to the upgraded shared policy
silently disabled authorized narration; accepting only the new key would also
allow callers to bypass an explicitly disabled Player System gate.

## Decision

Keep the published Player System flag and translate it at the existing audio
adapter boundary. Enable the canonical speech gate only when the established
Player System gate is explicitly true and the canonical gate is not explicitly
false. Copy the snapshot; do not mutate caller state. Continue delegating mute,
duplicate, priority, combat-safe, ducking and delivery decisions to the shared
speech package. Training types and helpers continue to come from training.

This is compatibility adaptation, not a second policy implementation. The site
remains the source of rollout decisions. The dependency wave inherits
`ops.dependency-refresh.latest-stable.2026-05.enabled` from the parent Feature.

## Consequences and alternatives

Blindly forwarding old snapshots would break existing narration. Renaming the
public flag would require an intentional operator/API migration. Overriding an
explicit canonical disable would weaken the new policy. The adapter preserves
existing authorized delivery while keeping either explicit disable effective.
A canonical enable alone cannot authorize the Player System route.

## Validation and rollback

Regression cases cover legacy enable, missing/disabled legacy gates, explicit
canonical enable/disable, and immutable snapshots. Existing narration,
combat-safe suppression and mute behavior remain covered by shared-policy
integration tests. Run lint, typecheck, build, behavior tests, >=80% coverage,
LCOV inclusion, audit and package checks. Rollback pins the previous published
Player System version; no existing rollout configuration needs migration.
