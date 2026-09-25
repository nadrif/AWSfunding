"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, PowerOff, Sparkles, X, Zap } from "lucide-react";

export function HubLegend() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition hover:text-foreground"
        aria-expanded={open}
      >
        {open ? <X className="size-3.5" /> : <Info className="size-3.5" />}
        Legend
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full right-0 z-50 mt-2 w-[min(300px,calc(100vw-2rem))] rounded-2xl border bg-card p-4 text-xs shadow-xl"
          >
            <p className="mb-2 font-semibold text-foreground">Spoke states</p>
            <ul className="space-y-2 text-muted-foreground">
              <Row
                icon={<span className="size-5 rounded-full border-2 border-dashed border-[#b3bdc7] bg-[#e3e7eb]" />}
                label="Not set up"
                hint="Tap to run setup"
              />
              <Row
                icon={
                  <span className="flex size-5 items-center justify-center rounded-full bg-attn-due text-[10px] font-bold text-white">
                    2
                  </span>
                }
                label="Due"
                hint="Items waiting today"
              />
              <Row
                icon={<span className="size-5 rounded-full border-2 border-attn-warn shadow-[0_0_0_3px_rgb(224_138_30/0.2)]" />}
                label="Needs attention"
                hint="Pulsing amber ring"
              />
              <Row
                icon={
                  <span className="flex size-5 items-center justify-center rounded-full bg-attn-opportunity text-white">
                    <Sparkles className="size-3" />
                  </span>
                }
                label="Opportunity"
                hint="Something worth acting on"
              />
              <Row
                icon={
                  <span className="flex size-5 items-center justify-center rounded-full border-2 border-attn-done text-attn-done">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                }
                label="Done"
                hint="Ring closes as you progress"
              />
              <Row
                icon={
                  <span className="flex size-5 items-center justify-center rounded-full border border-[#d5dbe1] bg-[#eceff2] text-[#a3adb7]">
                    <PowerOff className="size-3" />
                  </span>
                }
                label="Turned off"
                hint="Hover ⏻ to turn off · tap to turn on"
              />
            </ul>
            <p className="mt-4 mb-2 font-semibold text-foreground">Connections</p>
            <ul className="space-y-2 text-muted-foreground">
              <Row
                icon={<span className="h-0.5 w-6 rounded bg-gradient-to-r from-[#2aa198] to-[#7fc4c9]" />}
                label="Data"
                hint="A source feeds a spoke"
              />
              <Row
                icon={
                  <span className="flex w-6 items-center">
                    <span className="h-1 w-6 rounded bg-gradient-to-r from-[#ffc15e] to-[#e0701e]" />
                    <Zap className="-ml-4 size-3 text-attn-warn" fill="currentColor" />
                  </span>
                }
                label="Signal"
                hint="One spoke is affecting another"
              />
              <Row
                icon={<span className="w-6 border-t-2 border-dotted border-[#8e99a4]" />}
                label="Potential"
                hint="Unlocks when you set it up"
              />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex w-6 shrink-0 justify-center">{icon}</span>
      <span className="font-medium text-foreground">{label}</span>
      <span className="ml-auto text-right">{hint}</span>
    </li>
  );
}
