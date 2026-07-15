# ADR-0008: Guild-Quest Synchronization and System Annotation Boundary

## Status

Accepted

## Date

2026-07-15

## Context

Accepted guild quests originate from guild-owned authority, while the Player
System needs a runtime projection for mission coordination. Combining those
concerns would let a renderer-neutral guidance package accidentally overwrite
guild truth or imply that a System annotation is an authoritative quest action.

## Decision

Expose `synchronizePlayerSystemGuildQuests()` behind
`isekai.player-system.guild-quests.enabled`. The function:

1. validates and deterministically normalizes bounded accepted quest records;
2. preserves normalized guild-owned state under `authority`;
3. derives mission-tag/route synergy and route-conflict state under `system`;
4. returns no runtime tracking when the feature flag is disabled; and
5. returns immutable, renderer-neutral snapshots without persistence, rendering,
   guild mutation, or authoritative route decisions.

Duplicate identifiers fail fast so synchronization cannot silently merge
ambiguous authority or mission inputs. Hosts own fetching, storage, retry,
presentation, and authoritative guild actions.

## Alternatives considered

- Let the Player System mutate guild quest state: rejected because guild-owned
  truth must remain authoritative outside this package.
- Store annotations beside authority fields in one flat record: rejected because
  consumers could not reliably distinguish derived guidance from source truth.
- Leave route conflict calculation to each host: rejected because conflict
  semantics would drift across runtime consumers.

## Consequences

Consumers receive a deterministic runtime projection that can be safely cached
or re-created from the same inputs. The feature flag is an immediate rollback
path. Hosts must pass current mission references and continue to enforce any
server-side guild authorization and persistence rules.

## NFR and release implications

Input sizes and tag counts are bounded, timestamps are normalized, returned
objects are frozen, and no player secrets or personal identifiers are accepted
by the contract. Tests cover disabled rollout, validation, immutability,
authority/annotation separation, synergy, conflicts, and idempotence. The
package follows the protected-main release workflow after merge.
