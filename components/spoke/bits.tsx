import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

/** Incoming signal from another spoke, mirroring the amber hub beam. */
export function SignalCard({
  from,
  title,
  body,
  className,
}: {
  from: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-[#f3d3a6] bg-[#fff8ee] p-4 text-[#7a4608]",
        className
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-attn-warn text-white">
        <Zap className="size-4" fill="currentColor" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-[#b0691a] uppercase">Signal from {from}</p>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-[#8a5a1c]">{body}</p>
      </div>
      <Link
        href="/"
        className="flex h-fit shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold text-[#9a560a] hover:bg-[#fdebd3]"
      >
        Hub <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
      {hint && (
        <p
          className={cn(
            "mt-0.5 text-xs",
            tone === "good" ? "text-[#277a4a]" : tone === "warn" ? "text-[#a45f0c]" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-foreground p-5 text-background">
      <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[radial-gradient(circle,rgb(127_196_201/0.35),transparent_70%)]" />
      <p className="text-[11px] font-semibold tracking-wider text-background/60 uppercase">Health OS insight</p>
      <p className="mt-1.5 text-lg leading-snug font-semibold">{title}</p>
      <p className="mt-1 text-sm text-background/70">{body}</p>
    </div>
  );
}
