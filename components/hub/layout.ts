import type { SpokeId } from "@/types";

/** Node placement as a share of the (square) hub container. */
export type NodeLayout = { x: number; y: number; size: number };

const RING = 36;

function polar(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
}

export const NODE_LAYOUT: Record<SpokeId, NodeLayout> = {
  train: { ...polar(-90, RING), size: 18 },
  recovery: { ...polar(-30, RING), size: 18 },
  equipment: { ...polar(30, RING), size: 18 },
  nutrition: { ...polar(90, RING), size: 18 },
  sports: { ...polar(150, RING), size: 18 },
  sleep: { ...polar(-150, RING), size: 18 },
  // Settings/data spoke: smaller, just outside the ring at top-right
  profile: { ...polar(-60, 46), size: 13 },
};

export const CENTRE_SIZE = 25;

/** Hub draw order so the New → Active transition staggers around the ring */
export const RING_ORDER: SpokeId[] = [
  "profile",
  "train",
  "recovery",
  "equipment",
  "nutrition",
  "sports",
  "sleep",
];

/** Perpendicular bend (px at a 680px hub) for spoke-to-spoke signal beams */
export const SIGNAL_CURVE: Record<string, { curvature: number; away: boolean }> = {
  "sleep-train": { curvature: 34, away: true },
  "train-recovery": { curvature: 26, away: false },
  "sports-train": { curvature: 18, away: false },
};
