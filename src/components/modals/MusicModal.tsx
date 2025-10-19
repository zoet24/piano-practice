import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useControls } from "../../contexts/ControlsContext";
import { ChordsModal } from "./ChordsModal";
import { ScalesModal } from "./ScalesModal";

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
}

export const MusicModal = ({ isOpen, onClose, itemId }: MusicModalProps) => {
  const { viewMode } = useControls();

  if (!itemId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {viewMode === "view-chords" && <ChordsModal itemId={itemId} />}
        {viewMode === "view-scales" && <ScalesModal itemId={itemId} />}
      </DialogContent>
    </Dialog>
  );
};
