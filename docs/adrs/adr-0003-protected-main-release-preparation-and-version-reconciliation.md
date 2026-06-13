# ADR 0003: Protected-main releases use release-prep PRs and reconciled version state

- Status: Accepted
- Date: 2026-06-13

## Context

`@plasius/player-system` publishes from `.github/workflows/cd.yml`, but the original workflow mutated `package.json`, created tags, and pushed release metadata directly back to protected `main`.

That path failed under branch protection and left the repository in a drifted state:

- `package.json` remained at `0.1.1`,
- npm latest remained `0.1.1`,
- origin still carried a newer `v0.1.2` tag from the failed release attempt.

Without reconciling package, tag, and npm state first, future release attempts can either fail on protected-branch writes or accidentally reuse already-occupied semantic versions.

## Decision

Protected `main` releases will use a two-phase workflow:

1. `workflow_dispatch` prepares a `release/vX.Y.Z` branch and PR from `main`.
2. Merging that PR back to `main` triggers the publish job, which tags, drafts the GitHub release, publishes to npm, and then publishes the GitHub release.

Release preparation must derive its base version from the highest known semantic version across:

- `package.json`,
- the latest published npm version, and
- existing `v*` Git tags on origin.

The workflow will then apply the requested bump on top of that reconciled base so stale tags or lagging `package.json` values cannot force a duplicate or blocked release.

## Consequences

- Release metadata now flows through an approved pull-request path instead of an unauthorized direct push to protected `main`.
- Stale tags and lagging repository versions no longer block the next valid release number.
- The version-selection logic is isolated in a helper with regression tests so future release-drift bugs are easier to catch locally.

## Alternatives considered

- Keeping direct workflow pushes to `main`.
  Rejected because branch protection forbids that path and it already failed in production.
- Using `package.json` as the sole release source of truth.
  Rejected because it can lag behind origin tags or npm publication state after failed or partial release attempts.
- Manually editing release metadata after each failed run.
  Rejected because it is error-prone and does not prevent recurrence.
