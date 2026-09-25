"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarClock, LineChart, ListChecks, Power, PowerOff, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";

import { AttentionChip } from "@/components/attention-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSpoke } from "@/lib/data";
import { useDemo, useSpokeState } from "@/lib/demo-context";
import { NamedIcon } from "@/lib/icons";
import type { SpokeId } from "@/types";
import { ComingSoon } from "./coming-soon";
import { Wizard, type WizardStep } from "./wizard";

export type SpokeTabs = {
  today: React.ReactNode;
  timeline?: React.ReactNode;
  progress?: React.ReactNode;
  experts?: React.ReactNode;
};

export function SpokeShell({
  spokeId,
  wizardSteps,
  tabs,
  todayLabel = "Today",
  onFinish,
}: {
  spokeId: SpokeId;
  onFinish?: () => void;
  wizardSteps?: WizardStep[];
  tabs: SpokeTabs;
  todayLabel?: string;
}) {
  const spoke = getSpoke(spokeId);
  const state = useSpokeState(spokeId);
  const { markSetUp, setDisabled } = useDemo();
  const [rerun, setRerun] = React.useState(false);
  const [tab, setTab] = React.useState("today");

  const off = state.status === "off";
  const showWizard = !off && !!wizardSteps && (state.status === "not_set_up" || rerun);

  const finish = () => {
    markSetUp(spokeId);
    onFinish?.();
    setRerun(false);
    setTab("today");
    toast.success(`${spoke.label} is set up`, {
      description: "Your daily view is ready — and the hub has been updated.",
    });
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:pt-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href="/" aria-label="Back to hub">
            <ArrowLeft />
          </Link>
        </Button>
        <motion.span
          layoutId={`spoke-icon-${spokeId}`}
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: state.status === "active" ? spoke.accent : "#9aa4ae" }}
        >
          <NamedIcon name={spoke.icon} className="size-6" strokeWidth={1.8} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{spoke.label}</h1>
            <AttentionChip state={showWizard ? { status: "not_set_up", tooltip: [] } : state} />
          </div>
          <p className="truncate text-sm text-muted-foreground">{spoke.tagline}</p>
        </div>
        {spokeId !== "profile" && state.status !== "off" && !rerun && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setDisabled(spokeId, true);
              toast(`${spoke.label} turned off`, {
                description: "Greyed out on your hub. Turn it back on here or from the hub.",
                action: { label: "Undo", onClick: () => setDisabled(spokeId, false) },
              });
            }}
          >
            <PowerOff /> Turn off
          </Button>
        )}
        {wizardSteps && state.status === "active" && !rerun && (
          <Button variant="ghost" size="sm" onClick={() => setRerun(true)} className="text-muted-foreground">
            <RotateCcw /> Re-run setup
          </Button>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <AnimatePresence mode="wait" initial={false}>
          {off ? (
            <motion.div
              key="off"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <PowerOff className="size-5" />
              </span>
              <p className="mt-3 text-lg font-semibold">{spoke.label} is turned off</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                It&apos;s greyed out on your hub, and its items, data and signals are paused. Turn it back on any time.
              </p>
              <Button
                className="mt-5"
                onClick={() => {
                  setDisabled(spokeId, false);
                  toast.success(`${spoke.label} is back on`);
                }}
              >
                <Power /> Turn {spoke.label} back on
              </Button>
            </motion.div>
          ) : showWizard ? (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Wizard steps={wizardSteps!} accent={spoke.accent} onFinish={finish} />
              {rerun && (
                <div className="mt-3 text-center">
                  <Button variant="link" size="sm" onClick={() => setRerun(false)} className="text-muted-foreground">
                    Cancel and return to daily view
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="today">
                    <ListChecks /> {todayLabel}
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <CalendarClock /> Timeline
                  </TabsTrigger>
                  <TabsTrigger value="progress">
                    <LineChart /> Progress
                  </TabsTrigger>
                  <TabsTrigger value="experts">
                    <Users /> Experts
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="today">
                  <SpokeTabContext.Provider value={setTab}>{tabs.today}</SpokeTabContext.Provider>
                </TabsContent>
                <TabsContent value="timeline">{tabs.timeline ?? <ComingSoon what="Timeline" />}</TabsContent>
                <TabsContent value="progress">{tabs.progress ?? <ComingSoon what="Progress" />}</TabsContent>
                <TabsContent value="experts">{tabs.experts ?? <ComingSoon what="Experts" />}</TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

const SpokeTabContext = React.createContext<(tab: string) => void>(() => {});

/** Lets Today-tab content jump to another tab (e.g. "See coaches" → Experts). */
export function useGoToTab() {
  return React.useContext(SpokeTabContext);
}
