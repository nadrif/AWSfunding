"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CalendarDays, CheckCircle2, Target, Watch } from "lucide-react";

import { SectionTitle } from "@/components/spoke/bits";
import { ComingSoon } from "@/components/spoke/coming-soon";
import { SpokeShell } from "@/components/spoke/spoke-shell";
import { Chip } from "@/components/spoke/wizard";
import { Switch } from "@/components/ui/switch";
import { connections, getSpoke, persona, sources } from "@/lib/data";
import { useDemo } from "@/lib/demo-context";
import { cn } from "@/lib/utils";
import type { SourceId } from "@/types";

const spoke = getSpoke("profile");

export default function ProfilePage() {
  return (
    <SpokeShell
      spokeId="profile"
      todayLabel="Overview"
      tabs={{
        today: <ProfileToday />,
        experts: <ComingSoon what="Experts" note="Profile holds your data and settings — experts live inside each spoke." />,
      }}
    />
  );
}

function ProfileToday() {
  const { mode, sources: on, toggleSource } = useDemo();
  const [goal, setGoal] = React.useState<string | null>(null);
  const active = mode === "active";
  const connectedCount = Object.values(on).filter(Boolean).length;

  const feeds = (id: SourceId) =>
    connections
      .filter((c) => c.sources?.includes(id))
      .map((c) => getSpoke(c.to).label);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      {/* Profile summary */}
      <div className="rounded-3xl border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: spoke.accent }}
          >
            {active ? "F" : "?"}
          </span>
          <div>
            <p className="text-lg font-semibold">{active ? `${persona.name}, ${persona.age}` : "Your profile"}</p>
            <p className="text-sm text-muted-foreground">{active ? persona.city : "A minute now saves hours later"}</p>
          </div>
        </div>

        {active ? (
          <dl className="mt-6 space-y-4 text-sm">
            <Item icon={<Target />} label="Goal" value={persona.goal} />
            <Item icon={<CalendarDays />} label="Schedule" value={persona.schedule} />
            <Item icon={<CheckCircle2 />} label="Injuries" value={persona.injuries} />
            <Item icon={<Watch />} label="Wears" value="Oura ring · Garmin Forerunner" />
          </dl>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">What&apos;s your main goal?</p>
              <div className="flex flex-wrap gap-2">
                {["Get stronger", "Play more sport", "Lose weight", "Sleep better", "Feel less stiff"].map((g) => (
                  <Chip key={g} selected={goal === g} onClick={() => setGoal(g)} accent={spoke.accent}>
                    {g}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Next: connect a device →</p>
              Each connection lights up a spoke on your hub. Try Oura for Sleep.
            </div>
          </div>
        )}
      </div>

      {/* Connections */}
      <div className="rounded-3xl border bg-card p-5 sm:p-6">
        <SectionTitle
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {connectedCount} of {sources.length} connected
            </span>
          }
        >
          Connected sources
        </SectionTitle>
        <ul className="divide-y">
          {sources.map((s) => {
            const isOn = on[s.id];
            return (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                    isOn ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {s.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {s.name}
                    <span className="text-xs font-normal text-muted-foreground">{s.kind}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{s.feeds}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {feeds(s.id).map((f) => (
                      <span
                        key={f}
                        className={cn(
                          "rounded-full px-1.5 py-px text-[10px] font-semibold transition-colors",
                          isOn ? "bg-[#e3f3f1] text-[#1b7a72]" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        → {f}
                      </span>
                    ))}
                  </div>
                </div>
                <Switch checked={isOn} onCheckedChange={(v) => toggleSource(s.id, v)} aria-label={`Connect ${s.name}`} />
              </li>
            );
          })}
        </ul>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#eef7f6] p-3 text-sm text-[#1b5f59]"
          >
            <span>
              {on.oura
                ? "Try switching Oura off — the Profile → Sleep beam on the hub drops to a dotted line."
                : "Switch Oura on — the Sleep beam on the hub comes alive."}
            </span>
            <Link href="/" className="flex shrink-0 items-center gap-0.5 font-semibold hover:underline">
              Hub <ArrowUpRight className="size-3.5" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Item({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}
