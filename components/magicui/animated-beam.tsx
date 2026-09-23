"use client";

/**
 * Magic UI — Animated Beam (https://magicui.design/docs/components/animated-beam), MIT.
 * Vendored from the shadcn registry source and extended for Health OS:
 *  - `curvature` bends perpendicular to the beam, optionally away from `bendAwayFrom`
 *  - the gradient travels along the beam's own direction (works for any angle)
 *  - `animated={false}` + `dashArray` draw a static dotted "potential" line
 *  - `onPathChange` reports the path midpoint so the hub can pin labels to it
 *  - an invisible wide hit path powers hover labels
 *  - re-measures on container resize and window resize
 */

import { useCallback, useEffect, useId, useState, type RefObject } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  /** Container-relative point the curve should bow away from (e.g. the hub centre) */
  bendAwayFrom?: { x: number; y: number } | "center";
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  repeat?: number;
  repeatDelay?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  animated?: boolean;
  dashArray?: string;
  /** Trim the beam so it starts/ends at the node edge instead of its centre */
  inset?: number;
  onPathChange?: (mid: { x: number; y: number }) => void;
  onHoverChange?: (hovered: boolean) => void;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  bendAwayFrom,
  reverse = false,
  duration = 5,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  repeat = Infinity,
  repeatDelay = 0,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  animated = true,
  dashArray,
  inset = 0,
  onPathChange,
  onHoverChange,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [ends, setEnds] = useState({ sx: 0, sy: 0, ex: 0, ey: 0 });

  const updatePath = useCallback(() => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rectA = fromRef.current.getBoundingClientRect();
    const rectB = toRef.current.getBoundingClientRect();

    const width = containerRect.width;
    const height = containerRect.height;
    setSvgDimensions((d) => (d.width === width && d.height === height ? d : { width, height }));

    let sx = rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
    let sy = rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
    let ex = rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
    let ey = rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    if (inset > 0) {
      const insetA = rectA.width / 2 + inset;
      const insetB = rectB.width / 2 + inset;
      sx += ux * insetA;
      sy += uy * insetA;
      ex -= ux * insetB;
      ey -= uy * insetB;
    }

    // Perpendicular control point
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    let nx = -uy;
    let ny = ux;
    if (bendAwayFrom) {
      const origin = bendAwayFrom === "center" ? { x: width / 2, y: height / 2 } : bendAwayFrom;
      const toMidX = mx - origin.x;
      const toMidY = my - origin.y;
      if (nx * toMidX + ny * toMidY < 0) {
        nx = -nx;
        ny = -ny;
      }
    }
    const cx = mx + nx * curvature;
    const cy = my + ny * curvature;

    setPathD(`M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`);
    setEnds({ sx, sy, ex, ey });
    // Midpoint of a quadratic Bézier at t = 0.5
    onPathChange?.({ x: 0.25 * sx + 0.5 * cx + 0.25 * ex, y: 0.25 * sy + 0.5 * cy + 0.25 * ey });
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    bendAwayFrom,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
    inset,
    onPathChange,
  ]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => updatePath());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", updatePath);
    updatePath();
    // Fonts and layout can settle a frame later
    const raf = requestAnimationFrame(updatePath);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, updatePath]);

  // Gradient travels along the beam: x1/y1 leads, x2/y2 trails (as in Magic UI)
  const { sx, sy, ex, ey } = ends;
  const at = (t: number) => ({ x: sx + (ex - sx) * t, y: sy + (ey - sy) * t });
  const [a0, a1, b0, b1] = reverse
    ? [at(0.9), at(-0.1), at(1), at(0)]
    : [at(0.1), at(1.1), at(0), at(1)];

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none absolute top-0 left-0 transform-gpu stroke-2", className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        strokeDasharray={dashArray}
      />
      {animated && pathD && (
        <>
          <path
            d={pathD}
            strokeWidth={pathWidth}
            stroke={`url(#${id})`}
            strokeOpacity="1"
            strokeLinecap="round"
          />
          <defs>
            <motion.linearGradient
              key={`${sx}-${sy}-${ex}-${ey}-${reverse}`}
              className="transform-gpu"
              id={id}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: b0.x, y1: b0.y, x2: b0.x, y2: b0.y }}
              animate={{
                x1: [a0.x, a1.x],
                y1: [a0.y, a1.y],
                x2: [b0.x, b1.x],
                y2: [b0.y, b1.y],
              }}
              transition={{
                delay,
                duration,
                ease: [0.16, 1, 0.3, 1],
                repeat,
                repeatDelay,
              }}
            >
              <stop stopColor={gradientStartColor} stopOpacity="0" />
              <stop stopColor={gradientStartColor} />
              <stop offset="32.5%" stopColor={gradientStopColor} />
              <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </>
      )}
      {onHoverChange && pathD && (
        <path
          d={pathD}
          stroke="transparent"
          strokeWidth={18}
          style={{ pointerEvents: "stroke", cursor: "help" }}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
        />
      )}
    </svg>
  );
};
