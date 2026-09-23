import { ChevronRight, Repeat } from "lucide-react";

const STEPS = ["Plan", "Observe", "Understand", "Adapt", "Escalate"];

export function CoreLoop() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
      {STEPS.map((s) => (
        <span key={s} className="flex items-center gap-1">
          <span className="rounded-full border bg-card/70 px-2.5 py-1">{s}</span>
          <ChevronRight className="size-3 opacity-50" />
        </span>
      ))}
      <span className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-background">
        <Repeat className="size-3" /> Repeat
      </span>
    </div>
  );
}
