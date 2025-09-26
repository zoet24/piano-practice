import { useState } from "react";
import { ChordModal } from "./components/modals/ChordModal";
import { ChordTable } from "./components/tables/ChordTable";
import { NoteModeProvider } from "./contexts/NoteModeContext";

const App: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const handleChordClick = (chordId: string) => {
    setSelectedChord(chordId);
  };

  // console.log(CHORDS);

  return (
    <NoteModeProvider>
      <div>
        <ChordTable isTestMode={false} onChordClick={handleChordClick} />
        <ChordModal
          isOpen={!!selectedChord}
          onClose={() => setSelectedChord(null)}
          itemId={selectedChord}
          type="chord"
        />
      </div>
    </NoteModeProvider>
  );
};

export default App;
