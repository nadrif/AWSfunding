"use client";

import { Camera, Check, Clock, Dumbbell, Flame, Move, Timer } from "lucide-react";
import { toast } from "sonner";

import { SectionTitle, SignalCard } from "@/components/spoke/bits";
import { ExpertsTab } from "@/components/spoke/experts-tab";
import { useQuickWizard } from "@/components/spoke/quick-wizard";
import { SpokeShell } from "@/components/spoke/spoke-shell";
import { Button } from "@/components/ui/button";
import { getSpoke } from "@/lib/data";
import { useDemo, useEffectiveConnections } from "@/lib/demo-context";
import { cn } from "@/lib/utils";

const spoke = getSpoke("train");

const SESSIONS = [
  { id: "s1", kind: "Strength", icon: Dumbbell, title: "Lower-body strength", detail: "Trap-bar deadlift, split squat, Nordic curls", time: "6:30am", mins: 45, done: true },
  { id: "s2", kind: "Mobility", icon: Move, title: "Mobility flow", detail: "Hips, T-spine, hamstrings — follow-along", time: "9:00pm", mins: 20, done: false },
  {
    id: "s3",
    kind: "Conditioning",
    icon: Flame,
    title: "Zone 2 bike",
    detail: "Swapped from 6×400m intervals",
    time: "Flexible",
    mins: 30,
    done: false,
    adjusted: true,
  },
];

export default function TrainPage() {
  const wizardSteps = useQuickWizard(
    [
      { title: "Your focus", description: "What should training do for you?", options: ["Get stronger", "Support my sport", "Build muscle", "General fitness", "Move better"], initial: ["Support my sport"] },
      { title: "Days per week", description: "Be realistic — consistency beats ambition.", options: ["2", "3", "4", "5", "6"], initial: ["4"] },
      { title: "Where you train", description: "We'll only prescribe what you can actually do.", options: ["Commercial gym", "Home", "Compound gym", "Outdoors"], multi: true, initial: ["Commercial gym"] },
    ],
    spoke.accent
  );

  return (
    <SpokeShell
      spokeId="train"
      wizardSteps={wizardSteps}
      tabs={{
        today: <TrainToday />,
        experts: <ExpertsTab spokeId="train" intro="Personal trainers in Riyadh and online — for form checks, programming or accountability." />,
      }}
    />
  );
}

function TrainToday() {
  const { mode, signedUpEvents, setUp } = useDemo();
  const connections = useEffectiveConnections();
  const sleepSignal = connections.some((c) => c.id === "sleep-train");
  const plan = signedUpEvents.length > 0;
  const fresh = mode === "new" && setUp.train;
  const sessions = fresh
    ? SESSIONS.map((s) => ({ ...s, done: false, adjusted: false, detail: s.id === "s3" ? "6×400m intervals" : s.detail, title: s.id === "s3" ? "Intervals" : s.title }))
    : SESSIONS;

  return (
    <div className="space-y-6">
      {plan && (
        <div className="rounded-3xl border border-[#f3d3a6] bg-[#fff8ee] p-5">
          <p className="text-[11px] font-semibold tracking-wider text-[#b0691a] uppercase">New from Sports</p>
          <p className="mt-1 text-lg font-semibold text-[#5f3706]">8-week padel build plan · Week 1 of 8</p>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {[
              { w: "Wk 1–3", label: "Strength & agility" },
              { w: "Wk 4–6", label: "Match play" },
              { w: "Wk 7", label: "Sharpen" },
              { w: "Wk 8", label: "Taper · event" },
            ].map((b, i) => (
              <div key={b.w} className={cn("rounded-xl p-2.5 text-xs", i === 0 ? "bg-attn-warn text-white" : "bg-white/70 text-[#7a4608]")}>
                <p className="font-semibold">{b.w}</p>
                <p className={i === 0 ? "text-white/85" : "text-[#8a5a1c]"}>{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sleepSignal && (
        <SignalCard
          from="Sleep"
          title="Short sleep: session adjusted"
          body="You slept 5h 42m. Today's intervals became a Zone 2 ride, and strength volume is capped at RPE 7."
        />
      )}

      <section>
        <SectionTitle>Today&apos;s sessions</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {sessions.map((s) => (
            <div key={s.id} className={cn("flex flex-col rounded-2xl border bg-card p-4", s.done && "bg-secondary/40")}>
              <div className="flex items-center justify-between">
                <span
                  className="flex size-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: s.done ? "#9aa4ae" : spoke.accent }}
                >
                  <s.icon className="size-4.5" />
                </span>
                {s.done ? (
                  <span className="flex items-center gap-1 rounded-full bg-[#e7f5ec] px-2 py-0.5 text-xs font-semibold text-[#277a4a]">
                    <Check className="size-3" strokeWidth={3} /> Done
                  </span>
                ) : s.adjusted ? (
                  <span className="rounded-full bg-[#fdf1e2] px-2 py-0.5 text-xs font-semibold text-[#a45f0c]">Adjusted</span>
                ) : (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">Due</span>
                )}
              </div>
              <p className="mt-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{s.kind}</p>
              <p className={cn("font-semibold", s.done && "text-muted-foreground line-through decoration-1")}>{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.detail}</p>
              <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> {s.time}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="size-3.5" /> {s.mins} min
                </span>
                {!s.done && (
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => toast("Session view is coming in v2")}>
                    Start
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid items-center gap-5 overflow-hidden rounded-3xl border bg-card p-5 sm:grid-cols-[220px_1fr] sm:p-6">
        <FormCheckIllustration />
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <Camera className="size-3.5" /> Coming in session view
          </span>
          <p className="mt-2 text-lg font-semibold">Camera form check</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prop your phone up and Health OS tracks joint angles through each rep — knee tracking, depth and bar path — with
            cues between sets.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {mode === "active" ? "Last split squat: left knee drifted in on 3 of 8 reps." : "Available once your first plan is running."}
          </p>
        </div>
      </section>
    </div>
  );
}

function FormCheckIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="w-full rounded-2xl bg-[#1b2026]">
      <rect x={12} y={12} width={196} height={156} rx={14} fill="none" stroke="#ffffff22" strokeDasharray="4 6" />
      {/* Stick figure in a squat */}
      <g stroke="#e8edf2" strokeWidth={5} strokeLinecap="round" fill="none">
        <line x1={96} y1={62} x2={112} y2={104} />
        <line x1={112} y1={104} x2={148} y2={108} />
        <line x1={148} y1={108} x2={138} y2={150} />
        <line x1={96} y1={62} x2={138} y2={76} />
      </g>
      <circle cx={90} cy={48} r={11} fill="#e8edf2" />
      {/* Joints */}
      {[
        [96, 62],
        [112, 104],
        [148, 108],
        [138, 150],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="#5b7c99" stroke="#fff" strokeWidth={2} />
      ))}
      {/* Angle annotation */}
      <path d="M 130 107 A 18 18 0 0 1 144 124" fill="none" stroke="#7fc4c9" strokeWidth={2} />
      <rect x={154} y={112} width={46} height={20} rx={10} fill="#7fc4c9" />
      <text x={177} y={126} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0e2a2d">
        92°
      </text>
      <line x1={138} y1={150} x2={138} y2={60} stroke="#e08a1e" strokeWidth={1.5} strokeDasharray="3 4" />
      <text x={26} y={160} fontSize={10} fill="#ffffff88">
        REP 6 / 8 · DEPTH ✓
      </text>
    </svg>
  );
}
