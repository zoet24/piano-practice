import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Flag, Timer, Volume2 } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { useProgress } from "../../contexts/useProgress";
import type { PracticeConfig } from "../../lib/practiceDeck";
import type { AnswerResult } from "../../lib/progress";
import { PianoKeys } from "../piano/PianoKeys";
import { Badge } from "../ui/badge";
import { ANSWER_OPTIONS } from "./answerOptions";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { PracticePanel } from "./PracticePanel";
import { HAND_LABELS } from "./usePracticeItemDisplay";
import { useSessionModel } from "./useSessionModel";

interface PracticeSessionProps {
  config: PracticeConfig;
  pool: string[];
  onFinish: (results: AnswerResult[], durationMs: number) => void;
}

const SWIPE_THRESHOLD = 80;

const formatTime = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

export const PracticeSession = ({
  config,
  pool,
  onFinish,
}: PracticeSessionProps) => {
  const {
    card,
    display,
    answer,
    isRevealed,
    isLastCard,
    isTimed,
    index,
    totalCards,
    answeredCount,
    remainingMs,
    isAudioReady,
    choose,
    next,
    play,
    finish,
  } = useSessionModel(config, pool, onFinish);
  const { getConfidence } = useProgress();

  // swipe left to move on once the card is answered
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef<number | null>(null);

  // the latest distance is kept in a ref too, as quick drags can end before React re-renders
  const dragDistance = useRef(0);

  const onPointerDown = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragStart.current = event.clientX;
    dragDistance.current = 0;
  };
  const onPointerMove = (event: PointerEvent) => {
    if (dragStart.current === null || !isRevealed) return;
    dragDistance.current = Math.min(0, event.clientX - dragStart.current);
    setDragX(dragDistance.current);
  };
  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragDistance.current <= -SWIPE_THRESHOLD) next();
    dragDistance.current = 0;
    setDragX(0);
  };

  if (!card || !display) {
    return (
      <PracticePanel title="Practice">
        <p className="text-sm text-muted-foreground">
          There are no cards to show.
        </p>
        <Button className="mt-4" onClick={finish}>
          Finish
        </Button>
      </PracticePanel>
    );
  }

  const kindLabel = display.kind === "chord" ? "chord" : "scale";
  const progressPercent = isTimed
    ? (remainingMs! / (config.minutes * 60_000)) * 100
    : ((index + (isRevealed ? 1 : 0)) / totalCards) * 100;

  return (
    <PracticePanel
      title={
        isTimed ? (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Timer className="size-4" /> {formatTime(remainingMs!)}
            <span className="text-sm font-normal text-muted-foreground">
              · {answeredCount} answered
            </span>
          </span>
        ) : (
          <span className="tabular-nums">
            Card {index + 1} of {totalCards}
          </span>
        )
      }
      actions={
        <Button variant="ghost" size="sm" onClick={finish}>
          <Flag /> End test
        </Button>
      }
      footer={
        <div className="flex flex-col gap-3">
          <div
            className="grid grid-cols-3 gap-2"
            role="group"
            aria-label="Did you know it?"
          >
            {ANSWER_OPTIONS.map(({ value, label, shortcut, Icon, selectedClass }) => (
              <Button
                key={value}
                variant="outline"
                size="lg"
                aria-pressed={answer === value}
                onClick={() => choose(value)}
                className={cn(answer === value && selectedClass)}
              >
                <Icon /> {label}
                <kbd className="hidden text-xs opacity-60 sm:inline">{shortcut}</kbd>
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isRevealed
                ? "Change your answer if needed, then swipe left or press →"
                : "Did you know it? Answer to reveal and hear it."}
            </p>
            <Button onClick={next} disabled={!isRevealed}>
              {isLastCard ? "Finish" : "Next"} <ArrowRight />
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div
          className="h-full bg-keys-left transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        key={card.key}
        data-testid="flashcard"
        className="mt-4 flex min-h-72 touch-pan-y select-none flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-4 text-center shadow-sm"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 40}deg)`,
          opacity: 1 + dragX / 400,
          transition: dragStart.current === null ? "transform 0.2s, opacity 0.2s" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Badge variant="secondary" className="capitalize">
            {kindLabel}
          </Badge>
          <Badge variant="secondary">{HAND_LABELS[card.hand]}</Badge>
        </div>

        {!isRevealed && card.prompt === "name" && (
          <>
            <h2 className="text-3xl font-bold sm:text-4xl">{display.title}</h2>
            <p className="text-muted-foreground">
              Can you play this {kindLabel} ({HAND_LABELS[card.hand].toLowerCase()})?
            </p>
          </>
        )}

        {!isRevealed && card.prompt === "notes" && (
          <>
            <h2 className="text-xl font-semibold">
              Which {kindLabel} is this?
            </h2>
            <NoteBadges notes={display.noteNames} />
            <div className="w-full max-w-xl">
              <PianoKeys annotations={display.annotations} octaves={3} viewMode="none" />
            </div>
          </>
        )}

        {isRevealed && (
          <>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold sm:text-3xl">{display.title}</h2>
              <ConfidenceIndicator
                confidence={getConfidence(display.itemId)}
                size="md"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={play}
                disabled={!isAudioReady}
                aria-label="Replay"
                title="Replay (R)"
              >
                <Volume2 className="size-5" />
              </Button>
            </div>
            <NoteBadges notes={display.noteNames} />
            <div className="w-full max-w-xl">
              <PianoKeys
                annotations={display.annotations}
                octaves={3}
                viewMode={display.kind === "chord" ? "all" : "notes"}
              />
            </div>
          </>
        )}
      </div>
    </PracticePanel>
  );
};

const NoteBadges = ({ notes }: { notes: string[] }) => (
  <div className="flex flex-wrap justify-center gap-2">
    {notes.map((note, i) => (
      <Badge key={i} className="px-3 py-1 text-sm font-medium">
        {note}
      </Badge>
    ))}
  </div>
);
