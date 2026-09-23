"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Sparkles,
  Sun,
  Ticket,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { BarChart } from "@/components/charts";
import { InsightCard, SectionTitle, StatCard } from "@/components/spoke/bits";
import { ExpertCard, ExpertsTab, SlotPicker } from "@/components/spoke/experts-tab";
import { SpokeShell, useGoToTab } from "@/components/spoke/spoke-shell";
import { Timeline } from "@/components/spoke/timeline";
import { ChoiceCard, Chip, useToggleSet, type WizardStep } from "@/components/spoke/wizard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { events, experts, getSpoke, sports, venues } from "@/lib/data";
import { useDemo } from "@/lib/demo-context";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Expert, SourceId, SportEvent, TimelineItem } from "@/types";

const spoke = getSpoke("sports");
const ACCENT = spoke.accent;
const SOURCE_IDS: SourceId[] = ["apple_health", "garmin", "whoop", "oura", "strava"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SportsView() {
  const { mode, sources, toggleSource, signedUpEvents } = useDemo();

  const [picked, togglePicked] = useToggleSet<string>(["padel"]);
  const [level, setLevel] = React.useState("Intermediate");
  const [goals, toggleGoal] = useToggleSet<string>(["Compete", "Improve technique"]);
  const [courtApp, setCourtApp] = React.useState(false);
  const [days, toggleDay] = useToggleSet<string>(["Mon", "Thu", "Sat"]);
  const [times, toggleTime] = useToggleSet<string>(["Evening"]);
  const [setting, setSetting] = React.useState<"Indoor" | "Outdoor" | "Both">("Both");

  const wizardSteps: WizardStep[] = [
    {
      title: "Your sports",
      description: "Pick the individual sports you play or want to start.",
      canContinue: picked.length > 0,
      content: (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sports.sports.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <ChoiceCard
                key={s.id}
                selected={picked.includes(s.id)}
                onClick={() => togglePicked(s.id)}
                accent={ACCENT}
                icon={<Icon />}
                title={s.label}
                subtitle={s.popular ? "Most played in Riyadh this month" : undefined}
                badge={s.popular ? "Popular" : undefined}
              />
            );
          })}
        </div>
      ),
    },
    {
      title: "Level & goals",
      description: "Be honest — this sets who we match you with and how hard we push.",
      content: (
        <div className="space-y-7">
          <div>
            <p className="mb-3 text-sm font-medium">Level</p>
            <div className="grid grid-cols-5 gap-1.5">
              {sports.levels.map((l, i) => {
                const active = sports.levels.indexOf(level) >= i;
                return (
                  <button key={l} type="button" onClick={() => setLevel(l)} className="group text-left">
                    <span
                      className="block h-2 rounded-full transition-colors"
                      style={{ backgroundColor: active ? ACCENT : "var(--border)" }}
                    />
                    <span
                      className={cn(
                        "mt-2 block text-[11px] font-medium sm:text-xs",
                        l === level ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {l}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Goals</p>
            <div className="flex flex-wrap gap-2">
              {sports.goals.map((g) => (
                <Chip key={g} selected={goals.includes(g)} onClick={() => toggleGoal(g)} accent={ACCENT}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Wearables & apps",
      description: "Connect what you already use so matches and runs log themselves.",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          {sports.apps.map((a) => {
            const isSource = SOURCE_IDS.includes(a.id as SourceId);
            const on = isSource ? sources[a.id as SourceId] : courtApp;
            return (
              <label
                key={a.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors",
                  on ? "bg-[#f1f7f5]" : "bg-card hover:bg-secondary/50"
                )}
                style={{ borderColor: on ? `${ACCENT}66` : undefined }}
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-muted-foreground">
                  {a.label.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{a.label}</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={String(on)}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex items-center gap-1 text-xs", on ? "text-[#2f6f5f]" : "text-muted-foreground")}
                    >
                      {on ? (
                        <>
                          <CheckCircle2 className="size-3.5" /> Connected
                        </>
                      ) : (
                        "Not connected"
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => (isSource ? toggleSource(a.id as SourceId, v) : setCourtApp(v))}
                  style={{ backgroundColor: on ? ACCENT : undefined }}
                />
              </label>
            );
          })}
        </div>
      ),
    },
    {
      title: "Schedule",
      description: "When you're usually free to play. We'll plan around it.",
      content: (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <Chip key={d} selected={days.includes(d)} onClick={() => toggleDay(d)} accent={ACCENT}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Times</p>
            <div className="flex flex-wrap gap-2">
              {["Early morning", "Lunchtime", "Evening", "Late night"].map((t) => (
                <Chip key={t} selected={times.includes(t)} onClick={() => toggleTime(t)} accent={ACCENT}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Indoor or outdoor?</p>
            <div className="flex flex-wrap gap-2">
              {(["Indoor", "Outdoor", "Both"] as const).map((s) => (
                <Chip key={s} selected={setting === s} onClick={() => setSetting(s)} accent={ACCENT}>
                  {s}
                </Chip>
              ))}
            </div>
            {setting !== "Indoor" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#fff8ee] p-3 text-sm text-[#7a4608]"
              >
                <Sun className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Climate-aware:</strong> outdoor sessions are shifted to evenings May–Sep, and moved indoors when
                  the heat index passes 40°C.
                </span>
              </motion.div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const signedUp = signedUpEvents.includes("ev-1");
  const timeline: TimelineItem[] = sports.timeline
    .filter((t) => (mode === "active" ? true : t.status === "upcoming" && t.id === "sp-1"))
    .filter((t) => signedUp || t.id !== "sp-2")
    .map((t) =>
      t.id === "sp-1" && !signedUp
        ? { ...t, title: "Riyadh Padel Open — registration closes Thu", detail: "Amateur · Men's C · SAR 250", tag: "Event" }
        : t
    );

  return (
    <SpokeShell
      spokeId="sports"
      wizardSteps={wizardSteps}
      tabs={{
        today: <SportsToday />,
        timeline: <Timeline items={timeline} accent={ACCENT} />,
        progress: <SportsProgress />,
        experts: (
          <ExpertsTab
            spokeId="sports"
            intro="Sport-specific coaches — certified padel coaches at your clubs, and running coaches who know the heat."
          />
        ),
      }}
    />
  );
}

function SportsToday() {
  const { mode, signedUpEvents, signUpEvent } = useDemo();
  const router = useRouter();
  const goToTab = useGoToTab();
  const [confirming, setConfirming] = React.useState<SportEvent | null>(null);
  const [justSigned, setJustSigned] = React.useState<SportEvent | null>(null);
  const [freq, setFreq] = React.useState(2);
  const [booking, setBooking] = React.useState<Expert | null>(null);
  const eventsRef = React.useRef<HTMLDivElement>(null);

  const coaches = experts.filter((e) => e.spoke === "sports").slice(0, 2);
  const padelVenues = venues.filter((v) => /padel|running/i.test(v.kind));
  const active = mode === "active";
  const signedUpOpen = signedUpEvents.includes("ev-1");

  const confirm = () => {
    if (!confirming) return;
    signUpEvent(confirming.id);
    setJustSigned(confirming);
    setConfirming(null);
    toast.success(`You're in: ${confirming.name}`, {
      description: `An ${confirming.buildPlanWeeks ?? 8}-week build plan has been added to Train.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Plan-added banner */}
      <AnimatePresence>
        {justSigned && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-[#f3d3a6] bg-[#fff8ee] p-4 sm:flex-row sm:items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-attn-warn text-white">
                <Sparkles className="size-5" />
              </span>
              <div className="flex-1 text-[#7a4608]">
                <p className="font-semibold">
                  An {justSigned.buildPlanWeeks ?? 8}-week build plan has been added to Train.
                </p>
                <p className="text-sm text-[#8a5a1c]">
                  Sports → Train: strength, agility and match-play blocks, tapering the week of {justSigned.date}.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push("/train")}>
                  Open Train
                </Button>
                <Button size="sm" className="bg-attn-warn text-white hover:bg-attn-warn/90" onClick={() => router.push("/")}>
                  See it on the hub <ArrowRight />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today */}
      <section>
        <SectionTitle>Today</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {active ? (
            sports.today.map((t) => (
              <div key={t.id} className="flex gap-4 rounded-2xl border bg-card p-4">
                <div
                  className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Clock className="size-4 opacity-80" />
                  <span className="mt-1 text-sm font-semibold">{t.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast("Directions sent to your phone (demo)")}>
                      <Navigation /> Directions
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast("Invite link copied (demo)")}>
                      <UserPlus /> Invite a sub
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-card/60 p-4 text-sm text-muted-foreground">
              Nothing booked yet. Pick a venue below or book a session with a coach to get started.
            </div>
          )}

          {!signedUpOpen ? (
            <button
              type="button"
              onClick={() => eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex gap-4 rounded-2xl border border-[#c3dafa] bg-[#f1f6fd] p-4 text-left transition hover:bg-[#e8f1fc]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-attn-opportunity text-white">
                <Sparkles className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-wider text-[#2f6fbf] uppercase">Opportunity</span>
                <span className="block font-semibold text-[#173e70]">Registration for Riyadh Padel Open closes Thursday</span>
                <span className="block text-sm text-[#3f5f86]">Men&apos;s C fits your level. 11 of 32 spots left.</span>
              </span>
              <ArrowRight className="size-4 self-center text-[#2f6fbf]" />
            </button>
          ) : (
            <div className="flex gap-4 rounded-2xl border bg-card p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-attn-done text-white">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <div>
                <p className="font-semibold">Registered: Riyadh Padel Open</p>
                <p className="text-sm text-muted-foreground">Sat 21 Nov · 8 weeks to go · plan running in Train</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events */}
      <section ref={eventsRef} className="scroll-mt-20">
        <SectionTitle>Events near you</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((ev) => {
            const registered = signedUpEvents.includes(ev.id);
            const [dow, day, month] = ev.date.split(" ");
            return (
              <motion.div
                key={ev.id}
                layout
                className={cn(
                  "flex gap-4 rounded-2xl border bg-card p-4 transition-colors",
                  registered && "border-[#bfe3cc] bg-[#f5fbf7]"
                )}
              >
                <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">{dow}</span>
                  <span className="text-xl leading-none font-semibold">{day}</span>
                  <span className="text-[11px] font-medium text-muted-foreground">{month}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{ev.name}</p>
                    {ev.closes && !registered && (
                      <span className="shrink-0 rounded-full bg-[#e8f1fc] px-2 py-0.5 text-[11px] font-semibold text-[#1f5fae]">
                        Closes {ev.closes}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <MapPin className="mr-1 inline size-3.5 -translate-y-px" />
                    {ev.city} · {ev.sport} · {ev.category}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      <span className="text-xs font-medium text-muted-foreground">SAR </span>
                      {ev.priceSar}
                    </span>
                    {registered ? (
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#277a4a]">
                        <CheckCircle2 className="size-4" /> Registered
                      </span>
                    ) : ev.cta === "Get tickets" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success("Tickets reserved", { description: `${ev.name} · ${ev.date}. (Demo — no payment taken.)` })
                        }
                      >
                        <Ticket /> Get tickets
                      </Button>
                    ) : (
                      <Button size="sm" style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90" onClick={() => setConfirming(ev)}>
                        Sign up
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Coaching */}
      <section>
        <SectionTitle
          action={
            <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => goToTab("experts")}>
              All coaches <ArrowRight />
            </Button>
          }
        >
          Coaching
        </SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-sm font-medium">How often?</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 4].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFreq(f)}
                  className={cn(
                    "rounded-xl border py-3 text-center transition-colors",
                    freq === f ? "text-white" : "bg-card hover:bg-secondary"
                  )}
                  style={{ backgroundColor: freq === f ? ACCENT : undefined, borderColor: freq === f ? ACCENT : undefined }}
                >
                  <span className="block text-lg font-semibold">{f}x</span>
                  <span className={cn("text-xs", freq === f ? "text-white/80" : "text-muted-foreground")}>per month</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              ≈ <span className="font-semibold text-foreground">SAR {(freq * 315).toLocaleString()}</span> / month with a
              Level 2+ padel coach. {freq === 4 && "Recommended for tournament prep."}
            </p>
            <p className="mt-4 mb-2 text-sm font-medium">Locations</p>
            <ul className="divide-y">
              {padelVenues.map((v) => (
                <li key={v.id} className="flex items-center gap-2 py-2 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 font-medium">{v.name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{v.setting}</span>
                  <span className="w-14 text-right text-muted-foreground tabular-nums">{v.distanceKm} km</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4">
            {coaches.map((c) => (
              <ExpertCard key={c.id} expert={c} accent={ACCENT} onBook={() => setBooking(c)} />
            ))}
          </div>
        </div>
      </section>

      <SlotPicker expert={booking} accent={ACCENT} onClose={() => setBooking(null)} />

      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          {confirming && (
            <>
              <DialogHeader>
                <DialogTitle>Sign up for {confirming.name}?</DialogTitle>
                <DialogDescription>
                  {confirming.date} · {confirming.city} · {confirming.category}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-xl bg-secondary/70 p-4 text-sm">
                <Row label="Entry fee" value={`SAR ${confirming.priceSar}`} />
                <Row label="Partner" value="Majed (invited)" />
                <Row label="Build plan" value={`${confirming.buildPlanWeeks ?? 8} weeks, added to Train`} />
              </div>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <CalendarDays className="mt-px size-3.5 shrink-0" />
                Health OS will plan backwards from event day: strength and agility first, match play next, then a taper.
              </p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConfirming(null)}>
                  Not now
                </Button>
                <Button style={{ backgroundColor: ACCENT }} className="text-white hover:opacity-90" onClick={confirm}>
                  Confirm sign-up
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SportsProgress() {
  const { mode } = useDemo();
  if (mode !== "active") {
    return (
      <div className="rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
        <p className="font-semibold">Play a few sessions to see your progress</p>
        <p className="mt-1 text-sm text-muted-foreground">Matches from Garmin or Strava will show up here automatically.</p>
      </div>
    );
  }
  const wins = sports.matches.filter((m) => m.result === "W").length;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid grid-cols-3 gap-3 lg:col-span-2">
        <StatCard label="Win rate · last 5" value={`${Math.round((wins / sports.matches.length) * 100)}%`} hint={`${wins}W – ${sports.matches.length - wins}L`} />
        <StatCard label="Sessions / week" value="2.2" hint="Target 3 for tournament" tone="warn" />
        <StatCard label="Weeks to event" value="8" hint="Riyadh Padel Open" />
      </div>
      <div className="rounded-3xl border bg-card p-5">
        <SectionTitle>Sessions per week</SectionTitle>
        <BarChart
          labels={sports.sessionsPerWeek.weeks}
          series={[{ id: "sessions", label: "Sessions", values: sports.sessionsPerWeek.values, color: ACCENT }]}
          highlightLast
        />
      </div>
      <div className="rounded-3xl border bg-card p-5">
        <SectionTitle>Match history</SectionTitle>
        <ul className="divide-y">
          {sports.matches.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  m.result === "W" ? "bg-[#e7f5ec] text-[#277a4a]" : "bg-secondary text-muted-foreground"
                )}
              >
                {m.result}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">vs. {m.opponents}</span>
                <span className="block text-xs text-muted-foreground">
                  {m.date} · slept {m.sleep}
                </span>
              </span>
              <span className="font-medium tabular-nums">{m.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-2">
        <InsightCard
          title="Your second-set performance drops after nights under 6h sleep."
          body="Both losses this month followed short nights — you won 71% of second-set games when you slept 7h+, and 38% under 6h. Sleep is now feeding your match-day plan."
        />
      </div>
      <p className="text-xs text-muted-foreground lg:col-span-2">
        Match data from Garmin · <Link href="/profile" className="underline">manage connections</Link>
      </p>
    </div>
  );
}
