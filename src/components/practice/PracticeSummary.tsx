import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Home, RotateCcw, Settings2 } from "lucide-react";
import type { Answer, ItemSummary } from "../../lib/progress";
import { ANSWER_OPTIONS } from "./answerOptions";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { PracticePanel } from "./PracticePanel";
import { usePracticeItemDisplay } from "./usePracticeItemDisplay";

export interface SessionSummary {
  items: ItemSummary[];
  answerCount: number;
  durationMs: number;
}

interface PracticeSummaryProps {
  summary: SessionSummary;
  onRetest: (itemIds: string[]) => void;
  onNewTest: () => void;
  onDone: () => void;
}

const ANSWER_TEXT_COLOURS: Record<Answer, string> = {
  yes: "text-emerald-600",
  unsure: "text-amber-500",
  no: "text-rose-600",
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export const PracticeSummary = ({
  summary,
  onRetest,
  onNewTest,
  onDone,
}: PracticeSummaryProps) => {
  const getDisplay = usePracticeItemDisplay();

  const counts = summary.items
    .flatMap((item) => item.answers)
    .reduce<Record<Answer, number>>(
      (acc, answer) => ({ ...acc, [answer]: acc[answer] + 1 }),
      { yes: 0, unsure: 0, no: 0 }
    );

  const missedIds = summary.items
    .filter((item) => item.answers.some((answer) => answer !== "yes"))
    .map((item) => item.itemId);

  return (
    <PracticePanel
      title="Test summary"
      actions={
        <Button variant="ghost" size="sm" onClick={onDone}>
          <Home /> Reference
        </Button>
      }
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onRetest(missedIds)}
            disabled={!missedIds.length}
          >
            <RotateCcw /> Retest {missedIds.length || ""} missed
          </Button>
          <Button variant="outline" onClick={onNewTest}>
            <Settings2 /> New test
          </Button>
          <Button onClick={onDone}>
            Done <ArrowRight />
          </Button>
        </div>
      }
    >
      {summary.answerCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No cards were answered, so nothing was saved.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat label="Cards" value={summary.answerCount} />
            {ANSWER_OPTIONS.map(({ value, label, Icon }) => (
              <Stat
                key={value}
                label={label}
                value={counts[value]}
                icon={<Icon className={cn("size-4", ANSWER_TEXT_COLOURS[value])} />}
              />
            ))}
            <Stat label="Time" value={formatDuration(summary.durationMs)} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Confidence has been saved.
          </p>

          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {summary.items.map((item) => {
              const display = getDisplay(item.itemId);
              const change = item.after - item.before;

              return (
                <li
                  key={item.itemId}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">
                      {display?.title ?? item.itemId}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {display?.noteNames.join(" · ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex gap-1" aria-label="Answers">
                      {item.answers.map((answer, i) => {
                        const option = ANSWER_OPTIONS.find(
                          (o) => o.value === answer
                        )!;
                        return (
                          <option.Icon
                            key={i}
                            aria-label={option.label}
                            className={cn("size-4", ANSWER_TEXT_COLOURS[answer])}
                          />
                        );
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <ConfidenceIndicator confidence={item.before} size="md" />
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <ConfidenceIndicator confidence={item.after} size="md" />
                      <span
                        className={cn(
                          "w-5 text-right font-semibold tabular-nums",
                          change > 0 && "text-emerald-600",
                          change < 0 && "text-rose-600",
                          change === 0 && "text-muted-foreground"
                        )}
                      >
                        {change > 0 ? `+${change}` : change}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PracticePanel>
  );
};

const Stat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center rounded-lg bg-muted px-2 py-2">
    <span className="flex items-center gap-1 text-lg font-bold tabular-nums">
      {icon}
      {value}
    </span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);
