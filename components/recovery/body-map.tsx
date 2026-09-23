"use client";

import * as React from "react";
import { motion } from "motion/react";

import { recovery } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { BodyView } from "@/types";

type Shape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx: number; rotate?: [number, number, number] }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

type Part = { id?: string; shape: Shape };

const W = 200;

function mirror(s: Shape): Shape {
  if (s.kind === "ellipse") return { ...s, cx: W - s.cx };
  return {
    ...s,
    x: W - s.x - s.w,
    rotate: s.rotate ? [-s.rotate[0], W - s.rotate[1], s.rotate[2]] : undefined,
  };
}

/** A left/right pair: `viewerLeft` is drawn on the viewer's left and mirrored. */
function pair(viewerLeft: string | undefined, viewerRight: string | undefined, shape: Shape): Part[] {
  return [
    { id: viewerLeft, shape },
    { id: viewerRight, shape: mirror(shape) },
  ];
}

const upperArm: Shape = { kind: "rect", x: 47, y: 93, w: 18, h: 54, rx: 9, rotate: [10, 56, 93] };
const forearm: Shape = { kind: "rect", x: 38.5, y: 147, w: 16, h: 50, rx: 8, rotate: [6, 46.5, 147] };
const hand: Shape = { kind: "ellipse", cx: 41, cy: 206, rx: 7, ry: 9 };
const shoulder: Shape = { kind: "ellipse", cx: 66, cy: 83, rx: 14, ry: 12 };
const foot: Shape = { kind: "ellipse", cx: 87, cy: 384, rx: 11, ry: 7 };
const head: Part = { shape: { kind: "ellipse", cx: 100, cy: 29, rx: 19, ry: 23 } };

// Front view: the person's right side is on the viewer's left
const FRONT: Part[] = [
  head,
  { id: "neck", shape: { kind: "rect", x: 90, y: 50, w: 20, h: 20, rx: 7 } },
  ...pair("shoulder_r", "shoulder_l", shoulder),
  { id: "chest", shape: { kind: "rect", x: 76, y: 70, w: 48, h: 40, rx: 14 } },
  { id: "core", shape: { kind: "rect", x: 80, y: 112, w: 40, h: 58, rx: 12 } },
  ...pair("biceps_r", "biceps_l", upperArm),
  ...pair("forearm_r", "forearm_l", forearm),
  ...pair(undefined, undefined, hand),
  ...pair("hip_r", "hip_l", { kind: "rect", x: 79, y: 172, w: 20, h: 26, rx: 9 }),
  ...pair("quad_r", "quad_l", { kind: "rect", x: 77, y: 200, w: 22, h: 76, rx: 11 }),
  ...pair("knee_r", "knee_l", { kind: "ellipse", cx: 88, cy: 286, rx: 10, ry: 9 }),
  ...pair("shin_r", "shin_l", { kind: "rect", x: 79, y: 297, w: 18, h: 78, rx: 9 }),
  ...pair(undefined, undefined, foot),
];

// Back view: the person's left side is on the viewer's left
const BACK: Part[] = [
  head,
  { id: "neck", shape: { kind: "rect", x: 84, y: 54, w: 32, h: 20, rx: 9 } },
  ...pair("shoulder_l", "shoulder_r", shoulder),
  { id: "upper_back", shape: { kind: "rect", x: 76, y: 76, w: 48, h: 34, rx: 14 } },
  ...pair("lat_l", "lat_r", { kind: "rect", x: 78, y: 112, w: 21, h: 34, rx: 10 }),
  { id: "lower_back", shape: { kind: "rect", x: 81, y: 148, w: 38, h: 24, rx: 10 } },
  ...pair("triceps_l", "triceps_r", upperArm),
  ...pair("forearm_l", "forearm_r", forearm),
  ...pair(undefined, undefined, hand),
  ...pair("glute_l", "glute_r", { kind: "rect", x: 78, y: 174, w: 21, h: 30, rx: 11 }),
  ...pair("hamstring_l", "hamstring_r", { kind: "rect", x: 77, y: 206, w: 22, h: 70, rx: 11 }),
  ...pair("calf_l", "calf_r", { kind: "rect", x: 79, y: 282, w: 19, h: 82, rx: 9.5 }),
  ...pair(undefined, undefined, foot),
];

export const HEAT = ["#e6eaee", "#f7d27f", "#f0973f", "#d9443c"] as const;
export const INTENSITY_LABEL = ["None", "Mild", "Moderate", "Severe"] as const;

const regionLabel = Object.fromEntries(recovery.regions.map((r) => [r.id, r.label]));
export function labelFor(id: string) {
  return regionLabel[id] ?? id;
}

function ShapeEl({ shape, ...rest }: { shape: Shape } & React.SVGProps<SVGElement>) {
  if (shape.kind === "ellipse") {
    return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...(rest as React.SVGProps<SVGEllipseElement>)} />;
  }
  return (
    <rect
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      rx={shape.rx}
      transform={shape.rotate ? `rotate(${shape.rotate.join(" ")})` : undefined}
      {...(rest as React.SVGProps<SVGRectElement>)}
    />
  );
}

export function BodyMap({
  values,
  variant,
  accent = "#b0706a",
  selected,
  onRegionClick,
  className,
}: {
  values: Record<string, number>;
  variant: "heat" | "select";
  accent?: string;
  selected?: string | null;
  onRegionClick: (id: string) => void;
  className?: string;
}) {
  const [hover, setHover] = React.useState<string | null>(null);
  const caption = hover ?? selected ?? null;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="grid w-full grid-cols-2 gap-2 sm:gap-6">
        {(["front", "back"] as BodyView[]).map((view) => (
          <Figure
            key={view}
            view={view}
            parts={view === "front" ? FRONT : BACK}
            values={values}
            variant={variant}
            accent={accent}
            selected={selected}
            hover={hover}
            setHover={setHover}
            onRegionClick={onRegionClick}
          />
        ))}
      </div>
      <p className="mt-2 h-5 text-sm font-medium text-muted-foreground">
        {caption ? (
          <>
            <span className="text-foreground">{labelFor(caption)}</span>
            {variant === "heat" && <> · {INTENSITY_LABEL[values[caption] ?? 0]}</>}
            {variant === "select" && <> · {values[caption] ? "selected" : "tap to select"}</>}
          </>
        ) : (
          "Tap a region"
        )}
      </p>
    </div>
  );
}

function Figure({
  view,
  parts,
  values,
  variant,
  accent,
  selected,
  hover,
  setHover,
  onRegionClick,
}: {
  view: BodyView;
  parts: Part[];
  values: Record<string, number>;
  variant: "heat" | "select";
  accent: string;
  selected?: string | null;
  hover: string | null;
  setHover: (id: string | null) => void;
  onRegionClick: (id: string) => void;
}) {
  const blurId = `heat-blur-${view}`;
  const fillFor = (id?: string) => {
    if (!id) return "#e9edf1";
    const v = values[id] ?? 0;
    if (variant === "select") return v ? accent : HEAT[0];
    return HEAT[v] ?? HEAT[0];
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="-6 -4 212 400" className="w-full max-w-[210px] touch-manipulation select-none" role="group" aria-label={`Body map, ${view}`}>
        <defs>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        {/* Fused silhouette underneath so segments read as one body */}
        <g fill="#eef1f4" stroke="#eef1f4" strokeWidth={9} strokeLinejoin="round">
          {parts.map((p, i) => (
            <ShapeEl key={`sil-${i}`} shape={p.shape} />
          ))}
        </g>

        {/* Heat halo underneath */}
        {variant === "heat" && (
          <g filter={`url(#${blurId})`}>
            {parts.map((p, i) => {
              const v = p.id ? (values[p.id] ?? 0) : 0;
              if (!v) return null;
              return (
                <motion.g
                  key={`glow-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: v === 3 ? [0.6, 1, 0.6] : 0.45 + v * 0.2 }}
                  transition={v === 3 ? { duration: 1.8, repeat: Infinity } : { duration: 0.4 }}
                >
                  <ShapeEl shape={p.shape} fill={HEAT[v]} stroke={HEAT[v]} strokeWidth={10} />
                </motion.g>
              );
            })}
          </g>
        )}

        {parts.map((p, i) => {
          const interactive = !!p.id;
          const isSel = interactive && selected === p.id;
          const isHover = interactive && hover === p.id;
          return (
            <ShapeEl
              key={i}
              shape={p.shape}
              fill={fillFor(p.id)}
              stroke={isSel ? "#16191d" : isHover ? "#6b7580" : "#cfd6dd"}
              strokeWidth={isSel ? 2 : 1.2}
              style={{
                cursor: interactive ? "pointer" : "default",
                transition: "fill 250ms ease, stroke 150ms ease",
              }}
              onMouseEnter={interactive ? () => setHover(p.id!) : undefined}
              onMouseLeave={interactive ? () => setHover(null) : undefined}
              onClick={interactive ? () => onRegionClick(p.id!) : undefined}
              role={interactive ? "button" : undefined}
              aria-label={interactive ? labelFor(p.id!) : undefined}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex w-full max-w-[160px] items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <span>{view === "front" ? "R" : "L"}</span>
        <span className="tracking-wider uppercase">{view}</span>
        <span>{view === "front" ? "L" : "R"}</span>
      </div>
    </div>
  );
}
