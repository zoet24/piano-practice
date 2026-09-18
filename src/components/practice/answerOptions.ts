import { Check, CircleHelp, X } from "lucide-react";
import type { Answer } from "../../lib/progress";

export const ANSWER_OPTIONS: {
  value: Answer;
  label: string;
  shortcut: string;
  Icon: typeof Check;
  selectedClass: string;
}[] = [
  {
    value: "yes",
    label: "Yes",
    shortcut: "1",
    Icon: Check,
    selectedClass: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600/90 hover:text-white",
  },
  {
    value: "unsure",
    label: "Unsure",
    shortcut: "2",
    Icon: CircleHelp,
    selectedClass: "bg-amber-500 text-white border-amber-500 hover:bg-amber-500/90 hover:text-white",
  },
  {
    value: "no",
    label: "No",
    shortcut: "3",
    Icon: X,
    selectedClass: "bg-rose-600 text-white border-rose-600 hover:bg-rose-600/90 hover:text-white",
  },
];
