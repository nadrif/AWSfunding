export type SpokeId =
  | "profile"
  | "train"
  | "sports"
  | "nutrition"
  | "sleep"
  | "recovery"
  | "equipment";

export type DemoMode = "new" | "active";

export type AttentionType = "due" | "needs_attention" | "opportunity" | "done";

export type Attention = {
  type: AttentionType;
  count?: number;
  /** Short chip copy, e.g. "2 today" */
  label?: string;
};

export type SpokeStatus = "not_set_up" | "active";

export type SpokeState = {
  status: SpokeStatus;
  attention?: Attention;
  /** 0–1 share of today's items complete */
  progress?: number;
  tooltip: string[];
  /** Micro label under the node, e.g. "Start here" */
  microLabel?: string;
};

export type Spoke = {
  id: SpokeId;
  label: string;
  /** lucide icon name, resolved in lib/icons.ts */
  icon: string;
  depth: "deep" | "shallow";
  accent: string;
  tagline: string;
  states: Record<DemoMode, SpokeState>;
  /** State used when a spoke is set up during the session in New mode */
  freshlySetUp: SpokeState;
};

export type SourceId = "apple_health" | "garmin" | "whoop" | "oura" | "strava";

export type Source = {
  id: SourceId;
  name: string;
  kind: string;
  feeds: string;
};

export type ConnectionType = "data" | "signal" | "potential";

export type Connection = {
  id: string;
  from: SpokeId;
  to: SpokeId;
  type: ConnectionType;
  /** Shown on hover, e.g. "Oura → sleep & HRV" */
  label: string;
  /** Short reason chip for signal beams */
  reason?: string;
  /** Any of these sources being connected makes a data beam live */
  sources?: SourceId[];
  /** Label shown when a data beam falls back to potential */
  potentialLabel?: string;
  visibleIn: DemoMode[];
  /** Extra gate, e.g. only after signing up to an event */
  requires?: "event_signup";
};

export type Expert = {
  id: string;
  spoke: SpokeId;
  name: string;
  speciality: string;
  location: string;
  online: boolean;
  rating: number;
  reviews: number;
  priceSar: number;
  unit: string;
  tags: string[];
};

export type SportEvent = {
  id: string;
  name: string;
  sport: string;
  date: string;
  city: string;
  category: string;
  priceSar: number;
  cta: "Sign up" | "Get tickets";
  closes?: string;
  buildPlanWeeks?: number;
};

export type Venue = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  setting: "Indoor" | "Outdoor" | "Indoor & outdoor";
  kind: string;
};

export type TimelineItem = {
  id: string;
  when: string;
  title: string;
  detail?: string;
  status: "past" | "today" | "upcoming";
  tag?: string;
};

export type BodyView = "front" | "back";

export type Intensity = 0 | 1 | 2 | 3;
