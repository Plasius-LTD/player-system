import {
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  createPlayerSystemSessionState,
  isPlayerSystemMode,
  isPlayerSystemModule,
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
    expect(isPlayerSystemMode("invalid")).toBe(false);
  });

  it("guards valid player-system modules", () => {
    expect(isPlayerSystemModule("guild-quests")).toBe(true);
    expect(isPlayerSystemModule("unknown-module")).toBe(false);
  });

  it("guards all player-system modes", () => {
    const validModes = ["ambient", "focused"] as const;
    for (const mode of validModes) {
      expect(isPlayerSystemMode(mode)).toBe(true);
    }

    expect(isPlayerSystemMode("combat")).toBe(false);
    expect(isPlayerSystemMode("tutorial")).toBe(false);
  });

  it("guards all player-system modules", () => {
    const validModules = [
      "identity",
      "missions",
      "guild-quests",
      "logs",
      "mcc",
      "tutorial",
      "points-store",
    ] as const;
    for (const moduleName of validModules) {
      expect(isPlayerSystemModule(moduleName)).toBe(true);
    }

    const invalidModules = ["inventory", "ranking", "settings"];
    for (const moduleName of invalidModules) {
      expect(isPlayerSystemModule(moduleName)).toBe(false);
    }
  });

  it("preserves explicit session preferences and explicit null module", () => {
    const state = createPlayerSystemSessionState({
      sessionId: "awakening-002",
      mode: "focused",
      combatSafe: false,
      activeModule: "guild-quests",
      preferenceSignals: [
        {
          signalId: "sig-scan",
          kind: "exploration",
          confidence: 0.91,
          source: "demo",
        },
      ],
    });

    expect(state.activeModule).toBe("guild-quests");
    expect(state.preferenceSignals).toEqual([
      {
        signalId: "sig-scan",
        kind: "exploration",
        confidence: 0.91,
        source: "demo",
      },
    ]);

    const nullModuleState = createPlayerSystemSessionState({
      sessionId: "awakening-003",
      mode: "ambient",
      combatSafe: true,
      activeModule: null,
      preferenceSignals: [],
    });
    expect(nullModuleState.activeModule).toBeNull();
    expect(nullModuleState.preferenceSignals).toEqual([]);
  });
});
