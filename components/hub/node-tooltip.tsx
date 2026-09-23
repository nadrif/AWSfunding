"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { NamedIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Spoke, SpokeState } from "@/types";
import type { NodeLayout } from "./layout";
import { AttentionChip } from "@/components/attention-chip";

export function NodeTooltip({
  spoke,
  state,
  layout,
  touch,
  onOpen,
}: {
  spoke: Spoke;
  state: SpokeState;
  layout: NodeLayout;
  touch: boolean;
  onOpen: () => void;
}) {
  const below = layout.y < 50;
  const offset = layout.size / 2 + 5;
  const align = layout.x < 35 ? "left" : layout.x > 65 ? "right" : "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: below ? -6 : 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "absolute z-50 w-[min(240px,62cqw)]",
        touch ? "pointer-events-auto" : "pointer-events-none",
        align === "center" && "-translate-x-1/2",
        align === "right" && "-translate-x-full",
        !below && "-translate-y-full"
      )}
      style={{
        left: `${align === "left" ? layout.x - layout.size / 2 : align === "right" ? layout.x + layout.size / 2 : layout.x}%`,
        top: `${below ? layout.y + offset : layout.y - offset}%`,
      }}
    >
      <div className="rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex size-6 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: state.status === "active" ? spoke.accent : "#9aa4ae" }}
          >
            <NamedIcon name={spoke.icon} className="size-3.5" />
          </span>
          <span className="text-sm font-semibold">{spoke.label}</span>
          <AttentionChip state={state} className="ml-auto" size="sm" />
        </div>
        <ul className="space-y-1">
          {state.tooltip.slice(0, 3).map((line) => (
            <li key={line} className="flex gap-2 text-[13px] leading-snug text-muted-foreground">
              <span className="mt-[7px] size-1 shrink-0 rounded-full bg-current opacity-60" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        {touch ? (
          <button
            type="button"
            onClick={onOpen}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground py-1.5 text-xs font-semibold text-background"
          >
            Open {spoke.id === "profile" ? "Profile" : spoke.label} <ArrowRight className="size-3.5" />
          </button>
        ) : (
          <p className="mt-2 text-[11px] font-medium text-muted-foreground/80">Click to open</p>
        )}
      </div>
    </motion.div>
  );
}
