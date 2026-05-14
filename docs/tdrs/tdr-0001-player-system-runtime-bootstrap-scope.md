# TDR-0001: Player System Runtime Bootstrap Scope

## Summary

Bootstrap `@plasius/player-system` from the schema template with:

- dual-module package outputs
- baseline CI/CD and package checks
- runtime session and module state contracts
- demo, docs, ADR, and test coverage
- inherited feature flag `isekai.player-system.packages.enabled`

## Direction

The bootstrap should stop at orchestration and contracts. Rendering, world
mutation, and institution authority are out of scope for this package.

The package must inherit the shared package-family flag instead of introducing
its own package-specific rollout key during bootstrap.
