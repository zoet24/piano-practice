import { describe, expect, it } from "vitest";
import {
  applyAnswers,
  createEmptyProgress,
  nextConfidence,
  parseProgress,
  parseProgressText,
  summarizeResults,
} from "./progress";

const VALID = new Set(["chord:C", "chord:Cm", "scale:C-major"]);

describe("nextConfidence", () => {
  it("moves up on yes, stays on unsure and down on no", () => {
    expect(nextConfidence(1, "yes")).toBe(2);
    expect(nextConfidence(1, "unsure")).toBe(1);
    expect(nextConfidence(1, "no")).toBe(0);
  });

  it("stays within 0 and 3", () => {
    expect(nextConfidence(3, "yes")).toBe(3);
    expect(nextConfidence(0, "no")).toBe(0);
  });
});

describe("applyAnswers", () => {
  it("reaches full confidence after three yes answers", () => {
    const now = new Date("2026-09-17T10:00:00Z");
    const result = applyAnswers(
      createEmptyProgress(),
      [
        { itemId: "chord:C", answer: "yes" },
        { itemId: "chord:C", answer: "yes" },
        { itemId: "chord:C", answer: "yes" },
      ],
      now
    );
    expect(result.items["chord:C"]).toEqual({
      confidence: 3,
      timesTested: 3,
      lastTested: now.toISOString(),
    });
  });

  it("does not mutate the original data", () => {
    const original = createEmptyProgress();
    applyAnswers(original, [{ itemId: "chord:C", answer: "yes" }]);
    expect(original.items).toEqual({});
  });
});

describe("summarizeResults", () => {
  it("groups answers per item with before and after confidence", () => {
    const data = applyAnswers(createEmptyProgress(), [
      { itemId: "chord:C", answer: "yes" },
      { itemId: "chord:C", answer: "yes" },
    ]);
    expect(
      summarizeResults(data, [
        { itemId: "chord:C", answer: "no" },
        { itemId: "scale:C-major", answer: "yes" },
        { itemId: "chord:C", answer: "unsure" },
      ])
    ).toEqual([
      { itemId: "chord:C", answers: ["no", "unsure"], before: 2, after: 1 },
      { itemId: "scale:C-major", answers: ["yes"], before: 0, after: 1 },
    ]);
  });
});

describe("parseProgress", () => {
  it("keeps valid entries and drops unknown ids or bad values", () => {
    const parsed = parseProgress(
      {
        version: 1,
        items: {
          "chord:C": { confidence: 2, timesTested: 4, lastTested: "2026-01-01T00:00:00.000Z" },
          "chord:Cm": { confidence: 7, timesTested: 1, lastTested: "2026-01-01T00:00:00.000Z" },
          "chord:unknown": { confidence: 1, timesTested: 1, lastTested: "2026-01-01T00:00:00.000Z" },
          "scale:C-major": { confidence: 1 },
        },
      },
      VALID
    );
    expect(Object.keys(parsed.items).sort()).toEqual(["chord:C", "scale:C-major"]);
    expect(parsed.items["scale:C-major"].timesTested).toBe(0);
  });

  it("rejects files that are not progress exports", () => {
    expect(() => parseProgress({ hello: "world" }, VALID)).toThrow();
    expect(() => parseProgress(null, VALID)).toThrow();
    expect(() => parseProgressText("not json", VALID)).toThrow(/valid JSON/);
  });
});
