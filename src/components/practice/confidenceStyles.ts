import type { Confidence } from "../../lib/progress";

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  0: "Not known yet",
  1: "Getting there",
  2: "Nearly confident",
  3: "Confident",
};

export const CONFIDENCE_DOT_COLOURS: Record<Confidence, string> = {
  0: "bg-gray-300",
  1: "bg-rose-400",
  2: "bg-amber-400",
  3: "bg-emerald-500",
};

export const CONFIDENCE_CELL_COLOURS: Record<Confidence, string> = {
  0: "",
  1: "bg-rose-50 border-rose-200",
  2: "bg-amber-50 border-amber-200",
  3: "bg-emerald-50 border-emerald-300",
};
