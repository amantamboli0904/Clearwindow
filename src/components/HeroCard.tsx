import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { AQICategoryKey, NormalizedAirQuality } from '../types/airQuality';
import { formatHourLabel } from '../utils/aqi';

interface HeroCardProps {
  data: NormalizedAirQuality;
}

function CategoryIcon({
  categoryKey,
  className,
}: {
  categoryKey: AQICategoryKey;
  className: string;
}) {
  if (categoryKey === 'good') {
    return <CheckCircle2 className={className} aria-hidden="true" />;
  }
  if (categoryKey === 'moderate' || categoryKey === 'sensitive') {
    return <AlertTriangle className={className} aria-hidden="true" />;
  }
  return <ShieldAlert className={className} aria-hidden="true" />;
}

export function HeroCard({ data }: HeroCardProps) {
  const { location, current } = data;
  const { category } = current;
  const locationParts = [location.region, location.country].filter(Boolean);
  const updatedTime = formatHourLabel(current.time).full;

  return (
    <section
      aria-label="Current air quality summary"
      className="relative overflow-hidden rounded-3xl border-[1.5px] border-neutral-950 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 sm:p-8"
    >
      {/* Subtle geometric accent marks inspired by the reference hero */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 52 52"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-64 top-6 hidden opacity-90 lg:block"
      >
        <path
          d="M26 2L30.5 18.5L47 14L34.5 26L47 38L30.5 33.5L26 50L21.5 33.5L5 38L17.5 26L5 14L21.5 18.5L26 2Z"
          fill="#FDE800"
        />
      </svg>

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>{locationParts.length > 0 ? locationParts.join(', ') : 'Local forecast'}</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">Updated {updatedTime}</span>
          </div>

          <h1 className="font-display text-balance text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
            {location.name}
            <span className="text-[#FF1D8E] dark:text-[#FF5CB0]">.</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 sm:text-base">
            {category.verdict}
          </p>
        </div>

        <div
          className={`flex shrink-0 flex-row items-center justify-between gap-4 rounded-2xl border-[1.5px] border-neutral-950 px-5 py-4 dark:border-neutral-600 sm:min-w-[205px] sm:flex-col sm:items-end sm:justify-center sm:gap-2 ${category.surfaceClass}`}
        >
          <div className="flex items-baseline gap-2">
            <span
              data-testid="hero-aqi-value"
              className="font-display tabular-nums text-5xl font-extrabold leading-none tracking-tight text-neutral-950 dark:text-white sm:text-6xl"
            >
              {current.usAqi}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
              US AQI
            </span>
          </div>

          <div
            data-testid="hero-aqi-category"
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${category.textClass}`}
          >
            <CategoryIcon categoryKey={category.key} className="h-4 w-4 shrink-0" />
            <span>{category.label}</span>
          </div>
        </div>
      </div>

      {/* STAGE 2 EXTENSION POINT: Render multi-source station delta (OpenAQ / WAQI vs Open-Meteo) here */}
    </section>
  );
}
