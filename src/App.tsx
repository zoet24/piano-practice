import { useState } from "react";
import { Controls } from "./components/controls/Controls";
import { WavyBackground } from "./components/layout/WavyBackground";
import { MusicModal } from "./components/modals/MusicModal";
import { MusicTable } from "./components/tables/MusicTable";
import { AudioProvider } from "./contexts/AudioContext";
import { ControlsProvider } from "./contexts/ControlsContext";

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const handleItemClick = (itemId: string) => {
    setSelectedItem(itemId);
  };

  return (
    <AudioProvider>
      <ControlsProvider>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <WavyBackground />
          <Controls />
          <MusicTable isTestMode={false} onItemClick={handleItemClick} />
          <MusicModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            itemId={selectedItem}
          />
        </div>
      </ControlsProvider>
    </AudioProvider>
  );
};

export default App;
