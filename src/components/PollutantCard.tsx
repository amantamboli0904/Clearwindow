import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import type { PollutantReading } from '../types/airQuality';

interface PollutantCardProps {
  pollutant: PollutantReading;
}

export function PollutantCard({ pollutant }: PollutantCardProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltipId = useId();
  const isOpen = isPinned || isHovered;

  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl border-[1.5px] border-neutral-950 bg-white p-4 transition-colors dark:border-neutral-700 dark:bg-neutral-900"
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular black emblem echoing the Watchlist coin icons in the reference */}
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold tracking-tight text-white dark:bg-neutral-100 dark:text-neutral-950"
          >
            {pollutant.formula}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-neutral-950 dark:text-white">
              {pollutant.formula}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {pollutant.label}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsPinned((prev) => !prev);
            setIsHovered(false);
          }}
          onMouseEnter={() => setIsHovered(true)}
          aria-expanded={isOpen}
          aria-controls={tooltipId}
          aria-label={`What is ${pollutant.formula}?`}
          className="inline-flex h-11 w-11 -mr-2 -mt-2 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-[#FDE800]/60 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-[#9D35FF] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono-tabular text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
          {pollutant.value !== null ? pollutant.value : '—'}
        </span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {pollutant.unit}
        </span>
      </div>

      {isOpen && (
        <div
          id={tooltipId}
          role="note"
          className="mt-3 rounded-xl border border-neutral-950/20 bg-[#FDE800]/25 p-3 text-xs leading-relaxed text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          {pollutant.description}
        </div>
      )}
    </div>
  );
}
