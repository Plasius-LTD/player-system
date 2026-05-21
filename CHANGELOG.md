# Changelog

All notable changes to this project will be documented in this file.

## Unreleased
- bootstrap `@plasius/player-system` from the schema package baseline with package governance, docs, tests, and demo scaffolding
- document the Event Log and Achievement runtime boundary for curated blob-backed read models, including matching design, ADR, and TDR records
- add explicit runtime timeout, cancellation, bounded-failure, and update-budget contracts under `isekai.player-system.runtime-nfr.enabled`
- accept partial nested runtime-contract overrides from TypeScript consumers
- add explicit session-data minimization, composition-scale, and portable seam contracts under `isekai.player-system.runtime-portability.enabled`
