import {
  isMccExpressionTrack,
  type MccExpressionTrack,
  type TrainingInstitutionType,
} from "@plasius/training";

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

export interface SessionDataMinimizationContract {
  readonly allowedSessionFields: readonly (keyof PlayerSystemSessionState)[];
  readonly allowedPreferenceSignalFields: readonly (keyof PlayerPreferenceSignal)[];
  readonly forbiddenSensitiveFields: readonly string[];
  readonly maxRetainedPreferenceSignals: number;
}

export type RuntimeHostKind = "browser" | "native-shell" | "headless-test";

export type RuntimeAdapterKind =
  | "clock"
  | "scheduler"
  | "storage"
  | "telemetry-sink";

export interface RuntimePortableSeamContract {
  readonly supportedHosts: readonly RuntimeHostKind[];
  readonly requiredAdapters: readonly RuntimeAdapterKind[];
  readonly forbiddenCouplings: readonly string[];
}

export interface RuntimeCompositionScaleContract {
  readonly maxConcurrentModules: number;
  readonly maxConcurrentPaneConsumers: number;
  readonly maxBackgroundTransitions: number;
}

export interface PlayerSystemRuntimeContract {
  readonly featureFlagId: string;
  readonly timeoutBudget: RuntimeTimeoutBudget;
  readonly updateBudget: RuntimeUpdateBudget;
  readonly failurePolicy: RuntimeFailurePolicy;
}

export interface PlayerSystemRuntimePortabilityContract {
  readonly featureFlagId: string;
  readonly sessionData: SessionDataMinimizationContract;
  readonly compositionScale: RuntimeCompositionScaleContract;
  readonly portableSeams: RuntimePortableSeamContract;
}

export interface PlayerSystemRuntimeContractInput {
  readonly featureFlagId?: string;
  readonly timeoutBudget?: Partial<RuntimeTimeoutBudget>;
  readonly updateBudget?: Partial<RuntimeUpdateBudget>;
  readonly failurePolicy?: Partial<RuntimeFailurePolicy>;
}

export interface PlayerSystemRuntimePortabilityContractInput {
  readonly featureFlagId?: string;
  readonly sessionData?: Partial<SessionDataMinimizationContract>;
  readonly compositionScale?: Partial<RuntimeCompositionScaleContract>;
  readonly portableSeams?: Partial<RuntimePortableSeamContract>;
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

export interface PlayerSystemCompositionSample {
  readonly concurrentModules: number;
  readonly paneConsumers: number;
  readonly backgroundTransitions: number;
}

export interface PlayerSystemContractAssessment {
  readonly accepted: boolean;
  readonly violations: readonly string[];
}

export type PlayerSystemTrainingRouteId =
  | "field-practice"
  | TrainingInstitutionType;

export type PlayerSystemTrainingAuthorityId =
  | "training"
  | "commerce"
  | "spellcraft"
  | "item-crafting"
  | "dungeon-crafting";

export type PlayerSystemTrainingRoutingReason =
  | "no-institution-ready"
  | "focus-internalized"
  | "focus-externalized"
  | "focus-hybrid"
  | "advanced-academy"
  | "crafting-apprenticeship";

export interface PlayerSystemTrainingInstitutionReadiness {
  readonly institutionId: TrainingInstitutionType;
  readonly ready: boolean;
  readonly label: string;
  readonly requirement: string;
  readonly reason: string;
  readonly supportedTracks: readonly MccExpressionTrack[];
  readonly trustRequirement: string | null;
  readonly missionRequirement: string | null;
}

export interface PlayerSystemTrainingInstitutionReadinessInput {
  readonly institutionId: TrainingInstitutionType;
  readonly ready: boolean;
  readonly label: string;
  readonly requirement: string;
  readonly reason: string;
  readonly supportedTracks?: readonly MccExpressionTrack[];
  readonly trustRequirement?: string | null;
  readonly missionRequirement?: string | null;
}

export interface PlayerSystemTrainingAuthorityHandoff {
  readonly authorityId: PlayerSystemTrainingAuthorityId;
  readonly eligible: boolean;
  readonly label: string;
  readonly handoffSurface: string;
  readonly reason: string;
  readonly requirement: string | null;
}

export interface PlayerSystemTrainingAuthorityHandoffInput {
  readonly authorityId: PlayerSystemTrainingAuthorityId;
  readonly eligible: boolean;
  readonly label: string;
  readonly handoffSurface: string;
  readonly reason: string;
  readonly requirement?: string | null;
}

export interface PlayerSystemTrainingRecommendation {
  readonly routeId: PlayerSystemTrainingRouteId;
  readonly focus: MccExpressionTrack;
  readonly reason: PlayerSystemTrainingRoutingReason;
}

export interface PlayerSystemTrainingPrerequisiteExplanation {
  readonly institutionId: TrainingInstitutionType;
  readonly label: string;
  readonly requirement: string;
  readonly reason: string;
  readonly trustRequirement: string | null;
  readonly missionRequirement: string | null;
}

export interface PlayerSystemTrainingRoutingState {
  readonly featureFlagId: string;
  readonly recommendation: PlayerSystemTrainingRecommendation;
  readonly readyInstitutions: readonly PlayerSystemTrainingInstitutionReadiness[];
  readonly blockedPrerequisites: readonly PlayerSystemTrainingPrerequisiteExplanation[];
  readonly trainingAuthority: PlayerSystemTrainingAuthorityHandoff | null;
  readonly craftingAuthorities: readonly PlayerSystemTrainingAuthorityHandoff[];
}

export interface PlayerSystemTrainingRoutingInput {
  readonly growthFocus: MccExpressionTrack;
  readonly institutionReadiness: readonly PlayerSystemTrainingInstitutionReadiness[];
  readonly authorityEligibility: readonly PlayerSystemTrainingAuthorityHandoff[];
}

export const PLAYER_SYSTEM_PACKAGE = "@plasius/player-system";
export const PLAYER_SYSTEM_ENV_PREFIX = "PLAYER_SYSTEM";
export const PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID =
  "isekai.player-system.packages.enabled";
export const PLAYER_SYSTEM_FEATURE_FLAG_ID = PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID;
export const PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID =
  "isekai.player-system.runtime-nfr.enabled";
export const PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID =
  "isekai.player-system.runtime-portability.enabled";
export const PLAYER_SYSTEM_TRAINING_ROUTING_FEATURE_FLAG_ID =
  "isekai.player-system.training-routing.enabled";

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

export const defaultPlayerSystemRuntimePortabilityContract: PlayerSystemRuntimePortabilityContract =
  Object.freeze({
    featureFlagId: PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID,
    sessionData: Object.freeze({
      allowedSessionFields: Object.freeze([
        "sessionId",
        "mode",
        "combatSafe",
        "activeModule",
        "preferenceSignals",
      ] satisfies (keyof PlayerSystemSessionState)[]),
      allowedPreferenceSignalFields: Object.freeze([
        "signalId",
        "kind",
        "confidence",
        "source",
      ] satisfies (keyof PlayerPreferenceSignal)[]),
      forbiddenSensitiveFields: Object.freeze([
        "email",
        "accountId",
        "oauthSubject",
        "accessToken",
        "refreshToken",
      ]),
      maxRetainedPreferenceSignals: 12,
    }),
    compositionScale: Object.freeze({
      maxConcurrentModules: 3,
      maxConcurrentPaneConsumers: 4,
      maxBackgroundTransitions: 4,
    }),
    portableSeams: Object.freeze({
      supportedHosts: Object.freeze([
        "browser",
        "native-shell",
        "headless-test",
      ] satisfies RuntimeHostKind[]),
      requiredAdapters: Object.freeze([
        "clock",
        "scheduler",
        "storage",
        "telemetry-sink",
      ] satisfies RuntimeAdapterKind[]),
      forbiddenCouplings: Object.freeze([
        "dom-document",
        "window-global",
        "absolute-file-path",
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
  const preferenceSignals = Object.freeze(
    (input.preferenceSignals ?? []).map((signal) => Object.freeze({ ...signal }))
  );

  return Object.freeze({
    sessionId: input.sessionId,
    mode: input.mode,
    combatSafe: input.combatSafe,
    activeModule: input.activeModule ?? null,
    preferenceSignals,
  });
}

export function createPlayerSystemRuntimeContract(
  input: PlayerSystemRuntimeContractInput = {}
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

export function createPlayerSystemRuntimePortabilityContract(
  input: PlayerSystemRuntimePortabilityContractInput = {}
): PlayerSystemRuntimePortabilityContract {
  return Object.freeze({
    featureFlagId:
      input.featureFlagId ??
      defaultPlayerSystemRuntimePortabilityContract.featureFlagId,
    sessionData: Object.freeze({
      ...defaultPlayerSystemRuntimePortabilityContract.sessionData,
      ...input.sessionData,
      allowedSessionFields: Object.freeze([
        ...(input.sessionData?.allowedSessionFields ??
          defaultPlayerSystemRuntimePortabilityContract.sessionData
            .allowedSessionFields),
      ]),
      allowedPreferenceSignalFields: Object.freeze([
        ...(input.sessionData?.allowedPreferenceSignalFields ??
          defaultPlayerSystemRuntimePortabilityContract.sessionData
            .allowedPreferenceSignalFields),
      ]),
      forbiddenSensitiveFields: Object.freeze([
        ...(input.sessionData?.forbiddenSensitiveFields ??
          defaultPlayerSystemRuntimePortabilityContract.sessionData
            .forbiddenSensitiveFields),
      ]),
    }),
    compositionScale: Object.freeze({
      ...defaultPlayerSystemRuntimePortabilityContract.compositionScale,
      ...input.compositionScale,
    }),
    portableSeams: Object.freeze({
      ...defaultPlayerSystemRuntimePortabilityContract.portableSeams,
      ...input.portableSeams,
      supportedHosts: Object.freeze([
        ...(input.portableSeams?.supportedHosts ??
          defaultPlayerSystemRuntimePortabilityContract.portableSeams
            .supportedHosts),
      ]),
      requiredAdapters: Object.freeze([
        ...(input.portableSeams?.requiredAdapters ??
          defaultPlayerSystemRuntimePortabilityContract.portableSeams
            .requiredAdapters),
      ]),
      forbiddenCouplings: Object.freeze([
        ...(input.portableSeams?.forbiddenCouplings ??
          defaultPlayerSystemRuntimePortabilityContract.portableSeams
            .forbiddenCouplings),
      ]),
    }),
  });
}

const DEFAULT_TRACK_SUPPORT_BY_INSTITUTION: Record<
  TrainingInstitutionType,
  readonly MccExpressionTrack[]
> = Object.freeze({
  barracks: Object.freeze([
    "internalized",
    "hybrid",
  ] satisfies MccExpressionTrack[]),
  school: Object.freeze([
    "externalized",
    "hybrid",
  ] satisfies MccExpressionTrack[]),
  academy: Object.freeze([
    "internalized",
    "externalized",
    "hybrid",
  ] satisfies MccExpressionTrack[]),
  apprenticeship: Object.freeze([
    "externalized",
    "hybrid",
  ] satisfies MccExpressionTrack[]),
});

const ROUTE_PRIORITY_BY_FOCUS: Record<
  MccExpressionTrack,
  readonly TrainingInstitutionType[]
> = Object.freeze({
  internalized: Object.freeze(
    ["academy", "barracks", "school", "apprenticeship"] satisfies
      TrainingInstitutionType[]
  ),
  externalized: Object.freeze(
    ["apprenticeship", "academy", "school", "barracks"] satisfies
      TrainingInstitutionType[]
  ),
  hybrid: Object.freeze(
    ["apprenticeship", "academy", "school", "barracks"] satisfies
      TrainingInstitutionType[]
  ),
});

const SUPPORTED_TRAINING_INSTITUTIONS = Object.freeze([
  "school",
  "barracks",
  "academy",
  "apprenticeship",
] satisfies TrainingInstitutionType[]);

const SUPPORTED_TRAINING_AUTHORITIES = Object.freeze([
  "training",
  "commerce",
  "spellcraft",
  "item-crafting",
  "dungeon-crafting",
] satisfies PlayerSystemTrainingAuthorityId[]);

function freezeReadonlyArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function assertBoolean(value: unknown, label: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean`);
  }
}

function assertNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a non-empty string`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  return trimmed;
}

function isTrainingInstitutionType(value: string): value is TrainingInstitutionType {
  return SUPPORTED_TRAINING_INSTITUTIONS.includes(value as TrainingInstitutionType);
}

function assertTrainingInstitutionType(
  value: unknown,
  label: string
): asserts value is TrainingInstitutionType {
  if (typeof value !== "string" || !isTrainingInstitutionType(value)) {
    throw new Error(`${label} must be a supported training institution`);
  }
}

function isPlayerSystemTrainingAuthorityId(
  value: string
): value is PlayerSystemTrainingAuthorityId {
  return SUPPORTED_TRAINING_AUTHORITIES.includes(
    value as PlayerSystemTrainingAuthorityId
  );
}

function assertPlayerSystemTrainingAuthorityId(
  value: unknown,
  label: string
): asserts value is PlayerSystemTrainingAuthorityId {
  if (typeof value !== "string" || !isPlayerSystemTrainingAuthorityId(value)) {
    throw new Error(`${label} must be a supported training authority`);
  }
}

function cloneSupportedTracks(
  supportedTracks: readonly MccExpressionTrack[] | undefined,
  institutionId: TrainingInstitutionType
): readonly MccExpressionTrack[] {
  const normalizedTracks = supportedTracks
    ? [...supportedTracks]
    : [...DEFAULT_TRACK_SUPPORT_BY_INSTITUTION[institutionId]];

  if (normalizedTracks.length === 0) {
    throw new Error(
      "supportedTracks must contain at least one supported MCC expression track"
    );
  }

  for (const track of normalizedTracks) {
    if (!isMccExpressionTrack(track)) {
      throw new Error(
        "supportedTracks must contain only supported MCC expression tracks"
      );
    }
  }

  return freezeReadonlyArray(normalizedTracks);
}

function normalizeNullableString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function createPlayerSystemTrainingInstitutionReadiness(
  input: PlayerSystemTrainingInstitutionReadinessInput
): PlayerSystemTrainingInstitutionReadiness {
  assertTrainingInstitutionType(input.institutionId, "institutionId");
  assertBoolean(input.ready, "ready");

  return Object.freeze({
    institutionId: input.institutionId,
    ready: input.ready,
    label: assertNonEmptyString(input.label, "label"),
    requirement: assertNonEmptyString(input.requirement, "requirement"),
    reason: assertNonEmptyString(input.reason, "reason"),
    supportedTracks: cloneSupportedTracks(
      input.supportedTracks,
      input.institutionId
    ),
    trustRequirement: normalizeNullableString(input.trustRequirement),
    missionRequirement: normalizeNullableString(input.missionRequirement),
  });
}

export function createPlayerSystemTrainingAuthorityHandoff(
  input: PlayerSystemTrainingAuthorityHandoffInput
): PlayerSystemTrainingAuthorityHandoff {
  assertPlayerSystemTrainingAuthorityId(input.authorityId, "authorityId");
  assertBoolean(input.eligible, "eligible");

  return Object.freeze({
    authorityId: input.authorityId,
    eligible: input.eligible,
    label: assertNonEmptyString(input.label, "label"),
    handoffSurface: assertNonEmptyString(input.handoffSurface, "handoffSurface"),
    reason: assertNonEmptyString(input.reason, "reason"),
    requirement: normalizeNullableString(input.requirement),
  });
}

function resolveTrainingRecommendation(
  focus: MccExpressionTrack,
  institutions: readonly PlayerSystemTrainingInstitutionReadiness[]
): PlayerSystemTrainingRecommendation {
  const readyByInstitution = new Map(
    institutions.map((entry) => [entry.institutionId, entry] as const)
  );

  for (const institutionId of ROUTE_PRIORITY_BY_FOCUS[focus]) {
    const entry = readyByInstitution.get(institutionId);
    if (!entry?.ready || !entry.supportedTracks.includes(focus)) {
      continue;
    }

    let reason: PlayerSystemTrainingRoutingReason;
    if (institutionId === "apprenticeship") {
      reason = "crafting-apprenticeship";
    } else if (institutionId === "academy") {
      reason = "advanced-academy";
    } else if (focus === "internalized") {
      reason = "focus-internalized";
    } else if (focus === "externalized") {
      reason = "focus-externalized";
    } else {
      reason = "focus-hybrid";
    }

    return Object.freeze({
      routeId: institutionId,
      focus,
      reason,
    });
  }

  return Object.freeze({
    routeId: "field-practice",
    focus,
    reason: "no-institution-ready",
  });
}

export function createPlayerSystemTrainingRoutingState(
  input: PlayerSystemTrainingRoutingInput
): PlayerSystemTrainingRoutingState {
  if (!isMccExpressionTrack(input.growthFocus)) {
    throw new Error("growthFocus must be a supported MCC expression track");
  }

  if (!Array.isArray(input.institutionReadiness)) {
    throw new Error("institutionReadiness must be an array");
  }

  if (!Array.isArray(input.authorityEligibility)) {
    throw new Error("authorityEligibility must be an array");
  }

  const institutionReadiness = freezeReadonlyArray(
    input.institutionReadiness.map((entry) =>
      createPlayerSystemTrainingInstitutionReadiness(entry)
    )
  );
  const authorityEligibility = freezeReadonlyArray(
    input.authorityEligibility.map((entry) =>
      createPlayerSystemTrainingAuthorityHandoff(entry)
    )
  );
  const readyInstitutions = Object.freeze(
    institutionReadiness.filter((entry) => entry.ready)
  );
  const blockedPrerequisites = Object.freeze(
    institutionReadiness
      .filter((entry) => !entry.ready)
      .map((entry) =>
        Object.freeze({
          institutionId: entry.institutionId,
          label: entry.label,
          requirement: entry.requirement,
          reason: entry.reason,
          trustRequirement: entry.trustRequirement,
          missionRequirement: entry.missionRequirement,
        })
      )
  );
  const trainingAuthority =
    authorityEligibility.find((entry) => entry.authorityId === "training") ??
    null;
  const craftingAuthorities = Object.freeze(
    authorityEligibility.filter((entry) => entry.authorityId !== "training")
  );

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_TRAINING_ROUTING_FEATURE_FLAG_ID,
    recommendation: resolveTrainingRecommendation(input.growthFocus, institutionReadiness),
    readyInstitutions,
    blockedPrerequisites,
    trainingAuthority,
    craftingAuthorities,
  });
}

export function assessPlayerSystemRuntimePortability(
  sample: PlayerSystemCompositionSample,
  contract: PlayerSystemRuntimePortabilityContract = defaultPlayerSystemRuntimePortabilityContract
): PlayerSystemContractAssessment {
  const violations: string[] = [];

  if (
    sample.concurrentModules > contract.compositionScale.maxConcurrentModules
  ) {
    violations.push("concurrentModules");
  }

  if (
    sample.paneConsumers > contract.compositionScale.maxConcurrentPaneConsumers
  ) {
    violations.push("paneConsumers");
  }

  if (
    sample.backgroundTransitions >
    contract.compositionScale.maxBackgroundTransitions
  ) {
    violations.push("backgroundTransitions");
  }

  return Object.freeze({
    accepted: violations.length === 0,
    violations: Object.freeze(violations),
  });
}
