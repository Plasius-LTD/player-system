# TDR-0006: Tutorial Progression Runtime Surface

## Runtime contract

`createPlayerSystemTutorialProgressionState()` accepts:

- the `isekai.player-system.tutorial.enabled` feature-flag decision;
- the current ordered stage from `awakening` through
  `apprenticeship-candidate`;
- completed step identifiers;
- at most 64 step definitions, each with a lane, summary, required stage,
  optional bounded prerequisites, and replayable marker;
- an optional completed step to replay; and
- optional reduced-combat or focused-pane coaching input.

The result includes immutable normalized step records, the next available
step, blocked prerequisite detail, replay availability/request state, and a
progression status of `available`, `blocked`, `complete`, `replaying`, or
`disabled`.

## Safety and authority boundaries

Stage changes, completion persistence, prerequisite truth, combat state, and
rendering remain caller-owned. Invalid stages, duplicate identifiers,
unknown completed steps, invalid replay requests, and unbounded arrays fail
closed. The contract stores bounded summaries and prerequisite labels only;
callers must not pass secrets, account identifiers, raw telemetry, or hidden
authority data.

Reduced combat coaching is not a focused pane. It is allowed only when the
caller indicates combat-safe mode; focused-pane coaching is allowed only when
combat-safe mode is false.

## Verification

Tests cover stage unlocks, prerequisite blockers, completed and replaying
steps, disabled rollout, reduced versus focused coaching, invalid inputs, and
immutable snapshots.
