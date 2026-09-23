"use client";

import { motion } from "motion/react";

const POINTS = 22;

function starburstPath() {
  const outer = 50;
  const inner = 45;
  const pts: string[] = [];
  for (let i = 0; i < POINTS * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / POINTS - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

const PATH = starburstPath();

export function CentreSeal({ active }: { active: boolean }) {
  return (
    <div className="relative size-full select-none">
      <motion.svg
        viewBox="-4 -4 108 108"
        className="absolute inset-0 size-full drop-shadow-[0_10px_24px_rgb(0_0_0/0.25)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, ease: "linear", repeat: Infinity }}
      >
        <path d={PATH} fill="#111315" stroke="#111315" strokeWidth={3} strokeLinejoin="round" />
        <circle cx={50} cy={50} r={38} fill="none" stroke="white" strokeOpacity={0.14} strokeDasharray="1 3" />
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-[clamp(13px,3.6cqw,26px)] leading-none font-semibold tracking-tight">
          Health OS
        </span>
        <span className="mt-1 text-[clamp(8px,1.5cqw,11px)] font-medium tracking-[0.18em] text-white/55 uppercase">
          {active ? "Today" : "Setup"}
        </span>
      </div>
    </div>
  );
}
