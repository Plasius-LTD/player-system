import {
  isMccExpressionTrack,
  type MccExpressionTrack,
  type TrainingInstitutionType,
} from "@plasius/training";
import {
  resolveAiSpeechAudioPolicy,
  type AiSpeechAudioContract,
  type AiSpeechAudioFocusMode,
  type AiSpeechAudioPolicyDecision,
  type AiSpeechFeatureFlagSnapshot,
} from "@plasius/ai-speech";

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

export interface PlayerSystemPreferenceProfile {
  readonly kind: PlayerPreferenceSignalKind;
  readonly signalCount: number;
  readonly confidence: number;
}

export interface PlayerSystemPreferenceModelState {
  readonly signals: readonly PlayerPreferenceSignal[];
  readonly profiles: readonly PlayerSystemPreferenceProfile[];
  readonly dominantKind: PlayerPreferenceSignalKind | null;
}

export interface PlayerSystemModuleContext {
  readonly session: PlayerSystemSessionState;
  readonly preferenceModel: PlayerSystemPreferenceModelState;
  readonly mode: PlayerSystemMode;
  readonly isFocused: boolean;
}

export type PlayerSystemModuleCoordinator = (
  context: PlayerSystemModuleContext
) => boolean;

export interface PlayerSystemModuleRegistrationInput {
  readonly module: PlayerSystemModule;
  readonly modes?: readonly PlayerSystemMode[];
  readonly coordinate: PlayerSystemModuleCoordinator;
}

export interface PlayerSystemModuleRegistration
  extends PlayerSystemModuleRegistrationInput {
  readonly modes: readonly PlayerSystemMode[];
}

export interface PlayerSystemModuleCoordination {
  readonly module: PlayerSystemModule;
  readonly mode: PlayerSystemMode;
  readonly isFocused: boolean;
  readonly handled: boolean;
}

export interface PlayerSystemRuntimeState {
  readonly featureFlagId: string;
  readonly session: PlayerSystemSessionState;
  readonly preferenceModel: PlayerSystemPreferenceModelState;
  readonly registeredModules: readonly PlayerSystemModule[];
}

export interface CreatePlayerSystemRuntimeInput {
  readonly session: Omit<
    PlayerSystemSessionState,
    "activeModule" | "preferenceSignals"
  > & {
    readonly activeModule?: PlayerSystemModule | null;
    readonly preferenceSignals?: readonly PlayerPreferenceSignal[];
  };
  readonly modules?: readonly PlayerSystemModuleRegistrationInput[];
  readonly maxRetainedPreferenceSignals?: number;
}

export interface PlayerSystemRuntime {
  readonly getState: () => PlayerSystemRuntimeState;
  readonly registerModule: (
    registration: PlayerSystemModuleRegistrationInput
  ) => void;
  readonly unregisterModule: (module: PlayerSystemModule) => boolean;
  readonly setMode: (mode: PlayerSystemMode) => void;
  readonly focusModule: (module: PlayerSystemModule) => void;
  readonly clearFocus: () => void;
  readonly recordPreferenceSignal: (
    signal: PlayerPreferenceSignal
  ) => PlayerSystemPreferenceModelState;
  readonly coordinate: () => readonly PlayerSystemModuleCoordination[];
}

export const PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID =
  "isekai.player-system.audio.enabled" as const;

export const PLAYER_SYSTEM_VOICE_COMMAND_FAMILIES = Object.freeze([
  "narration",
  "tutorial",
  "mission",
  "mcc",
  "warning",
] as const);

export type PlayerSystemVoiceCommandFamily =
  (typeof PLAYER_SYSTEM_VOICE_COMMAND_FAMILIES)[number] | (string & {});

export interface PlayerSystemAudioContext {
  readonly focusMode: AiSpeechAudioFocusMode;
  readonly featureFlags?: AiSpeechFeatureFlagSnapshot;
  readonly masterMuted?: boolean;
  readonly userMuted?: boolean;
  readonly activeContractIds?: readonly string[];
}

export interface PlayerSystemAudioRoute {
  readonly featureFlagId: typeof PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID;
  readonly focusMode: AiSpeechAudioFocusMode;
  readonly contract: AiSpeechAudioContract;
  readonly decision: AiSpeechAudioPolicyDecision;
}

export interface PlayerSystemVoiceCommandScope {
  readonly focusedPanes?: readonly string[];
  readonly commandFamily: PlayerSystemVoiceCommandFamily;
  readonly allowInCombatSafe: boolean;
}

export type PlayerSystemVoiceCommandActivation = (input: {
  readonly sessionId: string;
  readonly lang?: string;
  readonly params?: Readonly<Record<string, unknown>>;
}) => Promise<"success" | "no-match" | boolean> | "success" | "no-match" | boolean;

export interface PlayerSystemVoiceCommandRegistration {
  readonly name: string;
  readonly patterns: readonly (string | RegExp)[];
  readonly scope: PlayerSystemVoiceCommandScope;
  readonly handler: PlayerSystemVoiceCommandActivation;
}

export interface PlayerSystemVoiceCommandRegistrationInput {
  readonly name: string;
  readonly patterns?: readonly (string | RegExp)[];
  readonly focusedPanes?: readonly string[];
  readonly commandFamily: PlayerSystemVoiceCommandFamily;
  readonly allowInCombatSafe?: boolean;
  readonly handler: PlayerSystemVoiceCommandActivation;
}

export interface PlayerSystemVoiceCommandContext {
  readonly focusedPane?: string | null;
  readonly combatSafe?: boolean;
  readonly allowedCommandFamilies?: readonly string[];
}

export type PlayerSystemVoiceCommandResolutionReason =
  | "allowed"
  | "focused-pane-required"
  | "command-family-not-allowed"
  | "combat-safe-restricted";

export interface PlayerSystemVoiceCommandResolution {
  readonly allowed: boolean;
  readonly reason: PlayerSystemVoiceCommandResolutionReason;
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

export const PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID =
  "isekai.player-system.missions.enabled" as const;

export const PLAYER_SYSTEM_MISSION_STABLE_PREFERENCE_CONFIDENCE = 0.65;
export const PLAYER_SYSTEM_MISSION_STABLE_PREFERENCE_SIGNAL_COUNT = 3;

export type PlayerSystemMissionHorizon =
  | "short-term"
  | "medium-term"
  | "long-horizon";

export type PlayerSystemMissionGenerationPhase =
  | "disabled"
  | "bootstrap"
  | "adaptive";

export type PlayerSystemMissionLifecycleState =
  | "proposed"
  | "accepted"
  | "active"
  | "refused"
  | "abandoned"
  | "completing"
  | "completed"
  | "failed"
  | "rewarding"
  | "cooldown";

export type PlayerSystemMissionTransitionAction =
  | "accept"
  | "activate"
  | "refuse"
  | "decline"
  | "ignore"
  | "pin"
  | "begin-completion"
  | "complete"
  | "fail"
  | "abandon"
  | "surface-reward"
  | "cooldown";

export type PlayerSystemMissionLearningDecision =
  | "accepted"
  | "refused"
  | "declined"
  | "ignored"
  | "pinned"
  | "completed"
  | "failed"
  | "abandoned";

export interface PlayerSystemMissionOpportunity {
  readonly opportunityId: string;
  readonly kind: PlayerPreferenceSignalKind;
}

export interface PlayerSystemMissionWorldStatePressure {
  readonly kind: PlayerPreferenceSignalKind;
  readonly intensity: number;
  readonly summary: string;
}

export interface PlayerSystemMissionCandidate {
  readonly missionId: string;
  readonly title: string;
  readonly summary: string;
  readonly preferenceKind: PlayerPreferenceSignalKind;
  readonly horizon: PlayerSystemMissionHorizon;
  readonly minimumReadiness: number;
  readonly opportunityId?: string | null;
  readonly pressureKind?: PlayerPreferenceSignalKind | null;
}

export interface PlayerSystemMissionGenerationInput {
  readonly featureFlagEnabled: boolean;
  readonly readiness: number;
  readonly preferenceModel: PlayerSystemPreferenceModelState;
  readonly mccFocusTarget?: PlayerPreferenceSignalKind | null;
  readonly nearbyOpportunities: readonly PlayerSystemMissionOpportunity[];
  readonly worldStatePressures: readonly PlayerSystemMissionWorldStatePressure[];
  readonly bootstrap: PlayerSystemMissionCandidate;
  readonly candidates: readonly PlayerSystemMissionCandidate[];
}

export interface PlayerSystemMissionProposal extends PlayerSystemMissionCandidate {
  readonly featureFlagId: typeof PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID;
  readonly state: "proposed";
  readonly phase: Exclude<PlayerSystemMissionGenerationPhase, "disabled">;
  readonly rationale: readonly string[];
}

export interface PlayerSystemMissionGenerationResult {
  readonly featureFlagId: typeof PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID;
  readonly enabled: boolean;
  readonly phase: PlayerSystemMissionGenerationPhase;
  readonly stablePreference: boolean;
  readonly fallbackUsed: boolean;
  readonly proposal: PlayerSystemMissionProposal | null;
  readonly rationale: readonly string[];
}

export interface PlayerSystemMissionLearningSignal extends PlayerPreferenceSignal {
  readonly missionId: string;
  readonly decision: PlayerSystemMissionLearningDecision;
  readonly missionState: PlayerSystemMissionLifecycleState;
}

export type PlayerSystemMissionRewardOutcome =
  | "approved"
  | "modified"
  | "rejected";

export interface PlayerSystemMissionRewardInput {
  readonly rewardType: PlayerSystemGovernanceRewardKind;
  readonly requestedAmount: number;
  readonly unit: string;
  readonly explanation: string;
  readonly preflight: PlayerSystemGovernanceRewardPreflightInput;
  readonly contract?: PlayerSystemGovernanceContract;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface PlayerSystemMissionRewardDecision {
  readonly outcome: PlayerSystemMissionRewardOutcome;
  readonly rewardType: PlayerSystemGovernanceRewardKind;
  readonly requestedAmount: number;
  readonly grantedAmount: number;
  readonly unit: string;
  readonly explanation: string;
  readonly preflight: PlayerSystemGovernanceRewardPreflightResult;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface PlayerSystemMission {
  readonly featureFlagId: typeof PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID;
  readonly missionId: string;
  readonly title: string;
  readonly summary: string;
  readonly preferenceKind: PlayerPreferenceSignalKind;
  readonly horizon: PlayerSystemMissionHorizon;
  readonly state: PlayerSystemMissionLifecycleState;
  readonly phase: Exclude<PlayerSystemMissionGenerationPhase, "disabled">;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pinned: boolean;
  readonly cooldownUntil: string | null;
  readonly rationale: readonly string[];
  readonly transitions: readonly PlayerSystemMissionTransition[];
  readonly learningSignals: readonly PlayerSystemMissionLearningSignal[];
  readonly rewardDecision: PlayerSystemMissionRewardDecision | null;
}

export interface PlayerSystemMissionTransition {
  readonly action: PlayerSystemMissionTransitionAction;
  readonly from: PlayerSystemMissionLifecycleState;
  readonly to: PlayerSystemMissionLifecycleState;
  readonly at: string;
}

export interface CreatePlayerSystemMissionInput {
  readonly proposal: PlayerSystemMissionProposal;
  readonly now?: string;
}

export interface PlayerSystemMissionTransitionInput {
  readonly action: PlayerSystemMissionTransitionAction;
  readonly at?: string;
  readonly confidence?: number;
  readonly source?: string;
  readonly cooldownMs?: number;
  readonly rewardDecision?: PlayerSystemMissionRewardDecision;
}

export interface PlayerSystemMissionTransitionResult {
  readonly mission: PlayerSystemMission;
  readonly learningSignal: PlayerSystemMissionLearningSignal | null;
}

export interface PlayerSystemMissionRuntimeTransitionResult
  extends PlayerSystemMissionTransitionResult {
  readonly preferenceModel: PlayerSystemPreferenceModelState;
}

export type PlayerSystemGuildQuestState = "accepted";

export interface PlayerSystemGuildQuestAuthorityState {
  readonly questId: string;
  readonly guildId: string;
  readonly state: PlayerSystemGuildQuestState;
  readonly title: string;
  readonly summary: string;
  readonly routeId: string | null;
  readonly synergyTags: readonly string[];
  readonly acceptedAt: string;
  readonly updatedAt: string;
  readonly sourceVersion: number;
}

export interface PlayerSystemGuildQuestMissionReference {
  readonly missionId: string;
  readonly routeId?: string | null;
  readonly synergyTags?: readonly string[];
}

export type PlayerSystemGuildQuestSynergyStrength = "partial" | "strong";

export interface PlayerSystemGuildQuestMissionSynergy {
  readonly missionId: string;
  readonly strength: PlayerSystemGuildQuestSynergyStrength;
  readonly matchedTags: readonly string[];
  readonly routeAligned: boolean;
}

export interface PlayerSystemGuildQuestRouteConflict {
  readonly state: "clear" | "conflict";
  readonly routeId: string | null;
  readonly conflictingQuestIds: readonly string[];
  readonly conflictingMissionIds: readonly string[];
}

export interface PlayerSystemGuildQuestSystemAnnotation {
  readonly annotatedAt: string;
  readonly missionSynergy: readonly PlayerSystemGuildQuestMissionSynergy[];
  readonly routeConflict: PlayerSystemGuildQuestRouteConflict;
}

export interface PlayerSystemGuildQuestRuntimeTracking {
  readonly authority: PlayerSystemGuildQuestAuthorityState;
  readonly system: PlayerSystemGuildQuestSystemAnnotation;
}

export interface PlayerSystemGuildQuestSynchronizationInput {
  readonly featureFlagEnabled: boolean;
  readonly acceptedQuests: readonly PlayerSystemGuildQuestAuthorityState[];
  readonly missions: readonly PlayerSystemGuildQuestMissionReference[];
  readonly now?: string;
}

export interface PlayerSystemGuildQuestSynchronizationResult {
  readonly featureFlagId: typeof PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID;
  readonly enabled: boolean;
  readonly synchronizedAt: string;
  readonly tracking: readonly PlayerSystemGuildQuestRuntimeTracking[];
  readonly rationale: readonly string[];
}

export const PLAYER_SYSTEM_PACKAGE = "@plasius/player-system";
export const PLAYER_SYSTEM_ENV_PREFIX = "PLAYER_SYSTEM";
export const PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID =
  "isekai.player-system.packages.enabled";
export const PLAYER_SYSTEM_FEATURE_FLAG_ID = PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID;
export const PLAYER_SYSTEM_CORE_FEATURE_FLAG_ID =
  "isekai.player-system.core.enabled";
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
export const PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID =
  "isekai.player-system.guild-quests.enabled" as const;
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

export function isPlayerPreferenceSignalKind(
  value: string
): value is PlayerPreferenceSignalKind {
  return (
    value === "combat" ||
    value === "exploration" ||
    value === "crafting" ||
    value === "social" ||
    value === "governance"
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

export function createPlayerSystemPreferenceModelState(
  signals: readonly PlayerPreferenceSignal[] = []
): PlayerSystemPreferenceModelState {
  const normalizedSignals = signals.map((signal) => {
    assertPreferenceSignal(signal);
    return Object.freeze({ ...signal });
  });
  const profileStats = new Map<
    PlayerPreferenceSignalKind,
    { count: number; confidenceTotal: number }
  >();

  for (const signal of normalizedSignals) {
    const current = profileStats.get(signal.kind) ?? {
      count: 0,
      confidenceTotal: 0,
    };
    current.count += 1;
    current.confidenceTotal += signal.confidence;
    profileStats.set(signal.kind, current);
  }

  const profiles = Array.from(profileStats.entries()).map(
    ([kind, stats]) =>
      Object.freeze({
        kind,
        signalCount: stats.count,
        confidence: stats.confidenceTotal / stats.count,
      })
  );
  const dominantProfile = profiles.reduce<
    PlayerSystemPreferenceProfile | undefined
  >((current, profile) => {
    if (!current) {
      return profile;
    }

    if (
      profile.confidence * profile.signalCount >
        current.confidence * current.signalCount ||
      (profile.confidence * profile.signalCount ===
        current.confidence * current.signalCount &&
        profile.signalCount > current.signalCount)
    ) {
      return profile;
    }

    return current;
  }, undefined);

  return Object.freeze({
    signals: Object.freeze(normalizedSignals),
    profiles: Object.freeze(profiles),
    dominantKind: dominantProfile?.kind ?? null,
  });
}

export function createPlayerSystemRuntime(
  input: CreatePlayerSystemRuntimeInput
): PlayerSystemRuntime {
  const maxRetainedPreferenceSignals =
    input.maxRetainedPreferenceSignals ??
    defaultPlayerSystemRuntimePortabilityContract.sessionData
      .maxRetainedPreferenceSignals;
  if (
    !Number.isInteger(maxRetainedPreferenceSignals) ||
    maxRetainedPreferenceSignals < 1
  ) {
    throw new Error("maxRetainedPreferenceSignals must be a positive integer");
  }

  let registrations = (input.modules ?? []).map(normalizeModuleRegistration);
  assertUniqueModuleRegistrations(registrations);
  let session = createPlayerSystemSessionState(input.session);
  let preferenceModel = createPlayerSystemPreferenceModelState(
    session.preferenceSignals
  );
  let state = createPlayerSystemRuntimeState(
    session,
    preferenceModel,
    registrations
  );

  const refreshState = (): void => {
    state = createPlayerSystemRuntimeState(
      session,
      preferenceModel,
      registrations
    );
  };

  const setSession = (
    mode: PlayerSystemMode,
    activeModule: PlayerSystemModule | null
  ): void => {
    session = createPlayerSystemSessionState({
      ...session,
      mode,
      activeModule,
    });
    refreshState();
  };

  return Object.freeze({
    getState: (): PlayerSystemRuntimeState => state,
    registerModule: (registration: PlayerSystemModuleRegistrationInput): void => {
      const normalized = normalizeModuleRegistration(registration);
      if (registrations.some(({ module }) => module === normalized.module)) {
        throw new Error(`module ${normalized.module} is already registered`);
      }

      registrations = [...registrations, normalized];
      refreshState();
    },
    unregisterModule: (module: PlayerSystemModule): boolean => {
      const nextRegistrations = registrations.filter(
        (registration) => registration.module !== module
      );
      if (nextRegistrations.length === registrations.length) {
        return false;
      }

      registrations = nextRegistrations;
      if (session.activeModule === module) {
        setSession("ambient", null);
      } else {
        refreshState();
      }
      return true;
    },
    setMode: (mode: PlayerSystemMode): void => {
      assertPlayerSystemMode(mode);
      setSession(mode, mode === "focused" ? session.activeModule : null);
    },
    focusModule: (module: PlayerSystemModule): void => {
      assertPlayerSystemModule(module);
      if (!registrations.some((registration) => registration.module === module)) {
        throw new Error(`cannot focus an unregistered module: ${module}`);
      }

      setSession("focused", module);
    },
    clearFocus: (): void => {
      setSession("ambient", null);
    },
    recordPreferenceSignal: (
      signal: PlayerPreferenceSignal
    ): PlayerSystemPreferenceModelState => {
      assertPreferenceSignal(signal);
      const preferenceSignals = [
        ...session.preferenceSignals,
        Object.freeze({ ...signal }),
      ].slice(-maxRetainedPreferenceSignals);
      session = createPlayerSystemSessionState({
        ...session,
        preferenceSignals,
      });
      preferenceModel = createPlayerSystemPreferenceModelState(preferenceSignals);
      refreshState();
      return preferenceModel;
    },
    coordinate: (): readonly PlayerSystemModuleCoordination[] => {
      const coordination = registrations
        .filter((registration) => {
          if (!registration.modes.includes(session.mode)) {
            return false;
          }

          return (
            session.mode === "ambient" ||
            registration.module === session.activeModule
          );
        })
        .map((registration) => {
          const isFocused = session.mode === "focused";
          const handled = registration.coordinate({
            session,
            preferenceModel,
            mode: session.mode,
            isFocused,
          });
          return Object.freeze({
            module: registration.module,
            mode: session.mode,
            isFocused,
            handled,
          });
        });

      return Object.freeze(coordination);
    },
  });
}

export function generatePlayerSystemMission(
  input: PlayerSystemMissionGenerationInput
): PlayerSystemMissionGenerationResult {
  assertBoolean(input.featureFlagEnabled, "featureFlagEnabled");
  const readiness = assertBoundedUnitInterval(input.readiness, "readiness");
  const nearbyOpportunities = input.nearbyOpportunities.map(
    normalizeMissionOpportunity
  );
  const worldStatePressures = input.worldStatePressures.map(
    normalizeMissionWorldStatePressure
  );
  const bootstrap = normalizeMissionCandidate(input.bootstrap, "bootstrap");
  const candidates = input.candidates.map((candidate, index) =>
    normalizeMissionCandidate(candidate, `candidates[${index}]`)
  );
  const dominantProfile = input.preferenceModel.profiles.find(
    (profile) => profile.kind === input.preferenceModel.dominantKind
  );
  const stablePreference = Boolean(
    dominantProfile &&
      dominantProfile.signalCount >= PLAYER_SYSTEM_MISSION_STABLE_PREFERENCE_SIGNAL_COUNT &&
      dominantProfile.confidence >= PLAYER_SYSTEM_MISSION_STABLE_PREFERENCE_CONFIDENCE
  );
  const rationale: string[] = [];

  if (!input.featureFlagEnabled) {
    return Object.freeze({
      featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
      enabled: false,
      phase: "disabled",
      stablePreference,
      fallbackUsed: false,
      proposal: null,
      rationale: Object.freeze([
        "Mission rollout is disabled by the feature flag.",
      ]),
    });
  }

  if (stablePreference && dominantProfile) {
    rationale.push(
      `Stable ${dominantProfile.kind} preference evidence is available.`
    );
  } else {
    rationale.push(
      "Preference evidence is not stable; use the conservative bootstrap mission."
    );
  }

  let selected: PlayerSystemMissionCandidate | undefined;
  let selectedScore = Number.NEGATIVE_INFINITY;
  let selectedReasons: string[] = [];

  if (stablePreference && dominantProfile) {
    const nearbyIds = new Set(
      nearbyOpportunities.map((opportunity) => opportunity.opportunityId)
    );
    const pressureKinds = new Set(
      worldStatePressures
        .filter((pressure) => pressure.intensity > 0)
        .map((pressure) => pressure.kind)
    );

    candidates.forEach((candidate) => {
      if (readiness < candidate.minimumReadiness) {
        return;
      }

      let score = 0;
      const reasons: string[] = [];
      if (candidate.preferenceKind === dominantProfile.kind) {
        score += 4;
        reasons.push("Preference evidence matches the selected mission.");
      }
      if (candidate.preferenceKind === input.mccFocusTarget) {
        score += 3;
        reasons.push("MCC focus target matches the selected mission.");
      }
      if (candidate.opportunityId && nearbyIds.has(candidate.opportunityId)) {
        score += 2;
        reasons.push("A nearby opportunity matches the selected mission.");
      }
      if (candidate.pressureKind && pressureKinds.has(candidate.pressureKind)) {
        score += 2;
        reasons.push("World-state pressure matches the selected mission.");
      }

      if (score > selectedScore) {
        selected = candidate;
        selectedScore = score;
        selectedReasons = reasons;
      }
    });
  }

  const fallbackUsed = !selected;
  const chosen = selected ?? bootstrap;
  if (fallbackUsed) {
    rationale.push("No safe adaptive candidate was eligible; bootstrap is the fallback.");
  } else {
    rationale.push(...selectedReasons);
  }

  const phase: Exclude<PlayerSystemMissionGenerationPhase, "disabled"> =
    fallbackUsed ? "bootstrap" : "adaptive";
  const proposal = Object.freeze({
    ...chosen,
    featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
    state: "proposed" as const,
    phase,
    rationale: freezeReadonlyArray(rationale),
  });

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
    enabled: true,
    phase,
    stablePreference,
    fallbackUsed,
    proposal,
    rationale: freezeReadonlyArray(rationale),
  });
}

export function synchronizePlayerSystemGuildQuests(
  input: PlayerSystemGuildQuestSynchronizationInput
): PlayerSystemGuildQuestSynchronizationResult {
  assertBoolean(input.featureFlagEnabled, "featureFlagEnabled");
  if (!Array.isArray(input.acceptedQuests)) {
    throw new Error("acceptedQuests must be an array");
  }
  if (!Array.isArray(input.missions)) {
    throw new Error("missions must be an array");
  }
  if (input.acceptedQuests.length > MAX_PLAYER_SYSTEM_GUILD_QUESTS) {
    throw new Error(
      `acceptedQuests must contain at most ${MAX_PLAYER_SYSTEM_GUILD_QUESTS} entries`
    );
  }
  if (input.missions.length > MAX_PLAYER_SYSTEM_GUILD_QUEST_MISSIONS) {
    throw new Error(
      `missions must contain at most ${MAX_PLAYER_SYSTEM_GUILD_QUEST_MISSIONS} entries`
    );
  }

  const synchronizedAt =
    normalizeTimestamp(input.now, "now") ?? new Date().toISOString();
  const acceptedQuests = input.acceptedQuests
    .map((quest, index) =>
      normalizePlayerSystemGuildQuestAuthorityState(
        quest,
        `acceptedQuests[${index}]`
      )
    )
    .sort((left, right) => left.questId.localeCompare(right.questId));
  const questIds = new Set<string>();
  for (const quest of acceptedQuests) {
    if (questIds.has(quest.questId)) {
      throw new Error("acceptedQuests must not contain duplicate questId values");
    }
    questIds.add(quest.questId);
  }

  const missions = input.missions
    .map((mission, index) =>
      normalizePlayerSystemGuildQuestMissionReference(
        mission,
        `missions[${index}]`
      )
    )
    .sort((left, right) => left.missionId.localeCompare(right.missionId));
  const missionIds = new Set<string>();
  for (const mission of missions) {
    if (missionIds.has(mission.missionId)) {
      throw new Error("missions must not contain duplicate missionId values");
    }
    missionIds.add(mission.missionId);
  }

  if (!input.featureFlagEnabled) {
    return Object.freeze({
      featureFlagId: PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID,
      enabled: false,
      synchronizedAt,
      tracking: Object.freeze([]),
      rationale: Object.freeze([
        "Guild-quest rollout is disabled by the feature flag.",
      ]),
    });
  }

  const tracking = acceptedQuests.map((authority) =>
    Object.freeze({
      authority,
      system: Object.freeze({
        annotatedAt: synchronizedAt,
        missionSynergy: freezeReadonlyArray(
          missions.flatMap((mission) =>
            resolvePlayerSystemGuildQuestMissionSynergy(authority, mission)
          )
        ),
        routeConflict: resolvePlayerSystemGuildQuestRouteConflict(
          authority,
          acceptedQuests,
          missions
        ),
      }),
    })
  );

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID,
    enabled: true,
    synchronizedAt,
    tracking: freezeReadonlyArray(tracking),
    rationale: Object.freeze([
      `Synchronized ${acceptedQuests.length} accepted guild quest(s) into runtime tracking.`,
      "Guild authority state and System annotations remain separate.",
    ]),
  });
}

export function createPlayerSystemMission(
  input: CreatePlayerSystemMissionInput
): PlayerSystemMission {
  if (input.proposal.state !== "proposed") {
    throw new Error("proposal must start in proposed state");
  }

  const proposal = normalizeMissionProposal(input.proposal);
  const now = input.now
    ? normalizeTimestamp(input.now, "now")!
    : new Date().toISOString();

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
    missionId: proposal.missionId,
    title: proposal.title,
    summary: proposal.summary,
    preferenceKind: proposal.preferenceKind,
    horizon: proposal.horizon,
    state: "proposed" as const,
    phase: proposal.phase,
    createdAt: now,
    updatedAt: now,
    pinned: false,
    cooldownUntil: null,
    rationale: proposal.rationale,
    transitions: Object.freeze([]),
    learningSignals: Object.freeze([]),
    rewardDecision: null,
  });
}

export function evaluatePlayerSystemMissionReward(
  input: PlayerSystemMissionRewardInput
): PlayerSystemMissionRewardDecision {
  const requestedAmount = assertFiniteNumber(input.requestedAmount, "requestedAmount");
  if (requestedAmount <= 0) {
    throw new Error("requestedAmount must be greater than zero");
  }

  const rewardType = input.rewardType;
  if (input.preflight.rewardType !== rewardType) {
    throw new Error("preflight rewardType must match rewardType");
  }

  const unit = assertNonEmptyString(input.unit, "unit");
  const explanation = assertNonEmptyString(input.explanation, "explanation");
  const preflight = evaluatePlayerSystemRewardPreflight(
    input.preflight,
    input.contract
  );
  const grantedAmount = preflight.allowed
    ? Math.min(
        requestedAmount,
        preflight.remainingGlobal,
        preflight.remainingSession
      )
    : 0;
  const outcome: PlayerSystemMissionRewardOutcome = !preflight.allowed
    ? "rejected"
    : grantedAmount < requestedAmount
      ? "modified"
      : "approved";
  const outcomeExplanation =
    outcome === "rejected"
      ? `Mission reward rejected: ${preflight.feedback}`
      : outcome === "modified"
        ? `Mission reward modified from ${requestedAmount} to ${grantedAmount}: ${preflight.feedback}`
        : `Mission reward approved: ${preflight.feedback}`;

  return Object.freeze({
    outcome,
    rewardType,
    requestedAmount,
    grantedAmount,
    unit,
    explanation: `${explanation} ${outcomeExplanation}`,
    preflight,
    metadata: Object.freeze({
      ...(input.metadata ?? {}),
      preflightStatus: preflight.status,
      preflightWarnings: preflight.warnings,
      remainingGlobal: preflight.remainingGlobal,
      remainingSession: preflight.remainingSession,
      requestedAmount,
      grantedAmount,
      outcome,
    }),
  });
}

export function transitionPlayerSystemMission(
  mission: PlayerSystemMission,
  input: PlayerSystemMissionTransitionInput
): PlayerSystemMissionTransitionResult {
  const at = input.at
    ? normalizeTimestamp(input.at, "at")!
    : new Date().toISOString();
  let rewardDecision = mission.rewardDecision;
  if (input.action === "surface-reward") {
    if (!input.rewardDecision) {
      throw new Error("surface-reward requires a rewardDecision");
    }
    if (input.rewardDecision.outcome === "rejected") {
      throw new Error("cannot surface a rejected mission reward");
    }
    rewardDecision = input.rewardDecision;
  }
  const nextState = resolveMissionTransitionState(mission.state, input.action);

  const transition = Object.freeze({
    action: input.action,
    from: mission.state,
    to: nextState,
    at,
  });
  const learningSignal = createMissionLearningSignal(mission, input, nextState);
  const cooldownUntil =
    nextState === "cooldown"
      ? new Date(
          new Date(at).getTime() +
            (input.cooldownMs === undefined
              ? 300000
              : assertPositiveInteger(input.cooldownMs, "cooldownMs"))
        ).toISOString()
      : null;

  const nextMission = Object.freeze({
    ...mission,
    state: nextState,
    updatedAt: at,
    pinned: mission.pinned || input.action === "pin",
    cooldownUntil,
    transitions: freezeReadonlyArray([...mission.transitions, transition]),
    learningSignals: learningSignal
      ? freezeReadonlyArray([...mission.learningSignals, learningSignal])
      : mission.learningSignals,
    rewardDecision,
  });

  return Object.freeze({ mission: nextMission, learningSignal });
}

export function applyPlayerSystemMissionTransition(
  runtime: PlayerSystemRuntime,
  mission: PlayerSystemMission,
  input: PlayerSystemMissionTransitionInput
): PlayerSystemMissionRuntimeTransitionResult {
  const result = transitionPlayerSystemMission(mission, input);
  const preferenceModel = result.learningSignal
    ? runtime.recordPreferenceSignal(result.learningSignal)
    : runtime.getState().preferenceModel;

  return Object.freeze({ ...result, preferenceModel });
}

function assertPreferenceSignal(signal: PlayerPreferenceSignal): void {
  assertNonEmptyString(signal.signalId, "signalId");
  if (!isPlayerPreferenceSignalKind(signal.kind)) {
    throw new Error("kind must be a supported preference signal kind");
  }
  if (
    typeof signal.confidence !== "number" ||
    !Number.isFinite(signal.confidence) ||
    signal.confidence < 0 ||
    signal.confidence > 1
  ) {
    throw new Error("confidence must be between 0 and 1");
  }
  assertNonEmptyString(signal.source, "source");
}

function assertPlayerSystemMode(value: unknown): asserts value is PlayerSystemMode {
  if (typeof value !== "string" || !isPlayerSystemMode(value)) {
    throw new Error("mode must be ambient or focused");
  }
}

function assertPlayerSystemModule(
  value: unknown
): asserts value is PlayerSystemModule {
  if (typeof value !== "string" || !isPlayerSystemModule(value)) {
    throw new Error("module must be a supported Player System module");
  }
}

function normalizeModuleRegistration(
  registration: PlayerSystemModuleRegistrationInput
): PlayerSystemModuleRegistration {
  assertPlayerSystemModule(registration.module);
  if (typeof registration.coordinate !== "function") {
    throw new Error("coordinate must be a function");
  }

  const modes = registration.modes ?? ["ambient", "focused"];
  if (modes.length === 0 || modes.some((mode) => !isPlayerSystemMode(mode))) {
    throw new Error("modes must contain at least one supported Player System mode");
  }
  if (new Set(modes).size !== modes.length) {
    throw new Error("modes must not contain duplicates");
  }

  return Object.freeze({
    module: registration.module,
    modes: Object.freeze([...modes]),
    coordinate: registration.coordinate,
  });
}

function assertUniqueModuleRegistrations(
  registrations: readonly PlayerSystemModuleRegistration[]
): void {
  if (new Set(registrations.map(({ module }) => module)).size !== registrations.length) {
    throw new Error("module registrations must be unique");
  }
}

function createPlayerSystemRuntimeState(
  session: PlayerSystemSessionState,
  preferenceModel: PlayerSystemPreferenceModelState,
  registrations: readonly PlayerSystemModuleRegistration[]
): PlayerSystemRuntimeState {
  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_CORE_FEATURE_FLAG_ID,
    session,
    preferenceModel,
    registeredModules: Object.freeze(
      registrations.map((registration) => registration.module)
    ),
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

function normalizeMissionOpportunity(
  input: PlayerSystemMissionOpportunity
): PlayerSystemMissionOpportunity {
  return Object.freeze({
    opportunityId: assertNonEmptyString(input.opportunityId, "opportunityId"),
    kind: assertPlayerPreferenceSignalKind(input.kind, "kind"),
  });
}

function normalizeMissionWorldStatePressure(
  input: PlayerSystemMissionWorldStatePressure
): PlayerSystemMissionWorldStatePressure {
  return Object.freeze({
    kind: assertPlayerPreferenceSignalKind(input.kind, "kind"),
    intensity: assertBoundedUnitInterval(input.intensity, "intensity"),
    summary: assertNonEmptyString(input.summary, "summary"),
  });
}

function normalizeMissionCandidate(
  input: PlayerSystemMissionCandidate,
  label: string
): PlayerSystemMissionCandidate {
  return Object.freeze({
    missionId: assertNonEmptyString(input.missionId, `${label}.missionId`),
    title: assertNonEmptyString(input.title, `${label}.title`),
    summary: assertNonEmptyString(input.summary, `${label}.summary`),
    preferenceKind: assertPlayerPreferenceSignalKind(
      input.preferenceKind,
      `${label}.preferenceKind`
    ),
    horizon: assertMissionHorizon(input.horizon, `${label}.horizon`),
    minimumReadiness: assertBoundedUnitInterval(
      input.minimumReadiness,
      `${label}.minimumReadiness`
    ),
    opportunityId: normalizeNullableString(input.opportunityId),
    pressureKind:
      input.pressureKind === undefined || input.pressureKind === null
        ? null
        : assertPlayerPreferenceSignalKind(input.pressureKind, `${label}.pressureKind`),
  });
}

const MAX_PLAYER_SYSTEM_GUILD_QUESTS = 100;
const MAX_PLAYER_SYSTEM_GUILD_QUEST_TAGS = 16;
const MAX_PLAYER_SYSTEM_GUILD_QUEST_MISSIONS = 100;

function normalizePlayerSystemGuildQuestAuthorityState(
  input: PlayerSystemGuildQuestAuthorityState,
  label: string
): PlayerSystemGuildQuestAuthorityState {
  if (input.state !== "accepted") {
    throw new Error(`${label}.state must be accepted`);
  }

  if (!Array.isArray(input.synergyTags)) {
    throw new Error(`${label}.synergyTags must be an array`);
  }

  if (input.sourceVersion === undefined) {
    throw new Error(`${label}.sourceVersion must be a positive integer`);
  }

  const normalized = Object.freeze({
    questId: assertNonEmptyString(input.questId, `${label}.questId`),
    guildId: assertNonEmptyString(input.guildId, `${label}.guildId`),
    state: "accepted" as const,
    title: assertNonEmptyString(input.title, `${label}.title`),
    summary: assertNonEmptyString(input.summary, `${label}.summary`),
    routeId: normalizeNullableString(input.routeId),
    synergyTags: normalizeGuildQuestTags(input.synergyTags, `${label}.synergyTags`),
    acceptedAt: normalizeRequiredTimestamp(input.acceptedAt, `${label}.acceptedAt`),
    updatedAt: normalizeRequiredTimestamp(input.updatedAt, `${label}.updatedAt`),
    sourceVersion: assertPositiveInteger(input.sourceVersion, `${label}.sourceVersion`),
  });

  return normalized;
}

function normalizePlayerSystemGuildQuestMissionReference(
  input: PlayerSystemGuildQuestMissionReference,
  label: string
): PlayerSystemGuildQuestMissionReference {
  if (input.synergyTags !== undefined && !Array.isArray(input.synergyTags)) {
    throw new Error(`${label}.synergyTags must be an array`);
  }

  return Object.freeze({
    missionId: assertNonEmptyString(input.missionId, `${label}.missionId`),
    routeId: normalizeNullableString(input.routeId),
    synergyTags: normalizeGuildQuestTags(
      input.synergyTags ?? [],
      `${label}.synergyTags`
    ),
  });
}

function normalizeGuildQuestTags(
  value: readonly string[],
  label: string
): readonly string[] {
  if (value.length > MAX_PLAYER_SYSTEM_GUILD_QUEST_TAGS) {
    throw new Error(
      `${label} must contain at most ${MAX_PLAYER_SYSTEM_GUILD_QUEST_TAGS} entries`
    );
  }

  const normalized = value.map((tag, index) =>
    assertNonEmptyString(tag, `${label}[${index}]`)
  );
  const unique = [...new Set(normalized)].sort((left, right) =>
    left.localeCompare(right)
  );
  return freezeReadonlyArray(unique);
}

function normalizeRequiredTimestamp(value: string, label: string): string {
  const normalized = normalizeTimestamp(value, label);
  if (!normalized) {
    throw new Error(`${label} must be a valid ISO timestamp`);
  }
  return normalized;
}

function resolvePlayerSystemGuildQuestMissionSynergy(
  authority: PlayerSystemGuildQuestAuthorityState,
  mission: PlayerSystemGuildQuestMissionReference
): readonly PlayerSystemGuildQuestMissionSynergy[] {
  const missionTags = new Set(mission.synergyTags ?? []);
  const matchedTags = authority.synergyTags.filter((tag) => missionTags.has(tag));
  const routeAligned = Boolean(
    authority.routeId && mission.routeId && authority.routeId === mission.routeId
  );

  if (matchedTags.length === 0 && !routeAligned) {
    return [];
  }

  return [
    Object.freeze({
      missionId: mission.missionId,
      strength:
        routeAligned || matchedTags.length > 1 ? ("strong" as const) : ("partial" as const),
      matchedTags: freezeReadonlyArray(matchedTags),
      routeAligned,
    }),
  ];
}

function resolvePlayerSystemGuildQuestRouteConflict(
  authority: PlayerSystemGuildQuestAuthorityState,
  acceptedQuests: readonly PlayerSystemGuildQuestAuthorityState[],
  missions: readonly PlayerSystemGuildQuestMissionReference[]
): PlayerSystemGuildQuestRouteConflict {
  const conflictingQuestIds = authority.routeId
    ? acceptedQuests
        .filter(
          (quest) =>
            quest.questId !== authority.questId && quest.routeId === authority.routeId
        )
        .map((quest) => quest.questId)
    : [];
  const conflictingMissionIds = authority.routeId
    ? missions
        .filter((mission) => mission.routeId === authority.routeId)
        .map((mission) => mission.missionId)
    : [];

  return Object.freeze({
    state:
      conflictingQuestIds.length > 0 || conflictingMissionIds.length > 0
        ? ("conflict" as const)
        : ("clear" as const),
    routeId: authority.routeId,
    conflictingQuestIds: freezeReadonlyArray(conflictingQuestIds),
    conflictingMissionIds: freezeReadonlyArray(conflictingMissionIds),
  });
}

function normalizeMissionProposal(
  input: PlayerSystemMissionProposal
): PlayerSystemMissionProposal {
  if (
    input.featureFlagId !== PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID ||
    (input.phase !== "bootstrap" && input.phase !== "adaptive")
  ) {
    throw new Error("proposal must use the missions feature flag and a valid phase");
  }

  return Object.freeze({
    ...normalizeMissionCandidate(input, "proposal"),
    featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
    state: "proposed" as const,
    phase: input.phase,
    rationale: freezeReadonlyArray(
      input.rationale.map((reason, index) =>
        assertNonEmptyString(reason, `proposal.rationale[${index}]`)
      )
    ),
  });
}

function assertPlayerPreferenceSignalKind(
  value: unknown,
  label: string
): PlayerPreferenceSignalKind {
  if (typeof value !== "string" || !isPlayerPreferenceSignalKind(value)) {
    throw new Error(`${label} must be a supported preference signal kind`);
  }

  return value;
}

function assertMissionHorizon(
  value: unknown,
  label: string
): PlayerSystemMissionHorizon {
  if (
    value !== "short-term" &&
    value !== "medium-term" &&
    value !== "long-horizon"
  ) {
    throw new Error(`${label} must be a supported mission horizon`);
  }

  return value;
}

function assertBoundedUnitInterval(value: unknown, label: string): number {
  const normalized = assertFiniteNumber(value, label);
  if (normalized < 0 || normalized > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }

  return normalized;
}

function assertPositiveInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return value as number;
}

function resolveMissionTransitionState(
  state: PlayerSystemMissionLifecycleState,
  action: PlayerSystemMissionTransitionAction
): PlayerSystemMissionLifecycleState {
  const allowedActions: Record<
    PlayerSystemMissionLifecycleState,
    readonly PlayerSystemMissionTransitionAction[]
  > = {
    proposed: ["accept", "refuse", "decline", "ignore", "pin"],
    accepted: ["activate", "abandon", "pin"],
    active: ["begin-completion", "fail", "abandon", "pin"],
    refused: ["cooldown"],
    abandoned: ["cooldown"],
    completing: ["complete", "fail"],
    completed: ["surface-reward"],
    failed: ["cooldown"],
    rewarding: ["cooldown"],
    cooldown: [],
  };

  if (!allowedActions[state].includes(action)) {
    throw new Error(`cannot transition mission from ${state} with ${action}`);
  }

  switch (action) {
    case "accept":
      return "accepted";
    case "activate":
      return "active";
    case "refuse":
    case "decline":
    case "ignore":
      return "refused";
    case "begin-completion":
      return "completing";
    case "complete":
      return "completed";
    case "fail":
      return "failed";
    case "abandon":
      return "abandoned";
    case "surface-reward":
      return "rewarding";
    case "cooldown":
      return "cooldown";
    case "pin":
      return state;
  }
}

function createMissionLearningSignal(
  mission: PlayerSystemMission,
  input: PlayerSystemMissionTransitionInput,
  nextState: PlayerSystemMissionLifecycleState
): PlayerSystemMissionLearningSignal | null {
  const decisions: Partial<
    Record<PlayerSystemMissionTransitionAction, PlayerSystemMissionLearningDecision>
  > = {
    accept: "accepted",
    refuse: "refused",
    decline: "declined",
    ignore: "ignored",
    pin: "pinned",
    complete: "completed",
    fail: "failed",
    abandon: "abandoned",
  };
  const decision = decisions[input.action];
  if (!decision) {
    return null;
  }

  const defaultConfidence: Record<
    PlayerSystemMissionLearningDecision,
    number
  > = {
    accepted: 0.7,
    refused: 0.5,
    declined: 0.45,
    ignored: 0.4,
    pinned: 0.8,
    completed: 0.95,
    failed: 0.6,
    abandoned: 0.75,
  };
  const confidence =
    input.confidence === undefined
      ? defaultConfidence[decision]
      : assertBoundedUnitInterval(input.confidence, "confidence");
  const source = input.source
    ? assertNonEmptyString(input.source, "source")
    : `${PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID}:mission:${input.action}`;

  return Object.freeze({
    signalId: `${mission.missionId}:${input.action}:${mission.transitions.length + 1}`,
    kind: mission.preferenceKind,
    confidence,
    source,
    missionId: mission.missionId,
    decision,
    missionState: nextState,
  });
}

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

  if (!input.requested) {
    status = "idle";
  } else if (input.consent === "denied") {
    status = escalationReason ? "escalated" : "denied";
  } else if (input.consent === "required") {
    status = "consent-required";
  } else if (activatedAt && durationMs !== null) {
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
    input.mode === "harder-mode"
      ? input.repairCost === undefined
        ? 5
        : assertFiniteNumber(input.repairCost, "repairCost")
      : 0;
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

export interface ResolvePlayerSystemAudioRouteInput {
  readonly contract: AiSpeechAudioContract;
  readonly context: PlayerSystemAudioContext;
}

export function isPlayerSystemAudioFocusMode(
  value: unknown
): value is AiSpeechAudioFocusMode {
  return value === "ambient" || value === "focused" || value === "combat-safe";
}

/**
 * Resolve a speech contract through the shared audio policy without coupling
 * the Player System package to a renderer or audio engine.
 */
export function resolvePlayerSystemAudioRoute(
  input: ResolvePlayerSystemAudioRouteInput
): PlayerSystemAudioRoute {
  if (!isPlayerSystemAudioFocusMode(input.context.focusMode)) {
    throw new Error("focusMode must be ambient, focused, or combat-safe");
  }

  return Object.freeze({
    featureFlagId: PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID,
    focusMode: input.context.focusMode,
    contract: input.contract,
    decision: resolveAiSpeechAudioPolicy({
      contract: input.contract,
      focusMode: input.context.focusMode,
      featureFlags: input.context.featureFlags,
      masterMuted: input.context.masterMuted,
      userMuted: input.context.userMuted,
      activeContractIds: input.context.activeContractIds,
    }),
  });
}

const MAX_PLAYER_SYSTEM_VOICE_COMMAND_PANES = 8;

function normalizeVoiceCommandPatterns(
  patterns: readonly (string | RegExp)[]
): readonly (string | RegExp)[] {
  return freezeReadonlyArray(
    patterns.map((pattern, index) => {
      if (typeof pattern === "string") {
        return assertNonEmptyString(pattern, `patterns[${index}]`);
      }
      if (pattern instanceof RegExp) {
        return new RegExp(pattern.source, pattern.flags);
      }
      throw new Error(`patterns[${index}] must be a string or regular expression`);
    })
  );
}

function normalizeVoiceCommandPanes(
  panes: readonly string[] | undefined
): readonly string[] | undefined {
  if (panes === undefined) {
    return undefined;
  }
  if (!Array.isArray(panes) || panes.length > MAX_PLAYER_SYSTEM_VOICE_COMMAND_PANES) {
    throw new Error(
      `focusedPanes must contain at most ${MAX_PLAYER_SYSTEM_VOICE_COMMAND_PANES} entries`
    );
  }

  return freezeReadonlyArray(
    panes.map((pane, index) => assertNonEmptyString(pane, `focusedPanes[${index}]`))
  );
}

export function createPlayerSystemVoiceCommandRegistration(
  input: PlayerSystemVoiceCommandRegistrationInput
): PlayerSystemVoiceCommandRegistration {
  if (typeof input.handler !== "function") {
    throw new Error("handler must be a function");
  }

  const commandFamily = assertNonEmptyString(input.commandFamily, "commandFamily");
  const focusedPanes = normalizeVoiceCommandPanes(input.focusedPanes);

  if (input.allowInCombatSafe !== undefined) {
    assertBoolean(input.allowInCombatSafe, "allowInCombatSafe");
  }

  return Object.freeze({
    name: assertNonEmptyString(input.name, "name"),
    patterns: normalizeVoiceCommandPatterns(input.patterns ?? []),
    scope: Object.freeze({
      focusedPanes,
      commandFamily,
      allowInCombatSafe: input.allowInCombatSafe ?? false,
    }),
    handler: input.handler,
  });
}

export function resolvePlayerSystemVoiceCommand(
  registration: PlayerSystemVoiceCommandRegistration,
  context: PlayerSystemVoiceCommandContext = {}
): PlayerSystemVoiceCommandResolution {
  if (
    registration.scope.focusedPanes &&
    (!context.focusedPane ||
      !registration.scope.focusedPanes.includes(context.focusedPane))
  ) {
    return Object.freeze({
      allowed: false,
      reason: "focused-pane-required",
    });
  }

  if (
    context.allowedCommandFamilies &&
    !context.allowedCommandFamilies.includes(registration.scope.commandFamily)
  ) {
    return Object.freeze({
      allowed: false,
      reason: "command-family-not-allowed",
    });
  }

  if (context.combatSafe && !registration.scope.allowInCombatSafe) {
    return Object.freeze({
      allowed: false,
      reason: "combat-safe-restricted",
    });
  }

  return Object.freeze({
    allowed: true,
    reason: "allowed",
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
