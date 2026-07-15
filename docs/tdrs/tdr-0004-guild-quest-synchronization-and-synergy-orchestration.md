# TDR-0004: Guild-Quest Synchronization and Synergy Orchestration

## Purpose

Define the package-level contract for projecting accepted guild quests into
runtime tracking without coupling `@plasius/player-system` to guild storage,
rendering, or world authority.

## Contract

`synchronizePlayerSystemGuildQuests()` requires the caller to provide an
explicit evaluation of `isekai.player-system.guild-quests.enabled`, accepted
guild-owned records, and current mission references. Disabled rollout returns
an empty tracking collection. Enabled rollout normalizes timestamps and tags,
sorts identifiers deterministically, and emits one immutable record per quest.

Mission synergy is represented when a quest and mission share one or more tags,
or their routes align. The relationship is `strong` when routes align or more
than one tag matches, otherwise `partial`. Route conflict is represented
separately and includes accepted quests and mission references sharing the
quest route.

## Failure and rollback

Invalid input, duplicate identifiers, and over-limit collections fail fast.
Hosts own retries and persistence. Disabling the feature flag removes the
runtime tracking projection without changing guild authority data.

## Test implications

Tests cover disabled rollout, immutable output, deterministic ordering,
authority-versus-annotation separation, tag/route synergy, quest and mission
route conflicts, duplicate identifiers, and invalid timestamps or states.
