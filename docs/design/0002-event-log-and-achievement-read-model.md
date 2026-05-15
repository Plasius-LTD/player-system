# Player System Event Log and Achievement Read Model

## Goal

Define the package-local runtime boundary for Player System event recall and
achievement surfaces backed by curated blob JSON datasets.

## Runtime Surface

- event-log entries, filters, and highlighted moments
- earned-achievement summaries and in-progress achievement tracks
- freshness metadata such as last projection time and source lag
- feature-flag and capability identifiers used by host runtimes

## External Ownership

- raw observed-event capture
- blob persistence layout and retention
- timer-triggered Azure Function batch processing
- normalization, deduplication, compaction, and achievement projection
- gossip export execution

## Package Direction

`@plasius/player-system` should model only the player-facing read model that
host runtimes consume after backend processing has produced curated datasets.

The package should rely on `@plasius/schema`-driven contracts for privacy-safe
field exposure and should assume that no sensitive data beyond `playerId`
appears in the curated payloads it represents.

## Exclusions

- renderer or overlay implementation
- raw event-lake checkpointing and replay control
- world-authority decisions or achievement adjudication logic
