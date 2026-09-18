import { cn } from "@/lib/utils";
import { MAX_CONFIDENCE, type Confidence } from "../../lib/progress";
import { CONFIDENCE_DOT_COLOURS, CONFIDENCE_LABELS } from "./confidenceStyles";

interface ConfidenceIndicatorProps {
  confidence: Confidence;
  size?: "sm" | "md";
  className?: string;
}

export const ConfidenceIndicator = ({
  confidence,
  size = "sm",
  className,
}: ConfidenceIndicatorProps) => (
  <span
    role="img"
    aria-label={`Confidence ${confidence} of ${MAX_CONFIDENCE}: ${CONFIDENCE_LABELS[confidence]}`}
    title={`${CONFIDENCE_LABELS[confidence]} (${confidence}/${MAX_CONFIDENCE})`}
    className={cn("inline-flex items-center gap-0.5", className)}
  >
    {Array.from({ length: MAX_CONFIDENCE }, (_, i) => (
      <span
        key={i}
        className={cn(
          "rounded-full",
          size === "sm" ? "size-1.5" : "size-2.5",
          i < confidence ? CONFIDENCE_DOT_COLOURS[confidence] : "bg-gray-200"
        )}
      />
    ))}
  </span>
);

export const ConfidenceLegend = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
    <span className="font-medium">Confidence:</span>
    {([0, 1, 2, 3] as Confidence[]).map((level) => (
      <span key={level} className="inline-flex items-center gap-1.5">
        <ConfidenceIndicator confidence={level} />
        {CONFIDENCE_LABELS[level]}
      </span>
    ))}
  </div>
);
