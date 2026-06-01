import {
  PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID,
  assessPlayerSystemRuntimePortability,
  createPlayerSystemSessionState,
  createPlayerSystemRuntimeContract,
  createPlayerSystemRuntimePortabilityContract,
  defaultPlayerSystemRuntimeContract,
  defaultPlayerSystemRuntimePortabilityContract,
  isPlayerSystemModule,
  isPlayerSystemMode,
  packageDescriptor,
} from "../src/index.js";

describe("@plasius/player-system", () => {
  it("exports the package descriptor", () => {
    expect(packageDescriptor.packageName).toBe("@plasius/player-system");
    expect(packageDescriptor.featureFlagId).toBe(
      PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID
    );
    expect(PLAYER_SYSTEM_FEATURE_FLAG_ID).toBe(
      PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID
    );
  });

  it("creates a defaulted session state", () => {
    const state = createPlayerSystemSessionState({
      sessionId: "awakening-001",
      mode: "ambient",
      combatSafe: true,
    });

    expect(state.activeModule).toBeNull();
    expect(state.preferenceSignals).toEqual([]);
  });

  it("preserves explicit module and preference signals", () => {
    const state = createPlayerSystemSessionState({
      sessionId: "awakening-002",
      mode: "focused",
      combatSafe: false,
      activeModule: "missions",
      preferenceSignals: [
        {
          signalId: "sig-1",
          kind: "combat",
          confidence: 0.9,
          source: "quest-log",
        },
      ],
    });

    expect(state.activeModule).toBe("missions");
    expect(state.preferenceSignals).toHaveLength(1);
    expect(Object.isFrozen(state.preferenceSignals)).toBe(true);
    expect(Object.isFrozen(state.preferenceSignals[0])).toBe(true);
  });

  it("guards valid modes", () => {
    expect(isPlayerSystemMode("ambient")).toBe(true);
    expect(isPlayerSystemMode("focused")).toBe(true);
    expect(isPlayerSystemMode("invalid")).toBe(false);
  });

  it("guards valid modules", () => {
    expect(isPlayerSystemModule("identity")).toBe(true);
    expect(isPlayerSystemModule("missions")).toBe(true);
    expect(isPlayerSystemModule("guild-quests")).toBe(true);
    expect(isPlayerSystemModule("logs")).toBe(true);
    expect(isPlayerSystemModule("mcc")).toBe(true);
    expect(isPlayerSystemModule("tutorial")).toBe(true);
    expect(isPlayerSystemModule("points-store")).toBe(true);
    expect(isPlayerSystemModule("invalid")).toBe(false);
  });

  it("exports runtime NFR defaults behind the inherited feature flag", () => {
    expect(defaultPlayerSystemRuntimeContract.featureFlagId).toBe(
      PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID
    );
    expect(defaultPlayerSystemRuntimeContract.timeoutBudget.transitionMs).toBe(150);
    expect(defaultPlayerSystemRuntimeContract.failurePolicy.retryOwner).toBe(
      "caller"
    );
    expect(
      defaultPlayerSystemRuntimeContract.failurePolicy.boundedErrorCodes
    ).toContain("PLAYER_SYSTEM_TIMEOUT");
  });

  it("creates overridable runtime contracts with frozen nested budgets", () => {
    const contract = createPlayerSystemRuntimeContract({
      timeoutBudget: { externalHandoffMs: 900 },
      updateBudget: { maxSignalsPerCommit: 8 },
      failurePolicy: { boundedErrorCodes: ["PLAYER_SYSTEM_CANCELLED"] },
    });

    expect(contract.featureFlagId).toBe(PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID);
    expect(contract.timeoutBudget.transitionMs).toBe(150);
    expect(contract.timeoutBudget.externalHandoffMs).toBe(900);
    expect(contract.updateBudget.maxSignalsPerCommit).toBe(8);
    expect(contract.failurePolicy.boundedErrorCodes).toEqual([
      "PLAYER_SYSTEM_CANCELLED",
    ]);
    expect(Object.isFrozen(contract.timeoutBudget)).toBe(true);
    expect(Object.isFrozen(contract.failurePolicy.boundedErrorCodes)).toBe(true);
  });

  it("accepts partial nested runtime overrides from TypeScript consumers", () => {
    const input = {
      timeoutBudget: { externalHandoffMs: 900 },
      updateBudget: { maxSignalsPerCommit: 8 },
      failurePolicy: { boundedErrorCodes: ["PLAYER_SYSTEM_DEGRADED"] },
    } satisfies Parameters<typeof createPlayerSystemRuntimeContract>[0];

    const contract = createPlayerSystemRuntimeContract(input);

    expect(contract.timeoutBudget.externalHandoffMs).toBe(900);
    expect(contract.timeoutBudget.transitionMs).toBe(150);
    expect(contract.updateBudget.maxSignalsPerCommit).toBe(8);
    expect(contract.updateBudget.maxBufferedTransitions).toBe(4);
    expect(contract.failurePolicy.cancellationRequired).toBe(true);
    expect(contract.failurePolicy.boundedErrorCodes).toEqual([
      "PLAYER_SYSTEM_DEGRADED",
    ]);
  });

  it("keeps bounded error defaults when only failure policy flags are overridden", () => {
    const contract = createPlayerSystemRuntimeContract({
      failurePolicy: { cancellationRequired: false },
    });

    expect(contract.failurePolicy.cancellationRequired).toBe(false);
    expect(contract.failurePolicy.boundedErrorCodes).toEqual(
      defaultPlayerSystemRuntimeContract.failurePolicy.boundedErrorCodes
    );
  });

  it("exports a portability contract behind the inherited runtime-portability feature flag", () => {
    expect(defaultPlayerSystemRuntimePortabilityContract.featureFlagId).toBe(
      PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID
    );
    expect(
      defaultPlayerSystemRuntimePortabilityContract.sessionData.allowedSessionFields
    ).toEqual([
      "sessionId",
      "mode",
      "combatSafe",
      "activeModule",
      "preferenceSignals",
    ]);
    expect(
      defaultPlayerSystemRuntimePortabilityContract.sessionData.forbiddenSensitiveFields
    ).toContain("refreshToken");
  });

  it("creates overridable portability contracts with frozen nested policy arrays", () => {
    const contract = createPlayerSystemRuntimePortabilityContract({
      sessionData: {
        maxRetainedPreferenceSignals: 6,
        forbiddenSensitiveFields: ["email", "refreshToken"],
      },
      compositionScale: {
        maxConcurrentModules: 2,
      },
      portableSeams: {
        supportedHosts: ["headless-test"],
      },
    });

    expect(contract.featureFlagId).toBe(
      PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID
    );
    expect(contract.sessionData.maxRetainedPreferenceSignals).toBe(6);
    expect(contract.compositionScale.maxConcurrentModules).toBe(2);
    expect(contract.portableSeams.supportedHosts).toEqual(["headless-test"]);
    expect(Object.isFrozen(contract.sessionData.allowedSessionFields)).toBe(true);
    expect(Object.isFrozen(contract.portableSeams.supportedHosts)).toBe(true);
  });

  it("keeps default sensitive fields and supported hosts when adjacent settings change", () => {
    const contract = createPlayerSystemRuntimePortabilityContract({
      sessionData: {
        maxRetainedPreferenceSignals: 4,
      },
      portableSeams: {
        requiredAdapters: ["clock"],
      },
    });

    expect(contract.sessionData.maxRetainedPreferenceSignals).toBe(4);
    expect(contract.sessionData.forbiddenSensitiveFields).toEqual(
      defaultPlayerSystemRuntimePortabilityContract.sessionData
        .forbiddenSensitiveFields
    );
    expect(contract.portableSeams.supportedHosts).toEqual(
      defaultPlayerSystemRuntimePortabilityContract.portableSeams.supportedHosts
    );
    expect(contract.portableSeams.requiredAdapters).toEqual(["clock"]);
  });

  it("assesses runtime composition samples against the documented scale assumptions", () => {
    const accepted = assessPlayerSystemRuntimePortability({
      concurrentModules: 3,
      paneConsumers: 4,
      backgroundTransitions: 4,
    });
    const rejected = assessPlayerSystemRuntimePortability({
      concurrentModules: 4,
      paneConsumers: 5,
      backgroundTransitions: 6,
    });

    expect(accepted.accepted).toBe(true);
    expect(accepted.violations).toEqual([]);
    expect(rejected.accepted).toBe(false);
    expect(rejected.violations).toEqual([
      "concurrentModules",
      "paneConsumers",
      "backgroundTransitions",
    ]);
  });
});
