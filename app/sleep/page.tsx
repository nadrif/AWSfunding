"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot, HeartPulse, Moon, Repeat, Timer } from "lucide-react";

import { BarChart } from "@/components/charts";
import { SectionTitle, StatCard } from "@/components/spoke/bits";
import { useQuickWizard } from "@/components/spoke/quick-wizard";
import { SpokeShell } from "@/components/spoke/spoke-shell";
import { Switch } from "@/components/ui/switch";
import { getSpoke } from "@/lib/data";
import { useDemo, useEffectiveConnections } from "@/lib/demo-context";

const spoke = getSpoke("sleep");

export default function SleepPage() {
  const { sources, toggleSource } = useDemo();
  const wizardSteps = useQuickWizard(
    [
      {
        title: "Connect a tracker",
        description: "Sleep works best with a wearable. Pick what you wear to bed.",
        options: ["Oura", "WHOOP", "Apple Watch", "Garmin", "Nothing yet"],
        initial: ["Oura"],
        extra: (
          <div className="grid gap-2 sm:grid-cols-2">
            {(["oura", "whoop"] as const).map((id) => (
              <label key={id} className="flex items-center justify-between rounded-2xl border bg-card p-3.5">
                <span className="text-sm font-medium">{id === "oura" ? "Oura" : "WHOOP"}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {sources[id] ? "Connected" : "Connect"}
                  <Switch checked={sources[id]} onCheckedChange={(v) => toggleSource(id, v)} style={{ backgroundColor: sources[id] ? spoke.accent : undefined }} />
                </span>
              </label>
            ))}
          </div>
        ),
      },
      { title: "Target bedtime", description: "We'll nudge you to wind down 45 minutes before.", options: ["10:00pm", "10:30pm", "11:00pm", "11:30pm", "Midnight"], initial: ["11:00pm"] },
      { title: "What gets in the way?", description: "Pick anything that sounds familiar.", options: ["Late padel", "Screens in bed", "Caffeine after 4pm", "Heat / AC", "Work stress", "Late dinners"], multi: true, initial: ["Late padel"] },
    ],
    spoke.accent
  );

  return (
    <SpokeShell
      spokeId="sleep"
      wizardSteps={wizardSteps}
      tabs={{
        today: <SleepToday />,
        experts: (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
            <span className="flex size-11 items-center justify-center rounded-full text-white" style={{ backgroundColor: spoke.accent }}>
              <Bot className="size-5" />
            </span>
            <p className="mt-3 font-semibold">AI-guided in v1</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Sleep coaching runs on your wearable data for now. Sleep specialists and clinics join in a later version.
            </p>
          </div>
        ),
      }}
    />
  );
}

function SleepToday() {
  const { mode, sources, setUp } = useDemo();
  const connections = useEffectiveConnections();
  const hasSource = sources.oura || sources.whoop;
  const signalToTrain = connections.some((c) => c.id === "sleep-train");
  const fresh = mode === "new" && setUp.sleep;

  if (!hasSource) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card/60 px-6 py-14 text-center">
        <Moon className="size-8 text-muted-foreground" />
        <p className="mt-3 font-semibold">No sleep source connected</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Connect Oura or WHOOP in Profile & Connections to see last night, trends and sleep debt.
        </p>
        <Link href="/profile" className="mt-4 flex items-center gap-1 text-sm font-semibold hover:underline">
          Go to connections <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (fresh) {
    return (
      <div className="rounded-3xl border bg-card p-6 text-center">
        <p className="font-semibold">Connected — your first night lands tomorrow morning</p>
        <p className="mt-1 text-sm text-muted-foreground">Wear your ring to bed. Trends appear after 3 nights.</p>
      </div>
    );
  }

  const hours = [7.1, 6.4, 7.6, 5.9, 6.2, 6.0, 5.7];
  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-2xl border border-[#f3d3a6] bg-[#fff8ee] p-4 text-[#7a4608]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-attn-warn text-white">
          <AlertTriangle className="size-4" />
        </span>
        <div>
          <p className="font-semibold">Sleep debt building: 3h 10m this week</p>
          <p className="text-sm text-[#8a5a1c]">
            Four short nights in a row after evening padel. Aim for lights-out by 11:00pm tonight — you&apos;re playing at 7pm, so
            you&apos;ll be home by 9.
          </p>
          {signalToTrain && (
            <p className="mt-2 text-xs font-semibold text-[#b0691a]">→ Signal sent to Train: today&apos;s intervals swapped for Zone 2.</p>
          )}
        </div>
      </div>

      <section>
        <SectionTitle>Last night</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Duration" value="5h 42m" hint="Target 7h 30m" tone="warn" />
          <StatCard label="Consistency" value="68" unit="%" hint="Bedtime varied by 84 min" tone="warn" />
          <StatCard label="HRV · Oura" value="42" unit="ms" hint="7-day avg 51 ms" />
          <StatCard label="Resting HR" value="58" unit="bpm" hint="+4 vs baseline" />
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-5">
        <SectionTitle
          action={
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Timer className="size-3.5" /> avg 6h 25m</span>
              <span className="flex items-center gap-1"><Repeat className="size-3.5" /> target 7.5h</span>
            </span>
          }
        >
          Hours slept · last 7 nights
        </SectionTitle>
        <BarChart
          labels={["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]}
          series={[{ id: "sleep", label: "Hours", values: hours, color: spoke.accent }]}
          highlightLast
          unit="h"
        />
      </section>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HeartPulse className="size-3.5" /> Data from {sources.oura ? "Oura" : "WHOOP"} · synced 6:48am
      </p>
    </div>
  );
}
