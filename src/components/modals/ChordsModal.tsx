import { useAudio } from "../../contexts/AudioContext";
import { useProgress } from "../../contexts/useProgress";
import { getChordPracticeId } from "../../data/practiceItems";
import { ConfidenceIndicator } from "../practice/ConfidenceIndicator";
import { PianoKeys } from "../piano/PianoKeys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MusicHeader } from "./components/MusicHeader";
import { useChordModel } from "./useModel";

export const ChordsModal = ({ itemId }: { itemId: string }) => {
  const { getConfidence } = useProgress();
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
    // viewMode,
    // handleViewModeChange,
  } = model;

  const { notesToPlay, playNotes } = useAudio();

  // allChords is [root, 1st inversion, 2nd inversion, ...]
  const getInversionConfidence = (index: number) =>
    getConfidence(getChordPracticeId(rootChord.name, index));
  const selectedIndex = Math.max(
    0,
    allChords.findIndex((ch) => ch.name === selectedChord.name)
  );

  return (
    <>
      <MusicHeader
        title={getNoteLabel(selectedChord.fullName)}
        notes={selectedChordNotes}
        onPlay={() => playNotes(notesToPlay, "chord")}
        confidence={getInversionConfidence(selectedIndex)}
      />
      <Tabs
        defaultValue={rootChord.name}
        onValueChange={(val) => setSelectedChordName(val)}
      >
        <div className="flex">
          <TabsList className="w-full">
            {allChords.map((ch, i) => (
              <TabsTrigger key={ch.name} value={ch.name} className="gap-1.5">
                {getNoteLabel(ch.name)}
                <ConfidenceIndicator confidence={getInversionConfidence(i)} />
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
                      viewMode="all"
                      // viewMode={viewMode}
                      // onViewModeChange={handleViewModeChange}
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
