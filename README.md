# Health OS — demo

A clickable, front-end-only demo of **Health OS**, an AI-native health and fitness platform for the GCC. It exists for co-ideation: it shows the product's shape and feel, not production functionality. All data is static JSON and every "AI" moment is scripted copy.

Core loop on show: **Plan → Observe → Understand → Adapt → Escalate → Repeat.**

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out (deploys as-is to Vercel or any static host)
```

## What to click

- **Hub (`/`)**: seven spokes orbit the Health OS core. Hover a spoke (or tap it on a phone) to focus its beams and see what's pending. The **Legend** button explains the states and the beam types.
  - Teal **data** beams: a connected source feeds a spoke (routed through the core).
  - Amber **signal** beams: one spoke is affecting another. Hover the ⚡ chip to see why.
  - Dotted **potential** lines: unlocks once the spoke is set up or a source is connected.
- **Demo toggle** (bottom right): switch between **New user** and **Active user**. The hub animates from grey to colour, and dotted lines become live beams.
- **Guided demo**: a five-step walkthrough (hub → attention → beams → Sports event → Recovery body map).
- **Sports** (deep): 4-step setup wizard; Today (session, events, coaching); Timeline; Progress; Experts. Signing up for the Riyadh Padel Open adds an 8-week plan to Train and lights up a new Sports → Train beam on the hub.
- **Recovery** (deep): 4-step wizard with a tappable body map; a soreness check-in heatmap that drives today's suggestion. Set the right hamstring to *Severe* to trigger the physio escalation.
- **Profile & Connections**: toggle sources on and off. Turning Oura off drops the Profile → Sleep beam to a dotted line.
- **Train, Nutrition (with Ramadan mode), Sleep, Equipment**: shallow, one screen each, all using the same spoke template.

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components on Radix · Magic UI Animated Beam · Motion · lucide-react · sonner.

- `components/magicui/animated-beam.tsx`: Magic UI's Animated Beam, vendored and extended with perpendicular curvature, a gradient that follows the beam's direction, dotted static lines, midpoint reporting and hover hit-areas.
- `lib/demo-context.tsx`: in-memory demo state (mode, connected sources, spokes set up this session, event sign-ups). It also resolves each spoke's attention state and which beams to draw.
- `data/*.json`: all content, typed in `types/index.ts`.
- `components/hub/*`: hub layout, nodes, tooltip, legend.
- `components/spoke/*`: shared spoke template (header, wizard, tabs, timeline, experts and slot picker).
