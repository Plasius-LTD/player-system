import {
  createPlayerSystemRuntimeContract,
  defaultPlayerSystemRuntimeContract,
} from "../src/index.js";

const uncheckedContract = (input: unknown) =>
  createPlayerSystemRuntimeContract(
    input as Parameters<typeof createPlayerSystemRuntimeContract>[0]
  );

describe("runtime deadline and bounded-work contracts", () => {
  for (const field of ["transitionMs", "idleCancellationMs", "externalHandoffMs"]) {
    it.each([0, -1, NaN, Infinity, -Infinity, "150", null])(
      `rejects invalid ${field}: %s without echoing input`,
      (value) => {
        expect(() => uncheckedContract({ timeoutBudget: { [field]: value } }))
          .toThrow(`timeoutBudget.${field} must be a finite positive number`);
      }
    );
  }

  for (const field of [
    "maxBufferedTransitions", "maxSignalsPerCommit", "maxStateSnapshotsPerTick",
  ]) {
    it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "4", null])(
      `rejects invalid ${field}: %s`,
      (value) => {
        expect(() => uncheckedContract({ updateBudget: { [field]: value } }))
          .toThrow(`updateBudget.${field} must be a non-negative safe integer`);
      }
    );
  }

  it("preserves fractional positive deadlines and zero-work update limits", () => {
    const contract = createPlayerSystemRuntimeContract({
      timeoutBudget: { transitionMs: 0.5 },
      updateBudget: {
        maxBufferedTransitions: 0, maxSignalsPerCommit: 0, maxStateSnapshotsPerTick: 0,
      },
      failurePolicy: { cancellationRequired: false },
    });
    expect(contract.timeoutBudget.transitionMs).toBe(0.5);
    expect(Object.values(contract.updateBudget)).toEqual([0, 0, 0]);
    expect(contract.failurePolicy.cancellationRequired).toBe(false);
    expect(contract.failurePolicy.retryOwner).toBe("caller");
  });

  it("treats omitted and explicitly undefined optional fields as defaults", () => {
    expect(createPlayerSystemRuntimeContract({
      featureFlagId: undefined,
      timeoutBudget: { transitionMs: undefined },
      updateBudget: { maxSignalsPerCommit: undefined },
      failurePolicy: { cancellationRequired: undefined, retryOwner: undefined,
        boundedErrorCodes: undefined },
    })).toEqual(defaultPlayerSystemRuntimeContract);
  });

  it.each([null, [], "invalid"])("rejects non-object contract input %s", (value) => {
    expect(() => uncheckedContract(value)).toThrow("input must be an object");
  });

  for (const field of ["timeoutBudget", "updateBudget", "failurePolicy"]) {
    it.each([null, [], "invalid"])(`rejects non-object ${field}: %s`, (value) => {
      expect(() => uncheckedContract({ [field]: value })).toThrow(`${field} must be an object`);
    });
  }

  it.each(["", "  ", "x".repeat(257), null, 12])("rejects invalid flag key %s", (value) => {
    expect(() => uncheckedContract({ featureFlagId: value }))
      .toThrow("featureFlagId must be a non-empty string of at most 256 characters");
  });

  it.each([null, "false", 0])("rejects invalid cancellation policy %s", (value) => {
    expect(() => uncheckedContract({ failurePolicy: { cancellationRequired: value } }))
      .toThrow("failurePolicy.cancellationRequired must be a boolean");
  });

  it.each([null, "server", "", false])("rejects non-caller retry owner %s", (value) => {
    expect(() => uncheckedContract({ failurePolicy: { retryOwner: value } }))
      .toThrow("failurePolicy.retryOwner must be caller");
  });

  it.each([[], Array(65).fill("CODE"), "CODE", null].map((value) => [value]))(
    "rejects missing or unbounded error vocabularies %s", (value) => {
      expect(() => uncheckedContract({ failurePolicy: { boundedErrorCodes: value } }))
        .toThrow("failurePolicy.boundedErrorCodes must contain 1 to 64 codes");
    }
  );

  it.each([[""], ["  "], ["x".repeat(129)], [null], [12], Array(1)].map((value) => [value]))(
    "rejects invalid or sparse error codes %s", (value) => {
      expect(() => uncheckedContract({ failurePolicy: { boundedErrorCodes: value } }))
        .toThrow("failurePolicy.boundedErrorCodes entry must be a non-empty string of at most 128 characters");
    }
  );

  it("accepts documented upper bounds and snapshots caller-owned arrays", () => {
    const codes = Array<string>(64).fill("C".repeat(128));
    const contract = createPlayerSystemRuntimeContract({
      featureFlagId: "f".repeat(256),
      updateBudget: { maxSignalsPerCommit: Number.MAX_SAFE_INTEGER },
      failurePolicy: { boundedErrorCodes: codes },
    });
    codes[0] = "CHANGED";
    expect(contract.failurePolicy.boundedErrorCodes[0]).toBe("C".repeat(128));
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.updateBudget)).toBe(true);
    expect(Object.isFrozen(contract.failurePolicy)).toBe(true);
    expect(Object.isFrozen(contract.failurePolicy.boundedErrorCodes)).toBe(true);
    expect(defaultPlayerSystemRuntimeContract.updateBudget.maxSignalsPerCommit).toBe(12);
  });

  it("projects only declared fields into bounded contract snapshots", () => {
    const contract = uncheckedContract({
      timeoutBudget: { transitionMs: 1, unexpected: "ignored" },
      updateBudget: { maxSignalsPerCommit: 0, unexpected: "ignored" },
      failurePolicy: { cancellationRequired: false, unexpected: "ignored" },
    });
    expect(Object.keys(contract.timeoutBudget)).toHaveLength(3);
    expect(Object.keys(contract.updateBudget)).toHaveLength(3);
    expect(Object.keys(contract.failurePolicy)).toHaveLength(3);
  });
});
