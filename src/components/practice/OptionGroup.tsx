import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface OptionGroupProps<T extends string | number | boolean> {
  label: string;
  options: { value: T; label: ReactNode }[];
  isSelected: (value: T) => boolean;
  onSelect: (value: T) => void;
  hint?: ReactNode;
  children?: ReactNode;
}

export const OptionGroup = <T extends string | number | boolean>({
  label,
  options,
  isSelected,
  onSelect,
  hint,
  children,
}: OptionGroupProps<T>) => (
  <fieldset className="flex flex-col gap-1.5">
    <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((option) => (
        <Button
          key={String(option.value)}
          type="button"
          size="sm"
          variant={isSelected(option.value) ? "default" : "outline"}
          aria-pressed={isSelected(option.value)}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
      {children}
    </div>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </fieldset>
);
