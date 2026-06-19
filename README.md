# @plasius/player-system

[![npm version](https://img.shields.io/npm/v/@plasius/player-system.svg)](https://www.npmjs.com/package/@plasius/player-system)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/player-system/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/player-system/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/player-system)](https://codecov.io/gh/Plasius-LTD/player-system)
[![License](https://img.shields.io/github/license/Plasius-LTD/player-system)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

Non-rendering Player System orchestration contracts and helpers for Plasius game experiences.

Apache-2.0. ESM + CJS builds. TypeScript types included.

## Installation

```bash
npm install @plasius/player-system
```

## Scope

`@plasius/player-system` owns the reusable runtime-side boundary for:

- Player System session shape
- focus and combat-safe state
- preference-learning signal capture
- module orchestration metadata
- points-store ledger orchestration and bounded proto-social devolution eligibility
- event-log and achievement read-model contracts
- timeout, cancellation, and bounded-failure contracts for async coordination
- transition/update budgets that downstream renderers can validate against
- authority-safe handoff readiness into external systems
- training-route recommendations, blocked prerequisite explanations, and crafting-specialization handoff readiness
- privacy-safe session-data minimization and runtime portability expectations

It does not own rendering, world mutation, or institutional authority.

## Demo

```bash
npm run build
node demo/example.mjs
```

## Usage

```ts
import {
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  createPlayerSystemTrainingAuthorityHandoff,
  createPlayerSystemTrainingInstitutionReadiness,
  createPlayerSystemTrainingRoutingState,
  createPlayerSystemPointsStoreState,
  defaultPlayerSystemRuntimeContract,
  defaultPlayerSystemRuntimePortabilityContract,
  createPlayerSystemSessionState,
  packageDescriptor,
} from "@plasius/player-system";

const session = createPlayerSystemSessionState({
  sessionId: "awakening-001",
  mode: "ambient",
  combatSafe: true,
});

console.log(packageDescriptor.packageName, PLAYER_SYSTEM_FEATURE_FLAG_ID);
console.log(session.mode);
console.log(defaultPlayerSystemRuntimeContract.timeoutBudget.transitionMs);
console.log(defaultPlayerSystemRuntimePortabilityContract.sessionData.allowedSessionFields);

const trainingRouting = createPlayerSystemTrainingRoutingState({
  growthFocus: "hybrid",
  institutionReadiness: [
    createPlayerSystemTrainingInstitutionReadiness({
      institutionId: "academy",
      ready: true,
      label: "Academy readiness",
      requirement: "Requires an academy-candidate stage.",
      reason: "stage-unlocked",
    }),
    createPlayerSystemTrainingInstitutionReadiness({
      institutionId: "apprenticeship",
      ready: false,
      label: "Apprenticeship readiness",
      requirement: "Requires an apprenticeship-candidate stage.",
      reason: "requires-apprenticeship-stage",
      missionRequirement: "Finish the supervised workshop evaluation.",
    }),
  ],
  authorityEligibility: [
    createPlayerSystemTrainingAuthorityHandoff({
      authorityId: "training",
      eligible: true,
      label: "Institution training handoff",
      handoffSurface: "player-system:training",
      reason: "institution-ready",
    }),
    createPlayerSystemTrainingAuthorityHandoff({
      authorityId: "spellcraft",
      eligible: false,
      label: "Spellcraft handoff",
      handoffSurface: "player-system:spellcraft",
      reason: "requires-apprenticeship-stage",
      requirement: "Unlock an apprenticeship-candidate stage first.",
    }),
  ],
});

console.log(trainingRouting.recommendation.routeId);
console.log(trainingRouting.blockedPrerequisites.length);
console.log(
  createPlayerSystemPointsStoreState({
    evolutionStage: "proto-social",
    authorityBand: "civic",
  }).devolutionAction.available
);
```

## Runtime NFR Contract

The inherited feature flag for this work is `isekai.player-system.runtime-nfr.enabled`.

`defaultPlayerSystemRuntimeContract` and `createPlayerSystemRuntimeContract()` expose:

- explicit transition, cancellation, and external-handoff time budgets
- bounded update assumptions for buffered transitions and signal batches
- caller-owned retry policy with bounded error codes for degraded paths
- partial nested overrides for timeout, update, and failure-policy values

## Runtime Portability Contract

The inherited feature flag for this work is `isekai.player-system.runtime-portability.enabled`.

`defaultPlayerSystemRuntimePortabilityContract`,
`createPlayerSystemRuntimePortabilityContract()`, and
`assessPlayerSystemRuntimePortability()` make these expectations explicit:

- only the documented session and preference-signal fields belong in the package payload
- sensitive account or token fields remain forbidden at the package boundary
- multi-module and multi-pane compositions stay inside documented concurrency budgets
- host integrations provide portable adapters instead of coupling to one renderer or storage topology

## Training Routing Orchestration

The inherited feature flag for this work is
`isekai.player-system.training-routing.enabled`.

`createPlayerSystemTrainingInstitutionReadiness()`,
`createPlayerSystemTrainingAuthorityHandoff()`, and
`createPlayerSystemTrainingRoutingState()` provide:

- next-best route recommendations for field practice, barracks, school, academy, or apprenticeship
- apprenticeship recommendations only activate when at least one eligible crafting authority handoff is available
- explicit blocked prerequisite explanations, including trust and mission gates when provided by the caller
- focus-aware routing that distinguishes internalized, externalized, and hybrid growth leanings
- authority-safe handoff summaries for training plus spellcraft, item-crafting, dungeon-crafting, or interim commerce surfaces
- runtime validation for institution, focus, authority, and required string inputs with stable fail-closed errors
- immutable routing snapshots so host-side post-call mutations cannot leak back into returned readiness or handoff state
## Points Store Orchestration

The inherited feature flag for this work is
`isekai.player-system.points-store.enabled`.

`createPlayerSystemPointsStoreState()` provides:

- explicit `pp`, `esp`, `tis`, and `dis` ledger state with immutable income, outgoing, and committed-spend records
- authority-band aware gating so TIS and DIS only become spendable when the correct civic or divine boundary is active
- proto-social devolution eligibility and execution-state modeling, including social-lock closure, single-use exhaustion, and PP balance checks
- non-rendering state that matches the site-facing vocabulary closely enough for later consumer cutover without embedding renderer logic here

## Governance Runtime

The inherited feature flag for this work is
`isekai.player-system.governance.enabled`.

`createPlayerSystemGovernanceContract()`,
`createPlayerSystemGovernanceRuntimeState()`,
`createPlayerSystemOverdriveState()`,
`createPlayerSystemRepairTaxAssessment()`,
`evaluatePlayerSystemRewardPreflight()`, and
`evaluatePlayerSystemGovernanceSignals()` now provide:

- explicit overdrive consent, duration, expiry, denial, escalation, and
  auto-disengage runtime state
- child-safe vs harder-mode repair-tax consequences with MCC impairment
  messaging and affordability checks
- bounded reward preflight checks for readiness, cap pressure, and policy
  denial paths before the host surfaces a grant
- reusable evaluation-adapter seams for tutorial usefulness, mission fit,
  preference learning, voice intent, and reward-boundedness scorecards

## Governance

- ADRs: [docs/adrs](./docs/adrs)
- TDRs: [docs/tdrs](./docs/tdrs)
- Design notes: [docs/design](./docs/design)

## Release Workflow

Protected `main` releases use a two-step flow:

1. Run `.github/workflows/cd.yml` with `bump=patch|minor|major` to push a `release/vX.Y.Z` prep branch and, when repository settings allow it, open the matching PR from `main`. The workflow creates that branch before committing the versioned `package.json` and `CHANGELOG.md` updates, and a tested helper promotes the current `Unreleased` section into the matching version header so the release metadata is preserved for review and publish.
2. Merge that PR to `main` so the next `main` push can detect the unpublished versioned metadata, tag the release, publish to npm, and publish the GitHub release.

If a release version is already prepared on `main` and only publication remains, rerun `.github/workflows/cd.yml` with `bump=none` to publish the current version from `main` without creating a new release branch.

The Event Log and Achievement runtime boundary is documented in:

- [Player System Event Log and Achievement Read Model](./docs/design/0002-event-log-and-achievement-read-model.md)
- [ADR-0002: Player Event Log and Achievement Read Model Boundary](./docs/adrs/adr-0002-player-event-log-and-achievement-read-model-boundary.md)
- [TDR-0002: Player Event Log and Achievement Runtime Surface](./docs/tdrs/tdr-0002-player-event-log-and-achievement-runtime-surface.md)

Training-route orchestration is documented in:

- [Player System Training Routing Orchestration](./docs/design/0003-training-routing-orchestration.md)
