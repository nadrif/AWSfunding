import { AlertTriangle, Check, CircleDashed, Clock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SpokeState } from "@/types";

/** Attention state chip used in tooltips and spoke headers. */
export function AttentionChip({
  state,
  className,
  size = "md",
}: {
  state: SpokeState;
  className?: string;
  size?: "sm" | "md";
}) {
  let icon = <Clock />;
  let text = "On track";
  let tone = "bg-secondary text-foreground";

  if (state.status === "not_set_up") {
    icon = <CircleDashed />;
    text = "Not set up";
    tone = "bg-secondary text-muted-foreground";
  } else if (state.attention?.type === "due") {
    icon = <Clock />;
    text = state.attention.label ?? `${state.attention.count} due`;
    tone = "bg-[#1f2328] text-white";
  } else if (state.attention?.type === "needs_attention") {
    icon = <AlertTriangle />;
    text = state.attention.label ?? "Needs attention";
    tone = "bg-[#fdf1e2] text-[#a45f0c]";
  } else if (state.attention?.type === "opportunity") {
    icon = <Sparkles />;
    text = state.attention.label ?? "Opportunity";
    tone = "bg-[#e8f1fc] text-[#1f5fae]";
  } else if (state.attention?.type === "done") {
    icon = <Check />;
    text = "Done for today";
    tone = "bg-[#e7f5ec] text-[#277a4a]";
  } else if (state.microLabel) {
    text = state.microLabel;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px] [&_svg]:size-3" : "px-2.5 py-1 text-xs [&_svg]:size-3.5",
        tone,
        className
      )}
    >
      {icon}
      {text}
    </span>
  );
}
