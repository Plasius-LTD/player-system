# ADR 0014: Validate runtime contracts before exposing them

## Status

Accepted — Project Task player-system#14, parent Feature plasius-ltd-site#714.

## Context

The existing factory merges and freezes runtime contract overrides but accepts
negative/nonfinite deadlines, fractional or unsafe update counts and malformed
failure policies. Downstream renderers cannot reliably enforce bounded work
from these values. The Task's May 26 follow-up identifies this remaining gap.
Existing package factories and assertion helpers already provide the correct
boundary; no additional package or dependency is required.

## Decision

Validate before returning a snapshot. Deadline values must be finite and
positive; fractional milliseconds remain valid. Update counts must be safe
non-negative integers, including zero for deliberately disabled work. Optional
`undefined` fields use defaults; explicit invalid values do not silently default.
Only boolean cancellation policy and caller-owned retries are supported.

Require a nonblank flag identifier of at most 256 UTF-16 code units and 1–64
nonblank error codes of at most 128 code units each. The bounded vocabulary
limits iteration and copied memory without changing ordinary code lists. Check
array length before iterating, including sparse entries. Preserve valid string
values and ordering, copy the code list, and freeze all returned contract layers.
Errors identify only the fixed field and constraint, never caller data.

Reject null/non-object inputs and nested overrides. This is validation of the
declared contract, not a sandbox for hostile objects, getters or proxies.
The factory does not schedule work, start timers, perform I/O, retry or mutate
caller objects. Hosts still implement actual cancellation and work limits.

## Alternatives

- Silently replace invalid configuration: rejected because it hides operational
  mistakes and can expand work beyond a caller's intended budget.
- Preserve unchecked overrides: rejected because immutable invalid data does
  not satisfy the bounded-work contract.
- Add a validation dependency or alternate factory: unnecessary for this small
  existing package boundary and would introduce avoidable API/dependency churn.

## Rollout and rollback

Inherit registered `isekai.player-system.runtime-nfr.enabled`; no live control
change is part of this package fix. The host's governed store evaluator owns
consumer adoption. Enabled hosts may adopt validated configured contracts;
disabled, unavailable-store and rollback paths retain the known default
contract. Validation remains unconditional and cannot be bypassed by flag ID.
Capability changes are N/A: no entitlement or UI surface changes. This package
contains no evaluator or environment override, so remote-state integration tests
belong to consuming hosts; default/partial/custom-ID/invalid-input coverage
verifies this pure factory boundary.

## Verification and release

Requirements-derived regression cases cover numeric domains, optional defaults,
malformed JavaScript inputs, bounded vocabularies, string limits, immutability
and positive compatibility. Run full tests/LCOV (including changed src/index.ts),
lint, types, build, package admission/pack, runtime audit and installed ESM/CJS
and declaration consumers. No dependency or public type signature changes.

Ship through the existing reviewed-branch quarantine procedure, genuine push CI,
main release-preparation PR and cd.yml production/OIDC publication. The release
pipeline owns version/changelog promotion. Invalid inputs now throw intentionally;
document this fix in README and Unreleased before release. No site deployment,
UI/SEO change, backend ACA secretref change or new public package is involved.
