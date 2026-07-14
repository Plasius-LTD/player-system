# TDR-0003: Player System Mission Orchestration

## Purpose

Define the package-level contract for adaptive internal missions without
coupling the package to rendering, persistence, or world authority.

## Contract

`generatePlayerSystemMission()` requires an explicit rollout decision and
returns no proposal when `isekai.player-system.missions.enabled` is disabled.
With rollout enabled, preference evidence is stable only when the dominant
profile has at least three signals and average confidence of at least `0.65`.
Before that point, or when no readiness-safe adaptive candidate exists, the
bootstrap candidate is returned.

Stable candidates are ranked deterministically by preference match, MCC focus
match, nearby opportunity match, and active world-state pressure. Readiness is
a hard lower bound on candidate eligibility.

`createPlayerSystemMission()` creates an immutable `proposed` snapshot.
`transitionPlayerSystemMission()` is the only lifecycle mutation boundary and
supports the complete proposal-to-cooldown path. Decision transitions produce
confidence-scored signals. `applyPlayerSystemMissionTransition()` forwards
those signals to `PlayerSystemRuntime.recordPreferenceSignal()`.

`evaluatePlayerSystemMissionReward()` always calls the existing governance
preflight. It caps an allowed amount to the remaining global and session
budgets, reports a modified result when the requested amount is reduced, and
reports a rejected result with explanation metadata when preflight denies the
reward. A rejected result cannot be surfaced by the lifecycle transition API.

## Failure and rollback

Invalid inputs and invalid transitions fail fast with stable error messages.
Hosts own retries and persistence. Disabling the missions feature flag is the
rollback path and does not require changing the package contract.

## Test implications

Tests cover disabled rollout, bootstrap fallback, stable adaptive selection,
all decision-signal categories, invalid and terminal transitions, cooldown
expiry calculation, reward modification/rejection, and public exports.
