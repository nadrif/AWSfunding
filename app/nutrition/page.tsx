"use client";

import { AnimatePresence, motion } from "motion/react";
import { Droplets, Moon, Sunrise, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { SectionTitle } from "@/components/spoke/bits";
import { ExpertsTab } from "@/components/spoke/experts-tab";
import { useQuickWizard } from "@/components/spoke/quick-wizard";
import { SpokeShell } from "@/components/spoke/spoke-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getSpoke } from "@/lib/data";
import { useDemo } from "@/lib/demo-context";

const spoke = getSpoke("nutrition");

export default function NutritionPage() {
  const wizardSteps = useQuickWizard(
    [
      { title: "Your goal", description: "We'll set daily targets from this.", options: ["Fuel performance", "Lose fat", "Build muscle", "Eat more consistently"], initial: ["Fuel performance"] },
      { title: "How you eat", description: "Pick anything that applies.", options: ["Home-cooked", "Eat out often", "Meal-prep service", "Vegetarian", "Dairy-free", "No restrictions"], multi: true, initial: ["Home-cooked"] },
      { title: "Ramadan", description: "Should we switch to suhoor / iftar timing automatically during Ramadan?", options: ["Yes, switch automatically", "Ask me each year", "No"], initial: ["Yes, switch automatically"] },
    ],
    spoke.accent
  );
  return (
    <SpokeShell
      spokeId="nutrition"
      wizardSteps={wizardSteps}
      tabs={{
        today: <NutritionToday />,
        experts: <ExpertsTab spokeId="nutrition" intro="Dietitians and sports nutritionists — including Ramadan planning for training through the fast." />,
      }}
    />
  );
}

function NutritionToday() {
  const { mode, ramadan, setRamadan, setUp } = useDemo();
  const fresh = mode === "new" && setUp.nutrition;
  const f = fresh ? 0 : 1;

  const targets = [
    { id: "protein", label: "Protein", value: 98 * f, target: 150, unit: "g", color: "#a1885a" },
    { id: "calories", label: "Calories", value: 1840 * f, target: 2600, unit: "kcal", color: "#c4744f" },
    {
      id: "hydration",
      label: ramadan ? "Hydration · iftar→suhoor" : "Hydration",
      value: (ramadan ? 1.2 : 1.8) * f,
      target: 3,
      unit: "L",
      color: "#2a78d6",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#f3eee4] text-[#8a7040]">
            <Moon className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Ramadan mode</p>
            <p className="text-sm text-muted-foreground">
              {ramadan ? "Targets split across suhoor and iftar. Training moved after iftar." : "Switch meal timing to suhoor and iftar."}
            </p>
          </div>
        </div>
        <Switch checked={ramadan} onCheckedChange={setRamadan} style={{ backgroundColor: ramadan ? spoke.accent : undefined }} />
      </div>

      <section>
        <SectionTitle>Today&apos;s targets</SectionTitle>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {targets.map((t) => (
            <Ring key={t.id} {...t} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>{ramadan ? "Suggested for tonight" : "Suggested next meal"}</SectionTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key={String(ramadan)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {ramadan ? (
              <>
                <Meal
                  icon={<Sunrise />}
                  when="Suhoor · 3:45am"
                  name="Ful medames, two eggs, whole-wheat khubz & laban"
                  macros="38g protein · 720 kcal · slow-release carbs"
                  note="Add 500ml water with a pinch of salt before the fajr cut-off."
                />
                <Meal
                  icon={<Moon />}
                  when="Iftar · 6:12pm"
                  name="3 dates + water, lentil shorba, then grilled hammour with rice & salad"
                  macros="46g protein · 890 kcal"
                  note="Padel moved to 9:30pm — 3 hours after iftar."
                />
              </>
            ) : (
              <>
                <Meal
                  icon={<UtensilsCrossed />}
                  when="Lunch · 1:30pm"
                  name="Chicken kabsa with brown rice, daqoos & cucumber-laban salad"
                  macros="44g protein · 780 kcal"
                  note="Carbs front-loaded for tonight's 7pm padel."
                />
                <Meal
                  icon={<Droplets />}
                  when="Pre-padel · 5:30pm"
                  name="Laban, a handful of dates & 750ml water with electrolytes"
                  macros="12g protein · 310 kcal"
                  note="Evening heat index 38°C — top up fluids before you play."
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

function Ring({ label, value, target, unit, color }: { label: string; value: number; target: number; unit: string; color: string }) {
  const pct = Math.min(value / target, 1);
  const r = 42;
  const c = 2 * Math.PI * r;
  const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1).replace(/\.0$/, ""));
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card p-3 sm:p-5">
      <div className="relative w-full max-w-[120px]">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx={50} cy={50} r={r} fill="none" stroke="#eef0f2" strokeWidth={9} />
          <motion.circle
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold tabular-nums sm:text-xl">{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium sm:text-sm">{label}</p>
      <p className="text-center text-[11px] text-muted-foreground sm:text-xs">
        {fmt(value)} / {fmt(target)} {unit}
      </p>
    </div>
  );
}

function Meal({ icon, when, name, macros, note }: { icon: React.ReactNode; when: string; name: string; macros: string; note: string }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase [&_svg]:size-3.5">
        {icon} {when}
      </p>
      <p className="mt-2 font-semibold">{name}</p>
      <p className="text-sm text-muted-foreground">{macros}</p>
      <p className="mt-2 text-sm text-[#8a7040]">{note}</p>
      <div className="mt-auto flex gap-2 pt-4">
        <Button size="sm" variant="outline" onClick={() => toast.success("Logged (demo)")}>
          Log it
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast("Swapped for a similar option (demo)")}>
          Swap
        </Button>
      </div>
    </div>
  );
}
