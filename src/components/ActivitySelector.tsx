import { Bike, Footprints, Home, PersonStanding } from 'lucide-react';
import type { ActivityType } from '../types/airQuality';
import { ACTIVITY_OPTIONS, getActivityAdvice } from '../utils/aqi';

interface ActivitySelectorProps {
  selectedActivity: ActivityType;
  onSelectActivity: (activity: ActivityType) => void;
  currentAqi: number;
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Footprints> = {
  run: Footprints,
  walk_kids: PersonStanding,
  bike_commute: Bike,
  stay_home: Home,
};

export function ActivitySelector({
  selectedActivity,
  onSelectActivity,
  currentAqi,
}: ActivitySelectorProps) {
  const advice = getActivityAdvice(selectedActivity, currentAqi);

  return (
    <section
      aria-label="Activity advice"
      data-testid="activity-advice-section"
      className="flex flex-col justify-between gap-4 rounded-3xl border-[1.5px] border-neutral-950 bg-[#141417] p-6 text-white dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-neutral-200">
            Activity guidance
          </h2>
          <span
            data-testid="activity-status"
            className="text-xs font-bold text-[#FDE800]"
          >
            {advice.status}
          </span>
        </div>

        <div
          role="group"
          aria-label="Choose your planned activity"
          className="grid grid-cols-2 gap-1.5 rounded-2xl bg-white/10 p-1.5"
        >
          {ACTIVITY_OPTIONS.map((option) => {
            const Icon = ACTIVITY_ICONS[option.id];
            const isSelected = option.id === selectedActivity;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectActivity(option.id)}
                className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#FDE800] whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#FDE800] text-neutral-950'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 border-t border-white/15 pt-3">
        <p
          data-testid="activity-headline"
          className="font-display text-base font-bold text-white"
        >
          {advice.headline}
        </p>
        <p
          data-testid="activity-detail"
          className="text-xs leading-relaxed text-neutral-300"
        >
          {advice.detail}
        </p>
      </div>
    </section>
  );
}
