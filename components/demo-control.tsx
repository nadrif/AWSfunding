"use client";

import { motion } from "motion/react";
import { Compass, FlaskConical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils";
import type { DemoMode } from "@/types";

const MODES: { id: DemoMode; label: string }[] = [
  { id: "new", label: "New user" },
  { id: "active", label: "Active user" },
];

export function DemoControl() {
  const { mode, setMode, tourStep, setTourStep } = useDemo();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2">
      {tourStep === null && (
        <button
          type="button"
          onClick={() => {
            setMode("active");
            setTourStep(0);
            if (pathname !== "/") router.push("/");
          }}
          className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-2 text-xs font-semibold shadow-lg transition hover:bg-secondary sm:flex"
        >
          <Compass className="size-3.5" /> Guided demo
        </button>
      )}
      <div className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-lg">
        <span className="hidden items-center gap-1 pr-1 pl-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:flex">
          <FlaskConical className="size-3.5" /> Demo
        </span>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "relative rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              mode === m.id ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === m.id && (
              <motion.span
                layoutId="demo-mode-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
