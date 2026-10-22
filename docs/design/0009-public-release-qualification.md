# Public release qualification

Project Task player-system#79 inherits Feature plasius-ltd-site#1597 and stored
flag `platform.public-artifact-integrity.enabled`. [ADR 0013](../adrs/adr-0013-trusted-self-hosted-ci.md)
defines the runner decision; ADR 0011 defines hosted OIDC publication.

## Qualification sequence

1. Inspect current tree and proposed Git index path metadata before packing.
   Reject the administrative contributor registry and normalized variants without
   reading its contents. Keep the package allowlist limited to `dist`.
2. Run a frozen install, runtime tests/coverage, lint, strict declarations, build,
   audit, final artifact checks and pack/dry-publication checks. Workflow contract
   tests cover both validation jobs and preserve exact-main hosted OIDC release.
   The regular test include pattern also runs the existing `.test.mjs` release
   version/changelog regressions; they must not be silently omitted.
3. Review and push a repository branch while it is not admitted. Lock it with
   `lock_branch=true`, `enforce_admins=true`, `allow_fork_syncing=false`, and
   verify both protection readback and exact reviewed HEAD. Only then admit its
   exact `ci.yml` ref to the quarantined group. PATCH only `selected_workflows`;
   capture and verify both repository IDs and workflow refs before/after, without
   resubmitting visibility or broadening access. Verify actual jobs ran on
   approved capacity. Remove admission before unlocking/deleting the branch or
   pushing a correction; review and lock the corrected head before readmission.
   Fork PRs cannot execute on this route.
4. Review and merge the focused PR. Observe genuine successful push CI for the
   merged `main`. Use existing `cd.yml` prepare phase to allocate a new unused
   patch version and promote Unreleased notes. Never edit release sections by hand.
5. Verify genuine push CI for the prepared main SHA, hosted production/OIDC CD,
   public package metadata, tarball integrity/provenance, public GitHub release,
   and registry-only ESM/CJS/declaration consumers. Only then complete Task #79.

## Non-functional acceptance

- Security/privacy: trusted repository/event and fixed group; read-only CI,
  non-persistent credentials; metadata-only rejection and narrow package paths.
- Reliability/performance: finite jobs, no hosted fallback or repeated dispatch
  storm; keep existing runtime behavior and package size characteristics.
- Reproducibility/dependencies: frozen lock, strict peer resolution, >=80% line
  coverage, build/pack/audit checks and real installed consumers; no dependency
  changes unless required to resolve an observed failure.
- Maintainability/observability: regression tests, ADR/README/contribution
  guidance and direct immutable Actions/registry evidence on the Task.
- Accessibility/SEO/browser UI/ACA secretrefs: N/A for this non-rendering package
  CI-policy change. No interface or backend Container App deployment changes.

## Rollout and rollback

The persisted flag is evaluated by the platform restoration orchestrator,
outside this package. Enabled, disabled and fallback semantics are inherited
from Feature #1597/Task #1601; mandatory admission and release controls never
consult it. Rollback retains containment or a known clean pointer and disables
the affected workflow/channel. It never restores prohibited records, removed
versions, hosted CI or npm write-token fallbacks.
