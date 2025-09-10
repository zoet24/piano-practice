import { useState } from "react";
import { ChordModal } from "./components/modals/ChordModal";
import { ChordTable } from "./components/tables/ChordTable";

function App() {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const handleChordClick = (chordId: string) => {
    setSelectedChord(chordId);
  };

  return (
    <div>
      <ChordTable isTestMode={false} onChordClick={handleChordClick} />

      <ChordModal
        isOpen={!!selectedChord}
        onClose={() => setSelectedChord(null)}
        itemId={selectedChord}
        type="chord"
      />
    </div>
  );
}

export default App;
