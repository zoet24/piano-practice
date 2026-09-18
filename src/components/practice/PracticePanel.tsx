import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PracticePanelProps {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// white card that holds each practice screen, scrolling inside the viewport
export const PracticePanel = ({
  title,
  actions,
  children,
  footer,
  className,
}: PracticePanelProps) => (
  <section
    className={cn(
      "flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-white shadow",
      className
    )}
  >
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
    <div className="flex-1 overflow-y-auto p-4">{children}</div>
    {footer && (
      <footer className="border-t border-border px-4 py-3">{footer}</footer>
    )}
  </section>
);
