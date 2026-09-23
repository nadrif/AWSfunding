"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WizardStep = {
  title: string;
  description?: string;
  content: React.ReactNode;
  /** Disable Next until the step has an answer */
  canContinue?: boolean;
};

export function Wizard({
  steps,
  accent,
  onFinish,
  finishLabel = "Finish",
}: {
  steps: WizardStep[];
  accent: string;
  onFinish: () => void;
  finishLabel?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const step = steps[index];
  const last = index === steps.length - 1;

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                i < index && "border-transparent text-white",
                i === index && "bg-card",
                i > index && "border-border text-muted-foreground"
              )}
              style={{
                backgroundColor: i < index ? accent : undefined,
                borderColor: i === index ? accent : undefined,
                color: i === index ? accent : undefined,
              }}
            >
              {i < index ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-xs font-medium md:block",
                i === index ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <span className="h-0.5 min-w-3 flex-1 overflow-hidden rounded-full bg-border">
                <motion.span
                  className="block h-full"
                  style={{ backgroundColor: accent }}
                  initial={false}
                  animate={{ width: i < index ? "100%" : "0%" }}
                  transition={{ duration: 0.35 }}
                />
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="relative min-h-[320px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Step {index + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{step.title}</h2>
            {step.description && <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>}
            <div className="mt-6">{step.content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-5">
        <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0}>
          <ArrowLeft /> Back
        </Button>
        {last ? (
          <Button onClick={onFinish} disabled={step.canContinue === false} style={{ backgroundColor: accent }} className="text-white hover:opacity-90">
            {finishLabel} <Check />
          </Button>
        ) : (
          <Button onClick={() => go(index + 1)} disabled={step.canContinue === false}>
            Next <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

/** Selectable card used across wizard steps */
export function ChoiceCard({
  selected,
  onClick,
  accent,
  icon,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  accent: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-colors",
        selected ? "shadow-sm" : "border-border hover:border-foreground/20"
      )}
      style={{ borderColor: selected ? accent : undefined, backgroundColor: selected ? `${accent}0f` : undefined }}
      aria-pressed={selected}
    >
      {icon && (
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors [&_svg]:size-5"
          style={{ backgroundColor: selected ? accent : "var(--secondary)", color: selected ? "white" : "var(--muted-foreground)" }}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
      </span>
      {badge && (
        <span className="absolute -top-2 right-3 rounded-full bg-attn-opportunity px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          !selected && "border-border"
        )}
        style={{ borderColor: selected ? accent : undefined, backgroundColor: selected ? accent : undefined }}
      >
        {selected && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
    </motion.button>
  );
}

/** Pill toggle used for goal chips, days, etc. */
export function Chip({
  selected,
  onClick,
  accent,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        selected ? "text-white" : "bg-card hover:bg-secondary"
      )}
      style={{ backgroundColor: selected ? accent : undefined, borderColor: selected ? accent : undefined }}
    >
      {children}
    </button>
  );
}

export function useToggleSet<T>(initial: T[] = []) {
  const [set, setSet] = React.useState<T[]>(initial);
  const toggle = (v: T) => setSet((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  return [set, toggle, setSet] as const;
}
