import { createContext, useContext } from "react";
import type {
  AnswerResult,
  Confidence,
  ItemSummary,
  ProgressData,
} from "../lib/progress";

export interface ProgressContextType {
  progress: ProgressData;
  getConfidence: (itemId: string) => Confidence;
  // saves a finished session and returns the before/after summary per item
  saveSession: (results: AnswerResult[]) => ItemSummary[];
  // throws with a readable message if the file is invalid
  importProgress: (text: string) => void;
  exportProgress: () => void;
  resetProgress: () => void;
}

export const ProgressCtx = createContext<ProgressContextType | undefined>(
  undefined
);

export const useProgress = () => {
  const context = useContext(ProgressCtx);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};
