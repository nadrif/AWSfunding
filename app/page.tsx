"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { Hub } from "@/components/hub/hub";
import { HubLegend } from "@/components/hub/legend";
import { CoreLoop } from "@/components/hub/core-loop";
import { useDemo } from "@/lib/demo-context";
import { persona } from "@/lib/data";

const noopSubscribe = () => () => {};

/** Client-only date/greeting (the page is pre-rendered at build time). */
function useToday() {
  const date = React.useSyncExternalStore(
    noopSubscribe,
    () => new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    () => null
  );
  const greeting = React.useSyncExternalStore(
    noopSubscribe,
    () => {
      const h = new Date().getHours();
      return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    },
    () => null
  );
  return date && greeting ? { date, greeting } : null;
}

export default function HubPage() {
  const { mode } = useDemo();
  const today = useToday();

  return (
    <main className="bg-dots flex min-h-[calc(100dvh-57px)] flex-col items-center px-4 pt-6 pb-28 sm:pt-8">
      <div className="w-full max-w-[680px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {today?.date ?? " "}
            </p>
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {mode === "active"
                  ? `${today?.greeting ?? "Good morning"}, ${persona.name}`
                  : "Welcome to Health OS"}
              </motion.h1>
            </AnimatePresence>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "active"
                ? "4 areas need you today. Hover a spoke to see what's pending."
                : "Start with your profile — every other area unlocks from there."}
            </p>
          </div>
          <HubLegend />
        </div>
      </div>

      <div className="mt-4 w-full sm:mt-2" data-tour="hub">
        <Hub />
      </div>

      <div className="mt-2 w-full max-w-[680px]">
        <CoreLoop />
      </div>
    </main>
  );
}
