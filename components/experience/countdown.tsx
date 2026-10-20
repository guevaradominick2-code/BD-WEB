"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function remaining(target: string) {
  const difference = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    difference,
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown({ target, compact = false }: { target: string; compact?: boolean }) {
  const router = useRouter();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);
  const refreshed = useRef(false);

  useEffect(() => {
    function update() {
      const next = remaining(target);
      setTime(next);
      if (next.difference === 0 && !refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    }
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [router, target]);

  const units = useMemo(
    () => [
      [time?.days ?? "--", "días"],
      [time?.hours ?? "--", "hrs"],
      [time?.minutes ?? "--", "min"],
      [time?.seconds ?? "--", "seg"],
    ],
    [time],
  );

  if (time?.difference === 0) {
    return <span className="text-sm font-medium text-[var(--burgundy)]">It&apos;s time ✦</span>;
  }

  return (
    <div className={compact ? "flex gap-3" : "grid grid-cols-4 gap-2 md:gap-3"} aria-label="Cuenta regresiva">
      {units.map(([value, label]) => (
        <div key={label} className={compact ? "text-center" : "countdown-unit"}>
          <div className={compact ? "font-serif text-lg" : "font-serif text-2xl md:text-3xl"}>
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[.16em] text-[var(--muted)]">{label}</div>
        </div>
      ))}
    </div>
  );
}
