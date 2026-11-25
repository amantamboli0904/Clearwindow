/**
 * Core domain types for ClearWindow.
 *
 * STAGE 2 EXTENSION POINT:
 * When adding OpenAQ and WAQI adapters, each adapter will return this same
 * `NormalizedAirQuality` shape so Stage 2 comparison views can align
 * readings side-by-side without changing UI components.
 */

export type DataSourceId = 'open-meteo' | 'openaq' | 'waqi';

export type AQICategoryKey =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export interface AQICategoryInfo {
  key: AQICategoryKey;
  label: string;
  rangeLabel: string;
  verdict: string;
  /** Standard US AQI hex color used for chart accents and category indicators */
  hex: string;
  /** Accessible text class for light & dark modes */
  textClass: string;
  /** Subtle surface tint for the hero/category callout */
  surfaceClass: string;
  /** Border accent matching the AQI scale */
  borderClass: string;
  /** Solid dot/bar indicator background */
  dotClass: string;
}

export type PollutantId =
  | 'pm2_5'
  | 'pm10'
  | 'ozone'
  | 'nitrogen_dioxide'
  | 'sulphur_dioxide'
  | 'carbon_monoxide';

export interface PollutantReading {
  id: PollutantId;
  label: string;
  formula: string;
  value: number | null;
  unit: string;
  description: string;
}

export interface HourlyPoint {
  /** ISO timestamp returned by the data source */
  time: string;
  /** Human-readable hour label (e.g., "2 PM") */
  hourLabel: string;
  /** Full readable time window label (e.g., "2:00 PM") */
  fullTimeLabel: string;
  aqi: number;
  pm2_5: number | null;
  isCleanest: boolean;
}

export interface BestWindowResult {
  startTime: string;
  endTime: string;
  startLabel: string;
  endLabel: string;
  avgAqi: number;
  minAqi: number;
  sentence: string;
}

export interface LocationInfo {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface NormalizedAirQuality {
  /** Adapter identifier (e.g. 'open-meteo'; Stage 2 adds 'openaq' | 'waqi') */
  source: DataSourceId;
  sourceLabel: string;
  fetchedAt: string;
  location: LocationInfo;
  current: {
    time: string;
    usAqi: number;
    category: AQICategoryInfo;
  };
  pollutants: PollutantReading[];
  hourly24h: HourlyPoint[];
  cleanestHour: HourlyPoint | null;
  bestWindow: BestWindowResult | null;
}

export interface CitySuggestion {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export type ActivityType = 'run' | 'walk_kids' | 'bike_commute' | 'stay_home';

export interface ActivityAdvice {
  activity: ActivityType;
  label: string;
  status: string;
  headline: string;
  detail: string;
}
