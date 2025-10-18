import { useControls } from "../../contexts/ControlsContext";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export const Controls = () => {
  const { noteMode, toggleNoteMode, viewMode, toggleViewMode } = useControls();

  return (
    <div className="mb-2 flex w-full space-x-2">
      <Tabs
        defaultValue={noteMode}
        className="w-full"
        onValueChange={toggleNoteMode}
      >
        <TabsList className="w-full">
          <TabsTrigger value="notes-sharp">Sharp #</TabsTrigger>
          <TabsTrigger value="notes-flat">Flat b</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs
        defaultValue={viewMode}
        className="w-full"
        onValueChange={toggleViewMode}
      >
        <TabsList className="w-full">
          <TabsTrigger value="view-chords">Chords</TabsTrigger>
          <TabsTrigger value="view-scales">Scales</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
