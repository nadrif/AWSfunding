"use client";

import * as React from "react";
import { BadgeCheck, MapPin, Star, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { experts as allExperts, getSpoke } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Expert, SpokeId } from "@/types";

const DAYS = ["Today", "Thu 24", "Fri 25", "Sat 26", "Sun 27"];
const SLOTS: Record<string, string[]> = {
  Today: ["8:00pm", "9:00pm"],
  "Thu 24": ["6:00am", "7:00am", "5:30pm", "8:30pm"],
  "Fri 25": ["4:00pm", "6:00pm", "9:30pm"],
  "Sat 26": ["7:00am", "10:00am", "5:00pm", "8:30pm"],
  "Sun 27": ["6:30am", "6:00pm", "7:30pm"],
};

export function ExpertsTab({ spokeId, intro }: { spokeId: SpokeId; intro?: string }) {
  const spoke = getSpoke(spokeId);
  const list = allExperts.filter((e) => e.spoke === spokeId);
  const [booking, setBooking] = React.useState<Expert | null>(null);

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        {intro ?? "When you want a human in the loop. Vetted experts near you, bookable in a couple of taps."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((e) => (
          <ExpertCard key={e.id} expert={e} accent={spoke.accent} onBook={() => setBooking(e)} />
        ))}
      </div>
      <SlotPicker expert={booking} accent={spoke.accent} onClose={() => setBooking(null)} />
    </div>
  );
}

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function ExpertCard({
  expert,
  accent,
  onBook,
  compact = false,
}: {
  expert: Expert;
  accent: string;
  onBook: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
      <div className="flex gap-3">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          {initials(expert.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-semibold">
            <span className="truncate">{expert.name}</span>
            <BadgeCheck className="size-4 shrink-0 text-attn-opportunity" />
          </p>
          <p className="text-sm text-muted-foreground">{expert.speciality}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {expert.online ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
            {expert.location}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            <span className="text-xs font-medium text-muted-foreground">SAR </span>
            {expert.priceSar}
          </p>
          <p className="text-xs text-muted-foreground">/ {expert.unit}</p>
        </div>
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          {expert.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{expert.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({expert.reviews})</span>
        </span>
        <Button size="sm" variant="outline" onClick={onBook}>
          View availability
        </Button>
      </div>
    </div>
  );
}

export function SlotPicker({
  expert,
  accent,
  onClose,
}: {
  expert: Expert | null;
  accent: string;
  onClose: () => void;
}) {
  const [day, setDay] = React.useState(DAYS[1]);

  return (
    <Dialog open={!!expert} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {expert && (
          <>
            <DialogHeader>
              <DialogTitle>Book {expert.name}</DialogTitle>
              <DialogDescription>
                {expert.speciality} · SAR {expert.priceSar} / {expert.unit}
              </DialogDescription>
            </DialogHeader>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    d === day ? "text-white" : "bg-card hover:bg-secondary"
                  )}
                  style={{ backgroundColor: d === day ? accent : undefined, borderColor: d === day ? accent : undefined }}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS[day].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    toast.success(`Booked with ${expert.name}`, {
                      description: `${day === "Today" ? "Today" : day} at ${s} · ${expert.location}. (Demo — no booking made.)`,
                    });
                    onClose();
                  }}
                  className="rounded-xl border bg-card py-2.5 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Free cancellation up to 12 hours before. Pay after the session.</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
