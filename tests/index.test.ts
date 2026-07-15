import {
  PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_POINTS_STORE_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_PACKAGES_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_GOVERNANCE_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_EVENTS_ACHIEVEMENTS_CAPABILITY_ID,
  PLAYER_SYSTEM_EVENTS_ACHIEVEMENTS_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_MCC_GUIDANCE_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_NFR_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_RUNTIME_PORTABILITY_FEATURE_FLAG_ID,
  PLAYER_SYSTEM_TRAINING_ROUTING_FEATURE_FLAG_ID,
  assessPlayerSystemRuntimePortability,
  createPlayerSystemGovernanceContract,
  createPlayerSystemGovernanceRuntimeState,
  createPlayerSystemMission,
  createPlayerSystemOverdriveState,
  createPlayerSystemRepairTaxAssessment,
  evaluatePlayerSystemGovernanceSignals,
  evaluatePlayerSystemRewardPreflight,
  evaluatePlayerSystemMissionReward,
  generatePlayerSystemMission,
  synchronizePlayerSystemGuildQuests,
  createPlayerSystemEventAchievementReadModel,
  filterPlayerSystemEventLog,
  applyPlayerSystemMissionTransition,
  transitionPlayerSystemMission,
  createPlayerSystemTrainingAuthorityHandoff,
  createPlayerSystemTrainingInstitutionReadiness,
  createPlayerSystemTrainingRoutingState,
  createPlayerSystemMccGuidanceState,
  createPlayerSystemPointsStoreState,
  createPlayerSystemPreferenceModelState,
  createPlayerSystemRuntime,
  createPlayerSystemSessionState,
  createPlayerSystemRuntimeContract,
  createPlayerSystemRuntimePortabilityContract,
  defaultPlayerSystemRuntimeContract,
  defaultPlayerSystemRuntimePortabilityContract,
  createPlayerSystemVoiceCommandRegistration,
  isPlayerSystemAudioFocusMode,
  isPlayerSystemAuthorityBand,
  isPlayerSystemEvolutionStage,
  isPlayerSystemModule,
  isPlayerSystemMode,
  packageDescriptor,
  resolvePlayerSystemAudioRoute,
  resolvePlayerSystemVoiceCommand,
} from "../src/index.js";
import {
  createAiSpeechLocalizedCue,
  createAiSpeechNarratedResponse,
} from "@plasius/ai-speech";

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

  it("aggregates an immutable preference model from bounded signal history", () => {
    const model = createPlayerSystemPreferenceModelState([
      {
        signalId: "combat-1",
        kind: "combat",
        confidence: 0.8,
        source: "battle-log",
      },
      {
        signalId: "combat-2",
        kind: "combat",
        confidence: 0.6,
        source: "battle-log",
      },
      {
        signalId: "explore-1",
        kind: "exploration",
        confidence: 0.9,
        source: "world-map",
      },
    ]);

    expect(model.dominantKind).toBe("combat");
    expect(model.profiles).toEqual([
      { kind: "combat", signalCount: 2, confidence: 0.7 },
      { kind: "exploration", signalCount: 1, confidence: 0.9 },
    ]);
    expect(Object.isFrozen(model)).toBe(true);
    expect(Object.isFrozen(model.signals)).toBe(true);
    expect(Object.isFrozen(model.profiles)).toBe(true);
    expect(() =>
      createPlayerSystemPreferenceModelState([
        {
          signalId: "invalid",
          kind: "combat",
          confidence: 1.1,
          source: "test",
        },
      ])
    ).toThrow("confidence must be between 0 and 1");
  });

  it("coordinates registered child modules within ambient and focused boundaries", () => {
    const calls: string[] = [];
    const runtime = createPlayerSystemRuntime({
      session: {
        sessionId: "session-1",
        mode: "ambient",
        combatSafe: true,
      },
      modules: [
        {
          module: "missions",
          modes: ["ambient", "focused"],
          coordinate: ({ mode, isFocused }) => {
            calls.push(`missions:${mode}:${isFocused}`);
            return true;
          },
        },
        {
          module: "mcc",
          modes: ["focused"],
          coordinate: ({ mode, isFocused }) => {
            calls.push(`mcc:${mode}:${isFocused}`);
            return true;
          },
        },
      ],
    });

    expect(runtime.coordinate()).toEqual([
      { module: "missions", mode: "ambient", isFocused: false, handled: true },
    ]);

    runtime.focusModule("mcc");
    expect(runtime.coordinate()).toEqual([
      { module: "mcc", mode: "focused", isFocused: true, handled: true },
    ]);
    expect(runtime.getState().session.activeModule).toBe("mcc");

    runtime.recordPreferenceSignal({
      signalId: "mission-1",
      kind: "exploration",
      confidence: 0.75,
      source: "mission-choice",
    });
    expect(runtime.getState().preferenceModel.dominantKind).toBe("exploration");

    runtime.clearFocus();
    expect(runtime.coordinate()).toEqual([
      { module: "missions", mode: "ambient", isFocused: false, handled: true },
    ]);
    expect(calls).toEqual([
      "missions:ambient:false",
      "mcc:focused:true",
      "missions:ambient:false",
    ]);
    expect(() => runtime.focusModule("tutorial")).toThrow(
      "cannot focus an unregistered module"
    );
  });

  it("generates conservative bootstrap missions and fails closed when disabled", () => {
    const bootstrap = {
      missionId: "mission-bootstrap-survival",
      title: "Find a safe place to rest",
      summary: "Survey the nearby clearing before nightfall.",
      preferenceKind: "exploration" as const,
      horizon: "short-term" as const,
      minimumReadiness: 0,
    };

    const bootstrapResult = generatePlayerSystemMission({
      featureFlagEnabled: true,
      readiness: 0.1,
      preferenceModel: createPlayerSystemPreferenceModelState([]),
      mccFocusTarget: null,
      nearbyOpportunities: [],
      worldStatePressures: [],
      bootstrap,
      candidates: [
        {
          missionId: "mission-combat-drill",
          title: "Practice a guarded strike",
          summary: "Build a safe combat baseline.",
          preferenceKind: "combat",
          horizon: "short-term",
          minimumReadiness: 0.5,
        },
      ],
    });

    expect(bootstrapResult.featureFlagId).toBe(
      PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID
    );
    expect(bootstrapResult.phase).toBe("bootstrap");
    expect(bootstrapResult.fallbackUsed).toBe(true);
    expect(bootstrapResult.proposal?.missionId).toBe(
      "mission-bootstrap-survival"
    );
    expect(bootstrapResult.proposal?.state).toBe("proposed");

    const disabledResult = generatePlayerSystemMission({
      featureFlagEnabled: false,
      readiness: 1,
      preferenceModel: createPlayerSystemPreferenceModelState([]),
      nearbyOpportunities: [],
      worldStatePressures: [],
      bootstrap,
      candidates: [],
    });

    expect(disabledResult.phase).toBe("disabled");
    expect(disabledResult.proposal).toBeNull();
    expect(disabledResult.rationale).toContain(
      "Mission rollout is disabled by the feature flag."
    );
  });

  it("selects adaptive missions from preference, MCC, opportunity, and pressure inputs", () => {
    const adaptive = generatePlayerSystemMission({
      featureFlagEnabled: true,
      readiness: 0.8,
      preferenceModel: createPlayerSystemPreferenceModelState([
        { signalId: "combat-1", kind: "combat", confidence: 0.9, source: "test" },
        { signalId: "combat-2", kind: "combat", confidence: 0.8, source: "test" },
        { signalId: "combat-3", kind: "combat", confidence: 0.85, source: "test" },
      ]),
      mccFocusTarget: "combat",
      nearbyOpportunities: [{ opportunityId: "training-yard", kind: "combat" }],
      worldStatePressures: [
        { kind: "combat", intensity: 0.8, summary: "A nearby threat is escalating." },
      ],
      bootstrap: {
        missionId: "mission-bootstrap",
        title: "Survey the clearing",
        summary: "Find a safe place to learn.",
        preferenceKind: "exploration",
        horizon: "short-term",
        minimumReadiness: 0,
      },
      candidates: [
        {
          missionId: "mission-combat-drill",
          title: "Practice a guarded strike",
          summary: "Build a safe combat baseline.",
          preferenceKind: "combat",
          horizon: "short-term",
          minimumReadiness: 0.5,
          opportunityId: "training-yard",
          pressureKind: "combat",
        },
        {
          missionId: "mission-crafting-gather",
          title: "Gather useful fibers",
          summary: "Explore a nearby crafting opportunity.",
          preferenceKind: "crafting",
          horizon: "medium-term",
          minimumReadiness: 0.1,
        },
      ],
    });

    expect(adaptive.phase).toBe("adaptive");
    expect(adaptive.fallbackUsed).toBe(false);
    expect(adaptive.stablePreference).toBe(true);
    expect(adaptive.proposal?.missionId).toBe("mission-combat-drill");
    expect(adaptive.rationale).toEqual(
      expect.arrayContaining([
        "Stable combat preference evidence is available.",
        "MCC focus target matches the selected mission.",
        "A nearby opportunity matches the selected mission.",
        "World-state pressure matches the selected mission.",
      ])
    );
  });

  it("synchronizes accepted guild quests into immutable runtime tracking", () => {
    const input = {
      featureFlagEnabled: true,
      now: "2026-07-15T01:30:00.000Z",
      acceptedQuests: [
        {
          questId: "guild-quest-1",
          guildId: "guild-wardens",
          state: "accepted" as const,
          title: "Secure the eastern pass",
          summary: "Keep the route open for the guild caravan.",
          routeId: "eastern-pass",
          synergyTags: ["escort", "defense"],
          acceptedAt: "2026-07-15T01:00:00.000Z",
          updatedAt: "2026-07-15T01:15:00.000Z",
          sourceVersion: 3,
        },
      ],
      missions: [
        {
          missionId: "mission-escort",
          routeId: "eastern-pass",
          synergyTags: ["escort", "scouting"],
        },
      ],
    };

    const result = synchronizePlayerSystemGuildQuests(input);
    const tracking = result.tracking[0];

    expect(result.featureFlagId).toBe(PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID);
    expect(result.enabled).toBe(true);
    expect(tracking?.authority).toMatchObject({
      questId: "guild-quest-1",
      guildId: "guild-wardens",
      state: "accepted",
      sourceVersion: 3,
    });
    expect(tracking?.system.missionSynergy).toEqual([
      {
        missionId: "mission-escort",
        strength: "strong",
        matchedTags: ["escort"],
        routeAligned: true,
      },
    ]);
    expect(tracking?.system.routeConflict).toEqual({
      state: "conflict",
      routeId: "eastern-pass",
      conflictingQuestIds: [],
      conflictingMissionIds: ["mission-escort"],
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(tracking)).toBe(true);
    expect(Object.isFrozen(tracking?.authority)).toBe(true);
    expect(Object.isFrozen(tracking?.system)).toBe(true);
    expect(Object.isFrozen(tracking?.system.missionSynergy)).toBe(true);
    expect(Object.isFrozen(tracking?.system.routeConflict)).toBe(true);
    expect(result).toEqual(synchronizePlayerSystemGuildQuests(input));
  });

  it("keeps guild-owned state separate from System annotations and detects quest route conflicts", () => {
    const result = synchronizePlayerSystemGuildQuests({
      featureFlagEnabled: true,
      now: "2026-07-15T01:30:00.000Z",
      acceptedQuests: [
        {
          questId: "quest-a",
          guildId: "guild-a",
          state: "accepted",
          title: "Guard the bridge",
          summary: "Hold the crossing.",
          routeId: "river-road",
          synergyTags: ["defense"],
          acceptedAt: "2026-07-15T01:00:00.000Z",
          updatedAt: "2026-07-15T01:01:00.000Z",
          sourceVersion: 1,
        },
        {
          questId: "quest-b",
          guildId: "guild-b",
          state: "accepted",
          title: "Survey the bridge",
          summary: "Map the crossing.",
          routeId: "river-road",
          synergyTags: ["scouting"],
          acceptedAt: "2026-07-15T01:00:00.000Z",
          updatedAt: "2026-07-15T01:02:00.000Z",
          sourceVersion: 2,
        },
      ],
      missions: [],
    });

    expect(result.tracking.map(({ authority }) => authority.questId)).toEqual([
      "quest-a",
      "quest-b",
    ]);
    expect(result.tracking[0]?.system.routeConflict.conflictingQuestIds).toEqual([
      "quest-b",
    ]);
    expect(result.tracking[1]?.system.routeConflict.conflictingQuestIds).toEqual([
      "quest-a",
    ]);
    expect(result.tracking[0]?.authority).not.toHaveProperty("system");
    expect(result.tracking[0]?.system).not.toHaveProperty("guildId");
  });

  it("fails closed when guild quests are disabled and rejects ambiguous or invalid authority input", () => {
    const baseQuest = {
      questId: "quest-disabled",
      guildId: "guild-1",
      state: "accepted" as const,
      title: "A disabled quest",
      summary: "Not surfaced while rollout is disabled.",
      routeId: null,
      synergyTags: [],
      acceptedAt: "2026-07-15T01:00:00.000Z",
      updatedAt: "2026-07-15T01:00:00.000Z",
      sourceVersion: 1,
    };

    const disabled = synchronizePlayerSystemGuildQuests({
      featureFlagEnabled: false,
      now: "2026-07-15T01:30:00.000Z",
      acceptedQuests: [baseQuest],
      missions: [],
    });
    expect(disabled.featureFlagId).toBe(PLAYER_SYSTEM_GUILD_QUESTS_FEATURE_FLAG_ID);
    expect(disabled.enabled).toBe(false);
    expect(disabled.tracking).toEqual([]);
    expect(disabled.rationale).toContain(
      "Guild-quest rollout is disabled by the feature flag."
    );

    expect(() =>
      synchronizePlayerSystemGuildQuests({
        featureFlagEnabled: true,
        acceptedQuests: [baseQuest, { ...baseQuest, sourceVersion: 2 }],
        missions: [],
      })
    ).toThrow("acceptedQuests must not contain duplicate questId values");
    expect(() =>
      synchronizePlayerSystemGuildQuests({
        featureFlagEnabled: true,
        acceptedQuests: [{ ...baseQuest, updatedAt: "not-a-timestamp" }],
        missions: [],
      })
    ).toThrow("acceptedQuests[0].updatedAt must be a valid ISO timestamp");
    expect(() =>
      synchronizePlayerSystemGuildQuests({
        featureFlagEnabled: true,
        acceptedQuests: [
          { ...baseQuest, state: "active" as unknown as "accepted" },
        ],
        missions: [],
      })
    ).toThrow("acceptedQuests[0].state must be accepted");
  });

  it("creates a curated event-log and achievement read model behind feature and capability gates", () => {
    const input = {
      featureFlagEnabled: true,
      capabilityEnabled: true,
      eventLog: [
        {
          eventId: "event-older",
          occurredAt: "2026-07-14T23:00:00.000Z",
          category: "discovery",
          title: "Found the quiet grove",
          summary: "The grove offered a safe place to recover.",
          audience: "player-and-gossip" as const,
          tags: ["safe", "discovery"],
        },
        {
          eventId: "event-latest",
          occurredAt: "2026-07-15T00:30:00.000Z",
          category: "combat",
          title: "Held the eastern pass",
          summary: "The pass remained open after a guarded defense.",
          audience: "player-only" as const,
          tags: ["defense"],
        },
      ],
      highlightedMoments: [
        {
          momentId: "moment-1",
          eventId: "event-older",
          occurredAt: "2026-07-14T23:00:00.000Z",
          title: "A safe discovery",
          summary: "A calm route was added to the recall surface.",
          reason: "Useful recovery context",
          rank: 1,
        },
      ],
      achievements: [
        {
          achievementId: "achievement-guard",
          title: "Steady guardian",
          summary: "Hold a route without abandoning the party.",
          state: "in-progress" as const,
          progress: { current: 2, target: 3 },
          earnedAt: null,
          updatedAt: "2026-07-15T00:35:00.000Z",
        },
        {
          achievementId: "achievement-rest",
          title: "First safe rest",
          summary: "Find one safe recovery location.",
          state: "earned" as const,
          progress: { current: 1, target: 1 },
          earnedAt: "2026-07-14T23:01:00.000Z",
          updatedAt: "2026-07-14T23:01:00.000Z",
        },
      ],
      freshness: {
        lastProjectionAt: "2026-07-15T00:40:00.000Z",
        sourceObservedAt: "2026-07-15T00:39:45.000Z",
        sourceLagSeconds: 15,
        staleAfterSeconds: 60,
      },
    };

    const result = createPlayerSystemEventAchievementReadModel(input);

    expect(result.featureFlagId).toBe(
      PLAYER_SYSTEM_EVENTS_ACHIEVEMENTS_FEATURE_FLAG_ID
    );
    expect(result.capabilityId).toBe(
      PLAYER_SYSTEM_EVENTS_ACHIEVEMENTS_CAPABILITY_ID
    );
    expect(result.available).toBe(true);
    expect(result.eventLog.map((entry) => entry.eventId)).toEqual([
      "event-latest",
      "event-older",
    ]);
    expect(result.highlightedMoments[0]).toMatchObject({
      momentId: "moment-1",
      eventId: "event-older",
    });
    expect(result.achievements[0]?.progress.percent).toBeCloseTo(66.67, 2);
    expect(result.achievements[1]?.state).toBe("earned");
    expect(result.freshness).toMatchObject({
      sourceLagSeconds: 15,
      stale: false,
    });
    expect(result.eventLog[0]).not.toHaveProperty("rawPayload");
    expect(result.eventLog[0]).not.toHaveProperty("hiddenTruth");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.eventLog)).toBe(true);
    expect(Object.isFrozen(result.eventLog[0])).toBe(true);
    expect(Object.isFrozen(result.achievements[0]?.progress)).toBe(true);
  });

  it("filters curated event-log entries without exposing non-player storage concerns", () => {
    const entries = [
      {
        eventId: "event-a",
        occurredAt: "2026-07-15T00:00:00.000Z",
        category: "discovery",
        title: "A quiet path",
        summary: "A safe route was discovered.",
        audience: "player-and-gossip" as const,
        tags: ["safe", "route"],
      },
      {
        eventId: "event-b",
        occurredAt: "2026-07-15T01:00:00.000Z",
        category: "combat",
        title: "A guarded defense",
        summary: "The route held.",
        audience: "player-only" as const,
        tags: ["defense"],
      },
    ];

    expect(
      filterPlayerSystemEventLog(entries, {
        category: "discovery",
        tags: ["safe"],
        query: "quiet",
        limit: 1,
      })
    ).toEqual([{ ...entries[0], tags: ["route", "safe"] }]);
    expect(
      filterPlayerSystemEventLog(entries, {
        from: "2026-07-15T00:30:00.000Z",
      }).map((entry) => entry.eventId)
    ).toEqual(["event-b"]);
  });

  it("fails closed for disabled or unauthorized read-model access and rejects invalid projections", () => {
    const base = {
      featureFlagEnabled: true,
      capabilityEnabled: true,
      eventLog: [],
      highlightedMoments: [],
      achievements: [],
      freshness: {
        lastProjectionAt: "2026-07-15T00:40:00.000Z",
        sourceObservedAt: null,
        sourceLagSeconds: 0,
        staleAfterSeconds: 60,
      },
    };

    const disabled = createPlayerSystemEventAchievementReadModel({
      ...base,
      featureFlagEnabled: false,
    });
    expect(disabled.available).toBe(false);
    expect(disabled.eventLog).toEqual([]);
    expect(disabled.rationale).toContain(
      "Event-log and achievement rollout is disabled by the feature flag."
    );

    const unauthorized = createPlayerSystemEventAchievementReadModel({
      ...base,
      capabilityEnabled: false,
    });
    expect(unauthorized.available).toBe(false);
    expect(unauthorized.rationale).toContain(
      "The event-log and achievement capability is not enabled."
    );

    expect(() =>
      createPlayerSystemEventAchievementReadModel({
        ...base,
        freshness: { ...base.freshness, sourceLagSeconds: -1 },
      })
    ).toThrow("sourceLagSeconds must be a finite non-negative number");
    expect(() =>
      createPlayerSystemEventAchievementReadModel({
        ...base,
        achievements: [
          {
            achievementId: "invalid",
            title: "Invalid achievement",
            summary: "The current value exceeds the target.",
            state: "in-progress",
            progress: { current: 2, target: 1 },
            earnedAt: null,
            updatedAt: "2026-07-15T00:40:00.000Z",
          },
        ],
      })
    ).toThrow("progress.current must not exceed progress.target");
  });

  it("feeds mission decisions into the runtime preference model and enforces lifecycle boundaries", () => {
    const runtime = createPlayerSystemRuntime({
      session: { sessionId: "mission-session", mode: "ambient", combatSafe: true },
    });
    let mission = createPlayerSystemMission({
      proposal: {
        featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
        missionId: "mission-lifecycle",
        title: "Complete the first survey",
        summary: "Learn what the nearby area can safely offer.",
        preferenceKind: "exploration",
        horizon: "short-term",
        minimumReadiness: 0,
        state: "proposed",
        phase: "bootstrap",
        rationale: ["bootstrap fallback"],
      },
      now: "2026-07-15T00:00:00.000Z",
    });

    const accepted = applyPlayerSystemMissionTransition(runtime, mission, {
      action: "accept",
      at: "2026-07-15T00:00:01.000Z",
    });
    mission = accepted.mission;
    expect(mission.state).toBe("accepted");
    expect(accepted.learningSignal?.decision).toBe("accepted");
    expect(runtime.getState().preferenceModel.dominantKind).toBe("exploration");

    mission = transitionPlayerSystemMission(mission, {
      action: "activate",
      at: "2026-07-15T00:00:02.000Z",
    }).mission;
    mission = applyPlayerSystemMissionTransition(runtime, mission, {
      action: "pin",
      at: "2026-07-15T00:00:03.000Z",
    }).mission;
    mission = transitionPlayerSystemMission(mission, {
      action: "begin-completion",
      at: "2026-07-15T00:00:04.000Z",
    }).mission;
    mission = applyPlayerSystemMissionTransition(runtime, mission, {
      action: "complete",
      at: "2026-07-15T00:00:05.000Z",
    }).mission;

    expect(mission.state).toBe("completed");
    expect(mission.learningSignals.map((signal) => signal.decision)).toEqual([
      "accepted",
      "pinned",
      "completed",
    ]);
    expect(() =>
      transitionPlayerSystemMission(mission, {
        action: "activate",
        at: "2026-07-15T00:00:06.000Z",
      })
    ).toThrow("cannot transition mission from completed with activate");
  });

  it("supports refusal, abandonment, failure, and cooldown terminal paths", () => {
    const proposal = {
      featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
      missionId: "mission-cooldown",
      title: "Test lifecycle path",
      summary: "Exercise refusal and cooldown behavior.",
      preferenceKind: "governance" as const,
      horizon: "medium-term" as const,
      minimumReadiness: 0,
      state: "proposed" as const,
      phase: "bootstrap" as const,
      rationale: ["test"],
    };
    const refused = transitionPlayerSystemMission(
      createPlayerSystemMission({ proposal, now: "2026-07-15T00:00:00.000Z" }),
      { action: "decline", at: "2026-07-15T00:00:01.000Z" }
    ).mission;
    expect(refused.state).toBe("refused");
    expect(refused.learningSignals[0]?.decision).toBe("declined");

    const abandoned = transitionPlayerSystemMission(
      transitionPlayerSystemMission(
        createPlayerSystemMission({ proposal }),
        { action: "accept" }
      ).mission,
      { action: "activate" }
    );
    const abandonedResult = transitionPlayerSystemMission(abandoned.mission, {
      action: "abandon",
    });
    expect(abandonedResult.mission.state).toBe("abandoned");
    expect(abandonedResult.learningSignal?.decision).toBe("abandoned");

    const failed = transitionPlayerSystemMission(
      transitionPlayerSystemMission(
        createPlayerSystemMission({ proposal }),
        { action: "accept" }
      ).mission,
      { action: "activate" }
    );
    const failedResult = transitionPlayerSystemMission(failed.mission, {
      action: "fail",
    });
    expect(failedResult.mission.state).toBe("failed");
    expect(failedResult.learningSignal?.decision).toBe("failed");

    const cooldown = transitionPlayerSystemMission(refused, {
      action: "cooldown",
      at: "2026-07-15T00:00:02.000Z",
      cooldownMs: 60000,
    }).mission;
    expect(cooldown.state).toBe("cooldown");
    expect(cooldown.cooldownUntil).toBe("2026-07-15T00:01:02.000Z");
    expect(() =>
      transitionPlayerSystemMission(cooldown, {
        action: "accept",
        at: "2026-07-15T00:00:03.000Z",
      })
    ).toThrow("cannot transition mission from cooldown with accept");
  });

  it("consumes reward preflight before surfacing approved, modified, or rejected outcomes", () => {
    const modified = evaluatePlayerSystemMissionReward({
      rewardType: "guidance-credit",
      requestedAmount: 5,
      unit: "credits",
      explanation: "Grant a bounded learning credit.",
      preflight: {
        rewardSource: "mission",
        rewardType: "guidance-credit",
        globalCap: 10,
        sessionCap: 4,
        grantedGlobal: 4,
        grantedSession: 2,
        readiness: "ready",
      },
      metadata: { missionClass: "short-term" },
    });
    expect(modified.outcome).toBe("modified");
    expect(modified.grantedAmount).toBe(2);
    expect(modified.explanation).toContain("modified");
    expect(modified.metadata).toMatchObject({
      missionClass: "short-term",
      preflightStatus: "allowed",
    });

    const approved = evaluatePlayerSystemMissionReward({
      rewardType: "route-annotation",
      requestedAmount: 1,
      unit: "annotations",
      explanation: "Grant one route annotation.",
      preflight: {
        rewardSource: "mission",
        rewardType: "route-annotation",
        globalCap: 10,
        sessionCap: 4,
        grantedGlobal: 1,
        grantedSession: 1,
        readiness: "ready",
      },
    });
    expect(approved.outcome).toBe("approved");
    expect(approved.grantedAmount).toBe(1);

    const rejected = evaluatePlayerSystemMissionReward({
      rewardType: "trust-surplus",
      requestedAmount: 1,
      unit: "trust",
      explanation: "Grant a trust surplus.",
      preflight: {
        rewardSource: "mission",
        rewardType: "trust-surplus",
        globalCap: 5,
        sessionCap: 2,
        grantedGlobal: 0,
        grantedSession: 0,
        readiness: "blocked",
        policyAllowed: false,
        policyReason: "Institutional gate is not satisfied.",
      },
    });
    expect(rejected.outcome).toBe("rejected");
    expect(rejected.grantedAmount).toBe(0);
    expect(rejected.explanation).toContain("Institutional gate is not satisfied.");
    expect(Object.isFrozen(rejected.metadata)).toBe(true);

    let mission = createPlayerSystemMission({
      proposal: {
        featureFlagId: PLAYER_SYSTEM_MISSIONS_FEATURE_FLAG_ID,
        missionId: "mission-reward",
        title: "Reward test",
        summary: "Complete the reward path.",
        preferenceKind: "crafting",
        horizon: "short-term",
        minimumReadiness: 0,
        state: "proposed",
        phase: "bootstrap",
        rationale: ["test"],
      },
    });
    mission = transitionPlayerSystemMission(mission, { action: "accept" }).mission;
    mission = transitionPlayerSystemMission(mission, { action: "activate" }).mission;
    mission = transitionPlayerSystemMission(mission, { action: "begin-completion" }).mission;
    mission = transitionPlayerSystemMission(mission, { action: "complete" }).mission;
    mission = transitionPlayerSystemMission(mission, {
      action: "surface-reward",
      rewardDecision: modified,
    }).mission;
    expect(mission.state).toBe("rewarding");
    expect(mission.rewardDecision?.outcome).toBe("modified");
    expect(() =>
      transitionPlayerSystemMission(
        createPlayerSystemMission({
          proposal: {
            ...mission,
            minimumReadiness: 0,
            state: "proposed",
            phase: "bootstrap",
            rationale: ["test"],
          },
        }),
        { action: "surface-reward", rewardDecision: rejected }
      )
    ).toThrow("cannot surface a rejected mission reward");
  });

  it("routes narrated responses through the shared audio policy", () => {
    const contract = createAiSpeechNarratedResponse({
      id: "tutorial-first-spell",
      utteranceId: "tutorial-first-spell-v1",
      locale: "en-GB",
      priority: "high",
      ducking: "music",
      combatSafeDelivery: "condensed",
    });

    const route = resolvePlayerSystemAudioRoute({
      contract,
      context: {
        focusMode: "focused",
        featureFlags: {
          [PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID]: true,
        },
      },
    });

    expect(route.featureFlagId).toBe(PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID);
    expect(route.decision).toMatchObject({
      deliver: true,
      mode: "full",
      ducking: "music",
    });
    expect(Object.isFrozen(route)).toBe(true);
  });

  it("fails closed for suppressed combat-safe cues and disabled rollout", () => {
    const cue = createAiSpeechLocalizedCue({
      id: "mission-progress",
      cueFamily: "mission",
      cueId: "mission-progress",
      locale: "en-GB",
      priority: "normal",
      ducking: "music",
      combatSafeDelivery: "suppressed",
    });

    expect(
      resolvePlayerSystemAudioRoute({
        contract: cue,
        context: {
          focusMode: "combat-safe",
          featureFlags: {
            [PLAYER_SYSTEM_AUDIO_FEATURE_FLAG_ID]: true,
          },
        },
      }).decision
    ).toMatchObject({
      deliver: false,
      reasonCodes: ["combat-safe-priority-suppressed"],
    });

    expect(
      resolvePlayerSystemAudioRoute({
        contract: cue,
        context: { focusMode: "ambient" },
      }).decision.reasonCodes
    ).toEqual(["player-system-audio-rollout-disabled"]);
    expect(isPlayerSystemAudioFocusMode("combat-safe")).toBe(true);
    expect(isPlayerSystemAudioFocusMode("unknown")).toBe(false);
  });

  it("creates pane-scoped voice commands and resolves combat-safe access", () => {
    const registration = createPlayerSystemVoiceCommandRegistration({
      name: "tutorial.read-next",
      patterns: ["read next tutorial", /continue tutorial/iu],
      focusedPanes: ["tutorial"],
      commandFamily: "tutorial",
      handler: ({ sessionId }) => sessionId.length > 0,
    });

    expect(registration.scope).toMatchObject({
      focusedPanes: ["tutorial"],
      commandFamily: "tutorial",
      allowInCombatSafe: false,
    });
    expect(Object.isFrozen(registration)).toBe(true);
    expect(Object.isFrozen(registration.scope)).toBe(true);
    expect(
      resolvePlayerSystemVoiceCommand(registration, {
        focusedPane: "tutorial",
        allowedCommandFamilies: ["tutorial", "mission"],
      })
    ).toEqual({ allowed: true, reason: "allowed" });
    expect(
      resolvePlayerSystemVoiceCommand(registration, { focusedPane: "missions" })
    ).toEqual({ allowed: false, reason: "focused-pane-required" });
    expect(
      resolvePlayerSystemVoiceCommand(registration, {
        focusedPane: "tutorial",
        combatSafe: true,
      })
    ).toEqual({ allowed: false, reason: "combat-safe-restricted" });
  });

  it("allows explicitly safe MCC and warning commands and validates bounds", () => {
    const registration = createPlayerSystemVoiceCommandRegistration({
      name: "mcc.read-warning",
      focusedPanes: ["mcc", "warning"],
      commandFamily: "mcc",
      allowInCombatSafe: true,
      handler: () => "success",
    });

    expect(
      resolvePlayerSystemVoiceCommand(registration, {
        focusedPane: "warning",
        combatSafe: true,
        allowedCommandFamilies: ["mcc"],
      })
    ).toEqual({ allowed: true, reason: "allowed" });
    expect(() =>
      createPlayerSystemVoiceCommandRegistration({
        name: "invalid",
        focusedPanes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        commandFamily: "warning",
        handler: () => "success",
      })
    ).toThrow("focusedPanes must contain at most 8 entries");
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

  it("exports the governance contract with bounded scorecards and rollout flag", () => {
    const contract = createPlayerSystemGovernanceContract();

    expect(contract.featureFlagId).toBe(PLAYER_SYSTEM_GOVERNANCE_FEATURE_FLAG_ID);
    expect(contract.rewards.boundedRewardKinds).toEqual([
      "guidance-credit",
      "trust-surplus",
      "route-annotation",
      "readiness-preview",
    ]);
    expect(contract.scorecards.map((scorecard) => scorecard.id)).toEqual([
      "tutorial-usefulness",
      "mission-fit",
      "preference-learning",
      "voice-intent",
      "reward-boundedness",
    ]);
    expect(Object.isFrozen(contract.scorecards)).toBe(true);
  });

  it("models overdrive consent, active duration, and expiry/auto-disengage states", () => {
    const idle = createPlayerSystemOverdriveState({
      requested: false,
      ready: false,
      consent: "required",
      feedback: "No overdrive request is active.",
    });
    const awaitingConsent = createPlayerSystemOverdriveState({
      requested: true,
      ready: false,
      consent: "required",
      feedback: "Awaiting player confirmation.",
      requestedAt: "2026-06-19T09:00:00.000Z",
    });
    const ready = createPlayerSystemOverdriveState({
      requested: true,
      ready: true,
      consent: "granted",
      feedback: "Overdrive is primed but not active yet.",
      requestedAt: "2026-06-19T09:00:00.000Z",
    });
    const awaitingReadiness = createPlayerSystemOverdriveState({
      requested: true,
      ready: false,
      consent: "granted",
      feedback: "Overdrive request is still waiting on readiness.",
      requestedAt: "2026-06-19T09:00:00.000Z",
    });
    const active = createPlayerSystemOverdriveState({
      requested: true,
      ready: true,
      consent: "granted",
      feedback: "Overdrive engaged.",
      requestedAt: "2026-06-19T09:00:00.000Z",
      activatedAt: "2026-06-19T09:01:00.000Z",
      now: "2026-06-19T09:02:00.000Z",
      durationMs: 180000,
    });
    const defaultDuration = createPlayerSystemOverdriveState({
      requested: true,
      ready: true,
      consent: "granted",
      feedback: "Overdrive duration defaults when activation is present.",
      requestedAt: "2026-06-19T09:00:00.000Z",
      activatedAt: "2026-06-19T09:01:00.000Z",
      now: "2026-06-19T09:02:00.000Z",
    });
    const expired = createPlayerSystemOverdriveState({
      requested: true,
      ready: true,
      consent: "granted",
      feedback: "Overdrive expired.",
      requestedAt: "2026-06-19T09:00:00.000Z",
      activatedAt: "2026-06-19T09:01:00.000Z",
      now: "2026-06-19T09:05:00.000Z",
      durationMs: 180000,
    });
    const autoDisengaged = createPlayerSystemOverdriveState({
      requested: true,
      ready: true,
      consent: "granted",
      feedback: "Overdrive disengaged for safety.",
      requestedAt: "2026-06-19T09:00:00.000Z",
      activatedAt: "2026-06-19T09:01:00.000Z",
      now: "2026-06-19T09:02:00.000Z",
      durationMs: 180000,
      autoDisengageTrigger: "fatigue-threshold-breached",
    });

    expect(idle.status).toBe("idle");
    expect(awaitingConsent.status).toBe("consent-required");
    expect(ready.status).toBe("ready");
    expect(awaitingReadiness.status).toBe("consent-required");
    expect(active.status).toBe("active");
    expect(active.remainingMs).toBe(120000);
    expect(defaultDuration.durationMs).toBe(180000);
    expect(expired.status).toBe("expired");
    expect(expired.remainingMs).toBe(0);
    expect(autoDisengaged.status).toBe("auto-disengaged");
    expect(autoDisengaged.autoDisengageTrigger).toBe(
      "fatigue-threshold-breached"
    );
  });

  it("surfaces governance denial and escalation states", () => {
    const denied = createPlayerSystemOverdriveState({
      requested: true,
      ready: false,
      consent: "denied",
      feedback: "Overdrive denied by safety governance.",
      denialReason: "fatigue ceiling exceeded",
    });
    const escalated = createPlayerSystemOverdriveState({
      requested: true,
      ready: false,
      consent: "denied",
      feedback: "Overdrive escalated for guardian review.",
      denialReason: "child-safe guardrail exceeded",
      escalationReason: "guardian-review-required",
    });

    expect(denied.status).toBe("denied");
    expect(denied.denialReason).toBe("fatigue ceiling exceeded");
    expect(escalated.status).toBe("escalated");
    expect(escalated.escalationReason).toBe("guardian-review-required");
  });

  it("evaluates bounded reward preflight against caps, readiness, and policy outcomes", () => {
    const allowed = evaluatePlayerSystemRewardPreflight({
      rewardSource: "mission",
      rewardType: "guidance-credit",
      globalCap: 10,
      sessionCap: 4,
      grantedGlobal: 4,
      grantedSession: 1,
      readiness: "ready",
      policyAllowed: true,
    });
    const blocked = evaluatePlayerSystemRewardPreflight({
      rewardSource: "voice-intent",
      rewardType: "readiness-preview",
      globalCap: 2,
      sessionCap: 1,
      grantedGlobal: 2,
      grantedSession: 1,
      readiness: "blocked",
      policyAllowed: false,
      policyReason: "Voice intent was not confidently resolved.",
    });
    const sessionWarning = evaluatePlayerSystemRewardPreflight({
      rewardSource: "mission",
      rewardType: "route-annotation",
      globalCap: 5,
      sessionCap: 2,
      grantedGlobal: 1,
      grantedSession: 1,
      readiness: "ready",
      policyAllowed: true,
    });
    const outsideContract = evaluatePlayerSystemRewardPreflight({
      rewardSource: "tutorial",
      rewardType: "xp-bonus" as never,
      globalCap: 5,
      sessionCap: 3,
      grantedGlobal: 1,
      grantedSession: 1,
      readiness: "ready",
      policyAllowed: true,
    });
    const needsGateNearCap = evaluatePlayerSystemRewardPreflight({
      rewardSource: "mission",
      rewardType: "route-annotation",
      globalCap: 2,
      sessionCap: 2,
      grantedGlobal: 1,
      grantedSession: 1,
      readiness: "needs-gate",
      policyAllowed: true,
    });
    const fallbackPolicyDenied = evaluatePlayerSystemRewardPreflight({
      rewardSource: "mission",
      rewardType: "trust-surplus",
      globalCap: 4,
      sessionCap: 2,
      grantedGlobal: 0,
      grantedSession: 0,
      readiness: "ready",
      policyAllowed: false,
    });

    expect(allowed.allowed).toBe(true);
    expect(allowed.status).toBe("allowed");
    expect(blocked.allowed).toBe(false);
    expect(blocked.status).toBe("blocked");
    expect(blocked.warnings).toContain("Global reward cap has already been reached.");
    expect(blocked.warnings).toContain(
      "Voice intent was not confidently resolved."
    );
    expect(sessionWarning.status).toBe("warning");
    expect(sessionWarning.warnings).toContain("Session reward cap is nearly exhausted.");
    expect(outsideContract.allowed).toBe(false);
    expect(outsideContract.warnings).toContain(
      "Reward type is outside the bounded reward contract."
    );
    expect(needsGateNearCap.status).toBe("warning");
    expect(needsGateNearCap.warnings).toContain(
      "Readiness gate still requires explicit confirmation."
    );
    expect(needsGateNearCap.warnings).toContain("Global reward cap is nearly exhausted.");
    expect(needsGateNearCap.warnings).toContain("Session reward cap is nearly exhausted.");
    expect(fallbackPolicyDenied.warnings).toContain(
      "Governance policy denied the reward."
    );
  });

  it("assesses repair-tax consequences for child-safe and harder-mode flows", () => {
    const childSafe = createPlayerSystemRepairTaxAssessment({
      mode: "child-safe",
      repairRequired: true,
      ppBalance: 2,
    });
    const harderMode = createPlayerSystemRepairTaxAssessment({
      mode: "harder-mode",
      repairRequired: true,
      ppBalance: 9,
      repairCost: 5,
    });
    const unfunded = createPlayerSystemRepairTaxAssessment({
      mode: "harder-mode",
      repairRequired: true,
      ppBalance: 1,
      repairCost: 5,
    });
    const inactive = createPlayerSystemRepairTaxAssessment({
      mode: "child-safe",
      repairRequired: false,
      ppBalance: 0,
    });
    const childSafeWithSuppliedCost = createPlayerSystemRepairTaxAssessment({
      mode: "child-safe",
      repairRequired: true,
      ppBalance: 0,
      repairCost: 9,
    });

    expect(childSafe.policy.spellImpairment).toBe("none");
    expect(childSafe.canAffordRepair).toBe(true);
    expect(harderMode.policy.spellImpairment).toBe("high-complexity-suppressed");
    expect(harderMode.canAffordRepair).toBe(true);
    expect(harderMode.repairCost).toBe(5);
    expect(unfunded.canAffordRepair).toBe(false);
    expect(unfunded.feedback).toContain("MCC recovery must wait");
    expect(inactive.feedback).toContain("No repair-tax consequence is active");
    expect(childSafeWithSuppliedCost.repairCost).toBe(0);
    expect(childSafeWithSuppliedCost.canAffordRepair).toBe(true);
  });

  it("invokes governance evaluation adapters for tutorial, mission-fit, and voice-intent signals", async () => {
    const calls: string[] = [];
    const summary = await evaluatePlayerSystemGovernanceSignals({
      adapter: {
        adapterId: "player-system-governance-evals",
        async observeSignal(signal) {
          calls.push(signal.signalId);
          return {
            signalId: signal.signalId,
            accepted: signal.signalId !== "voice-intent",
            score: signal.signalId === "voice-intent" ? 0.58 : 0.92,
            summary: `Observed ${signal.signalId}`,
          };
        },
      },
      signals: [
        { signalId: "tutorial-usefulness", summary: "Tutorial branch outcome" },
        { signalId: "mission-fit", summary: "Mission recommendation outcome" },
        { signalId: "voice-intent", summary: "Voice command interpretation" },
      ],
    });

    expect(calls).toEqual([
      "tutorial-usefulness",
      "mission-fit",
      "voice-intent",
    ]);
    expect(summary.status).toBe("failed");
    expect(summary.acceptedSignals).toBe(2);
    expect(summary.results).toHaveLength(3);
  });

  it("records adapter failures in the governance summary", async () => {
    const summary = await evaluatePlayerSystemGovernanceSignals({
      adapter: {
        adapterId: "player-system-governance-evals",
        async observeSignal(signal) {
          throw new Error(`adapter timeout for ${signal.signalId}`);
        },
      },
      signals: [{ signalId: "voice-intent", summary: "Voice command interpretation" }],
    });

    expect(summary.status).toBe("degraded");
    expect(summary.averageScore).toBeNull();
    expect(summary.results).toEqual([
      expect.objectContaining({
        signalId: "voice-intent",
        accepted: false,
        error: "adapter timeout for voice-intent",
      }),
    ]);
  });

  it("falls back to an unknown adapter failure message for non-Error throws", async () => {
    const summary = await evaluatePlayerSystemGovernanceSignals({
      adapter: {
        adapterId: "player-system-governance-evals",
        async observeSignal() {
          throw "timeout";
        },
      },
      signals: [{ signalId: "voice-intent", summary: "Voice command interpretation" }],
    });

    expect(summary.results).toEqual([
      expect.objectContaining({
        signalId: "voice-intent",
        error: "Unknown adapter failure",
      }),
    ]);
  });

  it("marks governance summaries as passed when every signal is accepted", async () => {
    const summary = await evaluatePlayerSystemGovernanceSignals({
      adapter: {
        adapterId: "player-system-governance-evals",
        async observeSignal(signal) {
          return {
            signalId: signal.signalId,
            accepted: true,
            score: 0.95,
            summary: `Observed ${signal.signalId}`,
            metadata: { source: "test" },
          };
        },
      },
      signals: [
        { signalId: "tutorial-usefulness", summary: "Tutorial branch outcome" },
        { signalId: "mission-fit", summary: "Mission recommendation outcome" },
      ],
    });

    expect(summary.status).toBe("passed");
    expect(summary.averageScore).toBe(0.95);
  });

  it("combines static governance policy with runtime outcomes", () => {
    const runtime = createPlayerSystemGovernanceRuntimeState({
      enabled: true,
      source: "feature-flag",
      activeMode: "harder-mode",
      overdrive: {
        requested: true,
        ready: true,
        consent: "granted",
        feedback: "Overdrive is active.",
        requestedAt: "2026-06-19T09:00:00.000Z",
        activatedAt: "2026-06-19T09:01:00.000Z",
        now: "2026-06-19T09:02:00.000Z",
        durationMs: 180000,
      },
      repairTax: {
        mode: "harder-mode",
        repairRequired: true,
        ppBalance: 7,
      },
      rewardPreflight: {
        rewardSource: "mission",
        rewardType: "guidance-credit",
        globalCap: 8,
        sessionCap: 3,
        grantedGlobal: 3,
        grantedSession: 1,
        readiness: "ready",
        policyAllowed: true,
      },
    });

    expect(runtime.enabled).toBe(true);
    expect(runtime.source).toBe("feature-flag");
    expect(runtime.activeMode).toBe("harder-mode");
    expect(runtime.overdriveState.status).toBe("active");
    expect(runtime.repairTaxAssessment.policy.mode).toBe("harder-mode");
    expect(runtime.rewardPreflight.allowed).toBe(true);
  });

  it("defaults governance runtime mode and source when they are omitted", () => {
    const runtime = createPlayerSystemGovernanceRuntimeState({
      enabled: false,
      overdrive: {
        requested: false,
        ready: true,
        consent: "granted",
        feedback: "Governance standby is ready.",
      },
      repairTax: {
        mode: "child-safe",
        repairRequired: false,
        ppBalance: 0,
      },
      rewardPreflight: {
        rewardSource: "mission",
        rewardType: "guidance-credit",
        globalCap: 1,
        sessionCap: 1,
        grantedGlobal: 0,
        grantedSession: 0,
        readiness: "ready",
        policyAllowed: true,
      },
      evaluationSummary: {
        adapterId: "player-system-governance-evals",
        status: "passed",
        totalSignals: 0,
        acceptedSignals: 0,
        averageScore: null,
        results: [],
      },
    });

    expect(runtime.source).toBe("default-disabled");
    expect(runtime.activeMode).toBe("child-safe");
    expect(runtime.overdriveState.status).toBe("idle");
  });

  it("rejects unsupported overdrive consent values", () => {
    expect(() =>
      createPlayerSystemOverdriveState({
        requested: false,
        ready: false,
        consent: "pending" as "required",
        feedback: "Unsupported state.",
      })
    ).toThrow("consent must be required, granted, or denied");

    expect(() =>
      createPlayerSystemOverdriveState({
        requested: true,
        ready: false,
        consent: "required",
        feedback: "Timestamp should fail.",
        requestedAt: "not-a-date",
      })
    ).toThrow("requestedAt must be a valid ISO timestamp");

    expect(() =>
      evaluatePlayerSystemRewardPreflight({
        rewardSource: "mission",
        rewardType: "guidance-credit",
        globalCap: Number.NaN,
        sessionCap: 1,
        grantedGlobal: 0,
        grantedSession: 0,
        readiness: "ready",
        policyAllowed: true,
      })
    ).toThrow("globalCap must be a finite number");
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

  it("falls back from apprenticeship when no eligible crafting handoff is available", () => {
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
          eligible: false,
          label: "Spellcraft handoff",
          handoffSurface: "player-system:spellcraft",
          reason: "requires-apprenticeship-stage",
          requirement: "Unlock an apprenticeship-candidate stage first.",
        }),
      ],
    });

    expect(routingState.recommendation).toEqual({
      routeId: "academy",
      focus: "hybrid",
      reason: "advanced-academy",
    });
    expect(
      routingState.craftingAuthorities.map((authority) => authority.authorityId)
    ).toEqual(["spellcraft"]);
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

  it("composes stable MCC guidance with an internalized mission bias", () => {
    const guidance = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: true,
      growthFocus: "internalized",
      readiness: {
        band: "stable",
        title: "Internalized readiness is stable",
        summary: "The current posture supports a bounded next step.",
      },
      feasibility: {
        verdict: "feasible",
        summary: "The authoritative MCC preview accepted the plan.",
      },
      warnings: [],
      spellcraftHandoff: {
        authorityId: "spellcraft",
        eligible: true,
        label: "Spellcraft handoff",
        handoffSurface: "player-system:spellcraft",
        reason: "spellcraft-stage-ready",
      },
    });

    expect(guidance.featureFlagId).toBe(
      PLAYER_SYSTEM_MCC_GUIDANCE_FEATURE_FLAG_ID
    );
    expect(guidance.state).toBe("ready");
    expect(guidance.missionBias).toEqual({
      focus: "internalized",
      preferredSignalKinds: ["combat", "exploration"],
      rationale: expect.stringContaining("body-anchored"),
    });
    expect(guidance.spellcraft?.verdict).toBe("recommended");
    expect(guidance.spellcraft?.authorityHandoff?.authorityId).toBe(
      "spellcraft"
    );
  });

  it("turns externalized and hybrid leanings into bounded warning guidance", () => {
    const externalized = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: true,
      growthFocus: "externalized",
      readiness: {
        band: "pressured",
        title: "Externalized readiness is under pressure",
        summary: "Keep the next commitment narrow.",
      },
      feasibility: {
        verdict: "conditional",
        summary: "Spell grammar is valid but needs a smaller target burden.",
      },
      warnings: [
        {
          kind: "thermal",
          summary: "Thermal load is elevated.",
        },
      ],
    });
    const hybrid = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: true,
      growthFocus: "hybrid",
      readiness: {
        band: "stable",
        title: "Hybrid readiness is stable",
        summary: "Both channels remain inside the bounded band.",
      },
      feasibility: {
        verdict: "feasible",
        summary: "The preview is feasible.",
      },
      warnings: [],
    });

    expect(externalized.state).toBe("warning");
    expect(externalized.missionBias?.preferredSignalKinds).toEqual([
      "crafting",
      "social",
    ]);
    expect(externalized.spellcraft?.verdict).toBe("conditional");
    expect(externalized.readiness.warnings[0]).toEqual({
      kind: "thermal",
      summary: "Thermal load is elevated.",
      blocking: false,
    });
    expect(hybrid.missionBias?.preferredSignalKinds).toEqual([
      "combat",
      "crafting",
      "social",
    ]);
  });

  it("blocks guidance when authoritative feasibility or safety warnings block commitment", () => {
    const guidance = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: true,
      growthFocus: "hybrid",
      readiness: {
        band: "restricted",
        title: "Hybrid readiness is restricted",
        summary: "Recovery is required before commitment.",
      },
      feasibility: {
        verdict: "blocked",
        summary: "The authoritative MCC feasibility check rejected the plan.",
      },
      warnings: [
        {
          kind: "chaos",
          summary: "Chaos pressure is volatile.",
          blocking: true,
        },
      ],
    });

    expect(guidance.state).toBe("blocked");
    expect(guidance.spellcraft?.verdict).toBe("blocked");
    expect(guidance.spellcraft?.reasons).toEqual(
      expect.arrayContaining([
        "The authoritative MCC feasibility check rejected the plan.",
        "Chaos pressure is volatile.",
      ])
    );
  });

  it("keeps disabled guidance dark while retaining a bounded focus and readiness echo", () => {
    const guidance = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: false,
      growthFocus: "externalized",
      readiness: {
        band: "stable",
        title: "Externalized readiness is stable",
        summary: "The current posture supports a bounded next step.",
      },
      feasibility: {
        verdict: "feasible",
        summary: "The authoritative MCC preview accepted the plan.",
      },
      warnings: [],
    });

    expect(guidance.enabled).toBe(false);
    expect(guidance.state).toBe("disabled");
    expect(guidance.growthFocus).toBe("externalized");
    expect(guidance.missionBias).toBeNull();
    expect(guidance.spellcraft).toBeNull();
  });

  it("fails closed for invalid MCC outcomes and returns immutable guidance", () => {
    expect(() =>
      createPlayerSystemMccGuidanceState({
        featureFlagEnabled: true,
        growthFocus: "unknown" as never,
        readiness: {
          band: "stable",
          title: "Stable",
          summary: "Summary",
        },
        feasibility: { verdict: "feasible", summary: "Feasible" },
        warnings: [],
      })
    ).toThrow("growthFocus must be a supported MCC expression track");

    expect(() =>
      createPlayerSystemMccGuidanceState({
        featureFlagEnabled: true,
        growthFocus: "hybrid",
        readiness: {
          band: "unknown" as never,
          title: "Stable",
          summary: "Summary",
        },
        feasibility: { verdict: "feasible", summary: "Feasible" },
        warnings: [],
      })
    ).toThrow("readiness.band must be a supported MCC readiness band");

    expect(() =>
      createPlayerSystemMccGuidanceState({
        featureFlagEnabled: true,
        growthFocus: "hybrid",
        readiness: {
          band: "stable",
          title: "Stable",
          summary: "Summary",
        },
        feasibility: { verdict: "feasible", summary: "Feasible" },
        warnings: Array.from({ length: 9 }, () => ({
          kind: "chaos" as const,
          summary: "Warning",
        })),
      })
    ).toThrow("warnings must contain at most 8 entries");

    expect(() =>
      createPlayerSystemMccGuidanceState({
        featureFlagEnabled: true,
        growthFocus: "hybrid",
        readiness: {
          band: "stable",
          title: "Stable",
          summary: "Summary",
        },
        feasibility: { verdict: "feasible", summary: "Feasible" },
        warnings: [],
        spellcraftHandoff: {
          authorityId: "training",
          eligible: true,
          label: "Training handoff",
          handoffSurface: "player-system:training",
          reason: "wrong-authority",
        },
      })
    ).toThrow("spellcraftHandoff.authorityId must be spellcraft");

    const inputWarnings = [
      { kind: "fatigue" as const, summary: "Fatigue is rising." },
    ];
    const guidance = createPlayerSystemMccGuidanceState({
      featureFlagEnabled: true,
      growthFocus: "internalized",
      readiness: {
        band: "stable",
        title: "Stable",
        summary: "Summary",
      },
      feasibility: { verdict: "feasible", summary: "Feasible" },
      warnings: inputWarnings,
    });
    inputWarnings[0]!.summary = "Mutated warning";

    expect(guidance.readiness.warnings[0]?.summary).toBe("Fatigue is rising.");
    expect(Object.isFrozen(guidance)).toBe(true);
    expect(Object.isFrozen(guidance.readiness.warnings)).toBe(true);
    expect(Object.isFrozen(guidance.missionBias?.preferredSignalKinds)).toBe(
      true
    );
  });
});
