import { describe, expect, it } from "vitest";
import { ALL_PRACTICE_ITEMS, PRACTICE_ITEMS_BY_ID } from "../data/practiceItems";
import {
  buildDeck,
  DEFAULT_CONFIG,
  getPool,
  parseConfig,
  type PracticeConfig,
} from "./practiceDeck";
import { applyAnswers, createEmptyProgress } from "./progress";

// deterministic pseudo-random numbers
const seededRng = (seed = 1) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const config = (patch: Partial<PracticeConfig>): PracticeConfig => ({
  ...DEFAULT_CONFIG,
  ...patch,
});

describe("practice items", () => {
  it("has unique ids", () => {
    expect(PRACTICE_ITEMS_BY_ID.size).toBe(ALL_PRACTICE_ITEMS.length);
  });

  it("creates root and inversion items for chords", () => {
    expect(PRACTICE_ITEMS_BY_ID.get("chord:C")?.inversion).toBe(0);
    expect(PRACTICE_ITEMS_BY_ID.get("chord:C/inv2")?.inversion).toBe(2);
    expect(PRACTICE_ITEMS_BY_ID.has("chord:C7/inv3")).toBe(true);
    expect(PRACTICE_ITEMS_BY_ID.has("chord:C/inv3")).toBe(false);
    expect(PRACTICE_ITEMS_BY_ID.has("scale:F#-blues")).toBe(true);
  });
});

describe("getPool", () => {
  const empty = createEmptyProgress();

  it("filters by content and inversions", () => {
    const chords = getPool(ALL_PRACTICE_ITEMS, config({ content: "chords" }), empty);
    expect(chords).toHaveLength(12 * 9);
    expect(chords.every((id) => id.startsWith("chord:") && !id.includes("/inv"))).toBe(true);

    const withInversions = getPool(
      ALL_PRACTICE_ITEMS,
      config({ content: "chords", includeInversions: true }),
      empty
    );
    expect(withInversions).toContain("chord:C/inv1");

    const scales = getPool(ALL_PRACTICE_ITEMS, config({ content: "scales" }), empty);
    expect(scales).toHaveLength(12 * 6);
  });

  it("uses manual selections, including their inversions", () => {
    const pool = getPool(
      ALL_PRACTICE_ITEMS,
      config({
        content: "both",
        selection: "manual",
        includeInversions: true,
        manualIds: ["chord:C", "scale:A-minor"],
      }),
      empty
    );
    expect(pool.sort()).toEqual(["chord:C", "chord:C/inv1", "chord:C/inv2", "scale:A-minor"]);
  });

  it("filters by maximum confidence", () => {
    const progress = applyAnswers(empty, [
      { itemId: "chord:C", answer: "yes" },
      { itemId: "chord:C", answer: "yes" },
    ]);
    const pool = getPool(ALL_PRACTICE_ITEMS, config({ maxConfidence: 1 }), progress);
    expect(pool).not.toContain("chord:C");
    expect(pool).toContain("chord:Cm");
  });
});

describe("buildDeck", () => {
  it("builds the requested number of cards, repeating the pool if needed", () => {
    const deck = buildDeck(["chord:C", "chord:Cm"], DEFAULT_CONFIG, createEmptyProgress(), 5, seededRng());
    expect(deck).toHaveLength(5);
    deck.slice(1).forEach((card, i) => expect(card.itemId).not.toBe(deck[i].itemId));
  });

  it("returns no cards for an empty pool", () => {
    expect(buildDeck([], DEFAULT_CONFIG, createEmptyProgress(), 5)).toEqual([]);
  });

  it("puts the least confident items first", () => {
    const progress = applyAnswers(createEmptyProgress(), [
      { itemId: "chord:C", answer: "yes" },
      { itemId: "chord:C", answer: "yes" },
      { itemId: "chord:Cm", answer: "yes" },
    ]);
    const deck = buildDeck(
      ["chord:C", "chord:Cm", "chord:D"],
      config({ selection: "weakest" }),
      progress,
      3,
      seededRng(42)
    );
    expect(deck.map((card) => card.itemId)).toEqual(["chord:D", "chord:Cm", "chord:C"]);
  });

  it("uses only the chosen prompt types and hands", () => {
    const deck = buildDeck(
      ["chord:C", "chord:Cm", "chord:D"],
      config({ promptMode: "notes", hands: ["left", "right"] }),
      createEmptyProgress(),
      30,
      seededRng(7)
    );
    expect(new Set(deck.map((card) => card.prompt))).toEqual(new Set(["notes"]));
    expect(new Set(deck.map((card) => card.hand))).toEqual(new Set(["left", "right"]));
  });
});

describe("parseConfig", () => {
  it("falls back to defaults for missing or invalid values", () => {
    expect(parseConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(parseConfig({ content: "songs", hands: [], cardCount: -2, minutes: 3 })).toEqual({
      ...DEFAULT_CONFIG,
      minutes: 3,
    });
  });
});
