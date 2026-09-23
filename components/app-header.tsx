"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function AppHeader() {
  const [lang, setLang] = React.useState<"EN" | "AR">("EN");
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="relative flex size-7 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              <path
                d="M50 0 L57 15 L73 9 L72 26 L89 28 L80 42 L95 52 L80 60 L88 75 L71 76 L70 93 L55 85 L45 100 L38 85 L22 92 L23 75 L6 72 L16 58 L2 48 L17 40 L10 24 L27 24 L28 7 L43 14 Z"
                fill="#111315"
              />
            </svg>
            <span className="relative text-[9px] font-bold text-white">OS</span>
          </span>
          Health OS
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Demo
          </span>
        </Link>
        <div className="flex items-center gap-1 rounded-full border bg-card p-0.5 text-xs font-semibold">
          {(["EN", "AR"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                if (l === "AR") toast("العربية قريباً", { description: "Arabic arrives in v2 — the demo stays in English for now." });
                setLang("EN");
              }}
              className={cn(
                "rounded-full px-2.5 py-1 transition",
                lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
