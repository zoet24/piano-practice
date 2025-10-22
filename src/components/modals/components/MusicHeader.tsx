import { Volume2 } from "lucide-react";
import { useAudio } from "../../../contexts/AudioContext";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { DialogHeader, DialogTitle } from "../../ui/dialog";

interface MusicHeaderProps {
  title: string;
  notes: string[];
  onPlay?: () => void;
}

export const MusicHeader = ({ title, notes, onPlay }: MusicHeaderProps) => {
  const { isAudioReady } = useAudio();

  const Badges = () => {
    return (
      <>
        {notes.map((note, i) => (
          <Badge
            key={i}
            variant="default"
            className="px-3 py-1 text-sm font-medium"
          >
            {note}
          </Badge>
        ))}
      </>
    );
  };

  return (
    <DialogHeader>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <div className="flex gap-1 show-mobile-landscape">
            <Badges />
          </div>
          {onPlay && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onPlay}
              aria-label="Play chord"
              disabled={!isAudioReady}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-center hide-on-mobile-landscape">
          <Badges />
        </div>
      </div>
    </DialogHeader>
  );
};
