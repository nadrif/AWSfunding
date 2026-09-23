"use client";

import { SportsView } from "@/components/sports/sports-view";
import { useDemo } from "@/lib/demo-context";

export default function SportsPage() {
  const { mode } = useDemo();
  return <SportsView key={mode} />;
}
