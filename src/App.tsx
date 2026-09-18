import { useState } from "react";
import { Controls } from "./components/controls/Controls";
import { WavyBackground } from "./components/layout/WavyBackground";
import { MusicModal } from "./components/modals/MusicModal";
import { ConfidenceLegend } from "./components/practice/ConfidenceIndicator";
import { PracticeSession } from "./components/practice/PracticeSession";
import { PracticeSetup } from "./components/practice/PracticeSetup";
import {
  PracticeSummary,
  type SessionSummary,
} from "./components/practice/PracticeSummary";
import { MusicTable } from "./components/tables/MusicTable";
import { AudioProvider } from "./contexts/AudioContext";
import { ControlsProvider } from "./contexts/ControlsContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { useProgress } from "./contexts/useProgress";
import type { PracticeConfig } from "./lib/practiceDeck";

type Screen =
  | { name: "reference" }
  | { name: "setup" }
  | { name: "session"; config: PracticeConfig; pool: string[]; id: number }
  | { name: "summary"; config: PracticeConfig; summary: SessionSummary };

const Screens: React.FC = () => {
  const [screen, setScreen] = useState<Screen>({ name: "reference" });
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { saveSession } = useProgress();

  const startSession = (config: PracticeConfig, pool: string[]) =>
    setScreen({ name: "session", config, pool, id: Date.now() });

  switch (screen.name) {
    case "setup":
      return (
        <PracticeSetup
          onStart={startSession}
          onBack={() => setScreen({ name: "reference" })}
        />
      );

    case "session":
      return (
        <PracticeSession
          key={screen.id}
          config={screen.config}
          pool={screen.pool}
          onFinish={(results, durationMs) =>
            setScreen({
              name: "summary",
              config: screen.config,
              summary: {
                items: saveSession(results),
                answerCount: results.length,
                durationMs,
              },
            })
          }
        />
      );

    case "summary":
      return (
        <PracticeSummary
          summary={screen.summary}
          onRetest={(itemIds) =>
            startSession(
              {
                ...screen.config,
                selection: "random",
                lengthMode: "count",
                cardCount: itemIds.length,
              },
              itemIds
            )
          }
          onNewTest={() => setScreen({ name: "setup" })}
          onDone={() => setScreen({ name: "reference" })}
        />
      );

    default:
      return (
        <>
          <Controls onPractice={() => setScreen({ name: "setup" })} />
          <MusicTable onItemClick={setSelectedItem} />
          <div className="mt-2 rounded-md bg-white/80 px-3 py-1">
            <ConfidenceLegend />
          </div>
          <MusicModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            itemId={selectedItem}
          />
        </>
      );
  }
};

const App: React.FC = () => {
  return (
    <AudioProvider>
      <ControlsProvider>
        <ProgressProvider>
          <div className="relative flex flex-col justify-center">
            <WavyBackground />
            <div className="relative h-screen flex flex-col items-center justify-center p-4">
              <Screens />
            </div>
          </div>
        </ProgressProvider>
      </ControlsProvider>
    </AudioProvider>
  );
};

export default App;
