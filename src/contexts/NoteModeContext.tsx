import { createContext, useContext, useState, type ReactNode } from "react";

export type NoteMode = "notes-sharp" | "notes-flat";

interface NoteModeContextType {
  mode: NoteMode;
  setMode: (mode: NoteMode) => void;
  toggleMode: () => void;
}

const NoteModeContext = createContext<NoteModeContextType | undefined>(
  undefined
);

export function NoteModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NoteMode>("notes-flat");

  const toggleMode = () => {
    setMode((prev) => (prev === "notes-sharp" ? "notes-flat" : "notes-sharp"));
  };

  return (
    <NoteModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </NoteModeContext.Provider>
  );
}

export function useNoteMode() {
  const context = useContext(NoteModeContext);
  if (!context) {
    throw new Error("useNoteMode must be used within a NoteModeProvider");
  }
  return context;
}
