import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Download, Play, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";
import { useControls } from "../../contexts/ControlsContext";
import type { Confidence } from "../../lib/progress";
import type {
  ContentMode,
  PracticeConfig,
  PromptMode,
  SelectionMode,
} from "../../lib/practiceDeck";
import { MusicTable } from "../tables/MusicTable";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { OptionGroup } from "./OptionGroup";
import { PracticePanel } from "./PracticePanel";
import { HAND_LABELS } from "./usePracticeItemDisplay";
import { useSetupModel } from "./useSetupModel";

interface PracticeSetupProps {
  onStart: (config: PracticeConfig, pool: string[]) => void;
  onBack: () => void;
}

const inputClass =
  "h-8 w-16 rounded-md border border-border bg-background px-2 text-sm";

export const PracticeSetup = ({ onStart, onBack }: PracticeSetupProps) => {
  const {
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
    canStart,
    start,
  } = useSetupModel(onStart);
  const { noteMode, setNoteMode } = useControls();
  const fileInput = useRef<HTMLInputElement>(null);

  const includesChords = config.content !== "scales";
  const itemWord = pool.length === 1 ? "item" : "items";

  const lengthSummary =
    config.lengthMode === "count"
      ? `${config.cardCount} cards${
          config.cardCount > pool.length && pool.length > 0
            ? " (items will repeat)"
            : ""
        }`
      : `${config.minutes} minute${config.minutes === 1 ? "" : "s"}`;

  return (
    <PracticePanel
      className="max-w-4xl"
      title="Set up a test"
      actions={
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft /> Back to reference
        </Button>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {canStart
              ? `${pool.length} ${itemWord} to test from · ${lengthSummary}`
              : "No items match these settings yet."}
          </p>
          <Button onClick={start} disabled={!canStart}>
            <Play /> Start test
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <OptionGroup<ContentMode>
          label="What to test"
          options={[
            { value: "chords", label: "Chords" },
            { value: "scales", label: "Scales" },
            { value: "both", label: "Both" },
          ]}
          isSelected={(v) => config.content === v}
          onSelect={(content) => update({ content })}
        />

        {includesChords && (
          <OptionGroup<boolean>
            label="Chord inversions"
            options={[
              { value: false, label: "Root position only" },
              { value: true, label: "Include inversions" },
            ]}
            isSelected={(v) => config.includeInversions === v}
            onSelect={(includeInversions) => update({ includeInversions })}
          />
        )}

        <OptionGroup<SelectionMode>
          label="Which items"
          options={[
            { value: "weakest", label: "Least confident first" },
            { value: "random", label: "Random" },
            { value: "manual", label: "Pick my own" },
          ]}
          isSelected={(v) => config.selection === v}
          onSelect={(selection) => update({ selection })}
        />

        <OptionGroup<Confidence>
          label="Confidence filter"
          options={[
            { value: 3, label: "Any" },
            {
              value: 2,
              label: (
                <>
                  ≤ <ConfidenceIndicator confidence={2} />
                </>
              ),
            },
            {
              value: 1,
              label: (
                <>
                  ≤ <ConfidenceIndicator confidence={1} />
                </>
              ),
            },
            { value: 0, label: "Not known yet" },
          ]}
          isSelected={(v) => config.maxConfidence === v}
          onSelect={(maxConfidence) => update({ maxConfidence })}
        />
      </div>

      {config.selection === "manual" && (
        <div className="mt-5 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              Pick items{" "}
              <span className="font-normal text-muted-foreground">
                · {selectedCount} selected · click a column or note heading to
                select a whole group
              </span>
            </p>
            <div className="flex items-center gap-2">
              {config.content === "both" && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as typeof viewMode)}
                >
                  <TabsList>
                    <TabsTrigger value="view-chords">Chords</TabsTrigger>
                    <TabsTrigger value="view-scales">Scales</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ manualIds: [] })}
                disabled={!config.manualIds.length}
              >
                Clear
              </Button>
            </div>
          </div>
          <MusicTable selection={selection} />
        </div>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <OptionGroup<PromptMode>
          label="Card shows"
          options={[
            { value: "name", label: "Name → recall notes" },
            { value: "notes", label: "Notes → name it" },
            { value: "mixed", label: "Mixed" },
          ]}
          isSelected={(v) => config.promptMode === v}
          onSelect={(promptMode) => update({ promptMode })}
        />

        <OptionGroup
          label="Hands"
          options={(["left", "both", "right"] as const).map((hand) => ({
            value: hand,
            label: HAND_LABELS[hand],
          }))}
          isSelected={(v) => config.hands.includes(v)}
          onSelect={toggleHand}
          hint={
            config.hands.length > 1
              ? "Each card picks one of these at random."
              : undefined
          }
        />

        <OptionGroup<"count" | "time">
          label="Test length"
          options={[
            { value: "count", label: "Number of cards" },
            { value: "time", label: "Timed" },
          ]}
          isSelected={(v) => config.lengthMode === v}
          onSelect={(lengthMode) => update({ lengthMode })}
        >
          {config.lengthMode === "count" ? (
            <LengthInput
              presets={[5, 10, 20]}
              value={config.cardCount}
              unit="cards"
              onChange={(cardCount) => update({ cardCount })}
            />
          ) : (
            <LengthInput
              presets={[2, 5, 10]}
              value={config.minutes}
              unit="min"
              onChange={(minutes) => update({ minutes })}
            />
          )}
        </OptionGroup>

        <OptionGroup
          label="Note names"
          options={[
            { value: "notes-sharp", label: "Sharp #" },
            { value: "notes-flat", label: "Flat b" },
          ]}
          isSelected={(v) => noteMode === v}
          onSelect={setNoteMode}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 rounded-lg bg-muted p-3">
        <p className="text-sm font-semibold">Your progress</p>
        <p className="text-xs text-muted-foreground">
          Confidence is saved in this browser. Export a backup to keep it safe
          or move it to another device.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportProgress}>
            <Download /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInput.current?.click()}
          >
            <Upload /> Import
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
            aria-label="Import progress file"
          />
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw /> Reset
          </Button>
        </div>
        {progressMessage && (
          <p
            role="status"
            className={cn(
              "text-sm",
              progressMessage.type === "error"
                ? "text-destructive"
                : "text-emerald-700"
            )}
          >
            {progressMessage.text}
          </p>
        )}
      </div>
    </PracticePanel>
  );
};

interface LengthInputProps {
  presets: number[];
  value: number;
  unit: string;
  onChange: (value: number) => void;
}

const LengthInput = ({ presets, value, unit, onChange }: LengthInputProps) => (
  <div className="flex basis-full items-center gap-1.5 pt-1">
    {presets.map((preset) => (
      <Button
        key={preset}
        type="button"
        size="sm"
        variant={value === preset ? "secondary" : "ghost"}
        aria-pressed={value === preset}
        onClick={() => onChange(preset)}
      >
        {preset}
      </Button>
    ))}
    <input
      type="number"
      min={1}
      max={200}
      value={value}
      aria-label={`Custom ${unit}`}
      className={inputClass}
      onChange={(e) => {
        const next = Math.floor(Number(e.target.value));
        if (next >= 1 && next <= 200) onChange(next);
      }}
    />
    <span className="text-sm text-muted-foreground">{unit}</span>
  </div>
);
