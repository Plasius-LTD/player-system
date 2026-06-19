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

export type PlayerSystemPointsLedgerId = "pp" | "esp" | "tis" | "dis";

export type PlayerSystemEvolutionStage = "proto-social" | "social-lock";

export type PlayerSystemAuthorityBand = "frontier" | "civic" | "divine";

export type PlayerSystemPointsLedgerAvailability =
  | "available"
  | "locked"
  | "historical";

export type PlayerSystemPointsAuthorityState =
  | "self"
  | PlayerSystemPointsLedgerAvailability;

export type PlayerSystemPointsDevolutionExecutionState =
  | "eligible"
  | "window-closed"
  | "already-used"
  | "insufficient-balance";

export interface PlayerSystemPointsLedgerEntry {
  readonly label: string;
  readonly amount: number;
  readonly unit: PlayerSystemPointsLedgerId;
}

export interface PlayerSystemPointsSpendSurface {
  readonly actionId: string;
  readonly title: string;
  readonly cost: number | null;
  readonly prerequisite: string;
  readonly consequence: string;
}

export interface PlayerSystemPointsAuthorityBoundary {
  readonly ledgerId: PlayerSystemPointsLedgerId;
  readonly activeBand: PlayerSystemAuthorityBand;
  readonly requiredBand: PlayerSystemAuthorityBand | null;
  readonly state: PlayerSystemPointsAuthorityState;
  readonly canSpend: boolean;
  readonly reason: string;
}

export interface PlayerSystemPointsLedgerState {
  readonly id: PlayerSystemPointsLedgerId;
  readonly title: string;
  readonly balance: number;
  readonly availability: PlayerSystemPointsLedgerAvailability;
  readonly availabilityLabel: string;
  readonly summary: string;
  readonly authorityBoundary: PlayerSystemPointsAuthorityBoundary;
  readonly recentIncome: readonly PlayerSystemPointsLedgerEntry[];
  readonly recentOutgoings: readonly PlayerSystemPointsLedgerEntry[];
  readonly committedSpend: readonly PlayerSystemPointsLedgerEntry[];
  readonly actions: readonly PlayerSystemPointsSpendSurface[];
}

export interface PlayerSystemPointsDevolutionState {
  readonly available: boolean;
  readonly cost: number;
  readonly prerequisite: string;
  readonly consequence: string;
  readonly executionState: PlayerSystemPointsDevolutionExecutionState;
  readonly unavailableReason: string | null;
}

export interface PlayerSystemPointsStoreState {
  readonly featureFlagId: string;
  readonly evolutionStage: PlayerSystemEvolutionStage;
  readonly authorityBand: PlayerSystemAuthorityBand;
  readonly ledgers: readonly PlayerSystemPointsLedgerState[];
  readonly devolutionAction: PlayerSystemPointsDevolutionState;
}

export interface CreatePlayerSystemPointsStoreStateInput {
  readonly evolutionStage: PlayerSystemEvolutionStage;
  readonly authorityBand: PlayerSystemAuthorityBand;
  readonly devolutionAlreadyUsed?: boolean;
  readonly ppBalance?: number;
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

export type PlayerSystemGovernanceMode = "child-safe" | "harder-mode";

export type PlayerSystemGovernanceRuntimeSource =
  | "env"
  | "feature-flag"
  | "default-disabled";

export type PlayerSystemGovernanceOverdriveEligibilityCheck =
  | "explicit-player-urgency"
  | "fatigue-below-emergency-threshold"
  | "normal-casting-blocked"
  | "chaos-pressure-below-lockout";

export type PlayerSystemGovernanceOverdriveAutoDisengageTrigger =
  | "fatigue-threshold-breached"
  | "safe-mana-restored"
  | "player-cancelled";

export type PlayerSystemGovernanceRewardEvaluationCheck =
  | "progression-fit"
  | "institution-gate-respected"
  | "no-direct-power-skip"
  | "duplicate-ledger-blocked"
  | "external-authority-preserved";

export type PlayerSystemGovernanceRewardKind =
  | "guidance-credit"
  | "trust-surplus"
  | "route-annotation"
  | "readiness-preview";

export type PlayerSystemGovernanceScorecardId =
  | "tutorial-usefulness"
  | "mission-fit"
  | "preference-learning"
  | "voice-intent"
  | "reward-boundedness";

export type PlayerSystemGovernanceScorecardCadence =
  | "daily"
  | "weekly"
  | "per-release";

export type PlayerSystemGovernanceMetricId =
  | "completion-rate"
  | "combat-replay-rate"
  | "unlock-lag"
  | "acceptance-rate"
  | "abandonment-rate"
  | "reward-regret-rate"
  | "retention-lift"
  | "branch-coherence"
  | "preference-drift"
  | "intent-success-rate"
  | "clarification-rate"
  | "manual-fallback-rate"
  | "cap-breach-rate"
  | "safety-override-rate"
  | "preview-to-grant-ratio";

export interface PlayerSystemGovernanceOverdrivePolicy {
  readonly commandSurface: "mcc-status-panel";
  readonly eligibilityChecks:
    readonly PlayerSystemGovernanceOverdriveEligibilityCheck[];
  readonly autoDisengageTriggers:
    readonly PlayerSystemGovernanceOverdriveAutoDisengageTrigger[];
  readonly auditEvent: "player-system.overdrive.requested";
}

export interface PlayerSystemGovernanceRepairTaxModePolicy {
  readonly mode: PlayerSystemGovernanceMode;
  readonly deathOutcome: "pp-only-recovery" | "mcc-repair-damage";
  readonly spellImpairment: "none" | "high-complexity-suppressed";
  readonly repairCurrency: "none" | "pp";
  readonly auditEvent:
    | "player-system.repair-tax.child-safe-reviewed"
    | "player-system.repair-tax.applied";
}

export interface PlayerSystemGovernanceRewardPolicy {
  readonly authorityOwner: "player-system-missions";
  readonly evaluationChecks:
    readonly PlayerSystemGovernanceRewardEvaluationCheck[];
  readonly boundedRewardKinds: readonly PlayerSystemGovernanceRewardKind[];
  readonly auditEvent: "player-system.reward-evaluated";
}

export interface PlayerSystemGovernanceScorecard {
  readonly id: PlayerSystemGovernanceScorecardId;
  readonly window: "24h" | "7d" | "14d";
  readonly reviewCadence: PlayerSystemGovernanceScorecardCadence;
  readonly metrics: readonly PlayerSystemGovernanceMetricId[];
}

export interface PlayerSystemGovernanceEvaluationSignalInput {
  readonly signalId: PlayerSystemGovernanceScorecardId;
  readonly summary: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface PlayerSystemGovernanceEvaluationSignalResult {
  readonly signalId: PlayerSystemGovernanceScorecardId;
  readonly accepted: boolean;
  readonly score: number;
  readonly summary: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly error?: string;
}

export interface PlayerSystemGovernanceEvaluationAdapter {
  readonly adapterId: string;
  observeSignal(
    signal: PlayerSystemGovernanceEvaluationSignalInput
  ): Promise<PlayerSystemGovernanceEvaluationSignalResult>;
}

export interface PlayerSystemGovernanceEvaluationSummary {
  readonly adapterId: string;
  readonly status: "passed" | "failed" | "degraded";
  readonly totalSignals: number;
  readonly acceptedSignals: number;
  readonly averageScore: number | null;
  readonly results: readonly PlayerSystemGovernanceEvaluationSignalResult[];
}

export type PlayerSystemGovernanceOverdriveStatus =
  | "idle"
  | "consent-required"
  | "ready"
  | "denied"
  | "escalated"
  | "active"
  | "expired"
  | "auto-disengaged";

export interface PlayerSystemGovernanceOverdriveStateInput {
  readonly requested: boolean;
  readonly ready: boolean;
  readonly consent: "required" | "granted" | "denied";
  readonly feedback: string;
  readonly requestedAt?: string;
  readonly activatedAt?: string;
  readonly now?: string;
  readonly durationMs?: number;
  readonly denialReason?: string;
  readonly escalationReason?: string;
  readonly autoDisengageTrigger?:
    | PlayerSystemGovernanceOverdriveAutoDisengageTrigger
    | null;
}

export interface PlayerSystemGovernanceOverdriveState {
  readonly status: PlayerSystemGovernanceOverdriveStatus;
  readonly requested: boolean;
  readonly ready: boolean;
  readonly consent: "required" | "granted" | "denied";
  readonly feedback: string;
  readonly requestedAt: string | null;
  readonly activatedAt: string | null;
  readonly expiresAt: string | null;
  readonly durationMs: number | null;
  readonly remainingMs: number | null;
  readonly denialReason: string | null;
  readonly escalationReason: string | null;
  readonly autoDisengageTrigger:
    | PlayerSystemGovernanceOverdriveAutoDisengageTrigger
    | null;
}

export interface PlayerSystemGovernanceRepairTaxAssessmentInput {
  readonly mode: PlayerSystemGovernanceMode;
  readonly repairRequired: boolean;
  readonly ppBalance: number;
  readonly repairCost?: number;
}

export interface PlayerSystemGovernanceRepairTaxAssessment {
  readonly mode: PlayerSystemGovernanceMode;
  readonly repairRequired: boolean;
  readonly repairCost: number;
  readonly canAffordRepair: boolean;
  readonly feedback: string;
  readonly policy: PlayerSystemGovernanceRepairTaxModePolicy;
}

export type PlayerSystemGovernanceRewardSource =
  | "tutorial"
  | "mission"
  | "guild-quest"
  | "training-routing"
  | "voice-intent";

export type PlayerSystemGovernanceReadinessState =
  | "ready"
  | "needs-gate"
  | "blocked";

export interface PlayerSystemGovernanceRewardPreflightInput {
  readonly rewardSource: PlayerSystemGovernanceRewardSource;
  readonly rewardType: PlayerSystemGovernanceRewardKind;
  readonly globalCap: number;
  readonly sessionCap: number;
  readonly grantedGlobal: number;
  readonly grantedSession: number;
  readonly readiness: PlayerSystemGovernanceReadinessState;
  readonly policyAllowed?: boolean;
  readonly policyReason?: string;
}

export interface PlayerSystemGovernanceRewardPreflightResult {
  readonly status: "allowed" | "warning" | "blocked";
  readonly allowed: boolean;
  readonly rewardSource: PlayerSystemGovernanceRewardSource;
  readonly rewardType: PlayerSystemGovernanceRewardKind;
  readonly remainingGlobal: number;
  readonly remainingSession: number;
  readonly warnings: readonly string[];
  readonly feedback: string;
}

export interface PlayerSystemGovernanceContract {
  readonly featureFlagId: string;
  readonly contractVersion: string;
  readonly policyOwner: "player-system-governance";
  readonly overdrive: PlayerSystemGovernanceOverdrivePolicy;
  readonly repairTax: {
    readonly childSafe: PlayerSystemGovernanceRepairTaxModePolicy;
    readonly harderMode: PlayerSystemGovernanceRepairTaxModePolicy;
  };
  readonly rewards: PlayerSystemGovernanceRewardPolicy;
  readonly scorecards: readonly PlayerSystemGovernanceScorecard[];
}

export interface PlayerSystemGovernanceContractInput {
  readonly scorecards?: readonly PlayerSystemGovernanceScorecard[];
}

export interface PlayerSystemGovernanceRuntimeState
  extends PlayerSystemGovernanceContract {
  readonly enabled: boolean;
  readonly source: PlayerSystemGovernanceRuntimeSource;
  readonly activeMode: PlayerSystemGovernanceMode;
  readonly overdriveState: PlayerSystemGovernanceOverdriveState;
  readonly repairTaxAssessment: PlayerSystemGovernanceRepairTaxAssessment;
  readonly rewardPreflight: PlayerSystemGovernanceRewardPreflightResult;
  readonly evaluationSummary?: PlayerSystemGovernanceEvaluationSummary;
}

export interface PlayerSystemGovernanceRuntimeStateInput {
  readonly enabled: boolean;
  readonly source?: PlayerSystemGovernanceRuntimeSource;
  readonly activeMode?: PlayerSystemGovernanceMode;
  readonly contract?: PlayerSystemGovernanceContractInput;
  readonly overdrive: PlayerSystemGovernanceOverdriveStateInput;
  readonly repairTax: PlayerSystemGovernanceRepairTaxAssessmentInput;
  readonly rewardPreflight: PlayerSystemGovernanceRewardPreflightInput;
  readonly evaluationSummary?: PlayerSystemGovernanceEvaluationSummary;
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
export const PLAYER_SYSTEM_POINTS_STORE_FEATURE_FLAG_ID =
  "isekai.player-system.points-store.enabled";
export const PLAYER_SYSTEM_GOVERNANCE_FEATURE_FLAG_ID =
  "isekai.player-system.governance.enabled";
export const PLAYER_SYSTEM_GOVERNANCE_CONTRACT_VERSION = "2026-06-19.v1";

export const PLAYER_SYSTEM_GOVERNANCE_OVERDRIVE_ELIGIBILITY_CHECKS =
  Object.freeze([
    "explicit-player-urgency",
    "fatigue-below-emergency-threshold",
    "normal-casting-blocked",
    "chaos-pressure-below-lockout",
  ] satisfies PlayerSystemGovernanceOverdriveEligibilityCheck[]);

export const PLAYER_SYSTEM_GOVERNANCE_AUTO_DISENGAGE_TRIGGERS = Object.freeze([
  "fatigue-threshold-breached",
  "safe-mana-restored",
  "player-cancelled",
] satisfies PlayerSystemGovernanceOverdriveAutoDisengageTrigger[]);

export const PLAYER_SYSTEM_GOVERNANCE_REWARD_EVALUATION_CHECKS =
  Object.freeze([
    "progression-fit",
    "institution-gate-respected",
    "no-direct-power-skip",
    "duplicate-ledger-blocked",
    "external-authority-preserved",
  ] satisfies PlayerSystemGovernanceRewardEvaluationCheck[]);

export const PLAYER_SYSTEM_GOVERNANCE_REWARD_KINDS = Object.freeze([
  "guidance-credit",
  "trust-surplus",
  "route-annotation",
  "readiness-preview",
] satisfies PlayerSystemGovernanceRewardKind[]);

export const defaultPlayerSystemGovernanceScorecards = Object.freeze([
  Object.freeze({
    id: "tutorial-usefulness",
    window: "7d",
    reviewCadence: "weekly",
    metrics: Object.freeze([
      "completion-rate",
      "combat-replay-rate",
      "unlock-lag",
    ] satisfies PlayerSystemGovernanceMetricId[]),
  }),
  Object.freeze({
    id: "mission-fit",
    window: "14d",
    reviewCadence: "per-release",
    metrics: Object.freeze([
      "acceptance-rate",
      "abandonment-rate",
      "reward-regret-rate",
    ] satisfies PlayerSystemGovernanceMetricId[]),
  }),
  Object.freeze({
    id: "preference-learning",
    window: "14d",
    reviewCadence: "weekly",
    metrics: Object.freeze([
      "retention-lift",
      "branch-coherence",
      "preference-drift",
    ] satisfies PlayerSystemGovernanceMetricId[]),
  }),
  Object.freeze({
    id: "voice-intent",
    window: "24h",
    reviewCadence: "daily",
    metrics: Object.freeze([
      "intent-success-rate",
      "clarification-rate",
      "manual-fallback-rate",
    ] satisfies PlayerSystemGovernanceMetricId[]),
  }),
  Object.freeze({
    id: "reward-boundedness",
    window: "7d",
    reviewCadence: "weekly",
    metrics: Object.freeze([
      "cap-breach-rate",
      "safety-override-rate",
      "preview-to-grant-ratio",
    ] satisfies PlayerSystemGovernanceMetricId[]),
  }),
] satisfies readonly PlayerSystemGovernanceScorecard[]);

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

export function isPlayerSystemEvolutionStage(
  value: string
): value is PlayerSystemEvolutionStage {
  return value === "proto-social" || value === "social-lock";
}

export function isPlayerSystemAuthorityBand(
  value: string
): value is PlayerSystemAuthorityBand {
  return value === "frontier" || value === "civic" || value === "divine";
}

function createPointsEntry(
  label: string,
  amount: number,
  unit: PlayerSystemPointsLedgerId
): PlayerSystemPointsLedgerEntry {
  return Object.freeze({
    label,
    amount,
    unit,
  });
}

function createPointsSpendSurface(
  actionId: string,
  title: string,
  cost: number | null,
  prerequisite: string,
  consequence: string
): PlayerSystemPointsSpendSurface {
  return Object.freeze({
    actionId,
    title,
    cost,
    prerequisite,
    consequence,
  });
}

function resolvePlayerSystemPointsAuthorityBoundary(
  ledgerId: PlayerSystemPointsLedgerId,
  authorityBand: PlayerSystemAuthorityBand
): PlayerSystemPointsAuthorityBoundary {
  switch (ledgerId) {
    case "pp":
      return Object.freeze({
        ledgerId,
        activeBand: authorityBand,
        requiredBand: null,
        state: "self",
        canSpend: true,
        reason:
          "Personal points remain governed by the player shell and bounded evolution rules.",
      });
    case "esp":
      return Object.freeze({
        ledgerId,
        activeBand: authorityBand,
        requiredBand: "frontier",
        state: "available",
        canSpend: true,
        reason:
          "Exploration spend remains available so long as the player stays outside combat.",
      });
    case "tis":
      if (authorityBand === "civic") {
        return Object.freeze({
          ledgerId,
          activeBand: authorityBand,
          requiredBand: "civic",
          state: "available",
          canSpend: true,
          reason:
            "Territorial influence spending is active because civic-band authority is unlocked.",
        });
      }

      if (authorityBand === "divine") {
        return Object.freeze({
          ledgerId,
          activeBand: authorityBand,
          requiredBand: "civic",
          state: "historical",
          canSpend: false,
          reason:
            "Civic influence remains visible for audit only after divine-band authority takes over.",
        });
      }

      return Object.freeze({
        ledgerId,
        activeBand: authorityBand,
        requiredBand: "civic",
        state: "locked",
        canSpend: false,
        reason:
          "Territorial influence spending stays locked until civic-band authority is unlocked.",
      });
    case "dis":
      if (authorityBand === "divine") {
        return Object.freeze({
          ledgerId,
          activeBand: authorityBand,
          requiredBand: "divine",
          state: "available",
          canSpend: true,
          reason:
            "Divine influence spending is active because seat-scale authority is available.",
        });
      }

      return Object.freeze({
        ledgerId,
        activeBand: authorityBand,
        requiredBand: "divine",
        state: "locked",
        canSpend: false,
        reason:
          "Divine influence spending remains locked until divine-band seat access is unlocked.",
      });
  }
}

function buildPpLedger(
  authorityBand: PlayerSystemAuthorityBand,
  ppBalance: number
): PlayerSystemPointsLedgerState {
  return Object.freeze({
    id: "pp",
    title: "Personal Points (PP)",
    balance: ppBalance,
    availability: "available",
    availabilityLabel: "Active personal ledger",
    summary:
      "PP covers personal presentation, MCC tuning, bounded evolution assistance, and the one governed proto-social return-to-slime path.",
    authorityBoundary: resolvePlayerSystemPointsAuthorityBoundary("pp", authorityBand),
    recentIncome: Object.freeze([
      createPointsEntry("Mission review payout", 6, "pp"),
      createPointsEntry("Disciplined MCC stabilization", 4, "pp"),
    ]),
    recentOutgoings: Object.freeze([
      createPointsEntry("Identity shell refinements", -3, "pp"),
      createPointsEntry("Field recovery after defeat", -2, "pp"),
    ]),
    committedSpend: Object.freeze([
      createPointsEntry("Reserved MCC repair buffer", 5, "pp"),
    ]),
    actions: Object.freeze([
      createPointsSpendSurface(
        "retune-mcc-composition",
        "Retune MCC composition",
        4,
        "Requires an idle loadout state before the next deployment.",
        "Updates the active combat composition without bypassing progression rules."
      ),
    ]),
  });
}

function buildEspLedger(
  authorityBand: PlayerSystemAuthorityBand
): PlayerSystemPointsLedgerState {
  return Object.freeze({
    id: "esp",
    title: "Exploration System Points (ESP)",
    balance: 11,
    availability: "available",
    availabilityLabel: "Active travel ledger",
    summary:
      "ESP governs route convenience, merchantile movement advantages, and safer non-combat travel improvements.",
    authorityBoundary: resolvePlayerSystemPointsAuthorityBoundary("esp", authorityBand),
    recentIncome: Object.freeze([
      createPointsEntry("Cartography milestone", 5, "esp"),
      createPointsEntry("Safe-route discovery", 3, "esp"),
    ]),
    recentOutgoings: Object.freeze([
      createPointsEntry("Waygate comfort tuning", -2, "esp"),
    ]),
    committedSpend: Object.freeze([
      createPointsEntry("Fast-travel safety reserve", 3, "esp"),
    ]),
    actions: Object.freeze([
      createPointsSpendSurface(
        "improve-fast-travel-comfort",
        "Improve fast-travel comfort",
        3,
        "Only valid outside combat and while the current route remains stable.",
        "Shortens non-combat travel friction but can still be interrupted by urgent world events."
      ),
    ]),
  });
}

function buildTisLedger(
  authorityBand: PlayerSystemAuthorityBand
): PlayerSystemPointsLedgerState {
  const authorityBoundary = resolvePlayerSystemPointsAuthorityBoundary(
    "tis",
    authorityBand
  );

  if (authorityBoundary.state === "available") {
    return Object.freeze({
      id: "tis",
      title: "Territorial Influence System points (TIS)",
      balance: 14,
      availability: "available",
      availabilityLabel: "Active civic ledger",
      summary:
        "TIS funds territorial planning, work orders, walls, upgrades, and domain resilience measures once civic-band play unlocks.",
      authorityBoundary,
      recentIncome: Object.freeze([
        createPointsEntry("Settlement levy surplus", 7, "tis"),
        createPointsEntry("Ward contract completion", 4, "tis"),
      ]),
      recentOutgoings: Object.freeze([
        createPointsEntry("Northern wall reinforcement", -5, "tis"),
      ]),
      committedSpend: Object.freeze([
        createPointsEntry("Bridge repair work order", 6, "tis"),
      ]),
      actions: Object.freeze([
        createPointsSpendSurface(
          "queue-civic-work-order",
          "Queue civic work order",
          6,
          "Requires active civic-band authority and a valid territory target.",
          "Commits settlement influence to infrastructure work and starts a governed build timer."
        ),
      ]),
    });
  }

  if (authorityBoundary.state === "historical") {
    return Object.freeze({
      id: "tis",
      title: "Territorial Influence System points (TIS)",
      balance: 14,
      availability: "historical",
      availabilityLabel: "Historical civic ledger",
      summary:
        "TIS history remains visible for civic accountability, but it is not the active spend surface once divine-band authority takes over.",
      authorityBoundary,
      recentIncome: Object.freeze([
        createPointsEntry("Civic memorial reserve", 2, "tis"),
      ]),
      recentOutgoings: Object.freeze([
        createPointsEntry("Archived civic obligation", -1, "tis"),
      ]),
      committedSpend: Object.freeze([
        createPointsEntry("Previously approved wall reserve", 4, "tis"),
      ]),
      actions: Object.freeze([
        createPointsSpendSurface(
          "review-civic-obligations",
          "Review civic obligations",
          null,
          "Available for audit only while divine-band authority is active.",
          "Keeps prior civic commitments visible without making TIS a second active core bar."
        ),
      ]),
    });
  }

  return Object.freeze({
    id: "tis",
    title: "Territorial Influence System points (TIS)",
    balance: 0,
    availability: "locked",
    availabilityLabel: "Locked until civic-band unlock",
    summary:
      "TIS stays visible as a future civic ledger, but spending cannot begin before settlement and civic authority unlocks.",
    authorityBoundary,
    recentIncome: Object.freeze([]),
    recentOutgoings: Object.freeze([]),
    committedSpend: Object.freeze([]),
    actions: Object.freeze([
      createPointsSpendSurface(
        "civic-work-orders-locked",
        "Civic work orders remain locked",
        null,
        "Reach civic-band play and unlock a valid territory authority surface.",
        "Prevents territorial spend from bypassing world authority boundaries."
      ),
    ]),
  });
}

function buildDisLedger(
  authorityBand: PlayerSystemAuthorityBand
): PlayerSystemPointsLedgerState {
  const authorityBoundary = resolvePlayerSystemPointsAuthorityBoundary(
    "dis",
    authorityBand
  );

  if (authorityBoundary.state === "available") {
    return Object.freeze({
      id: "dis",
      title: "Divine Influence System points (DIS)",
      balance: 9,
      availability: "available",
      availabilityLabel: "Active divine ledger",
      summary:
        "DIS supports seat-scale and near-seat actions such as temporary buffs, regional shaping, and dungeon creation for chaos sealing.",
      authorityBoundary,
      recentIncome: Object.freeze([
        createPointsEntry("Seat harmonics tithe", 4, "dis"),
        createPointsEntry("Stability rite completion", 3, "dis"),
      ]),
      recentOutgoings: Object.freeze([
        createPointsEntry("Chaos-seal preparation", -2, "dis"),
      ]),
      committedSpend: Object.freeze([
        createPointsEntry("Regional shaping reserve", 5, "dis"),
      ]),
      actions: Object.freeze([
        createPointsSpendSurface(
          "commit-divine-seat-action",
          "Commit divine seat action",
          5,
          "Requires divine-band seat access and a reviewed high-order target.",
          "Consumes harmonic capital for a seat-scale action and may still introduce seat-risk if misused."
        ),
      ]),
    });
  }

  return Object.freeze({
    id: "dis",
    title: "Divine Influence System points (DIS)",
    balance: 0,
    availability: "locked",
    availabilityLabel: "Locked until divine-band seat access",
    summary:
      "DIS is visible as a future high-order ledger, but it remains non-actionable until divine-band authority is unlocked.",
    authorityBoundary,
    recentIncome: Object.freeze([]),
    recentOutgoings: Object.freeze([]),
    committedSpend: Object.freeze([]),
    actions: Object.freeze([
      createPointsSpendSurface(
        "divine-actions-locked",
        "Divine actions remain locked",
        null,
        "Unlock seat-scale authority before attempting regional shaping or dungeon creation.",
        "Prevents divine spend from appearing as a generic progression currency."
      ),
    ]),
  });
}

export function createPlayerSystemPointsStoreState(
  input: CreatePlayerSystemPointsStoreStateInput
): PlayerSystemPointsStoreState {
  const ppBalance = input.ppBalance ?? 18;
  const devolutionUnavailableReason =
    input.evolutionStage !== "proto-social"
      ? "The proto-social window is closed after social-form lock, so the return-to-slime path is no longer available."
      : input.devolutionAlreadyUsed
        ? "The bounded return-to-slime path has already been spent for this player."
        : ppBalance < 12
          ? "At least 12 PP is required before the bounded return-to-slime path can execute."
          : null;

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_POINTS_STORE_FEATURE_FLAG_ID,
    evolutionStage: input.evolutionStage,
    authorityBand: input.authorityBand,
    ledgers: Object.freeze([
      buildPpLedger(input.authorityBand, ppBalance),
      buildEspLedger(input.authorityBand),
      buildTisLedger(input.authorityBand),
      buildDisLedger(input.authorityBand),
    ]),
    devolutionAction: Object.freeze({
      available: devolutionUnavailableReason === null,
      cost: 12,
      prerequisite:
        "Only available before social-form lock while the proto-social second-stage window remains open.",
      consequence:
        "Returns the player to slime once, resets the pending social-form path, and interrupts the current mission chain until the new form is stabilized.",
      executionState:
        devolutionUnavailableReason === null
          ? "eligible"
          : input.evolutionStage !== "proto-social"
            ? "window-closed"
            : input.devolutionAlreadyUsed
              ? "already-used"
              : "insufficient-balance",
      unavailableReason: devolutionUnavailableReason,
    }),
  });
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

function freezeReadonlyRecord(
  value?: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> | undefined {
  if (!value) {
    return undefined;
  }

  return Object.freeze({ ...value });
}

function assertBoolean(value: unknown, label: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean`);
  }
}

function assertFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }

  return value;
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

function normalizeTimestamp(value: string | undefined, label: string): string | null {
  if (value === undefined) {
    return null;
  }

  const normalized = assertNonEmptyString(value, label);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`${label} must be a valid ISO timestamp`);
  }

  return parsed.toISOString();
}

function selectRepairPolicy(
  mode: PlayerSystemGovernanceMode,
  contract: PlayerSystemGovernanceContract
): PlayerSystemGovernanceRepairTaxModePolicy {
  return mode === "harder-mode"
    ? contract.repairTax.harderMode
    : contract.repairTax.childSafe;
}

export function createPlayerSystemGovernanceContract(
  input: PlayerSystemGovernanceContractInput = {}
): PlayerSystemGovernanceContract {
  const scorecards = freezeReadonlyArray(
    (input.scorecards ?? defaultPlayerSystemGovernanceScorecards).map((scorecard) =>
      Object.freeze({
        id: scorecard.id,
        window: scorecard.window,
        reviewCadence: scorecard.reviewCadence,
        metrics: freezeReadonlyArray(scorecard.metrics),
      })
    )
  );

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_GOVERNANCE_FEATURE_FLAG_ID,
    contractVersion: PLAYER_SYSTEM_GOVERNANCE_CONTRACT_VERSION,
    policyOwner: "player-system-governance",
    overdrive: Object.freeze({
      commandSurface: "mcc-status-panel",
      eligibilityChecks: PLAYER_SYSTEM_GOVERNANCE_OVERDRIVE_ELIGIBILITY_CHECKS,
      autoDisengageTriggers: PLAYER_SYSTEM_GOVERNANCE_AUTO_DISENGAGE_TRIGGERS,
      auditEvent: "player-system.overdrive.requested",
    }),
    repairTax: Object.freeze({
      childSafe: Object.freeze({
        mode: "child-safe",
        deathOutcome: "pp-only-recovery",
        spellImpairment: "none",
        repairCurrency: "none",
        auditEvent: "player-system.repair-tax.child-safe-reviewed",
      }),
      harderMode: Object.freeze({
        mode: "harder-mode",
        deathOutcome: "mcc-repair-damage",
        spellImpairment: "high-complexity-suppressed",
        repairCurrency: "pp",
        auditEvent: "player-system.repair-tax.applied",
      }),
    }),
    rewards: Object.freeze({
      authorityOwner: "player-system-missions",
      evaluationChecks: PLAYER_SYSTEM_GOVERNANCE_REWARD_EVALUATION_CHECKS,
      boundedRewardKinds: PLAYER_SYSTEM_GOVERNANCE_REWARD_KINDS,
      auditEvent: "player-system.reward-evaluated",
    }),
    scorecards,
  });
}

export function createPlayerSystemOverdriveState(
  input: PlayerSystemGovernanceOverdriveStateInput
): PlayerSystemGovernanceOverdriveState {
  assertBoolean(input.requested, "requested");
  assertBoolean(input.ready, "ready");

  if (
    input.consent !== "required" &&
    input.consent !== "granted" &&
    input.consent !== "denied"
  ) {
    throw new Error("consent must be required, granted, or denied");
  }

  const feedback = assertNonEmptyString(input.feedback, "feedback");
  const requestedAt = normalizeTimestamp(input.requestedAt, "requestedAt");
  const activatedAt = normalizeTimestamp(input.activatedAt, "activatedAt");
  const nowIso = normalizeTimestamp(input.now, "now");
  const denialReason = normalizeNullableString(input.denialReason);
  const escalationReason = normalizeNullableString(input.escalationReason);
  const autoDisengageTrigger = input.autoDisengageTrigger ?? null;
  const durationMs =
    input.durationMs === undefined
      ? activatedAt
        ? 180000
        : null
      : assertFiniteNumber(input.durationMs, "durationMs");
  const now = nowIso ? new Date(nowIso) : new Date();

  let expiresAt: string | null = null;
  let remainingMs: number | null = null;
  let status: PlayerSystemGovernanceOverdriveStatus;

  if (input.requested && input.consent === "denied") {
    status = escalationReason ? "escalated" : "denied";
  } else if (input.requested && input.consent === "required") {
    status = "consent-required";
  } else if (input.requested && activatedAt && durationMs !== null) {
    const activatedAtDate = new Date(activatedAt);
    const expiry = new Date(activatedAtDate.getTime() + durationMs);
    expiresAt = expiry.toISOString();
    remainingMs = Math.max(0, expiry.getTime() - now.getTime());

    if (autoDisengageTrigger) {
      status = "auto-disengaged";
      remainingMs = 0;
    } else if (now.getTime() >= expiry.getTime()) {
      status = "expired";
      remainingMs = 0;
    } else {
      status = "active";
    }
  } else {
    status = input.ready ? "ready" : "consent-required";
  }

  return Object.freeze({
    status,
    requested: input.requested,
    ready: input.ready,
    consent: input.consent,
    feedback,
    requestedAt,
    activatedAt,
    expiresAt,
    durationMs,
    remainingMs,
    denialReason,
    escalationReason,
    autoDisengageTrigger,
  });
}

export function createPlayerSystemRepairTaxAssessment(
  input: PlayerSystemGovernanceRepairTaxAssessmentInput,
  contract: PlayerSystemGovernanceContract = createPlayerSystemGovernanceContract()
): PlayerSystemGovernanceRepairTaxAssessment {
  assertBoolean(input.repairRequired, "repairRequired");
  const repairCost =
    input.repairCost === undefined
      ? input.mode === "harder-mode"
        ? 5
        : 0
      : assertFiniteNumber(input.repairCost, "repairCost");
  const ppBalance = assertFiniteNumber(input.ppBalance, "ppBalance");
  const policy = selectRepairPolicy(input.mode, contract);
  const canAffordRepair = !input.repairRequired || repairCost === 0 || ppBalance >= repairCost;
  const feedback = input.repairRequired
    ? canAffordRepair
      ? `Repair tax is ${policy.repairCurrency === "pp" ? "funded" : "not charged"} under ${policy.mode}.`
      : `Repair tax cannot be paid under ${policy.mode}; MCC recovery must wait.`
    : `No repair-tax consequence is active under ${policy.mode}.`;

  return Object.freeze({
    mode: input.mode,
    repairRequired: input.repairRequired,
    repairCost,
    canAffordRepair,
    feedback,
    policy,
  });
}

export function evaluatePlayerSystemRewardPreflight(
  input: PlayerSystemGovernanceRewardPreflightInput,
  contract: PlayerSystemGovernanceContract = createPlayerSystemGovernanceContract()
): PlayerSystemGovernanceRewardPreflightResult {
  const globalCap = assertFiniteNumber(input.globalCap, "globalCap");
  const sessionCap = assertFiniteNumber(input.sessionCap, "sessionCap");
  const grantedGlobal = assertFiniteNumber(input.grantedGlobal, "grantedGlobal");
  const grantedSession = assertFiniteNumber(input.grantedSession, "grantedSession");
  const warnings: string[] = [];
  let allowed = true;
  let status: PlayerSystemGovernanceRewardPreflightResult["status"] = "allowed";

  if (input.readiness === "blocked") {
    warnings.push("Readiness gate blocks the reward path.");
    allowed = false;
    status = "blocked";
  } else if (input.readiness === "needs-gate") {
    warnings.push("Readiness gate still requires explicit confirmation.");
    status = "warning";
  }

  if (input.policyAllowed === false) {
    warnings.push(input.policyReason ?? "Governance policy denied the reward.");
    allowed = false;
    status = "blocked";
  }

  if (grantedGlobal >= globalCap) {
    warnings.push("Global reward cap has already been reached.");
    allowed = false;
    status = "blocked";
  } else if (globalCap - grantedGlobal <= 1) {
    warnings.push("Global reward cap is nearly exhausted.");
    status = status === "allowed" ? "warning" : status;
  }

  if (grantedSession >= sessionCap) {
    warnings.push("Session reward cap has already been reached.");
    allowed = false;
    status = "blocked";
  } else if (sessionCap - grantedSession <= 1) {
    warnings.push("Session reward cap is nearly exhausted.");
    status = status === "allowed" ? "warning" : status;
  }

  if (!contract.rewards.boundedRewardKinds.includes(input.rewardType)) {
    warnings.push("Reward type is outside the bounded reward contract.");
    allowed = false;
    status = "blocked";
  }

  return Object.freeze({
    status,
    allowed,
    rewardSource: input.rewardSource,
    rewardType: input.rewardType,
    remainingGlobal: Math.max(0, globalCap - grantedGlobal),
    remainingSession: Math.max(0, sessionCap - grantedSession),
    warnings: freezeReadonlyArray(warnings),
    feedback:
      warnings.length === 0
        ? `Reward preflight accepted for ${input.rewardSource}.`
        : warnings.join(" "),
  });
}

export async function evaluatePlayerSystemGovernanceSignals(options: {
  readonly adapter: PlayerSystemGovernanceEvaluationAdapter;
  readonly signals: readonly PlayerSystemGovernanceEvaluationSignalInput[];
}): Promise<PlayerSystemGovernanceEvaluationSummary> {
  const results: PlayerSystemGovernanceEvaluationSignalResult[] = [];

  for (const signal of options.signals) {
    try {
      const result = await options.adapter.observeSignal(signal);
      results.push(
        Object.freeze({
          signalId: result.signalId,
          accepted: result.accepted,
          score: result.score,
          summary: result.summary,
          metadata: freezeReadonlyRecord(result.metadata),
        })
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown adapter failure";
      results.push(
        Object.freeze({
          signalId: signal.signalId,
          accepted: false,
          score: 0,
          summary: signal.summary,
          metadata: freezeReadonlyRecord(signal.metadata),
          error: message,
        })
      );
    }
  }

  const acceptedSignals = results.filter((result) => result.accepted).length;
  const observedScores = results
    .filter((result) => !result.error)
    .map((result) => result.score);
  const averageScore =
    observedScores.length === 0
      ? null
      : observedScores.reduce((sum, value) => sum + value, 0) / observedScores.length;
  const status: PlayerSystemGovernanceEvaluationSummary["status"] = results.some(
    (result) => result.error
  )
    ? "degraded"
    : acceptedSignals === results.length
      ? "passed"
      : "failed";

  return Object.freeze({
    adapterId: options.adapter.adapterId,
    status,
    totalSignals: results.length,
    acceptedSignals,
    averageScore,
    results: freezeReadonlyArray(results),
  });
}

export function createPlayerSystemGovernanceRuntimeState(
  input: PlayerSystemGovernanceRuntimeStateInput
): PlayerSystemGovernanceRuntimeState {
  const contract = createPlayerSystemGovernanceContract(input.contract);
  const activeMode = input.activeMode ?? "child-safe";
  const overdriveState = createPlayerSystemOverdriveState(input.overdrive);
  const repairTaxAssessment = createPlayerSystemRepairTaxAssessment(
    input.repairTax,
    contract
  );
  const rewardPreflight = evaluatePlayerSystemRewardPreflight(
    input.rewardPreflight,
    contract
  );

  return Object.freeze({
    ...contract,
    enabled: input.enabled,
    source: input.source ?? "default-disabled",
    activeMode,
    overdriveState,
    repairTaxAssessment,
    rewardPreflight,
    evaluationSummary: input.evaluationSummary,
  });
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
  institutions: readonly PlayerSystemTrainingInstitutionReadiness[],
  craftingAuthorities: readonly PlayerSystemTrainingAuthorityHandoff[]
): PlayerSystemTrainingRecommendation {
  const hasEligibleCraftingAuthority = craftingAuthorities.some(
    (entry) => entry.eligible
  );
  const readyByInstitution = new Map(
    institutions.map((entry) => [entry.institutionId, entry] as const)
  );

  for (const institutionId of ROUTE_PRIORITY_BY_FOCUS[focus]) {
    const entry = readyByInstitution.get(institutionId);
    if (!entry?.ready || !entry.supportedTracks.includes(focus)) {
      continue;
    }
    if (institutionId === "apprenticeship" && !hasEligibleCraftingAuthority) {
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
    recommendation: resolveTrainingRecommendation(
      input.growthFocus,
      institutionReadiness,
      craftingAuthorities
    ),
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
