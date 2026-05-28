import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  collectExportPaths,
  getRequiredPublishedPaths,
  normalizePublishedPath,
  parseNpmPackJson,
} = require("../scripts/verify-public-package.cjs") as {
  collectExportPaths: (exportsField: unknown) => string[];
  getRequiredPublishedPaths: (packageJson: Record<string, unknown>) => string[];
  normalizePublishedPath: (filePath: string) => string;
  parseNpmPackJson: (rawOutput: string) => unknown;
};

describe("verify public package", () => {
  it("collects and deduplicates required dist entrypoints", () => {
    expect(
      getRequiredPublishedPaths({
        main: "./dist/index.cjs",
        module: "./dist/index.js",
        types: "./dist/index.d.ts",
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
            require: "./dist/index.cjs",
          },
          "./package.json": "./package.json",
        },
      }),
    ).toEqual([
      "dist/index.cjs",
      "dist/index.js",
      "dist/index.d.ts",
    ]);
  });

  it("recursively collects export paths", () => {
    expect(
      collectExportPaths({
        ".": {
          import: "./dist/index.js",
          require: "./dist/index.cjs",
        },
        "./feature": [
          "./dist/feature.js",
          {
            types: "./dist/feature.d.ts",
          },
        ],
      }),
    ).toEqual([
      "./dist/index.js",
      "./dist/index.cjs",
      "./dist/feature.js",
      "./dist/feature.d.ts",
    ]);
  });

  it("normalizes relative package paths", () => {
    expect(normalizePublishedPath("./dist/index.js")).toBe("dist/index.js");
    expect(normalizePublishedPath("dist/index.cjs")).toBe("dist/index.cjs");
  });

  it("parses npm pack JSON when npm writes warnings around it", () => {
    expect(
      parseNpmPackJson(`npm warn deprecated package\n[{"files":[{"path":"dist/index.js"}]}]\n`),
    ).toEqual([
      {
        files: [
          {
            path: "dist/index.js",
          },
        ],
      },
    ]);
  });
});
