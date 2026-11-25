import { Clock } from 'lucide-react';
import type { BestWindowResult, HourlyPoint } from '../types/airQuality';
import { getAQICategory } from '../utils/aqi';

interface BestWindowCardProps {
  bestWindow: BestWindowResult | null;
  hourly?: HourlyPoint[];
}

export function BestWindowCard({ bestWindow, hourly = [] }: BestWindowCardProps) {
  if (!bestWindow) {
    return null;
  }

  const windowCategory = getAQICategory(bestWindow.avgAqi);

  return (
    <section
      aria-label="Best outdoor window"
      data-testid="best-window-card"
      className="flex flex-col justify-between gap-5 rounded-3xl border-[1.5px] border-neutral-950 bg-[#1CE0FF] p-6 text-neutral-950 dark:border-cyan-400/50 dark:bg-cyan-950/75 dark:text-cyan-50"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-cyan-200">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>Best 2-hour window</span>
          </div>
          <span className="text-xs font-bold text-neutral-950 dark:text-cyan-100">
            Avg AQI {bestWindow.avgAqi} · {windowCategory.label}
          </span>
        </div>

        <p className="font-display text-xl font-bold leading-snug text-neutral-950 dark:text-white">
          {bestWindow.sentence}
        </p>

        {hourly.length > 1 && (
          <div className="space-y-1.5 pt-1" aria-hidden="true">
            <div className="flex items-center gap-0.5">
              {hourly.slice(0, 24).map((pt) => {
                const inWindow =
                  pt.time === bestWindow.startTime || pt.time === bestWindow.endTime;
                return (
                  <div
                    key={pt.time}
                    className={`h-2.5 flex-1 rounded-xs transition-colors ${
                      inWindow
                        ? 'bg-neutral-950 dark:bg-[#FDE800]'
                        : 'bg-neutral-950/20 dark:bg-cyan-200/20'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] font-medium text-neutral-800 dark:text-cyan-200/80">
              <span>Now ({hourly[0]?.hourLabel})</span>
              <span>Cleanest 2h stretch</span>
              <span>+24h</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-neutral-950/15 pt-3 text-xs text-neutral-900 dark:border-cyan-200/20 dark:text-cyan-100">
        <span className="tabular-nums font-bold">
          {bestWindow.startLabel} – {bestWindow.endLabel}
        </span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums font-medium">Lowest hour AQI {bestWindow.minAqi}</span>
      </div>
    </section>
  );
}
