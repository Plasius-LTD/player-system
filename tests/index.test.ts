import {
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  createPlayerSystemSessionState,
  isPlayerSystemModule,
  isPlayerSystemMode,
  packageDescriptor,
} from "../src/index.js";

describe("@plasius/player-system", () => {
  it("exports the package descriptor", () => {
    expect(packageDescriptor.packageName).toBe("@plasius/player-system");
    expect(packageDescriptor.featureFlagId).toBe(PLAYER_SYSTEM_FEATURE_FLAG_ID);
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

  it("guards valid modes", () => {
    expect(isPlayerSystemMode("ambient")).toBe(true);
    expect(isPlayerSystemMode("focused")).toBe(true);
    expect(isPlayerSystemMode("invalid")).toBe(false);
  });

  it("guards every public module and rejects unknown modules", () => {
    for (const moduleName of [
      "identity",
      "missions",
      "guild-quests",
      "logs",
      "mcc",
      "tutorial",
      "points-store",
    ]) {
      expect(isPlayerSystemModule(moduleName)).toBe(true);
    }

    expect(isPlayerSystemModule("inventory")).toBe(false);
  });

  it("preserves explicit active module and preference signals", () => {
    const preferenceSignals = [
      {
        signalId: "preference-1",
        kind: "exploration" as const,
        confidence: 0.82,
        source: "quest-log",
      },
    ];

    const state = createPlayerSystemSessionState({
      sessionId: "awakening-002",
      mode: "focused",
      combatSafe: false,
      activeModule: "missions",
      preferenceSignals,
    });

    expect(state.activeModule).toBe("missions");
    expect(state.preferenceSignals).toBe(preferenceSignals);
    expect(state.combatSafe).toBe(false);
  });
});
