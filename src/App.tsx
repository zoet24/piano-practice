import { useState } from "react";
import { ChordModal } from "./components/modals/ChordModal";
import { ChordTable } from "./components/tables/ChordTable";
import { TabsTable } from "./components/tables/TabsTable";
import { NoteModeProvider } from "./contexts/NoteModeContext";

const App: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const handleChordClick = (chordId: string) => {
    setSelectedChord(chordId);
  };

  return (
    <NoteModeProvider>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <TabsTable />
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
