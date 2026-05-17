import type { PanelId } from "../types/notes.types";
import { useNotesStore } from "../store/notesStore";

export function useNotesPanel() {
  const activePanel = useNotesStore((state) => state.activePanel);
  const setActivePanel = useNotesStore((state) => state.setActivePanel);

  return {
    activePanel,
    isOpen: (panel: PanelId) => activePanel === panel,
    togglePanel: (panel: PanelId) => setActivePanel(panel),
    closePanel: () => setActivePanel(null)
  };
}
