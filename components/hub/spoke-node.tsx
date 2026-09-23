"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";

import { NamedIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Spoke, SpokeState } from "@/types";
import type { NodeLayout } from "./layout";

type Props = {
  spoke: Spoke;
  state: SpokeState;
  layout: NodeLayout;
  index: number;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  dimmed: boolean;
  focused: boolean;
  launching: boolean;
  onHover: (hovered: boolean) => void;
  onActivate: (pointerType: string) => void;
};

const INACTIVE_FILL = "#e3e7eb";

// Deterministic per-node float so nodes drift out of sync
function floatFor(index: number) {
  const seed = (index * 9301 + 49297) % 233280;
  const r = seed / 233280;
  return {
    duration: 4 + r * 3,
    dx: 1.5 + r * 2,
    dy: 3 + (1 - r) * 2.5,
    delay: index * 0.37,
  };
}

export function SpokeNode({
  spoke,
  state,
  layout,
  index,
  nodeRef,
  dimmed,
  focused,
  launching,
  onHover,
  onActivate,
}: Props) {
  const active = state.status === "active";
  const attention = state.attention;
  const progress = attention?.type === "done" ? 1 : state.progress;
  const float = floatFor(index);
  const small = spoke.id === "profile";
  const pointerType = React.useRef("mouse");

  const ringColor =
    attention?.type === "done" ? "var(--attn-done)" : active ? spoke.accent : "transparent";

  return (
    <div
      ref={nodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.size}%`,
        aspectRatio: "1 / 1",
        zIndex: focused ? 30 : 20,
      }}
    >
      {/* Float an inner element so the ref'd wrapper (beam anchor) stays fixed */}
      <motion.div
        className="size-full"
        animate={{
          x: [0, float.dx, 0, -float.dx, 0],
          y: [0, -float.dy, 0, float.dy * 0.6, 0],
        }}
        transition={{
          duration: float.duration,
          delay: float.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.button
          type="button"
          aria-label={`${spoke.label}${active ? "" : " — not set up"}`}
          onPointerDown={(e) => (pointerType.current = e.pointerType)}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          onFocus={() => onHover(true)}
          onBlur={() => onHover(false)}
          onClick={() => onActivate(pointerType.current)}
          className="group relative block size-full cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
          animate={{
            opacity: dimmed ? 0.4 : 1,
            scale: launching ? 1.14 : focused ? 1.06 : 1,
          }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          {/* Needs attention: pulsing ring */}
          {attention?.type === "needs_attention" && (
            <>
              <motion.span
                className="absolute -inset-[7%] rounded-full border-2 border-attn-warn"
                animate={{ scale: [1, 1.22], opacity: [0.85, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <span className="absolute -inset-[7%] rounded-full border-2 border-attn-warn/80" />
            </>
          )}

          {/* Progress ring */}
          <svg className="absolute -inset-[9%] size-[118%] -rotate-90" viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={47}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className={cn("text-black/[0.06] transition-opacity", active ? "opacity-100" : "opacity-0")}
            />
            {active && progress !== undefined && (
              <motion.circle
                cx={50}
                cy={50}
                r={47}
                fill="none"
                stroke={ringColor}
                strokeWidth={attention?.type === "done" ? 3.5 : 3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 1 - progress }}
                transition={{ duration: 1.1, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </svg>

          {/* Disc */}
          <motion.span
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-[6%] rounded-full border-2 text-center",
              active ? "shadow-[0_10px_28px_-10px_rgb(0_0_0/0.45)]" : "border-dashed"
            )}
            initial={false}
            animate={{
              backgroundColor: active ? spoke.accent : INACTIVE_FILL,
              borderColor: active ? "rgba(255,255,255,0.35)" : "#b3bdc7",
              color: active ? "#ffffff" : "#7c8792",
            }}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.09, ease: "easeOut" }}
          >
            <NamedIcon name={spoke.icon} className={cn("shrink-0", small ? "size-[30%]" : "size-[26%]")} strokeWidth={1.8} />
            <span
              className={cn(
                "max-w-[84%] leading-[1.1] font-semibold",
                small
                  ? "text-[clamp(7px,1.25cqw,10px)]"
                  : "text-[clamp(9px,1.9cqw,14px)]"
              )}
            >
              {small ? "Profile" : spoke.label}
            </span>
          </motion.span>

          {/* Badges */}
          {active && attention?.type === "due" && (
            <Badge className="bg-attn-due text-white">{attention.count}</Badge>
          )}
          {active && attention?.type === "opportunity" && (
            <Badge className="bg-attn-opportunity text-white">
              <motion.span
                animate={{ rotate: [0, 18, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex"
              >
                <Sparkles className="size-[60%] min-h-2.5 min-w-2.5" />
              </motion.span>
            </Badge>
          )}
          {active && attention?.type === "needs_attention" && (
            <Badge className="bg-attn-warn text-white">!</Badge>
          )}
          {active && attention?.type === "done" && (
            <Badge className="bg-attn-done text-white">
              <Check className="size-[60%] min-h-2.5 min-w-2.5" strokeWidth={3} />
            </Badge>
          )}
        </motion.button>

        {/* Micro label */}
        <MicroLabel state={state} />
      </motion.div>
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.5 }}
      className={cn(
        "absolute top-[2%] right-[2%] flex size-[26%] min-h-4 min-w-4 items-center justify-center rounded-full text-[clamp(9px,1.5cqw,12px)] font-bold ring-2 ring-background",
        className
      )}
    >
      {children}
    </motion.span>
  );
}

function MicroLabel({ state }: { state: SpokeState }) {
  let text: string | undefined;
  let tone = "bg-card text-muted-foreground border";
  let pulse = false;

  if (state.microLabel) {
    text = state.microLabel;
    tone = "bg-foreground text-background";
    pulse = true;
  } else if (state.status === "not_set_up") {
    text = "Set up";
    tone = "bg-card/80 text-muted-foreground border border-dashed border-[#b3bdc7]";
  } else if (state.attention?.label) {
    text = state.attention.label;
    tone =
      state.attention.type === "needs_attention"
        ? "bg-[#fdf1e2] text-[#a45f0c] border border-[#f3d3a6]"
        : state.attention.type === "opportunity"
          ? "bg-[#e8f1fc] text-[#1f5fae] border border-[#c3dafa]"
          : "bg-card text-foreground border";
  } else if (state.attention?.type === "done") {
    text = "Done";
    tone = "bg-[#e7f5ec] text-[#277a4a] border border-[#bfe3cc]";
  }

  if (!text) return null;
  return (
    <motion.span
      key={text}
      initial={{ opacity: 0, y: -4 }}
      animate={pulse ? { opacity: 1, y: [0, -2, 0] } : { opacity: 1, y: 0 }}
      transition={pulse ? { y: { duration: 1.6, repeat: Infinity }, opacity: { duration: 0.3 } } : { duration: 0.3, delay: 0.6 }}
      className={cn(
        "pointer-events-none absolute top-[calc(100%+10%)] left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[clamp(8px,1.4cqw,11px)] font-semibold whitespace-nowrap shadow-xs",
        tone
      )}
    >
      {text}
    </motion.span>
  );
}
