import type { PracticeItem } from "../data/practiceItems";
import type { Confidence, ProgressData } from "./progress";
import { getItemConfidence } from "./progress";

export type ContentMode = "chords" | "scales" | "both";
export type SelectionMode = "manual" | "random" | "weakest";
export type PromptMode = "name" | "notes" | "mixed";
export type PromptType = "name" | "notes";
export type Hand = "left" | "both" | "right";
export type LengthMode = "count" | "time";

export interface PracticeConfig {
  content: ContentMode;
  includeInversions: boolean;
  selection: SelectionMode;
  // baseIds chosen in the table (root chords and scales)
  manualIds: string[];
  maxConfidence: Confidence;
  promptMode: PromptMode;
  hands: Hand[];
  lengthMode: LengthMode;
  cardCount: number;
  minutes: number;
}

export interface Card {
  key: string;
  itemId: string;
  prompt: PromptType;
  hand: Hand;
}

export type Rng = () => number;

export const DEFAULT_CONFIG: PracticeConfig = {
  content: "chords",
  includeInversions: false,
  selection: "weakest",
  manualIds: [],
  maxConfidence: 3,
  promptMode: "name",
  hands: ["both"],
  lengthMode: "count",
  cardCount: 10,
  minutes: 5,
};

// item ids that match the config's content, inversion, selection and confidence filters
export const getPool = (
  items: PracticeItem[],
  config: PracticeConfig,
  progress: ProgressData
): string[] => {
  const manual = new Set(config.manualIds);

  return items
    .filter((item) => {
      if (config.content === "chords" && item.kind !== "chord") return false;
      if (config.content === "scales" && item.kind !== "scale") return false;
      if (!config.includeInversions && item.inversion > 0) return false;
      if (config.selection === "manual" && !manual.has(item.baseId)) {
        return false;
      }
      return getItemConfidence(progress, item.id) <= config.maxConfidence;
    })
    .map((item) => item.id);
};

export const shuffle = <T>(list: T[], rng: Rng): T[] => {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// least confident first, then least recently tested (never tested first), ties random
export const orderByWeakest = (
  ids: string[],
  progress: ProgressData,
  rng: Rng
): string[] => {
  const lastTested = (id: string) => {
    const date = progress.items[id]?.lastTested;
    return date ? Date.parse(date) : -Infinity;
  };

  return shuffle(ids, rng).sort(
    (a, b) =>
      getItemConfidence(progress, a) - getItemConfidence(progress, b) ||
      lastTested(a) - lastTested(b)
  );
};

// endless card supply: works through the pool, re-ordering it each pass
export const createCardSource = (
  pool: string[],
  config: PracticeConfig,
  progress: ProgressData,
  rng: Rng = Math.random
) => {
  let queue: string[] = [];
  let lastItemId: string | null = null;
  let counter = 0;

  const refill = () => {
    queue =
      config.selection === "weakest"
        ? orderByWeakest(pool, progress, rng)
        : shuffle(pool, rng);
    // avoid showing the same item twice in a row across passes
    if (queue.length > 1 && queue[0] === lastItemId) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }
  };

  const hands: Hand[] = config.hands.length ? config.hands : ["both"];

  return (): Card | null => {
    if (!pool.length) return null;
    if (!queue.length) refill();

    const itemId = queue.shift()!;
    lastItemId = itemId;

    const prompt: PromptType =
      config.promptMode === "mixed"
        ? rng() < 0.5
          ? "name"
          : "notes"
        : config.promptMode;

    return {
      key: `${counter++}:${itemId}`,
      itemId,
      prompt,
      hand: hands[Math.floor(rng() * hands.length)],
    };
  };
};

export const buildDeck = (
  pool: string[],
  config: PracticeConfig,
  progress: ProgressData,
  count: number,
  rng: Rng = Math.random
): Card[] => {
  const next = createCardSource(pool, config, progress, rng);
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const card = next();
    if (!card) break;
    cards.push(card);
  }
  return cards;
};

const HANDS: Hand[] = ["left", "both", "right"];

// merges stored (untrusted) config over the defaults
export const parseConfig = (input: unknown): PracticeConfig => {
  if (typeof input !== "object" || input === null) return DEFAULT_CONFIG;
  const raw = input as Record<string, unknown>;
  const oneOf = <T>(value: unknown, options: T[], fallback: T): T =>
    options.includes(value as T) ? (value as T) : fallback;
  const positiveInt = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isInteger(value) && value > 0
      ? value
      : fallback;

  const hands = Array.isArray(raw.hands)
    ? HANDS.filter((hand) => (raw.hands as unknown[]).includes(hand))
    : [];

  return {
    content: oneOf(raw.content, ["chords", "scales", "both"], DEFAULT_CONFIG.content),
    includeInversions:
      typeof raw.includeInversions === "boolean"
        ? raw.includeInversions
        : DEFAULT_CONFIG.includeInversions,
    selection: oneOf(raw.selection, ["manual", "random", "weakest"], DEFAULT_CONFIG.selection),
    manualIds: Array.isArray(raw.manualIds)
      ? raw.manualIds.filter((id): id is string => typeof id === "string")
      : [],
    maxConfidence: oneOf(raw.maxConfidence, [0, 1, 2, 3], DEFAULT_CONFIG.maxConfidence),
    promptMode: oneOf(raw.promptMode, ["name", "notes", "mixed"], DEFAULT_CONFIG.promptMode),
    hands: hands.length ? hands : DEFAULT_CONFIG.hands,
    lengthMode: oneOf(raw.lengthMode, ["count", "time"], DEFAULT_CONFIG.lengthMode),
    cardCount: positiveInt(raw.cardCount, DEFAULT_CONFIG.cardCount),
    minutes: positiveInt(raw.minutes, DEFAULT_CONFIG.minutes),
  };
};
