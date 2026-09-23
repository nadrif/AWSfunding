"use client";

import * as React from "react";

import { Chip, type WizardStep } from "./wizard";

export type QuickStep = {
  title: string;
  description?: string;
  options: string[];
  multi?: boolean;
  initial?: string[];
  /** Extra content rendered under the chips */
  extra?: React.ReactNode;
};

/** Light 3-step setup used by shallow spokes: one chip question per step. */
export function useQuickWizard(steps: QuickStep[], accent: string): WizardStep[] {
  const [answers, setAnswers] = React.useState<string[][]>(() => steps.map((s) => s.initial ?? []));

  return steps.map((s, i) => ({
    title: s.title,
    description: s.description,
    canContinue: answers[i].length > 0,
    content: (
      <div>
        <div className="flex flex-wrap gap-2">
          {s.options.map((o) => {
            const selected = answers[i].includes(o);
            return (
              <Chip
                key={o}
                selected={selected}
                accent={accent}
                onClick={() =>
                  setAnswers((prev) =>
                    prev.map((a, j) =>
                      j !== i ? a : s.multi ? (selected ? a.filter((x) => x !== o) : [...a, o]) : [o]
                    )
                  )
                }
              >
                {o}
              </Chip>
            );
          })}
        </div>
        {s.extra && <div className="mt-6">{s.extra}</div>}
      </div>
    ),
  }));
}
