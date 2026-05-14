import {
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  createPlayerSystemSessionState,
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
    expect(isPlayerSystemMode("invalid")).toBe(false);
  });
});
