import spokesJson from "@/data/spokes.json";
import connectionsJson from "@/data/connections.json";
import sourcesJson from "@/data/sources.json";
import expertsJson from "@/data/experts.json";
import eventsJson from "@/data/events.json";
import venuesJson from "@/data/venues.json";
import recoveryJson from "@/data/recovery.json";
import sportsJson from "@/data/sports.json";
import type {
  Connection,
  Expert,
  Source,
  SourceId,
  Spoke,
  SpokeId,
  SportEvent,
  TimelineItem,
  Venue,
} from "@/types";

export const spokes = spokesJson as Spoke[];
export const connections = connectionsJson as Connection[];
export const sources = sourcesJson as Source[];
export const experts = expertsJson as Expert[];
export const events = eventsJson as SportEvent[];
export const venues = venuesJson as Venue[];

export const recovery = recoveryJson as Omit<typeof recoveryJson, "timeline"> & {
  timeline: TimelineItem[];
};
export const sports = sportsJson as Omit<typeof sportsJson, "timeline"> & {
  timeline: TimelineItem[];
};

export function getSpoke(id: SpokeId): Spoke {
  const spoke = spokes.find((s) => s.id === id);
  if (!spoke) throw new Error(`Unknown spoke ${id}`);
  return spoke;
}

export function sourceName(id: SourceId): string {
  return sources.find((s) => s.id === id)?.name ?? id;
}

export const persona = {
  name: "Faisal",
  age: 32,
  city: "Riyadh",
  goal: "First padel tournament in 8 weeks",
  schedule: "Trains 4x/week · padel Mon & Thu evenings",
  injuries: "Right hamstring tightness (2024)",
};
