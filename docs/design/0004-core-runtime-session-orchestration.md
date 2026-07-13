# Player System Core Runtime Session Orchestration

## Goal

Complete the reusable runtime surface for session coordination, preference
learning, and child-module behavior without coupling the package to rendering.

## Design

`createPlayerSystemRuntime()` owns an immutable snapshot containing the session,
the derived preference model, and registered module identifiers. The runtime
keeps module registrations private and exposes only renderer-neutral coordination
results. A focused session coordinates only its active module; an ambient
session coordinates all registrations that opt into ambient mode.

Preference signals are validated, copied, retained in bounded history, and
aggregated into per-kind average confidence profiles. The dominant preference
kind uses cumulative confidence so repeated signals contribute evidence while
the profile remains readable as an average. The model exposes that kind as a
hint for host orchestration, not as an authority that mutates world state or
chooses a rendered experience.

## Rollout and rollback

The inherited feature flag is `isekai.player-system.core.enabled`. Consumers
should disable the flag and stop constructing the runtime to roll back this
surface; existing session and contract helpers remain available.

## Test implications

Tests cover signal validation and immutable aggregation, ambient coordination,
focused active-module isolation, preference updates, and the unregistered-focus
boundary.
