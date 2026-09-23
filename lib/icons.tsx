import { createElement, type ComponentProps } from "react";
import {
  Bike,
  CircleDot,
  Dumbbell,
  Flame,
  Footprints,
  Hand,
  HeartPulse,
  Moon,
  Package,
  PersonStanding,
  Salad,
  Snowflake,
  Stethoscope,
  Trophy,
  UserRound,
  Volleyball,
  Waves,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Bike,
  CircleDot,
  Dumbbell,
  Flame,
  Footprints,
  Hand,
  HeartPulse,
  Moon,
  Package,
  PersonStanding,
  Salad,
  Snowflake,
  Stethoscope,
  Trophy,
  UserRound,
  Volleyball,
  Waves,
};

export function getIcon(name: string): LucideIcon {
  return icons[name] ?? CircleDot;
}

/** Render a lucide icon by name (keeps component identity static for React). */
export function NamedIcon({ name, ...props }: { name: string } & ComponentProps<LucideIcon>) {
  return createElement(icons[name] ?? CircleDot, props);
}
