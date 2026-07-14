# ADR-0007: Player System Mission Lifecycle and Bounded Rewards

## Status

Accepted

## Date

2026-07-15

## Context

The Player System package exposed generic preference signals and governance
reward preflight, but it did not provide the internal Mission System contract
required by ADR 0061 and TDR-0029. Consumers would otherwise need to duplicate
bootstrap selection, lifecycle validation, learning-signal mapping, and
reward-surfacing guardrails in each host.

## Decision

Add a renderer-neutral mission orchestration boundary to
`@plasius/player-system` that:

1. fails closed behind `isekai.player-system.missions.enabled`;
2. selects conservative bootstrap objectives until preference evidence reaches
   the documented confidence and corroboration thresholds;
3. scores adaptive candidates using preference evidence, MCC focus, nearby
   opportunities, world-state pressure, and readiness;
4. validates proposed, accepted, active, refused, abandoned, completing,
   completed, failed, rewarding, and cooldown transitions;
5. converts acceptance, refusal/decline/ignore, pinning, completion, failure,
   and abandonment into confidence-scored `PlayerPreferenceSignal` values;
6. provides a helper that records those signals through the existing runtime
   preference model; and
7. invokes governance reward preflight before returning approved, modified, or
   rejected reward outcomes. Rejected rewards cannot enter the rewarding state.

The package remains renderer-neutral and does not mutate world state, award
authoritative currency, or replace guild/institution authority. Hosts own
persistence, scheduling, presentation, and authoritative reward application.

## Alternatives considered

- Keep mission behavior in each site or game host: rejected because lifecycle
  and fail-closed reward rules would drift across consumers.
- Generate only static bootstrap missions: rejected because the Player System
  must adapt after stable evidence exists.
- Let mission code bypass governance preflight: rejected because rewards must
  remain bounded accelerants rather than progression skips.

## Consequences

Consumers receive immutable, deterministic contracts and a single transition
boundary. The host must supply current readiness, preference, MCC, opportunity,
pressure, and cap inputs, and must still persist and apply authoritative
outcomes. The feature flag provides an immediate rollback path: disable it and
stop constructing mission proposals; existing runtime and governance helpers
remain available.

## Related decisions

- ADR 0061: Mission System Uses an Adaptive Player Model with Bounded Rewards
- TDR-0029: Mission System Adaptive Guidance and Reward Governance
- ADR-0006: Core Runtime Session and Module Orchestration
