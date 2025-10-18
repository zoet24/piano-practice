import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CHORDS, type Chord } from "@/data/chords";
import { useMemo, useState } from "react";
import { useNoteLabel, useNotes } from "../../data/notes";
import { generateInversions } from "../../hooks/generateInversions";
import { mapChordKeysToAnnotations } from "../../hooks/mapKeysToAnnotations";
import { PianoKeys } from "../piano/PianoKeys";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { KeyAnnotation, ViewMode } from "./MusicModal";

export const ChordsModal = ({ itemId }: { itemId: string }) => {
  if (!itemId) return null;

  const rootChord: Chord = CHORDS[itemId];
  if (!rootChord) return null;

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const modes: ViewMode[] = ["none", "annotations", "all", "notes"];
  const handleViewModeChange = () =>
    setViewMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);

  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const inversions = useMemo(
    () => generateInversions(rootChord, notes),
    [rootChord, notes]
  );
  const allChords = useMemo(
    () => [rootChord, ...inversions],
    [inversions, rootChord]
  );

  const [selectedChordName, setSelectedChordName] = useState(rootChord.name);
  const selectedChord = useMemo(
    () => allChords.find((ch) => ch.name === selectedChordName) ?? rootChord,
    [selectedChordName, allChords, rootChord]
  );

  const selectedChordNotes = useMemo(
    () => selectedChord.pianoKeys.map((k) => notes[k % 12].note),
    [selectedChord, notes]
  );

  const { lhAnnotations, rhAnnotations } = useMemo(
    () => mapChordKeysToAnnotations(selectedChord),
    [selectedChord]
  );

  const handOptions: {
    key: string;
    label: string;
    getAnnotations: () => KeyAnnotation[];
  }[] = [
    { key: "left", label: "Left Hand", getAnnotations: () => lhAnnotations },
    {
      key: "both",
      label: "Both Hands",
      getAnnotations: () => [...lhAnnotations, ...rhAnnotations],
    },
    { key: "right", label: "Right Hand", getAnnotations: () => rhAnnotations },
  ];

  return (
    <>
      <DialogHeader>
        <div className="flex flex-col items-center gap-2">
          <DialogTitle className="text-2xl font-bold">
            {getNoteLabel(selectedChord.fullName)}
          </DialogTitle>
          <div className="flex gap-2">
            {selectedChordNotes.map((note, index) => (
              <Badge
                key={index}
                variant="default"
                className="px-3 py-1 text-sm font-medium"
              >
                {note}
              </Badge>
            ))}
          </div>
        </div>
      </DialogHeader>

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
