import { useState } from "react";
import { Controls } from "./components/controls/Controls";
import { MusicModal } from "./components/modals/MusicModal";
import { MusicTable } from "./components/tables/MusicTable";
import { ControlsProvider } from "./contexts/ControlsContext";

const App: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const handleChordClick = (chordId: string) => {
    setSelectedChord(chordId);
  };

  return (
    <ControlsProvider>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Controls />
        <MusicTable
          isTestMode={false}
          onChordClick={handleChordClick}
          // types={viewMode === "chords" ? CHORD_TYPES : SCALE_TYPES}
        />
        <MusicModal
          isOpen={!!selectedChord}
          onClose={() => setSelectedChord(null)}
          itemId={selectedChord}
          type="chord"
        />
      </div>
    </ControlsProvider>
  );
};

export default App;
