import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useProgress } from "../../contexts/useProgress";
import { ALL_PRACTICE_ITEMS } from "../../data/practiceItems";
import {
  getPool,
  parseConfig,
  type Hand,
  type PracticeConfig,
} from "../../lib/practiceDeck";
import { readStoredJSON, writeStoredJSON } from "../../lib/storage";
import type { TableSelection } from "../tables/useModel";

const CONFIG_KEY = "piano-practice:practice-config:v1";

export const useSetupModel = (
  onStart: (config: PracticeConfig, pool: string[]) => void
) => {
  const { progress, importProgress, exportProgress, resetProgress } =
    useProgress();
  const { viewMode, setViewMode } = useControls();

  const [config, setConfig] = useState<PracticeConfig>(() =>
    parseConfig(readStoredJSON(CONFIG_KEY))
  );
  const [progressMessage, setProgressMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    writeStoredJSON(CONFIG_KEY, config);
  }, [config]);

  // keep the picker table on a content type that is part of the test
  useEffect(() => {
    if (config.content === "chords" && viewMode !== "view-chords") {
      setViewMode("view-chords");
    } else if (config.content === "scales" && viewMode !== "view-scales") {
      setViewMode("view-scales");
    }
  }, [config.content, viewMode, setViewMode]);

  const update = (patch: Partial<PracticeConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const pool = useMemo(
    () => getPool(ALL_PRACTICE_ITEMS, config, progress),
    [config, progress]
  );

  const selection: TableSelection = {
    selectedIds: new Set(config.manualIds),
    onToggle: (ids) =>
      setConfig((prev) => {
        const selected = new Set(prev.manualIds);
        const allSelected = ids.every((id) => selected.has(id));
        ids.forEach((id) =>
          allSelected ? selected.delete(id) : selected.add(id)
        );
        return { ...prev, manualIds: [...selected] };
      }),
  };

  const toggleHand = (hand: Hand) => {
    const hands = config.hands.includes(hand)
      ? config.hands.filter((h) => h !== hand)
      : [...config.hands, hand];
    // at least one hand must stay selected
    if (hands.length) update({ hands });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      importProgress(await file.text());
      setProgressMessage({ type: "success", text: "Progress imported." });
    } catch (err) {
      setProgressMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not import that file.",
      });
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all confidence scores to 0? Export first if you want a backup."
      )
    ) {
      resetProgress();
      setProgressMessage({ type: "success", text: "Progress reset." });
    }
  };

  const selectedCount = ALL_PRACTICE_ITEMS.filter(
    (item) =>
      item.inversion === 0 &&
      config.manualIds.includes(item.baseId) &&
      (config.content === "both" ||
        (config.content === "chords") === (item.kind === "chord"))
  ).length;

  return {
    config,
    update,
    pool,
    selection,
    selectedCount,
    toggleHand,
    handleImport,
    handleReset,
    exportProgress,
    progressMessage,
    viewMode,
    setViewMode,
    canStart: pool.length > 0,
    start: () => onStart(config, pool),
  };
};
