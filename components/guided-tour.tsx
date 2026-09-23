"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useDemo } from "@/lib/demo-context";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    route: "/",
    title: "The hub is home",
    body: "Health OS is where Faisal lands every day. Seven spokes orbit the core — each one an area of his health.",
  },
  {
    route: "/",
    title: "Attention at a glance",
    body: "Badges and rings show what needs him today: Train has 2 due, Sleep is pulsing amber for sleep debt, Sports has an event closing soon, Equipment is done.",
  },
  {
    route: "/",
    title: "Beams carry meaning",
    body: "Teal beams are data from his devices. Amber beams are signals — short sleep just adjusted today's training. Hover any spoke or beam to focus it.",
  },
  {
    route: "/sports",
    title: "Sports: sign up for an event",
    body: "Scroll to Events and sign up for the Riyadh Padel Open. An 8-week build plan lands in Train — and a new signal beam appears on the hub.",
  },
  {
    route: "/recovery",
    title: "Recovery: where does it hurt?",
    body: "Tap the body map to log soreness. The heatmap drives today's suggestion — push the right hamstring to 3 to see an escalation to a physio.",
  },
];

export function GuidedTour() {
  const { tourStep, setTourStep } = useDemo();
  const router = useRouter();
  const pathname = usePathname();

  const go = (i: number) => {
    setTourStep(i);
    if (STEPS[i].route !== pathname) router.push(STEPS[i].route);
  };

  const step = tourStep !== null ? STEPS[tourStep] : null;

  return (
    <AnimatePresence>
      {step && tourStep !== null && (
        <motion.div
          key="tour"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-md sm:bottom-6"
        >
          <div className="rounded-2xl bg-foreground p-4 text-background shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-background/60 uppercase">
                Guided demo · {tourStep + 1} / {STEPS.length}
              </span>
              <button type="button" onClick={() => setTourStep(null)} aria-label="Close tour" className="opacity-60 hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tourStep}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <p className="mt-2 font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-background/75">{step.body}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === tourStep ? "w-5 bg-background" : "w-1.5 bg-background/30"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {tourStep > 0 && (
                  <Button size="sm" variant="ghost" className="text-background hover:bg-background/10 hover:text-background" onClick={() => go(tourStep - 1)}>
                    <ArrowLeft /> Back
                  </Button>
                )}
                {tourStep < STEPS.length - 1 ? (
                  <Button size="sm" className="bg-background text-foreground hover:bg-background/90" onClick={() => go(tourStep + 1)}>
                    Next <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-background text-foreground hover:bg-background/90"
                    onClick={() => {
                      setTourStep(null);
                      router.push("/");
                    }}
                  >
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
