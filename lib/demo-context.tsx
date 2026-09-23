"use client";

import * as React from "react";

import { connections, getSpoke, sourceName, spokes } from "@/lib/data";
import type {
  ConnectionType,
  DemoMode,
  SourceId,
  SpokeId,
  SpokeState,
} from "@/types";

type Sources = Record<SourceId, boolean>;

const DEFAULT_SOURCES: Record<DemoMode, Sources> = {
  new: { apple_health: false, garmin: false, oura: false, whoop: false, strava: false },
  active: { apple_health: true, garmin: true, oura: true, whoop: false, strava: false },
};

type DemoContextValue = {
  mode: DemoMode;
  setMode: (mode: DemoMode) => void;
  sources: Sources;
  toggleSource: (id: SourceId, on?: boolean) => void;
  setUp: Partial<Record<SpokeId, boolean>>;
  markSetUp: (id: SpokeId) => void;
  signedUpEvents: string[];
  signUpEvent: (id: string) => void;
  /** Connection id to spotlight on the hub (e.g. after an event sign-up) */
  freshSignal: string | null;
  clearFreshSignal: () => void;
  ramadan: boolean;
  setRamadan: (on: boolean) => void;
  tourStep: number | null;
  setTourStep: (step: number | null) => void;
};

const DemoContext = React.createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<DemoMode>("active");
  const [sources, setSources] = React.useState<Sources>(DEFAULT_SOURCES.active);
  const [setUp, setSetUp] = React.useState<Partial<Record<SpokeId, boolean>>>({});
  const [signedUpEvents, setSignedUpEvents] = React.useState<string[]>([]);
  const [freshSignal, setFreshSignal] = React.useState<string | null>(null);
  const [ramadan, setRamadan] = React.useState(false);
  const [tourStep, setTourStep] = React.useState<number | null>(null);

  const setMode = React.useCallback((next: DemoMode) => {
    setModeState(next);
    setSources(DEFAULT_SOURCES[next]);
    setSetUp({});
    setSignedUpEvents([]);
    setFreshSignal(null);
  }, []);

  const toggleSource = React.useCallback((id: SourceId, on?: boolean) => {
    setSources((prev) => ({ ...prev, [id]: on ?? !prev[id] }));
  }, []);

  const markSetUp = React.useCallback((id: SpokeId) => {
    setSetUp((prev) => ({ ...prev, [id]: true }));
  }, []);

  const signUpEvent = React.useCallback((id: string) => {
    setSignedUpEvents((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setFreshSignal("sports-train");
  }, []);

  const value = React.useMemo<DemoContextValue>(
    () => ({
      mode,
      setMode,
      sources,
      toggleSource,
      setUp,
      markSetUp,
      signedUpEvents,
      signUpEvent,
      freshSignal,
      clearFreshSignal: () => setFreshSignal(null),
      ramadan,
      setRamadan,
      tourStep,
      setTourStep,
    }),
    [mode, setMode, sources, toggleSource, setUp, markSetUp, signedUpEvents, signUpEvent, freshSignal, ramadan, tourStep]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = React.useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}

/** Resolve a spoke's state from mode, session setup and connected sources. */
export function resolveSpokeState(
  id: SpokeId,
  ctx: Pick<DemoContextValue, "mode" | "setUp" | "sources" | "signedUpEvents">
): SpokeState {
  const spoke = getSpoke(id);
  const base = spoke.states[ctx.mode];
  let state: SpokeState =
    base.status === "not_set_up" && ctx.setUp[id] ? spoke.freshlySetUp : base;

  if (id === "profile") {
    const connected = (Object.keys(ctx.sources) as SourceId[]).filter((s) => ctx.sources[s]);
    state = {
      ...state,
      tooltip: connected.length
        ? [
            `${connected.length} source${connected.length > 1 ? "s" : ""} connected`,
            connected.map(sourceName).join(", "),
          ]
        : state.tooltip,
    };
  }

  if (id === "sleep" && ctx.mode === "active" && !ctx.sources.oura && !ctx.sources.whoop) {
    state = { ...state, tooltip: ["No sleep source connected", "Reconnect Oura in Profile"] };
  }

  if (id === "train" && ctx.signedUpEvents.length > 0 && state.status === "active") {
    state = {
      ...state,
      attention: { type: "due", count: 3, label: "3 today" },
      tooltip: ["New: 8-week padel build plan", ...state.tooltip.slice(0, 2)],
    };
  }

  if (id === "sports" && ctx.signedUpEvents.includes("ev-1") && state.status === "active") {
    state = {
      ...state,
      attention: { type: "due", count: 1, label: "1 today" },
      tooltip: ["Padel session 7:00pm — Court 3, Nakheel Padel Club", "Registered: Riyadh Padel Open ✓"],
    };
  }

  return state;
}

export function useSpokeState(id: SpokeId): SpokeState {
  const ctx = useDemo();
  return resolveSpokeState(id, ctx);
}

export type EffectiveConnection = {
  id: string;
  from: SpokeId;
  to: SpokeId;
  type: ConnectionType;
  label: string;
  reason?: string;
};

/** Connections to draw on the hub given the current demo state. */
export function useEffectiveConnections(): EffectiveConnection[] {
  const ctx = useDemo();
  return React.useMemo(() => {
    const status = Object.fromEntries(
      spokes.map((s) => [s.id, resolveSpokeState(s.id, ctx).status])
    ) as Record<SpokeId, SpokeState["status"]>;

    const out: EffectiveConnection[] = [];
    for (const c of connections) {
      if (!c.visibleIn.includes(ctx.mode)) continue;
      if (c.requires === "event_signup" && ctx.signedUpEvents.length === 0) continue;

      if (c.type === "signal") {
        if (status[c.from] !== "active" || status[c.to] !== "active") continue;
        out.push({ id: c.id, from: c.from, to: c.to, type: "signal", label: c.label, reason: c.reason });
        continue;
      }

      const liveSources = (c.sources ?? []).filter((s) => ctx.sources[s]);
      const live = c.sources ? liveSources.length > 0 : status[c.to] === "active";
      out.push({
        id: c.id,
        from: c.from,
        to: c.to,
        type: live ? "data" : "potential",
        label: live
          ? c.sources
            ? `${liveSources.map(sourceName).join(" + ")} → ${c.label}`
            : c.label
          : (c.potentialLabel ?? c.label),
      });
    }
    return out;
    // ctx fields listed explicitly so the memo tracks the parts that matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.mode, ctx.sources, ctx.setUp, ctx.signedUpEvents]);
}
