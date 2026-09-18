import { readStoredJSON, writeStoredJSON } from "./storage";

export type Confidence = 0 | 1 | 2 | 3;
export type Answer = "yes" | "unsure" | "no";

export const MAX_CONFIDENCE: Confidence = 3;

export interface ItemProgress {
  confidence: Confidence;
  timesTested: number;
  lastTested: string; // ISO date
}

export interface ProgressData {
  version: 1;
  items: Record<string, ItemProgress>;
}

export interface AnswerResult {
  itemId: string;
  answer: Answer;
}

export interface ItemSummary {
  itemId: string;
  answers: Answer[];
  before: Confidence;
  after: Confidence;
}

const STORAGE_KEY = "piano-practice:progress:v1";

const ANSWER_DELTA: Record<Answer, number> = { yes: 1, unsure: 0, no: -1 };

export const createEmptyProgress = (): ProgressData => ({
  version: 1,
  items: {},
});

export const clampConfidence = (value: number): Confidence =>
  Math.max(0, Math.min(MAX_CONFIDENCE, Math.round(value))) as Confidence;

export const nextConfidence = (current: Confidence, answer: Answer) =>
  clampConfidence(current + ANSWER_DELTA[answer]);

export const getItemConfidence = (data: ProgressData, itemId: string) =>
  data.items[itemId]?.confidence ?? 0;

// applies answers in order, so an item answered twice moves twice
export const applyAnswers = (
  data: ProgressData,
  results: AnswerResult[],
  now: Date = new Date()
): ProgressData => {
  const items = { ...data.items };

  results.forEach(({ itemId, answer }) => {
    const prev = items[itemId];
    items[itemId] = {
      confidence: nextConfidence(prev?.confidence ?? 0, answer),
      timesTested: (prev?.timesTested ?? 0) + 1,
      lastTested: now.toISOString(),
    };
  });

  return { ...data, items };
};

// groups a session's answers per item with confidence before and after, in first-seen order
export const summarizeResults = (
  data: ProgressData,
  results: AnswerResult[]
): ItemSummary[] => {
  const byItem = new Map<string, ItemSummary>();

  results.forEach(({ itemId, answer }) => {
    let summary = byItem.get(itemId);
    if (!summary) {
      const before = getItemConfidence(data, itemId);
      summary = { itemId, answers: [], before, after: before };
      byItem.set(itemId, summary);
    }
    summary.answers.push(answer);
    summary.after = nextConfidence(summary.after, answer);
  });

  return [...byItem.values()];
};

export const serializeProgress = (data: ProgressData) =>
  JSON.stringify(data, null, 2);

// validates untrusted progress JSON; unknown ids and malformed entries are dropped
export const parseProgress = (
  input: unknown,
  validIds: Set<string>
): ProgressData => {
  if (
    typeof input !== "object" ||
    input === null ||
    (input as { version?: unknown }).version !== 1 ||
    typeof (input as { items?: unknown }).items !== "object" ||
    (input as { items?: unknown }).items === null
  ) {
    throw new Error("This file isn't a piano-practice progress export.");
  }

  const items: Record<string, ItemProgress> = {};

  Object.entries((input as { items: object }).items).forEach(
    ([itemId, entry]) => {
      if (!validIds.has(itemId) || typeof entry !== "object" || !entry) return;
      const { confidence, timesTested, lastTested } = entry as Record<
        string,
        unknown
      >;
      if (
        typeof confidence !== "number" ||
        !Number.isInteger(confidence) ||
        confidence < 0 ||
        confidence > MAX_CONFIDENCE
      ) {
        return;
      }

      items[itemId] = {
        confidence: confidence as Confidence,
        timesTested:
          typeof timesTested === "number" && timesTested >= 0
            ? Math.floor(timesTested)
            : 0,
        lastTested:
          typeof lastTested === "string" && !isNaN(Date.parse(lastTested))
            ? lastTested
            : new Date(0).toISOString(),
      };
    }
  );

  return { version: 1, items };
};

export const parseProgressText = (text: string, validIds: Set<string>) => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("This file isn't valid JSON.");
  }
  return parseProgress(json, validIds);
};

export const loadProgress = (validIds: Set<string>): ProgressData => {
  const stored = readStoredJSON(STORAGE_KEY);
  if (stored === null) return createEmptyProgress();
  try {
    return parseProgress(stored, validIds);
  } catch {
    return createEmptyProgress();
  }
};

export const saveProgress = (data: ProgressData) =>
  writeStoredJSON(STORAGE_KEY, data);
