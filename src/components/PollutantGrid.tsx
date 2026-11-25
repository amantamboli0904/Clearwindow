import type { PollutantReading } from '../types/airQuality';
import { PollutantCard } from './PollutantCard';

interface PollutantGridProps {
  pollutants: PollutantReading[];
}

export function PollutantGrid({ pollutants }: PollutantGridProps) {
  return (
    <section aria-label="Pollutant breakdown" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
          Key pollutants
        </h2>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Tap or hover the info icon on any pollutant to learn what it measures
        </span>
      </div>

      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3">
        {pollutants.map((pollutant) => (
          <PollutantCard key={pollutant.id} pollutant={pollutant} />
        ))}
      </div>
    </section>
  );
}
