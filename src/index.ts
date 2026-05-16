export interface PackageDescriptor {
  readonly packageName: string;
  readonly featureFlagId: string;
  readonly envPrefix: string;
  readonly summary: string;
}

export interface RuntimeTimeoutBudget {
  readonly transitionMs: number;
  readonly idleCancellationMs: number;
  readonly externalHandoffMs: number;
}

export interface RuntimeUpdateBudget {
  readonly maxBufferedTransitions: number;
  readonly maxSignalsPerCommit: number;
  readonly maxStateSnapshotsPerTick: number;
}

export interface RuntimeFailurePolicy {
  readonly cancellationRequired: boolean;
  readonly retryOwner: "caller";
  readonly boundedErrorCodes: readonly string[];
}

export interface PlayerSystemRuntimeContract {
  readonly featureFlagId: string;
  readonly timeoutBudget: RuntimeTimeoutBudget;
  readonly updateBudget: RuntimeUpdateBudget;
  readonly failurePolicy: RuntimeFailurePolicy;
}

export type PlayerSystemMode = "ambient" | "focused";

export type PlayerSystemModule =
  | "identity"
  | "missions"
  | "guild-quests"
  | "logs"
  | "mcc"
  | "tutorial"
  | "points-store";

export type PlayerPreferenceSignalKind =
  | "combat"
  | "exploration"
  | "crafting"
  | "social"
  | "governance";

export interface PlayerPreferenceSignal {
  readonly signalId: string;
  readonly kind: PlayerPreferenceSignalKind;
  readonly confidence: number;
  readonly source: string;
}

export interface PlayerSystemSessionState {
  readonly sessionId: string;
  readonly mode: PlayerSystemMode;
  readonly combatSafe: boolean;
  readonly activeModule: PlayerSystemModule | null;
  readonly preferenceSignals: readonly PlayerPreferenceSignal[];
}

export const PLAYER_SYSTEM_PACKAGE = "@plasius/player-system";
export const PLAYER_SYSTEM_ENV_PREFIX = "PLAYER_SYSTEM";
export const PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID =
  "isekai.player-system.packages.enabled";
export const PLAYER_SYSTEM_FEATURE_FLAG_ID = PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID;
export const PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID =
  "isekai.player-system.runtime-nfr.enabled";

export const packageDescriptor: PackageDescriptor = Object.freeze({
  packageName: PLAYER_SYSTEM_PACKAGE,
  featureFlagId: PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID,
  envPrefix: PLAYER_SYSTEM_ENV_PREFIX,
  summary:
    "Non-rendering Player System orchestration contracts and helpers for Plasius game experiences.",
});

export const defaultPlayerSystemRuntimeContract: PlayerSystemRuntimeContract =
  Object.freeze({
    featureFlagId: PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID,
    timeoutBudget: Object.freeze({
      transitionMs: 150,
      idleCancellationMs: 50,
      externalHandoffMs: 500,
    }),
    updateBudget: Object.freeze({
      maxBufferedTransitions: 4,
      maxSignalsPerCommit: 12,
      maxStateSnapshotsPerTick: 2,
    }),
    failurePolicy: Object.freeze({
      cancellationRequired: true,
      retryOwner: "caller",
      boundedErrorCodes: Object.freeze([
        "PLAYER_SYSTEM_TIMEOUT",
        "PLAYER_SYSTEM_CANCELLED",
        "PLAYER_SYSTEM_DEGRADED",
      ]),
    }),
  });

export function isPlayerSystemMode(value: string): value is PlayerSystemMode {
  return value === "ambient" || value === "focused";
}

export function isPlayerSystemModule(value: string): value is PlayerSystemModule {
  return (
    value === "identity" ||
    value === "missions" ||
    value === "guild-quests" ||
    value === "logs" ||
    value === "mcc" ||
    value === "tutorial" ||
    value === "points-store"
  );
}

export function createPlayerSystemSessionState(
  input: Omit<PlayerSystemSessionState, "activeModule" | "preferenceSignals"> & {
    readonly activeModule?: PlayerSystemModule | null;
    readonly preferenceSignals?: readonly PlayerPreferenceSignal[];
  }
): PlayerSystemSessionState {
  return Object.freeze({
    sessionId: input.sessionId,
    mode: input.mode,
    combatSafe: input.combatSafe,
    activeModule: input.activeModule ?? null,
    preferenceSignals: input.preferenceSignals ?? [],
  });
}

export function createPlayerSystemRuntimeContract(
  input: Partial<PlayerSystemRuntimeContract> = {}
): PlayerSystemRuntimeContract {
  const timeoutBudget = {
    ...defaultPlayerSystemRuntimeContract.timeoutBudget,
    ...input.timeoutBudget,
  };
  const updateBudget = {
    ...defaultPlayerSystemRuntimeContract.updateBudget,
    ...input.updateBudget,
  };
  const failurePolicy = {
    ...defaultPlayerSystemRuntimeContract.failurePolicy,
    ...input.failurePolicy,
    boundedErrorCodes:
      input.failurePolicy?.boundedErrorCodes ??
      defaultPlayerSystemRuntimeContract.failurePolicy.boundedErrorCodes,
  };

  return Object.freeze({
    featureFlagId:
      input.featureFlagId ?? defaultPlayerSystemRuntimeContract.featureFlagId,
    timeoutBudget: Object.freeze(timeoutBudget),
    updateBudget: Object.freeze(updateBudget),
    failurePolicy: Object.freeze({
      ...failurePolicy,
      boundedErrorCodes: Object.freeze([...failurePolicy.boundedErrorCodes]),
    }),
  });
}
