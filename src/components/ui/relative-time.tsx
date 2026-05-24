"use client";

import * as React from "react";
import { formatRelativeTime } from "@/lib/utils";

/**
 * Renders a relative time string (e.g. "44s ago") inside a <time> element and
 * suppresses hydration warnings, because the SSR and client renders can land
 * on different second/minute buckets. Optionally re-renders on the client at
 * a 30s interval so the value stays fresh without a full refetch.
 */
export function RelativeTime({
  date,
  refreshMs = 30_000,
  className,
}: {
  date: string | number | Date;
  refreshMs?: number;
  className?: string;
}) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    if (refreshMs <= 0) return;
    const id = setInterval(() => setTick((n) => n + 1), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  const iso = new Date(date).toISOString();

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatRelativeTime(date)}
    </time>
  );
}
