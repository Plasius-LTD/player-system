# Guild-Quest Synchronization and Synergy Orchestration

## Goal

Give Player System consumers a stable runtime view of accepted guild quests
while preserving guild-owned quest truth as the authority boundary.

## Design

The caller supplies accepted quest authority records and current mission
references. `synchronizePlayerSystemGuildQuests()` validates the bounded input,
normalizes timestamps and tags, and returns immutable tracking records. Each
record has two explicit branches:

- `authority`: accepted guild ID, quest identity, user-facing quest metadata,
  route, timestamps, and source version;
- `system`: synchronization timestamp, derived mission synergy, and route
  conflict annotations.

Shared tags and aligned routes produce mission-synergy entries. A quest route
is marked conflicted when another accepted quest or a referenced mission uses
the same route. This is guidance metadata only; it does not claim or mutate a
route, quest, guild, or world state.

## Rollout and rollback

The inherited flag is `isekai.player-system.guild-quests.enabled`. Hosts should
evaluate the parent Player System rollout before this child flag. To roll back,
disable the child flag; the function returns no runtime tracking.

## Operational boundaries

The package does not fetch or persist guild data, resolve authorization, render
quest UI, schedule retries, or apply route actions. Hosts own those concerns and
must continue to validate guild authority at the server boundary.
