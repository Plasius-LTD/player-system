import { describe, expect, it } from "vitest";

import { promoteUnreleasedChangelog } from "../scripts/promote-unreleased-changelog.mjs";

describe("promoteUnreleasedChangelog", () => {
  it("promotes simple unreleased bullet lists into a versioned section", () => {
    const input = `# Changelog

All notable changes to this project will be documented in this file.

## Unrelated

## [Unreleased]
- add release automation
- fix publish gating
`;

    const output = promoteUnreleasedChangelog(input, {
      nextVersion: "0.1.5",
      date: "2026-06-13",
      repository: "example/player-system",
    });

    expect(output).toContain("## [Unreleased]");
    expect(output).toContain("## [0.1.5] - 2026-06-13");
    expect(output).toContain("- add release automation");
    expect(output).toContain("- **Added**");
  });

  it("preserves later version sections and updates footer links when present", () => {
    const input = `# Changelog

## [Unreleased]

- **Changed**
  - preserve release metadata

## [0.1.4] - 2026-06-13

- previous release

[Unreleased]: https://github.com/example/player-system/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/example/player-system/releases/tag/v0.1.4
`;

    const output = promoteUnreleasedChangelog(input, {
      nextVersion: "0.1.5",
      date: "2026-06-14",
      repository: "example/player-system",
    });

    expect(output).toContain("## [0.1.5] - 2026-06-14");
    expect(output).toContain("## [0.1.4] - 2026-06-13");
    expect(output).toContain(
      "[Unreleased]: https://github.com/example/player-system/compare/v0.1.5...HEAD",
    );
    expect(output).toContain(
      "[0.1.5]: https://github.com/example/player-system/releases/tag/v0.1.5",
    );
  });

  it("leaves the changelog untouched when the target version already exists", () => {
    const input = `# Changelog

## [Unreleased]

- **Changed**
  - preserve release metadata

## [0.1.5] - 2026-06-14
`;

    expect(
      promoteUnreleasedChangelog(input, {
        nextVersion: "0.1.5",
        date: "2026-06-14",
        repository: "example/player-system",
      }),
    ).toBe(input);
  });
});
