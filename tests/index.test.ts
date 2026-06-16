import {
  PLAYER_SYSTEM_POINTS_STORE_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_TRAINING_ROUTING_FEATURE_FLAG_ID,
  assessPlayerSystemRuntimePortability,
  createPlayerSystemTrainingAuthorityHandoff,
  createPlayerSystemTrainingInstitutionReadiness,
  createPlayerSystemTrainingRoutingState,
  createPlayerSystemPointsStoreState,
  createPlayerSystemSessionState,
  createPlayerSystemRuntimeContract,
  createPlayerSystemRuntimePortabilityContract,
  defaultPlayerSystemRuntimeContract,
  defaultPlayerSystemRuntimePortabilityContract,
  isPlayerSystemAuthorityBand,
  isPlayerSystemEvolutionStage,
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

  it("guards the points-store runtime selectors", () => {
    expect(isPlayerSystemEvolutionStage("proto-social")).toBe(true);
    expect(isPlayerSystemEvolutionStage("social-lock")).toBe(true);
    expect(isPlayerSystemEvolutionStage("unknown")).toBe(false);
    expect(isPlayerSystemAuthorityBand("frontier")).toBe(true);
    expect(isPlayerSystemAuthorityBand("civic")).toBe(true);
    expect(isPlayerSystemAuthorityBand("divine")).toBe(true);
    expect(isPlayerSystemAuthorityBand("self")).toBe(false);
  });

  it("models multi-ledger points-store state behind the inherited feature flag", () => {
    const state = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "civic",
    });

    expect(state.featureFlagId).toBe(PLAYER_SYSTEM_POINTS_STORE_FEATURE_FLAG_ID);
    expect(state.ledgers.map((ledger) => ledger.id)).toEqual([
      "pp",
      "esp",
      "tis",
      "dis",
    ]);
    expect(state.ledgers.find((ledger) => ledger.id === "pp")).toMatchObject({
      balance: 18,
      authorityBoundary: {
        state: "self",
        canSpend: true,
      },
    });
    expect(state.ledgers.find((ledger) => ledger.id === "tis")).toMatchObject({
      availability: "available",
      authorityBoundary: {
        state: "available",
        canSpend: true,
        requiredBand: "civic",
      },
    });
    expect(Object.isFrozen(state.ledgers)).toBe(true);
    expect(Object.isFrozen(state.ledgers[0]?.actions)).toBe(true);
  });

  it("gates proto-social devolution by stage, single-use state, and PP balance", () => {
    const eligible = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "frontier",
    });
    const closedWindow = createPlayerSystemPointsStoreState({
      evolutionStage: "social-lock",
      authorityBand: "frontier",
    });
    const alreadyUsed = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "frontier",
      devolutionAlreadyUsed: true,
    });
    const insufficientBalance = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "frontier",
      ppBalance: 10,
    });

    expect(eligible.devolutionAction).toMatchObject({
      available: true,
      executionState: "eligible",
      cost: 12,
    });
    expect(closedWindow.devolutionAction).toMatchObject({
      available: false,
      executionState: "window-closed",
    });
    expect(alreadyUsed.devolutionAction).toMatchObject({
      available: false,
      executionState: "already-used",
    });
    expect(insufficientBalance.devolutionAction).toMatchObject({
      available: false,
      executionState: "insufficient-balance",
    });
  });

  it("integrates TIS and DIS authority-boundary checks across authority bands", () => {
    const frontier = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "frontier",
    });
    const civic = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "civic",
    });
    const divine = createPlayerSystemPointsStoreState({
      evolutionStage: "proto-social",
      authorityBand: "divine",
    });

    expect(frontier.ledgers.find((ledger) => ledger.id === "tis")).toMatchObject({
      availability: "locked",
      authorityBoundary: {
        canSpend: false,
        state: "locked",
      },
    });
    expect(civic.ledgers.find((ledger) => ledger.id === "tis")).toMatchObject({
      availability: "available",
      authorityBoundary: {
        canSpend: true,
        state: "available",
      },
    });
    expect(divine.ledgers.find((ledger) => ledger.id === "tis")).toMatchObject({
      availability: "historical",
      authorityBoundary: {
        canSpend: false,
        state: "historical",
      },
    });
    expect(civic.ledgers.find((ledger) => ledger.id === "dis")).toMatchObject({
      availability: "locked",
      authorityBoundary: {
        canSpend: false,
        state: "locked",
      },
    });
    expect(divine.ledgers.find((ledger) => ledger.id === "dis")).toMatchObject({
      availability: "available",
      authorityBoundary: {
        canSpend: true,
        state: "available",
      },
    });
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

  it("defaults institution track support from @plasius/training semantics", () => {
    const institution = createPlayerSystemTrainingInstitutionReadiness({
      institutionId: "barracks",
      ready: true,
      label: "Barracks readiness",
      requirement: "Requires a guild-cleared stage.",
      reason: "stage-unlocked",
      trustRequirement: "   ",
      missionRequirement: "\n",
    });

    expect(institution.supportedTracks).toEqual(["internalized", "hybrid"]);
    expect(institution.trustRequirement).toBeNull();
    expect(institution.missionRequirement).toBeNull();
  });

  it("keeps players in field practice while exposing blocked prerequisite detail", () => {
    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "hybrid",
      institutionReadiness: [
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "barracks",
          ready: false,
          label: "Barracks readiness",
          requirement: "Requires a guild-cleared stage.",
          reason: "requires-training-stage",
          trustRequirement: "Earn training-yard trust rank one.",
        }),
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "school",
          ready: false,
          label: "School readiness",
          requirement: "Requires a school-candidate stage.",
          reason: "requires-training-stage",
          missionRequirement: "Finish the literacy proving mission.",
        }),
      ],
      authorityEligibility: [
        createPlayerSystemTrainingAuthorityHandoff({
          authorityId: "training",
          eligible: false,
          label: "Institution training handoff",
          handoffSurface: "player-system:training",
          reason: "requires-training-stage",
        }),
        createPlayerSystemTrainingAuthorityHandoff({
          authorityId: "spellcraft",
          eligible: false,
          label: "Spellcraft handoff",
          handoffSurface: "player-system:spellcraft",
          reason: "requires-apprenticeship-stage",
          requirement: "Unlock an academy or apprenticeship candidate stage.",
        }),
      ],
    });

    expect(routingState.featureFlagId).toBe(
      PLAYER_SYSTEM_TRAINING_ROUTING_FEATURE_FLAG_ID
    );
    expect(routingState.recommendation).toEqual({
      routeId: "field-practice",
      focus: "hybrid",
      reason: "no-institution-ready",
    });
    expect(routingState.readyInstitutions).toEqual([]);
    expect(routingState.blockedPrerequisites).toEqual([
      expect.objectContaining({
        institutionId: "barracks",
        trustRequirement: "Earn training-yard trust rank one.",
      }),
      expect.objectContaining({
        institutionId: "school",
        missionRequirement: "Finish the literacy proving mission.",
      }),
    ]);
    expect(routingState.trainingAuthority?.eligible).toBe(false);
    expect(routingState.craftingAuthorities).toHaveLength(1);
  });

  it("biases early unlocked routes toward the declared internalized focus", () => {
    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "internalized",
      institutionReadiness: [
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "barracks",
          ready: true,
          label: "Barracks readiness",
          requirement: "Requires a guild-cleared stage.",
          reason: "stage-unlocked",
        }),
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "school",
          ready: true,
          label: "School readiness",
          requirement: "Requires a school-candidate stage.",
          reason: "stage-unlocked",
        }),
      ],
      authorityEligibility: [],
    });

    expect(routingState.recommendation).toEqual({
      routeId: "barracks",
      focus: "internalized",
      reason: "focus-internalized",
    });
  });

  it("biases early unlocked routes toward the declared externalized focus", () => {
    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "externalized",
      institutionReadiness: [
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "barracks",
          ready: true,
          label: "Barracks readiness",
          requirement: "Requires a guild-cleared stage.",
          reason: "stage-unlocked",
        }),
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "school",
          ready: true,
          label: "School readiness",
          requirement: "Requires a school-candidate stage.",
          reason: "stage-unlocked",
        }),
      ],
      authorityEligibility: [],
    });

    expect(routingState.recommendation).toEqual({
      routeId: "school",
      focus: "externalized",
      reason: "focus-externalized",
    });
  });

  it("uses the hybrid-routing reason when a non-specialized unlocked route wins", () => {
    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "hybrid",
      institutionReadiness: [
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "barracks",
          ready: true,
          label: "Barracks readiness",
          requirement: "Requires a guild-cleared stage.",
          reason: "stage-unlocked",
        }),
      ],
      authorityEligibility: [],
    });

    expect(routingState.recommendation).toEqual({
      routeId: "barracks",
      focus: "hybrid",
      reason: "focus-hybrid",
    });
  });

  it("prefers apprenticeship once crafting-specialization handoffs are live", () => {
    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "hybrid",
      institutionReadiness: [
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "academy",
          ready: true,
          label: "Academy readiness",
          requirement: "Requires an academy-candidate stage.",
          reason: "stage-unlocked",
        }),
        createPlayerSystemTrainingInstitutionReadiness({
          institutionId: "apprenticeship",
          ready: true,
          label: "Apprenticeship readiness",
          requirement: "Requires an apprenticeship-candidate stage.",
          reason: "stage-unlocked",
        }),
      ],
      authorityEligibility: [
        createPlayerSystemTrainingAuthorityHandoff({
          authorityId: "training",
          eligible: true,
          label: "Institution training handoff",
          handoffSurface: "player-system:training",
          reason: "institution-ready",
        }),
        createPlayerSystemTrainingAuthorityHandoff({
          authorityId: "spellcraft",
          eligible: true,
          label: "Spellcraft handoff",
          handoffSurface: "player-system:spellcraft",
          reason: "institution-ready",
        }),
        createPlayerSystemTrainingAuthorityHandoff({
          authorityId: "item-crafting",
          eligible: true,
          label: "Item-crafting handoff",
          handoffSurface: "player-system:item-crafting",
          reason: "institution-ready",
        }),
      ],
    });

    expect(routingState.recommendation).toEqual({
      routeId: "apprenticeship",
      focus: "hybrid",
      reason: "crafting-apprenticeship",
    });
    expect(
      routingState.craftingAuthorities.map((authority) => authority.authorityId)
    ).toEqual(["spellcraft", "item-crafting"]);
  });

  it("fails closed for invalid JavaScript-style training-routing inputs", () => {
    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "dojo" as never,
        ready: true,
        label: "Barracks readiness",
        requirement: "Requires a guild-cleared stage.",
        reason: "stage-unlocked",
      })
    ).toThrow("institutionId must be a supported training institution");

    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "academy",
        ready: "yes" as never,
        label: "Academy readiness",
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
      })
    ).toThrow("ready must be a boolean");

    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "academy",
        ready: true,
        label: "  ",
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
      })
    ).toThrow("label must be a non-empty string");

    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "academy",
        ready: true,
        label: 42 as never,
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
      })
    ).toThrow("label must be a non-empty string");

    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "academy",
        ready: true,
        label: "Academy readiness",
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
        supportedTracks: [],
      })
    ).toThrow(
      "supportedTracks must contain at least one supported MCC expression track"
    );

    expect(() =>
      createPlayerSystemTrainingInstitutionReadiness({
        institutionId: "academy",
        ready: true,
        label: "Academy readiness",
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
        supportedTracks: ["invalid-track" as never],
      })
    ).toThrow("supportedTracks must contain only supported MCC expression tracks");

    expect(() =>
      createPlayerSystemTrainingAuthorityHandoff({
        authorityId: "alchemy" as never,
        eligible: true,
        label: "Spellcraft handoff",
        handoffSurface: "player-system:spellcraft",
        reason: "institution-ready",
      })
    ).toThrow("authorityId must be a supported training authority");

    expect(() =>
      createPlayerSystemTrainingRoutingState({
        growthFocus: "invalid-focus" as never,
        institutionReadiness: [],
        authorityEligibility: [],
      })
    ).toThrow("growthFocus must be a supported MCC expression track");

    expect(() =>
      createPlayerSystemTrainingRoutingState({
        growthFocus: "hybrid",
        institutionReadiness: {} as never,
        authorityEligibility: [],
      })
    ).toThrow("institutionReadiness must be an array");

    expect(() =>
      createPlayerSystemTrainingRoutingState({
        growthFocus: "hybrid",
        institutionReadiness: [],
        authorityEligibility: {} as never,
      })
    ).toThrow("authorityEligibility must be an array");
  });

  it("returns immutable routing snapshots instead of caller-owned nested objects", () => {
    const institutionReadiness: Array<Record<string, unknown>> = [
      {
        institutionId: "academy",
        ready: true,
        label: "Academy readiness",
        requirement: "Requires an academy-candidate stage.",
        reason: "stage-unlocked",
        supportedTracks: ["internalized", "hybrid"],
        trustRequirement: "Maintain instructor trust rank two.",
        missionRequirement: null,
      },
    ];
    const authorityEligibility: Array<Record<string, unknown>> = [
      {
        authorityId: "training",
        eligible: true,
        label: "Institution training handoff",
        handoffSurface: "player-system:training",
        reason: "institution-ready",
        requirement: null,
      },
      {
        authorityId: "spellcraft",
        eligible: true,
        label: "Spellcraft handoff",
        handoffSurface: "player-system:spellcraft",
        reason: "institution-ready",
        requirement: "Complete academy induction.",
      },
    ];

    const routingState = createPlayerSystemTrainingRoutingState({
      growthFocus: "internalized",
      institutionReadiness: institutionReadiness as never,
      authorityEligibility: authorityEligibility as never,
    });
    const readinessEntry = institutionReadiness[0]!;
    const trainingAuthorityEntry = authorityEligibility[0]!;
    const craftingAuthorityEntry = authorityEligibility[1]!;
    const readyInstitution = routingState.readyInstitutions[0]!;
    const trainingAuthority = routingState.trainingAuthority!;
    const craftingAuthority = routingState.craftingAuthorities[0]!;

    readinessEntry.label = "Mutated readiness label";
    (readinessEntry.supportedTracks as string[]).push("externalized");
    craftingAuthorityEntry.label = "Mutated authority label";

    expect(readyInstitution).not.toBe(readinessEntry);
    expect(trainingAuthority).not.toBe(trainingAuthorityEntry);
    expect(craftingAuthority).not.toBe(craftingAuthorityEntry);
    expect(readyInstitution.label).toBe("Academy readiness");
    expect(readyInstitution.supportedTracks).toEqual([
      "internalized",
      "hybrid",
    ]);
    expect(craftingAuthority.label).toBe("Spellcraft handoff");
    expect(Object.isFrozen(readyInstitution.supportedTracks)).toBe(true);
  });
});
