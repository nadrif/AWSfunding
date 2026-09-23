"use client";

import * as React from "react";

/** Validated categorical order (see dataviz palette): blue, orange, aqua, yellow. */
export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"] as const;

const INK = "#16191d";
const MUTED = "#66707a";
const GRID = "#e9ecef";

type Series = { id: string; label: string; values: number[]; color?: string };

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {series.map((s, i) => (
        <span key={s.id} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color ?? SERIES[i] }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border bg-card px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg"
      style={{ left, top: y }}
    >
      {children}
    </div>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(480);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Multi-series line chart with crosshair tooltip and direct end labels. */
export function LineChart({
  labels,
  series,
  yMax,
  yTicks,
  height = 220,
  format = (v: number) => String(v),
}: {
  labels: string[];
  series: Series[];
  yMax: number;
  yTicks: { value: number; label: string }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const pad = { l: 58, r: 96, t: 10, b: 26 };
  const iw = Math.max(width - pad.l - pad.r, 50);
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length > 1 ? (i / (labels.length - 1)) * iw : iw / 2);
  const y = (v: number) => pad.t + ih - (v / yMax) * ih;

  // Nudge end labels apart so they never collide
  const ends = series
    .map((s, i) => ({ s, i, y: y(s.values[s.values.length - 1]) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) {
    if (ends[k].y - ends[k - 1].y < 13) ends[k].y = ends[k - 1].y + 13;
  }

  return (
    <div>
      <Legend series={series} />
      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={height}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - r.left;
            const i = Math.round(((px - pad.l) / iw) * (labels.length - 1));
            setHover(i >= 0 && i < labels.length ? i : null);
          }}
        >
          {yTicks.map((t) => (
            <g key={t.value}>
              <line x1={pad.l} x2={pad.l + iw} y1={y(t.value)} y2={y(t.value)} stroke={GRID} />
              <text x={pad.l - 8} y={y(t.value)} dy="0.32em" textAnchor="end" fontSize={11} fill={MUTED}>
                {t.label}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l + i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill={MUTED}>
              {l}
            </text>
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#c3cad1" />}
          {series.map((s, si) => {
            const color = s.color ?? SERIES[si];
            const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
            return (
              <g key={s.id}>
                <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(v)}
                    r={hover === i ? 5 : i === s.values.length - 1 ? 4 : 0}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}
          {ends.map(({ s, y: ly }) => (
            <text key={s.id} x={pad.l + iw + 10} y={ly} dy="0.32em" fontSize={11} fontWeight={500} fill={INK}>
              {s.label}
            </text>
          ))}
        </svg>
        {hover !== null && (
          <Tooltip x={x(hover)} y={pad.t + 4} width={width}>
            <p className="mb-1 font-semibold">{labels[hover]}</p>
            {series.map((s, si) => (
              <p key={s.id} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color ?? SERIES[si] }} />
                {s.label}: <span className="font-medium text-foreground">{format(s.values[hover])}</span>
              </p>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/** Vertical bars — single series or stacked, 2px surface gaps, per-bar tooltip. */
export function BarChart({
  labels,
  series,
  height = 200,
  unit = "",
  highlightLast = false,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  unit?: string;
  highlightLast?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const pad = { l: 28, r: 8, t: 18, b: 26 };
  const iw = Math.max(width - pad.l - pad.r, 50);
  const ih = height - pad.t - pad.b;
  const totals = labels.map((_, i) => series.reduce((a, s) => a + s.values[i], 0));
  const max = Math.max(1, ...totals);
  const niceMax = Math.ceil(max);
  const band = iw / labels.length;
  const bw = Math.min(40, band * 0.56);
  const y = (v: number) => pad.t + ih - (v / niceMax) * ih;
  const ticks = [0, Math.round(niceMax / 2), niceMax].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div>
      <Legend series={series} />
      <div ref={ref} className="relative">
        <svg width="100%" height={height} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + iw} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={MUTED}>
                {t}
              </text>
            </g>
          ))}
          {labels.map((l, i) => {
            const cx = pad.l + band * i + band / 2;
            let acc = 0;
            const last = i === labels.length - 1;
            return (
              <g key={l + i} onMouseEnter={() => setHover(i)}>
                <rect x={pad.l + band * i} y={pad.t} width={band} height={ih} fill="transparent" />
                {series.map((s, si) => {
                  const v = s.values[i];
                  if (!v) return null;
                  const top = y(acc + v);
                  const h = y(acc) - top - (acc > 0 ? 2 : 0);
                  acc += v;
                  const isTop = series.slice(si + 1).every((o) => !o.values[i]);
                  const color = s.color ?? SERIES[si];
                  return (
                    <path
                      key={s.id}
                      d={roundedTop(cx - bw / 2, top, bw, Math.max(h, 1), isTop ? 4 : 0)}
                      fill={color}
                      opacity={hover === null || hover === i ? (highlightLast && !last && series.length === 1 ? 0.55 : 1) : 0.45}
                    />
                  );
                })}
                <text x={cx} y={height - 6} textAnchor="middle" fontSize={11} fill={MUTED}>
                  {l}
                </text>
                {series.length === 1 && (last || hover === i) && (
                  <text x={cx} y={y(totals[i]) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={INK}>
                    {totals[i]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && series.length > 1 && (
          <Tooltip x={pad.l + band * hover + band / 2} y={y(totals[hover])} width={width}>
            <p className="mb-1 font-semibold">
              {labels[hover]} · {totals[hover]}
              {unit}
            </p>
            {series.map((s, si) => (
              <p key={s.id} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color ?? SERIES[si] }} />
                {s.label}: <span className="font-medium text-foreground">{s.values[hover]}</span>
              </p>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}
