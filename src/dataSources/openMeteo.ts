import type {
  CitySuggestion,
  HourlyPoint,
  LocationInfo,
  NormalizedAirQuality,
  PollutantId,
  PollutantReading,
} from '../types/airQuality';
import {
  computeBest2HourWindow,
  formatHourLabel,
  getAQICategory,
  POLLUTANT_META,
} from '../utils/aqi';
import type { AirQualityAdapter, AirQualityFetchOptions } from './types';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  timezone?: string;
  timezone_abbreviation?: string;
  current_units?: Partial<Record<PollutantId | 'us_aqi', string>>;
  current?: {
    time: string;
    us_aqi?: number | null;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
    sulphur_dioxide?: number | null;
    carbon_monoxide?: number | null;
  };
  hourly?: {
    time?: string[];
    us_aqi?: Array<number | null>;
    pm2_5?: Array<number | null>;
  };
}

export class DataSourceError extends Error {
  readonly code: 'NETWORK' | 'INVALID_RESPONSE' | 'NOT_FOUND';

  constructor(code: 'NETWORK' | 'INVALID_RESPONSE' | 'NOT_FOUND', message: string) {
    super(message);
    this.name = 'DataSourceError';
    this.code = code;
  }
}

/**
 * Searches cities by name via Open-Meteo Geocoding API (up to 5 results).
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(trimmed)}&count=5`;
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new DataSourceError(
      'NETWORK',
      'Unable to reach city search right now. Check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    throw new DataSourceError(
      'NETWORK',
      `City search returned an unexpected status (${response.status}).`
    );
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse;
  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.slice(0, 5).map((item) => ({
    id: item.id,
    name: item.name,
    admin1: item.admin1,
    country: item.country,
    countryCode: item.country_code,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

/**
 * Pure normalization function transforming raw Open-Meteo air quality JSON
 * into ClearWindow's normalized shape.
 */
export function normalizeOpenMeteoResponse(
  raw: OpenMeteoAirQualityResponse,
  locationMeta?: Partial<LocationInfo>
): NormalizedAirQuality {
  if (!raw.current || typeof raw.current.time !== 'string') {
    throw new DataSourceError(
      'INVALID_RESPONSE',
      'Air quality data was incomplete for this location.'
    );
  }

  const currentAqi = Math.max(0, Math.round(raw.current.us_aqi ?? 0));
  const category = getAQICategory(currentAqi);

  const pollutantOrder: PollutantId[] = [
    'pm2_5',
    'pm10',
    'ozone',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'carbon_monoxide',
  ];

  const pollutants: PollutantReading[] = pollutantOrder.map((id) => {
    const meta = POLLUTANT_META[id];
    const rawVal = raw.current?.[id];
    const value =
      typeof rawVal === 'number' && Number.isFinite(rawVal)
        ? Math.round(rawVal * 10) / 10
        : null;
    const unit = raw.current_units?.[id] ?? meta.defaultUnit;

    return {
      id,
      label: meta.label,
      formula: meta.formula,
      value,
      unit,
      description: meta.description,
    };
  });

  const times = raw.hourly?.time ?? [];
  const aqis = raw.hourly?.us_aqi ?? [];
  const pm25s = raw.hourly?.pm2_5 ?? [];

  // Match the current hour slot ("YYYY-MM-DDTHH") and slice the next 24 hours.
  const currentHourPrefix = raw.current.time.slice(0, 13);
  const startIdx = Math.max(
    0,
    times.findIndex((t) => t.slice(0, 13) >= currentHourPrefix)
  );

  const sliceEnd = Math.min(times.length, startIdx + 24);
  const draftHourly: HourlyPoint[] = [];

  for (let i = startIdx; i < sliceEnd; i++) {
    const t = times[i];
    const aqiVal = aqis[i];
    if (typeof t !== 'string' || typeof aqiVal !== 'number' || !Number.isFinite(aqiVal)) {
      continue;
    }
    const labels = formatHourLabel(t);
    const pmVal = pm25s[i];
    draftHourly.push({
      time: t,
      hourLabel: labels.short,
      fullTimeLabel: labels.full,
      aqi: Math.max(0, Math.round(aqiVal)),
      pm2_5: typeof pmVal === 'number' && Number.isFinite(pmVal) ? Math.round(pmVal * 10) / 10 : null,
      isCleanest: false,
    });
  }

  let cleanestHour: HourlyPoint | null = null;
  if (draftHourly.length > 0) {
    let minIdx = 0;
    for (let i = 1; i < draftHourly.length; i++) {
      if (draftHourly[i].aqi < draftHourly[minIdx].aqi) {
        minIdx = i;
      }
    }
    draftHourly[minIdx] = { ...draftHourly[minIdx], isCleanest: true };
    cleanestHour = draftHourly[minIdx];
  }

  const bestWindow = computeBest2HourWindow(draftHourly);

  const location: LocationInfo = {
    name: locationMeta?.name ?? 'Current Location',
    region: locationMeta?.region,
    country: locationMeta?.country,
    latitude: locationMeta?.latitude ?? raw.latitude,
    longitude: locationMeta?.longitude ?? raw.longitude,
    timezone: locationMeta?.timezone ?? raw.timezone,
  };

  return {
    source: 'open-meteo',
    sourceLabel: 'Open-Meteo / Copernicus CAMS',
    fetchedAt: new Date().toISOString(),
    location,
    current: {
      time: raw.current.time,
      usAqi: currentAqi,
      category,
    },
    pollutants,
    hourly24h: draftHourly,
    cleanestHour,
    bestWindow,
  };
}

/**
 * Fetches and normalizes current + 24-hour forecast air quality from Open-Meteo.
 */
export async function getAirQuality(
  lat: number,
  lon: number,
  options?: AirQualityFetchOptions
): Promise<NormalizedAirQuality> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide',
    hourly: 'us_aqi,pm2_5',
    forecast_days: '2',
    timezone: 'auto',
  });

  const url = `${AIR_QUALITY_ENDPOINT}?${params.toString()}`;
  let response: Response;
  try {
    response = await fetch(url, { signal: options?.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new DataSourceError(
      'NETWORK',
      'Could not connect to the air quality service. Check your connection and retry.'
    );
  }

  if (!response.ok) {
    throw new DataSourceError(
      'NETWORK',
      `Air quality service returned status ${response.status}. Please try again.`
    );
  }

  const json = (await response.json()) as OpenMeteoAirQualityResponse;
  return normalizeOpenMeteoResponse(json, options?.locationMeta);
}

export const openMeteoAdapter: AirQualityAdapter = {
  id: 'open-meteo',
  label: 'Open-Meteo / Copernicus CAMS',
  attribution: 'Open-Meteo / Copernicus CAMS (modeled data, may differ from ground stations)',
  getAirQuality,
};
