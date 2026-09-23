"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Zap } from "lucide-react";

import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { spokes } from "@/lib/data";
import {
  resolveSpokeState,
  useDemo,
  useEffectiveConnections,
  type EffectiveConnection,
} from "@/lib/demo-context";
import { cn } from "@/lib/utils";
import type { SpokeId } from "@/types";
import { CentreSeal } from "./centre-seal";
import { CENTRE_SIZE, NODE_LAYOUT, RING_ORDER, SIGNAL_CURVE } from "./layout";
import { SpokeNode } from "./spoke-node";
import { NodeTooltip } from "./node-tooltip";

type Point = { x: number; y: number };

const BEAM = {
  data: {
    pathColor: "#7fa8a8",
    pathOpacity: 0.45,
    pathWidth: 2.4,
    gradientStartColor: "#1f9e94",
    gradientStopColor: "#7fc4c9",
    duration: 4.2,
  },
  signal: {
    pathColor: "#e08a1e",
    pathOpacity: 0.35,
    pathWidth: 3.2,
    gradientStartColor: "#ffc15e",
    gradientStopColor: "#e0701e",
    duration: 2.2,
  },
  potential: {
    pathColor: "#8e99a4",
    pathOpacity: 0.7,
    pathWidth: 1.6,
  },
} as const;

export function Hub() {
  const router = useRouter();
  const demo = useDemo();
  const connections = useEffectiveConnections();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const centreRef = React.useRef<HTMLDivElement>(null);
  // Created once; stable anchors for the beams (state, so render reads never touch .current)
  const [nodeRefs] = React.useState(
    () =>
      Object.fromEntries(spokes.map((s) => [s.id, React.createRef<HTMLDivElement>()])) as Record<
        SpokeId,
        React.RefObject<HTMLDivElement | null>
      >
  );

  const [width, setWidth] = React.useState(680);
  const [hoverNode, setHoverNode] = React.useState<SpokeId | null>(null);
  const [focusNode, setFocusNode] = React.useState<SpokeId | null>(null);
  const [hoverBeam, setHoverBeam] = React.useState<string | null>(null);
  const [launching, setLaunching] = React.useState<SpokeId | null>(null);
  const [mids, setMids] = React.useState<Record<string, Point>>({});

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stable callbacks (keyed by beam id) so AnimatedBeam effects don't loop
  const setMid = React.useCallback((id: string, p: Point) => {
    setMids((prev) => {
      const cur = prev[id];
      if (cur && Math.abs(cur.x - p.x) < 0.5 && Math.abs(cur.y - p.y) < 0.5) return prev;
      return { ...prev, [id]: p };
    });
  }, []);
  const setBeamHover = React.useCallback((id: string, h: boolean) => {
    setHoverBeam((cur) => (h ? id : cur === id ? null : cur));
  }, []);

  // Spotlight a freshly created signal (e.g. after an event sign-up) for a few seconds
  const { freshSignal, clearFreshSignal } = demo;
  React.useEffect(() => {
    if (!freshSignal) return;
    const t = setTimeout(clearFreshSignal, 6000);
    return () => clearTimeout(t);
  }, [freshSignal, clearFreshSignal]);

  const activeNode = hoverNode ?? focusNode;
  const scale = width / 680;

  const states = Object.fromEntries(
    spokes.map((s) => [s.id, resolveSpokeState(s.id, demo)])
  ) as Record<SpokeId, ReturnType<typeof resolveSpokeState>>;

  const dataConns = connections.filter((c) => c.type !== "signal");
  const signalConns = connections.filter((c) => c.type === "signal");
  const anyLiveData = dataConns.some((c) => c.type === "data");

  const touches = (c: EffectiveConnection, id: SpokeId) =>
    c.from === id || c.to === id || (id === "profile" && c.type !== "signal");

  const beamEmphasis = (c: EffectiveConnection | "core"): "focus" | "dim" | "normal" => {
    if (hoverBeam) {
      return (c === "core" ? "core" : c.id) === hoverBeam ? "focus" : "dim";
    }
    if (!activeNode) return "normal";
    if (c === "core") {
      const feeds = dataConns.some((d) => d.to === activeNode && d.type === "data");
      return activeNode === "profile" || feeds ? "focus" : "dim";
    }
    return touches(c, activeNode) ? "focus" : "dim";
  };

  const nodeDimmed = (id: SpokeId) => {
    if (hoverBeam) {
      const c = connections.find((x) => x.id === hoverBeam);
      if (hoverBeam === "core") return id !== "profile";
      return !!c && c.from !== id && c.to !== id && !(c.type !== "signal" && id === "profile");
    }
    if (!activeNode || activeNode === id) return false;
    return !connections.some(
      (c) =>
        c.type !== "potential" &&
        ((c.from === activeNode && c.to === id) ||
          (c.to === activeNode && c.from === id) ||
          (c.type === "data" && ((activeNode === "profile" && c.to === id) || (id === "profile" && c.to === activeNode))))
    );
  };

  const activate = (id: SpokeId, pointerType: string) => {
    if (pointerType === "touch" && focusNode !== id) {
      setFocusNode(id);
      return;
    }
    setLaunching(id);
    setTimeout(() => router.push(`/${id}`), 200);
  };

  const hoveredConn = hoverBeam ? connections.find((c) => c.id === hoverBeam) : undefined;

  return (
    <div
      ref={containerRef}
      className="@container relative mx-auto aspect-square w-full max-w-[min(680px,max(340px,calc(100dvh-250px)))]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setFocusNode(null);
      }}
    >
      {/* Profile → Health OS core feed */}
      <BeamLayer emphasis={beamEmphasis("core")} delayIndex={0} beamKey={`core-${anyLiveData}`}>
        <HubBeam
          containerRef={containerRef}
          fromRef={nodeRefs.profile}
          toRef={centreRef}
          inset={4}
          beamId={"core"}
          setMid={setMid}
          setHover={setBeamHover}
          {...(anyLiveData
            ? { ...BEAM.data, pathWidth: 2.6, duration: 3.2 }
            : { ...BEAM.potential, animated: false, dashArray: "2 7" })}
        />
      </BeamLayer>

      {/* Health OS → spoke data / potential beams */}
      <AnimatePresence>
        {dataConns.map((c, i) => (
          <BeamLayer
            key={`${c.id}-${c.type}`}
            beamKey={`${c.id}-${c.type}`}
            emphasis={beamEmphasis(c)}
            delayIndex={i + 1}
          >
            <HubBeam
              containerRef={containerRef}
              fromRef={centreRef}
              toRef={nodeRefs[c.to]}
              inset={4}
              beamId={c.id}
              setMid={setMid}
              setHover={setBeamHover}
              delay={i * 0.45}
              {...(c.type === "data"
                ? BEAM.data
                : { ...BEAM.potential, animated: false, dashArray: "2 7" })}
            />
          </BeamLayer>
        ))}
      </AnimatePresence>

      {/* Spoke → spoke signal beams */}
      <AnimatePresence>
        {signalConns.map((c, i) => {
          const curve = SIGNAL_CURVE[c.id] ?? { curvature: 0, away: true };
          const fresh = freshSignal === c.id;
          return (
            <BeamLayer
              key={c.id}
              beamKey={c.id}
              emphasis={fresh ? "focus" : beamEmphasis(c)}
              delayIndex={dataConns.length + i + 2}
            >
              <HubBeam
                containerRef={containerRef}
                fromRef={nodeRefs[c.from]}
                toRef={nodeRefs[c.to]}
                inset={6}
                curvature={curve.curvature * scale}
                bendAwayFrom={curve.away ? "center" : undefined}
                beamId={c.id}
                setMid={setMid}
                setHover={setBeamHover}
                {...BEAM.signal}
                pathWidth={fresh ? 4.5 : BEAM.signal.pathWidth}
                delay={i * 0.3}
              />
            </BeamLayer>
          );
        })}
      </AnimatePresence>

      {/* Signal midpoint chips */}
      <AnimatePresence>
        {signalConns.map((c) => {
          const mid = mids[c.id];
          if (!mid) return null;
          const open = hoverBeam === c.id || freshSignal === c.id || activeNode === c.from || activeNode === c.to;
          return (
            <SignalChip
              key={`chip-${c.id}`}
              mid={mid}
              reason={c.reason ?? c.label}
              label={c.label}
              open={open}
              fresh={freshSignal === c.id}
              dimmed={beamEmphasis(c) === "dim" && freshSignal !== c.id}
              onHover={(h) => setBeamHover(c.id, h)}
            />
          );
        })}
      </AnimatePresence>

      {/* Hover label for data / potential beams */}
      <AnimatePresence>
        {hoverBeam && (hoverBeam === "core" || (hoveredConn && hoveredConn.type !== "signal")) && mids[hoverBeam] && (
          <motion.div
            key={hoverBeam}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-background shadow-lg"
            style={{ left: mids[hoverBeam].x, top: mids[hoverBeam].y }}
          >
            {hoverBeam === "core"
              ? anyLiveData
                ? "Connected sources → Health OS"
                : "Connect a source to start the data flow"
              : hoveredConn?.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centre */}
      <div
        ref={centreRef}
        className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${CENTRE_SIZE}%`, aspectRatio: "1 / 1" }}
      >
        <motion.div
          className="size-full"
        >
          <CentreSeal active={demo.mode === "active"} />
        </motion.div>
      </div>

      {/* Nodes */}
      {RING_ORDER.map((id, index) => {
        const spoke = spokes.find((s) => s.id === id)!;
        return (
          <SpokeNode
            key={id}
            spoke={spoke}
            state={states[id]}
            layout={NODE_LAYOUT[id]}
            index={index}
            nodeRef={nodeRefs[id]}
            dimmed={(launching !== null && launching !== id) || nodeDimmed(id)}
            focused={activeNode === id}
            launching={launching === id}
            onHover={(h) => setHoverNode((cur) => (h ? id : cur === id ? null : cur))}
            onActivate={(pt) => activate(id, pt)}
          />
        );
      })}

      {/* Tooltip */}
      <AnimatePresence>
        {activeNode && !launching && (
          <NodeTooltip
            key={activeNode}
            spoke={spokes.find((s) => s.id === activeNode)!}
            state={states[activeNode]}
            layout={NODE_LAYOUT[activeNode]}
            touch={focusNode === activeNode && !hoverNode}
            onOpen={() => activate(activeNode, "mouse")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BeamLayer({
  children,
  emphasis,
  delayIndex,
  beamKey,
}: {
  children: React.ReactNode;
  emphasis: "focus" | "dim" | "normal";
  delayIndex: number;
  beamKey: string;
}) {
  return (
    <motion.div
      key={beamKey}
      className={cn("pointer-events-none absolute inset-0", emphasis === "focus" ? "z-[5]" : "z-0")}
      initial={{ opacity: 0 }}
      animate={{
        opacity: emphasis === "dim" ? 0.14 : 1,
        filter: emphasis === "focus" ? "saturate(1.35) brightness(1.05)" : "saturate(1) brightness(1)",
      }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{
        opacity: { duration: 0.5, delay: emphasis === "normal" ? 0.25 + delayIndex * 0.1 : 0 },
      }}
    >
      {children}
    </motion.div>
  );
}

function SignalChip({
  mid,
  reason,
  label,
  open,
  fresh,
  dimmed,
  onHover,
}: {
  mid: Point;
  reason: string;
  label: string;
  open: boolean;
  fresh: boolean;
  dimmed: boolean;
  onHover: (h: boolean) => void;
}) {
  return (
    <motion.div
      className="absolute z-[35] -translate-x-1/2 -translate-y-1/2"
      style={{ left: mid.x, top: mid.y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: dimmed ? 0.2 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <motion.div
        layout
        className="flex cursor-help items-center gap-1.5 overflow-hidden rounded-full border border-[#f3d3a6] bg-[#fff7ec] py-1 pr-1.5 pl-1 text-[11px] font-semibold whitespace-nowrap text-[#9a560a] shadow-md"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <motion.span
          className="flex size-4 items-center justify-center rounded-full bg-attn-warn text-white"
          animate={fresh ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: fresh ? Infinity : 0 }}
        >
          <Zap className="size-2.5" fill="currentColor" />
        </motion.span>
        {open && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pr-1">
            <span className="text-[#c07a2a]">{label}:</span> {reason}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}

function HubBeam({
  beamId,
  setMid,
  setHover,
  ...props
}: Omit<React.ComponentProps<typeof AnimatedBeam>, "onPathChange" | "onHoverChange"> & {
  beamId: string;
  setMid: (id: string, p: Point) => void;
  setHover: (id: string, h: boolean) => void;
}) {
  const onPathChange = React.useCallback((p: Point) => setMid(beamId, p), [beamId, setMid]);
  const onHoverChange = React.useCallback((h: boolean) => setHover(beamId, h), [beamId, setHover]);
  return <AnimatedBeam {...props} onPathChange={onPathChange} onHoverChange={onHoverChange} />;
}
