# Changelog

All notable changes to this project will be documented in this file.
## Unreleased

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-06-22
- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-06-19
- **Added**
  - Added Player System governance runtime contracts under `isekai.player-system.governance.enabled`, including overdrive prompt state, repair-tax consequences, bounded reward preflight checks, and reusable evaluation-adapter seams.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-06-16
- gate apprenticeship recommendations on eligible crafting-authority handoffs so hybrid training routing does not surface dead-end crafting paths

## [0.1.5] - 2026-06-13
- bootstrap `@plasius/player-system` from the schema package baseline with package governance, docs, tests, and demo scaffolding
- document the Event Log and Achievement runtime boundary for curated blob-backed read models, including matching design, ADR, and TDR records
- add explicit runtime timeout, cancellation, bounded-failure, and update-budget contracts under `isekai.player-system.runtime-nfr.enabled`
- accept partial nested runtime-contract overrides from TypeScript consumers
- add explicit session-data minimization, composition-scale, and portable seam contracts under `isekai.player-system.runtime-portability.enabled`
- add focus-aware training-routing orchestration under `isekai.player-system.training-routing.enabled`, including blocked prerequisite explanations and authority-safe crafting handoff summaries
- validate training-routing runtime payloads and return immutable routing snapshots for public package consumers
- add points-store runtime orchestration under `isekai.player-system.points-store.enabled`, including PP/ESP/TIS/DIS ledger state, proto-social devolution eligibility, and civic/divine authority-boundary gating
- harden public package verification so published entrypoints must be built and included in the package tarball
- move npm publication to a protected-main-safe release-prep PR workflow with reconciled package, tag, and npm version state
- preserve release-branch version and changelog edits so protected-main publish runs can complete from prepared metadata on `main`
- detect unpublished prepared releases from `main` metadata instead of merge-commit titles so merged release PRs actually publish
- promote `Unreleased` changelog entries into versioned release sections through a tested helper instead of fragile inline shell parsing
[0.1.8]: https://github.com/Plasius-LTD/player-system/releases/tag/v0.1.8
