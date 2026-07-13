# ADR-0006: Core Runtime Session and Module Orchestration

## Status

Accepted

## Context

The package already exposed session and preference-signal shapes, but hosts had
no shared runtime boundary for retaining preference state or coordinating child
modules across ambient and focused modes. Implementing that coordination in a
renderer would duplicate focus rules and make the package boundary harder to
reuse in native and headless hosts.

## Decision

Add a renderer-neutral `createPlayerSystemRuntime()` factory. The runtime owns
immutable session and preference-model snapshots, private child-module
registrations, and deterministic coordination results. Ambient mode may invoke
all registrations that opt into ambient behavior. Focused mode may invoke only
the registered active module. Coordinators return a handled boolean and cannot
take ownership of rendering, world mutation, or institutional authority.

Preference-model profiles use bounded signal history and per-kind average
confidence. Dominance uses cumulative confidence across each kind so repeated
signals contribute evidence, while the dominant kind remains an advisory
summary for host orchestration.

## Alternatives considered

- Put coordination in `@plasius/player-system-interface`: rejected because it
  would couple runtime behavior to rendering and exclude non-UI hosts.
- Expose mutable module registries and signal arrays: rejected because callers
  could bypass focus boundaries or mutate snapshots after publication.
- Persist raw account or identity data in the model: rejected because it would
  violate the package's privacy-safe runtime boundary.

## Consequences

Hosts share one focus-boundary implementation and can consume immutable state
snapshots. Runtime consumers still own rendering, persistence, scheduling, and
world-authority decisions. The inherited feature flag
`isekai.player-system.core.enabled` provides the rollout and rollback control.
