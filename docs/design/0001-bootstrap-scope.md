# Player System Runtime Bootstrap

## Goal

Provide a package-standard bootstrap for the Player System runtime boundary.

## Initial Surface

- package descriptor and feature-flag metadata
- Player System mode and module contracts
- preference signal shape
- session-state helper
- runtime portability contract and composition assessment helper

## Exclusions

- 3D interface rendering
- institutional progression authority
- spell, item, or dungeon crafting execution

## Portability Notes

- The package payload keeps only runtime-safe session and preference data.
- Sensitive account or token fields stay outside the package boundary.
- Host integrations are expected to provide portable adapters for clock,
  scheduling, storage, and telemetry.
