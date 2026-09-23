import { Hourglass } from "lucide-react";

export function ComingSoon({ what, note }: { what: string; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Hourglass className="size-5" />
      </span>
      <p className="mt-3 font-semibold">{what} — coming soon</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {note ?? "This spoke is shallow in the demo. The same tab lives in every spoke so the pattern is familiar."}
      </p>
    </div>
  );
}
