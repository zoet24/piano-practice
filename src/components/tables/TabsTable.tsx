import { useNoteMode } from "../../contexts/NoteModeContext";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export const TabsTable = () => {
  const { mode, toggleMode } = useNoteMode();

  return (
    <div className="mb-2 flex space-x-2">
      <Tabs defaultValue={mode} className="w-full" onValueChange={toggleMode}>
        <TabsList className="w-full">
          <TabsTrigger value="notes-sharp">Sharp #</TabsTrigger>
          <TabsTrigger value="notes-flat">Flat b</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="chords" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="chords">Chords</TabsTrigger>
          <TabsTrigger value="scales">Scales</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
