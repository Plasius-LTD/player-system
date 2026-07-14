# Player System Mission Lifecycle and Reward Orchestration

## Goal

Provide a reusable internal Mission System surface that guides newly awakened
players conservatively, adapts after corroborated preference evidence, and
keeps reward presentation subordinate to governance checks.

## Design

Mission candidates carry a preference kind, horizon, readiness threshold, and
optional nearby-opportunity or world-pressure match. Generation is fail-closed
when the missions flag is disabled. Otherwise, three signals with at least
`0.65` average confidence establish stable preference evidence; bootstrap is
used before that threshold or when adaptive candidates are not safe.

Lifecycle snapshots are immutable. Valid transitions cover proposal,
acceptance, activation, refusal/decline/ignore, pinning, completion,
failure/abandonment, reward surfacing, and cooldown. Decision transitions emit
signals compatible with the core runtime preference model so hosts can update
learning without exposing hidden judgment values.

Reward decisions retain the governance preflight result and structured
explanation metadata. Requested rewards are approved, bounded and marked
modified, or rejected. Only approved/modified decisions can enter the
rewarding state.

## Rollout and rollback

The inherited flag is `isekai.player-system.missions.enabled`. Hosts should
evaluate the parent Player System shell flag before this child flag and use a
break-glass override only in their own documented runtime integration. To roll
back, disable the missions flag and stop constructing mission proposals.

## Test implications

The package tests verify rollout behavior, bootstrap/adaptive inputs,
transition validity, confidence-scored signal emission, runtime integration,
cooldown boundaries, and reward governance outcomes.
