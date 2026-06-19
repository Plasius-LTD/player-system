# ADR-0004: Player System Governance Runtime Boundary

## Status

Proposed

## Context

The Player System needs a reusable governance layer for overdrive prompts,
repair-tax consequences, bounded reward checks, and evaluation feedback loops.
Those rules must stay portable across host applications while avoiding direct
coupling to renderer state, backend storage, or specific eval providers.

If `@plasius/player-system` exposes only host-local helper snippets, every
consumer will duplicate the same safety rules and drift on rollout behavior.
If it owns provider-specific eval datasets or speech/runtime transport details,
the package stops being a clean orchestration boundary.

## Decision

`@plasius/player-system` will own the governance runtime contract and pure
orchestration helpers for:

- overdrive request, consent, duration, expiry, denial, escalation, and
  auto-disengage state
- child-safe versus harder-mode repair-tax assessments
- bounded reward preflight checks for readiness, cap pressure, and policy
  denial
- adapter-driven evaluation summaries for tutorial usefulness, mission fit,
  preference learning, voice intent, and reward boundedness

The package will not own provider-specific golden datasets, backend persistence,
or host rendering. Those remain in dedicated packages and host applications.
The inherited feature flag for this boundary is
`isekai.player-system.governance.enabled`.

## Consequences

- Host applications can consume one stable governance contract instead of
  duplicating safety rules.
- Evaluation providers remain replaceable because the package depends on adapter
  interfaces rather than dataset or transport implementations.
- `@plasius/ai-evals` can publish the concrete governance scorecards without
  forcing `@plasius/player-system` to depend on one eval package at runtime.
- Site and backend integrations must translate package fields into any
  host-specific runtime payload shapes they expose publicly.
