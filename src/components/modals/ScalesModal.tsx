import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo } from "react";
import { useNoteLabel, useNotes } from "../../data/notes";
import { SCALES, type Scale } from "../../data/scales";
import { mapScaleKeysToAnnotations } from "../../hooks/mapKeysToAnnotations";
import { PianoKeys } from "../piano/PianoKeys";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { KeyAnnotation } from "./MusicModal";

export const ScalesModal = ({ itemId }: { itemId: string }) => {
  if (!itemId) return null;

  const rootScale: Scale = SCALES[itemId];
  if (!rootScale) return null;

  const notes = useNotes();
  const getNoteLabel = useNoteLabel();
  const scaleNotes = rootScale.pianoKeys.map((k) => notes[k % 12].note);

  const { lhAnnotations, rhAnnotations } = useMemo(
    () => mapScaleKeysToAnnotations(rootScale),
    [rootScale]
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
            {rootScale.fullName}
          </DialogTitle>
          <div className="flex gap-2 flex-wrap justify-center">
            {scaleNotes.map((note, index) => (
              <Badge
                key={index}
                variant="default"
                className="px-3 py-1 text-sm font-medium"
              >
                {getNoteLabel(note)}
              </Badge>
            ))}
          </div>
        </div>
      </DialogHeader>

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
