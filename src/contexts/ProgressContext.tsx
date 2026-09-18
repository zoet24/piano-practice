import { useEffect, useState, type ReactNode } from "react";
import { PRACTICE_ITEMS_BY_ID } from "../data/practiceItems";
import {
  applyAnswers,
  createEmptyProgress,
  getItemConfidence,
  loadProgress,
  parseProgressText,
  saveProgress,
  serializeProgress,
  summarizeResults,
  type AnswerResult,
} from "../lib/progress";
import { ProgressCtx } from "./useProgress";

const VALID_IDS = new Set(PRACTICE_ITEMS_BY_ID.keys());

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState(() => loadProgress(VALID_IDS));

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const saveSession = (results: AnswerResult[]) => {
    const summary = summarizeResults(progress, results);
    setProgress((prev) => applyAnswers(prev, results));
    return summary;
  };

  const importProgress = (text: string) => {
    setProgress(parseProgressText(text, VALID_IDS));
  };

  const exportProgress = () => {
    const blob = new Blob([serializeProgress(progress)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `piano-practice-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <ProgressCtx.Provider
      value={{
        progress,
        getConfidence: (itemId) => getItemConfidence(progress, itemId),
        saveSession,
        importProgress,
        exportProgress,
        resetProgress: () => setProgress(createEmptyProgress()),
      }}
    >
      {children}
    </ProgressCtx.Provider>
  );
};
