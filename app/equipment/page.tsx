"use client";

import { Building2, Home, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SectionTitle } from "@/components/spoke/bits";
import { ComingSoon } from "@/components/spoke/coming-soon";
import { useQuickWizard } from "@/components/spoke/quick-wizard";
import { SpokeShell } from "@/components/spoke/spoke-shell";
import { Button } from "@/components/ui/button";
import { getSpoke } from "@/lib/data";

const spoke = getSpoke("equipment");

const ACCESS = [
  { where: "Home", icon: Home, items: ["Adjustable dumbbells 2–24kg", "Foam roller", "Resistance bands", "Yoga mat", "Pull-up bar"] },
  { where: "Gym · Fitness Time, Al Olaya", icon: Building2, items: ["Full free weights", "Trap bar", "Assault bike", "Cable stack", "Sauna"] },
];

const RECOMMENDED = [
  { name: "Padel balls, pressurised · 3-pack", why: "You're through a tin a week", price: 35 },
  { name: "Massage gun, compact", why: "Hamstring soreness trending up", price: 449 },
  { name: "Nordic curl strap", why: "In your 8-week build plan", price: 129 },
  { name: "Cooling towel", why: "Evening heat index above 36°C", price: 45 },
];

export default function EquipmentPage() {
  const wizardSteps = useQuickWizard(
    [
      { title: "Where you train", description: "So plans only use what you can reach.", options: ["Home", "Commercial gym", "Compound gym", "Club / academy"], multi: true, initial: ["Home", "Commercial gym"] },
      { title: "What's at home", description: "Tap everything you have.", options: ["Dumbbells", "Kettlebell", "Bands", "Foam roller", "Pull-up bar", "Bench", "Bike / treadmill", "Nothing yet"], multi: true, initial: ["Dumbbells", "Bands"] },
      { title: "Recommendations", description: "Want suggestions for kit that would help?", options: ["Yes, within budget", "Only essentials", "Not now"], initial: ["Only essentials"] },
    ],
    spoke.accent
  );

  return (
    <SpokeShell
      spokeId="equipment"
      wizardSteps={wizardSteps}
      tabs={{
        today: <EquipmentToday />,
        experts: <ComingSoon what="Experts" note="Kit fitting and racket specialists are planned for a later version." />,
      }}
    />
  );
}

function EquipmentToday() {
  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>What you have access to</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {ACCESS.map((a) => (
            <div key={a.where} className="rounded-2xl border bg-card p-4">
              <p className="flex items-center gap-2 font-semibold">
                <a.icon className="size-4 text-muted-foreground" /> {a.where}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.items.map((i) => (
                  <span key={i} className="rounded-full border bg-secondary/60 px-2.5 py-1 text-xs font-medium">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Recommended for you</SectionTitle>
        <ul className="divide-y rounded-2xl border bg-card">
          {RECOMMENDED.map((r) => (
            <li key={r.name} className="flex items-center gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: spoke.accent }}>
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.why}</p>
              </div>
              <span className="text-right font-semibold whitespace-nowrap">
                <span className="text-xs font-medium text-muted-foreground">SAR </span>
                {r.price}
              </span>
              <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => toast("Saved to your list (demo)")}>
                Save
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-4 rounded-2xl border border-dashed bg-card/60 p-5">
        <ShoppingBag className="size-6 text-muted-foreground" />
        <div>
          <p className="font-semibold">Shop — coming later</p>
          <p className="text-sm text-muted-foreground">Buy recommended kit from local retailers, delivered same-day in Riyadh and Jeddah.</p>
        </div>
      </div>
    </div>
  );
}
