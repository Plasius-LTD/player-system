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
- event-log and achievement read-model contracts
- timeout, cancellation, and bounded-failure contracts for async coordination
- transition/update budgets that downstream renderers can validate against
- authority-safe handoff readiness into external systems

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
  defaultPlayerSystemRuntimeContract,
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
```

## Runtime NFR Contract

The inherited feature flag for this work is `isekai.player-system.runtime-nfr.enabled`.

`defaultPlayerSystemRuntimeContract` and `createPlayerSystemRuntimeContract()` expose:

- explicit transition, cancellation, and external-handoff time budgets
- bounded update assumptions for buffered transitions and signal batches
- caller-owned retry policy with bounded error codes for degraded paths
- partial nested overrides for timeout, update, and failure-policy values

## Governance

- ADRs: [docs/adrs](./docs/adrs)
- TDRs: [docs/tdrs](./docs/tdrs)
- Design notes: [docs/design](./docs/design)

The Event Log and Achievement runtime boundary is documented in:

- [Player System Event Log and Achievement Read Model](./docs/design/0002-event-log-and-achievement-read-model.md)
- [ADR-0002: Player Event Log and Achievement Read Model Boundary](./docs/adrs/adr-0002-player-event-log-and-achievement-read-model-boundary.md)
- [TDR-0002: Player Event Log and Achievement Runtime Surface](./docs/tdrs/tdr-0002-player-event-log-and-achievement-runtime-surface.md)
