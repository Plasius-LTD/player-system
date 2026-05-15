export interface EvaluationAdapter { name: string; evaluate(ctx: any): number; }
export class BoundedRewardPolicy {
  private adapters: EvaluationAdapter[] = [];
  constructor(private globalCap: number, private sessionCap: number) {}
  addAdapter(a: EvaluationAdapter) { this.adapters.push(a); }
  calculateReward(ctx: any): number { return Math.min(ctx.baseReward, this.sessionCap); }
}
export class OverdrivePolicy {
  private active = false;
  activate(durMs: number) { this.active = true; }
  isActive() { return this.active; }
}
