import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TimelineItem } from "@/types";

const GROUPS: { status: TimelineItem["status"]; label: string }[] = [
  { status: "upcoming", label: "Upcoming" },
  { status: "today", label: "Today" },
  { status: "past", label: "Past" },
];

export function Timeline({ items, accent }: { items: TimelineItem[]; accent: string }) {
  return (
    <div className="rounded-3xl border bg-card p-5 sm:p-7">
      {GROUPS.map((g) => {
        const group = items.filter((i) => i.status === g.status);
        if (!group.length) return null;
        return (
          <section key={g.status} className="mb-2 last:mb-0">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{g.label}</h3>
            <ol className="relative ml-2 border-l-2 border-dashed border-border pb-4">
              {group.map((item) => (
                <li key={item.id} className="relative mb-5 pl-6 last:mb-0">
                  <span
                    className={cn(
                      "absolute top-1 -left-[9px] flex size-4 items-center justify-center rounded-full border-2 bg-card",
                      item.status === "past" && "border-transparent bg-muted-foreground/30"
                    )}
                    style={{
                      borderColor: item.status !== "past" ? accent : undefined,
                      backgroundColor: item.status === "today" ? accent : undefined,
                    }}
                  >
                    {item.status === "past" && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  {item.status === "today" && (
                    <span
                      className="absolute top-1 -left-[9px] size-4 animate-ping rounded-full opacity-30"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className={cn("font-medium", item.status === "past" && "text-muted-foreground")}>{item.title}</p>
                    {item.tag && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{item.when}</p>
                  {item.detail && <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
