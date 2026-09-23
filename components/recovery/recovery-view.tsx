"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertOctagon,
  ArrowRight,
  CalendarCheck,
  Home,
  MapPin,
  RotateCcw,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { BarChart, LineChart, SERIES } from "@/components/charts";
import { BodyMap, HEAT, INTENSITY_LABEL, labelFor } from "@/components/recovery/body-map";
import { InsightCard, SectionTitle, SignalCard, StatCard } from "@/components/spoke/bits";
import { ExpertsTab, SlotPicker } from "@/components/spoke/experts-tab";
import { SpokeShell, useGoToTab } from "@/components/spoke/spoke-shell";
import { Timeline } from "@/components/spoke/timeline";
import { ChoiceCard, Chip, useToggleSet, type WizardStep } from "@/components/spoke/wizard";
import { Button } from "@/components/ui/button";
import { experts, getSpoke, recovery, venues } from "@/lib/data";
import { useDemo, useEffectiveConnections } from "@/lib/demo-context";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Intensity } from "@/types";

const spoke = getSpoke("recovery");
const ACCENT = spoke.accent;
const lowerBody = new Set(recovery.regions.filter((r) => r.lower).map((r) => r.id));

export function RecoveryView() {
  const { mode } = useDemo();

  // Wizard answers
  const [modalities, toggleModality] = useToggleSet<string>(["massage", "cold"]);
  const [problemAreas, setProblemAreas] = React.useState<Record<string, number>>({});
  const [where, setWhere] = React.useState<"venue" | "home" | "both">("venue");
  const [frequency, setFrequency] = React.useState("Weekly");
  const [budget, setBudget] = React.useState("SAR 200–400");
  const [places, togglePlace] = useToggleSet<string>(["v-5"]);
  const [history, toggleHistory] = useToggleSet<string>([]);

  // Daily check-in (heatmap)
  const [checkIn, setCheckIn] = React.useState<Record<string, number>>(() =>
    mode === "active" ? { ...(recovery.todayCheckIn as Record<string, number>) } : {}
  );

  const wizardSteps: WizardStep[] = [
    {
      title: "Modalities",
      description: "What kinds of recovery are you interested in? Pick as many as you like.",
      canContinue: modalities.length > 0,
      content: (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recovery.modalities.map((m) => {
            const Icon = getIcon(m.icon);
            return (
              <ChoiceCard
                key={m.id}
                selected={modalities.includes(m.id)}
                onClick={() => toggleModality(m.id)}
                accent={ACCENT}
                icon={<Icon />}
                title={m.label}
                subtitle={m.blurb}
              />
            );
          })}
        </div>
      ),
    },
    {
      title: "Problem areas",
      description: "Tap anywhere that tends to get tight, sore or niggly.",
      content: (
        <div className="grid items-center gap-6 md:grid-cols-[1fr_240px]">
          <BodyMap
            variant="select"
            accent={ACCENT}
            values={problemAreas}
            onRegionClick={(id) =>
              setProblemAreas((p) => {
                const next = { ...p };
                if (next[id]) delete next[id];
                else next[id] = 1;
                return next;
              })
            }
          />
          <div>
            <p className="text-sm font-medium">Selected</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.keys(problemAreas).length === 0 && (
                <span className="text-sm text-muted-foreground">Nothing yet — that&apos;s fine too.</span>
              )}
              {Object.keys(problemAreas).map((id) => (
                <span key={id} className="rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: ACCENT }}>
                  {labelFor(id)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Preferences",
      description: "Where, how often and roughly what you'd like to spend.",
      content: (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Home or venue?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "venue", label: "At a venue", icon: <Store /> },
                { id: "home", label: "Comes to me", icon: <Home /> },
                { id: "both", label: "Either", icon: <MapPin /> },
              ].map((o) => (
                <ChoiceCard
                  key={o.id}
                  selected={where === o.id}
                  onClick={() => setWhere(o.id as typeof where)}
                  accent={ACCENT}
                  title={o.label}
                  icon={o.icon}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Preferred places</p>
            <div className="flex flex-wrap gap-2">
              {venues
                .filter((v) => /massage|plunge|physio|sauna/i.test(v.kind))
                .map((v) => (
                  <Chip key={v.id} selected={places.includes(v.id)} onClick={() => togglePlace(v.id)} accent={ACCENT}>
                    {v.name} · {v.distanceKm} km
                  </Chip>
                ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">How often</p>
              <div className="flex flex-wrap gap-2">
                {["As needed", "Weekly", "2x a week"].map((f) => (
                  <Chip key={f} selected={frequency === f} onClick={() => setFrequency(f)} accent={ACCENT}>
                    {f}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Budget per session</p>
              <div className="flex flex-wrap gap-2">
                {["Under SAR 200", "SAR 200–400", "SAR 400+"].map((b) => (
                  <Chip key={b} selected={budget === b} onClick={() => setBudget(b)} accent={ACCENT}>
                    {b}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Injuries & history",
      description: "Anything we should know? This stays private and shapes what we suggest.",
      content: (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Hamstring strain",
              "Lower back pain",
              "Knee (ACL / meniscus)",
              "Shoulder impingement",
              "Ankle sprain",
              "Tennis / padel elbow",
            ].map((h) => (
              <label
                key={h}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                  history.includes(h) ? "border-foreground/30 bg-secondary" : "hover:bg-secondary/60"
                )}
              >
                <input
                  type="checkbox"
                  checked={history.includes(h)}
                  onChange={() => toggleHistory(h)}
                  className="size-4 accent-[#b0706a]"
                />
                {h}
              </label>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="e.g. Tweaked my right hamstring sprinting last year — still tight after long padel sessions."
            className="w-full resize-none rounded-xl border bg-card p-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-[3px] focus:ring-ring/30"
          />
        </div>
      ),
    },
  ];

  return (
    <SpokeShell
      spokeId="recovery"
      wizardSteps={wizardSteps}
      onFinish={() => {
        if (Object.keys(problemAreas).length) setCheckIn({ ...problemAreas });
      }}
      tabs={{
        today: <RecoveryToday checkIn={checkIn} setCheckIn={setCheckIn} />,
        timeline: <Timeline items={recovery.timeline} accent={ACCENT} />,
        progress: <RecoveryProgress checkIn={checkIn} />,
        experts: (
          <ExpertsTab
            spokeId="recovery"
            intro="Physiotherapists for assessment and rehab, massage therapists for maintenance. Bookings sync to your Recovery timeline."
          />
        ),
      }}
    />
  );
}

function RecoveryToday({
  checkIn,
  setCheckIn,
}: {
  checkIn: Record<string, number>;
  setCheckIn: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  const { mode } = useDemo();
  const goToTab = useGoToTab();
  const connections = useEffectiveConnections();
  const trainSignal = connections.some((c) => c.id === "train-recovery");
  const [selected, setSelected] = React.useState<string | null>("hamstring_r");
  const [booking, setBooking] = React.useState(false);

  const setIntensity = (id: string, v: Intensity) =>
    setCheckIn((c) => {
      const next = { ...c };
      if (v === 0) delete next[id];
      else next[id] = v;
      return next;
    });

  const onRegion = (id: string) => {
    setSelected(id);
    // Tap cycles 0 → 1 → 2 → 3 → 0; the picker allows direct selection
    setIntensity(id, (((checkIn[id] ?? 0) + 1) % 4) as Intensity);
  };

  // Escalation: severe today and severe yesterday
  const hist = mode === "active" ? (recovery.sorenessHistory.regions as Record<string, number[]>) : {};
  const persistent = Object.entries(checkIn).find(([id, v]) => v === 3 && hist[id]?.at(-1) === 3);

  const ranked = Object.entries(checkIn)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1] || Number(lowerBody.has(b[0])) - Number(lowerBody.has(a[0])));
  const top = ranked[0];

  const massageTherapist = experts.find((e) => e.id === "ex-rc-2")!;
  const booked = mode === "active" ? recovery.bookings : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      {/* Check-in */}
      <div className="rounded-3xl border bg-card p-5 sm:p-6">
        <SectionTitle
          action={
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCheckIn({})}>
              <RotateCcw /> Clear
            </Button>
          }
        >
          Soreness check-in
        </SectionTitle>
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          Tap a region to log how it feels — tap again to turn it up.
        </p>
        <BodyMap variant="heat" values={checkIn} selected={selected} onRegionClick={onRegion} />

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-4 rounded-2xl bg-secondary/70 p-3"
            >
              <p className="mb-2 text-sm font-medium">{labelFor(selected)}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {([0, 1, 2, 3] as Intensity[]).map((v) => {
                  const active = (checkIn[selected] ?? 0) === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setIntensity(selected, v)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border bg-card px-1 py-2 text-xs font-medium transition-all",
                        active ? "border-foreground shadow-sm" : "border-transparent hover:border-border"
                      )}
                    >
                      <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: HEAT[v] }} />
                      {v === 0 ? "None" : `${v} · ${INTENSITY_LABEL[v]}`}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {HEAT.map((c, i) => (
              <span key={c} className="flex items-center gap-1">
                <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                {INTENSITY_LABEL[i]}
              </span>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() =>
              toast.success("Check-in saved", {
                description: `${ranked.length} region${ranked.length === 1 ? "" : "s"} logged. Your suggestions have been updated.`,
              })
            }
          >
            Save check-in
          </Button>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {persistent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-[#f1c2bf] bg-[#fdf0ef] p-4 text-[#7d201b]">
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-attn-alert text-white">
                    <AlertOctagon className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider text-[#b5372f] uppercase">Escalate</p>
                    <p className="font-semibold">Persistent pain — consider a physio assessment</p>
                    <p className="mt-0.5 text-sm text-[#93413b]">
                      {labelFor(persistent[0])} logged as severe two days running. Self-care alone may not be enough.
                    </p>
                    <Button size="sm" className="mt-3 bg-attn-alert text-white hover:bg-attn-alert/90" onClick={() => goToTab("experts")}>
                      See physiotherapists <ArrowRight />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion */}
        <div className="rounded-3xl border bg-card p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            <Sparkles className="size-3.5" /> Suggested for today
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={top ? `${top[0]}-${top[1]}-${trainSignal}` : "fresh"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Suggestion top={top} trainSignal={trainSignal} />
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90" onClick={() => setBooking(true)}>
              Book sports massage
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("Chill Lab · 5.7 km", { description: "Cold plunge slots tonight at 8:00pm and 9:30pm. (Demo)" })}
            >
              Find a cold plunge
            </Button>
          </div>
        </div>

        {/* Booked */}
        <div className="rounded-3xl border bg-card p-5">
          <SectionTitle>Booked</SectionTitle>
          {booked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing booked yet. Suggestions above are one tap away.</p>
          ) : (
            booked.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: ACCENT }}>
                  <CalendarCheck className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.when} · {b.where}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">{b.with}</span>
              </div>
            ))
          )}
        </div>

        {trainSignal && (
          <SignalCard
            from="Train"
            title="High load week"
            body="3 lower-body sessions + 2 padel matches in 5 days. Recovery has been prioritised."
          />
        )}
      </div>

      <SlotPicker expert={booking ? massageTherapist : null} accent={ACCENT} onClose={() => setBooking(false)} />
    </div>
  );
}

function Suggestion({ top, trainSignal }: { top?: [string, number]; trainSignal: boolean }) {
  if (!top) {
    return (
      <>
        <p className="mt-2 text-lg leading-snug font-semibold">Feeling fresh — keep it that way</p>
        <p className="mt-1 text-sm text-muted-foreground">20-min guided stretching tonight, then an early night.</p>
      </>
    );
  }
  const [id, v] = top;
  const label = labelFor(id).toLowerCase();
  const lower = lowerBody.has(id);
  const lead = trainSignal && lower ? "Heavy lower-body load this week + " : "";
  return (
    <>
      <p className="mt-2 text-lg leading-snug font-semibold">
        {lead}
        {lead ? label : labelFor(id)} soreness →{" "}
        {lower ? "30-min sports massage or cold plunge" : "20-min mobility flow + sauna"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {v === 3
          ? "Logged as severe — skip high-intensity work on it today and keep an eye on it."
          : v === 2
            ? "Moderate soreness. Tonight's padel is fine at lower intensity; recover straight after."
            : "Mild — a short session keeps it from building."}
      </p>
    </>
  );
}

function RecoveryProgress({ checkIn }: { checkIn: Record<string, number> }) {
  const { mode } = useDemo();
  if (mode !== "active") {
    return (
      <div className="rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
        <p className="font-semibold">Trends appear after a few check-ins</p>
        <p className="mt-1 text-sm text-muted-foreground">Log soreness for 3+ days to see how each area is trending.</p>
      </div>
    );
  }
  const { days, regions } = recovery.sorenessHistory;
  const series = Object.entries(regions as Record<string, number[]>).map(([id, values], i) => ({
    id,
    label: labelFor(id),
    values: [...values, checkIn[id] ?? 0],
    color: SERIES[i],
  }));
  const weeks = recovery.sessionsByWeek;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid grid-cols-3 gap-3 lg:col-span-2">
        <StatCard label="Sessions this week" value="4" hint="+1 vs last week" tone="good" />
        <StatCard label="Most sore" value="R. hamstring" hint="Trending up 5 days" tone="warn" />
        <StatCard label="Spend this month" value="1,140" unit="SAR" hint="Budget 1,600" />
      </div>
      <div className="rounded-3xl border bg-card p-5">
        <SectionTitle>Soreness by region · last 7 days</SectionTitle>
        <LineChart
          labels={[...days, "Today"]}
          series={series}
          yMax={3}
          yTicks={[0, 1, 2, 3].map((v) => ({ value: v, label: INTENSITY_LABEL[v] }))}
          format={(v) => INTENSITY_LABEL[v]}
        />
      </div>
      <div className="rounded-3xl border bg-card p-5">
        <SectionTitle>Sessions per week by modality</SectionTitle>
        <BarChart labels={weeks.weeks} series={weeks.series} unit=" sessions" />
      </div>
      <div className="lg:col-span-2">
        <InsightCard
          title="Your right hamstring flares 1–2 days after back-to-back padel."
          body="Booking a massage the evening after your second match has cut peak soreness from Severe to Moderate in 3 of the last 4 weeks."
        />
      </div>
    </div>
  );
}
