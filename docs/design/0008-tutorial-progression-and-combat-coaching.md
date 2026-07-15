# Player System Tutorial Progression and Combat Coaching

## Problem

Awakening tutorials need one renderer-neutral state model for progression,
replayable help, stage unlocks, and prerequisite-aware lanes. Combat help also
needs an explicit reduced surface so a host does not open a full focused pane
when a bounded coaching cue is sufficient.

## Decision

Add `createPlayerSystemTutorialProgressionState()` behind
`isekai.player-system.tutorial.enabled`.

The helper:

- validates an ordered tutorial stage and bounded step definitions;
- derives locked, blocked, available, completed, and replaying step state;
- exposes unsatisfied prerequisite records without evaluating their truth;
- identifies the next available step and replayable completed help; and
- separates `reduced-combat` coaching from `focused-pane` coaching.

The package does not persist completion, advance stages, evaluate game or
combat authority, or render tutorial content. Hosts provide current state and
own those decisions.

## Stage and coaching rules

| Rule | Result |
| --- | --- |
| Current stage is below a step's required stage | `locked` |
| Any supplied prerequisite is unsatisfied | `blocked` |
| Completed and replayable step is requested | `replaying` |
| Requested reduced combat coaching in combat-safe mode | Allowed without a focused pane |
| Requested focused-pane coaching in combat-safe mode | Withheld |

## Rollout and rollback

The host control plane owns
`isekai.player-system.tutorial.enabled`. Disable the flag to remove tutorial
progression and coaching surfaces while preserving authoritative session,
stage, completion, and combat state.

## Validation

Unit tests cover enabled and disabled rollout, stage unlocks, prerequisite
blocking, replay requests, coaching-mode separation, bounded validation, and
immutable output.
