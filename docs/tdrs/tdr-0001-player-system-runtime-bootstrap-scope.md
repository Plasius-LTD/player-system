# TDR-0001: Player System Runtime Bootstrap Scope

## Summary

Bootstrap `@plasius/player-system` from the schema template with:

- dual-module package outputs
- baseline CI/CD and package checks
- runtime session and module state contracts
- portability contracts for session minimization and composition scale
- demo, docs, ADR, and test coverage

## Direction

The bootstrap should stop at orchestration and contracts. Rendering, world
mutation, and institution authority are out of scope for this package.

The portability work for feature `isekai.player-system.runtime-portability.enabled`
must keep the runtime package free of direct account identifiers, token material,
and host-specific storage or renderer assumptions.
