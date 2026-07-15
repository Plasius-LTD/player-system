# Player System MCC Guidance and Spellcraft Steering

## Problem

MCC growth focus, readiness summaries, and spellcraft previews need one
renderer-neutral orchestration boundary. Site-local guidance can present copy,
but it should not duplicate focus steering or reinterpret authoritative MCC
feasibility, spell grammar, thermal, fatigue, or chaos outcomes.

## Decision

Add `createPlayerSystemMccGuidanceState()` behind
`isekai.player-system.mcc-guidance.enabled`.

The helper:

- validates and preserves the caller's bounded readiness band;
- consumes an authoritative feasibility verdict and bounded warning records;
- maps internalized, externalized, and hybrid focus into deterministic mission
  signal bias;
- derives ready, warning, blocked, or disabled guidance state;
- returns an optional spellcraft authority handoff as advisory metadata only;
- returns frozen snapshots and caps warning records at eight entries.

The package does not calculate MCC feasibility, spell grammar, resource costs,
or world consequences. Those remain owned by the MCC and Spell Crafting
Systems. The Player System only explains the supplied outcome and keeps the
next recommendation bounded.

## Focus bias

| Focus | Preferred signal kinds |
| --- | --- |
| `internalized` | `combat`, `exploration` |
| `externalized` | `crafting`, `social` |
| `hybrid` | `combat`, `crafting`, `social` |

## Rollout and rollback

The feature flag defaults to disabled in host control planes. Disable
`isekai.player-system.mcc-guidance.enabled` to remove the derived mission and
spellcraft guidance surfaces while leaving authoritative systems unchanged.

## Validation

Unit tests cover all focus leanings, disabled rollout, readiness and
feasibility state derivation, thermal/fatigue/chaos/spell-grammar warnings,
authority-handoff validation, fail-closed inputs, and immutable snapshots.
