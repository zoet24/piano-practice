import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../contexts/AudioContext";
import { useProgress } from "../../contexts/useProgress";
import {
  createCardSource,
  type Card,
  type PracticeConfig,
} from "../../lib/practiceDeck";
import type { Answer, AnswerResult } from "../../lib/progress";
import { annotationsToNoteSpecs } from "../piano/useModel";
import { usePracticeItemDisplay } from "./usePracticeItemDisplay";

export const useSessionModel = (
  config: PracticeConfig,
  pool: string[],
  onFinish: (results: AnswerResult[], durationMs: number) => void
) => {
  const { progress } = useProgress();
  const { playNotes, isAudioReady } = useAudio();
  const getDisplay = usePracticeItemDisplay();

  const isTimed = config.lengthMode === "time";

  // the card source and first cards are created once per session
  const [{ nextCard, initialCards, startedAt }] = useState(() => {
    const next = createCardSource(pool, config, progress);
    const count = isTimed ? 1 : config.cardCount;
    const cards = Array.from({ length: count }, next).filter(
      (card): card is Card => card !== null
    );
    return { nextCard: next, initialCards: cards, startedAt: Date.now() };
  });

  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | undefined)[]>([]);
  const [now, setNow] = useState(startedAt);
  const finished = useRef(false);

  const card = cards[index];
  const display = card ? getDisplay(card.itemId, card.hand) : null;
  const answer = answers[index];
  const isRevealed = answer !== undefined;
  const isLastCard = !isTimed && index === cards.length - 1;

  const endsAt = startedAt + config.minutes * 60_000;
  const remainingMs = isTimed ? Math.max(0, endsAt - now) : null;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const results = cards.flatMap((c, i) =>
      answers[i] ? [{ itemId: c.itemId, answer: answers[i] }] : []
    );
    onFinish(results, Date.now() - startedAt);
  };

  const play = () => {
    if (!display) return;
    playNotes(annotationsToNoteSpecs(display.annotations), display.kind);
  };

  const choose = (choice: Answer) => {
    // the first answer reveals the card, so play it; later changes only update the answer
    if (!isRevealed) play();
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  const next = () => {
    if (!isRevealed) return;
    if (isLastCard) return finish();
    if (isTimed && index === cards.length - 1) {
      const card = nextCard();
      if (card) setCards((prev) => [...prev, card]);
    }
    setIndex((i) => i + 1);
  };

  useEffect(() => {
    if (!isTimed) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [isTimed]);

  useEffect(() => {
    if (remainingMs === 0) finish();
  });

  // keyboard shortcuts: 1/2/3 answer, space/enter/right arrow next, r replay
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement).closest("input, textarea, select")) {
        return;
      }
      const answerKeys: Record<string, Answer> = {
        "1": "yes",
        "2": "unsure",
        "3": "no",
      };
      if (answerKeys[event.key]) {
        choose(answerKeys[event.key]);
      } else if (["ArrowRight", " ", "Enter"].includes(event.key)) {
        // don't double-fire when a focused button is activated with space/enter
        if (event.key !== "ArrowRight" && (event.target as HTMLElement).closest("button")) {
          return;
        }
        event.preventDefault();
        next();
      } else if (event.key.toLowerCase() === "r" && isRevealed) {
        play();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return {
    card,
    display,
    answer,
    isRevealed,
    isLastCard,
    isTimed,
    index,
    totalCards: cards.length,
    answeredCount: answers.filter(Boolean).length,
    remainingMs,
    isAudioReady,
    choose,
    next,
    play,
    finish,
  };
};
