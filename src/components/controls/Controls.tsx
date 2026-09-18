import { GraduationCap } from "lucide-react";
import {
  useControls,
  type NoteMode,
  type ViewMode,
} from "../../contexts/ControlsContext";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface ControlsProps {
  onPractice: () => void;
}

export const Controls = ({ onPractice }: ControlsProps) => {
  const { noteMode, setNoteMode, viewMode, setViewMode } = useControls();

  return (
    <div className="mb-2 flex w-full space-x-2">
      <Tabs
        value={noteMode}
        className="w-full"
        onValueChange={(value) => setNoteMode(value as NoteMode)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="notes-sharp">Sharp #</TabsTrigger>
          <TabsTrigger value="notes-flat">Flat b</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs
        value={viewMode}
        className="w-full"
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="view-chords">Chords</TabsTrigger>
          <TabsTrigger value="view-scales">Scales</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button
        onClick={onPractice}
        className="h-9 shrink-0"
        aria-label="Practice"
        title="Practice"
      >
        <GraduationCap />
        <span className="hidden sm:inline">Practice</span>
      </Button>
    </div>
  );
};
