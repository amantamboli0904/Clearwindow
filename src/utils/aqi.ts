import type {
  ActivityAdvice,
  ActivityType,
  AQICategoryInfo,
  BestWindowResult,
  HourlyPoint,
  PollutantId,
} from '../types/airQuality';

export const POLLUTANT_META: Record<
  PollutantId,
  { label: string; formula: string; defaultUnit: string; description: string }
> = {
  pm2_5: {
    label: 'Fine Particles',
    formula: 'PM2.5',
    defaultUnit: 'μg/m³',
    description:
      'Tiny inhalable particles smaller than 2.5 micrometers from smoke, exhaust, and haze that can reach deep into your lungs.',
  },
  pm10: {
    label: 'Coarse Particles',
    formula: 'PM10',
    defaultUnit: 'μg/m³',
    description:
      'Larger airborne particles like dust, pollen, and road grit that mainly irritate your nose, throat, and upper airways.',
  },
  ozone: {
    label: 'Ground Ozone',
    formula: 'O3',
    defaultUnit: 'μg/m³',
    description:
      'A reactive gas formed when sunlight hits vehicle and industrial emissions. Peaks on warm afternoons and can tighten airways.',
  },
  nitrogen_dioxide: {
    label: 'Nitrogen Dioxide',
    formula: 'NO2',
    defaultUnit: 'μg/m³',
    description:
      'Traffic-related gas mostly from cars, trucks, and gas combustion. Higher near busy roads and during rush hour.',
  },
  sulphur_dioxide: {
    label: 'Sulfur Dioxide',
    formula: 'SO2',
    defaultUnit: 'μg/m³',
    description:
      'A sharp-smelling gas produced by burning fossil fuels in power plants, shipping, and heavy industry.',
  },
  carbon_monoxide: {
    label: 'Carbon Monoxide',
    formula: 'CO',
    defaultUnit: 'μg/m³',
    description:
      'A colorless, odorless gas from incomplete combustion in engines and heaters that reduces oxygen delivery in the blood.',
  },
};

export function getAQICategory(rawAqi: number): AQICategoryInfo {
  const aqi = Math.max(0, Math.round(rawAqi));

  if (aqi <= 50) {
    return {
      key: 'good',
      label: 'Good',
      rangeLabel: '0–50',
      verdict: 'Clean, fresh air — great conditions for any outdoor plans.',
      hex: '#16A34A',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      surfaceClass: 'bg-emerald-50/80 dark:bg-emerald-950/35',
      borderClass: 'border-emerald-200/80 dark:border-emerald-800/60',
      dotClass: 'bg-emerald-600 dark:bg-emerald-400',
    };
  }

  if (aqi <= 100) {
    return {
      key: 'moderate',
      label: 'Moderate',
      rangeLabel: '51–100',
      verdict: 'Acceptable air for most people; unusually sensitive groups should pace exertion.',
      hex: '#CA8A04',
      textClass: 'text-amber-700 dark:text-amber-400',
      surfaceClass: 'bg-amber-50/80 dark:bg-amber-950/30',
      borderClass: 'border-amber-200/80 dark:border-amber-800/60',
      dotClass: 'bg-amber-500 dark:bg-amber-400',
    };
  }

  if (aqi <= 150) {
    return {
      key: 'sensitive',
      label: 'Unhealthy for Sensitive Groups',
      rangeLabel: '101–150',
      verdict: 'Kids, older adults, and people with asthma should cut back heavy outdoor exertion.',
      hex: '#EA580C',
      textClass: 'text-orange-700 dark:text-orange-400',
      surfaceClass: 'bg-orange-50/80 dark:bg-orange-950/35',
      borderClass: 'border-orange-200/80 dark:border-orange-800/60',
      dotClass: 'bg-orange-600 dark:bg-orange-400',
    };
  }

  if (aqi <= 200) {
    return {
      key: 'unhealthy',
      label: 'Unhealthy',
      rangeLabel: '151–200',
      verdict: 'Air quality is degraded — shorten outdoor workouts and prefer indoor breaks.',
      hex: '#DC2626',
      textClass: 'text-red-700 dark:text-red-400',
      surfaceClass: 'bg-red-50/80 dark:bg-red-950/35',
      borderClass: 'border-red-200/80 dark:border-red-800/60',
      dotClass: 'bg-red-600 dark:bg-red-400',
    };
  }

  if (aqi <= 300) {
    return {
      key: 'very_unhealthy',
      label: 'Very Unhealthy',
      rangeLabel: '201–300',
      verdict: 'Health alert: everyone should avoid prolonged or heavy outdoor activity.',
      hex: '#9333EA',
      textClass: 'text-purple-700 dark:text-purple-400',
      surfaceClass: 'bg-purple-50/80 dark:bg-purple-950/35',
      borderClass: 'border-purple-200/80 dark:border-purple-800/60',
      dotClass: 'bg-purple-600 dark:bg-purple-400',
    };
  }

  return {
    key: 'hazardous',
    label: 'Hazardous',
    rangeLabel: '301+',
    verdict: 'Emergency air conditions — stay indoors with windows closed and air filtered.',
    hex: '#9F1239',
    textClass: 'text-rose-800 dark:text-rose-300',
    surfaceClass: 'bg-rose-50/80 dark:bg-rose-950/40',
    borderClass: 'border-rose-200/80 dark:border-rose-800/60',
    dotClass: 'bg-rose-700 dark:bg-rose-400',
  };
}

/**
 * Formats an ISO-like local timestamp ("2026-11-25T14:00") deterministically
 * without shifting by the viewer's browser timezone.
 */
export function formatHourLabel(isoTime: string, offsetHours = 0): { short: string; full: string } {
  const hourPart = Number.parseInt(isoTime.slice(11, 13), 10);
  if (Number.isNaN(hourPart)) {
    return { short: isoTime, full: isoTime };
  }

  const h = ((hourPart + offsetHours) % 24 + 24) % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return {
    short: `${hour12} ${period}`,
    full: `${hour12}:00 ${period}`,
  };
}

/**
 * Finds the cleanest contiguous 2-hour window across the next 24 hours.
 */
export function computeBest2HourWindow(hourly: HourlyPoint[]): BestWindowResult | null {
  if (hourly.length === 0) {
    return null;
  }

  if (hourly.length === 1) {
    const only = hourly[0];
    const end = formatHourLabel(only.time, 1);
    return {
      startTime: only.time,
      endTime: only.time,
      startLabel: only.fullTimeLabel,
      endLabel: end.full,
      avgAqi: only.aqi,
      minAqi: only.aqi,
      sentence: `Your cleanest window right now is ${only.fullTimeLabel} to ${end.full}, averaging AQI ${only.aqi}.`,
    };
  }

  let bestIdx = 0;
  let bestAvg = Number.POSITIVE_INFINITY;
  let bestMin = Number.POSITIVE_INFINITY;

  for (let i = 0; i < hourly.length - 1; i++) {
    const avg = (hourly[i].aqi + hourly[i + 1].aqi) / 2;
    const min = Math.min(hourly[i].aqi, hourly[i + 1].aqi);
    if (avg < bestAvg || (avg === bestAvg && min < bestMin)) {
      bestAvg = avg;
      bestMin = min;
      bestIdx = i;
    }
  }

  const startPoint = hourly[bestIdx];
  const secondPoint = hourly[bestIdx + 1];
  const endTimeLabel = formatHourLabel(secondPoint.time, 1).full;
  const roundedAvg = Math.round(bestAvg);

  let sentence: string;
  if (roundedAvg <= 50) {
    sentence = `Your cleanest 2-hour window is ${startPoint.fullTimeLabel} to ${endTimeLabel}, averaging a crisp AQI of ${roundedAvg}.`;
  } else if (roundedAvg <= 100) {
    sentence = `Aim for ${startPoint.fullTimeLabel} to ${endTimeLabel} for your clearest 2-hour window (average AQI ${roundedAvg}).`;
  } else {
    sentence = `Air stays elevated over the next 24 hours; the least polluted 2-hour window is ${startPoint.fullTimeLabel} to ${endTimeLabel} (average AQI ${roundedAvg}).`;
  }

  return {
    startTime: startPoint.time,
    endTime: secondPoint.time,
    startLabel: startPoint.fullTimeLabel,
    endLabel: endTimeLabel,
    avgAqi: roundedAvg,
    minAqi: Math.round(bestMin),
    sentence,
  };
}

export const ACTIVITY_OPTIONS: Array<{ id: ActivityType; label: string }> = [
  { id: 'run', label: 'Run' },
  { id: 'walk_kids', label: 'Walk with kids' },
  { id: 'bike_commute', label: 'Commute by bike' },
  { id: 'stay_home', label: 'Stay home' },
];

export function getActivityAdvice(activity: ActivityType, rawAqi: number): ActivityAdvice {
  const aqi = Math.max(0, Math.round(rawAqi));

  switch (activity) {
    case 'run':
      if (aqi <= 50) {
        return {
          activity,
          label: 'Run',
          status: 'Go for it',
          headline: 'Ideal air for tempo runs or long mileage.',
          detail: `At AQI ${aqi}, oxygen uptake is uncompromised and lung irritation risk is minimal.`,
        };
      }
      if (aqi <= 100) {
        return {
          activity,
          label: 'Run',
          status: 'Keep it steady',
          headline: 'Fine for easy to moderate runs; skip all-out intervals if sensitive.',
          detail: `At AQI ${aqi}, deep rapid breathing draws in slightly more particles. Stick to parks away from traffic.`,
        };
      }
      if (aqi <= 150) {
        return {
          activity,
          label: 'Run',
          status: 'Dial back',
          headline: 'Swap hard intervals for a short jog or move to a treadmill.',
          detail: `At AQI ${aqi}, sustained running increases particle intake sharply. Wait for your cleanest 2-hour window.`,
        };
      }
      return {
        activity,
        label: 'Run',
        status: 'Move indoors',
        headline: 'Skip outdoor running today and train inside.',
        detail: `At AQI ${aqi}, heavy aerobic breathing exposes your airways to unhealthy pollutant levels.`,
      };

    case 'walk_kids':
      if (aqi <= 50) {
        return {
          activity,
          label: 'Walk with kids',
          status: 'Great time',
          headline: 'Playground and stroller walks are completely clear.',
          detail: `At AQI ${aqi}, outdoor air is clean and safe for young lungs with no time limits.`,
        };
      }
      if (aqi <= 100) {
        return {
          activity,
          label: 'Walk with kids',
          status: 'Generally safe',
          headline: 'Good for a relaxed walk; watch kids with asthma for coughing.',
          detail: `At AQI ${aqi}, light outdoor play is fine. Choose tree-lined paths away from idling cars.`,
        };
      }
      if (aqi <= 150) {
        return {
          activity,
          label: 'Walk with kids',
          status: 'Keep it brief',
          headline: 'Limit outdoor playtime and stick to short, low-effort strolls.',
          detail: `Children breathe faster per body weight. At AQI ${aqi}, reschedule park trips to the cleanest window.`,
        };
      }
      return {
        activity,
        label: 'Walk with kids',
        status: 'Stay indoors',
        headline: 'Plan indoor play instead of an outdoor walk today.',
        detail: `At AQI ${aqi}, air quality poses elevated risk to developing lungs.`,
      };

    case 'bike_commute':
      if (aqi <= 50) {
        return {
          activity,
          label: 'Commute by bike',
          status: 'Clear ride',
          headline: 'Smooth riding conditions on every route.',
          detail: `At AQI ${aqi}, cycling is healthy and refreshing — enjoy the open air.`,
        };
      }
      if (aqi <= 100) {
        return {
          activity,
          label: 'Commute by bike',
          status: 'Pick side streets',
          headline: 'Good to ride, ideally on greenways or quiet residential streets.',
          detail: `At AQI ${aqi}, avoiding multi-lane traffic cuts direct tailpipe NO2 and PM2.5 exposure.`,
        };
      }
      if (aqi <= 150) {
        return {
          activity,
          label: 'Commute by bike',
          status: 'Ease the pace',
          headline: 'Ride at a relaxed pace or consider transit if you have asthma.',
          detail: `At AQI ${aqi}, climbing hills hard increases inhaled particulates; an e-bike assist or mask helps.`,
        };
      }
      return {
        activity,
        label: 'Commute by bike',
        status: 'Take transit',
        headline: 'Switch to enclosed transit or carpool today.',
        detail: `At AQI ${aqi}, active commuting puts you directly in unhealthy ambient air.`,
      };

    case 'stay_home':
      if (aqi <= 50) {
        return {
          activity,
          label: 'Stay home',
          status: 'Open windows',
          headline: 'Great time to air out your home naturally.',
          detail: `At AQI ${aqi}, cross-ventilation brings in fresh outdoor air without needing filters.`,
        };
      }
      if (aqi <= 100) {
        return {
          activity,
          label: 'Stay home',
          status: 'Normal ventilation',
          headline: 'Indoor air stays comfortable; open windows during the cleanest window.',
          detail: `At AQI ${aqi}, brief airing out is fine for most households.`,
        };
      }
      if (aqi <= 150) {
        return {
          activity,
          label: 'Stay home',
          status: 'Keep closed',
          headline: 'Keep street-facing windows shut and run recirculation.',
          detail: `At AQI ${aqi}, closing windows during peak hours limits indoor fine-particle buildup.`,
        };
      }
      return {
        activity,
        label: 'Stay home',
        status: 'Filter indoor air',
        headline: 'Seal windows and run a HEPA purifier if you have one.',
        detail: `At AQI ${aqi}, staying inside with filtered recirculated air offers the best protection.`,
      };
  }
}
