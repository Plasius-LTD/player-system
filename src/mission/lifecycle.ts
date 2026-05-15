export enum MissionState { IDLE = "idle", ACTIVE = "active", COMPLETING = "completing", REWARDING = "rewarding", COOLDOWN = "cooldown" }
export interface MissionConfig { maxReward: number; minReward: number; difficultyScale: number; cooldownMs: number; rewardDecayRate: number; }
export class MissionLifecycle {
  private state: MissionState = MissionState.IDLE;
  constructor(private config: MissionConfig) {}
  getState(): MissionState { return this.state; }
  startMission(): boolean { if (this.state !== MissionState.IDLE) return false; this.state = MissionState.ACTIVE; return true; }
}
