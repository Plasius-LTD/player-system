# TDR-0005: MCC Guidance and Spellcraft Steering

## Runtime contract

`createPlayerSystemMccGuidanceState()` accepts:

- a feature-flag decision;
- one of the `internalized`, `externalized`, or `hybrid` growth focuses;
- a bounded readiness summary (`stable`, `pressured`, or `restricted`);
- an authoritative feasibility outcome (`feasible`, `conditional`, or
  `blocked`);
- up to eight thermal, fatigue, chaos, or spell-grammar warnings; and
- an optional `spellcraft` authority handoff.

The result includes a `ready`, `warning`, `blocked`, or `disabled` state,
focus-aware mission signal bias, the normalized readiness warnings, and an
advisory spellcraft verdict. A restricted readiness band, blocked feasibility,
blocking warning, or ineligible spellcraft handoff blocks the guidance verdict.
Pressure, conditional feasibility, or non-blocking warnings produce a warning
state. The helper never treats a recommended preview as authorization.

## Failure and privacy boundaries

Invalid focus, status, warning, handoff, or required text inputs fail closed.
The contract stores summaries and warning kinds only; callers must not pass
raw account data, credentials, storage identifiers, or unbounded telemetry.

## Verification

Tests cover enabled and disabled rollout, all three focus biases, state
derivation, warning preservation, handoff validation, immutable output, and
bounded input rejection.
