import { PianoKeys } from "../piano/PianoKeys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MusicHeader } from "./components/MusicHeader";
import { useChordModel } from "./useModel";

export const ChordsModal = ({ itemId }: { itemId: string }) => {
  const model = useChordModel(itemId);
  if (!model) return null;

  const {
    rootChord,
    allChords,
    selectedChord,
    setSelectedChordName,
    selectedChordNotes,
    getNoteLabel,
    handOptions,
    viewMode,
    handleViewModeChange,
  } = model;

  return (
    <>
      <MusicHeader
        title={getNoteLabel(selectedChord.fullName)}
        notes={selectedChordNotes}
      />
      <Tabs
        defaultValue={rootChord.name}
        onValueChange={(val) => setSelectedChordName(val)}
      >
        <div className="flex">
          <TabsList className="w-full">
            {allChords.map((ch) => (
              <TabsTrigger key={ch.name} value={ch.name}>
                {getNoteLabel(ch.name)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {allChords.map((ch) => {
          return (
            <TabsContent key={ch.name} value={ch.name}>
              <Tabs defaultValue="both">
                <TabsList className="flex w-full">
                  {handOptions.map((hand) => (
                    <TabsTrigger key={hand.key} value={hand.key}>
                      {hand.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {handOptions.map((hand) => (
                  <TabsContent key={hand.key} value={hand.key}>
                    <PianoKeys
                      annotations={hand.getAnnotations()}
                      octaves={3}
                      viewMode={viewMode}
                      onViewModeChange={handleViewModeChange}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
};
