import { useAudio } from "../../contexts/AudioContext";
import { PianoKeys } from "../piano/PianoKeys";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MusicHeader } from "./components/MusicHeader";
import { useScaleModel } from "./useModel";

export const ScalesModal = ({ itemId }: { itemId: string }) => {
  const model = useScaleModel(itemId);
  if (!model) return null;

  const { rootScale, scaleNotes, getNoteLabel, handOptions } = model;
  const { notesToPlay, playNotes } = useAudio();

  return (
    <>
      <MusicHeader
        title={rootScale.fullName}
        notes={scaleNotes.map(getNoteLabel)}
        onPlay={() => playNotes(notesToPlay, "scale")}
      />
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
              viewMode="notes"
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};
