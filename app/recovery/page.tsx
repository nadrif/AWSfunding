"use client";

import { RecoveryView } from "@/components/recovery/recovery-view";
import { useDemo } from "@/lib/demo-context";

export default function RecoveryPage() {
  const { mode } = useDemo();
  return <RecoveryView key={mode} />;
}
