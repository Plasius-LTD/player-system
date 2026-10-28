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
- immutable preference-model summaries derived from bounded signal history
- module orchestration metadata
- renderer-neutral runtime coordination across ambient and focused module scopes
- points-store ledger orchestration and bounded proto-social devolution eligibility
- event-log and achievement read-model contracts
- timeout, cancellation, and bounded-failure contracts for async coordination
- transition/update budgets that downstream renderers can validate against
- authority-safe handoff readiness into external systems
- training-route recommendations, blocked prerequisite explanations, and crafting-specialization handoff readiness
- privacy-safe session-data minimization and runtime portability expectations
- adaptive mission generation, lifecycle transitions, preference-learning signals, and bounded reward decisions
- accepted guild-quest synchronization with separate guild authority and System annotations
- curated event-log recall, highlighted moments, achievement progress, and projection freshness
- MCC readiness summaries, focus-aware mission bias, bounded safety warnings, and advisory spellcraft steering
- tutorial progression, stage-based unlocks, prerequisite-aware lanes, replayable help, and reduced-combat coaching

It does not own rendering, world mutation, or institutional authority.

## Event Log and Achievement read model

The runtime surface uses the feature flag
`isekai.player-system.events-achievements.enabled` and capability
`player-system.events-achievements.view`. Hosts pass curated, privacy-safe
records to `createPlayerSystemEventAchievementReadModel()`. When either gate is
closed, the result contains no read-model data.

The read model includes deterministically ordered event-log entries,
`filterPlayerSystemEventLog()` for bounded recall filters, highlighted moments,
earned or in-progress achievement summaries, and projection freshness with a
stale indicator. Event entries expose only player-safe summaries and an
explicit `player-only` or `player-and-gossip` audience; raw event payloads,
storage layout, checkpointing, Azure Function scheduling, and achievement rule
execution remain outside this package.

## Audio and voice orchestration

The inherited feature flag for Player System audio is
`isekai.player-system.audio.enabled`.
The speech 1.x adapter translates this established gate to the canonical speech
key without changing caller configuration. A missing or disabled Player System
gate remains disabled, and an explicit canonical speech disable also vetoes
delivery. Caller snapshots are never mutated. See [ADR 0012](docs/adrs/adr-0012-speech-rollout-compatibility.md).

`resolvePlayerSystemAudioRoute()` adapts the shared `@plasius/ai-speech`
contracts to ambient, focused, and combat-safe runtime contexts. Rollout,
mute, duplicate, priority, ducking, and combat-safe delivery decisions remain
fail-closed in the shared speech policy.

`createPlayerSystemVoiceCommandRegistration()` creates renderer-neutral voice
registrations with pane scopes, command families, and explicit combat-safe
opt-in. `resolvePlayerSystemVoiceCommand()` applies the same focus and
combat-safe rules that a host voice package can consume without making this
package depend on a React runtime. Tutorial, mission, MCC, narration, and
warning command families are supported, with additional host-defined families
allowed for future modules.

## Demo

```bash
npm run build
node demo/example.mjs
```

## Usage

```ts
import {
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
  createPlayerSystemTrainingAuthorityHandoff,
  createPlayerSystemTrainingInstitutionReadiness,
  createPlayerSystemTrainingRoutingState,
  createPlayerSystemPointsStoreState,
  createPlayerSystemPreferenceModelState,
  createPlayerSystemRuntime,
  createPlayerSystemMission,
  generatePlayerSystemMission,
  applyPlayerSystemMissionTransition,
  evaluatePlayerSystemMissionReward,
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

const runtime = createPlayerSystemRuntime({
  session: {
    sessionId: "awakening-001",
    mode: "ambient",
    combatSafe: true,
  },
  modules: [
    {
      module: "missions",
      modes: ["ambient", "focused"],
      coordinate: ({ session, preferenceModel }) => {
        console.log(session.sessionId, preferenceModel.dominantKind);
        return true;
      },
    },
  ],
});

runtime.recordPreferenceSignal({
  signalId: "mission-choice-1",
  kind: "exploration",
  confidence: 0.8,
  source: "mission-choice",
});
runtime.coordinate();
runtime.focusModule("missions");
runtime.coordinate();

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

## Mission System orchestration

The inherited rollout flag is
`isekai.player-system.missions.enabled`. Hosts must pass the evaluated flag
state explicitly; a disabled state returns no proposal. With the flag enabled,
`generatePlayerSystemMission()` uses conservative bootstrap guidance until the
preference model has three corroborating signals at or above `0.65` confidence,
then ranks readiness-safe candidates using preference, MCC focus, nearby
opportunities, and world-state pressure.

```ts
const generation = generatePlayerSystemMission({
  featureFlagEnabled: true,
  readiness: 0.2,
  preferenceModel: runtime.getState().preferenceModel,
  mccFocusTarget: null,
  nearbyOpportunities: [],
  worldStatePressures: [],
  bootstrap: {
    missionId: "bootstrap-survival",
    title: "Find a safe place to rest",
    summary: "Survey the nearby clearing before nightfall.",
    preferenceKind: "exploration",
    horizon: "short-term",
    minimumReadiness: 0,
  },
  candidates: [],
});

if (generation.proposal) {
  const mission = createPlayerSystemMission({ proposal: generation.proposal });
  const accepted = applyPlayerSystemMissionTransition(runtime, mission, {
    action: "accept",
  });
  console.log(accepted.mission.state, accepted.preferenceModel.dominantKind);
}
```

Use `evaluatePlayerSystemMissionReward()` before any host reward application.
It retains governance preflight evidence and reports `approved`, `modified`, or
`rejected` with explanation metadata; rejected decisions cannot be surfaced by
the mission lifecycle.

## Guild-quest synchronization

The inherited rollout flag is
`isekai.player-system.guild-quests.enabled`. Hosts pass accepted guild-owned
quest records and current mission references to
`synchronizePlayerSystemGuildQuests()`. The helper returns no runtime tracking
when disabled. When enabled, each immutable tracking record keeps the guild
authority state under `authority` and derived Player System annotations under
`system`, including mission-tag/route synergy and route conflicts.

The helper sorts records deterministically, rejects duplicate quest or mission
identifiers, validates timestamps and bounded tag lists, and never mutates or
awards authoritative guild state. Hosts remain responsible for fetching guild
truth, persistence, presentation, and any authoritative route or quest action.

## Runtime NFR Contract

The inherited feature flag for this work is `isekai.player-system.runtime-nfr.enabled`.

`defaultPlayerSystemRuntimeContract` and `createPlayerSystemRuntimeContract()` expose:

- explicit transition, cancellation, and external-handoff time budgets
- bounded update assumptions for buffered transitions and signal batches
- caller-owned retry policy with bounded error codes for degraded paths
- partial nested overrides for timeout, update, and failure-policy values

Timeouts must be finite positive numbers (fractional milliseconds are valid).
Update limits must be non-negative safe integers; zero declares no work for that
operation. Omitted or explicitly `undefined` optional fields retain their
defaults. Invalid values, including `null`, fail immediately with a field-only
error that never includes the supplied value. Retry ownership remains `caller`,
and `cancellationRequired` accepts only booleans.

The flag identifier is a nonblank string of at most 256 UTF-16 code units.
The error vocabulary contains 1–64 nonblank strings of at most 128 code units
each. These limits bound validation and copying; sparse arrays are rejected.
Valid strings and ordering are preserved. The returned contract and its nested
budgets, policy and copied error-code array are frozen.

These are declarative contracts: hosts enforce cancellation, deadlines and
update limits using their scheduler. The package performs no remote lookup or
automatic retry. Hosts evaluate the registered
`isekai.player-system.runtime-nfr.enabled` control through the governed feature
store before adopting configured contracts. Disabled, unavailable-store and
rollback paths use the known default contract; mandatory input validation stays
active in every path. No capability or local environment gate is needed for
this package-only boundary. See [ADR 0014](docs/adrs/adr-0014-runtime-contract-validation.md).

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
- [Player System Mission Lifecycle and Reward Orchestration](./docs/design/0005-mission-lifecycle-and-reward-orchestration.md)

## MCC Guidance and Spellcraft Steering

The inherited feature flag for this work is
`isekai.player-system.mcc-guidance.enabled`.

`createPlayerSystemMccGuidanceState()` composes a bounded readiness summary,
authoritative MCC feasibility outcome, thermal/fatigue/chaos/spell-grammar
warnings, and an optional spellcraft authority handoff. Internalized,
externalized, and hybrid focus values produce deterministic mission signal
biases. The result is immutable and reports `ready`, `warning`, `blocked`, or
`disabled` state without executing authority actions or exposing raw MCC
telemetry.

MCC and Spell Crafting Systems remain responsible for final feasibility,
grammar, resource, and consequence decisions. Disable the feature flag to
remove only the derived guidance surfaces.

This boundary is documented in:

- [MCC Guidance and Spellcraft Steering](./docs/design/0007-mcc-guidance-and-spellcraft-steering.md)
- [ADR-0009: MCC Guidance and Spellcraft Authority Boundary](./docs/adrs/adr-0009-mcc-guidance-and-spellcraft-authority-boundary.md)
- [TDR-0005: MCC Guidance and Spellcraft Steering](./docs/tdrs/tdr-0005-mcc-guidance-and-spellcraft-steering.md)

## Tutorial Progression and Combat Coaching

The inherited rollout flag for this work is
`isekai.player-system.tutorial.enabled`.

`createPlayerSystemTutorialProgressionState()` models an ordered tutorial
stage, bounded step definitions, completed-step state, prerequisite blockers,
replayable completed help, and a next-step recommendation. A step is locked
until its required stage is reached and blocked when any caller-supplied
prerequisite is unsatisfied. The helper returns immutable snapshots and keeps
the tutorial package advisory: hosts still own persistence, authoritative
stage changes, and presentation.

Combat coaching is explicit about its surface. `reduced-combat` coaching can
be allowed in combat-safe mode without opening a focused pane; `focused-pane`
coaching is a separate mode and is withheld during combat-safe mode. Disable
the feature flag to remove tutorial and coaching surfaces without mutating
session or world state.

This boundary is documented in:

- [Tutorial Progression and Combat Coaching](./docs/design/0008-tutorial-progression-and-combat-coaching.md)
- [ADR-0010: Tutorial Progression and Coaching Boundary](./docs/adrs/adr-0010-tutorial-progression-and-coaching-boundary.md)
- [TDR-0006: Tutorial Progression Runtime Surface](./docs/tdrs/tdr-0006-tutorial-progression-runtime-surface.md)

<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

CI keeps the administrative contributor registry outside Git and npm package
artifacts using normalised path metadata without reading record contents.
Validation runs only for pushes inside this repository, on the approved
`Public CI - Quarantined` group with fixed `[self-hosted, Linux, X64]` labels.
The group's workflow allowlist admits `main`; a maintainer may temporarily
admit a reviewed repository branch for pre-merge checks only after locking it
against updates, including administrator pushes and fork synchronization.
Verify that the locked branch still names the reviewed SHA, and remove its
admission before unlocking or deleting it. Pull requests, fork pushes, manual dispatch and reusable
workflow calls cannot enter CI. Checkout credentials and npm cache finalization
are disabled, jobs have bounded timeouts, and a missing runner has no hosted
fallback. CI retains strict `npm ci`, coverage >= 80%, and final package checks.
Publication uses the GitHub-hosted `production` job with Node 24 and a pinned
npm 11.6.2 client. It is token-free and proceeds only while the prepared SHA
is the exact `main` head after successful push-triggered CI. Do not dispatch CD
until the npm trusted-publisher binding is verified.

The inherited stored flag `platform.public-artifact-integrity.enabled` stages
public restoration; it cannot bypass admission, CI or publication gates. Missing,
disabled or malformed flag state retains containment; enablement permits only
verified clean artifacts. Rollback disables the affected workflow/distribution
channel and retains a known clean pointer. Never restore the private record,
hosted CI, or a removed npm version. See [ADR 0013](docs/adrs/adr-0013-trusted-self-hosted-ci.md)
and the [release qualification design](docs/design/0009-public-release-qualification.md).
<!-- END PLASIUS RELEASE INTEGRITY -->
