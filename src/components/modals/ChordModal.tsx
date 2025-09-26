import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHORDS, type Chord } from "@/data/chords";
import { useState } from "react";
import { useNoteLabel, useNotes } from "../../data/notes";
import { generateInversions } from "../../hooks/generateInversions";
import { PianoKeys } from "../piano/PianoKeys";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  type: "chord" | "scale";
}

export type ViewMode = "none" | "annotations" | "all" | "notes";

export interface KeyAnnotation {
  keyIndex: number;
  label: string;
}

const mapChordKeysToAnnotations = (ch: Chord) => {
  const lhAnnotations: KeyAnnotation[] = [];
  const rhAnnotations: KeyAnnotation[] = [];

  let lastKey = -1;

  ch.pianoKeys.forEach((k, i) => {
    let keyIndex = k;
    if (keyIndex <= lastKey) keyIndex += 12;
    lastKey = keyIndex;

    lhAnnotations.push({
      keyIndex,
      label: `LH ${ch.leftHand?.[i] ?? ""}`,
    });

    rhAnnotations.push({
      keyIndex: keyIndex + 12, // RH one octave higher
      label: `RH ${ch.rightHand?.[i] ?? ""}`,
    });
  });

  return { lhAnnotations, rhAnnotations };
};

export const ChordModal = ({
  isOpen,
  onClose,
  itemId,
  type,
}: ChordModalProps) => {
  if (!itemId) return null;

  const rootChord: Chord = CHORDS[itemId];
  if (!rootChord) return null;

  const [viewMode, setViewMode] = useState<ViewMode>("none");

  const handleViewModeChange = () => {
    const modes: ViewMode[] = ["none", "annotations", "all", "notes"];
    setViewMode((prev) => {
      const nextIndex = (modes.indexOf(prev) + 1) % modes.length;
      return modes[nextIndex];
    });
  };

  const notes = useNotes();
  const getNoteLabel = useNoteLabel();

  const inversions = generateInversions(rootChord, notes);
  const allChords = [rootChord, ...inversions];

  const [selectedChordName, setSelectedChordName] = useState(rootChord.name);
  const selectedChord =
    allChords.find((ch) => ch.name === selectedChordName) ?? rootChord;
  const selectedChordNotes = selectedChord.pianoKeys.map(
    (k) => notes[k % 12].note
  );

  const { lhAnnotations, rhAnnotations } =
    mapChordKeysToAnnotations(selectedChord);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            const handOptions: {
              key: string;
              label: string;
              annotations: KeyAnnotation[];
            }[] = [
              { key: "left", label: "Left Hand", annotations: lhAnnotations },
              {
                key: "both",
                label: "Both Hands",
                annotations: [...lhAnnotations, ...rhAnnotations],
              },
              { key: "right", label: "Right Hand", annotations: rhAnnotations },
            ];

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
                        annotations={hand.annotations}
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
      </DialogContent>
    </Dialog>
  );
};
