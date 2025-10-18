import { createContext, useContext, useState, type ReactNode } from "react";

export type NoteMode = "notes-sharp" | "notes-flat";
export type ViewMode = "view-chords" | "view-scales";

interface ControlsContextType {
  noteMode: NoteMode;
  setNoteMode: (mode: NoteMode) => void;
  toggleNoteMode: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ControlsContext = createContext<ControlsContextType | undefined>(
  undefined
);

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const [noteMode, setNoteMode] = useState<NoteMode>("notes-sharp");
  const [viewMode, setViewMode] = useState<ViewMode>("view-chords");

  const toggleViewMode = () => {
    setViewMode((prev) =>
      prev === "view-chords" ? "view-scales" : "view-chords"
    );
  };

  const toggleNoteMode = () => {
    setNoteMode((prev) =>
      prev === "notes-sharp" ? "notes-flat" : "notes-sharp"
    );
  };

  return (
    <ControlsContext.Provider
      value={{
        noteMode,
        setNoteMode,
        toggleNoteMode,
        viewMode,
        setViewMode,
        toggleViewMode,
      }}
    >
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useControls must be used within a ControlsProvider");
  }
  return context;
};
